import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/context/LanguageContext";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "install-prompt-dismissed";

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  return (
    ("standalone" in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export default function InstallPrompt() {
  const { lang } = useLang();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIos, setShowIos] = useState(false);
  const [iosStep, setIosStep] = useState(0);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    if (isIos() && isSafari()) {
      const timer = setTimeout(() => setShowIos(true), 1800);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const timer = setTimeout(() => setShowAndroid(true), 1800);
      return () => clearTimeout(timer);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setShowAndroid(false);
    setShowIos(false);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowAndroid(false);
    }
    setDeferredPrompt(null);
  }

  const t = {
    it: {
      title: "Installa Bologna Now",
      subtitle: "Aggiungila alla schermata home per aprirla come un'app vera",
      install: "Installa",
      notNow: "Non ora",
      ios1: "Installa Bologna Now",
      ios1sub: "Segui questi semplici passi:",
      step1: 'Tocca il pulsante',
      step1b: '"Condividi"',
      step1icon: "⬆️",
      step2: 'Scorri e tocca',
      step2b: '"Aggiungi a Home"',
      step2icon: "➕",
      step3: 'Tocca',
      step3b: '"Aggiungi"',
      step3icon: "✓",
      next: "Avanti",
      back: "Indietro",
      done: "Fatto!",
      close: "Chiudi",
    },
    en: {
      title: "Install Bologna Now",
      subtitle: "Add it to your home screen to open it like a real app",
      install: "Install",
      notNow: "Not now",
      ios1: "Install Bologna Now",
      ios1sub: "Follow these simple steps:",
      step1: "Tap the",
      step1b: '"Share" button',
      step1icon: "⬆️",
      step2: "Scroll and tap",
      step2b: '"Add to Home Screen"',
      step2icon: "➕",
      step3: "Tap",
      step3b: '"Add"',
      step3icon: "✓",
      next: "Next",
      back: "Back",
      done: "Done!",
      close: "Close",
    },
  }[lang];

  const iosSteps = [
    { icon: t.step1icon, text: t.step1, bold: t.step1b },
    { icon: t.step2icon, text: t.step2, bold: t.step2b },
    { icon: t.step3icon, text: t.step3, bold: t.step3b },
  ];

  return (
    <>
      {/* Android / Chrome install banner */}
      <AnimatePresence>
        {showAndroid && (
          <motion.div
            key="android-banner"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-[999] px-4 pb-6 pt-2 flex justify-center pointer-events-none"
          >
            <div className="w-full max-w-sm bg-[hsl(32,40%,96%)] border border-[hsl(24,30%,87%)] rounded-2xl shadow-2xl pointer-events-auto overflow-hidden">
              <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                <img
                  src="/icon.png"
                  alt="Bologna Now"
                  className="w-12 h-12 rounded-xl shadow object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[hsl(18,40%,12%)] text-sm leading-tight">{t.title}</p>
                  <p className="text-[hsl(22,20%,48%)] text-xs mt-0.5 leading-snug">{t.subtitle}</p>
                </div>
                <button
                  onClick={dismiss}
                  className="text-[hsl(22,20%,58%)] hover:text-[hsl(18,40%,12%)] text-lg leading-none flex-shrink-0 p-1"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-2 px-4 pb-4">
                <button
                  onClick={dismiss}
                  className="flex-1 py-2.5 rounded-xl border border-[hsl(24,30%,87%)] text-sm font-semibold text-[hsl(22,20%,48%)] bg-white hover:bg-[hsl(32,40%,92%)] transition-colors"
                >
                  {t.notNow}
                </button>
                <button
                  onClick={handleInstall}
                  className="flex-1 py-2.5 rounded-xl bg-[hsl(15,67%,44%)] hover:bg-[hsl(15,67%,38%)] text-white text-sm font-bold shadow transition-colors"
                >
                  {t.install}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS / Safari step-by-step guide */}
      <AnimatePresence>
        {showIos && (
          <motion.div
            key="ios-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-end justify-center px-4 pb-6"
            style={{ background: "rgba(0,0,0,0.45)" }}
            onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 280 }}
              className="w-full max-w-sm bg-[hsl(32,40%,96%)] rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-[hsl(24,30%,87%)]">
                <img src="/icon.png" alt="Bologna Now" className="w-10 h-10 rounded-xl shadow object-cover flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-[hsl(18,40%,12%)] text-sm">{t.ios1}</p>
                  <p className="text-[hsl(22,20%,48%)] text-xs">{t.ios1sub}</p>
                </div>
                <button onClick={dismiss} className="text-[hsl(22,20%,58%)] text-lg p-1" aria-label="Close">✕</button>
              </div>

              {/* Steps */}
              <div className="px-4 py-4">
                <div className="flex gap-2 justify-center mb-5">
                  {iosSteps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${i <= iosStep ? "bg-[hsl(15,67%,44%)]" : "bg-[hsl(24,30%,87%)]"}`}
                    />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={iosStep}
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -30, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center text-center py-2"
                  >
                    <span className="text-5xl mb-3">{iosSteps[iosStep].icon}</span>
                    <p className="text-[hsl(18,40%,12%)] text-sm">
                      {iosSteps[iosStep].text}{" "}
                      <span className="font-bold text-[hsl(15,67%,44%)]">{iosSteps[iosStep].bold}</span>
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="flex gap-2 px-4 pb-4">
                {iosStep > 0 ? (
                  <button
                    onClick={() => setIosStep(s => s - 1)}
                    className="flex-1 py-2.5 rounded-xl border border-[hsl(24,30%,87%)] text-sm font-semibold text-[hsl(22,20%,48%)] bg-white"
                  >
                    {t.back}
                  </button>
                ) : (
                  <button
                    onClick={dismiss}
                    className="flex-1 py-2.5 rounded-xl border border-[hsl(24,30%,87%)] text-sm font-semibold text-[hsl(22,20%,48%)] bg-white"
                  >
                    {t.notNow}
                  </button>
                )}
                {iosStep < iosSteps.length - 1 ? (
                  <button
                    onClick={() => setIosStep(s => s + 1)}
                    className="flex-1 py-2.5 rounded-xl bg-[hsl(15,67%,44%)] text-white text-sm font-bold shadow"
                  >
                    {t.next}
                  </button>
                ) : (
                  <button
                    onClick={dismiss}
                    className="flex-1 py-2.5 rounded-xl bg-[hsl(15,67%,44%)] text-white text-sm font-bold shadow"
                  >
                    {t.done}
                  </button>
                )}
              </div>

              {/* Safari arrow indicator */}
              <div className="pb-4 flex flex-col items-center">
                <p className="text-[hsl(22,20%,58%)] text-xs text-center px-4">
                  {lang === "it"
                    ? "Il pulsante Condividi ⬆️ si trova in basso al centro in Safari"
                    : "The Share button ⬆️ is at the bottom center in Safari"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
