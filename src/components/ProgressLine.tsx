import type { Station } from "@/lib/types";

interface Props {
  path: Station[];
  currentId: string;
}

export default function ProgressLine({ path, currentId }: Props) {
  const idx = Math.max(0, path.findIndex((s) => s.id === currentId));
  return (
    <div>
      <div className="flex items-center">
        {path.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center last:flex-none">
            <span className={`size-2 shrink-0 rounded-full ${i <= idx ? "bg-brand" : "bg-line"} ${i === idx ? "ring-4 ring-brand/20" : ""}`} />
            {i < path.length - 1 && <span className={`h-px flex-1 ${i < idx ? "bg-brand" : "bg-line"}`} />}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs text-sub">
        <span>{path[0].name}</span>
        <span>{path[path.length - 1].name}</span>
      </div>
    </div>
  );
}
