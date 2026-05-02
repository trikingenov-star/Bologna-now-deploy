import { useSignIn } from "@clerk/react";
import { useLocation } from "wouter";
import { useLang } from "@/context/LanguageContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.33 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.67 14.62 48 24 48z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

export default function LandingPage() {
  const { signIn, isLoaded } = useSignIn();
  const [, navigate] = useLocation();
  const { lang, toggleLang } = useLang();
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);
  const [oauthError, setOauthError] = useState<string | null>(null);

  const t = (it: string, en: string) => lang === "it" ? it : en;

  const signInWith = async (provider: "oauth_google" | "oauth_apple") => {
    if (!isLoaded || !signIn) {
      // Clerk not ready yet — redirect to sign-in page as fallback
      navigate("/sign-in");
      return;
    }
    setOauthError(null);
    setLoading(provider === "oauth_google" ? "google" : "apple");
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: `${window.location.origin}${basePath}/sign-in/sso-callback`,
        redirectUrlComplete: `${basePath}/explore`,
      });
    } catch (err: unknown) {
      setLoading(null);
      const msg = err instanceof Error ? err.message : String(err);
      setOauthError(
        msg.includes("not enabled") || msg.includes("provider")
          ? t("Provider non ancora attivato. Usa email per ora.", "Provider not enabled yet. Use email instead.")
          : t("Errore di accesso. Riprova o usa email.", "Sign-in error. Try again or use email.")
      );
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background overflow-hidden">
      {/* Lang toggle */}
      <button
        onClick={toggleLang}
        className="fixed top-4 right-4 z-50 flex items-center gap-1 bg-white/80 backdrop-blur-sm border border-border shadow-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:border-primary/40"
      >
        <span className="text-sm">{lang === "en" ? "🇮🇹" : "🇬🇧"}</span>
        <span>{lang === "en" ? "IT" : "EN"}</span>
      </button>

      {/* Hero section */}
      <div className="relative flex-1 min-h-[55vh] overflow-hidden">
        <img
          src={`${basePath}/images/piazza-maggiore.png`}
          alt="Bologna"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center pt-12 pb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center mb-5 shadow-lg">
            <span className="text-3xl">📍</span>
          </div>
          <h1 className="font-serif text-4xl font-bold text-white leading-tight mb-2 drop-shadow-md">
            Bologna Now
          </h1>
          <p className="text-white/90 text-base font-medium drop-shadow">
            {t("La tua guida smart di Bologna", "Your smart Bologna city guide")}
          </p>
        </div>
      </div>

      {/* Auth card */}
      <div className="bg-background rounded-t-3xl -mt-6 relative z-10 px-6 pt-8 pb-10 flex flex-col gap-4 max-w-md mx-auto w-full shadow-[0_-4px_24px_rgba(140,60,30,0.08)]">
        <div className="text-center mb-2">
          <h2 className="font-serif text-xl font-bold text-foreground">
            {t("Inizia ad esplorare", "Start exploring")}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {t("Accedi per personalizzare la tua esperienza", "Sign in to personalise your experience")}
          </p>
        </div>

        {/* OAuth error */}
        {oauthError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-sm text-destructive text-center">
            {oauthError}
          </div>
        )}

        {/* Google */}
        <button
          onClick={() => signInWith("oauth_google")}
          disabled={loading !== null}
          className={cn(
            "w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border border-border bg-white font-semibold text-sm text-foreground transition-all shadow-sm",
            "hover:border-primary/40 hover:shadow active:scale-[0.98]",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            loading === "google" && "opacity-70 cursor-wait"
          )}
        >
          {loading === "google"
            ? <><span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" /> {t("Accesso in corso…", "Signing in…")}</>
            : <><GoogleIcon /> {t("Continua con Google", "Continue with Google")}</>
          }
        </button>

        {/* Apple */}
        <button
          onClick={() => signInWith("oauth_apple")}
          disabled={loading !== null}
          className={cn(
            "w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border border-transparent bg-foreground font-semibold text-sm text-white transition-all shadow-sm",
            "hover:bg-foreground/90 active:scale-[0.98]",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            loading === "apple" && "opacity-70 cursor-wait"
          )}
        >
          {loading === "apple"
            ? <><span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin shrink-0" /> {t("Accesso in corso…", "Signing in…")}</>
            : <><AppleIcon /> {t("Continua con Apple", "Continue with Apple")}</>
          }
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted-foreground text-xs font-medium">
            {t("oppure", "or")}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Email — always enabled, just navigates */}
        <button
          onClick={() => navigate("/sign-in")}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-border bg-background font-semibold text-sm text-foreground transition-all hover:border-primary/40 active:scale-[0.98]"
        >
          ✉️ {t("Accedi con email", "Continue with email")}
        </button>

        <p className="text-center text-xs text-muted-foreground mt-2">
          {t("Non hai un account?", "Don't have an account?")}{" "}
          <button
            onClick={() => navigate("/sign-up")}
            className="text-primary font-semibold hover:underline"
          >
            {t("Registrati", "Sign up")}
          </button>
        </p>
      </div>
    </div>
  );
}
