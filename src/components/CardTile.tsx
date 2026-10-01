import Image from "next/image";
import { gradient, type LayerColor } from "./ExperienceCard";

// 카드 톤별 색: 왼쪽 그라디언트 레이어 · 새 카드 테두리 · 상단 메타 글자
const TONES = {
  coral: { layer: "coral", border: "#ff8d73", text: "#f85e3b" },
  magenta: { layer: "magenta", border: "#ed79ff", text: "#df3ef7" },
  teal: { layer: "teal", border: "#31cdd0", text: "#18afb4" },
} as const satisfies Record<string, { layer: LayerColor; border: string; text: string }>;

export type Tone = keyof typeof TONES;

export type TileData = {
  tone: Tone;
  category: string;
  source: string;
  title: string;
  summary: string;
  bookmarked?: boolean;
};

// 경험 카드 목록의 가로형 카드 (높이 190, 폭은 칸에 맞춤 — Figma 330). 새 카드는 톤 색 테두리를 두른다.
export default function CardTile({ tile, isNew = false }: { tile: TileData; isNew?: boolean }) {
  const tone = TONES[tile.tone];

  return (
    <article
      className="flex h-[190px] w-full items-center gap-[20px] rounded-[32px] bg-white py-[5px] pr-[22px] pl-[5px] shadow-soft"
      style={isNew ? { border: `0.8px solid ${tone.border}` } : undefined}
    >
      <div
        className="h-full w-[100px] shrink-0 rounded-[29px]"
        style={{ background: gradient(tone.layer) }}
      />

      <div className="relative flex h-[170px] flex-1 flex-col items-end justify-end pt-[12px] pb-[15px]">
        {tile.bookmarked && (
          <Image
            src="/assets/icon-bookmark.png"
            alt="북마크됨"
            width={45}
            height={56}
            className="absolute top-[12px] right-0 h-[18.67px] w-[15px]"
          />
        )}

        {/* Figma: 182px 글 묶음을 오른쪽 정렬(칸 183이면 왼쪽 1px 여백). 넓은 칸에선 칸을 채운다 */}
        <div className="w-[max(182px,calc(100%-1px))]">
          <p
            className="flex h-[17px] items-center gap-[6px] text-[12px] leading-[1.4] font-semibold whitespace-nowrap"
            style={{ color: tone.text }}
          >
            {tile.category}
            <span className="h-[10px] w-px bg-current opacity-50" aria-hidden />
            <span className="flex gap-[2px]">
              <span className="font-wanted font-medium">{tile.source}</span>
              감지
            </span>
          </p>

          <h3 className="mt-[3px] h-[48px] text-[18px] leading-[1.36] font-bold whitespace-pre-line text-ink">
            {tile.title}
          </h3>
          <p className="mt-[6px] h-[36px] text-[13px] leading-[1.4] whitespace-pre-line text-ink-sub">
            {tile.summary}
          </p>
        </div>
      </div>
    </article>
  );
}
