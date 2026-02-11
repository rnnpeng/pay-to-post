import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { headers } from "next/headers";
import { rateLimit } from "@/app/lib/rate-limit";

const schema = z.object({
  isSafe: z.boolean(),
  reason: z.string(),
});

export async function POST(req: Request) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? "unknown";
  const { ok } = rateLimit(ip);

  if (!ok) {
    return Response.json(
      { isSafe: false, reason: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  const { message } = await req.json();

  if (!message || typeof message !== "string" || !message.trim()) {
    return Response.json(
      { isSafe: false, reason: "Message cannot be empty." },
      { status: 400 }
    );
  }

  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema,
    system:
      "You are a strict content moderator for a public blockchain guestbook. Review the input for hate speech, racial slurs, obvious scams, or illegal content. Be lenient with 'crypto slang' or mild swearing, but strict on toxicity.",
    prompt: `Review this message: "${message}"`,
  });

  return Response.json(object);
}
