"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Screen from "@/components/Screen";
import FixSheet from "@/components/FixSheet";
import ProgressLine from "@/components/ProgressLine";
import { STATUS_INFO } from "@/components/StatusCard";
import AudioView from "@/components/session/AudioView";
import FocusView from "@/components/session/FocusView";
import { api } from "@/lib/api";
import { pickBlocks } from "@/lib/content";
import { clear, load, save, useStored } from "@/lib/db";
import { useAlarmSync, useNow } from "@/lib/hooks";
import { FINISH_AT_SECS, PREPARE_AT_SECS, progressAt, stationById, toMinutes } from "@/lib/trip";
import { MODE_OF, type Progress, type Status } from "@/lib/types";

const STATUSES: Status[] = ["sit", "stand", "tired"];

function SessionView() {
  const router = useRouter();
  const now = useNow();
  const session = useStored("session");
  const blocks = useStored("blocks");
  const [cursor, setCursor] = useState<Progress>();
  const [fixing, setFixing] = useState(false);
  const pending = useAlarmSync(session.value);

  useEffect(() => {
    load("progress").then(setCursor);
  }, []);

  const s = session.value;
  const trip = useMemo(() => (s ? progressAt(s, now) : null), [s, now]);
  const mode = s ? MODE_OF[s.status] : "rest";
  const closing = !!trip && trip.remaining < FINISH_AT_SECS;

  const queue = useMemo(() => {
    const picked = pickBlocks(trip?.remaining ?? 0, blocks.value ?? []);
    return mode === "audio" ? picked.filter((b) => b.kind === "summary") : picked;
  }, [trip?.remaining, blocks.value, mode]);

  const arriving = !!trip && trip.remaining <= PREPARE_AT_SECS;
  useEffect(() => {
    if (!arriving) return;
    const keep = cursor ?? (queue[0] && { blockId: queue[0].id, materialId: queue[0].materialId, pos: 0 });
    Promise.resolve(keep && save("progress", keep)).then(() => router.replace("/arrival"));
  }, [arriving]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!session.ready) return null;
  if (!s || !trip) {
    router.replace("/");
    return null;
  }

  const idx = Math.max(0, queue.findIndex((b) => b.id === cursor?.blockId));
  const block = queue[idx];
  const pos = cursor?.blockId === block?.id ? cursor.pos : 0;

  const moveTo = (blockId: string, materialId: string, p = 0) => {
    const next = { blockId, materialId, pos: p };
    setCursor(next);
    save("progress", next);
  };

  const setStatus = (status: Status) => {
    session.update({ ...s, status });
    save("status", status);
  };

  const fix = (stationId: string) => {
    session.update({ ...s, fixes: [...s.fixes, { stationId, at: Date.now() }] });
    setFixing(false);
  };

  const finish = async () => {
    if (block) await save("progress", { blockId: block.id, materialId: block.materialId, pos });
    api.cancelAlarms(s.id).catch(() => {});
    await clear("session");
    router.replace("/");
  };

  const { current, remaining, stopsLeft, path } = trip;
  const etaTo = (id: string) => remaining - progressAt({ ...s, fixes: [{ stationId: id, at: now }] }, now).remaining;

  return (
    <Screen
      title={`${stationById(s.from)?.name} → ${stationById(s.to)?.name}`}
      right={
        <div className="flex gap-1 text-xs font-medium">
          {STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => setStatus(st)}
              className={`h-8 rounded-full px-3 ${s.status === st ? "bg-brand text-white" : "bg-surface text-sub"}`}
            >
              {STATUS_INFO[st].label.replace(" 있어요", "").replace("해요", "")}
            </button>
          ))}
        </div>
      }
      footer={
        <div className="space-y-2">
          {closing && (
            <Button variant="soft" onClick={finish}>
              {block ? "저장하고 멈춤" : "세션 종료"}
            </Button>
          )}
          <Button onClick={() => setFixing(true)}>지금 {current.name}역 · 위치 보정</Button>
        </div>
      }
    >
      <div className="py-4">
        <p className={`font-bold text-navy ${mode === "rest" ? "mt-16 text-center text-8xl" : "text-5xl"}`}>
          {remaining < 60 ? "곧 도착" : `${toMinutes(remaining)}분`}
        </p>
        <p className={`mt-2 text-sm text-sub ${mode === "rest" ? "text-center" : ""}`}>
          {stopsLeft}개 역 남음 · 현재 {current.name}역 추정
        </p>
        {pending && <p className="mt-1 text-xs text-brand">알림 시각 반영 대기 중</p>}
        <div className="mt-5">
          <ProgressLine path={path} currentId={current.id} />
        </div>
        {closing && mode !== "rest" && (
          <p className="mt-3 rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand">
            곧 도착해요. 새 콘텐츠는 시작하지 않아요.
          </p>
        )}
      </div>

      {mode === "focus" && block && (
        <FocusView
          key={block.id}
          block={block}
          hasNext={idx < queue.length - 1 && !closing}
          onNext={() => moveTo(queue[idx + 1].id, queue[idx + 1].materialId)}
        />
      )}

      {mode === "audio" && block?.kind === "summary" && (
        <AudioView
          key={block.id}
          title={block.title}
          body={block.body}
          pos={pos}
          closing={closing}
          hasNext={idx < queue.length - 1 && !closing}
          onPos={(p) => moveTo(block.id, block.materialId, p)}
          onNext={() => moveTo(queue[idx + 1].id, queue[idx + 1].materialId)}
        />
      )}

      {mode !== "rest" && !block && (
        <p className="mt-10 text-center text-sm text-sub">
          {closing ? "편하게 도착을 기다려요" : "등록된 학습 자료가 없어요"}
        </p>
      )}

      {fixing && (
        <FixSheet
          stations={path.slice(path.findIndex((st) => st.id === current.id)).slice(0, 4)}
          currentId={current.id}
          etaOf={(id) => etaTo(id)}
          onPick={fix}
          onClose={() => setFixing(false)}
        />
      )}
    </Screen>
  );
}

export default function SessionPage() {
  return (
    <Suspense>
      <SessionView />
    </Suspense>
  );
}
