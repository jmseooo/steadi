import type { NewRawRecord } from "@/lib/model";

/*
 * 카카오톡 대화 내보내기(.txt) 파서 — 파일 내용을 원본 기록(NewRawRecord) 목록으로 바꾼다.
 * 결과는 그대로 저장 함수에 넘긴다:
 *
 *   const result = await saveRawRecords(parseKakao(text));
 *
 * 지금 읽는 형식: PC 내보내기
 *   밴드 동아리 님과 카카오톡 대화
 *   저장한 날짜 : 2026-10-28 22:14:05
 *
 *   --------------- 2026년 10월 13일 월요일 ---------------
 *   [민서] [오후 8:02] 다들 이번 주 합주 가능한 시간 적어줘!
 *
 * 시간은 한국 시간(+09:00)으로 읽는다. 카톡 시간은 분 단위까지라 초는 00이다.
 * 아직 읽지 않는 것 (다음 단계): 여러 줄 메시지의 둘째 줄부터, 아이폰·안드로이드 내보내기 형식.
 */

const TITLE_LINE = /^(.+?) 님과 카카오톡 대화$/;
const DATE_LINE = /^-+ (\d{4})년 (\d{1,2})월 (\d{1,2})일/;
const MESSAGE_LINE = /^\[(.+?)\] \[(오전|오후) (\d{1,2}):(\d{2})\] (.+)$/;

const pad = (n: string | number) => String(n).padStart(2, "0");

/**
 * 카톡 대화 파일 내용을 원본 기록 목록으로 바꾼다.
 * @param text 내보낸 .txt 파일 내용
 * @param sourceTitle 대화방 이름. 비우면 파일 첫 줄("밴드 동아리 님과 카카오톡 대화")에서 꺼낸다
 */
export function parseKakao(text: string, sourceTitle?: string): NewRawRecord[] {
  // 윈도우 PC에서 내보낸 파일은 줄 끝이 \r\n이고, 맨 앞에 BOM이 붙기도 한다
  const lines = text.replace(/^﻿/, "").split(/\r?\n/);

  const title = sourceTitle?.trim() || lines[0]?.trim().match(TITLE_LINE)?.[1]?.trim();
  if (!title) throw new Error("대화방 이름을 찾지 못했어요. 카카오톡에서 내보낸 대화 파일이 맞는지 확인해 주세요");

  const records: NewRawRecord[] = [];
  let date: string | null = null;
  for (const line of lines) {
    const d = line.match(DATE_LINE);
    if (d) {
      date = `${d[1]}-${pad(d[2])}-${pad(d[3])}`;
      continue;
    }
    const m = line.match(MESSAGE_LINE);
    if (!m || !date) continue;
    const [, author, ampm, hour, minute, body] = m;
    // 오전 12시 = 0시, 오후 12시 = 12시
    const h = (Number(hour) % 12) + (ampm === "오후" ? 12 : 0);
    records.push({
      source: "kakao",
      sourceTitle: title,
      author,
      text: body,
      at: `${date}T${pad(h)}:${minute}:00+09:00`,
    });
  }
  return records;
}
