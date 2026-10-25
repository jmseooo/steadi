"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import NotificationPanel from "./Notifications";
import { ProfileMenu, ProfileModal, type ProfileTab } from "./Profile";

const MENU = ["Home", "Project", "Growth", "Connection"] as const;
// 화면이 있는 메뉴만 링크 (나머지는 화면 생기면 연결)
const HREF: Partial<Record<(typeof MENU)[number], string>> = {
  Home: "/",
  Project: "/projects",
  Growth: "/growth",
  Connection: "/connection",
};

// 앱 아이콘 에셋은 24px 타일 + 그림자 여백을 포함한 32px 이미지 → 22px 타일에 맞춰 22/24로 축소 (inset = 타일 왼쪽 여백)
const APPS = [
  { src: "/assets/app-slack.png", alt: "Slack", inset: 5.5 },
  { src: "/assets/app-notion.png", alt: "Notion", inset: 7.33 },
  { src: "/assets/app-drive.png", alt: "Google Drive", inset: 7.33 },
  { src: "/assets/app-photos.png", alt: "사진", inset: 7.33 },
  { src: "/assets/app-calendar.png", alt: "캘린더", inset: 7.33 },
  { src: "/assets/app-kakao.png", alt: "카카오톡", inset: 7.33 },
];

export default function Gnb({ active }: { active: (typeof MENU)[number] }) {
  const [notiOpen, setNotiOpen] = useState(false);
  const notiRef = useRef<HTMLDivElement>(null);
  useDismiss(notiOpen, notiRef, () => setNotiOpen(false));

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useDismiss(menuOpen, menuRef, () => setMenuOpen(false));
  const [profileTab, setProfileTab] = useState<ProfileTab | null>(null); // 설정 창에서 연 탭 (null = 닫힘)
  const closeProfile = useCallback(() => setProfileTab(null), []);

  return (
    <header className="sticky top-0 z-20 bg-canvas px-5">
      <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between">
        <div className="flex items-center gap-[80px]">
          {/* 로고를 누르면 홈으로. 이미 홈이면 새로고침해 화면 상태를 처음으로 되돌린다 */}
          <Link
            href="/"
            aria-label="Steadi 홈"
            onClick={(e) => {
              if (window.location.pathname !== "/") return;
              e.preventDefault();
              window.location.reload();
            }}
            className="block shrink-0 transition-[scale] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-108"
          >
            <Image src="/assets/logo.png" alt="" width={96} height={22} priority className="h-[22px] w-[96.08px]" />
          </Link>

          {/* 메뉴는 1024 이상에서만 (그 미만은 툴 묶음과 겹침) */}
          <nav className="max-lg:hidden">
            <ul className="flex items-center gap-[40px] font-wanted text-[16px] leading-[19.2px] font-medium">
              {MENU.map((item) => (
                <li key={item}>
                  {HREF[item] ? (
                    <Link
                      href={HREF[item]}
                      aria-current={item === active ? "page" : undefined}
                      className={`block hover:scale-108 ${menuClass(item === active)}`}
                    >
                      {item}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      aria-current={item === active ? "page" : undefined}
                      className={menuClass(item === active)}
                    >
                      {item}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-[20px]">
          <div className="flex items-center gap-[10px]">
            {/* 설정·알림 에셋은 흰 배경 버튼까지 포함한 이미지 */}
            <button type="button" aria-label="설정" className="block size-[36px]">
              <Image src="/assets/btn-settings.png" alt="" width={36} height={36} />
            </button>
            <div ref={notiRef} className="relative">
              <button
                type="button"
                aria-label="알림"
                aria-expanded={notiOpen}
                aria-controls="notifications"
                onClick={() => setNotiOpen((o) => !o)}
                className="block size-[36px]"
              >
                <Image src="/assets/btn-bell.png" alt="" width={36} height={36} />
              </button>
              <NotificationPanel open={notiOpen} />
            </div>

            {/* 툴 연결 묶음은 태블릿 이상에서만 (모바일 GNB 폭 부족). 아이콘마다 따로 호버 확대 */}
            <div className="flex h-[36px] items-center gap-[8px] rounded-[10px] bg-white pr-[10px] pl-[12px] max-md:hidden">
              <ul className="flex">
                {APPS.map((app, i) => (
                  <li key={app.alt} className={i > 0 ? "-ml-[2px]" : ""}>
                    <button type="button" aria-label={app.alt} className="relative block size-[22px]">
                      <Image
                        src={app.src}
                        alt=""
                        width={29}
                        height={29}
                        className="pointer-events-none absolute -top-[3.67px] size-[29.33px] max-w-none"
                        style={{ left: -app.inset }}
                      />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                aria-label="툴 연결 추가"
                className="flex size-[22px] items-center justify-center rounded-[16px] bg-canvas"
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="overflow-visible" aria-hidden>
                  <path d="M0 4H8M4 0V8" stroke="#B9BBC0" />
                </svg>
              </button>
            </div>
          </div>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-label="프로필"
              aria-expanded={menuOpen}
              aria-controls="profile-menu"
              onClick={() => setMenuOpen((o) => !o)}
              className="block size-[32px]"
            >
              <Image src="/assets/profile.png" alt="" width={32} height={32} className="size-[32px] rounded-[20px]" />
            </button>
            <ProfileMenu
              open={menuOpen}
              onSelect={(tab) => {
                setMenuOpen(false);
                setProfileTab(tab);
              }}
            />
          </div>
          <ProfileModal tab={profileTab} onTab={setProfileTab} onClose={closeProfile} />
        </div>
      </div>
    </header>
  );
}

// 열린 패널·메뉴: 바깥을 누르거나 Esc로 닫힘
function useDismiss(open: boolean, ref: RefObject<HTMLElement | null>, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, ref, close]);
}

// 링크는 버튼 기본 호버(globals.css)가 안 걸려 hover:scale-108을 따로 준다
const menuClass = (active: boolean) =>
  `transition-[color,scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
    active ? "text-ink" : "text-disabled hover:text-ink-sub"
  }`;
