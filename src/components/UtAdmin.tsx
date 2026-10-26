"use client";

import { useMemo, useState } from "react";
import { fetchEvents, type UtEvent } from "@/lib/ut";

// 졸전 UT 관리자: 비밀번호를 넣으면 관람객(체험)별 기록, 화면·버튼 통계, CSV 내려받기
type Visit = {
  id: string;
  booth: string | null;
  start: Date;
  end: Date;
  events: UtEvent[];
  views: number;
  clicks: number;
  onboarding: boolean; // 온보딩을 거쳤는지 (부스 PC는 홈부터 시작해 대부분 아님)
  finished: boolean; // 온보딩 끝까지 마치고 홈으로 갔는지
  last: string;
};

export default function UtAdmin() {
  const [password, setPassword] = useState("");
  const [events, setEvents] = useState<UtEvent[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setEvents(await fetchEvents(password));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const visits = useMemo(() => (events ? groupVisits(events) : []), [events]);
  const pages = useMemo(() => (events ? pageStats(events) : []), [events]);
  const buttons = useMemo(() => (events ? buttonStats(events) : []), [events]);

  if (!events) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-canvas p-[16px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="flex w-[340px] flex-col gap-[12px] rounded-[24px] bg-white p-[28px] shadow-soft"
        >
          <h1 className="text-[20px] font-bold text-ink">Steadi UT 기록</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="관리자 비밀번호"
            className="h-[44px] rounded-[12px] border border-line px-[14px] text-[15px] outline-none focus:border-ink"
          />
          {error && <p className="text-[13px] text-[#e0244d]">{error}</p>}
          <button type="submit" disabled={!password || loading} className="h-[44px] rounded-[12px] bg-ink text-[15px] font-semibold text-white disabled:bg-disabled">
            {loading ? "불러오는 중…" : "보기"}
          </button>
        </form>
      </main>
    );
  }

  const durations = visits.map((v) => v.end.getTime() - v.start.getTime());
  const avg = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  return (
    <main className="min-h-dvh bg-canvas px-[16px] py-[40px] text-ink">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-[24px]">
        <header className="flex flex-wrap items-center justify-between gap-[12px]">
          <h1 className="text-[24px] font-bold">Steadi UT 기록</h1>
          <div className="flex gap-[8px]">
            <button type="button" onClick={load} className="h-[40px] rounded-[12px] bg-white px-[16px] text-[14px] font-semibold shadow-soft">
              {loading ? "불러오는 중…" : "새로고침"}
            </button>
            <button type="button" onClick={() => downloadCsv(events, visits)} className="h-[40px] rounded-[12px] bg-ink px-[16px] text-[14px] font-semibold text-white">
              CSV 내려받기
            </button>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-[12px] md:grid-cols-4">
          <Stat label="관람객(체험) 수" value={`${visits.length}명`} />
          <Stat label="평균 체험 시간" value={formatMs(avg)} />
          <Stat label="온보딩 완료" value={`${visits.filter((v) => v.finished).length}명`} />
          <Stat label="전체 기록" value={`${events.length}개`} />
        </section>

        <div className="grid gap-[24px] md:grid-cols-2">
          <Card title="화면별 방문">
            <Table head={["화면", "방문", "평균 머문 시간"]} rows={pages.map((p) => [p.path, `${p.views}`, formatMs(p.avgMs)])} />
          </Card>
          <Card title="많이 누른 버튼">
            <Table head={["버튼", "화면", "횟수"]} rows={buttons.slice(0, 20).map((b) => [b.target, b.path, `${b.count}`])} />
          </Card>
        </div>

        <Card title="관람객별 기록">
          <ul className="flex flex-col">
            {visits.map((v, i) => (
              <li key={v.id} className="border-t border-line first:border-t-0">
                <button
                  type="button"
                  onClick={() => setOpen(open === v.id ? null : v.id)}
                  className="flex w-full flex-wrap items-center gap-x-[16px] gap-y-[4px] py-[12px] text-left text-[14px] hover:scale-100 hover:bg-canvas/60"
                >
                  <span className="w-[40px] font-semibold">#{visits.length - i}</span>
                  <span className="w-[140px]">{formatTime(v.start)}</span>
                  <span className="w-[70px] text-ink-sub">{v.booth ? `PC ${v.booth}` : "PC -"}</span>
                  <span className="w-[70px]">{formatMs(v.end.getTime() - v.start.getTime())}</span>
                  <span className="text-ink-sub">
                    화면 {v.views} · 클릭 {v.clicks}
                    {v.onboarding && (v.finished ? " · 온보딩 완료" : " · 온보딩 중 이탈")} · 마지막 {v.last}
                  </span>
                </button>
                {open === v.id && <Timeline events={v.events} start={v.start} />}
              </li>
            ))}
            {visits.length === 0 && <li className="py-[12px] text-[14px] text-ink-muted">아직 기록이 없어요.</li>}
          </ul>
        </Card>
      </div>
    </main>
  );
}

function Timeline({ events, start }: { events: UtEvent[]; start: Date }) {
  return (
    <ol className="mb-[12px] flex max-h-[420px] flex-col gap-[2px] overflow-y-auto rounded-[12px] bg-canvas p-[12px] text-[13px]">
      {events.map((e) => (
        <li key={e.id} className="flex gap-[12px]">
          <span className="w-[56px] shrink-0 text-ink-muted tabular-nums">+{formatMs(new Date(e.at).getTime() - start.getTime())}</span>
          <span className="w-[110px] shrink-0 font-semibold">{TYPE_LABEL[e.type] ?? e.type}</span>
          <span className="break-all text-ink-sub">{describe(e)}</span>
        </li>
      ))}
    </ol>
  );
}

