// AI 1차 실험: 카톡 대화 파일 → 새벽 배치 "프로젝트 정리"(src/lib/model.ts AiProjectDigest)
// 실행: node scripts/ai/digest.mjs [대화 파일] [--me 이름] [--project 프로젝트 이름] [--goal 목표] [--model 모델]
//   예) node scripts/ai/digest.mjs scripts/ai/samples/marketing.txt --me 민서 --project "마케팅 공모전" --goal "공모전 기획안 제출하기"
//   기본: samples/kakao-band.txt · 민서 · 밴드 동아리 · gemini-3.5-flash-lite
// 결과 JSON은 scripts/ai/out/에 저장하고, 화면 규칙(줄 수·줄 길이·근거 기록)을 검사해 보여 준다.
import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

process.loadEnvFile(new URL("../../.env.local", import.meta.url));
const KEY = process.env.GEMINI_API_KEY;
const { values: opt, positionals } = parseArgs({
  allowPositionals: true,
  options: { me: { type: "string" }, project: { type: "string" }, goal: { type: "string" }, model: { type: "string" } },
});
const file = positionals[0] ?? new URL("./samples/kakao-band.txt", import.meta.url).pathname;
const MODEL = opt.model ?? positionals[1] ?? "gemini-3.5-flash-lite";
const ME = opt.me ?? "민서"; // 대화방에서 "나" — 실제로는 업로드할 때 사용자가 고른다
const PROJECT = {
  name: opt.project ?? "밴드 동아리",
  goal: opt.goal ?? "곡의 분위기에 맞는 무대를 준비하고, 정한 순서대로 공연을 마치기",
};

// ─── 카톡 PC 내보내기(.txt) 파서: "[이름] [오후 8:02] 내용" ───
function parseKakao(text) {
  const records = [];
  let date = null;
  for (const line of text.split("\n")) {
    const d = line.match(/-+ (\d{4})년 (\d{1,2})월 (\d{1,2})일/);
    if (d) {
      date = [d[1], d[2].padStart(2, "0"), d[3].padStart(2, "0")].join("-");
      continue;
    }
    const m = line.match(/^\[(.+?)\] \[(오전|오후) (\d{1,2}):(\d{2})\] (.+)$/);
    if (!m || !date) continue;
    let h = Number(m[3]) % 12;
    if (m[2] === "오후") h += 12;
    records.push({ id: `r${records.length + 1}`, author: m[1], at: `${date}T${String(h).padStart(2, "0")}:${m[4]}:00+09:00`, text: m[5] });
  }
  return records;
}

// ─── 프롬프트 ───
const SYSTEM = `너는 대학생의 프로젝트 기록을 읽고 경험을 정리해 주는 서비스 "스테디"다.
입력은 한 프로젝트의 원본 기록(카카오톡 대화)이다. 기록마다 id가 있다. 사용자는 "${ME}"이다.

규칙
- 기록에 없는 내용은 절대 지어내지 않는다. 모든 결과에 근거가 된 기록 id를 넣는다.
- 말투는 "~했어요", "~해요" 해요체. 사용자를 "나", "사용자", 이름으로 부르지 않고 주어를 생략한다.

experiences (경험 카드): ${ME}가 직접 한 판단·행동 하나를 카드 하나로. 다른 사람이 한 행동은 카드로 만들지 않는다.
- text: 상황 → 행동 → 결과 흐름의 한 문장을 3~4줄로 나눈다. 줄은 "\\n"으로 나누고, 한 줄은 띄어쓰기 포함 11~16자. 의미 단위로 끊는다.
  예) "팀원마다 가능한 시간을 모아\\n함께 참여할 수 있는 날을 찾고\\n정기 합주 일정을 정했어요"
  예) "팀원의 불참으로 계획을 바꿔\\n참여 가능한 인원을 기준으로\\n연습할 곡과 순서를\\n다시 정했어요"
- summary: 이 경험이 어떤 상황이었는지 한 문장.
- steps: 상황·판단·행동 각각 한 문장(짧게).
- 3~6장. 비슷한 행동은 한 장으로 합친다.

feedbacks: 다른 사람이 ${ME}나 팀의 결과물·방식에 준 의견이나 요청만.
- type: 띄어쓰기를 지킨 6자 안팎 명사구 ("자리이동 요청", "음량 조절 요청"). line: 목록에 보일 한 문장 요약(해요체).
- title: 한 줄 제목. meta: "카카오톡 ‘대화방 이름’". original: 원문을 그대로 따옴표 없이.
- summary: [현재 어려움, 요청한 변화, 확인이 필요한 부분] 세 칸. 각 text도 해요체 문장 ("~어려워해요", "~요청이에요", "~확인이 필요해요").
- suggestion: 피드백을 반영할 다음 행동 제안. title은 "~해 볼까요?", action은 "~ 만들기" 형태의 버튼 글자, columns는 [테스트해 볼 내용, 확인 기준].

changes: 일정·장소·분량처럼 프로젝트 조건이 바뀐 것. kind는 "합주 일정 변경" 같은 이름, title·desc는 각각 두 줄("\\n"), action은 버튼 글자.

steps (타임라인): 이 프로젝트의 단계 5~6개. label은 2~4자씩 두 줄("곡\\n선정"), 지금 단계 하나만 current이고 current에 지금 하는 일을 두 줄로.
insight: 지금까지 기록에서 가장 많이 쌓인 흐름. title 두 줄, desc 두 줄.`;

