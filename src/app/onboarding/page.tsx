"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Screen from "@/components/Screen";
import { enablePush } from "@/lib/push";

const GUIDE = {
  iphone: ["Safari 하단의 공유 버튼을 눌러요", "'홈 화면에 추가'를 선택해요", "홈 화면의 다음역 아이콘으로 열어요"],
  android: ["Chrome 오른쪽 위 메뉴를 열어요", "'앱 설치' 또는 '홈 화면에 추가'를 선택해요", "홈 화면의 다음역 아이콘으로 열어요"],
};

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<"install" | "permission">("install");
  const [device, setDevice] = useState<keyof typeof GUIDE>(() =>
    typeof navigator !== "undefined" && /iphone|ipad/i.test(navigator.userAgent) ? "iphone" : "android",
  );
  const [failed, setFailed] = useState(false);

  const allow = async () => {
    const ok = await enablePush().catch(() => false);
    if (ok) router.replace("/");
    else setFailed(true);
  };

  if (step === "permission") {
    return (
      <div className="flex min-h-dvh flex-col justify-between bg-brand px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-24 text-white">
        <div>
          <h1 className="text-2xl font-bold leading-snug">내릴 역 전에<br />먼저 알려드릴게요</h1>
          <p className="mt-3 text-white/75">화면이 꺼져 있어도 도착 5분 전과 1분 전에 알림이 와요</p>
          {failed && (
            <p className="mt-6 rounded-xl bg-white/15 p-4 text-sm">
              알림이 꺼져 있어요. 이대로 쓰면 앱 화면이 켜져 있을 때만 안내돼요.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Button variant="white" onClick={allow}>알림 허용하기</Button>
          <button className="h-12 w-full text-sm text-white/75" onClick={() => router.replace("/")}>
            나중에 할게요
          </button>
        </div>
      </div>
    );
  }

  return (
    <Screen footer={<Button onClick={() => setStep("permission")}>추가했어요</Button>}>
      <h1 className="mt-6 text-2xl font-bold leading-snug">홈 화면에 추가하고<br />알림을 받아보세요</h1>
      <p className="mt-2 text-sub">앱처럼 열고, 하차 알림도 받을 수 있어요</p>

      <div className="mt-8 grid grid-cols-2 rounded-xl bg-surface p-1 text-sm font-medium">
        {(["iphone", "android"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDevice(d)}
            className={`h-10 rounded-lg ${device === d ? "bg-navy text-white" : "text-sub"}`}
          >
            {d === "iphone" ? "iPhone Safari" : "Android Chrome"}
          </button>
        ))}
      </div>

      <ol className="mt-6 space-y-3">
        {GUIDE[device].map((text, i) => (
          <li key={text} className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-4">
            <span className="grid size-7 place-items-center rounded-full bg-brand text-sm font-bold text-white">
              {i + 1}
            </span>
            <span className="text-[15px]">{text}</span>
          </li>
        ))}
      </ol>
    </Screen>
  );
}
