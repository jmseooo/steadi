"use client";

import { useState, useTransition } from "react";
import { ExperienceCard } from "@/components/project-detail/Cards";
import type { AiProjectDigest, AiProjectGrouping } from "@/lib/model";
import { runAsk, runDigest, runGroup, runReflect } from "./actions";

/*
 * AI 미리보기 (로컬 개발 전용) — 디자이너·검수 담당이 AI 결과를 실제 화면 모양으로 확인한다.
 * 1) 기록 고르기(샘플 또는 카톡 .txt 올리기) 2) 프로젝트 묶기 3) 목표 대화 4) 프로젝트 정리(경험 카드·피드백·타임라인)
 */

type Group = AiProjectGrouping & { titles: Record<string, string> };
type Proj = Group["projects"][number];

const box = "rounded-[20px] border border-black/10 bg-white p-[20px]";
const btn = "rounded-full bg-[#292c2d] px-[18px] py-[10px] text-[14px] font-semibold text-white disabled:opacity-40";
const input = "rounded-[10px] border border-black/15 px-[12px] py-[8px] text-[14px]";

function Meta({ seconds, records }: { seconds: number; records: number }) {
  return <span className="text-[13px] text-black/45">{records ? `기록 ${records}개 · ` : ""}{seconds}초</span>;
}