const S = (description) => ({ type: "STRING", description });
const SCHEMA = {
  type: "OBJECT",
  properties: {
    experiences: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          text: S("카드 문장, 3~4줄"),
          summary: S("한 문장"),
          steps: {
            type: "ARRAY",
            items: { type: "OBJECT", properties: { label: { type: "STRING", enum: ["상황", "판단", "행동"] }, text: S("") }, required: ["label", "text"] },
          },
          recordIds: { type: "ARRAY", items: S("근거 기록 id") },
        },
        required: ["text", "summary", "steps", "recordIds"],
      },
    },
    feedbacks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          type: S(""),
          line: S(""),
          title: S(""),
          meta: S(""),
          original: S(""),
          summary: { type: "ARRAY", items: { type: "OBJECT", properties: { label: S(""), text: S("") }, required: ["label", "text"] } },
          suggestion: {
            type: "OBJECT",
            properties: {
              title: S(""),
              desc: S(""),
              action: S(""),
              columns: { type: "ARRAY", items: { type: "OBJECT", properties: { label: S(""), text: S("") }, required: ["label", "text"] } },
            },
            required: ["title", "desc", "action", "columns"],
          },
          recordIds: { type: "ARRAY", items: S("") },
        },
        required: ["type", "line", "title", "meta", "original", "summary", "suggestion", "recordIds"],
      },
    },
    changes: {
      type: "ARRAY",
      items: { type: "OBJECT", properties: { kind: S(""), title: S(""), desc: S(""), action: S("") }, required: ["kind", "title", "desc", "action"] },
    },
    steps: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { label: S(""), state: { type: "STRING", enum: ["done", "current", "todo"] }, current: S("") },
        required: ["label", "state"],
      },
    },
    insight: { type: "OBJECT", properties: { title: S(""), desc: S("") }, required: ["title", "desc"] },
  },
  required: ["experiences", "feedbacks", "changes", "steps", "insight"],
};

// ─── 실행 ───
const records = parseKakao(fs.readFileSync(file, "utf8"));
const input = `프로젝트: ${PROJECT.name}\n목표: ${PROJECT.goal}\n\n기록:\n` + records.map((r) => `${r.id} | ${r.at} | ${r.author} | ${r.text}`).join("\n");

const t0 = performance.now();
// 무료 등급은 몰릴 때 503·429가 난다: 5초·15초·45초 기다렸다 다시
let res, body;
for (const wait of [5, 15, 45, 0]) {
  res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: input }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: SCHEMA, temperature: 0.4 },
    }),
  });
  body = await res.json();
  if (res.ok || ![429, 503].includes(res.status) || !wait) break;
  console.log(`${res.status} — ${wait}초 뒤 다시`);
  await new Promise((r) => setTimeout(r, wait * 1000));
}
if (!res.ok) throw new Error(JSON.stringify(body.error ?? body));
const digest = JSON.parse(body.candidates[0].content.parts.filter((p) => p.text).map((p) => p.text).join(""));
const sec = ((performance.now() - t0) / 1000).toFixed(1);

const outDir = new URL("./out/", import.meta.url).pathname;
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `${path.basename(file, ".txt")}.${MODEL}.json`);
fs.writeFileSync(outFile, JSON.stringify({ model: MODEL, records, digest }, null, 2));

// ─── 화면 규칙 검사 ───
const ids = new Set(records.map((r) => r.id));
const problems = [];
digest.experiences.forEach((e, i) => {
  const lines = e.text.split("\n");
  if (lines.length < 3 || lines.length > 4) problems.push(`경험 ${i + 1}: ${lines.length}줄`);
  lines.forEach((l) => l.length > 17 && problems.push(`경험 ${i + 1}: 긴 줄 ${l.length}자 "${l}"`));
  const bad = e.recordIds.filter((id) => !ids.has(id));
  if (!e.recordIds.length || bad.length) problems.push(`경험 ${i + 1}: 근거 기록 이상 ${JSON.stringify(e.recordIds)}`);
  const others = e.recordIds.map((id) => records.find((r) => r.id === id)).filter((r) => r && r.author !== ME);
  if (others.length === e.recordIds.length) problems.push(`경험 ${i + 1}: 근거가 전부 다른 사람 말`);
});

const tok = body.usageMetadata;
console.log(`모델 ${MODEL} · ${sec}초 · 입력 ${tok.promptTokenCount} / 출력 ${tok.candidatesTokenCount} 토큰 · 기록 ${records.length}개\n`);
console.log(`■ 경험 카드 ${digest.experiences.length}장`);
for (const e of digest.experiences) console.log(`\n${e.text}\n  └ 근거 ${e.recordIds.join(",")} · ${e.steps.map((s) => `${s.label}: ${s.text}`).join(" / ")}`);
console.log(`\n■ 피드백 ${digest.feedbacks.length}개`);
for (const f of digest.feedbacks) console.log(`- [${f.type}] ${f.line}\n  제안: ${f.suggestion.title} → ${f.suggestion.action}`);
console.log(`\n■ 변경 사항 ${digest.changes.length}개`);
for (const c of digest.changes) console.log(`- [${c.kind}] ${c.title.replace("\n", " ")} / ${c.action}`);
console.log(`\n■ 타임라인: ${digest.steps.map((s) => (s.state === "current" ? `[${s.label.replace("\n", "")}]` : s.label.replace("\n", ""))).join(" → ")}`);
console.log(`■ 인사이트: ${digest.insight.title.replace("\n", " ")}`);
console.log(`\n검사: ${problems.length ? "\n- " + problems.join("\n- ") : "통과"}`);
console.log(`\n저장: ${path.relative(process.cwd(), outFile)}`);
