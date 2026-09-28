import Image from "next/image";

const ITEMS = [
  { label: "성장", active: true },
  { label: "연결", active: false },
];

export default function SideNav() {
  return (
    <nav className="ml-[35px] flex flex-col gap-[15px]">
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
