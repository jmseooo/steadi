"use server";

import { askGoal, reflectGoal } from "@/lib/ai/goal";
import { digestProject } from "@/lib/ai/digest";
import { groupProjects } from "@/lib/ai/group";
import type { AiProjectDigest, AiProjectGrouping } from "@/lib/model";
import { loadRecords } from "./lab-data";

// AI 미리보기 전용 서버 액션 — 로컬 개발에서만
function devOnly() {
  if (process.env.NODE_ENV !== "development") throw new Error("개발 환경에서만 쓸 수 있어요");
}

type Source = { sample?: string; text?: string };
type Timed<T> = { ok: true; data: T; seconds: number; records: number } | { ok: false; error: string };

async function timed<T>(records: number, fn: () => Promise<T>): Promise<Timed<T>> {
  const t0 = performance.now();
  try {
    return { ok: true, data: await fn(), seconds: Math.round((performance.now() - t0) / 100) / 10, records };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function runGroup(src: Source): Promise<Timed<AiProjectGrouping & { titles: Record<string, string> }>> {
  devOnly();
  const records = loadRecords(src);
  return timed(records.length, async () => {
    const g = await groupProjects(records);
    // 프로젝트마다 근거가 된 대화방·페이지 이름
    const titles = Object.fromEntries(
      g.projects.map((p) => [p.name, [...new Set(p.recordIds.map((id) => records.find((r) => r.id === id)?.sourceTitle))].join(", ")]),
    );
    return { ...g, titles };
  });
}

export async function runDigest(src: Source & { me: string; name: string; goal: string }): Promise<Timed<{ digest: AiProjectDigest; problems: string[] }>> {
  devOnly();
  const records = loadRecords(src).filter((r) => r.source === "kakao" && r.sourceTitle !== "가족");
  return timed(records.length, async () => {
    const { digest, problems } = await digestProject({ project: { name: src.name, goal: src.goal }, records, me: src.me.split(",").map((s) => s.trim()).filter(Boolean) });
    return { digest, problems };
  });
}

export async function runAsk(p: { name: string; intro: string; goal: string }) {
  devOnly();
  return timed(0, () => askGoal(p));
}

export async function runReflect(p: { name: string; intro: string; goal: string }, ask: string, answer: string) {
  devOnly();
  return timed(0, () => reflectGoal(p, ask, answer));
}
