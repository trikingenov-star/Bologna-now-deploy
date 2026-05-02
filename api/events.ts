import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Types ───────────────────────────────────────────────────────────────────
type TimeOfDay = "Morning" | "Afternoon" | "Evening";

interface LiveEvent {
  id: string;
  title: string;
  titleEn: string;
  type: "EVENT";
  shortText: string;
  shortTextEn: string;
  whyThisPick: string;
  whyThisPickEn: string;
  description?: string;
  descriptionEn?: string;
  localTips?: string;
  localTipsEn?: string;
  badges: string[];
  category: string[];
  timeOfDay: TimeOfDay[];
  imageUrl?: string;
  eventDate: string;
  eventTime?: string;
  address?: string;
  sourceUrl?: string;
  isLive: true;
}

const TITLE_CATEGORY_OVERRIDE: { keyword: string; category: string[] }[] = [
  { keyword: "Fata elettric", category: ["Family"] },
];

const TITLE_BLACKLIST: string[] = [
  "La pietra e il silenzio",
  "IL MANUALE",
  "manuale pratico",
  "Il manuale pratico",
];

const TITLE_IMAGE_MAP: Record<string, string> = {
  "International Jazz Week": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80",
  "Milone": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&q=80",
  "Biro Ghetti Trio": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
  "Teatro Mazzacorati": "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80",
  "Jazz": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80",
  "Bologna Jazz": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80",
  "Primo Maggio": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80",
  "1 maggio": "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80",
  "Umarell": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&q=80",
  "Arie d'opera": "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200&q=80",
  "Opera": "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200&q=80",
  "Detroit": "https://images.unsplash.com/photo-1578300253266-dedd2cd40912?w=1200&q=80",
  "Louvre": "https://images.unsplash.com/photo-1594938298603-c8148c4b4809?w=1200&q=80",
  "Sagra": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
  "Notte": "https://images.unsplash.com/photo-1502759683299-cdcd6974244f?w=1200&q=80",
  "Notte europea": "https://images.unsplash.com/photo-1502759683299-cdcd6974244f?w=1200&q=80",
  "Cortile": "https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=1200&q=80",
  "Portico": "https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=1200&q=80",
  "Portici": "https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=1200&q=80",
  "magia del pianoforte": "https://images.unsplash.com/photo-1716468474013-e2308ac3481d?w=1200&q=80",
  "pianoforte": "https://images.unsplash.com/photo-1716468474013-e2308ac3481d?w=1200&q=80",
  "Detroit Love": "https://images.unsplash.com/photo-1578300253266-dedd2cd40912?w=1200&q=80",
  "Camera Jazz": "https://images.unsplash.com/photo-1761019362913-9cf17b5a0101?w=1200&q=80",
  "All you need is love": "https://images.unsplash.com/photo-1761229661007-ff73d38a647c?w=1200&q=80",
  "all you need": "https://images.unsplash.com/photo-1761229661007-ff73d38a647c?w=1200&q=80",
  "Il nome": "https://images.unsplash.com/photo-1580188921691-a9003e26fefe?w=1200&q=80",
  "Maria Violenza": "https://images.unsplash.com/photo-1763630055045-c21f85a699e0?w=1200&q=80",
  "Lamb of Gold": "https://images.unsplash.com/photo-1763630055045-c21f85a699e0?w=1200&q=80",
  "Italia 90": "https://images.unsplash.com/photo-1772582728668-619b2ad2c916?w=1200&q=80",
  "Heavy Psych": "https://images.unsplash.com/photo-1768054186905-cee1f184abcc?w=1200&q=80",
  "Vespri d'organo": "https://images.unsplash.com/photo-1773270834656-5a7b8a317212?w=1200&q=80",
  "organo": "https://images.unsplash.com/photo-1773270834656-5a7b8a317212?w=1200&q=80",
  "Scandali": "https://images.unsplash.com/photo-1773270834656-5a7b8a317212?w=1200&q=80",
  "arte del respiro": "https://images.unsplash.com/photo-1580719653258-26873fde0b4d?w=1200&q=80",
  "strumenti a fiato": "https://images.unsplash.com/photo-1580719653258-26873fde0b4d?w=1200&q=80",
  "fiati": "https://images.unsplash.com/photo-1580719653258-26873fde0b4d?w=1200&q=80",
  "Elia Vannini": "https://images.unsplash.com/photo-1619467533662-ed8c255242c5?w=1200&q=80",
  "Vannini": "https://images.unsplash.com/photo-1619467533662-ed8c255242c5?w=1200&q=80",
  "Sinfonia n.": "https://images.unsplash.com/photo-1519683000900-034603c717b3?w=1200&q=80",
  "Giovanni Conti": "https://images.unsplash.com/photo-1519683000900-034603c717b3?w=1200&q=80",
  "CLASSICAdaFilla": "https://images.unsplash.com/photo-1617544518238-492c0c419a6d?w=1200&q=80",
  "Chi va là": "https://images.unsplash.com/photo-1526634332515-d56c5fd16991?w=1200&q=80",
  "Pimpa": "/images/pimpa-musical.png",
  "Fata elettricità": "/images/fata-elettricita.png",
  "Fata Elettricità": "/images/fata-elettricita.png",
  "fata elettricita": "/images/fata-elettricita.png",
  "Soft Clubbing": "https://images.unsplash.com/photo-1557322025-2054eedfc608?w=1200&q=80",
  "Eleazaro Rossi": "https://images.unsplash.com/photo-1625911636250-9ce32850cd5f?w=1200&q=80",
  "Kamikaze": "https://images.unsplash.com/photo-1625911636250-9ce32850cd5f?w=1200&q=80",
  "LEO GASSMAN": "https://images.unsplash.com/photo-1771959453948-a1b61521f913?w=1200&q=80",
  "Gassman": "https://images.unsplash.com/photo-1771959453948-a1b61521f913?w=1200&q=80",
  "Vecchioni": "https://images.unsplash.com/photo-1623081553676-8b658405761a?w=1200&q=80",
  "Bauci": "/images/bauci-citta-invisibili.png",
  "Città Invisibili": "/images/bauci-citta-invisibili.png",
  "Citta Invisibili": "/images/bauci-citta-invisibili.png",
  "Viva Mexico": "/images/viva-mexico-puebla.png",
  "Viva México": "/images/viva-mexico-puebla.png",
  "Viva Puebla": "/images/viva-mexico-puebla.png",
  "Puebla": "/images/viva-mexico-puebla.png",
};

