"use client";

import Image from "next/image";
import { useState } from "react";
import Modal from "./Modal";

// 프로필 (Figma "프로필" 153:4984): GNB 프로필 사진을 누르면 메뉴(153:5823),
// 메뉴에서 프로필·서비스 연결·알림 설정을 누르면 설정 창(800×650)이 그 탭으로 열린다
export type ProfileTab = "프로필" | "서비스 연결" | "알림 설정";

const NAME = "김다은";
const EMAIL = "Steadi20261027@gmail.com";

// 350×335 메뉴. 프로필 버튼 기준 왼쪽 -302 · 위 51 (Figma 프레임에서 버튼 1288,14 → 메뉴 986,65)
export function ProfileMenu({ open, onSelect }: { open: boolean; onSelect: (tab: ProfileTab) => void }) {
  const item = "w-fit text-[14px] leading-[20.3px] text-ink-muted transition-colors duration-200 hover:scale-100 hover:text-ink";
  return (
    <div
      id="profile-menu"
      role="menu"
      inert={!open}
      className={`absolute top-[51px] -left-[302px] z-40 w-[350px] flex-col gap-[15px] rounded-[36px] bg-white/95 px-[30px] pt-[26px] pb-[28px] shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-[opacity,translate,display] transition-discrete duration-200 ease-out ${
        open ? "flex starting:-translate-y-[6px] starting:opacity-0" : "hidden -translate-y-[6px] opacity-0"
      }`}
    >
      <div className="flex flex-col gap-[4px]">
        <p className="text-[18px] leading-[26.1px] font-bold">{NAME}</p>
        <p className="text-[14px] leading-[20.3px] text-ink-muted">{EMAIL}</p>
      </div>
      <hr className="mx-[13px] border-toggle" />
      <div className="flex flex-col gap-[8px]">
        <p className="text-[16px] leading-[23.2px] font-semibold">내 프로필</p>
        <button type="button" role="menuitem" className={item} onClick={() => onSelect("프로필")}>
          프로필
        </button>
      </div>
      <div className="flex flex-col gap-[8px]">
        <p className="text-[16px] leading-[23.2px] font-semibold">설정</p>
        <button type="button" role="menuitem" className={item} onClick={() => onSelect("서비스 연결")}>
          서비스 연결
        </button>
        <button type="button" role="menuitem" className={item} onClick={() => onSelect("알림 설정")}>
          알림 설정
        </button>
        {/* 로그아웃·회원 탈퇴는 화면 미정 */}
        <button type="button" role="menuitem" className={item}>
          로그아웃
        </button>
        <button type="button" role="menuitem" className={item}>
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}

// 설정 창: 왼쪽 탭, 오른쪽 내용 (틀은 Modal)
export function ProfileModal({ tab, onTab, onClose }: { tab: ProfileTab | null; onTab: (t: ProfileTab) => void; onClose: () => void }) {
  if (tab === null) return null;
  return (
    <Modal label={tab} onClose={onClose}>
      <nav className="box-content flex w-[175px] shrink-0 flex-col gap-[15px] pt-[37px] pl-[35px]">
        <div className="flex flex-col gap-[12px]">
          <h2 className="px-[8px] text-[22px] leading-[32px] font-semibold">내 프로필</h2>
          <TabButton tab="프로필" current={tab} onTab={onTab} />
        </div>
        <div className="flex flex-col gap-[12px]">
          <h2 className="px-[8px] text-[18px] leading-[26px] font-semibold">설정</h2>
          <div className="flex flex-col">
            <TabButton tab="서비스 연결" current={tab} onTab={onTab} />
            <TabButton tab="알림 설정" current={tab} onTab={onTab} />
          </div>
        </div>
      </nav>

      <div className={`min-w-0 flex-1 overflow-y-auto pt-[37px] pb-[42px] ${tab === "프로필" ? "pr-[45px] pl-[35px]" : "pr-[40px] pl-[40px]"}`}>
        {tab === "프로필" && <ProfileTabView />}
        {tab === "서비스 연결" && <ServicesTabView />}
        {tab === "알림 설정" && <AlertsTabView />}
      </div>
    </Modal>
  );
}

function TabButton({ tab, current, onTab }: { tab: ProfileTab; current: ProfileTab; onTab: (t: ProfileTab) => void }) {
  const active = tab === current;
  return (
    <button
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={() => onTab(tab)}
      className={`h-[40px] rounded-[12px] px-[14px] text-left text-[14px] leading-[21px] font-medium transition-colors duration-200 hover:scale-100 ${
        active ? "bg-toggle text-ink" : "text-ink-muted hover:text-ink"
      }`}
    >
      {tab}
    </button>
  );
}

const Heading = ({ title, desc }: { title: string; desc?: string }) => (
  <div className="flex flex-col gap-[5px]">
    <h3 className="text-[18px] leading-[26.1px] font-semibold">{title}</h3>
    {desc && <p className="text-[15px] leading-[21.75px] font-medium text-ink-sub">{desc}</p>}
  </div>
);

function ProfileTabView() {
  return (
    <div className="flex flex-col gap-[25px]">
      <Heading title="프로필" />
      <div className="relative size-[90px]">
        <Image src="/assets/profile/photo.png" alt="프로필 사진" width={91} height={91} className="size-[91px] max-w-none" />
        <button type="button" aria-label="프로필 사진 바꾸기" className="absolute top-[67px] left-[67px] size-[24px]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="0.25" y="0.25" width="23.5" height="23.5" rx="11.75" fill="white" stroke="#EBEDEF" strokeWidth="0.5" />
            <path d="M10.47 12.35a1.74 1.74 0 1 1 3.48 0 1.74 1.74 0 0 1-3.48 0Z" fill="#B9BBC0" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              fill="#B9BBC0"
              d="M8.71 8.21a2.43 2.43 0 0 1 2.43-2.43h2.14a2.43 2.43 0 0 1 2.43 2.43l1.74.16c.77.06 1.4.63 1.55 1.4.37 1.94.39 3.93.08 5.88l-.07.47a2 2 0 0 1-1.76 1.62l-1.5.12c-2.36.19-4.73.19-7.08 0l-1.5-.12a2 2 0 0 1-1.75-1.62l-.08-.47c-.31-1.95-.29-3.94.08-5.88a1.73 1.73 0 0 1 1.55-1.4l1.74-.16Zm3.5 1.24a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Z"
            />
          </svg>
        </button>
      </div>
      <Field label="이름" defaultValue={NAME} />
      <Field label="이메일" defaultValue={EMAIL} type="email" regular />
    </div>
  );
}

function Field({ label, defaultValue, type = "text", regular }: { label: string; defaultValue: string; type?: string; regular?: boolean }) {
  return (
    <label className="flex flex-col gap-[5px]">
      <span className="px-[10px] text-[13px] leading-[19.5px] font-medium text-ink-muted">{label}</span>
      <input
        type={type}
        defaultValue={defaultValue}
        className={`h-[47px] rounded-[14px] border border-line bg-transparent px-[14px] text-[14px] leading-[21px] outline-none focus:border-ink-muted ${
          regular ? "" : "font-medium"
        }`}
      />
    </label>
  );
}

// 50×28 스위치: 켜짐 검정 바탕·흰 손잡이 오른쪽, 꺼짐 #d8dade 바탕·손잡이 왼쪽
function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-[28px] w-[50px] shrink-0 rounded-[21px] transition-colors duration-200 hover:scale-100 ${on ? "bg-ink" : "bg-line"}`}
    >
      <span
        className="absolute top-[3px] left-[3px] size-[22px] rounded-full bg-white shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-[translate] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ translate: on ? "22px 0" : "0 0" }}
      />
    </button>
  );
}

const Divider = () => <hr className="mx-[17px] border-toggle" />;

type Service = { key: string; name: string; medium?: true; state: "on" | "off" | "check" };
const SERVICES: Service[] = [
  { key: "kakao", name: "카카오톡", medium: true, state: "on" },
  { key: "notion", name: "Notion", state: "on" },
  { key: "calendar", name: "캘린더", medium: true, state: "on" },
  { key: "drive", name: "Google Drive", state: "off" },
  { key: "slack", name: "Slack", state: "check" },
];

function ServicesTabView() {
  const [on, setOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(SERVICES.map((s) => [s.key, s.state === "on"])),
  );
  return (
    <div className="flex h-full flex-col justify-between gap-[25px]">
      <div className="flex flex-col gap-[25px]">
        <Heading title="서비스 연결" desc="연결된 서비스에서 프로젝트 기록을 불러와요" />
        <ul className="flex flex-col gap-[16px]">
          {SERVICES.map((s) => (
            <li key={s.key} className="flex flex-col gap-[16px]">
              <div className="flex items-center justify-between gap-[5px]">
                <div className="flex items-center gap-[18px]">
                  <Image src={`/assets/profile/svc-${s.key}.png`} alt="" width={42} height={42} className="size-[42px] rounded-[12px]" />
                  <div className="flex flex-col gap-[2px]">
                    <p className={`text-[15px] leading-[22.5px] ${s.medium ? "font-medium" : ""}`}>{s.name}</p>
                    {s.state === "check" ? (
                      <p className="text-[14px] leading-[21px] text-[#ff4a65]">연결 확인 필요</p>
                    ) : (
                      <p className="text-[14px] leading-[21px] text-ink-muted">{on[s.key] ? "연결됨" : "연결 해제됨"}</p>
                    )}
                  </div>
                </div>
                {s.state === "check" ? (
                  <button
                    type="button"
                    className="h-[32px] rounded-[10px] bg-disabled px-[12px] text-[13px] leading-[19.5px] font-semibold text-white"
                  >
                    다시 연결
                  </button>
                ) : (
                  <Toggle label={`${s.name} 연결`} on={on[s.key]} onChange={(v) => setOn((o) => ({ ...o, [s.key]: v }))} />
                )}
              </div>
              <Divider />
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        className="flex h-[36px] items-center gap-[10px] self-end rounded-[10px] bg-ink-sub px-[16px] text-[14px] leading-[19.6px] font-semibold text-white"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M0 5H10M5 0V10" stroke="white" strokeWidth="1.2" />
        </svg>
        새 서비스 연결하기
      </button>
    </div>
  );
}

const ALERTS = [
  { title: "프로젝트 주요 변경", desc: "일정이나 진행 조건 등 프로젝트에 영향을 주는 변화를 찾으면 알려드려요", on: true },
  { title: "새로운 경험 연결", desc: "여러 경험에서 비슷한 행동 방식을 발견하면 알려드려요", on: true },
  { title: "새로운 피드백", desc: "연결한 서비스에서 프로젝트 관련 피드백을 찾으면 알려드려요", on: false },
];

function AlertsTabView() {
  const [on, setOn] = useState(() => ALERTS.map((a) => a.on));
  return (
    <div className="flex flex-col gap-[25px]">
      <Heading title="알림 설정" desc="알림으로 받을 내용을 선택해 주세요" />
      <ul className="flex flex-col gap-[18px]">
        {ALERTS.map((a, i) => (
          <li key={a.title} className="flex flex-col gap-[18px]">
            <div className="flex items-center justify-between gap-[5px]">
              <div className="flex flex-col gap-[2px]">
                <p className="text-[15px] leading-[22.5px] font-medium">{a.title}</p>
                <p className="text-[14px] leading-[21px] text-ink-muted">{a.desc}</p>
              </div>
              <Toggle label={a.title} on={on[i]} onChange={(v) => setOn((o) => o.map((x, j) => (j === i ? v : x)))} />
            </div>
            {i < ALERTS.length - 1 && <Divider />}
          </li>
        ))}
      </ul>
    </div>
  );
}
