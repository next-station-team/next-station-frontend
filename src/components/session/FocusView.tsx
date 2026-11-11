"use client";

import { useState } from "react";
import Button from "@/components/Button";
import type { Block } from "@/lib/types";

interface Props {
  block: Block;
  hasNext: boolean;
  onNext: () => void;
}

export default function FocusView({ block, hasNext, onNext }: Props) {
  const [picked, setPicked] = useState<number>();
  const answered = picked !== undefined;

  return (
    <div className="flex flex-1 flex-col">
      <section className="flex-1 rounded-2xl border border-brand p-5">
        {block.kind === "summary" && (
          <>
            <h3 className="font-bold">{block.title}</h3>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed">{block.body}</p>
          </>
        )}

        {block.kind === "quiz" && (
          <>
            <h3 className="font-bold leading-snug">{block.question}</h3>
            <ul className="mt-4 space-y-2">
              {block.options.map((opt, i) => {
                const state = !answered ? "" : i === block.answer ? "border-brand bg-brand-soft" : i === picked ? "border-red-300 bg-red-50" : "";
                return (
                  <li key={opt}>
                    <button
                      disabled={answered}
                      onClick={() => setPicked(i)}
                      className={`w-full rounded-xl border border-line px-4 py-3 text-left text-[15px] ${state}`}
                    >
                      {opt}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {block.kind === "word" && (
          <>
            <p className="text-2xl font-bold">{block.term}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-sub">{block.meaning}</p>
          </>
        )}
      </section>

      <Button variant="soft" className="mt-3 h-12" disabled={!hasNext} onClick={onNext}>
        다음
      </Button>
    </div>
  );
}
