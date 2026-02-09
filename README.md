# Infinity Core Engine

**Production-ready SaaS boilerplate. Clone. Configure. Deploy. Sell.**

Auth, payments, admin panel, email, API — all wired up and ready to go. Built with Next.js 14, Supabase, Stripe, and Tailwind CSS. Designed so AI coding tools (Cursor, Claude, Copilot) can easily add features and turn this foundation into your unique product.

---

## Quick Start (10 minutes)

### 1. Clone the repository

```bash
git clone https://github.com/icemusike/invinity-core-ai.git
cd invinity-core-ai
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

### 3. Open the Setup Wizard

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will automatically redirect you to the **Setup Wizard** — a step-by-step guide that walks you through connecting your services.

The wizard will help you:
- **Step 1:** Connect Supabase (database & auth)
- **Step 2:** Connect Stripe (payments)
- **Step 3:** Connect Resend (email)
- **Step 4:** Brand your app (name, tagline, URL)
- **Step 5:** Validate all connections

### 4. Set up the database

After the wizard generates your `.env.local` file, paste it into your project root and run:

```bash
npx prisma db push
npm run db:seed
```

### 5. Restart and go

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — your SaaS is running!

---

## What's Included

| Feature | Status |
|---------|--------|
| Email/password authentication | ✅ |
| Google & GitHub OAuth | ✅ |
| Email verification & password reset | ✅ |
| Stripe subscription checkout | ✅ |
| Webhook-driven subscription lifecycle | ✅ |
| Stripe Customer Portal (self-service billing) | ✅ |
| Plan enforcement middleware | ✅ |
| API usage metering | ✅ |
| User dashboard with settings & billing | ✅ |
| Admin panel with analytics | ✅ |
| Landing page with feature sections | ✅ |
| Pricing page with plan cards | ✅ |
| Transactional email templates | ✅ |
| Rate limiting on API routes | ✅ |
| One-click Vercel deployment | ✅ |
| Interactive setup wizard | ✅ |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Supabase (PostgreSQL) |
| ORM | Prisma |
| Payments | Stripe (Checkout + Billing Portal) |
| Email | Resend (React Email templates) |
| Auth | Supabase Auth |
| Hosting | Vercel |

---

## Project Structure

```
infinity-core/
├── app/
│   ├── (marketing)/          # Public pages (landing, pricing)
│   ├── (auth)/               # Login, signup, reset, verify
│   ├── (dashboard)/          # Protected member dashboard
│   ├── (admin)/              # Admin-only panel
│   ├── setup/                # Setup wizard
│   └── api/                  # API routes
├── components/
│   ├── ui/                   # shadcn/ui base components
│   ├── layout/               # Navbar, Sidebar, Footer
│   └── setup/                # Setup wizard steps
├── lib/                      # Config, utilities, clients
├── middleware/                # API middleware (auth, rate limit)
├── prisma/                   # Schema, seeds, migrations
├── emails/                   # React Email templates
└── scripts/                  # CLI tools (setup, factory reset)
```

---

## Customization

### Level 1: Config Only (Zero Code)
Edit `lib/config.ts` to change: app name, tagline, features, FAQ, nav links, plan names.

### Level 2: AI-Assisted
Use the prompts in `AI-PROMPTS.md` with Cursor/Claude to rewrite copy, adjust styling, modify templates.

### Level 3: Feature Development
Build your unique "money feature" using the clean architecture as a foundation.

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npx prisma db push` | Push schema to database |
| `npm run db:seed` | Seed database with plans & settings |
| `npx prisma studio` | Open Prisma database browser |

---

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/icemusike/invinity-core-ai)

After deploying, add all environment variables from your `.env.local` to Vercel's project settings.

---

## Documentation

| File | Contents |
|------|----------|
| [CUSTOMIZATION.md](./CUSTOMIZATION.md) | Three-level customization guide (config, AI-assisted, feature dev) |
| [AI-PROMPTS.md](./AI-PROMPTS.md) | Copy-paste prompts for Cursor/Claude to add features and rebrand |
| [.env.example](./.env.example) | All environment variables with setup instructions |

---

## License

MIT

---

Built for the **AI Founders Incubator** | Infinity Core Engine v2.0
