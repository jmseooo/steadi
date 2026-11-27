import "server-only";

import type { AiGoalTurn } from "@/lib/model";
import { OBJ, S, generateJson } from "./gemini";

/*
 * 온보딩 목표 대화 (실시간). 프로젝트마다 최대 2번 호출:
 *   1) askGoal: AI가 찾은 목표를 보여 주며 한 가지를 되묻는다
 *   2) reflectGoal: 사용자의 답을 목표에 반영한다
 * 화면 문구 예 (Figma, onboarding/data.ts FOLLOW_UP):
 *   ask       "기획한 방향을 목표에 반영하려고 해요.\n공연에서 꼭 구현하고 싶은 부분은 무엇인가요?"
 *   reflected "곡의 분위기에 맞는 무대 구성과 공연 진행 순서를 목표에 반영했어요."
 *   goal      "곡의 분위기에 맞는 무대를 준비하고, 정한 순서대로 공연을 마치기"
 */

type GoalProject = { name: string; intro: string; goal: string };

const BASE = `너는 대학생의 프로젝트 목표를 함께 다듬는 서비스 "스테디"다. 말투는 해요체, 짧고 다정하게.
사용자를 "나", "사용자", 이름으로 부르지 않는다. 기록이나 답에 없는 내용은 지어내지 않는다.`;

const ASK = `${BASE}
할 일: 프로젝트 목표를 더 구체적으로 만들기 위해 질문 하나를 한다.
- 이 프로젝트에서 이루고 싶은 것, 꼭 해내고 싶은 부분, 달라지고 싶은 점을 묻는다.
- 시간·장소·인원처럼 기록에서 알 수 있는 사실은 묻지 않는다. 예/아니오로 끝나는 질문도 하지 않는다.
ask: 두 줄. 첫 줄은 "~을 목표에 반영하려고 해요.", 둘째 줄은 "~은 무엇인가요?" 질문. 줄은 "\\n"으로 나눈다. 각 줄 30자 이내.
  예) "기획한 방향을 목표에 반영하려고 해요.\\n공연에서 꼭 구현하고 싶은 부분은 무엇인가요?"
  예) "대화에 참여하는 경험을 목표에 반영하려고 해요.\\n영어로 말할 때 특히 달라지고 싶은 부분은 무엇인가요?"
- 둘째 줄에는 이 프로젝트만의 장면(공연, 제안서, 면접, 발표 …)을 넣어 구체적으로 묻는다. "꼭 해내고 싶은 부분은?"처럼 어디에나 맞는 질문은 피한다.`;

const REFLECT = `${BASE}
할 일: 사용자의 답을 프로젝트 목표에 반영한다.
reflected: 무엇을 반영했는지 한 문장. "~을 목표에 반영했어요." 또는 "~을 목표에 담았어요."로 끝낸다.
goal: 새 목표 한 문장. 원래 목표의 범위를 유지하면서 답의 내용을 구체적으로 넣는다. "~하기"로 끝내고 45자 이내.
답이 목표와 상관없거나 비어 있으면 원래 목표를 그대로 쓰고 reflected는 "지금 목표를 그대로 둘게요."`;

const info = (p: GoalProject) => `프로젝트: ${p.name}\n찾은 내용: ${p.intro}\n지금 목표: ${p.goal}`;

export async function askGoal(project: GoalProject): Promise<Extract<AiGoalTurn, { ask: string }>> {
  const { data } = await generateJson<{ ask: string }>({
    system: ASK,
    input: info(project),
    schema: OBJ({ ask: S("두 줄, \\n으로 나눔") }),
    temperature: 0.6,
    waits: [2, 5],
  });
  return { ask: data.ask.trim() };
}

export async function reflectGoal(project: GoalProject, ask: string, answer: string): Promise<Extract<AiGoalTurn, { goal: string }>> {
  const { data } = await generateJson<{ reflected: string; goal: string }>({
    system: REFLECT,
    input: `${info(project)}\n\n스테디의 질문: ${ask.replace(/\n/g, " ")}\n사용자의 답: ${answer.trim() || "(빈 답)"}`,
    schema: OBJ({ reflected: S("한 문장"), goal: S("~하기로 끝나는 한 문장") }),
    waits: [2, 5],
  });
  return { reflected: data.reflected.trim(), goal: data.goal.trim() };
}
