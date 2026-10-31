export function modelPolicy() {
  const provider = (process.env.AI_PROVIDER || "gemini").toLowerCase();
  const fallback =
    process.env.AI_MODEL ||
    (provider === "openai" ? "gpt-4o-mini" : "models/gemini-flash-latest");
  const allowed = [
    ...new Set([
      fallback,
      ...(process.env.AI_ALLOWED_MODELS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ]),
  ];
  return { provider, fallback, allowed };
}
export function validateAiConfiguration(body: any) {
  const policy = modelPolicy();
  if (
    !body ||
    !policy.allowed.includes(body.model) ||
    typeof body.rateNote !== "string" ||
    body.rateNote.length > 500
  )
    throw Error(
      "Choose an approved model and a rate source note of up to 500 characters.",
    );
  const rate = (value: unknown) => {
    if (value === null || value === "") return null;
    if (typeof value !== "string" || !/^\d{1,6}(?:\.\d{1,6})?$/.test(value))
      throw Error(
        "Rates must be non-negative USD per million tokens, with at most six decimals. Leave unknown rates blank.",
      );
    return value;
  };
  return {
    provider: policy.provider,
    model: body.model,
    input: rate(body.inputRate),
    output: rate(body.outputRate),
    note: body.rateNote,
  };
}
export async function runtimeModel(database: { query: Function }) {
  const policy = modelPolicy(),
    r = await database.query(
      "SELECT model FROM ai_runtime_configuration WHERE provider=$1",
      [policy.provider],
    );
  const selected = r.rows[0]?.model || policy.fallback;
  if (!policy.allowed.includes(selected))
    throw Error(
      "Configured model is no longer approved. An administrator must select an approved model.",
    );
  return selected;
}
