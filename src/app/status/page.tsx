"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import Screen from "@/components/Screen";
import StatusCard from "@/components/StatusCard";
import { load, save } from "@/lib/db";
import { usePushState } from "@/lib/push";
import { stationById } from "@/lib/trip";
import type { Status } from "@/lib/types";

const STATUSES: Status[] = ["sit", "stand", "tired"];

function StatusForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = stationById(params.get("from") ?? "");
  const to = stationById(params.get("to") ?? "");
  const [status, setStatus] = useState<Status>("sit");
  const muted = usePushState() !== "granted";

  useEffect(() => {
    load("status").then((s) => s && setStatus(s));
  }, []);

  if (!from || !to) return null;

  const start = async () => {
    await Promise.all([
      save("status", status),
      save("session", {
        id: crypto.randomUUID(),
        from: from.id,
        to: to.id,
        status,
        startedAt: Date.now(),
        fixes: [],
      }),
    ]);
    router.replace("/session");
  };

  return (
    <Screen
      title={`${from.name} → ${to.name}`}
      back
      footer={
        <>
          {muted && (
            <p className="mb-3 text-center text-sm text-sub">알림이 꺼져 있어 화면이 켜져 있을 때만 안내돼요</p>
          )}
          <Button onClick={start}>세션 시작</Button>
        </>
      }
    >
      <h2 className="mt-2 text-xl font-bold">지금 어떤 상태예요?</h2>
      <div className="mt-5 space-y-3">
        {STATUSES.map((s) => (
          <StatusCard key={s} status={s} selected={status === s} onSelect={() => setStatus(s)} />
        ))}
      </div>
    </Screen>
  );
}

export default function StatusPage() {
  return (
    <Suspense>
      <StatusForm />
    </Suspense>
  );
}
