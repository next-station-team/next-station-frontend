"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { api } from "@/lib/api";
import { clear, useStored } from "@/lib/db";
import { stationById } from "@/lib/trip";

export default function Arrival() {
  const router = useRouter();
  const session = useStored("session");
  const progress = useStored("progress");
  const blocks = useStored("blocks");
  const saved = blocks.value?.some((b) => b.id === progress.value?.blockId);

  const end = async () => {
    if (session.value) api.cancelAlarms(session.value.id).catch(() => {});
    await clear("session");
    router.replace("/");
  };

  return (
    <div className="flex min-h-dvh flex-col justify-between bg-brand px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-28 text-center text-white">
      <div>
        <h1 className="text-3xl font-bold">곧 {stationById(session.value?.to ?? "")?.name ?? "도착"}역이에요</h1>
        <p className="mt-3 text-white/75">곧 도착해요. 내릴 준비를 해 주세요</p>
        <div className="mx-auto mt-10 rounded-2xl bg-white/15 px-5 py-4 text-sm">
          {saved ? "학습 중이던 위치를 저장했어요. 다음에 이어서 시작해요" : "편안한 하차 되세요"}
        </div>
      </div>
      <Button variant="white" onClick={end}>세션 종료</Button>
    </div>
  );
}
