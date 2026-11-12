"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Screen from "@/components/Screen";
import StationSheet from "@/components/StationSheet";
import { STATIONS } from "@/data/stations";
import { estimateTotal, stationById, toMinutes } from "@/lib/trip";

type Field = "from" | "to";

export default function RoutePage() {
  const router = useRouter();
  const [ids, setIds] = useState<Record<Field, string>>({ from: "", to: "" });
  const [open, setOpen] = useState<Field>();

  const ready = ids.from && ids.to;
  const trip = ready ? estimateTotal(ids.from, ids.to) : null;
  const other = (f: Field) => ids[f === "from" ? "to" : "from"];

  return (
    <Screen
      title="구간 선택"
      back
      footer={
        <Button disabled={!trip} onClick={() => router.push(`/status?from=${ids.from}&to=${ids.to}`)}>
          이 구간으로 시작
        </Button>
      }
    >
      <div className="mt-2 grid grid-cols-2 gap-3">
        {(["from", "to"] as const).map((f) => (
          <button key={f} onClick={() => setOpen(f)} className="rounded-2xl bg-surface px-4 py-3 text-left">
            <span className="text-xs text-sub">{f === "from" ? "출발" : "도착"}</span>
            <span className={`mt-1 block text-lg font-semibold ${ids[f] ? "" : "text-sub/50"}`}>
              {stationById(ids[f])?.name ?? "역 선택"}
            </span>
          </button>
        ))}
      </div>

      {trip && (
        <section className="mt-6 rounded-3xl bg-navy p-6 text-white">
          <p className="text-sm text-white/70">예상 소요 시간</p>
          <p className="mt-1 text-4xl font-bold">약 {toMinutes(trip.secs)}분</p>
          <p className="mt-1 text-sm text-white/70">{trip.stops}개 역 이동</p>
          <div className="mt-6 flex items-center">
            {trip.path.map((s, i) => (
              <div key={s.id} className="flex flex-1 items-center last:flex-none">
                <span className={`size-2 rounded-full ${i === 0 || i === trip.path.length - 1 ? "bg-white" : "bg-white/35"}`} />
                {i < trip.path.length - 1 && <span className="h-px flex-1 bg-white/25" />}
              </div>
            ))}
          </div>
        </section>
      )}

      {open && (
        <StationSheet
          title={open === "from" ? "출발역" : "도착역"}
          stations={STATIONS}
          disabledId={other(open)}
          searchable
          onClose={() => setOpen(undefined)}
          onPick={(s) => {
            setIds((prev) => ({ ...prev, [open]: s.id }));
            setOpen(undefined);
          }}
        />
      )}
    </Screen>
  );
}
