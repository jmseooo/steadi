// 경험 카드 (160×160). 흰 카드 안에 색 레이어가 25px 간격으로 아래에서부터 쌓인다.

const PALETTE = {
  purple: ["#9a81ff", "#ece8ff"],
  blue: ["#44bcf8", "#dbf3ff"],
  mint: ["#31eb9a", "#d9f8ea"],
  magenta: ["#ed79ff", "#fae2fd"],
  pink: ["#ff7ac8", "#ffe2f3"],
  orange: ["#ffae6b", "#ffe9d7"],
  teal: ["#45e2e0", "#d6f1f3"],
  green: ["#87ef6b", "#d6fdcc"],
  coral: ["#ff8d73", "#ffe6d7"],
} as const;

export type LayerColor = keyof typeof PALETTE;

export type Badge =
  | { kind: "pending"; color: string }
  | { kind: "done"; background: string; color: string };

// layers: 위(뒤)에서 아래(앞) 순서. top은 카드 안쪽 기준 레이어 시작 y.
export type Card = { layers: { color: LayerColor; top: number }[]; badge: Badge };

// Figma gradientTransform [[0,.58,.32],[-.71,0,.85]]을 CSS로 환산한 값
export function gradient(color: LayerColor) {
  const [center, edge] = PALETTE[color];
  return `radial-gradient(70.4% 86.2% at 49.3% 31%, ${center} 0%, ${edge} 100%)`;
}

export default function ExperienceCard({ card }: { card: Card }) {
  return (
    <div className="relative size-[160px] rounded-[32px] bg-white">
      {card.layers.map(({ color, top }) => (
        <div
          key={top}
          className="absolute left-[3px] w-[154px] rounded-[29px]"
          style={{ top, height: 157 - top, background: gradient(color) }}
        />
      ))}

      {card.badge.kind === "pending" ? (
        <span
          className="absolute top-[114px] left-[53px] flex h-[28px] w-[55px] items-center justify-center rounded-[16px] bg-white/35 text-[12px] leading-[1.3] font-semibold backdrop-blur-[7.5px]"
          style={{ color: card.badge.color }}
        >
          확인 전
        </span>
      ) : (
        <span
          role="img"
          aria-label="확인 완료"
          className="absolute top-[114px] left-[66px] size-[28px] rounded-[16px]"
          style={{ background: card.badge.background }}
        >
          <svg
            width="10"
            height="7"
            viewBox="0 0 10 7"
            fill="none"
            className="absolute top-[10.5px] left-[9px] overflow-visible"
            aria-hidden
          >
            <path
              d="M0 3.5L3.529 7L10 0"
              stroke={card.badge.color}
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </div>
  );
}
