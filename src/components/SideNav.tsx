import Image from "next/image";

const ITEMS = [
  { label: "성장", active: true },
  { label: "연결", active: false },
];

// 데스크톱: 화면 왼쪽 세로 가운데 / 1024 미만: 화면 아래 가로 바
export default function SideNav() {
  return (
    <nav className="fixed z-20 flex gap-[15px] max-lg:inset-x-0 max-lg:bottom-0 max-lg:justify-center max-lg:bg-[linear-gradient(to_top,var(--color-canvas)_70%,transparent)] max-lg:pt-[16px] max-lg:pb-[max(16px,env(safe-area-inset-bottom))] lg:top-1/2 lg:left-[35px] lg:-translate-y-1/2 lg:flex-col">
      <button type="button" aria-label="홈" className="size-[50px] rounded-[15px] shadow-soft">
        <Image src="/assets/nav-home.png" alt="" width={50} height={50} />
      </button>
      {ITEMS.map(({ label, active }) => (
        <button
          key={label}
          type="button"
          aria-current={active ? "page" : undefined}
          className={`size-[50px] rounded-[15px] text-[15px] leading-[1.4] font-medium shadow-soft ${
            active ? "bg-ink text-white" : "bg-white text-ink-muted"
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
