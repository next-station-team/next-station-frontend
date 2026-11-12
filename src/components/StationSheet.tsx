"use client";

import { useState } from "react";
import type { Station } from "@/lib/types";

interface Props {
  title: string;
  stations: Station[];
  disabledId?: string;
  highlightId?: string;
  searchable?: boolean;
  onPick: (s: Station) => void;
  onClose: () => void;
}

export default function StationSheet({
  title,
  stations,
  disabledId,
  highlightId,
  searchable,
  onPick,
  onClose,
}: Props) {
  const [query, setQuery] = useState("");
  const list = stations.filter((s) => s.name.includes(query.trim()));

  return (
    <div className="fixed inset-0 z-10 mx-auto flex max-w-[430px] flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        className="flex max-h-[75dvh] flex-col rounded-t-3xl bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-3 text-lg font-bold">{title}</h2>
        {searchable && (
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="역 이름 검색"
            className="mb-2 h-12 rounded-xl bg-surface px-4 outline-none"
          />
        )}
        <ul className="overflow-y-auto">
          {list.map((s) => (
            <li key={s.id}>
              <button
                disabled={s.id === disabledId}
                onClick={() => onPick(s)}
                className={`flex h-12 w-full items-center justify-between px-1 text-left disabled:text-sub/40 ${
                  s.id === highlightId ? "font-bold text-brand" : ""
                }`}
              >
                {s.name}
                {s.id === highlightId && <span className="text-xs">현재 추정</span>}
              </button>
            </li>
          ))}
          {!list.length && <li className="py-6 text-center text-sm text-sub">지원 예정인 역이에요</li>}
        </ul>
      </div>
    </div>
  );
}
