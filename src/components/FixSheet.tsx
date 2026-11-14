"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { toMinutes } from "@/lib/trip";
import type { Station } from "@/lib/types";

interface Props {
  /** 현재 추정 역부터 앞으로 지나갈 역 (이미 지난 역 포함 가능) */
  stations: Station[];
  currentId: string;
  /** 역까지 걸리는 시간(초) */
  etaOf: (id: string) => number;
  onPick: (id: string) => void;
  onClose: () => void;
}

export default function FixSheet({ stations, currentId, etaOf, onPick, onClose }: Props) {
  const [picked, setPicked] = useState(currentId);

  return (
    <div className="fixed inset-0 z-10 mx-auto flex max-w-[430px] flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        className="rounded-t-3xl bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold">지금 어느 역이에요?</h2>
        <p className="mt-1 text-sm text-sub">실제 위치를 고르면 남은 시간과 알림을 다시 계산해요</p>
        <ul className="mt-4 space-y-2">
          {stations.map((s) => {
            const on = picked === s.id;
            const eta = etaOf(s.id);
            return (
              <li key={s.id}>
                <button
                  onClick={() => setPicked(s.id)}
                  className={`flex h-14 w-full items-center gap-3 rounded-xl px-4 text-left ${on ? "bg-brand-soft" : "bg-surface"}`}
                >
                  <span className={`size-4 rounded-full border-2 ${on ? "border-brand bg-brand" : "border-line bg-white"}`} />
                  <span className="flex-1 font-medium">{s.name}</span>
                  <span className="text-sm text-sub">{s.id === currentId ? "현재 추정" : `${toMinutes(eta)}분 후`}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <Button className="mt-4" onClick={() => onPick(picked)}>선택한 역으로 보정</Button>
      </div>
    </div>
  );
}
