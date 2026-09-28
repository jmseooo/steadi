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
    <header className="absolute inset-x-0 top-0 h-[70px] bg-[linear-gradient(to_bottom,var(--color-canvas)_70%,transparent)]">
      <Image
        src="/assets/logo.png"
        alt="Steadi"
        width={119}
        height={30}
        priority
        className="absolute top-[25.5px] left-[120px] h-[30px] w-auto"
      />

      <div className="absolute top-[18px] right-[50px] flex items-center gap-[25px]">
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

          <div className="flex h-[45px] w-[192px] items-center gap-[8px] rounded-[18px] bg-white pr-[12px] pl-[14px] shadow-soft">
            <ul className="flex">
              {APPS.map((app, i) => (
                <li key={app.alt} className={`relative size-[24px] ${i > 0 ? "-ml-[2px]" : ""}`}>
                  <Image
                    src={app.src}
                    alt={app.alt}
                    width={32}
                    height={32}
                    className="absolute -top-[4px] size-[32px] max-w-none"
                    style={{ left: -app.inset }}
                  />
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

        <Image
          src="/assets/profile.png"
          alt="프로필"
          width={35}
          height={35}
          className="size-[35px] rounded-[20px] shadow-soft"
        />
      </div>
    </header>
  );
}
