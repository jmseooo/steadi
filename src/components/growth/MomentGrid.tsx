import Link from "next/link";
import { MomentShape } from "./MomentShape";
import { MOMENTS } from "./moments";

// 성장의 순간 카테고리 카드 220×220 3열 (Figma 150:2171). 호버하면 검게 뒤집히고(150:2285) 누르면 카테고리 화면으로
export default function MomentGrid() {
  return (
    <ul className="absolute top-[268px] left-[370px] grid w-[700px] grid-cols-3 gap-[20px]">
      {MOMENTS.map((m) => (
        <li key={m.slug}>
          <Link
            href={`/growth/moments/${m.slug}`}
            className="group relative block size-[220px] overflow-hidden rounded-[28px] bg-[rgba(41,44,45,0.02)] shadow-[inset_0_0_50px_#fff,0_4px_30px_rgba(0,0,0,0.03)] backdrop-blur-[10px] transition-[background-color,box-shadow] duration-300 hover:bg-ink hover:shadow-[inset_0_0_50px_transparent,0_4px_30px_rgba(0,0,0,0.03)]"
          >
            <MomentShape shape={m.shape} tone="dark" />
            <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <MomentShape shape={m.shape} tone="light" />
            </span>
            <div className="absolute top-[22px] left-[25px] flex flex-col items-start gap-[10px]">
              <div className="flex flex-col gap-[5px]">
                <h3 className="text-[18px] leading-[1.45] font-semibold transition-colors duration-300 group-hover:text-white">
                  {m.title}
                </h3>
                <p className="text-[13px] leading-[1.45] whitespace-pre text-ink-muted transition-colors duration-300 group-hover:text-line">
                  {m.desc}
                </p>
              </div>
              <span className="rounded-[6px] bg-[rgba(26,26,26,0.05)] px-[7px] pt-[4px] pb-[5px] text-[11px] leading-[1.4] font-semibold text-ink-muted transition-colors duration-300 group-hover:bg-white/10 group-hover:text-line">
                저장된 경험 {m.cards.length}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
