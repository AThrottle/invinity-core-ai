# AI Prompts for Cursor / Claude

Copy-paste these prompts into Cursor with Claude to customize Infinity Core for your product. Each prompt is designed to work with the existing codebase architecture.

---

## Rebranding

### Rebrand for a Niche

```
Look at /lib/config.ts and all files in /components/marketing/. Rebrand this SaaS for [YOUR NICHE, e.g., "fitness coaches"]. Update:
- App name and tagline
- All 6 feature descriptions to match the niche
- FAQ questions and answers
- Testimonial quotes and names
- CTA copy
Keep the same component structure and styling.
```

### Change Colors

```
Open /app/globals.css. Change the primary color from blue (221.2 83.2% 53.3%) to [YOUR COLOR, e.g., "emerald green"]. Update both light mode and dark mode CSS custom properties. Make sure the primary-foreground contrasts well.
```

---

## Adding Features

### Add an AI Text Generator

```
Create a new page at /app/(dashboard)/dashboard/ai-writer/page.tsx. It should have:
- A textarea for user input (prompt)
- A "Generate" button that calls POST /api/ai/generate
- A results display area with copy button
- Loading state while generating

Create the API route at /app/api/ai/generate/route.ts that:
- Verifies authentication with getSession()
- Checks plan access with checkPlanAccess(userId, "pro")
- Increments usage with checkAndIncrementUsage()
- Calls OpenAI's API (use OPENAI_API_KEY env var)
- Returns the generated text

Add a sidebar nav link in lib/config.ts dashboardNav.
Gate it behind the Pro plan using the PlanGate component.
```

### Add a CRUD Feature

```
Add a "[YOUR FEATURE]" feature to the dashboard. Steps:
1. Add a Prisma model in prisma/schema.prisma with fields: id, userId, name, description, status, createdAt, updatedAt
2. Create server actions in lib/actions/[feature]-actions.ts with create, update, delete operations (follow the pattern in lib/actions/project-actions.ts)
3. Build the page at app/(dashboard)/dashboard/[feature]/page.tsx (follow projects/page.tsx pattern)
4. Build the client component at components/dashboard/[feature]-client.tsx (follow projects-client.tsx pattern)
5. Add to sidebar in lib/config.ts
```

### Add a File Upload Feature

```
Create a file upload feature using Supabase Storage:
1. Create an API route at /api/upload/route.ts that accepts multipart form data
2. Upload files to a Supabase Storage bucket named "uploads"
3. Store the file URL in a new Prisma model
4. Create a dashboard page showing uploaded files with preview and delete
5. Gate uploads behind the Starter plan
```

---

## Modifying Existing Features

### Customize Email Templates

```
Look at the email templates in /lib/email.ts. Rewrite them for a [YOUR NICHE] brand:
- Change the APP_NAME reference
- Update copy to feel [professional / friendly / technical / playful]
- Keep the same HTML wrapper and inline styles
- Make sure all 6 templates are updated consistently
```

### Add More Plans

```
I want to add a new plan between Starter and Pro called "Growth" at $35/month. Steps:
1. Add it to the plans array in prisma/seed.ts with appropriate features and limits
2. Add it to the comparisonFeatures table in app/(marketing)/pricing/page.tsx
3. Update the plan hierarchy in middleware/plan-gate.ts
4. Update the PlanGate component hierarchy in components/dashboard/plan-gate.tsx
5. Run: npm run db:seed to create it in the database and Stripe
```

### Customize the Dashboard

```
Modify the dashboard home page at app/(dashboard)/dashboard/page.tsx:
- Change the KPI cards to show [YOUR METRICS]
- Add a [chart / graph / widget] section
- Modify the quick actions to link to [YOUR FEATURES]
- Update the welcome banner onboarding checklist
```

---

## Deployment

### Prepare for Production

```
Review the entire codebase for production readiness:
1. Check that no secrets are exposed in client-side code
2. Verify all API routes have authentication
3. Ensure rate limiting is active on all public endpoints
4. Check error handling in all server actions
5. Verify webhook signature validation
6. Test all email templates render correctly
List any issues found with file paths and line numbers.
```

---

## Tips for Best Results

1. **Be specific**: Include file paths and component names
2. **Reference patterns**: Say "follow the pattern in [existing file]"
3. **One thing at a time**: Don't ask for 5 features in one prompt
4. **Test after each change**: Run `npm run dev` and verify
5. **Use the architecture**: Follow the existing server component → client component → server action pattern
