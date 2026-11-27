import "server-only";

import type { NewRawRecord } from "@/lib/model";

/*
 * 노션 연동 — 공개(OAuth) 통합 "Steadi" (민서 노션에 등록, 읽기 전용·이메일 없이).
 * 사용자가 노션 화면에서 고른 페이지만 읽을 수 있다. 페이지 하나 = 원본 기록 한 줄 (externalId = 페이지 id).
 *
 * 흐름: /api/notion/connect → 노션 허용 화면 → /api/notion/callback
 *      → 토큰 저장(save_connection) → 고른 페이지 읽기 → saveRawRecords
 */

const API = "https://api.notion.com/v1";
const VERSION = "2022-06-28";
const MAX_PAGES = 50; // 첫 동기화에서 읽을 최대 페이지 수 (무료 한도·시간 보호)
const MAX_DEPTH = 3; // 토글·하위 블록을 몇 단계까지 읽을지

export const NOTION_CALLBACK_PATH = "/api/notion/callback";

function clientCredentials() {
  const id = process.env.NOTION_CLIENT_ID;
  const secret = process.env.NOTION_CLIENT_SECRET;
  if (!id || !secret) throw new Error("NOTION_CLIENT_ID·NOTION_CLIENT_SECRET이 없어요 (.env.local)");
  return { id, secret };
}

export function notionAuthorizeUrl(redirectUri: string, state: string) {
  const url = new URL(`${API}/oauth/authorize`);
  url.searchParams.set("client_id", clientCredentials().id);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("owner", "user");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  return url.toString();
}

export type NotionToken = {
  access_token: string;
  refresh_token?: string | null;
  workspace_name?: string | null;
  expires_in?: number | null;
};

/** 노션이 돌려준 code를 접근 토큰으로 바꾼다 */
export async function exchangeNotionCode(code: string, redirectUri: string): Promise<NotionToken> {
  const { id, secret } = clientCredentials();
  const res = await fetch(`${API}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/json",
      "Notion-Version": VERSION,
    },
    body: JSON.stringify({ grant_type: "authorization_code", code, redirect_uri: redirectUri }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`노션 토큰 받기 실패: ${body.message ?? res.status}`);
  return body;
}

async function notion<T>(token: string, path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${API}${path}`, {
      method: init?.method ?? "GET",
      headers: { Authorization: `Bearer ${token}`, "Notion-Version": VERSION, "Content-Type": "application/json" },
      body: init?.body ? JSON.stringify(init.body) : undefined,
    });
    // 노션은 초당 3번 정도로 제한한다. 429면 알려 준 시간만큼 쉬고 다시
    if (res.status === 429 && attempt < 3) {
      await new Promise((r) => setTimeout(r, Number(res.headers.get("retry-after") ?? 1) * 1000));
      continue;
    }
    const body = await res.json();
    if (!res.ok) throw new Error(`노션 API 실패 ${path}: ${body.message ?? res.status}`);
    return body as T;
  }
}

type RichText = { plain_text: string };
type NotionPage = {
  id: string;
  url: string;
  last_edited_time: string;
  in_trash?: boolean;
  archived?: boolean;
  properties: Record<string, { type: string; title?: RichText[] }>;
};
type NotionBlock = { id: string; type: string; has_children: boolean } & Record<string, unknown>;

const plain = (rt?: RichText[]) => (rt ?? []).map((t) => t.plain_text).join("");

export function pageTitle(page: NotionPage) {
  const prop = Object.values(page.properties).find((p) => p.type === "title");
  return plain(prop?.title).trim() || "제목 없음";
}

/** 사용자가 허용한 페이지 목록 (최근 수정 순, 최대 MAX_PAGES) */
export async function listNotionPages(token: string): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion<{ results: NotionPage[]; has_more: boolean; next_cursor: string | null }>(token, "/search", {
      method: "POST",
      body: {
        filter: { property: "object", value: "page" },
        sort: { direction: "descending", timestamp: "last_edited_time" },
        page_size: 100,
        ...(cursor ? { start_cursor: cursor } : {}),
      },
    });
    pages.push(...res.results.filter((p) => !p.in_trash && !p.archived));
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor && pages.length < MAX_PAGES);
  return pages.slice(0, MAX_PAGES);
}

// 블록 하나의 글자. 목록·할 일은 앞에 표시를 붙여 AI가 구조를 알 수 있게
function blockLine(b: NotionBlock): string {
  const data = b[b.type] as { rich_text?: RichText[]; checked?: boolean; title?: string } | undefined;
  if (b.type === "child_page") return `[하위 페이지] ${data?.title ?? ""}`;
  const text = plain(data?.rich_text);
  if (!text) return "";
  switch (b.type) {
    case "heading_1": return `# ${text}`;
    case "heading_2": return `## ${text}`;
    case "heading_3": return `### ${text}`;
    case "bulleted_list_item": return `- ${text}`;
    case "numbered_list_item": return `1. ${text}`;
    case "to_do": return `${data?.checked ? "[x]" : "[ ]"} ${text}`;
    case "quote": return `> ${text}`;
    default: return text;
  }
}

/** 페이지 본문을 글자로 (하위 블록은 MAX_DEPTH 단계까지, 하위 페이지는 제목만) */
export async function notionPageText(token: string, blockId: string, depth = 0): Promise<string> {
  const lines: string[] = [];
  let cursor: string | undefined;
  do {
    const res = await notion<{ results: NotionBlock[]; has_more: boolean; next_cursor: string | null }>(
      token,
      `/blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`,
    );
    for (const b of res.results) {
      const line = blockLine(b);
      if (line) lines.push("  ".repeat(depth) + line);
      if (b.has_children && b.type !== "child_page" && b.type !== "child_database" && depth < MAX_DEPTH) {
        const inner = await notionPageText(token, b.id, depth + 1);
        if (inner) lines.push(inner);
      }
    }
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);
  return lines.join("\n");
}

/** 허용된 페이지를 모두 읽어 원본 기록으로. 본문이 빈 페이지는 뺀다 */
export async function readNotionRecords(token: string) {
  const pages = await listNotionPages(token);
  const records: NewRawRecord[] = [];
  for (const page of pages) {
    const text = await notionPageText(token, page.id);
    if (!text.trim()) continue;
    records.push({
      source: "notion",
      sourceTitle: pageTitle(page),
      url: page.url,
      externalId: page.id,
      text,
      at: page.last_edited_time,
    });
  }
  return { pages, records };
}
