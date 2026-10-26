"use client";

import { useEffect, useRef, useState } from "react";
import FolderArt, { FolderTitle } from "../FolderArt";
import { FOLLOW_UP, type FoundProject } from "./data";
import { GradientText, StepIcon, type Accent } from "./ui";
import { track } from "@/lib/ut";

// 프로젝트 색별 목표 강조 말풍선·보내기 버튼 색 (Figma)
const CHAT_COLORS = {
  pink: { hiBg: "rgba(255,122,200,0.3)", hiText: "#cc0a67", send: "#ff7ac8", sendOn: "#fa3aa5" },
  orange: { hiBg: "rgba(254,134,57,0.3)", hiText: "#c53509", send: "#fe8639", sendOn: "#fc6513" },
  blue: { hiBg: "rgba(61,190,255,0.3)", hiText: "#0365a1", send: "#3dbeff", sendOn: "#0e9fe9" },
  purple: { hiBg: "rgba(155,121,255,0.3)", hiText: "#6120e1", send: "#9b79ff", sendOn: "#7f55fd" },
};
// 끝난 프로젝트 옆 체크 동그라미: 프로젝트별 진한 색 (Figma)
const DONE_COLOR = { pink: "#560128", orange: "#441006", blue: "#082d49", purple: "#320872" };

type Message =
  | { from: "bot"; lines: { text: string; highlight?: boolean; strong?: boolean; countdown?: boolean }[] }
  | { from: "me"; text: string };

const opening = (p: FoundProject): Message => ({
  from: "bot",
  lines: [{ text: p.intro! }, { text: p.goal!, highlight: true }, { text: "이 목표로 시작할까요? 바꾸고 싶은 내용이 있으면 알려주세요." }],
});

// "이대로 진행할게"처럼 동의하는 말이면 목표 확정
const isConfirm = (text: string) => /진행|좋아|시작|확정|그대로/.test(text) || /^(응|네|넹|ㅇㅇ)/.test(text);

