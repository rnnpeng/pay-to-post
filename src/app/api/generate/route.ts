import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { headers } from "next/headers";
import { rateLimit } from "@/app/lib/rate-limit";

export async function POST() {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "unknown";
  const { ok } = rateLimit(ip);

  if (!ok) {
    return Response.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system:
      "You are a witty crypto native. Generate a short, funny, slightly degen message for a blockchain guestbook. Max 100 chars. No hashtags.",
    prompt: "Write a guestbook message.",
    maxTokens: 60,
  });

  return Response.json({ text: text.trim().slice(0, 100) });
}
