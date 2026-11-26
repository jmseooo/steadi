import "server-only";

import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewRawRecord } from "@/lib/model";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

/*
 * 원본 기록 저장 — 카톡·AI 대화·사진 설명·노션·캘린더 등 모든 수집은 이 함수 하나로 raw_records에 넣는다.
 * 로그인한 사용자 권한으로 넣어서 RLS가 "자기 기록만" 지킨다. 서버(서버 액션·route.ts)에서만 부른다.
 *
 *   const result = await saveRawRecords(parseKakao(text, "밴드 동아리"));
 *   // → { saved: 120, skipped: 3, updated: 0 }
 */

const CHUNK = 500; // 한 번에 보내는 줄 수 (요청 크기 제한)
const MAX_TEXT = 20_000; // 한 기록 글자 수 상한 (DB 500MB 한도 보호). 넘으면 자른다

export type SaveResult = {
  /** 새로 저장한 기록 수 */
  saved: number;
  /** 이미 있어서 건너뛴 기록 수 (같은 카톡 파일을 다시 올린 경우 등) */
  skipped: number;
  /** externalId가 같아서 내용을 덮어쓴 기록 수 (노션 페이지가 고쳐진 경우 등) */
  updated: number;
};

/** 같은 기록인지 가리는 값. externalId가 있으면 그것으로, 없으면 내용으로 만든다 */
export function recordHash(r: NewRawRecord): string {
  const key = r.externalId
    ? ["id", r.source, r.externalId]
    : ["text", r.source, r.sourceTitle, r.author ?? "", new Date(r.at).toISOString(), r.text, ...(r.seq ? [String(r.seq)] : [])];
  return createHash("sha256").update(key.join("\u0000")).digest("hex");
}

function toRow(userId: string, r: NewRawRecord) {
  const text = r.text.trim();
  return {
    user_id: userId,
    source: r.source,
    source_title: r.sourceTitle.trim(),
    url: r.url ?? null,
    author: r.author ?? null,
    text: text.length > MAX_TEXT ? text.slice(0, MAX_TEXT) : text,
    at: new Date(r.at).toISOString(),
    hash: recordHash(r),
  };
}

function check(r: NewRawRecord, i: number) {
  if (!r.text?.trim()) return `${i}번째 기록: text가 비었어요`;
  if (!r.sourceTitle?.trim()) return `${i}번째 기록: sourceTitle(대화방·페이지 이름)이 비었어요`;
  if (Number.isNaN(new Date(r.at).getTime())) return `${i}번째 기록: at이 날짜가 아니에요 (${r.at})`;
  return null;
}

/**
 * 원본 기록을 저장한다. 로그인 안 했으면 오류.
 * - 빈 글·이름 없는 기록·잘못된 날짜가 하나라도 있으면 아무것도 저장하지 않고 오류 (파서 버그를 일찍 찾게)
 * - 같은 파일 안의 똑같은 기록은 하나로 합친다
 * - 덮어쓴 기록은 analyzed_at을 비워 새벽 배치가 다시 읽게 한다
 */
export async function saveRawRecords(records: NewRawRecord[], client?: SupabaseClient): Promise<SaveResult> {
  const result: SaveResult = { saved: 0, skipped: 0, updated: 0 };
  if (!records.length) return result;

  const problems = records.map((r, i) => check(r, i + 1)).filter(Boolean);
  if (problems.length) throw new Error(`저장하지 않았어요 — ${problems.slice(0, 3).join(" / ")}${problems.length > 3 ? ` 외 ${problems.length - 3}개` : ""}`);

  const supabase = client ?? (await createClient());
  const userId = client ? (await supabase.auth.getUser()).data.user?.id : (await getCurrentUser())?.id;
  if (!userId) throw new Error("로그인한 사용자만 기록을 저장할 수 있어요");

  // 같은 요청 안의 중복 제거 (뒤에 온 것이 이김)
  const byHash = new Map<string, { row: ReturnType<typeof toRow>; replace: boolean }>();
  for (const r of records) {
    const row = toRow(userId, r);
    byHash.set(row.hash, { row, replace: Boolean(r.externalId) });
  }
  result.skipped += records.length - byHash.size;

  const all = [...byHash.values()];
  // 1) 내용으로 가리는 기록(카톡·AI 대화): 있으면 건너뛴다
  const keep = all.filter((x) => !x.replace).map((x) => x.row);
  for (let i = 0; i < keep.length; i += CHUNK) {
    const chunk = keep.slice(i, i + CHUNK);
    const { data, error } = await supabase
      .from("raw_records")
      .upsert(chunk, { onConflict: "user_id,hash", ignoreDuplicates: true })
      .select("id");
    if (error) throw new Error(`기록 저장 실패: ${error.message}`);
    result.saved += data.length;
    result.skipped += chunk.length - data.length;
  }

  // 2) 서비스 id로 가리는 기록(노션·캘린더): 있으면 내용을 덮어쓰고 다시 분석하게
  const replace = all.filter((x) => x.replace).map((x) => x.row);
  for (let i = 0; i < replace.length; i += CHUNK) {
    const chunk = replace.slice(i, i + CHUNK);
    const { data: existing, error: findError } = await supabase
      .from("raw_records")
      .select("hash, text, at, url, source_title")
      .in("hash", chunk.map((r) => r.hash));
    if (findError) throw new Error(`기록 저장 실패: ${findError.message}`);
    const old = new Map((existing ?? []).map((e) => [e.hash as string, e]));

    const changed = chunk.filter((r) => {
      const e = old.get(r.hash);
      return !e || e.text !== r.text || new Date(e.at).getTime() !== new Date(r.at).getTime() || e.url !== r.url || e.source_title !== r.source_title;
    });
    result.skipped += chunk.length - changed.length;
    if (!changed.length) continue;

    const { error } = await supabase
      .from("raw_records")
      .upsert(changed.map((r) => ({ ...r, analyzed_at: null })), { onConflict: "user_id,hash" });
    if (error) throw new Error(`기록 저장 실패: ${error.message}`);
    for (const r of changed) {
      if (old.has(r.hash)) result.updated += 1;
      else result.saved += 1;
    }
  }

  return result;
}
