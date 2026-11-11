import { useEffect, useRef, useState } from "react";
import { api } from "./api";
import { alarmTimes } from "./trip";
import type { Session } from "./types";

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/** 세션이 바뀌거나 보정될 때마다 서버 알림 예약을 다시 등록한다. 연결이 끊기면 복구 후 재시도한다 */
export function useAlarmSync(session: Session | undefined) {
  const [pending, setPending] = useState(false);
  const id = session?.id;
  const fixCount = session?.fixes.length;
  const latest = useRef(session);
  useEffect(() => {
    latest.current = session;
  });

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const sync = () => {
      const s = latest.current;
      if (!s) return;
      api
        .syncAlarms(s.id, alarmTimes(s))
        .then(() => !cancelled && setPending(false))
        .catch(() => !cancelled && setPending(true));
    };
    sync();
    window.addEventListener("online", sync);
    return () => {
      cancelled = true;
      window.removeEventListener("online", sync);
    };
  }, [id, fixCount]);

  return pending;
}
