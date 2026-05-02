import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, BookOpen, Music2, ExternalLink } from "lucide-react";
import { EDITORIAL_CARDS, EditorialCard } from "@/data/editorial";
import { useLang } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

const CATEGORY_COLORS: Record<EditorialCard["category"], string> = {
  storia: "bg-amber-100 text-amber-800",
  personaggio: "bg-rose-100 text-rose-800",
  luogo: "bg-emerald-100 text-emerald-800",
  curiosità: "bg-violet-100 text-violet-800",
};

function ReadMoreModal({ card, onClose }: { card: EditorialCard; onClose: () => void }) {
  const { lang } = useLang();
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 26, stiffness: 260 }}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto max-w-md mx-auto"
      >
        <div className="bg-white rounded-t-3xl overflow-hidden border border-border">
          <div className="relative h-48">
            <img src={card.imageUrl} alt={lang === "it" ? card.title.it : card.title.en} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
              <X className="w-4 h-4 text-foreground" />
            </button>
            <span className={cn("absolute bottom-4 left-5 text-xs font-bold px-2.5 py-1 rounded-full", CATEGORY_COLORS[card.category])}>
              {lang === "it" ? card.categoryLabel.it : card.categoryLabel.en}
            </span>
          </div>
          <div className="p-5 pb-8">
            <h3 className="font-serif text-2xl font-bold text-foreground mb-1">
              {lang === "it" ? card.title.it : card.title.en}
            </h3>
            <p className="text-muted-foreground text-sm italic mb-4">
              {lang === "it" ? card.subtitle.it : card.subtitle.en}
            </p>
            <p className="text-foreground/80 text-sm leading-relaxed">
              {lang === "it" ? card.body.it : card.body.en}
            </p>
            <div className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {card.readTime} {lang === "it" ? "min di lettura" : "min read"}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

const TIKTOK_CARDS = [
  {
    hashtag: "bologna",
    label: { it: "Bologna da scoprire", en: "Discover Bologna" },
    sub: { it: "Arte, storia e cultura della città", en: "Art, history and city life" },
    gradient: "from-[#1a0a0a] via-[#2d0808] to-[#0a0a0a]",
    highlight: "border-red-600/30",
    emoji: "🏙️",
    views: "8.2M",
  },
  {
    hashtag: "bolognafood",
    label: { it: "Sapori bolognesi", en: "Bologna Flavors" },
    sub: { it: "Tortellini, tagliatelle e ragù originale", en: "Tortellini, tagliatelle & real ragù" },
    gradient: "from-[#1a0f00] via-[#2d1a00] to-[#0a0a0a]",
    highlight: "border-orange-500/30",
    emoji: "🍝",
    views: "5.7M",
  },
  {
    hashtag: "bolognafood",
    label: { it: "La notte bolognese", en: "Bologna by Night" },
    sub: { it: "Aperitivi, locali e Pratello di sera", en: "Aperitivo, clubs and Pratello" },
    gradient: "from-[#050a1a] via-[#0a0d2d] to-[#0a0a0a]",
    highlight: "border-indigo-500/30",
    emoji: "🌙",
    views: "3.1M",
  },
];

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.77a4.85 4.85 0 0 1-1.01-.08z" />
    </svg>
  );
}

function TikTokSection() {
  const { lang, t } = useLang();

  return (
    <section className="mt-8 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <TikTokIcon className="w-4 h-4 text-foreground" />
        <h2 className="font-serif text-lg font-bold text-foreground">{t("tiktok.title")}</h2>
      </div>

      <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2 hide-scrollbar snap-x">
        {TIKTOK_CARDS.map((card, i) => (
          <a
            key={i}
            href={`https://www.tiktok.com/tag/${card.hashtag}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "snap-start shrink-0 w-48 h-72 rounded-2xl bg-gradient-to-b border transition-all hover:-translate-y-0.5",
              card.gradient, card.highlight
            )}
            style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1rem" }}
          >
            <div className="flex items-center justify-between">
              <TikTokIcon className="w-5 h-5 text-white" />
              <span className="text-white/50 text-[10px] font-semibold">#{card.hashtag}</span>
            </div>

            <div>
              <div className="text-4xl mb-2">{card.emoji}</div>
              <p className="text-white font-bold text-sm leading-snug mb-1">
                {lang === "it" ? card.label.it : card.label.en}
              </p>
              <p className="text-white/50 text-[11px] leading-tight mb-3">
                {lang === "it" ? card.sub.it : card.sub.en}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-white/40 text-[10px]">{card.views} views</span>
                <div className="flex items-center gap-1 text-white/70 text-[10px] font-semibold">
                  <ExternalLink className="w-2.5 h-2.5" />
                  {t("tiktok.watch")}
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default function EditorialSection() {
  const { lang, t } = useLang();
  const [activeCard, setActiveCard] = useState<EditorialCard | null>(null);

  return (
    <>
      <TikTokSection />

      <section className="mt-2 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-primary" />
          <h2 className="font-serif text-lg font-bold text-foreground">{t("editorial.title")}</h2>
        </div>

        <div className="flex gap-4 overflow-x-auto -mx-4 px-4 pb-2 hide-scrollbar snap-x">
          {EDITORIAL_CARDS.map((card) => (
            <button
              key={card.id}
              onClick={() => setActiveCard(card)}
              className="snap-start shrink-0 w-72 bg-white rounded-2xl border border-border card-shadow overflow-hidden text-left transition-all hover:card-shadow-lg hover:-translate-y-0.5"
            >
              <div className="relative h-36">
                <img
                  src={card.imageUrl}
                  alt={lang === "it" ? card.title.it : card.title.en}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className={cn("absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full", CATEGORY_COLORS[card.category])}>
                  {lang === "it" ? card.categoryLabel.it : card.categoryLabel.en}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-serif font-bold text-foreground text-sm leading-tight mb-1 line-clamp-2">
                  {lang === "it" ? card.title.it : card.title.en}
                </h3>
                <p className="text-muted-foreground text-xs italic line-clamp-1">
                  {lang === "it" ? card.subtitle.it : card.subtitle.en}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    {card.readTime} {t("editorial.min_read")}
                  </span>
                  <span className="ml-auto text-[10px] font-semibold text-primary">
                    {t("editorial.read_more")} →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        <a
          href="https://open.spotify.com/playlist/0PtXUavyTbZMVzvGrgHLKt?si=cvP9J-dYQxCu0xx55cwBmw&pi=x-N7ow3qQwCb5"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-3 bg-[#0d0d0d] rounded-2xl px-4 py-3.5 hover:bg-[#181818] transition-colors"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1DB954] flex items-center justify-center">
            <Music2 className="w-5 h-5 text-black" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold leading-tight truncate">{t("spotify.label")}</p>
            <p className="text-white/50 text-xs leading-tight mt-0.5 line-clamp-1">{t("spotify.desc")}</p>
          </div>
          <span className="flex-shrink-0 text-[#1DB954] text-xs font-bold whitespace-nowrap">{t("spotify.cta")} →</span>
        </a>

        <AnimatePresence>
          {activeCard && <ReadMoreModal card={activeCard} onClose={() => setActiveCard(null)} />}
        </AnimatePresence>
      </section>
    </>
  );
}
