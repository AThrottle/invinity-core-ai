# Customization Guide

Three levels of customization, from zero-code to full feature development.

---

## Level 1: Config Only (Zero Code)

Edit these files with a text editor. No programming required.

### `lib/config.ts` — Branding & Content

Change the following values to rebrand the entire app:

| Key | What It Controls |
|-----|-----------------|
| `name` | App name in navbar, titles, emails |
| `tagline` | Landing page hero headline |
| `description` | SEO meta description, hero subtext |
| `links.*` | Social links, GitHub, support email |
| `mainNav` | Top navigation links |
| `dashboardNav` | Dashboard sidebar links |
| `adminNav` | Admin sidebar links |
| `features` | Landing page feature cards (icon, title, description) |
| `faq` | FAQ accordion (question, answer pairs) |

### `.env.local` — Service Connections

All service credentials live here. Update when switching between test/live environments.

---

## Level 2: AI-Assisted Content

Use these prompts with Cursor + Claude to make larger content changes without manual coding.

### Rewrite Landing Page Copy

Open `components/marketing/hero-section.tsx` and the other section files. Ask:

> "Rewrite all the marketing copy in this file for a [fitness coaching / real estate / etc] SaaS. Keep the same component structure and Tailwind classes. Change headlines, descriptions, and CTAs to target [your niche]."

### Change Color Scheme

Open `app/globals.css` and ask:

> "Change the primary color from blue to [green / purple / orange]. Update both light and dark mode CSS variables."

### Modify Email Templates

Open `lib/email.ts` and ask:

> "Rewrite the email templates for a [your niche] brand. Change the copy to feel [professional / friendly / playful]. Keep the same HTML structure."

---

## Level 3: Feature Development

Build your unique "money feature" using the existing architecture as a foundation.

### Adding a New Feature (Step by Step)

1. **Add a Prisma model** in `prisma/schema.prisma`
2. **Run migration**: `npx prisma db push`
3. **Create server actions** in `lib/actions/your-feature-actions.ts`
4. **Create the page** at `app/(dashboard)/dashboard/your-feature/page.tsx`
5. **Create the client component** at `components/dashboard/your-feature-client.tsx`
6. **Add to sidebar** in `lib/config.ts` → `dashboardNav`
7. **Add icon** to `components/layout/sidebar.tsx` → `iconMap`

### Adding an API Route

1. Create `app/api/your-endpoint/route.ts`
2. Use `withErrorHandler` from `lib/api-utils.ts`
3. Use `getSession()` from `lib/auth/session.ts` for auth
4. Use `checkPlanAccess()` from `middleware/plan-gate.ts` for plan gating
5. Use `checkAndIncrementUsage()` from `middleware/usage.ts` for metering

### Gating a Feature Behind a Plan

Use the `<PlanGate>` component in your page:

```tsx
import { PlanGate } from "@/components/dashboard/plan-gate";

<PlanGate requiredPlan="pro" currentPlan={userPlanSlug}>
  <YourProFeature />
</PlanGate>
```

Or in an API route:

```ts
import { checkPlanAccess, planGateResponse } from "@/middleware/plan-gate";

const access = await checkPlanAccess(userId, "pro");
if (!access.allowed) return planGateResponse("pro");
```

---

## File Structure Reference

```
lib/config.ts          → Branding, nav, features, FAQ
lib/constants.ts       → Routes, API paths, messages
lib/email.ts           → Email templates
app/globals.css        → Colors and theme
components/marketing/* → Landing page sections
components/dashboard/* → Dashboard UI components
components/admin/*     → Admin panel components
middleware/*           → API middleware (auth, rate limit, plan gate)
prisma/schema.prisma  → Database models
prisma/seed.ts        → Default data
```
