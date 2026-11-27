import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { RawRecord } from "@/lib/model";

// AI 미리보기용 시험 기록. 실제 서비스는 DB(raw_records)에서 읽는다
const SAMPLES_DIR = path.join(process.cwd(), "scripts/ai/samples");

export function sampleNames() {
  const files = fs.existsSync(SAMPLES_DIR) ? fs.readdirSync(SAMPLES_DIR).filter((f) => f.endsWith(".txt")) : [];
  return ["섞인 기록 (카톡 밴드 + 노션 4쪽 + 잡담)", ...files];
}

// 간단 카톡 PC 형식 파서 (정식 파서는 제나 PR #1 → 합쳐지면 그걸로 바꾼다)
export function parseKakaoSimple(text: string, title: string): RawRecord[] {
  const out: RawRecord[] = [];
  let date = "";
  for (const line of text.replace(/^﻿/, "").split(/\r?\n/)) {
    const d = line.match(/-+ (\d{4})년 (\d{1,2})월 (\d{1,2})일/);
    if (d) { date = `${d[1]}-${d[2].padStart(2, "0")}-${d[3].padStart(2, "0")}`; continue; }
    const m = line.match(/^\[(.+?)\] \[(오전|오후) (\d{1,2}):(\d{2})\] (.+)$/);
    if (!m || !date) continue;
    const h = (Number(m[3]) % 12) + (m[2] === "오후" ? 12 : 0);
    out.push({ id: crypto.randomUUID(), source: "kakao", sourceTitle: title, author: m[1], text: m[5], at: `${date}T${String(h).padStart(2, "0")}:${m[4]}:00+09:00` });
  }
  return out;
}

const titleOf = (text: string, fallback: string) => text.replace(/^﻿/, "").split(/\r?\n/)[0].match(/^(.+?) 님과 카카오톡 대화/)?.[1]?.trim() || fallback;

export function loadRecords(input: { sample?: string; text?: string }): RawRecord[] {
  if (input.text?.trim()) return parseKakaoSimple(input.text, titleOf(input.text, "올린 대화"));
  if (input.sample && input.sample !== sampleNames()[0]) {
    const file = path.join(SAMPLES_DIR, path.basename(input.sample));
    const text = fs.readFileSync(file, "utf8");
    return parseKakaoSimple(text, titleOf(text, path.basename(file, ".txt")));
  }
  // 섞인 기록
  const band = fs.readFileSync(path.join(SAMPLES_DIR, "kakao-band.txt"), "utf8");
  const recs = parseKakaoSimple(band, "밴드 동아리");
  const notion = (title: string, text: string) =>
    recs.push({ id: crypto.randomUUID(), source: "notion", sourceTitle: title, text, at: "2026-11-20T10:00:00+09:00", url: "https://notion.so" });
  notion("공모전 기획", "# 브랜드 캠페인 공모전\n- 타깃: 20대 초반 대학생, 자취 1~2년차\n- 인사이트: 장보기 귀찮음, 소량 구매 선호\n- 캠페인 아이디어: '한 끼 키트' 챌린지\n[ ] 제안서 초안 11/30까지");
  notion("공모전 회의록 2", "## 피드백 반영\n- 멘토: 타깃 페르소나를 하나로 좁혀라\n- 결정: 자취 1년차로 좁힘, 설문 30명 진행\n[x] 설문지 배포");
  notion("자기소개서 초안", "# 마케팅 직무 자소서\n1. 지원 동기: 데이터로 고객을 이해하는 일\n2. 협업 경험: 동아리 공연 일정 조율\n3. 문제 해결: 공모전 타깃 재설정");
  notion("자소서 문항 정리", "- 문항 1 700자, 문항 2 500자\n- 마감 12/5\n- 문항 2 초안 수정 필요: 결과 수치 넣기");
  notion("주말 맛집 리스트", "- 성수 파스타\n- 망원 빵집");
  recs.push({ id: crypto.randomUUID(), source: "kakao", sourceTitle: "가족", author: "엄마", text: "저녁 먹었니", at: "2026-11-20T19:00:00+09:00" });
  return recs;
}
