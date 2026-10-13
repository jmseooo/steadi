"use client";

import Image from "next/image";

const MENU = ["Home", "Project", "Growth", "Connection"] as const;

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
  return (
    <header className="sticky top-0 z-20 bg-canvas px-5">
      <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between">
        <div className="flex items-center gap-[80px]">
          {/* 로고를 누르면 페이지를 새로고침해 화면 상태를 처음으로 되돌린다 */}
          <button
            type="button"
            aria-label="Steadi 새로고침"
            onClick={() => window.location.reload()}
            className="block shrink-0"
          >
            <Image src="/assets/logo.png" alt="" width={96} height={22} priority className="h-[22px] w-[96.08px]" />
          </button>

          {/* 메뉴는 1024 이상에서만 (그 미만은 툴 묶음과 겹침) */}
          <nav className="max-lg:hidden">
            <ul className="flex items-center gap-[40px] font-wanted text-[16px] leading-[19.2px] font-medium">
              {MENU.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    aria-current={item === active ? "page" : undefined}
                    className={`transition-[color,scale] duration-300 ${
                      item === active ? "text-ink" : "text-disabled hover:text-ink-sub"
                    }`}
                  >
                    {item}
                  </button>
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
            <button type="button" aria-label="알림" className="block size-[36px]">
              <Image src="/assets/btn-bell.png" alt="" width={36} height={36} />
            </button>

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

          <button type="button" aria-label="프로필" className="block size-[32px]">
            <Image src="/assets/profile.png" alt="" width={32} height={32} className="size-[32px] rounded-[20px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