export default function AiLab({ samples }: { samples: string[] }) {
  const [sample, setSample] = useState(samples[0]);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const [group, setGroup] = useState<{ data: Group; seconds: number; records: number } | null>(null);
  const [goal, setGoal] = useState<Record<string, { ask?: string; answer: string; reflected?: string; goal?: string }>>({});
  const [digest, setDigest] = useState<{ data: { digest: AiProjectDigest; problems: string[] }; seconds: number; records: number } | null>(null);
  const [me, setMe] = useState("민서");
  const [target, setTarget] = useState({ name: "밴드 동아리", goal: "곡의 분위기에 맞는 무대를 준비하고, 정한 순서대로 공연을 마치기" });

  const src = text ? { text } : { sample };
  const act = (fn: () => Promise<void>) => {
    setError("");
    start(fn);
  };

  return (
    <main className="min-h-screen bg-[#f4f5f6] px-[40px] py-[32px] text-[#292c2d]">
      <h1 className="text-[24px] font-bold">AI 미리보기</h1>
      <p className="mt-[4px] text-[14px] text-black/55">
        시험 기록으로 Gemini를 실제로 불러 결과를 화면 모양으로 봐요. 로컬 개발에서만 열려요. 버튼마다 Gemini 무료 한도를 써요.
      </p>

      {/* 1. 기록 */}
      <section className={`${box} mt-[24px]`}>
        <h2 className="text-[17px] font-bold">1. 기록 고르기</h2>
        <div className="mt-[12px] flex flex-wrap items-center gap-[12px]">
          <select className={input} value={sample} disabled={!!text} onChange={(e) => setSample(e.target.value)}>
            {samples.map((s) => <option key={s}>{s}</option>)}
          </select>
          <span className="text-[13px] text-black/45">또는</span>
          <label className={`${input} cursor-pointer bg-[#f4f5f6]`}>
            카톡 내보내기 .txt 올리기
            <input
              type="file"
              accept=".txt"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setText(await f.text());
                setFileName(f.name);
              }}
            />
          </label>
          {fileName && (
            <button className="text-[13px] text-black/55 underline" onClick={() => { setText(""); setFileName(""); }}>
              {fileName} 빼기
            </button>
          )}
        </div>
        <p className="mt-[8px] text-[12px] text-black/40">올린 파일은 이 컴퓨터에서 Gemini로만 보내고 저장하지 않아요. 실제 대화 파일은 커밋하지 마세요.</p>
      </section>

      {/* 2. 프로젝트 묶기 */}
      <section className={`${box} mt-[16px]`}>
        <div className="flex items-center gap-[12px]">
          <h2 className="text-[17px] font-bold">2. 프로젝트 묶기 (온보딩)</h2>
          <button
            className={btn}
            disabled={pending}
            onClick={() => act(async () => {
              const r = await runGroup(src);
              if (!r.ok) return setError(r.error);
              setGroup(r);
              setGoal({});
            })}
          >
            {pending ? "도는 중…" : "묶기"}
          </button>
          {group && <Meta seconds={group.seconds} records={group.records} />}
        </div>

        {group && (
          <div className="mt-[16px] grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-[12px]">
            {group.data.projects.map((p: Proj) => {
              const g = goal[p.name] ?? { answer: "" };
              const set = (v: Partial<typeof g>) => setGoal((s) => ({ ...s, [p.name]: { ...g, ...v } }));
              return (
                <article key={p.name} className="rounded-[16px] bg-[#f4f5f6] p-[16px]">
                  <div className="flex items-baseline justify-between">
                    <span className="rounded-full bg-white px-[10px] py-[4px] text-[14px] font-semibold">{p.name}</span>
                    <span className="text-[12px] text-black/40">근거 {p.recordIds.length}개 · {group.data.titles[p.name]}</span>
                  </div>
                  <p className="mt-[10px] text-[14px] leading-[1.5]">{p.intro}</p>
                  <p className="mt-[8px] text-[15px] font-semibold leading-[1.5]">{g.goal ?? p.goal}</p>

                  <div className="mt-[12px] border-t border-black/10 pt-[12px]">
                    {!g.ask ? (
                      <div className="flex gap-[8px]">
                        <button
                          className={btn}
                          disabled={pending}
                          onClick={() => act(async () => {
                            const r = await runAsk(p);
                            if (!r.ok) return setError(r.error);
                            set({ ask: r.data.ask });
                          })}
                        >
                          목표 질문 받기
                        </button>
                        <button className="text-[13px] text-black/55 underline" onClick={() => setTarget({ name: p.name, goal: g.goal ?? p.goal })}>
                          3번 정리 대상으로
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-line text-[14px] font-medium">{g.ask}</p>
                        <div className="mt-[8px] flex gap-[8px]">
                          <input className={`${input} flex-1`} placeholder="답 적기" value={g.answer} onChange={(e) => set({ answer: e.target.value })} />
                          <button
                            className={btn}
                            disabled={pending}
                            onClick={() => act(async () => {
                              const r = await runReflect(p, g.ask!, g.answer);
                              if (!r.ok) return setError(r.error);
                              set({ reflected: r.data.reflected, goal: r.data.goal });
                            })}
                          >
                            반영
                          </button>
                        </div>
                        {g.reflected && <p className="mt-[8px] text-[13px] text-[#02578a]">{g.reflected}</p>}
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. 프로젝트 정리 */}
      <section className={`${box} mt-[16px]`}>
        <div className="flex flex-wrap items-center gap-[12px]">
          <h2 className="text-[17px] font-bold">3. 프로젝트 정리 (새벽 배치)</h2>
          <input className={`${input} w-[140px]`} value={target.name} onChange={(e) => setTarget({ ...target, name: e.target.value })} />
          <input className={`${input} w-[360px]`} value={target.goal} onChange={(e) => setTarget({ ...target, goal: e.target.value })} />
          <label className="text-[13px] text-black/55">
            대화방 속 내 이름 <input className={`${input} w-[90px]`} value={me} onChange={(e) => setMe(e.target.value)} />
          </label>
          <button
            className={btn}
            disabled={pending}
            onClick={() => act(async () => {
              const r = await runDigest({ ...src, me, ...target });
              if (!r.ok) return setError(r.error);
              setDigest(r);
            })}
          >
            {pending ? "도는 중…" : "정리"}
          </button>
          {digest && <Meta seconds={digest.seconds} records={digest.records} />}
        </div>
        <p className="mt-[6px] text-[12px] text-black/40">카톡 기록만 넣어요. 실제 서비스에서는 프로젝트로 묶인 기록이 들어가요.</p>

        {digest && (
          <div className="mt-[20px] space-y-[24px]">
            <p className={`text-[14px] font-semibold ${digest.data.problems.length ? "text-[#a80c55]" : "text-[#0a7a3e]"}`}>
              화면 규칙 검사: {digest.data.problems.length ? digest.data.problems.join(" · ") : "통과 (3~4줄, 한 줄 17자 이내, 근거에 내 기록)"}
            </p>

            <div>
              <h3 className="text-[15px] font-bold">경험 카드 {digest.data.digest.experiences.length}장</h3>
              <div className="mt-[12px] flex flex-wrap gap-[16px]">
                {digest.data.digest.experiences.map((e, i) => (
                  <div key={i} className="w-[228px]">
                    <ExperienceCard card={{ tag: target.name, text: e.text, source: e.source === "notion" ? "notion" : "kakao" }} tone="blue" />
                    <p className="mt-[8px] text-[12px] leading-[1.5] text-black/55">{e.summary}</p>
                    <p className="mt-[4px] text-[12px] leading-[1.5] text-black/40">{e.steps.map((s) => `${s.label}: ${s.text}`).join(" / ")}</p>
                    <p className="mt-[4px] text-[11px] text-black/35">근거 기록 {e.recordIds.length}개</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[15px] font-bold">타임라인</h3>
              <div className="mt-[10px] flex gap-[8px]">
                {digest.data.digest.steps.map((s, i) => (
                  <div key={i} className={`rounded-[14px] px-[14px] py-[10px] text-center text-[13px] ${s.state === "current" ? "bg-[#02578a] text-white" : s.state === "done" ? "bg-white" : "bg-white/50 text-black/40"}`}>
                    <p className="whitespace-pre-line font-semibold leading-[1.3]">{s.label}</p>
                    {s.current && <p className="mt-[6px] whitespace-pre-line text-[11px] leading-[1.4] opacity-80">{s.current}</p>}
                  </div>
                ))}
              </div>
              <p className="mt-[10px] whitespace-pre-line text-[14px] font-semibold">{digest.data.digest.insight.title}</p>
              <p className="whitespace-pre-line text-[13px] text-black/55">{digest.data.digest.insight.desc}</p>
            </div>

            <div className="grid grid-cols-2 gap-[16px]">
              <div>
                <h3 className="text-[15px] font-bold">피드백 {digest.data.digest.feedbacks.length}개</h3>
                {digest.data.digest.feedbacks.map((f, i) => (
                  <div key={i} className="mt-[10px] rounded-[14px] bg-[#f4f5f6] p-[14px] text-[13px] leading-[1.5]">
                    <p><b>[{f.type}]</b> {f.line}</p>
                    <p className="mt-[4px] text-black/50">“{f.original}” · {f.meta}</p>
                    {f.summary.map((s) => <p key={s.label} className="mt-[4px]"><b>{s.label}</b> {s.text}</p>)}
                    <p className="mt-[6px] font-semibold">{f.suggestion.title} → [{f.suggestion.action}]</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-[15px] font-bold">변경 사항 {digest.data.digest.changes.length}개</h3>
                {digest.data.digest.changes.map((c, i) => (
                  <div key={i} className="mt-[10px] rounded-[14px] bg-[#f4f5f6] p-[14px] text-[13px] leading-[1.5]">
                    <p className="text-black/50">{c.kind}</p>
                    <p className="whitespace-pre-line font-semibold">{c.title}</p>
                    <p className="whitespace-pre-line">{c.desc}</p>
                    <p className="mt-[4px] font-semibold">[{c.action}]</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {error && <p className="fixed bottom-[24px] left-1/2 -translate-x-1/2 rounded-full bg-[#a80c55] px-[20px] py-[10px] text-[14px] text-white">{error}</p>}
    </main>
  );
}
