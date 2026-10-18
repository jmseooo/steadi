import type { ProjectColor } from "../projectColors";
import type { ConnectedCardData } from "./Cards";

export type Step = { label: string; state: "done" | "current" | "todo"; detail?: string; current?: string };

export type ProjectDetailData = {
  id: string;
  name: string;
  color: ProjectColor;
  status: string;
  goal: string;
  startedAt: string;
  steps: Step[];
  insight: { title: string; desc: string };
  // 경험 모음 처음 화면의 두 묶음 (카드를 겹쳐 쌓은 미리보기)
  bundles: {
    connected: { count: number; createdAgo: string; cards: ConnectedCardData[] };
    experience: { count: number; createdAgo: string };
  };
  // 묶음을 눌렀을 때 목록: 연결된 경험 카드(여러 프로젝트에 걸친 경험), 경험 카드(이 프로젝트에서 쌓인 경험)
  connected: ConnectedCardData[];
  experiences: { tag: string; text: string }[];
};

export const PROJECT_DETAILS: Record<string, ProjectDetailData> = {
  marketing: {
    id: "marketing",
    name: "마케팅 공모전",
    color: "pink",
    status: "진행 중",
    goal: "타깃층에 맞는 전략을 수립하고 성과를 도출하기",
    startedAt: "2026.09.01",
    steps: [
      { label: "과제\n파악", state: "done" },
      { label: "타깃\n분석", state: "done" },
      { label: "전략 수립", state: "current", current: "구체화한 타깃을 바탕으로 \n캠페인 방향을 정리하고 있어요" },
      { label: "아이디어\n구체화", state: "todo" },
      { label: "제안서\n작성", state: "todo" },
      { label: "검토 및\n제출", state: "todo" },
    ],
    insight: {
      title: "지금까지 타깃을 구체화하는 과정에서\n가장 많은 의사결정과 피드백이 쌓였어요",
      desc: "처음에는 1020 소비자를 대상으로 생각했지만,\n피드백 이후 타깃을 더 구체적으로 좁혀왔어요",
    },
    bundles: {
      connected: {
        count: 24,
        createdAgo: "2시간 전",
        // 뒤 → 앞 순서. 뒤 카드는 왼쪽 25px만 보여 그림은 색별 빛만 의미 있고, 맨 앞 카드만 전용 그림(c9)
        cards: [
          { art: 2, tone: "pink", title: "따로 준비한 내용을 연결하며,\n전체 흐름을 조정했어요", confidence: 82 },
          { art: 2, tone: "pink", title: "기록에서 구체적인 근거를 찾아\n선택한 이유를 설명했어요", confidence: 82 },
          { art: 1, tone: "orange", title: "여러 방법을 작게 시도하고,\n결과를 비교해 방향을 정했어요", confidence: 82 },
          { art: 4, tone: "pink", title: "피드백에서 바꿀 부분을 찾고,\n다음 시도에 반영했어요", confidence: 82 },
          { art: 8, tone: "orange", title: "한 번에 해결하기 어려운 일을,\n작은 단위로 나눠 진행했어요", confidence: 82 },
          { art: 3, tone: "blue", title: "서로 다른 의견을 모아,\n함께 선택할 기준을 찾았어요", confidence: 82 },
          { art: 6, tone: "pink", title: "계획대로 진행하기 어려울 때,\n가능한 조건부터 다시 살폈어요", confidence: 82 },
          { art: 9, tone: "blue", title: "선택지가 여러 개일 때,\n비교할 기준부터 정했어요", confidence: 82 },
        ],
      },
      experience: { count: 58, createdAgo: "2시간 전" },
    },
    connected: [
      { art: 1, tone: "orange", tags: ["자기소개서", "마케팅 공모전"], title: "전달할 내용을 고를 때,\n상대가 찾는 정보부터 살폈어요", confidence: 85 },
      { art: 2, tone: "pink", tags: ["마케팅 공모전", "자기소개서", "밴드 동..."], title: "선택지가 여러 개일 때,\n비교할 기준을 먼저 정했어요", confidence: 92 },
      { art: 3, tone: "blue", tags: ["밴드 동아리", "마케팅 공모전"], title: "처음 계획이 맞지 않을 때,\n조건을 다시 살펴 조정했어요", confidence: 83 },
      { art: 4, tone: "pink", tags: ["마케팅 공모전", "자기소개서"], title: "주장을 구체적으로 설명하려고,\n기록에서 근거를 골랐어요", confidence: 91 },
      { art: 5, tone: "blue", tags: ["밴드 동아리", "마케팅 공모전"], title: "여러 방법을 비교해 보고,\n목적에 맞는 방향을 골랐어요", confidence: 81 },
      { art: 6, tone: "pink", tags: ["마케팅 공모전", "자기소개서"], title: "피드백에서 부족한 점을 찾아,\n내용을 구체적으로 다듬었어요", confidence: 96 },
      { art: 7, tone: "blue", tags: ["밴드 동아리", "자기소개서", "마케팅 공..."], title: "복잡한 내용을 작게 나누고,\n순서를 정해 하나씩 정리했어요", confidence: 93 },
      { art: 8, tone: "orange", tags: ["자기소개서", "마케팅 공모전"], title: "여러 기록을 목적에 맞게 골라,\n하나의 흐름으로 구성했어요", confidence: 88 },
    ],
    experiences: [
      { tag: "마케팅 공모전", text: "공모전의 평가 기준을 읽고\n주제와 제출 요건을 나눠\n기획에서 놓치지 않을\n항목을 정리했어요" },
      { tag: "마케팅 공모전", text: "브랜드의 기존 캠페인을 살펴\n반복되는 메시지를 모으고\n이번 기획에서 달리할\n부분을 찾았어요." },
      { tag: "마케팅 공모전", text: "처음에는 1020을 생각했지만\n소비 상황과 관심사를 비교해\n핵심 타깃을 대학생으로\n좁혔어요" },
      { tag: "마케팅 공모전", text: "대학생의 이용 후기를 모아\n반복해서 등장하는 불편을 찾고\n캠페인에서 다룰 문제를\n한 문장으로 정리했어요" },
      { tag: "마케팅 공모전", text: "처음 세운 타깃이 넓다는\n피드백을 바탕으로 자료를 살펴\n타깃을 나눈 이유와 근거를\n보완했어요" },
      { tag: "마케팅 공모전", text: "경쟁 브랜드의 사례를 비교해\n비슷한 접근과 차이를 나누고\n이번 캠페인에서 강조할\n차별점을 정리했어요" },
      { tag: "마케팅 공모전", text: "여러 캠페인 방향을 놓고\n타깃 적합성과 실행 가능성을\n비교할 기준으로 삼아\n우선할 방향을 골랐어요" },
      { tag: "마케팅 공모전", text: "아이디어를 뒷받침할 자료에서\n주장과 직접 연결되는 근거를\n골라 출처와 함께 정리했어요" },
      { tag: "마케팅 공모전", text: "캠페인 메시지 후보를 적고\n타깃의 문제와 연결해 보며\n전달할 핵심 내용을\n한 문장으로 좁혔어요" },
    ],
  },
};
