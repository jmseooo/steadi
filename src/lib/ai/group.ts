import "server-only";

import type { AiProjectGrouping, RawRecord } from "@/lib/model";
import { ARR, OBJ, S, generateJson } from "./gemini";
import { promptRecords } from "./records";

/*
 * 온보딩: 가져온 기록을 프로젝트로 묶기 (실시간, 사용자당 1번).
 * 화면: 온보딩 "프로젝트 확인" — 이름 · intro("노션 ‘공모전 기획’에서 …을 확인했어요.") · goal
 */

const SYSTEM = `너는 대학생의 기록을 읽고 경험을 정리해 주는 서비스 "스테디"다.
입력은 사용자가 연결한 서비스(카카오톡·노션 등)에서 가져온 원본 기록이다. 기록마다 id가 있다.

할 일: 기록을 사용자가 진행 중인 "프로젝트"로 묶는다. 프로젝트 = 목표가 있는 활동 (공모전, 동아리 공연, 자기소개서, 스터디, 팀 과제 …).

규칙
- 기록에 없는 내용은 지어내지 않는다.
- 같은 활동은 하나로 합친다. 대화방·페이지가 달라도 같은 활동이면 합친다.
- 잡담·광고·목표 없는 기록은 어느 프로젝트에도 넣지 않는다.
- 근거가 너무 적으면 만들지 않는다: 대화(카카오톡·AI 대화)는 메시지 3개 이상, 노션은 페이지 1개도 내용이 충분하면 된다. 최대 6개.
- 말투는 해요체. 사용자를 "나", "사용자", 이름으로 부르지 않는다.

name: 화면 칩에 들어갈 짧은 이름, 띄어쓰기 포함 10자 이내 ("마케팅 공모전", "밴드 동아리", "자기소개서")
intro: 어디서 무엇을 발견했는지 한 문장. 출처 이름은 ‘’로 감싼다.
  노션: "노션 ‘공모전 기획’에서 타깃 분석과 캠페인 제안에 관한 내용을 확인했어요."
  카카오톡: "카카오톡 ‘밴드 동아리’의 기록에서 공연 기획과 준비에 관련한 논의를 발견했어요."
goal: 기록에서 보이는 최종 목표 한 문장. "~하고, ~하기"로 끝낸다. 40자 안팎.
  예) "타깃 분석을 바탕으로 브랜드 캠페인을 기획하고, 공모전 제안서를 완성해 제출하기"
recordIds: 이 프로젝트의 근거 기록 id 전부.`;

const SCHEMA = OBJ({
  projects: ARR(OBJ({ name: S("10자 이내"), intro: S("한 문장"), goal: S("~하기로 끝나는 한 문장"), recordIds: ARR(S("기록 id")) })),
});

export async function groupProjects(records: RawRecord[]): Promise<AiProjectGrouping> {
  if (!records.length) return { projects: [] };
  const p = promptRecords(records);
  const { data } = await generateJson<AiProjectGrouping>({ system: SYSTEM, input: `기록:\n${p.text}`, schema: SCHEMA, waits: [3, 8] });
  return {
    projects: data.projects
      .map((x) => ({ ...x, name: x.name.trim(), recordIds: p.toDbIds(x.recordIds) }))
      .filter((x) => x.name && x.recordIds.length > 0),
  };
}
