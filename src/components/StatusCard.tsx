import type { Status } from "@/lib/types";

export const STATUS_INFO: Record<Status, { label: string; desc: string }> = {
  sit: { label: "앉아 있어요", desc: "요약과 퀴즈로 집중해서 공부해요" },
  stand: { label: "서 있어요", desc: "요약을 소리로 들려드려요" },
  tired: { label: "피곤해요", desc: "남은 시간만 보여드릴게요" },
};

interface Props {
  status: Status;
  selected: boolean;
  onSelect: () => void;
}

export default function StatusCard({ status, selected, onSelect }: Props) {
  const { label, desc } = STATUS_INFO[status];
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-2xl px-5 py-4 text-left transition ${
        selected ? "bg-brand text-white" : "bg-surface"
      }`}
    >
      <p className="font-semibold">{label}</p>
      <p className={`mt-0.5 text-sm ${selected ? "text-white/75" : "text-sub"}`}>{desc}</p>
    </button>
  );
}
