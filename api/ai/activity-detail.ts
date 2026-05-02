import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") { res.status(405).end(); return; }

  const { item, lang = "en" } = req.body as {
    item: {
      id: string;
      title: string;
      shortText: string;
      whyThisPick: string;
      type: string;
      timeOfDay: string[];
      badges: string[];
    };
    lang?: string;
  };

  if (!item) {
    res.status(400).json({ success: false, error: "No item provided" });
    return;
  }

  const isItalian = lang === "it";

  const systemMsg = isItalian
    ? "Sei una guida esperta di Bologna. Rispondi SOLO con JSON valido, nessun markdown."
    : "You are an expert Bologna guide. Respond ONLY with valid JSON, no markdown.";

  const userMsg = `Activity: "${item.title}" (${item.type})
Tags: ${Array.isArray(item.badges) ? item.badges.join(", ") : item.badges}
Best time: ${Array.isArray(item.timeOfDay) ? item.timeOfDay.join(", ") : item.timeOfDay}
Description: ${item.shortText}

Respond ${isItalian ? "in Italian" : "in English"} with:
{"description":"3-4 sentences vivid immersive experience, max 80 words","duration":"visit duration","localTips":["tip1","tip2","tip3"],"bestTime":"best time and why"}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg },
      ],
      max_tokens: 800,
    });

    const rawContent = completion.choices[0]?.message?.content ?? "";

    if (!rawContent.trim()) {
      res.json({ success: false, error: "AI returned empty response" });
      return;
    }

    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      res.json({ success: false, error: "Invalid AI response" });
      return;
    }

    const detail = JSON.parse(jsonMatch[0]);
    res.json({ success: true, detail });
  } catch (err) {
    console.error("AI activity detail failed:", err);
    res.json({ success: false, error: "AI service unavailable" });
  }
}
