# Folkrådet — Sveriges digitala folkröst

## 🚀 Deploy till Vercel (steg för steg)

### 1. Skapa Git-repo
```bash
cd folkradet
git init
git add .
git commit -m "Initial: grundstomme med auth"
```

Pusha till GitHub (skapa ett repo på github.com först):
```bash
git remote add origin https://github.com/DITT-ANVÄNDARNAMN/folkradet.git
git branch -M main
git push -u origin main
```

### 2. Koppla till Vercel
1. Gå till [vercel.com](https://vercel.com) → **New Project**
2. Importera ditt GitHub-repo **folkradet**
3. Klicka **Deploy** (det kommer misslyckas första gången — det är OK)

### 3. Lägg till Vercel Postgres
1. I Vercel-dashboarden → ditt projekt → **Storage** → **Create Database**
2. Välj **Postgres** → skapa
3. Vercel sätter automatiskt alla `POSTGRES_*` environment variables

### 4. Lägg till environment variables
Gå till **Settings** → **Environment Variables** och lägg till:

| Key | Value |
|-----|-------|
| `JWT_SECRET` | Generera med: `openssl rand -hex 32` |
| `ELKS_API_USERNAME` | Från [46elks.com/account](https://46elks.com/account) |
| `ELKS_API_PASSWORD` | Från [46elks.com/account](https://46elks.com/account) |

### 5. Redeploy
Klicka **Deployments** → senaste → **⋯** → **Redeploy**

### 6. Skapa databastabeller
Besök:
```
https://din-app.vercel.app/api/setup
```
Du bör se: `"Alla tabeller skapade! Admin-konto: admin@folkradet.se / admin123"`

### 7. Koppla din domän
1. I Vercel → **Settings** → **Domains** → lägg till `folkradet.se` och `www.folkradet.se`
2. På [one.com](https://one.com) → DNS-inställningar:
   - Ta bort befintliga A-records
   - Lägg till CNAME: `www` → `cname.vercel-dns.com`
   - Lägg till A-record: `@` → `76.76.21.21`

### 8. Logga in som admin
- **E-post:** admin@folkradet.se
- **Lösenord:** admin123
- ⚠️ **Byt lösenord direkt!**

---

## 📁 Projektstruktur

```
folkradet/
├── app/
│   ├── globals.css          ← Global styling
│   ├── layout.tsx           ← Root layout
│   ├── page.tsx             ← Landningssida (login/register)
│   ├── admin/
│   │   ├── layout.tsx       ← Auth-guard för admin
│   │   └── page.tsx         ← Admin-panel (byggs i steg 2)
│   ├── dashboard/
│   │   ├── layout.tsx       ← Auth-guard för användare
│   │   └── page.tsx         ← Användardashboard (byggs i steg 3)
│   └── api/
│       ├── setup/route.ts   ← Databasuppställning (kör en gång)
│       ├── logout/route.ts
│       └── auth/
│           ├── login/route.ts
│           ├── register/route.ts
│           └── verify-sms/route.ts
├── lib/
│   ├── db.ts                ← Databaskonstanter
│   ├── auth.ts              ← JWT-helpers
│   └── sms.ts               ← 46elks SMS
├── .env.example
└── README.md
```

## 🔧 Lokal utveckling

```bash
npm install
# Kopiera .env.example till .env.local och fyll i dina värden
cp .env.example .env.local
npm run dev
```

**OBS:** Utan 46elks-uppgifter loggas SMS-koder till terminalen istället.

## ✅ Vad som ingår (Steg 1)
- [x] Next.js 14 med TypeScript
- [x] Vercel Postgres databasschema (alla 5 tabeller)
- [x] Landningssida med registrering och inloggning
- [x] SMS-verifiering via 46elks
- [x] JWT-baserad autentisering med httpOnly cookies
- [x] Skyddade routes för admin och användare
- [x] Annonsbanners på landningssidan
- [x] Responsiv design

## 🔜 Nästa steg
- Steg 2: Admin-panelen (Veckans fråga, Historik, Väljarbarometer, Användare)
- Steg 3: Användar-dashboarden (Hem, Väljarbarometer, Arkiv, Min sida)
- Steg 4: Diagram, PDF-export, partiomröstning
