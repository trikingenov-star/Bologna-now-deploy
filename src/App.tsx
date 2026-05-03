import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { AppProvider } from "@/context/AppContext";
import { LanguageProvider, useLang } from "@/context/LanguageContext";
import { UserProfileProvider, useUserProfile } from "@/context/UserProfileContext";
import BottomNav from "@/components/BottomNav";
import Toast from "@/components/Toast";
import AIAssistant from "@/components/AIAssistant";
import InstallPrompt from "@/components/InstallPrompt";
import ExplorePage from "@/pages/ExplorePage";
import ItineraryPage from "@/pages/ItineraryPage";
import MapsPage from "@/pages/MapsPage";
import SurveyPage from "@/pages/SurveyPage";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function LangToggle() {
  const { lang, toggleLang } = useLang();
  return (
    <button
      onClick={toggleLang}
      aria-label="Toggle language"
      className="fixed top-4 right-4 z-[200] flex items-center gap-1 bg-white border border-border shadow-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:border-primary/40 select-none"
    >
      <span className="text-sm">{lang === "en" ? "🇮🇹" : "🇬🇧"}</span>
      <span>{lang === "en" ? "IT" : "EN"}</span>
    </button>
  );
}

function AppShell() {
  const { profile } = useUserProfile();

  if (!profile.completed) {
    return <SurveyPage />;
  }

  return (
    <>
      <Switch>
        <Route path="/explore" component={ExplorePage} />
        <Route path="/itinerary" component={ItineraryPage} />
        <Route path="/maps" component={MapsPage} />
        <Route><Redirect to="/explore" /></Route>
      </Switch>
      <BottomNav />
      <Toast />
      <AIAssistant />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <WouterRouter base={basePath}>
        <UserProfileProvider>
          <AppProvider>
            <LangToggle />
            <AppShell />
          </AppProvider>
        </UserProfileProvider>
      </WouterRouter>
      <InstallPrompt />
    </LanguageProvider>
  );
}
