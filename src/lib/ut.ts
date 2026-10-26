// 졸전 UT 기록: 관람객이 남긴 흔적(화면 이동·클릭·입력)을 Supabase ut_events 테이블에 쌓는다.
// 체험 한 번 = session 하나.
// - 부스 PC(?booth=N 으로 한 번 연 PC): 3분 동안 조작이 없거나 회원가입 화면으로 새로 들어오면 앞사람을 끝내고,
//   그다음 첫 클릭·입력부터 새 session. 그 사이 화면 기록은 들고 있다가 새 session에 붙인다.
// - 그 밖의 기기: 온보딩 첫 화면(회원가입)이 뜰 때마다 새 session.
// 환경 변수가 없으면(로컬 등) 아무것도 보내지 않는다.

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const SESSION_KEY = "steadi:ut-session";
const BOOTH_KEY = "steadi:ut-booth";
// 관람객이 직접 한 행동 — 부스 PC에서 새 session을 여는 계기
const ACTIONS = new Set(["click", "input", "goal_chat"]);

type Session = { id: string; seq: number };
type Event = {
  session_id: string;
  booth: string | null;
  seq: number;
  type: string;
  path: string;
  target: string | null;
  value: unknown;
  at: string;
};
type Held = Omit<Event, "session_id" | "booth" | "seq">;

let session: Session | null = null;
let held: Held[] = []; // 부스 PC에서 다음 관람객이 아직 아무것도 누르지 않았을 때의 기록
let queue: Event[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function read<T>(key: string): T | null {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}
function write(key: string, v: unknown) {
  try {
    if (v == null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}

// 부스 PC 번호: 주소에 ?booth=1 을 한 번 붙여 열면 그 PC에 기억된다
export function booth(): string | null {
  if (typeof window === "undefined") return null;
  const fromUrl = new URLSearchParams(location.search).get("booth");
  if (fromUrl) write(BOOTH_KEY, fromUrl);
  return fromUrl ?? read<string>(BOOTH_KEY);
}

// 부스 PC는 session이 없으면(처음 켰거나 초기화 직후) 다음 행동까지 기다린다
function current(): Session | null {
  session ??= read<Session>(SESSION_KEY) ?? (booth() ? null : { id: crypto.randomUUID(), seq: 0 });
  return session;
}

export const hasSession = () => current() !== null;

export function startSession() {
  flush();
  session = { id: crypto.randomUUID(), seq: 0 };
  write(SESSION_KEY, session);
  track("session_start", { value: { ua: navigator.userAgent, screen: `${innerWidth}x${innerHeight}` } });
}

// 부스 PC 초기화: 지금 관람객을 끝내고, 다음 행동이 올 때까지 새 session을 열지 않는다
export function endSession(reason: string) {
  track("session_end", { target: reason });
  flush();
  session = null;
  held = [];
  write(SESSION_KEY, null);
}

export function track(type: string, { target, value }: { target?: string; value?: unknown } = {}) {
  if (!URL || !KEY || typeof window === "undefined") return;
  const event: Held = {
    type,
    path: location.pathname + location.search,
    target: target?.slice(0, 200) ?? null,
    value: value ?? null,
    at: new Date().toISOString(),
  };
  if (!current()) {
    if (!ACTIONS.has(type)) {
      held.push(event);
      return;
    }
    // 다음 관람객의 첫 행동: 새 session을 열고, 기다리던 화면 기록부터 붙인다.
    // 화면은 관람객이 오기 전부터 떠 있었으니 시각은 첫 행동 시각으로 맞춘다
    const waiting = held.filter((e) => e.type !== "page_leave");
    held = [];
    startSession();
    for (const e of waiting) push({ ...e, at: event.at });
  }
  push(event);
}

function push(e: Held) {
  const s = current()!;
  s.seq += 1;
  write(SESSION_KEY, s);
  queue.push({ ...e, session_id: s.id, booth: booth(), seq: s.seq });
  timer ??= setTimeout(flush, 2000);
}

// 모아 둔 기록을 한 번에 보낸다. 창을 닫는 중에도 전송되도록 keepalive
export function flush() {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!queue.length || !URL || !KEY) return;
  const body = JSON.stringify(queue);
  queue = [];
  fetch(`${URL}/rest/v1/ut_events`, {
    method: "POST",
    keepalive: true,
    headers: { apikey: KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
    body,
  }).catch(() => {});
}

// 관리자 페이지: 비밀번호가 맞으면 전체 기록
export type UtEvent = Event & { id: number; created_at: string };
export async function fetchEvents(password: string): Promise<UtEvent[]> {
  if (!URL || !KEY) throw new Error("Supabase 환경 변수가 없어요.");
  // Supabase는 한 번에 1000줄까지만 돌려줘서 나눠 받는다
  const PAGE = 1000;
  const all: UtEvent[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const res = await fetch(`${URL}/rest/v1/rpc/ut_admin_events?limit=${PAGE}&offset=${offset}`, {
      method: "POST",
      headers: { apikey: KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ pass: password }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text.includes("wrong password") ? "비밀번호가 맞지 않아요." : `불러오지 못했어요 (${res.status})`);
    }
    const rows: UtEvent[] = await res.json();
    all.push(...rows);
    if (rows.length < PAGE) return all;
  }
}
