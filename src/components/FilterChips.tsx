"use client";

import { useLayoutEffect, useRef, useState } from "react";

// 필터 칩: 검은 알약이 선택된 칩 뒤로 미끄러지고, 선택된 칩 호버 시 알약도 함께 확대
export default function FilterChips<T extends string>({
  items,
  value,
  onChange,
}: {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  const pill = useIndicator(items.indexOf(value));

  return (
    <div
      role="tablist"
      className="relative flex flex-wrap items-center gap-[8px] [&:has(>button[aria-selected=true]:hover)>span]:scale-108"
    >
      {pill.rect && (
        <span
          aria-hidden
          className={`absolute top-0 left-0 h-[36px] rounded-[20px] bg-ink ${SLIDE}`}
          style={{ width: pill.rect.width, translate: `${pill.rect.left}px ${pill.rect.top}px` }}
        />
      )}
      {items.map((item, i) => {
        const active = item === value;
        return (
          <button
            key={item}
            ref={pill.ref(i)}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item)}
            className={`relative h-[36px] rounded-[20px] px-[14px] text-[14px] leading-[19.6px] font-semibold transition-[background-color,color,scale] duration-300 ${
              active ? "text-white" : "bg-toggle text-ink-muted hover:text-ink"
            }`}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

const SLIDE = "transition-[translate,width,scale] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]";

// 선택 표시(알약)가 index번째 칩 뒤로 미끄러지도록 위치·폭을 잰다 (웹폰트 로드 후 한 번 더)
function useIndicator(index: number) {
  const els = useRef<(HTMLElement | null)[]>([]);
  const [rect, setRect] = useState<{ left: number; top: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = els.current[index];
      if (el) setRect({ left: el.offsetLeft, top: el.offsetTop, width: el.offsetWidth });
    };
    measure();
    let cancelled = false;
    document.fonts.ready.then(() => !cancelled && measure());
    return () => {
      cancelled = true;
    };
  }, [index]);

  return { rect, ref: (i: number) => (el: HTMLElement | null) => void (els.current[i] = el) };
}
