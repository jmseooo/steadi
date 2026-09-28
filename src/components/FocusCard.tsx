// 12시 방향(가운데) 카드의 요약 정보
const TAGS = ["공모전", "학교", "밴드동아리"];

export default function FocusCard() {
  return (
    <>
      <ul className="absolute top-[526px] left-[670px] flex h-[33px] w-[171px] items-center justify-center gap-[8px] whitespace-nowrap rounded-[16px] bg-ink/5 px-[12px] text-[13px] leading-[1.3] font-semibold text-ink-sub">
        {TAGS.map((tag, i) => (
          <li key={tag} className="flex items-center gap-[8px]">
            {i > 0 && <span className="h-[10px] w-px bg-ink-sub" aria-hidden />}
            {tag}
          </li>
        ))}
      </ul>

      <h2 className="absolute top-[571px] left-[610px] w-[290px] text-center text-[24px] leading-[1.36] font-bold whitespace-pre-line text-ink">
        {"정답이 보이지 않을 때,\n먼저 기준부터 세우는 편이에요"}
      </h2>

      <p className="absolute top-[649px] left-[610px] w-[290px] text-center text-[15px] leading-[1.3] font-semibold text-ink-sub">
        82% 확신
      </p>

      <button
        type="button"
        className="absolute top-[698px] left-[687px] flex h-[46px] w-[136px] items-center justify-center gap-[8px] rounded-[30px] bg-ink py-[8px] pr-[8px] pl-[16px] text-[16px] leading-[1.3] font-bold text-white shadow-soft"
      >
        자세히 보기
        <span className="relative size-[30px] shrink-0 rounded-full bg-white">
          <svg
            width="11.786"
            height="10.714"
            viewBox="0 0 11.786 10.714"
            fill="none"
            className="absolute top-[9.64px] left-[9.64px] overflow-visible"
            aria-hidden
          >
            <path
              d="M0 5.357H11.786M11.786 5.357L6.744 0M11.786 5.357L6.744 10.714"
              stroke="#1A1A1A"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
    </>
  );
}