const TYPE_LABEL: Record<string, string> = {
  session_start: "체험 시작",
  session_end: "체험 끝",
  idle_warning: "돌아가기 안내",
  idle_continue: "이어보기",
  page_view: "화면 열기",
  page_leave: "화면 떠남",
  click: "클릭",
  input: "입력",
  onboarding_step: "온보딩 단계",
  goal_chat: "목표 대화",
};

function describe(e: UtEvent) {
  const v = e.value as Record<string, unknown> | null;
  switch (e.type) {
    case "page_view":
      return e.path;
    case "page_leave":
      return `${v?.path} (${formatMs(Number(v?.ms))} 머묾)`;
    case "click":
      return `${e.target} — ${e.path}`;
    case "goal_chat":
      return `[${e.target}] ${v?.text}`;
    case "onboarding_step":
      return `${e.target} ${JSON.stringify(v)}`;
    case "session_start":
      return String(v?.screen ?? "");
    case "session_end":
      return e.target === "idle" ? "3분 동안 조작 없음 → 홈 처음으로" : e.target === "onboarding" ? "회원가입 화면으로 새로 시작" : (e.target ?? "");
    default:
      return `${e.target ?? ""} ${v == null ? "" : JSON.stringify(v)}`;
  }
}

function groupVisits(events: UtEvent[]): Visit[] {
  const map = new Map<string, UtEvent[]>();
  for (const e of events) map.set(e.session_id, [...(map.get(e.session_id) ?? []), e]);
  // 온보딩 첫 화면을 거치지 않은 조각(배포 미리보기 봇, 온보딩으로 넘어가기 전 잠깐 열린 홈 등)은 관람객으로 치지 않는다
  return [...map.entries()]
    .filter(([, list]) => list.some((e) => e.type === "session_start"))
    .map(([id, list]) => {
      list.sort((a, b) => a.seq - b.seq);
      const views = list.filter((e) => e.type === "page_view");
      return {
        id,
        booth: list.find((e) => e.booth)?.booth ?? null,
        start: new Date(list[0].at),
        end: new Date(list[list.length - 1].at),
        events: list,
        views: views.length,
        clicks: list.filter((e) => e.type === "click").length,
        onboarding: list.some((e) => e.type === "onboarding_step"),
        finished:
          list.some((e) => e.type === "onboarding_step") &&
          list.some((e) => e.type === "page_view" && !e.path.startsWith("/onboarding")),
        last: views.at(-1)?.path ?? "-",
      };
    })
    .sort((a, b) => b.start.getTime() - a.start.getTime());
}

const pathOnly = (p: string) => p.split("?")[0];

function pageStats(events: UtEvent[]) {
  const stats = new Map<string, { views: number; ms: number; leaves: number }>();
  const get = (p: string) => stats.get(p) ?? stats.set(p, { views: 0, ms: 0, leaves: 0 }).get(p)!;
  for (const e of events) {
    if (e.type === "page_view") get(pathOnly(e.path)).views += 1;
    if (e.type === "page_leave") {
      const v = e.value as { path: string; ms: number };
      const s = get(pathOnly(v.path));
      s.ms += v.ms;
      s.leaves += 1;
    }
  }
  return [...stats.entries()]
    .map(([path, s]) => ({ path, views: s.views, avgMs: s.leaves ? s.ms / s.leaves : 0 }))
    .sort((a, b) => b.views - a.views);
}

function buttonStats(events: UtEvent[]) {
  const counts = new Map<string, { target: string; path: string; count: number }>();
  for (const e of events) {
    if (e.type !== "click") continue;
    const key = `${e.target}|${pathOnly(e.path)}`;
    const c = counts.get(key) ?? { target: e.target ?? "-", path: pathOnly(e.path), count: 0 };
    c.count += 1;
    counts.set(key, c);
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}

// 엑셀에서 한글이 깨지지 않게 BOM을 붙인다
function downloadCsv(events: UtEvent[], visits: Visit[]) {
  const order = new Map(visits.map((v, i) => [v.id, visits.length - i]));
  const cell = (s: unknown) => `"${String(s ?? "").replace(/"/g, '""')}"`;
  const head = ["관람객 번호", "session_id", "PC", "순서", "시각", "종류", "화면", "대상", "값"];
  const rows = events.map((e) =>
    [order.get(e.session_id), e.session_id, e.booth, e.seq, formatTime(new Date(e.at)), TYPE_LABEL[e.type] ?? e.type, e.path, e.target, e.value == null ? "" : JSON.stringify(e.value)]
      .map(cell)
      .join(","),
  );
  const blob = new Blob(["﻿" + [head.map(cell).join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `steadi-ut-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function formatMs(ms: number) {
  if (!Number.isFinite(ms) || ms < 0) return "-";
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}초` : `${Math.floor(s / 60)}분 ${s % 60}초`;
}

function formatTime(d: Date) {
  return d.toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-white p-[20px] shadow-soft">
      <p className="text-[13px] text-ink-sub">{label}</p>
      <p className="mt-[6px] text-[24px] font-bold">{value}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[20px] bg-white p-[20px] shadow-soft">
      <h2 className="mb-[12px] text-[16px] font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="max-h-[360px] overflow-y-auto">
      <table className="w-full text-left text-[13px]">
        <thead className="sticky top-0 bg-white text-ink-muted">
          <tr>
            {head.map((h) => (
              <th key={h} className="py-[6px] font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-line">
              {r.map((c, j) => (
                <td key={j} className="py-[6px] pr-[8px] break-all">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
