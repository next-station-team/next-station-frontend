export type Status = "sit" | "stand" | "tired";
export type Mode = "focus" | "audio" | "rest";

export const MODE_OF: Record<Status, Mode> = {
  sit: "focus",
  stand: "audio",
  tired: "rest",
};

export interface Station {
  id: string;
  name: string;
  /** 다음 역까지 소요 시간(초) */
  secs: number;
}

export interface Session {
  id: string;
  from: string;
  to: string;
  status: Status;
  startedAt: number;
  fixes: { stationId: string; at: number }[];
}

export type Block = {
  id: string;
  materialId: string;
  /** 예상 소요 시간(초) */
  seconds: number;
} & (
  | { kind: "summary"; title: string; body: string }
  | { kind: "quiz"; question: string; options: string[]; answer: number }
  | { kind: "word"; term: string; meaning: string }
);

export interface Material {
  id: string;
  title: string;
  text: string;
  createdAt: number;
}

/** 마지막으로 멈춘 위치 1개 */
export interface Progress {
  materialId: string;
  blockId: string;
  /** 오디오는 문장 번호, 그 외는 0 */
  pos: number;
}
