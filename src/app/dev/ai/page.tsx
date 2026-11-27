import { notFound } from "next/navigation";
import AiLab from "./AiLab";
import { sampleNames } from "./lab-data";

// AI 미리보기: 시험 기록을 넣고 AI 결과를 실제 카드 모양으로 본다 (로컬 개발 전용, 배포에서는 404)
export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <AiLab samples={sampleNames()} />;
}
