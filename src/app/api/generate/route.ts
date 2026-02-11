import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST() {
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system:
      "You are a witty crypto native. Generate a short, funny, slightly degen message for a blockchain guestbook. Max 100 chars. No hashtags.",
    prompt: "Write a guestbook message.",
    maxTokens: 60,
  });

  return Response.json({ text: text.trim().slice(0, 100) });
}
