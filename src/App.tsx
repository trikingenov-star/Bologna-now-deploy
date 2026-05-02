import { useEffect } from "react";
import { ClerkProvider, SignIn, SignUp, useAuth } from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from "wouter";
import { AppProvider } from "@/context/AppContext";
import { LanguageProvider, useLang } from "@/context/LanguageContext";
import { UserProfileProvider, useUserProfile } from "@/context/UserProfileContext";
import BottomNav from "@/components/BottomNav";
import Toast from "@/components/Toast";
import AIAssistant from "@/components/AIAssistant";
import ExplorePage from "@/pages/ExplorePage";
import ItineraryPage from "@/pages/ItineraryPage";
import MapsPage from "@/pages/MapsPage";
import SurveyPage from "@/pages/SurveyPage";
import LandingPage from "@/pages/LandingPage";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL as string | undefined;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "hsl(15, 67%, 44%)",
    colorForeground: "hsl(18, 40%, 12%)",
    colorMutedForeground: "hsl(22, 20%, 48%)",
    colorDanger: "hsl(0, 75%, 50%)",
    colorBackground: "hsl(32, 40%, 96%)",
    colorInput: "hsl(24, 30%, 90%)",
    colorInputForeground: "hsl(18, 40%, 12%)",
    colorNeutral: "hsl(24, 30%, 87%)",
    fontFamily: "'DM Sans', 'Inter', sans-serif",
    borderRadius: "0.875rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-[hsl(32,40%,96%)] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg border border-[hsl(24,30%,87%)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[hsl(18,40%,12%)] text-xl font-bold",
    headerSubtitle: "text-[hsl(22,20%,48%)]",
    socialButtonsBlockButtonText: "text-[hsl(18,40%,12%)] font-semibold",
    formFieldLabel: "text-[hsl(18,40%,12%)] font-medium text-sm",
    footerActionLink: "text-[hsl(15,67%,44%)] font-semibold",
    footerActionText: "text-[hsl(22,20%,48%)]",
    dividerText: "text-[hsl(22,20%,48%)]",
    identityPreviewEditButton: "text-[hsl(15,67%,44%)]",
    formFieldSuccessText: "text-green-700",
    alertText: "text-[hsl(18,40%,12%)]",
    logoBox: "mb-1",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton: "border border-[hsl(24,30%,87%)] bg-white hover:bg-[hsl(32,40%,96%)] rounded-xl font-medium",
    formButtonPrimary: "bg-[hsl(15,67%,44%)] hover:bg-[hsl(15,67%,38%)] text-white rounded-xl font-semibold",
    formFieldInput: "bg-white border border-[hsl(24,30%,87%)] rounded-xl text-[hsl(18,40%,12%)]",
    footerAction: "bg-transparent",
    dividerLine: "bg-[hsl(24,30%,87%)]",
    alert: "border border-[hsl(24,30%,87%)] rounded-xl",
    otpCodeFieldInput: "border border-[hsl(24,30%,87%)] rounded-xl",
    formFieldRow: "",
    main: "",
  },
};

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
      <LangToggle />
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

function AuthCardSkeleton() {
  return (
    <div className="bg-[hsl(32,40%,96%)] rounded-2xl w-[440px] max-w-full mx-auto border border-[hsl(24,30%,87%)] shadow-lg p-8 flex flex-col gap-4 animate-pulse">
      <div className="h-6 bg-[hsl(24,30%,87%)] rounded-lg w-2/3 mx-auto" />
      <div className="h-4 bg-[hsl(24,30%,87%)] rounded w-1/2 mx-auto" />
      <div className="h-11 bg-[hsl(24,30%,87%)] rounded-xl mt-2" />
      <div className="h-11 bg-[hsl(24,30%,87%)] rounded-xl" />
      <div className="h-px bg-[hsl(24,30%,87%)]" />
      <div className="h-11 bg-[hsl(24,30%,87%)] rounded-xl" />
    </div>
  );
}

function SignInPage() {
  const { isLoaded } = useAuth();
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4 py-8">
      {!isLoaded && <AuthCardSkeleton />}
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        forceRedirectUrl={`${basePath}/explore`}
      />
    </div>
  );
}

function SignUpPage() {
  const { isLoaded } = useAuth();
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4 py-8">
      {!isLoaded && <AuthCardSkeleton />}
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        forceRedirectUrl={`${basePath}/explore`}
      />
    </div>
  );
}

function HomeRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      navigate("/explore", { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  return <LandingPage />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/", { replace: true });
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) return null;
  return <>{children}</>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey!}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Bentornato",
            subtitle: "Accedi alla tua guida di Bologna",
          },
        },
        signUp: {
          start: {
            title: "Crea il tuo account",
            subtitle: "Inizia ad esplorare Bologna",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <UserProfileProvider>
        <AppProvider>
          <Switch>
            <Route path="/" component={HomeRoute} />
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route path="/explore">
              <ProtectedRoute><AppShell /></ProtectedRoute>
            </Route>
            <Route path="/itinerary">
              <ProtectedRoute><AppShell /></ProtectedRoute>
            </Route>
            <Route path="/maps">
              <ProtectedRoute><AppShell /></ProtectedRoute>
            </Route>
            <Route><Redirect to="/" /></Route>
          </Switch>
        </AppProvider>
      </UserProfileProvider>
    </ClerkProvider>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
    </LanguageProvider>
  );
}