const BOLOGNA_FALLBACKS = [
  "https://images.unsplash.com/photo-1568391611459-8c27fd9f0aa4?w=1200&q=80",
  "https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=1200&q=80",
  "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=1200&q=80",
  "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80",
  "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&q=80",
  "https://images.unsplash.com/photo-1529154036614-a60975f5c760?w=1200&q=80",
  "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&q=80",
  "https://images.unsplash.com/photo-1502519144081-acca18599776?w=1200&q=80",
  "https://images.unsplash.com/photo-1473042964571-bdec14f210de?w=1200&q=80",
  "https://images.unsplash.com/photo-1471967183320-ee018f6e114a?w=1200&q=80",
  "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&q=80",
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&q=80",
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
  "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80",
];

const CURATED_CATEGORY_IMAGES: Record<string, string[]> = {
  musica: [
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&q=80",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80",
    "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=1200&q=80",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80",
    "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=1200&q=80",
    "https://images.unsplash.com/photo-1619143547748-6e8ec67e8b27?w=1200&q=80",
  ],
  spettacoli: [
    "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80",
    "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&q=80",
    "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200&q=80",
    "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=1200&q=80",
  ],
  teatro: [
    "https://images.unsplash.com/photo-1503095396549-807759245b35?w=1200&q=80",
    "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=1200&q=80",
    "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200&q=80",
    "https://images.unsplash.com/photo-1520637836862-4d197d17c93a?w=1200&q=80",
  ],
  mostre: [
    "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&q=80",
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&q=80",
    "https://images.unsplash.com/photo-1594938298603-c8148c4b4809?w=1200&q=80",
    "https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=1200&q=80",
  ],
  "arti visive": [
    "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&q=80",
    "https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=1200&q=80",
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&q=80",
  ],
  cinema: [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80",
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80",
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=80",
  ],
  danza: [
    "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&q=80",
    "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=1200&q=80",
    "https://images.unsplash.com/photo-1547153760-18fc86324498?w=1200&q=80",
  ],
  sport: [
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&q=80",
  ],
  bambini: [
    "https://images.unsplash.com/photo-1526634332515-d56c5fd16991?w=1200&q=80",
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80",
    "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=1200&q=80",
  ],
  ragazzi: [
    "https://images.unsplash.com/photo-1526634332515-d56c5fd16991?w=1200&q=80",
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80",
  ],
  conferenze: [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&q=80",
    "https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=1200&q=80",
  ],
  convegni: [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&q=80",
  ],
  incontri: [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    "https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=1200&q=80",
  ],
  incontro: [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&q=80",
  ],
  mercato: [
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=80",
    "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=1200&q=80",
  ],
  food: [
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200&q=80",
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200&q=80",
  ],
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickTicketmasterImage(title: string, images: any[]): string | undefined {
  const img16x9 = images.filter((i: any) => i.ratio === "16_9" && i.width > 500).sort((a: any, b: any) => b.width - a.width)[0];
  if (img16x9) return img16x9.url as string;
  const anyLarge = images.filter((i: any) => (i.width ?? 0) > 400)[0];
  if (anyLarge) return anyLarge.url as string;
  for (const [key, url] of Object.entries(TITLE_IMAGE_MAP)) {
    if (title.toLowerCase().includes(key.toLowerCase())) return url;
  }
  return undefined;
}

function pickCuratedImage(categoryKey: string, eventId: string): string {
  const pool = CURATED_CATEGORY_IMAGES[categoryKey] ?? BOLOGNA_FALLBACKS;
  return pool[hashStr(eventId) % pool.length];
}

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: { events: LiveEvent[]; fetchedAt: number } | null = null;

function todayStr() { return new Date().toISOString().split("T")[0]; }

function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function hourToTimeOfDay(hour: number): TimeOfDay[] {
  if (hour < 12) return ["Morning"];
  if (hour < 17) return ["Afternoon"];
  return ["Evening"];
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

const BOLOGNA_OD_BASE = "https://opendata.comune.bologna.it/api/explore/v2.1/catalog/datasets/eventi-bologna-agenda-cultura/records";

function categoryToBadgeAndCat(cat: string | null): { badge: string; cats: string[] } {
  switch ((cat ?? "").toLowerCase()) {
    case "musica": return { badge: "🎵 Musica", cats: ["Events"] };
    case "spettacoli": return { badge: "🎭 Spettacolo", cats: ["Events"] };
    case "mostre":
    case "arti visive": return { badge: "🖼️ Mostra", cats: ["Events", "Art"] };
    case "cinema": return { badge: "🎬 Cinema", cats: ["Events"] };
    case "danza": return { badge: "💃 Danza", cats: ["Events"] };
    case "teatro": return { badge: "🎭 Teatro", cats: ["Events"] };
    case "sport": return { badge: "⚽ Sport", cats: ["Events", "Outdoor"] };
    case "bambini":
    case "ragazzi": return { badge: "👶 Bambini", cats: ["Events", "Family"] };
    case "conferenze":
    case "convegni": return { badge: "🎤 Talk", cats: ["Events"] };
    case "incontri":
    case "incontro": return { badge: "🎤 Incontro", cats: ["Events"] };
    default: return { badge: "📅 Evento", cats: ["Events"] };
  }
}

function classifyEventStyles(title: string, description: string, badge: string): string[] {
  const text = (title + " " + description + " " + badge).toLowerCase();
  const styles: string[] = [];
  const familyKw = ["bambini","bimbi","bimbo","ragazzi","famiglia","laboratorio per","ludoteca","parco giochi","pimpa","animazione","clown","fiabe","favola","circo","magia","marionette","burattini","teatro ragazzi","spettacolo per bam","kids","children","family","fairy","puppet","playground","laboratori bambini","scienz","oratorio","baby","junior","scuola primaria","elementari","asilo","nido","0-","3-","4-","6-","8-anni"];
  const coupleKw = ["romantico","romantica","coppia","amore","anniversario","serata romantica","tramonto","candele","wine tasting","degustazione vini","degustazione di vini","degustazione gin","opera lirica","lirica","balletto","danza classica","tango","valzer","canzone d'amore","serenata","arie d'opera","all you need is love","elisa ","vecchioni","amore e","musica e stelle","cena romantica","aperitivo romantico","notte romantica"];
  const friendsKw = ["discoteca","dj set","dj ","nightclub"," club ","rave","techno","house music","aperitivo","aperitivi","cocktail","sagra","street food","raduno","bowling","karaoke","escape room","karting","festa ","party","nightlife","after ","birreria","pub ","birra artigianale","soft clubbing","electronic","garage","funk","live dj","dj live","dancefloor","after party","saturday night","friday night","sabato sera","venerdì sera","serata dance","serata danzante"];
  const soloKw = ["museo","mostra","arte","conferenza","talk","incontro con l'autore","cinema","lettura","scrittura","fotografia","teatro","visita guidata","tour guidato","trekking","running","corsa","yoga","meditazione","concerto","spettacolo","workshop","seminario","corso ","masterclass","avventura","guitar","chitarra","musica dal vivo","reading","book","performance","installazione","arte contemporanea","poesia","slam"];
  if (familyKw.some(k => text.includes(k))) styles.push("Family");
  if (coupleKw.some(k => text.includes(k))) styles.push("Couple");
  if (friendsKw.some(k => text.includes(k))) styles.push("Friends");
  if (soloKw.some(k => text.includes(k))) styles.push("Solo");
  return styles;
}

async function fetchBolognaOpenData(): Promise<LiveEvent[]> {
  const today = todayStr();
  const in30days = addDays(30);
  const params = new URLSearchParams({
    limit: "60",
    where: `start>='${today}' AND start<='${in30days}' AND online='NO'`,
    order_by: "start asc",
    select: "id,title,description,url,address,categories_1,start,end",
  });
  const res = await fetch(`${BOLOGNA_OD_BASE}?${params}`);
  if (!res.ok) throw new Error(`BolognaOD ${res.status}`);
  const data = (await res.json()) as any;
  const records: any[] = data.results ?? [];

  const filtered = records.filter(
    (r: any) => r.title && r.start && !TITLE_BLACKLIST.some((b) => (r.title as string).toLowerCase().includes(b.toLowerCase()))
  );

  const mapped = filtered.map((r: any): LiveEvent | null => {
    const { badge, cats } = categoryToBadgeAndCat(r.categories_1);
    const desc: string = (r.description ?? "").replace(/\n/g, " ").trim();
    if (!r.title || r.title.trim().length < 4) return null;
    if (!desc && !r.categories_1) return null;
    const shortText = truncate(desc || r.categories_1 || "Evento a Bologna", 100);
    const why = truncate(desc || `${r.title} — un evento da non perdere a Bologna.`, 200);

    let imageUrl: string | undefined;
    const titleLower = (r.title ?? "").toLowerCase();
    for (const [key, url] of Object.entries(TITLE_IMAGE_MAP)) {
      if (titleLower.includes(key.toLowerCase())) { imageUrl = url; break; }
    }
    if (!imageUrl) {
      const catKey = (r.categories_1 ?? "").toLowerCase();
      const hasPool = catKey in CURATED_CATEGORY_IMAGES;
      imageUrl = pickCuratedImage(hasPool ? catKey : "_bologna", String(r.id ?? r.title));
    }

    const catOverride = TITLE_CATEGORY_OVERRIDE.find((o) => titleLower.includes(o.keyword.toLowerCase()));
    const styleTags = classifyEventStyles(r.title ?? "", desc, badge);
    const resolvedCats = catOverride
      ? [...catOverride.category, ...styleTags]
      : [...(r.start === today ? [...cats, "Today"] : cats), ...styleTags];

    return {
      id: `bod-${r.id}`,
      title: truncate(r.title, 60),
      titleEn: truncate(r.title, 60),
      type: "EVENT",
      shortText,
      shortTextEn: shortText,
      whyThisPick: why,
      whyThisPickEn: why,
      badges: ["📍 Bologna", badge],
      category: resolvedCats,
      timeOfDay: ["Evening"],
      imageUrl,
      eventDate: r.start,
      address: r.address ? truncate(r.address, 80) : undefined,
      sourceUrl: r.url ?? undefined,
      isLive: true,
    };
  });

  return mapped.filter((e): e is LiveEvent => e !== null);
}

async function fetchEventbrite(): Promise<LiveEvent[]> { return []; }

async function fetchTicketmaster(): Promise<LiveEvent[]> {
  const apikey = process.env.TICKETMASTER_API_KEY;
  if (!apikey) return [];
  const params = new URLSearchParams({ apikey, city: "Bologna", countryCode: "IT", size: "30", sort: "date,asc" });
  const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${params}`);
  if (!res.ok) throw new Error(`Ticketmaster ${res.status}`);
  const data = (await res.json()) as any;
  const events: any[] = data._embedded?.events ?? [];

  const mapped = events.map((e: any): LiveEvent | null => {
    const startDate: string = e.dates?.start?.localDate ?? todayStr();
    const startTime: string = e.dates?.start?.localTime?.slice(0, 5) ?? "";
    const hour = parseInt(startTime.split(":")[0] ?? "20");
    const name: string = e.name ?? "Bologna Event";
    const venue: string = e._embedded?.venues?.[0]?.name ?? "";
    const address: string = [venue, e._embedded?.venues?.[0]?.city?.name].filter(Boolean).join(", ");
    const genres: string[] = [e.classifications?.[0]?.segment?.name, e.classifications?.[0]?.genre?.name].filter(Boolean);
    const images: any[] = e.images ?? [];
    let img = pickTicketmasterImage(name, images);
    if (!img) {
      const genreKey = (genres[0] ?? "").toLowerCase();
      const catKey = genreKey.includes("music") ? "musica" : genreKey.includes("theatre") || genreKey.includes("theater") ? "teatro" : genreKey.includes("dance") ? "danza" : genreKey.includes("sport") ? "sport" : "spettacoli";
      img = pickCuratedImage(catKey, `tm-${e.id}`);
    }
    const badge = genres[0] ? `🎭 ${genres[0]}` : "🎟️ Event";
    const tmStyleTags = classifyEventStyles(name, genres.join(" "), badge);
    const tmBaseCats = startDate === todayStr() ? ["Events", "Today"] : ["Events"];
    const shortTextIt = truncate(`${genres.join(" · ")} — ${venue || "Bologna"}`, 80);
    const shortTextEn = truncate(`${genres.join(" · ")} in ${venue || "Bologna"}`, 80);
    const whyIt = truncate(`${name} — live a Bologna presso ${venue || "un venue di Bologna"}.`, 200);
    const whyEn = truncate(`${name} — live in Bologna at ${venue || "a Bologna venue"}. Don't miss it.`, 200);
    return {
      id: `tm-${e.id}`,
      title: truncate(name, 60),
      titleEn: truncate(name, 60),
      type: "EVENT",
      shortText: shortTextIt,
      shortTextEn,
      whyThisPick: whyIt,
      whyThisPickEn: whyEn,
      badges: ["📅 Live", badge],
      category: [...tmBaseCats, ...tmStyleTags],
      timeOfDay: hourToTimeOfDay(hour),
      imageUrl: img,
      eventDate: startDate,
      eventTime: startTime || undefined,
      address: address || undefined,
      sourceUrl: e.url ?? undefined,
      isLive: true,
    };
  });
  return mapped.filter((e): e is LiveEvent => e !== null);
}

