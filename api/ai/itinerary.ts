import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") { res.status(405).end(); return; }

  const { items, dateFrom, dateTo, lang = "en" } = req.body as {
    items: Array<{
      id: string;
      title: string;
      type: string;
      timeOfDay: string[];
      eventDate: string;
      lat?: number;
      lng?: number;
    }>;
    dateFrom?: string | null;
    dateTo?: string | null;
    lang?: string;
  };

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, error: "No items provided" });
    return;
  }

  const isItalian = lang === "it";

  const itemList = items
    .map((i) => {
      const coords = i.lat != null && i.lng != null ? ` coords="${i.lat},${i.lng}"` : "";
      const fixedDate = i.type === "EVENT" ? ` fixedDate="${i.eventDate}"` : "";
      return `id="${i.id}" title="${i.title}" time="${Array.isArray(i.timeOfDay) ? i.timeOfDay.join("/") : i.timeOfDay}"${fixedDate}${coords}`;
    })
    .join("; ");

  let dateInstruction = "Plan for a single generic day.";
  let dateRangeLabel = "";

  if (dateFrom && dateTo && dateFrom !== dateTo) {
    const from = new Date(dateFrom + "T12:00:00");
    const to = new Date(dateTo + "T12:00:00");
    const dayCount = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
    dateInstruction = `Trip: ${dateFrom} to ${dateTo} (${dayCount} days). Spread activities across days. Assign "date":"YYYY-MM-DD" to each block. Activities with fixedDate MUST be placed on that exact date.`;
    dateRangeLabel = isItalian
      ? `${from.toLocaleDateString("it-IT", { day: "numeric", month: "short" })} – ${to.toLocaleDateString("it-IT", { day: "numeric", month: "short" })}`
      : `${from.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – ${to.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
  } else if (dateFrom) {
    const from = new Date(dateFrom + "T12:00:00");
    dateInstruction = `Trip date: ${dateFrom}. Activities with fixedDate MUST be on that date. Assign "date":"${dateFrom}" to each block.`;
    dateRangeLabel = isItalian
      ? from.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })
      : from.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  }

  const systemMsg = isItalian
    ? "Sei una guida locale esperta di Bologna. Rispondi SOLO con JSON valido, nessun testo extra, nessun markdown."
    : "You are an expert local Bologna guide. Respond ONLY with valid JSON, no extra text, no markdown.";

  const userMsg = `${dateInstruction}

Activities to schedule: ${itemList}

Ordering rules:
1. Items with fixedDate must be placed on that exact date.
2. Within each day, order items by proximity using coords (if available) — minimize walking distance between consecutive stops.
3. Group by Morning / Afternoon / Evening based on their "time" field.
4. Write a short motivating note per item (max 15 words, ${isItalian ? "in Italian" : "in English"}).

Respond ${isItalian ? "in Italian" : "in English"} with ONLY this JSON:
{"vibe":"one word","intro":"one sentence max 20 words","totalDuration":"Xh","timeBlocks":[{"period":"Morning","startTime":"09:00","items":[{"id":"exact-id-from-input","note":"short tip"}]}]}

CRITICAL: use ONLY the exact id values from the input. Skip empty periods.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg },
      ],
      max_tokens: 4096,
    });

    const rawContent = completion.choices[0]?.message?.content ?? "";

    if (!rawContent.trim()) {
      res.json({ success: false, error: "AI returned empty response" });
      return;
    }

    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      res.json({ success: false, error: "AI response format invalid" });
      return;
    }

    const itinerary = JSON.parse(jsonMatch[0]);
    itinerary.timeBlocks = (itinerary.timeBlocks ?? []).filter(
      (b: { items: unknown[] }) => Array.isArray(b.items) && b.items.length > 0
    );
    if (dateRangeLabel) itinerary.dateRange = dateRangeLabel;

    res.json({ success: true, itinerary });
  } catch (err) {
    console.error("AI itinerary failed:", err);
    res.json({ success: false, error: "AI service unavailable" });
  }
}
