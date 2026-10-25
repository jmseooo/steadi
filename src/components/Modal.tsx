"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

// 가운데 창 (Figma 프로필·경험 카드 창 800×650): 화면 30% 검정 위 흰 판, 오른쪽 위 42px 닫기
// 바깥을 누르거나 Esc로 닫히고, 열려 있는 동안 뒤 페이지는 스크롤되지 않는다.
// 성장 화면처럼 축소된 무대 안에서 열어도 창은 화면 기준이 되도록 body에 붙인다
export default function Modal({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-[16px]" onClick={onClose}>
      <div
        role="dialog"
        aria-modal
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-[650px] max-h-full w-[800px] max-w-full overflow-hidden rounded-[46px] bg-white/95 shadow-[inset_0_0_50px_#fff,0_4px_30px_rgba(0,0,0,0.03)] backdrop-blur-[10px]"
      >
        {children}
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute top-[30px] right-[30px] z-10 flex size-[42px] items-center justify-center rounded-full bg-disabled shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M1 1L11 11M11 1L1 11" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>,
    document.body,
  );
}