function staticFallback(): LiveEvent[] {
  const today = todayStr();
  const tomorrow = addDays(1);
  return [
    { id: "live-sagra-tortellini", title: "Sagra del Tortellino", titleEn: "Tortellino Festival", type: "EVENT", shortText: "Festa annuale del tortellino in centro città.", shortTextEn: "Annual tortellino festival in the city center.", whyThisPick: "I bolognesi fanno la fila per ore per assaggiare il gold standard.", whyThisPickEn: "Locals queue for hours for a taste of the gold standard.", badges: ["🍝 Food vibes", "🌅 Morning"], category: ["Now", "Food & Vibe", "Today"], timeOfDay: ["Morning", "Afternoon"], eventDate: today, eventTime: "10:00", imageUrl: BOLOGNA_FALLBACKS[0], isLive: true },
    { id: "live-cinema-piazza", title: "Cinema in Piazza Maggiore", titleEn: "Cinema in Piazza Maggiore", type: "EVENT", shortText: "Cinema all'aperto sotto le stelle.", shortTextEn: "Open-air cinema under the stars.", whyThisPick: "La leggendaria tradizione estiva bolognese: cinema all'aperto gratuito.", whyThisPickEn: "Bologna's legendary summer tradition: free open-air cinema in Europe's largest piazza.", badges: ["🎬 Culture", "🌙 Evening"], category: ["Today", "Culture"], timeOfDay: ["Evening"], eventDate: today, eventTime: "21:30", imageUrl: CURATED_CATEGORY_IMAGES["cinema"][0], isLive: true },
    { id: "live-mercato-antiquariato", title: "Mercato dell'Antiquariato", titleEn: "Antique Market", type: "EVENT", shortText: "Mercato delle antichità nel centro storico.", shortTextEn: "Antique market in the historic center.", whyThisPick: "Ogni primo weekend del mese, Piazza Santo Stefano si trasforma in una caccia al tesoro.", whyThisPickEn: "Every first weekend, Piazza Santo Stefano transforms into a treasure hunt of vintage finds.", badges: ["🪙 Culture", "☀️ Afternoon"], category: ["Now", "Culture", "Outdoor"], timeOfDay: ["Morning", "Afternoon"], eventDate: tomorrow, eventTime: "09:00", imageUrl: CURATED_CATEGORY_IMAGES["mercato"][0], isLive: true },
  ];
}

