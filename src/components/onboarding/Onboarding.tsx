"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { createContext, use, useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import FolderArt, { FolderTitle } from "../FolderArt";
import { markOnboarded } from "../OnboardingGate";
import GoalChat from "./GoalChat";
import {
  DEVICE_PROGRESS,
  FIND_PROGRESS,
  FOUND_PROJECTS,
  GOAL_ORDER,
  METHODS,
  SERVICES,
  type ServiceId,
} from "./data";
import {
  BottomHint,
  Button,
  Checkbox,
  GradientText,
  Heading,
  ProgressBar,
  StepIcon,
  StepList,
  type Accent,
  type StepState,
} from "./ui";

type Step = "welcome" | "method" | "device" | "service" | "finding" | "found" | "goal" | "done";

// 진행 막대: 시작 방식·기기 연결 1/3, 서비스 연결·프로젝트 찾기 2/3, 이후 꽉 참
const PROGRESS: Record<Step, number> = {
  welcome: 0,
  method: 1 / 3,
  device: 1 / 3,
  service: 2 / 3,
  finding: 2 / 3,
  found: 1,
  goal: 1,
  done: 1,
};

// 배경 원형 그라데이션 (1608px, Figma 화면별 색)
// CSS는 투명 쪽 색을 거의 안 섞어(premultiplied) 분홍만 남으므로, Figma처럼 색·투명도를 따로 보간한 중간 단계를 넣는다
function glow(from: string, to: string) {
  const hex = (h: string) => [1, 3, 5, 7].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [a, b] = [hex(from), hex(to)];
  const stops = Array.from({ length: 9 }, (_, k) => {
    const t = k / 8;
    const [r, g, bl, al] = a.map((v, i) => v + (b[i] - v) * t);
    return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(bl)},${(al / 255).toFixed(3)}) ${t * 100}%`;
  });
  // 반지름은 --glow-s 배율로: 크기 변환(scale) 대신 값을 바꿔 다시 그려야 큰 그라데이션이 깨지지 않는다
  return `radial-gradient(calc(804px * var(--glow-s)) calc(804px * var(--glow-s)) at 50% 50%, ${stops.join(", ")})`;
}
const GLOW: Record<Accent, string> = {
  default: glow("#ffcbeccc", "#ffd2a900"),
  pink: glow("#ffcbec80", "#ffcbec00"),
  orange: glow("#ffd2a980", "#ffd2a900"),
  blue: glow("#b8e5ff80", "#b8e5ff00"),
};

const STAGE_MS = 1600; // 진행 단계 하나에 걸리는 시간
const AUTO_SEC = 3; // 다 끝나고 자동으로 넘어가기까지

// 개발 중 화면 확인용 시작 상태 (/onboarding?step=service&goal=1&modal=1)
export type OnboardingDebug = { step?: string; goal?: string; modal?: string };

export default function Onboarding({ debug = {} }: { debug?: OnboardingDebug }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(debug.step && debug.step in PROGRESS ? (debug.step as Step) : "welcome");
  const [methods, setMethods] = useState<string[]>(debug.modal ? ["device"] : []);
  const [askPermission, setAskPermission] = useState(Boolean(debug.modal));
  const [services, setServices] = useState<ServiceId[]>(["notion", "kakao"]);
  const [picked, setPicked] = useState<string[]>(["marketing", "band", "resume"]);
  const [goalIndex, setGoalIndex] = useState(Number(debug.goal ?? 0));

  // 목표를 확인할 프로젝트: 고른 것 중 목표 데이터가 있는 것, Figma 순서대로
  const goalProjects = GOAL_ORDER.map((id) => FOUND_PROJECTS.find((p) => p.id === id)!).filter((p) =>
    picked.includes(p.id),
  );
  const accent: Accent = step === "goal" ? (goalProjects[goalIndex]?.color ?? "default") : "default";

  // 스테디가 스스로 작업하는 동안(연결·찾기 진행, 대화 답변 준비) 배경이 숨 쉬듯 커졌다 작아진다
  const [progressWorking, setProgressWorking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const working = ((step === "device" || step === "finding") && progressWorking) || (step === "goal" && thinking);
  const glowRef = useRef<HTMLDivElement>(null);
  useBreathe(glowRef, working);

  const nextGoal = useCallback(() => {
    if (goalIndex + 1 < goalProjects.length) setGoalIndex(goalIndex + 1);
    else setStep("done");
  }, [goalIndex, goalProjects.length]);

  return (
    <Stage
      background={
        <>
          {/* 배경: 색이 바뀔 때 겹쳐서 서서히 전환. 스테디가 작업하는 동안 원이 커졌다 작아진다.
              원(1608px, Figma 기준 -84·170)보다 사방 400px 넓은 판에 그려 커져도 가장자리가 잘리지 않게 */}
          <div ref={glowRef} className="pointer-events-none absolute top-[-230px] left-[-484px] size-[2408px]">
            {(Object.keys(GLOW) as Accent[]).map((a) => (
              <div
                key={a}
                aria-hidden
                className="absolute inset-0 transition-opacity duration-700"
                style={{ background: GLOW[a], opacity: a === accent ? 1 : 0 }}
              />
            ))}
            {/* 같은 배경을 한 겹 더 겹쳐, 작업 중엔 색이 진해졌다 옅어진다 */}
            <div aria-hidden className="absolute inset-0 opacity-(--glow-k)" style={{ background: GLOW[accent] }} />
          </div>
          <Image
            src="/assets/onboarding/decor-lines.png"
            alt=""
            width={378}
            height={405}
            priority
            className="pointer-events-none absolute top-[405px] left-[1062px] h-[405px] w-[378px]"
          />
        </>
      }
      overlay={
        askPermission && (
          <PermissionModal
            onCancel={() => setAskPermission(false)}
            onAllow={() => {
              setAskPermission(false);
              setStep("device");
            }}
          />
        )
      }
    >
      {step !== "welcome" && <ProgressBar value={PROGRESS[step]} accent={accent} />}

      {step === "welcome" && (
        <button
          type="button"
          onClick={() => setStep("method")}
          className="absolute inset-0 cursor-pointer hover:scale-100"
          aria-label="시작하기"
        >
          <span className="absolute top-[354px] left-[540px] flex w-[360px] flex-col items-center gap-[10px]">
            <span className="flex text-[32px] leading-[44.8px] font-bold">
              <GradientText>안녕하세요</GradientText>
            </span>
            <span className="flex flex-col items-center gap-[2px] text-[16px] leading-[23.2px] font-semibold text-ink-muted">
              <span>놓치고 있던 가능성을 모아, 꾸준히 성장할 수 있도록 돕는</span>
              <span>
                <span className="font-wanted font-medium tracking-[-0.08px]">Agentic AI</span> 서비스 스테디입니다.
              </span>
            </span>
          </span>
          <BottomHint>화면을 눌러 시작하세요</BottomHint>
        </button>
      )}

      {step === "method" && (
        <Frame
          left={
            <Heading title="프로젝트를 어떻게 가져올까요?" desc={"사용할 방법을 선택해 주세요.\n여러 방법을 한께 선택할 수 있어요."} />
          }
          right={
            <ul className="flex w-[277px] flex-col gap-[25px]">
              {METHODS.map((m) => {
                const on = methods.includes(m.id);
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setMethods((s) => (on ? s.filter((x) => x !== m.id) : [...s, m.id]))}
                      className="flex w-full items-center gap-[20px] text-left hover:scale-[1.03]"
                    >
                      <Checkbox checked={on} />
                      <span className="flex flex-col">
                        <span className="text-[16px] leading-[22px] font-bold text-[#292c2d]">{m.title}</span>
                        <span className="text-[14px] leading-[20px] font-medium text-ink-muted">{m.desc}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          }
          bottom={
            <>
              <Button variant="secondary" onClick={() => setStep("welcome")} className="w-[85px]">
                이전
              </Button>
              <Button
                disabled={methods.length === 0}
                onClick={() => (methods.includes("device") ? setAskPermission(true) : setStep("service"))}
                className="w-[85px]"
              >
                다음
              </Button>
            </>
          }
        />
      )}

      {step === "device" && (
        <ProgressScreen
          key="device"
          titles={DEVICE_PROGRESS.titles}
          desc={DEVICE_PROGRESS.desc}
          steps={DEVICE_PROGRESS.steps}
          onCancel={() => setStep("method")}
          onDone={() => setStep("service")}
          onWorking={setProgressWorking}
        />
      )}

      {step === "service" && (
        <ServiceSelect
          selected={services}
          onChange={setServices}
          onPrev={() => setStep("method")}
          onNext={() => setStep("finding")}
        />
      )}

      {step === "finding" && (
        <ProgressScreen
          key="finding"
          titles={FIND_PROGRESS.titles}
          desc={`${joinKo(services.map((id) => SERVICES.find((s) => s.id === id)!.short))}의 관련 기록을 함께 확인해요.`}
          steps={FIND_PROGRESS.steps}
          onCancel={() => setStep("service")}
          onDone={() => setStep("found")}
          onWorking={setProgressWorking}
        />
      )}

      {step === "found" && (
        <FoundProjects
          picked={picked}
          onChange={setPicked}
          onPrev={() => setStep("service")}
          onNext={() => {
            setGoalIndex(0);
            setStep(goalProjects.length > 0 ? "goal" : "done");
          }}
        />
      )}

      {step === "goal" && goalProjects.length > 0 && (
        <>
          <div className="absolute top-[112px] left-[365px]">
            <Heading
              accent={accent}
              title="프로젝트 목표를 확인해주세요"
              desc={"기록에서 프로젝트 목표를 정리했어요.\n바꾸고 싶은 내용은 대화로 알려주세요."}
            />
          </div>
          <GoalChat projects={goalProjects} index={goalIndex} onNext={nextGoal} onThinking={setThinking} />
          {/* 목표 확인을 건너뛰고 바로 완료 화면으로 (오른쪽 아래 1295·714, 95×46) */}
          <Button
            variant="secondary"
            className="absolute top-[714px] left-[1295px] w-[95px]"
            onClick={() => setStep("done")}
          >
            건너뛰기
          </Button>
        </>
      )}

      {step === "done" && (
        <div className="absolute top-[220px] left-[365px] flex w-[711px] flex-col">
          <Heading
            title={`프로젝트 ${goalProjects.length}개를 만들었어요`}
            desc={"확인한 목표를 각 프로젝트에 반영했어요.\n이제 스테디와 함께 시작해봐요."}
          />
          <ul className="mt-[50px] flex justify-end gap-[30px]">
            {goalProjects.map((p) => (
              <li key={p.id}>
                <FolderArt color={p.color!} size={170}>
                  <FolderTitle color={p.color!}>{p.name}</FolderTitle>
                </FolderArt>
              </li>
            ))}
          </ul>
          <div className="mt-[46px] flex justify-end gap-[10px]">
            <Button
              variant="secondary"
              className="w-[85px]"
              onClick={() => {
                setGoalIndex(0);
                setStep(goalProjects.length > 0 ? "goal" : "found");
              }}
            >
              이전
            </Button>
            <Button className="w-[130px]" onClick={() => {
                markOnboarded();
                router.push("/");
              }}>
              시작하기
            </Button>
          </div>
        </div>
      )}

    </Stage>
  );
}

// active 동안 원이 커지며(--glow-s 1 → 1.4) 색이 진해졌다(--glow-k 0 → 0.9) 돌아오기를 반복,
// 끝나면 지금 상태에서 부드럽게 원래대로
function useBreathe(ref: RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const css = getComputedStyle(el);
    const now = { "--glow-s": css.getPropertyValue("--glow-s").trim() || "1", "--glow-k": css.getPropertyValue("--glow-k").trim() || "0" };
    el.getAnimations().forEach((a) => a.cancel());
    const rest = { "--glow-s": "1", "--glow-k": "0" };
    if (active) {
      el.animate([now, { "--glow-s": "1.4", "--glow-k": "0.9" }, rest], {
        duration: 2400,
        iterations: Infinity,
        easing: "ease-in-out",
      });
    } else {
      el.animate([now, rest], { duration: 900, easing: "ease-out" });
    }
  }, [ref, active]);
}

// "노션, 슬랙과 카카오톡" — 마지막 받침에 따라 과/와
function joinKo(words: string[]) {
  if (words.length <= 1) return words[0] ?? "";
  const last = words[words.length - 1];
  const head = words.slice(0, -1).join(", ");
  const code = head.charCodeAt(head.length - 1) - 0xac00;
  const josa = code >= 0 && code % 28 !== 0 ? "과" : "와";
  return `${head}${josa} ${last}`;
}

const ScaleContext = createContext(1);

// 1440×810 Figma 프레임을 창에 맞춘다.
// 내용은 잘리지 않게 창 안에 들어오도록(축소만), 배경·어두운 막은 창 전체를 빈틈없이 덮는다.
function Stage({ background, overlay, children }: { background: ReactNode; overlay?: ReactNode; children: ReactNode }) {
  const [view, setView] = useState({ w: 1440, h: 810 });
  useLayoutEffect(() => {
    const read = () => setView({ w: window.innerWidth, h: window.innerHeight });
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  const fit = Math.min(1, view.w / 1440, view.h / 810);
  const cover = Math.max(view.w / 1440, view.h / 810);

  return (
    <ScaleContext value={fit}>
      <main className="fixed inset-0 overflow-hidden bg-white">
        {/* 배경은 zoom으로 실제 해상도에서 다시 그린다 (scale로 키우면 그림처럼 확대돼 거칠어짐) */}
        <div
          className="absolute h-[810px] w-[1440px]"
          style={{ zoom: cover, left: (view.w / cover - 1440) / 2, top: (view.h / cover - 810) / 2 }}
        >
          {background}
        </div>
        <Frame1440>{children}</Frame1440>
        {overlay}
      </main>
    </ScaleContext>
  );
}

function Frame1440({ children }: { children: ReactNode }) {
  const fit = use(ScaleContext);
  return (
    <div
      className="absolute top-1/2 left-1/2 h-[810px] w-[1440px]"
      style={{ translate: "-50% -50%", scale: String(fit) }}
    >
      {children}
    </div>
  );
}

// 시작 방식·기기 연결 화면 공통 배치: (365, 292) 711×280, 위 줄 왼쪽 제목·오른쪽 목록, 아래 버튼
function Frame({ left, right, bottom }: { left: ReactNode; right: ReactNode; bottom: ReactNode }) {
  return (
    <div className="absolute top-[292px] left-[365px] flex h-[280px] w-[711px] flex-col justify-between">
      <div className="flex justify-between">
        <div className="w-[379px]">{left}</div>
        {right}
      </div>
      <div className="flex items-center justify-between">{bottom}</div>
    </div>
  );
}

// 진행 화면: 단계가 하나씩 완료되고, 다 끝나면 N초 뒤 자동으로 다음 화면
function ProgressScreen({
  titles,
  desc,
  steps,
  onCancel,
  onDone,
  onWorking,
}: {
  titles: string[];
  desc: string;
  steps: { pending: string; active: string; done: string }[];
  onCancel: () => void;
  onDone: () => void;
  onWorking?: (working: boolean) => void;
}) {
  const [stage, setStage] = useState(0);
  const [left, setLeft] = useState(AUTO_SEC);
  const finished = stage >= steps.length;

  useEffect(() => {
    onWorking?.(!finished);
    return () => onWorking?.(false);
  }, [finished, onWorking]);

  useEffect(() => {
    if (finished) return;
    const t = setTimeout(() => setStage((s) => s + 1), STAGE_MS);
    return () => clearTimeout(t);
  }, [stage, finished]);

  useEffect(() => {
    if (!finished) return;
    if (left === 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [finished, left, onDone]);

  const list = steps.map((s, i) => {
    const state: StepState = i < stage ? "done" : i === stage ? "active" : "pending";
    return { label: s[state], state };
  });

  return (
    <>
      <Frame
        left={<Heading title={titles[Math.min(stage, titles.length - 1)]} desc={desc} />}
        right={
          <div className="w-[232px]">
            <StepList steps={list} />
          </div>
        }
        bottom={
          !finished && (
            <Button variant="secondary" className="w-[180px]" onClick={onCancel}>
              연결 중단하기
            </Button>
          )
        }
      />
      {finished && <BottomHint>{left}초 후 자동으로 넘어갑니다</BottomHint>}
    </>
  );
}

function PermissionModal({ onCancel, onAllow }: { onCancel: () => void; onAllow: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="absolute inset-0 bg-black/20" onClick={onCancel}>
      <Frame1440>
      <div
        role="dialog"
        aria-modal
        aria-label="이 기기 연결을 허용할까요?"
        onClick={(e) => e.stopPropagation()}
        className="absolute top-[227px] left-[505px] flex h-[356px] w-[430px] flex-col items-center rounded-[42px] bg-white/95 px-[35px] pt-[48px] shadow-[inset_0_0_50px_5px_#fff,0_4px_50px_rgba(0,0,0,0.12)] backdrop-blur-[10px]"
      >
        <Image src="/assets/onboarding/imac.png" alt="" width={70} height={56} className="opacity-80" />
        <span className="mt-[10px] flex items-center gap-[3px] text-[12px] leading-[17px] text-ink-muted">
          <span className="font-semibold">다은의</span>
          <span className="font-wanted">Mac</span>
        </span>
        <h2 className="mt-[14px] text-[21px] leading-[29px] font-bold">이 기기 연결을 허용할까요?</h2>
        <p className="mt-[10px] text-center text-[14px] leading-[20px] font-semibold text-ink-muted">
          이 기기에서 사용하는 서비스를 찾아요.
          <br />
          서비스 기록을 읽을 범위는 연결 후 선택해요.
        </p>
        <div className="mt-[50px] flex w-full gap-[10px]">
          <Button variant="secondary" className="w-[110px] rounded-[12px]" onClick={onCancel}>
            취소
          </Button>
          <Button className="flex-1 rounded-[12px]" onClick={onAllow}>
            허용하기
          </Button>
        </div>
      </div>
      </Frame1440>
    </div>
  );
}

function ServiceSelect({
  selected,
  onChange,
  onPrev,
  onNext,
}: {
  selected: ServiceId[];
  onChange: (ids: ServiceId[]) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const all = selected.length === SERVICES.length;
  const toggle = (id: ServiceId) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  return (
    <div className="absolute top-[200px] left-[273px] flex h-[442px] w-[894px] flex-col justify-between">
      <div className="flex justify-between">
        <div className="flex w-[379px] flex-col gap-[10px]">
          <span className="flex h-[29px] w-fit items-center gap-[8px] rounded-[12px] bg-[rgba(41,44,45,0.06)] px-[10px] text-[12px] leading-[17px] font-semibold text-ink-muted">
            현재 연결된 기기
            <span className="size-[2px] rounded-full bg-disabled" />
            <span className="flex gap-[3px] text-ink-sub">
              다은의 <span className="font-medium">Mac</span>
            </span>
          </span>
          <Heading title="프로젝트를 찾을 서비스를 선택해 주세요" desc="선택한 서비스에서 접근 가능한 기록을 읽어요." />
        </div>

        <div className="flex w-[360px] flex-col gap-[20px]">
          <div className="flex h-[20px] items-center justify-between px-[5px]">
            <button
              type="button"
              aria-pressed={all}
              onClick={() => onChange(all ? [] : SERVICES.map((s) => s.id))}
              className="flex items-center gap-[10px] text-[14px] leading-[20px] font-medium text-ink-muted"
            >
              <Checkbox checked={all} />
              전체 ({selected.length}/{SERVICES.length})
            </button>
            <span className="text-[13px] leading-[18px] font-medium text-disabled">이 기기에서 발견</span>
          </div>
          {SERVICES.map((s) => {
            const on = selected.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(s.id)}
                className="flex h-[31px] w-fit items-center gap-[15px] px-[5px] text-[15px] leading-[21px] font-medium hover:scale-[1.04]"
              >
                <Checkbox checked={on} />
                {/* 아이콘 에셋은 그림자 여백 포함 50px (타일은 왼쪽 10·위 8px) */}
                <span className="relative size-[30px]">
                  <Image src={s.icon} alt="" width={50} height={50} className="absolute -top-[8px] -left-[10px] size-[50px] max-w-none" />
                </span>
                {s.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="secondary" className="w-[85px]" onClick={onPrev}>
          이전
        </Button>
        <div className="flex gap-[10px]">
          <Button variant="muted" className="w-[184px]">
            다른 기기도 연결할래요
          </Button>
          <Button className="w-[240px]" disabled={selected.length === 0} onClick={onNext}>
            선택한 서비스에서 프로젝트 찾기
          </Button>
        </div>
      </div>
    </div>
  );
}

function FoundProjects({
  picked,
  onChange,
  onPrev,
  onNext,
}: {
  picked: string[];
  onChange: (ids: string[]) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="absolute top-[212px] left-[273px] flex h-[410px] w-[894px] flex-col justify-between">
      <div className="flex justify-between">
        <Heading
          title={`기록에서 프로젝트 ${FOUND_PROJECTS.length}개를 찾았어요`}
          desc="앞으로 새 기록을 모을 프로젝트를 선택해 주세요."
        />
        <ul className="grid w-[449px] grid-cols-2 gap-x-[25px] gap-y-[30px]">
          {FOUND_PROJECTS.map((p) => {
            const on = picked.includes(p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange(on ? picked.filter((x) => x !== p.id) : [...picked, p.id])}
                  className="flex items-center gap-[20px] text-left hover:scale-[1.03]"
                >
                  <StepIcon state={on ? "done" : "pending"} />
                  <FolderArt color="gray" size={170}>
                    {/* 회색 폴더 라벨 (170px 기준 22·81 위치를 180 기준으로 환산) */}
                    <span className="absolute top-[85.76px] left-[23.29px] flex w-[133.4px] flex-col">
                      <span className="text-[16.94px] leading-[23.72px] font-semibold text-[#47484c]">{p.name}</span>
                      <span className="truncate text-[12.71px] leading-[17.79px] font-medium text-ink-muted">{p.source}</span>
                    </span>
                  </FolderArt>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex items-center justify-between">
        <Button variant="secondary" className="w-[85px]" onClick={onPrev}>
          이전
        </Button>
        <Button className="w-[240px]" disabled={picked.length === 0} onClick={onNext}>
          선택한 프로젝트 {picked.length}개 확인하기
        </Button>
      </div>
    </div>
  );
}
