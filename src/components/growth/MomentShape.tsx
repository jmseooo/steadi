import { useId } from "react";
import type { Shape } from "./moments";

// 카테고리 도형. 카드 안에서는 칸(box) 오른쪽 아래를 둥글게 잘라 그리고(Figma 마스크),
// tone: dark = 기본 카드(#4a4a4a → 검정, 20%), light = 호버 카드(흰 60% → 흰색)
export function MomentShape({ shape, tone }: { shape: Shape; tone: "dark" | "light" }) {
  const id = useId();
  const b = shape.box;
  const r = b - 32.4; // Figma 마스크: 오른쪽 아래 모서리 부드러운 곡선 (90 → 57.6)
  const mask = `M0 0H${b}V${r}C${b} ${r + 13.5} ${b} ${r + 20.25} ${b - 3.44} ${r + 24.98}C${b - 4.55} ${r + 26.51} ${b - 5.89} ${r + 27.85} ${b - 7.42} ${r + 28.96}C${b - 12.15} ${b} ${r + 13.5} ${b} ${r} ${b}H0V0Z`;
  return (
    <svg width={b} height={b} viewBox={`0 0 ${b} ${b}`} fill="none" aria-hidden className="absolute" style={{ top: shape.at, left: shape.at }}>
      <defs>
        <clipPath id={`${id}m`}>
          <path d={mask} />
        </clipPath>
        <radialGradient id={`${id}g`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform={shape.gradient}>
          {tone === "dark" ? (
            <>
              <stop stopColor="#4A4A4A" />
              <stop offset="1" />
            </>
          ) : (
            <>
              <stop stopColor="#fff" stopOpacity="0.6" />
              <stop offset="1" stopColor="#fff" />
            </>
          )}
        </radialGradient>
      </defs>
      <g clipPath={`url(#${id}m)`} opacity={tone === "dark" ? 0.2 : 1}>
        <ShapePath shape={shape} fill={`url(#${id}g)`} />
      </g>
    </svg>
  );
}

// 카테고리 화면 제목 위 아이콘 40px (Figma Union #292c2d)
export function MomentIcon({ shape }: { shape: Shape }) {
  const [w, h] = shape.view;
  return (
    <svg width="40" height="40" viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden>
      <ShapePath shape={shape} fill="#292C2D" />
    </svg>
  );
}

const ShapePath = ({ shape, fill }: { shape: Shape; fill: string }) =>
  shape.circle ? <circle cx="60" cy="60" r="60" fill={fill} /> : <path d={shape.d} fill={fill} />;