export default function GoalChat({
  projects,
  index,
  onNext,
  onThinking,
}: {
  projects: FoundProject[];
  index: number;
  onNext: () => void;
  onThinking?: (thinking: boolean) => void;
}) {
  const project = projects[index];
  const color = project.color!;
  const c = CHAT_COLORS[color];
  const last = index === projects.length - 1;

  const [messages, setMessages] = useState<Message[]>(() => [opening(project)]);
  const [draft, setDraft] = useState("");
  const [turns, setTurns] = useState(0);
  const [done, setDone] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // 다음 프로젝트로 넘어가면 대화를 새로 시작
  const [shownIndex, setShownIndex] = useState(index);
  if (shownIndex !== index) {
    setShownIndex(index);
    setMessages([opening(project)]);
    setDraft("");
    setTurns(0);
    setDone(false);
  }

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!done) return;
    const t = setTimeout(onNext, 5000);
    return () => clearTimeout(t);
  }, [done, onNext]);

  const send = () => {
    const text = draft.trim();
    if (!text || done) return;
    setDraft("");
    const mine: Message = { from: "me", text };
    track("goal_chat", { target: project.name, value: { text, confirm: isConfirm(text) } });

    let reply: Message;
    if (isConfirm(text)) {
      // 다음 프로젝트가 있으면 이름을 알려 준다 (마지막 하나 남았으면 "이제 마지막으로")
      const next = projects[index + 1];
      const nextIsLast = index + 2 === projects.length;
      reply = {
        from: "bot",
        lines: [
          {
            text: `알겠습니다. ‘${project.name}’ 프로젝트의 목표를 생성했습니다!\n목표는 이후 수정할 수 있습니다.${
              next ? ` 이제 ${nextIsLast ? "마지막으로 " : ""}‘${next.name}’ 목표를 함께 정리해 볼게요.` : ""
            }`,
            strong: true,
          },
          { text: last ? "5초 뒤에 완료 화면으로 이동해요." : `5초 뒤에 ‘${next.name}' 프로젝트로 이동해요.`, countdown: true },
        ],
      };
      setDone(true);
    } else {
      const f = FOLLOW_UP[project.id];
      reply =
        turns === 0
          ? { from: "bot", lines: [{ text: f?.ask ?? "말씀하신 방향을 목표에 반영하려고 해요.\n꼭 이루고 싶은 부분은 무엇인가요?" }] }
          : {
              from: "bot",
              lines: [
                { text: f?.reflected ?? "말씀하신 내용을 목표에 반영했어요." },
                { text: f?.goal ?? project.goal!, highlight: true },
                { text: "이 목표로 시작할까요? 바꾸고 싶은 내용이 있으면 알려주세요." },
              ],
            };
      setTurns((n) => n + 1);
    }
    setMessages((m) => [...m, mine]);
    // 스테디가 답을 정리하는 동안(배경이 숨 쉬듯 커졌다 작아짐) 잠시 뒤 답한다
    onThinking?.(true);
    setTimeout(() => {
      setMessages((m) => [...m, reply]);
      onThinking?.(false);
    }, 2200);
  };

  return (
    <>
      {/* 왼쪽 폴더 목록: 지금 프로젝트는 크게, 나머지는 작게·흐리게(끝난 건 체크) */}
      <ul className="absolute top-[252px] left-[314px] flex w-[170px] flex-col items-end gap-[20px]">
        {projects.map((p, i) =>
          i === index ? (
            <li key={p.id} className="transition-opacity duration-300">
              <FolderArt color={p.color!} size={170}>
                <FolderTitle color={p.color!}>{p.folder ?? p.name}</FolderTitle>
              </FolderArt>
            </li>
          ) : (
            <li key={p.id} className="flex items-center gap-[15px] opacity-40 transition-opacity duration-300">
              {i < index && <StepIcon state="done" doneColor={DONE_COLOR[p.color!]} />}
              <FolderArt color={p.color!} size={120}>
                <FolderTitle color={p.color!}>{p.folder ?? p.name}</FolderTitle>
              </FolderArt>
            </li>
          ),
        )}
      </ul>

      <section className="absolute top-[252px] left-[504px] flex h-[468px] w-[623px] flex-col gap-[15px] rounded-[28px] bg-[rgba(41,44,45,0.04)] p-[20px] backdrop-blur-[8px]">
        <div ref={scroller} className="flex min-h-0 flex-1 flex-col gap-[14px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {messages.map((m, i) =>
            m.from === "me" ? (
              <p
                key={i}
                className="max-w-[480px] self-end rounded-[16px] bg-ink px-[14px] py-[10px] text-[13px] leading-[18.85px] font-semibold text-white"
              >
                {m.text}
              </p>
            ) : (
              <div key={i} className="flex flex-col gap-[4px]">
                {m.lines.map((l, j) =>
                  l.highlight ? (
                    <p
                      key={j}
                      className="w-fit max-w-[583px] rounded-[10px] px-[10px] py-[6px] text-[13px] leading-[18.85px] font-bold"
                      style={{ background: c.hiBg, color: c.hiText }}
                    >
                      {l.text}
                    </p>
                  ) : (
                    <p
                      key={j}
                      className={`px-[10px] py-[6px] text-[13px] leading-[18.85px] font-medium whitespace-pre-line ${
                        l.strong ? "max-w-[583px]" : "max-w-[450px]"
                      } ${
                        l.strong ? "text-ink" : "text-[#47484c]"
                      }`}
                    >
                      {l.countdown ? (
                        <GradientText accent={color as Accent}>{l.text}</GradientText>
                      ) : (
                        l.text
                      )}
                    </p>
                  ),
                )}
              </div>
            ),
          )}
        </div>

        <form
          className="flex items-center gap-[10px]"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={done}
            placeholder={`스테디에게 ‘${project.name}’ 프로젝트에 대해 알려주세요.`}
            className="h-[43px] min-w-0 flex-1 rounded-[18px] bg-white/40 px-[16px] text-[13px] font-medium text-ink outline-none placeholder:text-disabled"
          />
          <button
            type="submit"
            aria-label="보내기"
            disabled={done}
            className="flex size-[40px] shrink-0 items-center justify-center rounded-full transition-colors duration-300"
            style={{ background: draft.trim() ? c.sendOn : "#fff", color: draft.trim() ? "#fff" : c.send }}
          >
            <svg width="13" height="15" viewBox="0 0 13 15" fill="none" aria-hidden>
              <path d="M6.5 14.5V1M1 6.5L6.5 1L12 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </section>
    </>
  );
}
