"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Screen from "@/components/Screen";
import { api } from "@/lib/api";
import { load, save } from "@/lib/db";

const MAX = 5000;

export default function NewMaterial() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setBusy(true);
    setError("");
    try {
      const { title, blocks } = await api.generate(text);
      const materialId = crypto.randomUUID();
      const [materials = [], saved = []] = await Promise.all([load("materials"), load("blocks")]);
      await Promise.all([
        save("materials", [...materials, { id: materialId, title, text, createdAt: Date.now() }]),
        save("blocks", [...saved, ...blocks.map((b) => ({ ...b, id: crypto.randomUUID(), materialId }) as (typeof saved)[number])]),
      ]);
      router.replace("/");
    } catch {
      setError("학습 자료를 만들지 못했어요. 잠시 후 다시 시도해 주세요.");
      setBusy(false);
    }
  };

  return (
    <Screen
      title="학습 자료 등록"
      back
      footer={
        <Button disabled={!text.trim() || busy} onClick={generate}>
          {busy ? "만드는 중..." : "AI로 학습 만들기"}
        </Button>
      }
    >
      <textarea
        value={text}
        maxLength={MAX}
        onChange={(e) => setText(e.target.value)}
        placeholder="강의 노트나 교재 내용을 붙여 넣어 주세요"
        className="mt-2 min-h-[55dvh] w-full resize-none rounded-2xl border border-line p-4 text-[15px] leading-relaxed outline-none focus:border-brand"
      />
      <div className="mt-2 flex justify-between text-xs text-sub">
        <span className="text-red-500">{error}</span>
        <span>{text.length.toLocaleString()} / {MAX.toLocaleString()}</span>
      </div>
    </Screen>
  );
}
