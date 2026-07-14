import OpenAI from "openai";

type ProviderConfig = {
  baseURL?: string;
  apiKey: string;
  model: string;
};

function resolveProvider(): ProviderConfig {
  const provider = (process.env.AI_PROVIDER ?? "gemini").toLowerCase();
  if (provider === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
    return { apiKey, model: process.env.AI_MODEL ?? "gpt-4o-mini" };
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
  return {
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey,
    model: process.env.AI_MODEL ?? "models/gemini-flash-latest",
  };
}

let client: OpenAI | null = null;
let model = "";

function getClient(): { client: OpenAI; model: string } {
  if (!client) {
    const config = resolveProvider();
    client = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL });
    model = config.model;
  }
  return { client, model };
}

export async function completeChat(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const { client, model } = getClient();
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });
  const text = response.choices[0]?.message?.content;
  if (!text) throw new Error("AI provider returned an empty response");
  return text.trim();
}
