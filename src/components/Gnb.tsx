"use client";

import Image from "next/image";

// 앱 아이콘 에셋은 24px 타일 + 왼쪽 그림자 여백을 포함한 32px 이미지 (inset = 타일 왼쪽 여백)
const APPS = [
  { src: "/assets/app-slack.png", alt: "Slack", inset: 6 },
  { src: "/assets/app-notion.png", alt: "Notion", inset: 8 },
  { src: "/assets/app-drive.png", alt: "Google Drive", inset: 8 },
  { src: "/assets/app-photos.png", alt: "사진", inset: 8 },
  { src: "/assets/app-calendar.png", alt: "캘린더", inset: 8 },
  { src: "/assets/app-kakao.png", alt: "카카오톡", inset: 8 },
];

export default function Gnb() {
  return (
    <header className="fixed inset-x-0 top-0 z-20 h-[70px] pt-[18px] bg-[linear-gradient(to_bottom,var(--color-canvas)_70%,transparent)] pr-(--pad-r) pl-(--pad-l)">
      <div className="flex h-[45px] items-center justify-between">
        {/* 로고를 누르면 페이지를 새로고침해 화면 상태를 처음으로 되돌린다 */}
        <button
          type="button"
          aria-label="Steadi 새로고침"
          onClick={() => window.location.reload()}
          className="block"
        >
          <Image src="/assets/logo.png" alt="" width={119} height={30} priority className="h-[30px] w-auto" />
        </button>

        <div className="flex items-center gap-[25px]">
          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              aria-label="설정"
              className="flex size-[45px] items-center justify-center rounded-[14px] bg-white shadow-soft"
            >
              <Image src="/assets/icon-settings.png" alt="" width={20} height={20} />
            </button>
            <button
              type="button"
              aria-label="알림"
              className="flex size-[45px] items-center justify-center rounded-[14px] bg-white shadow-soft"
            >
              <Image src="/assets/icon-bell.png" alt="" width={17} height={20} className="h-[20px] w-[17.01px]" />
            </button>

            {/* 툴 연결 묶음은 태블릿 이상에서만 (모바일 GNB 폭 부족) */}
            <div className="flex h-[45px] w-[192px] items-center gap-[8px] rounded-[18px] bg-white pr-[12px] pl-[14px] shadow-soft max-md:hidden">
              <ul className="flex">
                {APPS.map((app, i) => (
                  <li key={app.alt} className={i > 0 ? "-ml-[2px]" : ""}>
                    <button type="button" aria-label={app.alt} className="relative block size-[24px]">
                      <Image
                        src={app.src}
                        alt=""
                        width={32}
                        height={32}
                        className="pointer-events-none absolute -top-[4px] size-[32px] max-w-none"
                        style={{ left: -app.inset }}
                      />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                aria-label="툴 연결 추가"
                className="flex size-[24px] items-center justify-center rounded-[16px] bg-canvas"
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="overflow-visible" aria-hidden>
                  <path d="M0 4H8M4 0V8" stroke="#B9BBC0" />
                </svg>
              </button>
            </div>
          </div>

          <button type="button" aria-label="프로필" className="size-[35px] rounded-[20px] shadow-soft">
            <Image src="/assets/profile.png" alt="" width={35} height={35} className="size-[35px] rounded-[20px]" />
          </button>
        </div>
      </div>
    </header>
  );
}
