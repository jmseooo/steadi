import "server-only";

import { SOURCE_NAME, type RawRecord } from "@/lib/model";

/*
 * 원본 기록을 프롬프트에 넣는 모양으로. DB id(uuid)는 길어서 토큰을 낭비하므로 r1, r2 … 짧은 id로 바꿔 보내고,
 * AI가 돌려준 recordIds를 다시 DB id로 되돌린다. 없는 id는 버린다 (지어낸 근거 막기).
 */

const MAX_CHARS = 1500; // 기록 하나당 프롬프트에 넣는 글자 (노션 긴 페이지 보호)

export function promptRecords(records: RawRecord[]) {
  const toDb = new Map<string, string>();
  const lines = records.map((r, i) => {
    const short = `r${i + 1}`;
    toDb.set(short, r.id);
    const where = `${SOURCE_NAME[r.source]} ‘${r.sourceTitle}’`;
    const text = r.text.length > MAX_CHARS ? r.text.slice(0, MAX_CHARS) + "…" : r.text;
    return `${short} | ${r.at.slice(0, 16)} | ${where}${r.author ? ` | ${r.author}` : ""} | ${text.replace(/\n/g, " / ")}`;
  });
  return {
    text: lines.join("\n"),
    /** AI가 준 짧은 id → DB id. 없는 id는 빠진다 */
    toDbIds: (ids: string[]) => [...new Set(ids)].map((id) => toDb.get(id)).filter((id): id is string => Boolean(id)),
  };
}
