---
description: Build a complete Next.js App Router page for Arke
skill: build_page
args: [page_name, user_role]
---

When activated with `build the [page_name] page`, do the following:

### Pre-flight checks
1. Read `AGENTS.md` — confirm route structure and role
2. Check if route folder already exists in `app/`
3. Check for existing similar pages to reuse patterns

### Build sequence
1. **Types** — create or update `src/types/[page_name].ts`
   - Define all Firestore document interfaces for this page
   - Define all component prop types

2. **Firebase hooks** — create `src/hooks/use[PageName].ts`
   - Firestore query with `onSnapshot` for real-time if needed
   - Handle loading, error, and empty states
   - Return typed data, loading boolean, error string

3. **Page component** — create `app/(dashboard)/[role]/[page_name]/page.tsx`
   - Server component by default
   - Metadata export with bilingual title
   - Import and compose UI components

4. **UI components** — create in `src/components/dashboard/[PageName]/`
   - Client components only where interactivity is needed
   - Each component gets its own file
   - Use CSS variables for all styling

5. **Translations** — add keys to `src/locales/am.ts` AND `src/locales/en.ts`

### Page template structure
```tsx
// app/(dashboard)/[role]/[page_name]/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title | Arke Digital Learning',
}

export default async function PageNamePage() {
  return (
    <div className="page-container">
      {/* Server-fetched content or Client wrapper */}
    </div>
  )
}
```
