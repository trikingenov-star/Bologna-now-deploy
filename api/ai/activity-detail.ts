import type { VercelRequest, VercelResponse } from "@vercel/node";

async function callGemini(systemMsg: string, userMsg: string, maxTokens = 800) {
  const key = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemMsg }] },
      contents: [{ role: "user", parts: [{ text: userMsg }] }],
      generationConfig: { maxOutputTokens: maxTokens },
    }),
  });
  if (!r.ok) { const t = await r.text(); throw new Error(`Gemini ${r.status}: ${t.slice(0,200)}`); }
  const data = await r.json() as { candidates: Array<{ content: { parts: Array<{ text: string }> } }> };
  return data.candidates[0]?.content?.parts[0]?.text ?? "";
}

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
    const rawContent = await callGemini(systemMsg, userMsg, 800);

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
    const msg = err instanceof Error ? err.message : String(err);
    console.error("AI activity detail failed:", msg);
    res.json({ success: false, error: msg });
  }
}
