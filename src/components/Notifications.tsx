"use client";

import { useState } from "react";

// GNB 알림 드롭다운 (Figma "알림" 152:3198): 스테디 · 프로젝트 · 시스템 탭, 알림 줄은 호버 시 회색 배경
// 출처(source)는 [앱 이름, 세부, 앱 이름, 세부…] 순서. 앱 이름은 Regular, 세부는 Medium
type Noti = { source: string[]; time: string; title: string; desc: string; unread?: true };

const TABS = ["스테디", "프로젝트", "시스템"] as const;

const NOTIS: Record<(typeof TABS)[number], Noti[]> = {
  스테디: [
    {
      source: ["Notion", "‘전략안’ &", "Discord", "‘공연 준비’ 채널"],
      time: "14:00",
      title: "성장의 순간 감지",
      desc: "비슷한 순간이 예전에도 있었어요",
      unread: true,
    },
    { source: ["Discord", "‘공연 준비’ 채널"], time: "2일전", title: "새 경험 카드 생성", desc: "새로운 경험 카드가 생성되었어요", unread: true },
    { source: ["Notion", "‘마케팅 아이디어’"], time: "7일 전", title: "방향 이탈 감지", desc: "비슷한 순간이 예전에도 있었어요", unread: true },
    { source: ["Discord", "‘공연 준비’ 채널"], time: "9/29", title: "피드백 감지", desc: "프로젝트 피드백이 도착했어요", unread: true },
  ],
  프로젝트: [
    { source: ["Google Drive", "‘밴드동아리’ 사진첩"], time: "어제", title: "사진 기록", desc: "밴드 공연 사진이 새롭게 쌓였어요", unread: true },
    {
      source: ["Notion", "‘공모전’ 워크스페이스"],
      time: "7일 전",
      title: "프로젝트 문서 생성",
      desc: "새로운 프로젝트 문서가 생성되었어요",
      unread: true,
    },
    { source: ["Calendar", "‘공모전’"], time: "10/15", title: "일정 마감", desc: "오늘 마감 예정인 주요 작업이 있어요" },
    { source: ["Discord", "‘공연 준비’ 채널"], time: "10/1", title: "팀원 변동", desc: "밴드 프로젝트에서 팀원 변동이 생겼어요" },
  ],
  시스템: [
    { source: ["Notion", "연결 일시 해제"], time: "3일전", title: "권한 만료", desc: "노션 연결이 일시적으로 해제되었어요", unread: true },
    { source: ["Discord", "데이터 동기화 지연"], time: "10/1", title: "동기화 지연", desc: "디스코드 데이터 동기화가 지연되고 있어요" },
    { source: ["Steadi", "의 새로운 기능 업데이트"], time: "9/30", title: "기능 업데이트", desc: "스테디의 새로운 기능이 업데이트 되었어요" },
  ],
};

// 410×431 흰 패널. 알림 버튼 기준 왼쪽 -105 · 위 53 (Figma 프레임에서 버튼 1048,12 → 패널 943,65)
// 닫아도 패널은 남겨 둬서 고른 탭·읽음 표시가 유지된다
export default function NotificationPanel({ open }: { open: boolean }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("스테디");
  const [read, setRead] = useState<string[]>([]); // 누른 알림은 빨간 점을 지운다

  return (
    <div
      id="notifications"
      role="dialog"
      aria-label="알림"
      inert={!open}
      className={`absolute top-[53px] -left-[105px] z-40 flex h-[431px] w-[410px] origin-top flex-col gap-[10px] rounded-[36px] bg-white px-[22px] py-[24px] shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-[opacity,translate] duration-200 ease-out ${
        open ? "" : "pointer-events-none -translate-y-[6px] opacity-0"
      }`}
    >
      <div className="flex flex-col gap-[8px] px-[4px]">
        <h2 className="px-[6px] text-[18px] leading-[27px] font-semibold">알림</h2>
        <div role="tablist" className="flex gap-[8px]">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={t === tab}
              onClick={() => setTab(t)}
              className={`h-[34px] rounded-[20px] px-[12px] text-[13px] leading-[16.9px] font-semibold transition-[background-color,color,scale] duration-200 ${
                t === tab ? "bg-ink text-white" : "border border-line bg-white text-ink-sub"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <ul className="noti-scroll -mr-[14px] flex-1 overflow-y-auto pr-[14px]">
        {NOTIS[tab].map((n) => {
          const key = `${tab}:${n.title}`;
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => setRead((r) => (r.includes(key) ? r : [...r, key]))}
                className="flex w-full flex-col rounded-[16px] px-[16px] py-[12px] text-left transition-colors duration-200 hover:scale-100 hover:bg-canvas"
              >
                <span className="flex w-full justify-between text-[11px] leading-[14.3px] text-disabled">
                  <span className="flex gap-[2px]">
                    {n.source.map((s, i) => (
                      <span key={i} className={i % 2 ? "font-medium" : ""}>
                        {s}
                      </span>
                    ))}
                  </span>
                  <span className="flex gap-[8px] font-medium">
                    {n.time}
                    <span
                      aria-label={n.unread && !read.includes(key) ? "읽지 않음" : undefined}
                      className={`size-[5px] rounded-full bg-[#ff4a65] ${n.unread && !read.includes(key) ? "" : "invisible"}`}
                    />
                  </span>
                </span>
                <span className="text-[14px] leading-[21px] font-semibold">{n.title}</span>
                <span className="text-[12px] leading-[16.8px] font-medium text-ink-sub">{n.desc}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
