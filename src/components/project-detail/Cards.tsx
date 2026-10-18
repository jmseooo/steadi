import Image from "next/image";
import type { ProjectColor } from "../projectColors";

// 카드 색 계열별 글자 그라데이션 (Figma): 제목은 #292c2d → 끝색, 확신도는 대각선 시작 → 끝
const CARD_TONE: Record<ProjectColor, { titleEnd: string; pct: [string, string] }> = {
  orange: { titleEnd: "#7e2610", pct: ["#ffae6b", "#ffeee0"] },
  pink: { titleEnd: "#8c0f49", pct: ["#ffa1da", "#fef1f9"] },
  blue: { titleEnd: "#084872", pct: ["#78d0ff", "#eff8ff"] },
};

export type ConnectedCardData = { art: number; tone: ProjectColor; tags?: string[]; title: string; confidence: number };

const Tag = ({ children }: { children: string }) => (
  <span className="flex h-[28px] shrink-0 items-center rounded-[20px] bg-[rgba(26,26,26,0.05)] px-[10px] text-[12px] leading-[15.6px] font-semibold text-ink-sub backdrop-blur-[10px]">
    {children}
  </span>
);

// 연결된 경험 카드 280×350: 빛(색별) + 유리 도형(카드별) + 아래 흰 페이드 위에 태그·제목·확신도
// 묶음 안 작은 카드(208×260)는 같은 카드를 zoom으로 줄여 쓴다
export function ConnectedCard({ card, size = 280 }: { card: ConnectedCardData; size?: number }) {
  const tone = CARD_TONE[card.tone];
  return (
    <article
      className={`relative h-[350px] w-[280px] shrink-0 overflow-hidden rounded-[26px] border-2 border-white bg-white ${
        size === 280 ? "shadow-[0_4px_30px_rgba(0,0,0,0.03)]" : "" /* 묶음 안 작은 카드는 그림자 없음 (Figma) */
      }`}
      style={{ zoom: size / 280 }}
    >
      {/* 그림 에셋은 카드(테두리 포함) 기준 좌표. 2px 테두리 안쪽이라 -2px 보정 */}
      <div className="pointer-events-none absolute -top-[2px] -left-[2px] h-[350px] w-[280px]">
        <Image
          src={`/assets/cards/glow-${card.tone}.png`}
          alt=""
          width={280}
          height={313}
          className="absolute top-0 left-0 h-[313px] w-[280px]"
        />
        <Image
          src={`/assets/cards/c${card.art}.png`}
          alt=""
          width={195}
          height={235}
          className="absolute top-[25px] left-[85px] h-auto w-[195px] max-w-none"
        />
        <Image
          src="/assets/cards/fade.png"
          alt=""
          width={280}
          height={221}
          className="absolute top-[79px] left-0 h-[221px] w-[280px]"
        />
      </div>
      {card.tags && (
        <div className="absolute top-[16px] left-[18px] flex gap-[5.82px]">
          {card.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      )}
      <div className="absolute top-[240px] left-[18px] flex w-[230px] flex-col gap-[10px]">
        <h3
          className="w-fit bg-clip-text text-[19px] leading-[26.6px] font-bold whitespace-pre text-transparent"
          style={{ backgroundImage: `linear-gradient(90deg, #292c2d, ${tone.titleEnd})` }}
        >
          {card.title}
        </h3>
        <p
          className="w-fit bg-clip-text text-[15px] leading-[19.5px] font-semibold text-transparent"
          style={{ backgroundImage: `linear-gradient(118deg, ${tone.pct[0]} 20%, ${tone.pct[1]} 130%)` }}
        >
          {card.confidence}% 확신
        </p>
      </div>
    </article>
  );
}

export type ExperienceCardData = { tag: string; text: string; source: "notion" | "kakao" };

// 경험 카드 글자 그라데이션 (프로젝트 색별)
const EXP_TEXT: Record<ProjectColor, string> = {
  pink: "linear-gradient(90deg, #560128, #a80c55)",
  blue: "linear-gradient(90deg, #062d4b, #02578a)",
  orange: "linear-gradient(90deg, #441006, #9c2b10)",
};

// 경험 카드 228×260: 프로젝트 색 빛 + 유리 도형 + 페이드 위에 프로젝트 태그·출처 아이콘·내용(아래 정렬)
export function ExperienceCard({ card, tone }: { card: ExperienceCardData; tone: ProjectColor }) {
  return (
    <article className="relative h-[260px] w-[228px] shrink-0 overflow-hidden rounded-[28px] border-2 border-white bg-white">
      <div className="pointer-events-none absolute -top-[2px] -left-[2px] h-[260px] w-[228px]">
        <Image
          src={`/assets/cards/exp-glow-${tone}.png`}
          alt=""
          width={228}
          height={260}
          className="absolute inset-0 size-full"
        />
        <Image
          src={`/assets/cards/exp-shape-${tone}.png`}
          alt=""
          width={156}
          height={224}
          className="absolute top-[36px] left-[72px] h-[224px] w-[156px]"
        />
        <Image
          src="/assets/cards/exp-fade.png"
          alt=""
          width={228}
          height={168}
          className="absolute top-[92px] left-0 h-[168px] w-[228px]"
        />
      </div>
      <div className="absolute top-[16px] left-[18px] flex items-center gap-[8px]">
        <Tag>{card.tag}</Tag>
        {card.source === "notion" ? (
          <Image
            src="/assets/cards/icon-notion-sm.png"
            alt="노션"
            width={25}
            height={25}
            className="rounded-[5.5px] border-[0.22px] border-canvas"
          />
        ) : (
          <Image
            src="/assets/cards/icon-kakao-sm.png"
            alt="카카오톡"
            width={25}
            height={25}
            className="rounded-[5.5px]"
          />
        )}
      </div>
      <p
        className="absolute bottom-[26px] left-[25px] w-fit bg-clip-text text-[15px] leading-[23.25px] font-bold whitespace-pre text-transparent"
        style={{ backgroundImage: EXP_TEXT[tone] }}
      >
        {card.text}
      </p>
    </article>
  );
}
