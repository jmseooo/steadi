import Link from "next/link";

// 경로 표시: 상위(링크) > 현재. Figma 화살표 5.5×10, 선 1.5 (#b9bbc0), 양옆 글자와 8.75px
export default function Breadcrumb({ parent, href, current }: { parent: string; href: string; current: string }) {
  return (
    <nav aria-label="경로" className="flex h-[19px] items-center text-[15px] leading-[19.5px] font-semibold">
      <Link href={href} className="text-disabled transition-colors hover:text-ink-sub">
        {parent}
      </Link>
      <svg width="8" height="12" viewBox="0 0 8 12" fill="none" className="mx-[8.75px] mt-[0.5px]" aria-hidden>
        <path d="M1.25 1.25L6.5 6.25L1.25 11.25" stroke="#B9BBC0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-ink-sub">{current}</span>
    </nav>
  );
}
