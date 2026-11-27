import "server-only";

/*
 * Gemini 호출 공통 — 모델·재시도·JSON 응답을 한곳에서.
 * 무료 등급은 몰릴 때 503(요청 많음)·429(한도)가 자주 난다 → 5·15·45초 기다렸다 다시.
 * 그래도 실패하면 GeminiBusyError: 온보딩은 "잠시 후 다시", 새벽 배치는 다음 날 다시 처리한다.
 */

export const GEMINI_MODEL = "gemini-3.5-flash-lite"; // 문서의 2.5는 새 사용자에게 막혀 있다 (CLAUDE.md)
const API = "https://generativelanguage.googleapis.com/v1beta/models";

export class GeminiBusyError extends Error {
  constructor(status: number) {
    super(`Gemini가 붐벼요 (${status}). 잠시 후 다시 시도해 주세요`);
  }
}

type Schema = Record<string, unknown>;

export async function generateJson<T>(opts: {
  system: string;
  input: string;
  schema: Schema;
  temperature?: number;
  waits?: number[]; // 재시도 전 기다릴 초. 실시간(온보딩)은 짧게
}): Promise<{ data: T; tokens: { input: number; output: number } }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY가 없어요 (.env.local)");

  const waits = opts.waits ?? [5, 15, 45];
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${API}/${GEMINI_MODEL}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: opts.system }] },
        contents: [{ role: "user", parts: [{ text: opts.input }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: opts.schema, temperature: opts.temperature ?? 0.4 },
      }),
    });
    if ((res.status === 503 || res.status === 429) && attempt < waits.length) {
      await new Promise((r) => setTimeout(r, waits[attempt] * 1000));
      continue;
    }
    if (res.status === 503 || res.status === 429) throw new GeminiBusyError(res.status);
    const body = await res.json();
    if (!res.ok) throw new Error(`Gemini 실패 ${res.status}: ${body.error?.message ?? ""}`);

    const text = (body.candidates?.[0]?.content?.parts ?? []).filter((p: { text?: string }) => p.text).map((p: { text: string }) => p.text).join("");
    return {
      data: JSON.parse(text) as T,
      tokens: { input: body.usageMetadata?.promptTokenCount ?? 0, output: body.usageMetadata?.candidatesTokenCount ?? 0 },
    };
  }
}

/** 스키마 줄임말 */
export const S = (description = "") => ({ type: "STRING", description });
export const ARR = (items: Schema) => ({ type: "ARRAY", items });
export const OBJ = (properties: Record<string, Schema>, required = Object.keys(properties)) => ({ type: "OBJECT", properties, required });
