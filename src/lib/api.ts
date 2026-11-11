import type { Block } from "./types";

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.json();
}

export function deviceId() {
  let id = localStorage.getItem("device-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device-id", id);
  }
  return id;
}

export const api = {
  subscribe: (subscription: PushSubscriptionJSON) =>
    post("/api/push/subscribe", { deviceId: deviceId(), subscription }),

  /** 기존 예약을 지우고 새 시각으로 다시 등록한다 */
  syncAlarms: (sessionId: string, alarms: { kind: "lead" | "last"; at: number }[]) =>
    post("/api/alarms", { deviceId: deviceId(), sessionId, alarms }),

  generate: (text: string) =>
    post<{ title: string; blocks: Omit<Block, "id" | "materialId">[] }>(
      "/api/generate",
      { text },
    ),
};
