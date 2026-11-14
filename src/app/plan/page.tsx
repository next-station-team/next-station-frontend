"use client";

import { useState } from "react";
import Screen from "@/components/Screen";
import { pickBlocks, RULES } from "@/lib/content";
import { useStored } from "@/lib/db";
import { toMinutes } from "@/lib/trip";
import type { Block } from "@/lib/types";

const KIND_LABEL: Record<Block["kind"], string> = { summary: "요약 카드", quiz: "퀴즈", word: "단어 카드" };
const TABS = [...RULES.map((r) => ({ label: r.label, secs: r.minSecs })), { label: "5분 미만", secs: 0 }];

export default function Plan() {
  const blocks = useStored("blocks");
  const [tab, setTab] = useState(0);
  const list = pickBlocks(TABS[tab].secs, blocks.value ?? []);

  return (
    <Screen title="남은 시간별 콘텐츠" back>
      <div className="mt-2 grid grid-cols-4 rounded-xl bg-surface p-1 text-xs font-medium">
        {TABS.map((t, i) => (
          <button key={t.label} onClick={() => setTab(i)} className={`h-9 rounded-lg ${tab === i ? "bg-white text-brand shadow-sm" : "text-sub"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <p className="mt-5 text-sm text-sub">
        {TABS[tab].secs ? "이 시간대에는 이렇게 구성돼요" : "새 콘텐츠를 시작하지 않고 마무리해요"}
      </p>

      <ol className="mt-3 space-y-2">
        {list.map((b, i) => (
          <li key={b.id} className="flex items-center gap-3 rounded-2xl border border-line px-4 py-4">
            <span className="text-sm font-bold text-brand">{i + 1}</span>
            <span className="flex-1">{KIND_LABEL[b.kind]}</span>
            <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand">{toMinutes(b.seconds)}분</span>
          </li>
        ))}
      </ol>
      {TABS[tab].secs > 0 && !list.length && (
        <p className="mt-10 text-center text-sm text-sub">등록된 학습 자료가 없어요</p>
      )}
    </Screen>
  );
}
