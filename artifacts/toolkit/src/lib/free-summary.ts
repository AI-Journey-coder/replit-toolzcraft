// Extractive summary: select original sentences, never generate new facts.
export function freeSummary(text: string) {
  if (!text.trim()) throw Error("Add document text first.");
  if (text.length > 24000) throw Error("Use at most 24,000 characters.");
  const sentences =
    text
      .match(/[^.!?。！？\n]+[.!?。！？]*/gu)
      ?.map((s) => s.trim())
      .filter(Boolean) || [];
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
  const selected = ranked
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, Math.min(5, Math.max(1, Math.ceil(sentences.length / 3))))
    .sort((a, b) => a.index - b.index);
  return selected.map((s) => s.sentence).join("\n\n");
}
