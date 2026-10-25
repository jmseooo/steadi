import Gnb from "../Gnb";
import { ConnectedCard } from "../project-detail/Cards";
import { MomentIcon } from "./MomentShape";
import { momentCards, type Moment } from "./moments";
import Stage from "./Stage";

// 성장의 순간 > 카테고리 (Figma "성장 | 성장의 순간 (카테고리 내부)" 150:2399)
// 아이콘 · 제목 · 설명, 오른쪽 수정·메모·삭제(동작 미정), 아래 저장된 연결 카드(280×350 카드를 224×280으로 축소)
export default function MomentDetail({ moment }: { moment: Moment }) {
  return (
    <Stage>
      <div className="absolute top-[100px] left-[130px] flex flex-col gap-[18px]">
        <MomentIcon shape={moment.shape} />
        <div className="flex flex-col gap-[5px]">
          <h1 className="text-[24px] leading-[33.6px] font-bold">{moment.title}</h1>
          <p className="text-[14px] leading-[19.6px] font-semibold text-ink-muted">{moment.desc.replace("\n", " ")}</p>
        </div>
      </div>

      <div className="absolute top-[181px] right-[120px] flex gap-[8px]">
        {["수정", "메모", "삭제"].map((label) => (
          <button
            key={label}
            type="button"
            className="h-[36px] rounded-[20px] bg-toggle px-[14px] text-[14px] leading-[19.6px] font-semibold text-ink-muted"
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="absolute top-[267px] left-[120px] flex flex-wrap gap-[20px]">
        {momentCards(moment).map((card) => (
          <li key={card.art}>
            <ConnectedCard card={card} size={224} />
          </li>
        ))}
      </ul>

      <div className="absolute top-0 left-0 z-30 w-[1440px]">
        <Gnb active="Growth" />
      </div>
    </Stage>
  );
}
