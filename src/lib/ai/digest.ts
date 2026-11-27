import "server-only";

import type { AiProjectDigest, ProjectStep, RawRecord, SourceApp } from "@/lib/model";
import { ARR, OBJ, S, generateJson } from "./gemini";
import { promptRecords } from "./records";

/*
 * 새벽 배치: 프로젝트 하나의 새 기록 → 경험 카드·피드백·변경 사항·타임라인·인사이트 (scripts/ai/digest.mjs 실험을 옮긴 것).
 * 사용자당 하루 1~3번 호출 중 한 번. 결과는 DB에 저장해 화면이 재사용한다.
 * source(어느 앱에서 왔는지)는 AI가 아니라 근거 기록에서 정한다.
 */

export type DigestInput = {
  project: { name: string; goal: string; steps?: ProjectStep[] };
  /** 이번에 새로 읽을 기록 (analyzed_at이 빈 것) */
  records: RawRecord[];
  /** 대화방에서 사용자 이름 (카톡 업로드 때 고른 이름). 노션처럼 작성자가 없으면 전부 사용자 기록으로 본다 */
  me: string[];
  /** 이미 만든 카드 문장 — 같은 경험을 다시 만들지 않게 */
  existingCards?: string[];
};

const SYSTEM = (me: string[]) => `너는 대학생의 프로젝트 기록을 읽고 경험을 정리해 주는 서비스 "스테디"다.
입력은 한 프로젝트의 원본 기록(카카오톡 대화·노션 페이지 등)이다. 기록마다 id가 있다.
사용자는 ${me.length ? me.map((m) => `"${m}"`).join(", ") : "작성자가 없는 기록(노션 등)의 작성자"}이다. 작성자가 없는 기록은 사용자가 쓴 것이다.

규칙
- 기록에 없는 내용은 절대 지어내지 않는다. 모든 결과에 근거가 된 기록 id를 넣는다.
- 말투는 "~했어요", "~해요" 해요체. 사용자를 "나", "사용자", 이름으로 부르지 않고 주어를 생략한다.
- "이미 만든 카드"와 같은 경험은 다시 만들지 않는다.

experiences (경험 카드): 사용자가 직접 한 판단·행동 하나를 카드 하나로. 다른 사람이 한 행동은 카드로 만들지 않는다.
- text: 상황 → 행동 → 결과 흐름의 한 문장을 3~4줄로 나눈다. 줄은 "\\n"으로 나누고, 한 줄은 띄어쓰기 포함 11~16자. 의미 단위로 끊는다.
  예) "팀원마다 가능한 시간을 모아\\n함께 참여할 수 있는 날을 찾고\\n정기 합주 일정을 정했어요"
  예) "팀원의 불참으로 계획을 바꿔\\n참여 가능한 인원을 기준으로\\n연습할 곡과 순서를\\n다시 정했어요"
- summary: 이 경험이 어떤 상황이었는지 한 문장.
- steps: 상황·판단·행동 각각 한 문장(짧게).
- 새 기록에서 찾은 만큼만 0~6장. 비슷한 행동은 한 장으로 합친다.

feedbacks: 다른 사람이 사용자나 팀의 결과물·방식에 준 의견이나 요청만.
- type: 띄어쓰기를 지킨 6자 안팎 명사구 ("자리 이동 요청", "음량 조절 요청"). line: 목록에 보일 한 문장 요약(해요체).
- title: 한 줄 제목. meta: "카카오톡 ‘대화방 이름’" 또는 "노션 ‘페이지 이름’". original: 원문을 그대로 따옴표 없이.
- summary: [현재 어려움, 요청한 변화, 확인이 필요한 부분] 세 칸. 각 text도 해요체 문장 ("~어려워해요", "~요청했어요", "~확인이 필요해요").
- suggestion: 피드백을 반영할 다음 행동 제안. title은 "~해 볼까요?", action은 "~ 만들기" 형태의 버튼 글자, columns는 [테스트해 볼 내용, 확인 기준].

changes: 일정·장소·분량처럼 프로젝트 조건이 바뀐 것. kind는 "합주 일정 변경" 같은 이름, title·desc는 각각 두 줄("\\n"), action은 버튼 글자.

steps (타임라인): 이 프로젝트의 단계 5~6개. label은 2~4자씩 두 줄("곡\\n선정"), 지금 단계 하나만 current이고 current에 지금 하는 일을 두 줄로.
  "지금 타임라인"이 있으면 그 단계 이름을 유지하고 상태(done·current·todo)만 기록에 맞게 옮긴다.
insight: 지금까지 기록에서 가장 많이 쌓인 흐름. title 두 줄, desc 두 줄.`;

const PAIRS = ARR(OBJ({ label: S(), text: S() }));
const SCHEMA = OBJ({
  experiences: ARR(
    OBJ({
      text: S("카드 문장, 3~4줄"),
      summary: S("한 문장"),
      steps: ARR(OBJ({ label: { type: "STRING", enum: ["상황", "판단", "행동"] }, text: S() })),
      recordIds: ARR(S("근거 기록 id")),
    }),
  ),
  feedbacks: ARR(
    OBJ({
      type: S(), line: S(), title: S(), meta: S(), original: S(), summary: PAIRS,
      suggestion: OBJ({ title: S(), desc: S(), action: S(), columns: PAIRS }),
      recordIds: ARR(S()),
    }),
  ),
  changes: ARR(OBJ({ kind: S(), title: S(), desc: S(), action: S() })),
  steps: ARR(OBJ({ label: S(), state: { type: "STRING", enum: ["done", "current", "todo"] }, current: S() }, ["label", "state"])),
  insight: OBJ({ title: S(), desc: S() }),
});

