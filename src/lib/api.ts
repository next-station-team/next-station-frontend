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

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type BlockDraft = DistributiveOmit<Block, "id" | "materialId">;

/** POST /api/learning-content/generate 응답 (AI 레포 samples/api-response.example.json) */
interface GeneratedContent {
  contentId: string;
  title: string;
  topics: {
    id: string;
    title: string;
    summaryCards: { id: string; heading: string; body: string }[];
    ttsScript: string;
  }[];
  quizzes: {
    id: string;
    topicId: string;
    question: string;
    options: string[];
    answerIndex: number;
    explanation: string;
    evidence: string;
  }[];
  terms: { id: string; topicId: string; term: string; definition: string }[];
  blocks: {
    id: string;
    topicId: string;
    type: "SUMMARY" | "AUDIO" | "QUIZ";
    itemCount: number;
    estimatedSeconds: number;
  }[];
}

const WORD_SECONDS = 15;

/** 주제 순서대로 요약 카드 -> 퀴즈 -> 단어 카드를 Block으로 펼친다 */
function toBlocks(c: GeneratedContent): BlockDraft[] {
  const perItem = (topicId: string, type: "SUMMARY" | "QUIZ", fallback: number) => {
    const b = c.blocks.find((x) => x.topicId === topicId && x.type === type);
    return b && b.itemCount > 0 ? Math.max(10, Math.round(b.estimatedSeconds / b.itemCount)) : fallback;
  };

  return c.topics.flatMap((t) => [
    ...t.summaryCards.map(
      (card): BlockDraft => ({
        kind: "summary",
        title: card.heading,
        body: card.body,
        seconds: perItem(t.id, "SUMMARY", 30),
      }),
    ),
    ...c.quizzes
      .filter((q) => q.topicId === t.id)
      .map(
        (q): BlockDraft => ({
          kind: "quiz",
          question: q.question,
          options: q.options,
          answer: q.answerIndex,
          seconds: perItem(t.id, "QUIZ", 30),
        }),
      ),
    ...c.terms
      .filter((w) => w.topicId === t.id)
      .map(
        (w): BlockDraft => ({
          kind: "word",
          term: w.term,
          meaning: w.definition,
          seconds: WORD_SECONDS,
        }),
      ),
  ]);
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

  /** 강의 노트로 학습 콘텐츠를 만들고, 화면에서 쓰는 Block 형식으로 바꿔 돌려준다 */
  generate: async (text: string) => {
    const content = await request<GeneratedContent>("/api/learning-content/generate", {
      method: "POST",
      body: { text },
    });
    return { title: content.title, blocks: toBlocks(content) };
  },
};
