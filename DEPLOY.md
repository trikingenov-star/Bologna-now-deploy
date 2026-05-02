# Deploy su Vercel — Istruzioni

## Prerequisiti completati
- Account GitHub connesso
- Account Vercel creato (con GitHub)
- Database Neon PostgreSQL pronto
- Account Clerk personale con app creata

---

## Step 1 — Push su GitHub

Crea un nuovo repo su GitHub (es. `bologna-now`) e fai push di questa cartella `vercel-export/`:

```bash
cd vercel-export
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TUO_USERNAME/bologna-now.git
git push -u origin main
```

---

## Step 2 — Importa su Vercel

1. Vai su [vercel.com/new](https://vercel.com/new)
2. Clicca **"Import Git Repository"**
3. Seleziona il repo `bologna-now`
4. Framework: **Vite** (auto-rilevato)
5. Root Directory: lascia vuoto (la radice è `vercel-export/`)
6. Clicca **"Deploy"** — il primo deploy mostrerà errori di env var, è normale

---

## Step 3 — Variabili d'ambiente su Vercel

Vai su **Settings → Environment Variables** nel progetto Vercel e aggiungi:

| Nome | Valore |
|------|--------|
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_test_a2V5LWJsdWVnaWxsLTkyLmNsZXJrLmFjY291bnRzLmRldiQ` |
| `CLERK_SECRET_KEY` | Il tuo `sk_test_...` da dashboard.clerk.com |
| `OPENAI_API_KEY` | Il tuo `sk-...` da platform.openai.com |
| `TICKETMASTER_API_KEY` | (dal tuo account Ticketmaster) |
| `EVENTBRITE_API_KEY` | (dal tuo account Eventbrite) |
| `UNSPLASH_ACCESS_KEY` | (dal tuo account Unsplash) |
| `DATABASE_URL` | `postgresql://neondb_owner:...@....neon.tech/neondb?sslmode=require` |
| `VITE_GOOGLE_MAPS_API_KEY` | `AIzaSyBBddAKJa8BjB6k-vBzAncsrpoWemVJG_M` |

---

## Step 4 — Configura Clerk per il dominio Vercel

1. Vai su [dashboard.clerk.com](https://dashboard.clerk.com)
2. Apri la tua app → **Domains**
3. Aggiungi il dominio Vercel (es. `bologna-now.vercel.app`)
4. Abilita **Google** e **Apple** come provider OAuth (facoltativo)

---

## Step 5 — Rideploy

Dopo aver aggiunto tutte le env var:
- Vai su **Deployments** → clicca sul deploy più recente → **"Redeploy"**

L'app sarà live su `https://bologna-now.vercel.app` (o il nome che hai scelto).

---

## Note importanti

- **AI Features**: richiedono un account OpenAI con credito. GPT-4o-mini costa ~$0.01 per 10 itinerari.
- **Clerk Secret Key**: se non ce l'hai, vai su dashboard.clerk.com → API Keys → copia `sk_test_...`
- **Database**: il DB Neon è già pronto. Per ora l'app non usa il DB direttamente (usa API esterne), ma la connessione è configurata per sviluppi futuri.