type Raw = Omit<AiProjectDigest, "experiences" | "feedbacks"> & {
  experiences: (Omit<AiProjectDigest["experiences"][number], "source">)[];
  feedbacks: (Omit<AiProjectDigest["feedbacks"][number], "source">)[];
};

const REWRAP = `카드 문장의 줄바꿈만 다시 한다. 단어와 내용은 바꾸지 않는다.
- 3~4줄, 줄은 "\\n"으로 나누고 한 줄은 띄어쓰기 포함 11~16자.
- 의미 단위로 끊는다. "했어요"처럼 끝말만 한 줄에 두지 않는다.
- 16자 안에 안 들어가면 같은 뜻의 더 짧은 말로 바꿔도 된다.
  예) "팀원의 불참으로 계획을 바꿔\\n참여 가능한 인원을 기준으로\\n연습할 곡과 순서를\\n다시 정했어요"`;

/** 규칙을 어긴 카드만 모아 한 번 더 줄바꿈 (어긴 카드가 있을 때만 호출). 그래도 어기면 원래 것을 쓴다 */
async function rewrapCards(texts: string[]): Promise<string[]> {
  const { data } = await generateJson<{ texts: string[] }>({
    system: REWRAP,
    input: texts.map((t, i) => `${i + 1}. ${t.replace(/\n/g, " ")}`).join("\n"),
    schema: OBJ({ texts: ARR(S("줄바꿈한 문장, 입력 순서대로")) }),
    temperature: 0.2,
  });
  return texts.map((t, i) => {
    const fixed = data.texts[i]?.trim();
    return fixed && !cardTextProblems(fixed).length ? fixed : t;
  });
}

/** 카드 문장이 화면 규칙(3~4줄, 한 줄 17자 이내)에 맞는지 */
export function cardTextProblems(text: string) {
  const lines = text.split("\n");
  const out: string[] = [];
  if (lines.length < 3 || lines.length > 4) out.push(`${lines.length}줄`);
  lines.forEach((l) => l.length > 17 && out.push(`긴 줄 ${l.length}자 "${l}"`));
  return out;
}

export async function digestProject(input: DigestInput) {
  const { records } = input;
  const p = promptRecords(records);
  const byId = new Map(records.map((r) => [r.id, r]));
  const mine = (r: RawRecord) => !r.author || input.me.includes(r.author);

  const context = [
    `프로젝트: ${input.project.name}`,
    `목표: ${input.project.goal}`,
    input.project.steps?.length ? `지금 타임라인: ${input.project.steps.map((s) => `${s.label.replace("\n", "")}(${s.state})`).join(" → ")}` : "",
    input.existingCards?.length ? `이미 만든 카드:\n${input.existingCards.map((c) => `- ${c.replace(/\n/g, " ")}`).join("\n")}` : "",
  ].filter(Boolean).join("\n");

  const { data, tokens } = await generateJson<Raw>({ system: SYSTEM(input.me), input: `${context}\n\n새 기록:\n${p.text}`, schema: SCHEMA });

  // 근거 기록의 앱 중 가장 많은 것
  const sourceOf = (ids: string[]): SourceApp => {
    const count = new Map<SourceApp, number>();
    ids.forEach((id) => { const s = byId.get(id)?.source; if (s) count.set(s, (count.get(s) ?? 0) + 1); });
    return [...count.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "manual";
  };

  const problems: string[] = [];
  const experiences = data.experiences
    .map((e) => ({ ...e, text: e.text.trim(), recordIds: p.toDbIds(e.recordIds) }))
    .filter((e, i) => {
      // 근거가 없거나 전부 다른 사람 말이면 버린다 (사용자의 행동이 아니다)
      if (!e.recordIds.length || !e.recordIds.some((id) => mine(byId.get(id)!))) {
        problems.push(`경험 ${i + 1} 버림: 사용자의 기록이 근거에 없음`);
        return false;
      }
      return true;
    })
    .map((e) => ({ ...e, source: sourceOf(e.recordIds) }));

  const bad = experiences.filter((e) => cardTextProblems(e.text).length);
  if (bad.length) {
    const fixed = await rewrapCards(bad.map((e) => e.text));
    bad.forEach((e, i) => (e.text = fixed[i]));
  }
  experiences.forEach((e, i) => cardTextProblems(e.text).forEach((x) => problems.push(`경험 ${i + 1}: ${x}`)));

  const feedbacks = data.feedbacks
    .map((f) => ({ ...f, recordIds: p.toDbIds(f.recordIds) }))
    .filter((f) => f.recordIds.length > 0)
    .map((f) => ({ ...f, source: sourceOf(f.recordIds) }));

  const digest: AiProjectDigest = { experiences, feedbacks, changes: data.changes, steps: data.steps, insight: data.insight };
  return { digest, problems, tokens };
}
