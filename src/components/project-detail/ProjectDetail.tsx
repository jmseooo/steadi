"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import Breadcrumb from "../Breadcrumb";
import FilterChips from "../FilterChips";
import FolderArt from "../FolderArt";
import { ConnectedCard, ExperienceCard, type ConnectedCardData } from "./Cards";
import type { DetailTheme, ProjectDetailData, Step } from "./data";

const TABS = ["경험 모음", "성장의 순간", "피드백", "제안 카드"] as const;
const VIEWS = ["연결된 경험 카드", "경험 카드"] as const;
type View = "묶음" | (typeof VIEWS)[number];

const SLIDE = "transition-[translate,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";

export default function ProjectDetail({ project }: { project: ProjectDetailData }) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("경험 모음");
  // 경험 모음은 처음엔 두 묶음을 보여주고, 묶음을 누르면 칩으로 전환되는 카드 목록이 된다
  const [view, setView] = useState<View>("묶음");
  // 연결된 경험 카드 묶음을 눌러 들어왔을 때만 카드가 한 장씩 나타난다 (칩 전환은 바로)
  const [reveal, setReveal] = useState(false);
  const selectTab = (t: (typeof TABS)[number]) => {
    setTab(t);
    if (t === "경험 모음") setView("묶음");
  };

  return (
    <main className="px-5 pt-[25px] pb-[67px]">
      <div className="mx-auto max-w-[1200px]">
        <Breadcrumb parent="내 프로젝트" href="/" current={project.name} />

        {/* 위쪽: 왼쪽 프로젝트 정보·단계, 오른쪽 스테디 인사이트 */}
        <div className="mt-[21px] flex justify-between gap-[45px] max-xl:flex-col">
          <div className="flex flex-col gap-[28px] pt-[28px]">
            <Header project={project} />
            <Steps steps={project.steps} theme={project.theme} />
          </div>
          <Insight insight={project.insight} theme={project.theme} />
        </div>

        <section className="mt-[35px] flex flex-col items-center gap-[20px]">
          <Tabs value={tab} onChange={selectTab} />
          {tab === "경험 모음" && view !== "묶음" && <FilterChips items={VIEWS} value={view} onChange={setView} />}
        </section>

        {tab === "경험 모음" && view === "묶음" && (
          <div className="mt-[40px] flex flex-wrap gap-[27px] max-sm:justify-center">
            <Bundle
              title="연결된 경험 카드"
              meta={`카드 ${project.bundles.connected.count}개 · ${project.bundles.connected.createdAgo} 생성`}
              onOpen={() => {
                setReveal(true);
                setView("연결된 경험 카드");
              }}
            >
              {project.bundles.connected.cards.map((c, i) => (
                <div key={i} className={i > 0 ? "-ml-[183px]" : ""}>
                  <ConnectedCard card={c} size={208} />
                </div>
              ))}
            </Bundle>
            <Bundle
              title="경험 카드"
              meta={`카드 ${project.bundles.experience.count}개 · ${project.bundles.experience.createdAgo} 생성`}
              onOpen={() => setView("경험 카드")}
            >
              {project.bundles.experience.cards.map((e, i) => (
                <div key={i} className={i > 0 ? "-ml-[206px]" : ""}>
                  <ExperienceCard card={e} tone={project.theme.expTone} />
                </div>
              ))}
            </Bundle>
          </div>
        )}

        {tab === "경험 모음" && view === "연결된 경험 카드" && (
          <ConnectedGrid cards={project.connected} reveal={reveal} />
        )}

        {tab === "경험 모음" && view === "경험 카드" && (
          <ul className="mt-[30px] grid grid-cols-[repeat(auto-fill,228px)] justify-between gap-y-[30px] max-xl:justify-center max-xl:gap-x-[15px]">
            {project.experiences.map((e) => (
              <li key={e.text}>
                <ExperienceCard card={e} tone={project.theme.expTone} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

// 카드를 겹쳐 쌓은 묶음 + 아래 이름·개수. 누르면 그 카드 목록으로
function Bundle({
  title,
  meta,
  onOpen,
  children,
}: {
  title: string;
  meta: string;
  onOpen: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onOpen} className="flex flex-col gap-[15px] text-left hover:scale-[1.02]">
      <div className="flex">{children}</div>
      <div className="flex flex-col px-[5px]">
        <span className="text-[16px] leading-[24px] font-semibold">{title}</span>
        <span className="text-[14px] leading-[21px] font-medium text-ink-muted">{meta}</span>
      </div>
    </button>
  );
}

// 연결된 경험 카드 목록. 묶음을 눌러 들어오면(reveal) 카드가 제자리에서 한 장씩 차례로 나타난다
function ConnectedGrid({ cards, reveal }: { cards: ConnectedCardData[]; reveal: boolean }) {
  const list = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    if (!reveal || !list.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(list.current.children) as HTMLElement[];
    items.forEach((el, i) => {
      el.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 500,
        delay: i * 190, // 앞 카드가 거의 다 나타난 뒤 다음 카드
        easing: "ease-out",
        fill: "backwards",
      });
    });
  }, [reveal]);

  return (
    <ul
      ref={list}
      className="mt-[30px] grid grid-cols-[repeat(auto-fill,280px)] justify-between gap-y-[30px] max-xl:justify-center max-xl:gap-x-[27px]"
    >
      {cards.map((c, i) => (
        // 앞 카드가 위에 오도록(묶음에서 뒤 카드가 먼저 출발) 쌓임 순서 지정
        <li key={c.title} className="relative origin-top-left" style={{ zIndex: cards.length - i }}>
          <ConnectedCard card={c} />
        </li>
      ))}
    </ul>
  );
}

function Header({ project }: { project: ProjectDetailData }) {
  return (
    <div className="flex items-center gap-[35px]">
      <FolderArt color={project.color} size={170} />
      <div className="flex flex-col gap-[15px]">
        <div className="flex items-center gap-[15px]">
          <h1 className="text-[24px] leading-[34px] font-bold">{project.name}</h1>
          <span className="flex h-[34px] items-center gap-[5px] rounded-[20px] bg-white pr-[12px] pl-[8px] text-[13px] leading-[18px] font-bold text-[#47484c]">
            <Dot ring={project.theme.dot.ring} inner={project.theme.dot.inner} border={project.theme.dot.border} />
            {project.status}
          </span>
        </div>
        <dl className="flex flex-col gap-[8px] text-[16px] leading-[22.4px]">
          <div className="flex items-center gap-[12px]">
            <dt className="font-medium text-disabled">목표</dt>
            <dd
              className="w-fit bg-clip-text font-semibold text-transparent"
              style={{ backgroundImage: `linear-gradient(90deg, #1a1a1a, ${project.theme.goalEnd})` }}
            >
              {project.goal}
            </dd>
            <button type="button" aria-label="목표 수정" className="size-[20px] shrink-0">
              <Image src="/assets/btn-edit.png" alt="" width={20} height={20} />
            </button>
          </div>
          <div className="flex items-center gap-[12px]">
            <dt className="font-medium text-disabled">기간</dt>
            <dd className="font-semibold text-ink-sub">{project.startedAt} ~</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

// 바깥 연한 빛(22px) + 가운데 진한 점(8px)
function Dot({ ring, inner, border }: { ring: [string, string]; inner: string; border: string }) {
  return (
    <span
      aria-hidden
      className="flex size-[22px] shrink-0 items-center justify-center rounded-full"
      style={{ background: `radial-gradient(closest-side, ${ring[0]}, ${ring[1]})` }}
    >
      <span className="size-[8px] rounded-full border" style={{ background: inner, borderColor: border }} />
    </span>
  );
}

// 진행 단계: 끝난 단계·남은 단계는 좁은 칸, 지금 단계는 넓게 펼쳐 설명
function Steps({ steps, theme }: { steps: Step[]; theme: DetailTheme }) {
  return (
    <ol className="flex h-[100px] gap-[5px]">
      {steps.map((s, i) =>
        s.state === "current" ? (
          <li
            key={i}
            className="flex items-center gap-[12px] rounded-[18px] pt-[16px] pr-[24px] pb-[16px] pl-[16px]"
            style={{ background: theme.currentBg }}
          >
            <div className="flex gap-[12px]">
              <Dot ring={theme.dot.ring} inner={theme.currentDot} border={theme.dot.border} />
              <div className="flex flex-col gap-[2px]">
                <span className="text-[13px] leading-[22px] font-medium" style={{ color: theme.currentLabel }}>
                  현재 · {s.label}
                </span>
                <span
                  className="text-[15px] leading-[19.5px] font-semibold whitespace-pre-line"
                  style={{ color: theme.currentText }}
                >
                  {s.current}
                </span>
              </div>
            </div>
          </li>
        ) : (
          <li
            key={i}
            className={`flex flex-col items-center justify-center gap-[8px] rounded-[18px] bg-toggle py-[20px] ${
              s.state === "done" ? "w-[65px]" : "w-[70px]"
            }`}
          >
            {s.state === "done" ? (
              <Image src="/assets/icon-step-done.png" alt="완료" width={18} height={18} />
            ) : (
              <span className="flex size-[18px] items-center justify-center rounded-full bg-line text-[11px] leading-[14px] font-medium text-ink-sub">
                {i + 1}
              </span>
            )}
            <span
              className={`text-center text-[13px] leading-[17px] font-medium whitespace-pre-line ${
                s.state === "done" ? "text-ink-muted" : "text-ink-sub"
              }`}
            >
              {s.label}
            </span>
          </li>
        ),
      )}
    </ol>
  );
}

function Insight({ insight, theme }: { insight: ProjectDetailData["insight"]; theme: DetailTheme }) {
  return (
    <section className="relative h-[315px] w-[535px] max-w-full shrink-0 overflow-hidden rounded-[32px] bg-white/50">
      <Image
        src="/assets/decor-lines-card.png"
        alt=""
        width={264}
        height={284}
        className="pointer-events-none absolute top-[31px] left-[271px] h-[284px] w-[264px]"
      />
      <div className="absolute top-[112px] left-[48px] flex w-[395px] flex-col gap-[15px]">
        <div className="flex flex-col gap-[8px]">
          <h2
            className="w-fit bg-clip-text text-[16px] leading-[24.8px] font-bold text-transparent"
            style={{ backgroundImage: `linear-gradient(90deg, ${theme.insightLabel[0]}, ${theme.insightLabel[1]})` }}
          >
            스테디가 보고 있는 지금
          </h2>
          <p
            className="w-fit bg-clip-text text-[22px] leading-[31.9px] font-bold whitespace-pre text-transparent"
            style={{ backgroundImage: `linear-gradient(90deg, ${theme.insightTitle[0]}, ${theme.insightTitle[1]})` }}
          >
            {insight.title}
          </p>
        </div>
        <p className="text-[15px] leading-[24px] font-semibold whitespace-pre text-ink-muted">{insight.desc}</p>
      </div>
    </section>
  );
}

// 탭: 밑줄이 선택된 탭 아래로 미끄러진다 (탭 사이 40px, 글자 좌우 5px)
function Tabs<T extends string>({ value, onChange }: { value: T; onChange: (v: T) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);
  const index = (TABS as readonly string[]).indexOf(value);

  useLayoutEffect(() => {
    const measure = () => {
      const el = refs.current[index];
      if (el) setBar({ left: el.offsetLeft, width: el.offsetWidth });
    };
    measure();
    let cancelled = false;
    document.fonts.ready.then(() => !cancelled && measure());
    return () => {
      cancelled = true;
    };
  }, [index]);

  return (
    <div role="tablist" className="relative flex h-[38px] gap-[40px] py-[2px]">
      {TABS.map((t, i) => (
        <button
          key={t}
          ref={(el) => void (refs.current[i] = el)}
          type="button"
          role="tab"
          aria-selected={t === value}
          onClick={() => onChange(t as T)}
          className="h-[24px] px-[5px] text-[16px] leading-[24px] font-semibold hover:scale-100"
        >
          {t}
        </button>
      ))}
      {bar && (
        <span
          aria-hidden
          className={`absolute top-[34px] left-0 h-[2px] bg-ink ${SLIDE}`}
          style={{ width: bar.width, translate: `${bar.left}px 0` }}
        />
      )}
    </div>
  );
}
