---
description: Build a reusable UI component for Arke
skill: build_component
args: [component_name, category]
---

When activated with `build the [component_name] component`, do:

### Categories
- `ui` → `src/components/ui/` (buttons, inputs, badges, cards, modals)
- `layout` → `src/components/layout/` (nav, sidebar, footer, page wrapper)
- `dashboard` → `src/components/dashboard/` (stats cards, tables, charts)
- `forms` → `src/components/forms/` (registration, attendance, report forms)

### Component checklist
Every component must have:
- [ ] Props interface defined ABOVE the function (named `ComponentNameProps`)
- [ ] `"use client"` directive ONLY if it uses hooks, event handlers, or browser APIs
- [ ] All colors via CSS variables (never hardcoded hex)
- [ ] Mobile-first responsive design
- [ ] Loading skeleton variant (if data-driven)
- [ ] `aria-label` on all icon-only buttons
- [ ] Bilingual support if any visible text is present

### Component template
```tsx
// src/components/[category]/ComponentName.tsx

interface ComponentNameProps {
  // define all props here
  className?: string
}

export function ComponentName({ className }: ComponentNameProps) {
  return (
    <div className={className}>
      {/* component content */}
    </div>
  )
}
```

### Arke UI Patterns to follow
**Primary Button (gold CTA)**
```tsx
<button style={{
  background: 'var(--gold-primary)',
  color: 'var(--navy-deep)',
  fontWeight: 600,
  padding: '12px 24px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
}}>
  Register Now | አሁን ይመዝገቡ
</button>
```

**Card on Navy Background**
```tsx
<div style={{
  background: 'var(--navy-surface)',
  border: '1px solid var(--navy-border)',
  borderRadius: '12px',
  padding: '24px',
}}>
```

**Yeneta accent border**
```tsx
<div style={{ borderLeft: '4px solid var(--yt-maroon)' }}>
```

**Fidel accent border**
```tsx
<div style={{ borderLeft: '4px solid var(--ft-teal)' }}>
```
