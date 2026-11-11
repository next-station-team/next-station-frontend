"use client";

import Link from "next/link";
import Button from "@/components/Button";
import Logo from "@/components/Logo";
import Screen from "@/components/Screen";
import { useStored } from "@/lib/db";
import { usePushState } from "@/lib/push";
import { stationById } from "@/lib/trip";

const KIND_LABEL = { summary: "요약", quiz: "퀴즈", word: "단어" } as const;

export default function Home() {
  const session = useStored("session");
  const progress = useStored("progress");
  const blocks = useStored("blocks");
  const materials = useStored("materials");
  const push = usePushState();

  const resumeBlock = blocks.value?.find((b) => b.id === progress.value?.blockId);
  const resumeTitle = materials.value?.find((m) => m.id === progress.value?.materialId)?.title;
  const needsSetup = push && push !== "granted";

  return (
    <Screen title="" right={<Logo />}>
      {needsSetup && (
        <Link href="/onboarding" className="mt-2 block rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand">
          {push === "needs-install" ? "홈 화면에 추가해야 알림을 받을 수 있어요" : "알림을 켜면 화면이 꺼져 있어도 하차 알림이 와요"}
          <span className="ml-1 font-semibold">설정하기 ›</span>
        </Link>
      )}

      <h2 className="mt-8 text-2xl font-bold leading-snug">오늘 통학,<br />어떻게 보낼까요?</h2>

      {session.value && (
        <Link href="/session" className="mt-8 block rounded-2xl bg-navy px-5 py-4 text-white">
          <p className="text-sm text-white/70">진행 중인 세션</p>
          <p className="mt-1 font-semibold">
            {stationById(session.value.from)?.name} → {stationById(session.value.to)?.name}
          </p>
        </Link>
      )}

      {resumeBlock && !session.value && (
        <section className="mt-8 rounded-2xl border border-line px-5 py-4">
          <p className="text-sm text-sub">이어 하기</p>
          <p className="mt-1 font-semibold">{resumeTitle}</p>
          <p className="text-sm text-sub">{KIND_LABEL[resumeBlock.kind]}부터 이어서 시작해요</p>
        </section>
      )}

      <Link href="/materials/new" className="mt-3 flex items-center justify-between rounded-2xl bg-surface px-5 py-4">
        <span>
          <span className="block font-semibold">학습 자료 추가</span>
          <span className="text-sm text-sub">
            {materials.value?.length ? `${materials.value.length}개 등록됨` : "통학 전에 미리 만들어 두세요"}
          </span>
        </span>
        <span className="text-sub">›</span>
      </Link>

      <div className="mt-auto pb-6 pt-10">
        <Link href="/route">
          <Button>세션 시작</Button>
        </Link>
      </div>
    </Screen>
  );
}
