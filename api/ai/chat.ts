import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") { res.status(405).end(); return; }

  const { messages, context, lang = "en" } = req.body as {
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    context?: {
      profile?: { travelStyle?: string; interests?: string[]; budget?: string };
      activities?: Array<{ id: string; title: string; type: string; category: string[] }>;
      savedItems?: Array<{ id: string; title: string }>;
    };
    lang?: string;
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ success: false, error: "No messages provided" });
    return;
  }

  const isItalian = lang === "it";

  const activityList = context?.activities
    ?.map((a) => `${a.title} (${a.category.slice(0, 2).join("/")})`)
    .join(", ") ?? "";

  const savedList = context?.savedItems?.map((i) => i.title).join(", ") ?? "";

  const profileInfo = context?.profile
    ? `Traveling: ${context.profile.travelStyle || "solo"}; Interests: ${(context.profile.interests ?? []).join(", ") || "general"}`
    : "";

  const systemMsg = isItalian
    ? `Sei Bolo, una guida AI simpatica ed esperta di Bologna. Hai una personalità calda, entusiasta e locale. Rispondi in italiano, in modo conversazionale e breve (max 3 frasi). Sei come un amico bolognese che conosce tutti i segreti della città.

Profilo utente: ${profileInfo}
Attività disponibili: ${activityList || "varie attività a Bologna"}
Attività nel suo itinerario: ${savedList || "nessuna ancora"}`
    : `You are Bolo, a warm, enthusiastic AI guide to Bologna, Italy. You have a friendly local personality. Reply in English, conversationally and briefly (max 3 sentences). You're like a Bolognese friend who knows all the city's secrets.

User profile: ${profileInfo}
Activities available: ${activityList || "various Bologna activities"}
Activities in their itinerary: ${savedList || "none yet"}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMsg },
        ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      ],
      max_tokens: 512,
    });

    const content = completion.choices[0]?.message?.content ?? "";

    if (!content.trim()) {
      res.json({ success: false, error: "Empty response" });
      return;
    }
    res.json({ success: true, message: content });
  } catch (err) {
    console.error("AI chat failed:", err);
    res.json({ success: false, error: "AI service unavailable" });
  }
}
