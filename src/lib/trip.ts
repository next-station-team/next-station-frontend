import { STATIONS } from "@/data/stations";
import type { Session, Station } from "./types";

export const LEAD_MIN = 5;
/** 일찍 도착하는 쪽이 더 위험하므로 알림을 이만큼 앞당긴다 */
const MARGIN_SEC = 60;

export const stationById = (id: string) => STATIONS.find((s) => s.id === id);

/** 출발역부터 도착역까지, 진행 방향 순서로 */
export function pathBetween(fromId: string, toId: string): Station[] {
  const a = Number(fromId);
  const b = Number(toId);
  const slice = STATIONS.slice(Math.min(a, b), Math.max(a, b) + 1);
  return a <= b ? slice : slice.reverse();
}

const legSecs = (path: Station[], i: number) =>
  Math.min(Number(path[i].id), Number(path[i + 1].id)) === Number(path[i].id)
    ? path[i].secs
    : path[i + 1].secs;

export function estimateTotal(fromId: string, toId: string) {
  const path = pathBetween(fromId, toId);
  const secs = path.slice(0, -1).reduce((sum, _, i) => sum + legSecs(path, i), 0);
  return { path, secs, stops: path.length - 1 };
}

export function progressAt(session: Session, now: number) {
  const path = pathBetween(session.from, session.to);
  const last = session.fixes.at(-1);
  const baseIdx = Math.max(
    0,
    path.findIndex((s) => s.id === last?.stationId),
  );
  const baseAt = last?.at ?? session.startedAt;
  const elapsed = Math.max(0, (now - baseAt) / 1000);

  let idx = baseIdx;
  let travelled = 0;
  while (idx < path.length - 1 && travelled + legSecs(path, idx) <= elapsed) {
    travelled += legSecs(path, idx);
    idx++;
  }

  let toGo = 0;
  for (let i = baseIdx; i < path.length - 1; i++) toGo += legSecs(path, i);

  return {
    path,
    current: path[idx],
    stopsLeft: path.length - 1 - idx,
    remaining: Math.max(0, Math.round(toGo - elapsed)),
  };
}

/** 서버에 등록할 알림 시각(ms). 이미 지난 시각은 제외한다 */
export function alarmTimes(session: Session, now = Date.now()) {
  const { remaining } = progressAt(session, now);
  const arriveAt = now + remaining * 1000;
  return [
    { kind: "lead" as const, at: arriveAt - LEAD_MIN * 60_000 - MARGIN_SEC * 1000 },
    { kind: "last" as const, at: arriveAt - 60_000 - MARGIN_SEC * 1000 },
  ].filter((a) => a.at > now);
}

export const toMinutes = (secs: number) => Math.max(1, Math.ceil(secs / 60));
