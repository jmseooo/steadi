// Figma 블러 값 → 가우시안 σ 비율. Figma 장면 4와 빛 영역 픽셀 차이가 가장 작은 값(0.5~1.25 비교)
const SIGMA = 0.6;

// Figma "레이어 블러"를 건 원(빛)을 CSS blur 필터 없이 그린다.
// Safari는 큰 blur 필터(100px 이상)를 움직이는 요소에 걸면 번진 가장자리를 요소 근처에서 잘라 빛이 뚝뚝 끊겨 보인다.
// 그래서 블러 결과(원판 * 가우시안)를 가우시안 모양 방사형 그라데이션으로 직접 그린다.
// diameter: 원 지름, blur: Figma 블러 값, from·to: 원 안 방사형 색, alpha: 색 투명도, white: 색 위에 겹친 흰색 비율(Figma 흰색 30% 채우기)
export function blurredDisk(diameter: number, blur: number, from: string, to: string, alpha: number, white = 0) {
  const r0 = diameter / 2;
  const s = blur * SIGMA;
  const se = Math.sqrt(s * s + (r0 * r0) / 4); // 블러된 원판 ≈ 가우시안(σe)
  const peak = 1 - Math.exp(-(r0 * r0) / (2 * s * s)); // 블러 후 가운데 밝기
  const ext = 3 * se; // 이 밖은 거의 0
  const [a, b] = [rgb(from), rgb(to)];
  const STEPS = 14;
  const stops = Array.from({ length: STEPS + 1 }, (_, k) => {
    const r = (ext * k) / STEPS;
    const t = Math.min(1, r / r0);
    const c = a.map((v, i) => Math.round((v + (b[i] - v) * t) * (1 - white) + 255 * white)); // Figma: 색 위에 흰색 white 비율
    const o = alpha * peak * Math.exp(-(r * r) / (2 * se * se));
    return `rgba(${c.join(",")},${o.toFixed(4)}) ${((k / STEPS) * 100).toFixed(1)}%`;
  });
  return { size: ext * 2, offset: ext - r0, background: `radial-gradient(circle closest-side, ${stops.join(", ")})` };
}

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
