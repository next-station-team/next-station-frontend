import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "./api";
import { arrivalAt } from "./trip";
import type { Session } from "./types";

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

/** 세션이 바뀌거나 보정될 때마다 서버 알림 예약을 다시 등록한다. 요청은 한 번에 하나만 보낸다 */
export function useAlarmSync(session: Session | undefined) {
  const [pending, setPending] = useState(false);
  const id = session?.id;
  const fixCount = session?.fixes.length;
  const latest = useRef(session);
  const busy = useRef(false);
  const dirty = useRef(false);

  useEffect(() => {
    latest.current = session;
  });

  useEffect(() => {
    if (!id) return;
    let alive = true;

    const sync = async () => {
      if (busy.current) {
        dirty.current = true;
        return;
      }
      busy.current = true;
      do {
        dirty.current = false;
        const s = latest.current;
        if (!s) break;
        try {
          await api.reserveAlarms(s.id, arrivalAt(s));
          if (alive) setPending(false);
        } catch (e) {
          const stale = e instanceof ApiError && e.code === "INVALID_ARRIVAL_TIME";
          if (alive) setPending(!stale);
        }
      } while (dirty.current);
      busy.current = false;
    };

    sync();
    window.addEventListener("online", sync);
    return () => {
      alive = false;
      window.removeEventListener("online", sync);
    };
  }, [id, fixCount]);

  return pending;
}
