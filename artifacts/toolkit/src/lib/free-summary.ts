// Extractive summary: select original sentences, never generate new facts.
export function freeSummary(text: string) {
  if (!text.trim()) throw Error("Add document text first.");
  if (text.length > 24000) throw Error("Use at most 24,000 characters.");
  const segmenter = new Intl.Segmenter(undefined, { granularity: "sentence" });
  const sentences = text
    .split(/\n+/)
    .flatMap((line) =>
      Array.from(segmenter.segment(line), (part) => part.segment.trim()),
    )
    .filter((s) => s && !/^\[Page \d+\]$/.test(s));
  const tokens = (s: string): string[] =>
    s.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) || [];
  const stop = new Set(
    "the and that this with from have were will into they their for are was not but you your".split(
      " ",
    ),
  );
  const frequency = new Map<string, number>();
  for (const token of tokens(text))
    if (!stop.has(token)) frequency.set(token, (frequency.get(token) || 0) + 1);
  const ranked = sentences.map((sentence, index) => ({
    sentence,
    index,
    score:
      tokens(sentence).reduce((n, w) => n + (frequency.get(w) || 0), 0) /
      Math.sqrt(Math.max(1, tokens(sentence).length)),
  }));
  const selected: typeof ranked = [];
  const count = Math.min(6, Math.max(1, Math.ceil(sentences.length * 0.4)));
  while (selected.length < count) {
    let best: (typeof ranked)[number] | undefined,
      bestScore = -Infinity;
    for (const item of ranked) {
      if (selected.includes(item)) continue;
      const words = new Set(tokens(item.sentence).filter((w) => !stop.has(w)));
      const overlap = Math.max(
        0,
        ...selected.map((other) => {
          const otherWords = new Set(
            tokens(other.sentence).filter((w) => !stop.has(w)),
          );
          return (
            [...words].filter((w) => otherWords.has(w)).length /
            Math.max(1, Math.min(words.size, otherWords.size))
          );
        }),
      );
      if (overlap > 0.85 && selected.length) continue;
      const score =
        item.score * (1 - overlap * 0.7) +
        (item.index === 0 && words.size > 5 ? 1 : 0) - (words.size < 5 ? 2 : 0) +
        (/\d/.test(item.sentence) ? 0.8 : 0) +
        (/\b(decided|agreed|deadline|must|due|however|risk|untested|depends|cancelled|by)\b/i.test(
          item.sentence,
        )
          ? 2
          : 0);
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }
    if (!best) break;
    selected.push(best);
  }
  selected.sort((a, b) => a.index - b.index);
  return selected.map((s) => s.sentence).join("\n\n");
}