function deduplicateEvents(events: LiveEvent[]): LiveEvent[] {
  const seenTitles = new Set<string>();
  const seenImages = new Set<string>();
  return events.filter((e) => {
    const titleKey = e.title.toLowerCase().replace(/\s+/g, "").slice(0, 30);
    if (seenTitles.has(titleKey)) return false;
    seenTitles.add(titleKey);
    if (e.imageUrl) {
      const imgKey = e.imageUrl.split("?")[0];
      if (seenImages.has(imgKey)) return false;
      seenImages.add(imgKey);
    }
    return true;
  });
}

interface TranslationEntry { titleEn: string; shortTextEn: string; whyThisPickEn: string; }
const translationCache = new Map<string, TranslationEntry>();

async function applyTranslations(events: LiveEvent[]): Promise<void> {
  const needsTranslation = events.filter((e) => e.id.startsWith("bod-") && !translationCache.has(e.id));
  if (needsTranslation.length === 0) {
    for (const e of events) {
      const cached = translationCache.get(e.id);
      if (cached) { e.titleEn = cached.titleEn; e.shortTextEn = cached.shortTextEn; e.whyThisPickEn = cached.whyThisPickEn; }
    }
    return;
  }
  const payload = needsTranslation.map((e) => ({ id: e.id, title: e.title, shortText: e.shortText, whyThisPick: e.whyThisPick }));
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are a bilingual Bologna city guide translator. Translate the Italian event fields into fluent, natural English. Keep title translations concise (max 60 chars). shortText max 100 chars. whyThisPick max 200 chars. Respond ONLY with a valid JSON array, no markdown, no extra text. Format: [{\"id\":\"...\",\"titleEn\":\"...\",\"shortTextEn\":\"...\",\"whyThisPickEn\":\"...\"}]" },
        { role: "user", content: JSON.stringify(payload) },
      ],
    });
    const raw = completion.choices[0]?.message?.content ?? "[]";
    type TranslationRow = { id: string; titleEn: string; shortTextEn?: string; whyThisPickEn?: string };
    const parsed: TranslationRow[] = JSON.parse(raw);
    for (const item of parsed) {
      if (!item.id || !item.titleEn) continue;
      translationCache.set(item.id, { titleEn: item.titleEn, shortTextEn: item.shortTextEn ?? item.titleEn, whyThisPickEn: item.whyThisPickEn ?? item.titleEn });
    }
  } catch { /* keep Italian as fallback */ }
  for (const e of events) {
    const cached = translationCache.get(e.id);
    if (cached) { e.titleEn = cached.titleEn; e.shortTextEn = cached.shortTextEn; e.whyThisPickEn = cached.whyThisPickEn; }
  }
}

async function getLiveEvents(): Promise<LiveEvent[]> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.events;
  const results = await Promise.allSettled([fetchEventbrite(), fetchTicketmaster(), fetchBolognaOpenData()]);
  const eb = results[0].status === "fulfilled" ? results[0].value : [];
  const tm = results[1].status === "fulfilled" ? results[1].value : [];
  const bod = results[2].status === "fulfilled" ? results[2].value : [];
  if (results[1].status === "rejected") console.error("Ticketmaster error:", (results[1] as PromiseRejectedResult).reason);
  if (results[2].status === "rejected") console.error("Bologna OpenData error:", (results[2] as PromiseRejectedResult).reason);
  const merged = deduplicateEvents([...eb, ...tm, ...bod]);
  const events = merged.length > 0 ? merged : staticFallback();
  events.sort((a, b) => (a.eventDate > b.eventDate ? 1 : -1));
  const top30 = events.slice(0, 30);
  await applyTranslations(top30);
  cache = { events: top30, fetchedAt: Date.now() };
  return top30;
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const events = await getLiveEvents();
    res.json({ success: true, events, source: "live" });
  } catch (err) {
    console.error("Events route error:", err);
    res.json({ success: true, events: staticFallback(), source: "fallback" });
  }
}
