import { STATIONS } from "@/data/stations";
import type { Session, Station } from "./types";

export const LEAD_MIN = 5;
/** 서버가 여유 1분을 더해 보내는 알림 시점에 맞춘 화면 전환 기준(초) */
export const FINISH_AT_SECS = (LEAD_MIN + 1) * 60;
export const PREPARE_AT_SECS = 120;

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

/** 서버에 등록할 도착 예정 시각. 알림 여유분은 서버가 계산한다 */
export const arrivalAt = (session: Session, now = Date.now()) =>
  new Date(now + progressAt(session, now).remaining * 1000).toISOString();

export const toMinutes = (secs: number) => Math.max(1, Math.ceil(secs / 60));
