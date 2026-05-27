# Arke Digital Learning — Project Rules

## Project Identity

**Arke Digital Learning** is a bilingual (Amharic + English) educational platform for Ethiopia.
It has two service lines operating under one codebase:

- **Yeneta Tutors (YT)** — Spiritual & traditional education (Ge'ez, Zema, Ethics). Live in MVP.
- **Fidel Tutors (FT)** — Academic tutoring. Coming soon (Phase 2). Show as "Coming Soon" in UI.

The platform has three user roles with distinct dashboards:

- **Admin** — verifies teachers, assigns matches, manages finances
- **Teacher** — fills attendance, submits progress reports, uploads media
- **Student/Parent** — views progress, course roadmap, payment status

---

## Tech Stack

- **Framework**: Next.js 14 (App Router) — use `app/` directory, NOT `pages/`
- **Language**: TypeScript (strict mode, no `any` unless unavoidable and commented)
- **Styling**: Tailwind CSS with custom token theme (see `src/styles/tokens.css`)
- **Backend/Auth**: Firebase v10+ (Firestore + Auth + Storage)
- **Maps**: Google Maps JavaScript API with Places
- **Email**: Firebase Triggers + Resend API
- **Deployment**: Vercel
- **Package manager**: pnpm
- **animejs**: for SEO friendly animations

## Firebase Architecture (CRITICAL — read before any data operation)

We use **Firestore (NoSQL)** — NOT PostgreSQL, NOT Supabase. Reason: flexible schema allows
iteration without migrations. Never suggest SQL schemas or Supabase.

### Firestore Collection Structure

```
/users/{uid}
  role: "admin" | "teacher" | "student"
  serviceId: "YT-001" | "SY-001" (system-generated)
  serviceLine: "yeneta" | "fidel"
  email: string
  status: "pending" | "active" | "suspended"
  createdAt: Timestamp

/teachers/{uid}
  fullName: string
  christianName: string
  gender: string
  phone: string
  locationPin: { lat, lng }
  churchDocUrl: string (Storage URL)
  bankProvider: "CBE" | "BOA" | "Telebirr"
  bankAccount: string
  verified: boolean
  rating: number (0-5, calculated)

/students/{uid}
  fullName: string
  christianName: string
  age: number
  gender: string
  phone: string
  locationPin: { lat, lng }
  courseId: string
  assignedTeacherId: string | null
  registrationFeePaid: boolean

/courses/{id}
  name: string
  nameAm: string
  price: number
  serviceFee: 100
  serviceLine: "yeneta" | "fidel"

/attendanceReports/{id}
  teacherId: string
  studentId: string
  date: Timestamp
  topic: string
  engagementStars: number (1-5)
  moralNotes: string
  mediaUrl: string | null

/payments/{id}
  studentId: string
  month: string (YYYY-MM)
  amount: number
  paidAt: Timestamp | null
  status: "pending" | "paid" | "overdue"
```

### Firebase Auth

- Email/Password: enabled
- Google Sign-In: enabled
- Phone (OTP): enabled
- After sign-up, ALWAYS write the user doc to `/users/{uid}` in the same operation.
- Use Firebase Security Rules (not frontend checks) as the enforcement layer.

---

## Color System (MANDATORY — never deviate)

These are the FINAL approved tokens. Use CSS variables, not hardcoded hex values in components.

### Core (All Brands)

```css
--navy-deep: #002147 /* primary background, headers, footer */
    --navy-mid: #003570 /* elevated surfaces, sidebar */ --navy-surface: #0a3060
    /* cards on navy background */ --navy-border: #1a4a80
    /* borders on navy background */ --white: #ffffff --off-white: #f8f9fa;
```

### Arke Corporate (shared across both lines)

```css
--gold-primary: #e8b84b /* CTAs, logos, primary buttons — NOT #FFD700 */
    --gold-hover: #d4a030 /* button hover state */ --gold-muted: #c5933a
    /* secondary accents */ --cream: #f7f5f0 /* light section backgrounds */;
```

### Yeneta Brand (spiritual, warm)

```css
--yt-maroon: #800020 /* borders, sub-headings, decorative */
    --yt-maroon-hover: #9a0028 --yt-gold: #c5a059 /* secondary buttons, icons */
    --yt-parchment: #f5edd6 /* warm section backgrounds */;
```

### Fidel Brand (academic, modern)

```css
--ft-teal: #008080 /* borders, sub-headings, decorative */
    --ft-teal-hover: #009999 --ft-gold: #e8b84b /* unified with Arke gold */
    --ft-cool: #f0f6ff /* light section backgrounds */;
```

### Semantic

```css
--success: #22c55e --warning: #f59e0b --error: #ef4444 --info: #3b82f6;
```

> **Why #E8B84B not #FFD700?** Pure yellow (#FFD700) fails WCAG AA on navy at 3.8:1 contrast.
> #E8B84B achieves 5.1:1, reads as premium gold (not "website yellow"), and passes accessibility.

---

## Code Rules

### Components

- All components in `src/components/` following atomic structure: `ui/`, `layout/`, `dashboard/`, `forms/`
- Every component must have TypeScript props interface above the component
- Use `"use client"` ONLY when absolutely needed (event handlers, hooks, browser APIs)
- Server components are the default in App Router — respect this
- Never use `React.FC<>` — use plain function with typed props directly

### File naming

- Components: `PascalCase.tsx` (e.g. `TeacherCard.tsx`)
- Pages: `page.tsx` inside route folders
- Utilities: `camelCase.ts` (e.g. `formatCurrency.ts`)
- Hooks: `use` prefix (e.g. `useAuth.ts`)

### Route structure (App Router)

```
app/
  (public)/          # No auth required
    page.tsx          # Home
    about/page.tsx
    yeneta/page.tsx
    fidel/page.tsx
    contact/page.tsx
  (auth)/
    login/page.tsx
    register/page.tsx
  (dashboard)/
    admin/
      page.tsx
      teachers/page.tsx
      students/page.tsx
      finances/page.tsx
      matching/page.tsx
    teacher/
      page.tsx
      attendance/page.tsx
      reports/page.tsx
    student/
      page.tsx
      progress/page.tsx
      payments/page.tsx
  api/               # Route handlers only
```

### Auth guard pattern

```typescript
// Use this HOC for all protected routes:
// src/components/auth/ProtectedRoute.tsx
// NEVER use client-side redirect as sole protection — Firebase rules enforce server-side
```

### Bilingual text

- All visible strings must support Amharic + English
- Use a simple `t()` helper from `src/lib/i18n.ts` — NOT a heavy i18n library
- Amharic is the primary language; English is the secondary
- Store translation objects in `src/locales/am.ts` and `src/locales/en.ts`

### Financial calculations (CRITICAL)

These formulas are business logic — never change without explicit instruction:

```typescript
// From spec (admin-only, never expose to parent/student UI)
const REGISTRATION_FEE_STUDENT = 400; // ETB, one-time
const REGISTRATION_FEE_TEACHER = 200; // ETB, one-time
const SERVICE_FEE = 100; // ETB, monthly per student

const monthlyTotal = (coursePrice: number) => coursePrice + SERVICE_FEE;
const companyRevenue = (coursePrice: number) =>
    coursePrice * 0.15 + SERVICE_FEE;
const teacherPayout = (coursePrice: number) => coursePrice * 0.85;
```

### Payment lock rule

```typescript
// Dashboard for student/parent locks after day 10 of month if payment is not made
// Implement as Firestore-driven flag, NOT as a frontend-only check
```

---

## Safety Guardrails (ALWAYS confirm before doing)

1. **Before writing any Firestore security rule** — confirm with user, rules enforce access
2. **Before any schema/collection rename** — confirm, this breaks existing data
3. **Before touching financial calculation logic** — confirm exact formula with user
4. **Before adding any third-party package** — check if Firebase/Next.js native handles it first
5. **Never store bank account numbers or payment details in plaintext** in Firestore

---

## Git Conventions

- Branch: `feature/`, `fix/`, `chore/` prefixes
- Commits: conventional commits (`feat:`, `fix:`, `chore:`, `style:`)
- Max PR size: 400 lines changed
- Always run `pnpm type-check` before committing

---

## What "Done" Means for Each Task

A component is done when:

- [ ] TypeScript types defined and no errors
- [ ] Mobile-responsive (test at 375px, 768px, 1280px)
- [ ] Dark navy theme applied correctly using CSS variables
- [ ] Bilingual text wired (both AM and EN)
- [ ] Loading and error states handled
- [ ] Firebase operations have try/catch with user-facing error messages
