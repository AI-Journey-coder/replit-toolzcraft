const test = require("node:test"),
  assert = require("node:assert/strict"),
  load = require("./load-ts-test.cjs");
test("runtime model selection is allowlisted and unknown prices remain unknown", async () => {
  const before = {
    AI_PROVIDER: process.env.AI_PROVIDER,
    AI_MODEL: process.env.AI_MODEL,
    AI_ALLOWED_MODELS: process.env.AI_ALLOWED_MODELS,
  };
  Object.assign(process.env, {
    AI_PROVIDER: "gemini",
    AI_MODEL: "approved-a",
    AI_ALLOWED_MODELS: "approved-b",
  });
  try {
    const settings = load("artifacts/api-server/src/lib/ai-configuration.ts");
    assert.equal(
      await settings.runtimeModel({ query: async () => ({ rows: [] }) }),
      "approved-a",
    );
    assert.equal(
      await settings.runtimeModel({
        query: async () => ({ rows: [{ model: "approved-b" }] }),
      }),
      "approved-b",
    );
    await assert.rejects(
      settings.runtimeModel({
        query: async () => ({ rows: [{ model: "unapproved" }] }),
      }),
    );
    assert.equal(
      settings.validateAiConfiguration({
        model: "approved-b",
        inputRate: "",
        outputRate: null,
        rateNote: "",
      }).input,
      null,
    );
    assert.throws(() =>
      settings.validateAiConfiguration({
        model: "unapproved",
        inputRate: "1",
        outputRate: "2",
        rateNote: "",
      }),
    );
    for (const rate of ["-1", "Infinity", "1e4", "1.1234567"])
      assert.throws(() =>
        settings.validateAiConfiguration({
          model: "approved-a",
          inputRate: rate,
          outputRate: "2",
          rateNote: "",
        }),
      );
  } finally {
    for (const [key, value] of Object.entries(before))
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
  }
});
test("model changes affect subsequent calls and configuration errors do not silently fall back", async () => {
  const old = process.env.GEMINI_API_KEY,
    provider = process.env.AI_PROVIDER;
  process.env.GEMINI_API_KEY = "synthetic-test-key";
  process.env.AI_PROVIDER = "gemini";
  const models = [];
  class FakeOpenAI {
    constructor() {
      this.chat = {
        completions: {
          create: async (body) => {
            models.push(body.model);
            return {
              choices: [
                { finish_reason: "stop", message: { content: "Fixture" } },
              ],
              usage: { prompt_tokens: 10, completion_tokens: 2 },
            };
          },
        },
      };
    }
  }
  try {
    const ai = load("artifacts/api-server/src/lib/ai.ts", {
      openai: FakeOpenAI,
    });
    let current = "model-a";
    const observed=[];ai.configureUsageObserver(async usage=>{observed.push(usage);});
    ai.configureModelSelection(async () => current);
    await ai.completeChat("system", "fixture");
    current = "model-b";
    await ai.completeChat("system", "fixture");
    assert.deepEqual(models, ["model-a", "model-b"]);
    assert.equal(observed.length,2);assert.equal(observed[0].inputTokens,10);assert.equal(observed[0].outcome,'complete');assert.equal(observed[0].kind,'chat');
    ai.configureModelSelection(async () => {
      throw Error("Configuration unavailable");
    });
    await assert.rejects(ai.completeChat("system", "fixture"));
    assert.equal(models.length, 2);
  } finally {
    if (old === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = old;
    if (provider === undefined) delete process.env.AI_PROVIDER;
    else process.env.AI_PROVIDER = provider;
  }
});
