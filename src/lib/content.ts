import type { Block } from "./types";

type Rule = { minSecs: number; kinds: Block["kind"][]; limit: Partial<Record<Block["kind"], number>> };

// 남은 시간 구간별 규칙. 경계값은 탑승 테스트 후 여기서만 조정한다.
const RULES: Rule[] = [
  { minSecs: 30 * 60, kinds: ["summary", "quiz", "word"], limit: {} },
  { minSecs: 15 * 60, kinds: ["summary", "quiz"], limit: { summary: 3, quiz: 3 } },
  { minSecs: 5 * 60, kinds: ["quiz", "word"], limit: {} },
];

/** 남은 시간 안에 끝나는 블록만 순서대로 고른다. 5분 미만이면 비어 있다 */
export function pickBlocks(remainingSecs: number, blocks: Block[]): Block[] {
  const rule = RULES.find((r) => remainingSecs >= r.minSecs);
  if (!rule) return [];

  const taken: Partial<Record<Block["kind"], number>> = {};
  return blocks.filter((b) => {
    if (!rule.kinds.includes(b.kind) || b.seconds > remainingSecs) return false;
    const n = (taken[b.kind] ?? 0) + 1;
    if (n > (rule.limit[b.kind] ?? Infinity)) return false;
    taken[b.kind] = n;
    return true;
  });
}

export const splitSentences = (text: string) =>
  text.match(/[^.!?。\n]+[.!?。]?/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
