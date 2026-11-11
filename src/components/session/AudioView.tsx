"use client";

import { useEffect, useRef, useState } from "react";
import { splitSentences } from "@/lib/content";
import { readSentences } from "@/lib/tts";

interface Props {
  title: string;
  body: string;
  pos: number;
  closing: boolean;
  hasNext: boolean;
  onPos: (pos: number) => void;
  onNext: () => void;
}

const BARS = [30, 55, 40, 75, 50, 90, 60, 35, 70, 45, 80, 30, 55, 40, 65];

export default function AudioView({ title, body, pos, closing, hasNext, onPos, onNext }: Props) {
  const sentences = splitSentences(body);
  const [playing, setPlaying] = useState(false);
  const reader = useRef<ReturnType<typeof readSentences>>(undefined);

  useEffect(() => () => reader.current?.stop(), []);
  useEffect(() => {
    if (closing && playing) reader.current?.pause();
  }, [closing, playing]);

  const play = () => {
    setPlaying(true);
    reader.current = readSentences(
      sentences,
      pos,
      onPos,
      (i) => {
        setPlaying(false);
        onPos(i);
      },
    );
  };

  const move = (to: number) => {
    reader.current?.stop();
    setPlaying(false);
    onPos(Math.min(Math.max(to, 0), sentences.length - 1));
  };

  return (
    <div className="flex flex-1 flex-col rounded-2xl border border-brand p-5">
      <h3 className="font-bold">{title}</h3>
      <p className="mt-3 line-clamp-4 text-[15px] leading-relaxed text-sub">{sentences[pos]}</p>

      <div className="my-auto flex h-24 items-center justify-center gap-1" aria-hidden>
        {BARS.map((h, i) => (
          <span
            key={i}
            style={{ height: `${h}%` }}
            className={`w-1.5 rounded-full ${playing ? "bg-brand" : "bg-brand/25"}`}
          />
        ))}
      </div>

      <p className="text-center text-xs text-sub">
        {pos + 1} / {sentences.length} 문장
      </p>
      <div className="mt-3 flex items-center justify-center gap-6">
        <button aria-label="이전 문장" className="p-3 text-xl" onClick={() => move(pos - 1)}>
          ⏮
        </button>
        <button
          aria-label={playing ? "멈춤" : "재생"}
          disabled={closing && !playing}
          onClick={playing ? () => reader.current?.pause() : play}
          className="grid size-14 place-items-center rounded-full bg-brand text-xl text-white disabled:bg-brand/40"
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <button aria-label="다음 요약" disabled={!hasNext} className="p-3 text-xl disabled:opacity-30" onClick={onNext}>
          ⏭
        </button>
      </div>
    </div>
  );
}
