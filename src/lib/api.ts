import type { Block } from "./types";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
  }
}

export interface Alarm {
  alarmId: string;
  sessionId: string;
  type: "FINISH" | "PREPARE";
  scheduledAt: string;
  expiresAt: string;
  arrivalAt: string;
  minutesBeforeArrival: number;
  status: "PENDING" | "SENT" | "FAILED" | "EXPIRED";
  attemptCount: number;
  sentAt: string | null;
  lastErrorCode: string | null;
}

export function deviceId() {
  let id = localStorage.getItem("nextstation.deviceId");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("nextstation.deviceId", id);
  }
  return id;
}

interface Options {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  device?: boolean;
}

// /api/* 는 next.config.ts의 rewrites로 백엔드에 전달된다.
async function request<T>(path: string, { method = "GET", body, device }: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (device) headers["X-Device-Id"] = deviceId();

  const res = await fetch(path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "omit",
  });
  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => undefined);
  if (!res.ok) throw new ApiError(res.status, data?.code ?? "HTTP_ERROR");
  return data as T;
}

export const api = {
  vapidKey: () => request<{ publicKey: string }>("/api/push/vapid-public-key"),

  subscribe: (endpoint: string, keys: { p256dh: string; auth: string }) =>
    request("/api/push/subscriptions", { method: "POST", body: { deviceId: deviceId(), endpoint, keys } }),

  testPush: () => request("/api/push/test", { method: "POST", device: true }),

  /** 같은 sessionId로 다시 호출하면 보내지 않은 알림을 지우고 새로 등록한다 */
  reserveAlarms: (sessionId: string, arrivalAt: string, reminderMinutes?: 3 | 5 | 7) =>
    request<Alarm[]>(`/api/sessions/${sessionId}/alarms`, {
      method: "PUT",
      device: true,
      body: { arrivalAt, reminderMinutes },
    }),

  cancelAlarms: (sessionId: string) =>
    request<void>(`/api/sessions/${sessionId}/alarms`, { method: "DELETE", device: true }),

  // 백엔드 명세에 아직 없는 API. 경로는 AI 파트와 합의 후 맞춘다.
  generate: (text: string) =>
    request<{ title: string; blocks: Omit<Block, "id" | "materialId">[] }>("/api/generate", {
      method: "POST",
      body: { text },
    }),
};
