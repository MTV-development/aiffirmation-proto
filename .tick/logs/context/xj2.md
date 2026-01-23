# Epic Context: [xj2] FO-03: Foundation & Navigation

## Relevant Code

### Navigation Configuration
**File:** `nav.config.ts` (root)

```ts
export type NavItem = {
  label: string;
  href?: string;
  icon?: ReactNode;
  children?: NavItem[];
  actions?: { label: string; onClickId: string }[];
  permissions?: string[];
  type?: "link" | "tab" | "button";
};
```

FO-02 entry pattern (lines 92-98):
```ts
{
  label: "FO-02",
  href: "/fo-02",
  children: [
    { label: "Demo", href: "/fo-02" },
    { label: "Info", href: "/fo-02/info" },
  ],
},
```

**Add FO-03 after line 98**, before the Settings entry.

### FO-02 Reference Files (Copy Patterns)

| Source File | Target File | Changes Needed |
|-------------|-------------|----------------|
| `app/fo-02/page.tsx` | `app/fo-03/page.tsx` | Component name: `FO02Page` → `FO03Page` |
| `app/fo-02/layout.tsx` | `app/fo-03/layout.tsx` | Import/component: `Fo02LayoutClient` → `Fo03LayoutClient`, filename reference |
| `app/fo-02/fo-02-layout-client.tsx` | `app/fo-03/fo-03-layout-client.tsx` | Function name, navTree lookup href |

### FO-02 page.tsx (9 lines)
```tsx
import { FOExperience } from './components/fo-experience';

export default function FO02Page() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <FOExperience />
    </div>
  );
}
```
For FO-03: Change `FO02Page` → `FO03Page`. The `FOExperience` import will be created later in different epics.

### FO-02 layout.tsx (5 lines)
```tsx
import { Fo02LayoutClient } from "./fo-02-layout-client";

export default function Fo02Layout({ children }: { children: React.ReactNode }) {
  return <Fo02LayoutClient>{children}</Fo02LayoutClient>;
}
```

### FO-02 fo-02-layout-client.tsx (15 lines)
```tsx
'use client';

import { navTree } from '@/nav.config';
import { TopSubmenu } from '@/components/top-submenu';

export function Fo02LayoutClient({ children }: { children: React.ReactNode }) {
  const fo02Node = navTree.find((x) => x.href === '/fo-02');

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu items={fo02Node?.children ?? []} actions={fo02Node?.actions} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

## Architecture Notes

### Navigation Flow
1. `nav.config.ts` defines all nav items (single source of truth)
2. Sidebar component reads `navTree` for main navigation
3. Each section has a client layout that finds its node and passes children to `TopSubmenu`
4. `TopSubmenu` renders the section's sub-navigation tabs

### Client/Server Split Pattern
- `layout.tsx` - Server component, minimal wrapper
- `fo-XX-layout-client.tsx` - Client component (`'use client'`), handles nav lookup
- This split is required because navTree lookup uses React hooks context

### Directory Structure Convention
```
app/fo-XX/
  page.tsx              # Main page (server component)
  layout.tsx            # Server layout wrapper
  fo-XX-layout-client.tsx  # Client nav wrapper
  components/           # Feature components
  info/
    page.tsx            # Optional info subpage
```

## Conventions

### Naming Patterns
| Context | Pattern | Example |
|---------|---------|---------|
| Directory | kebab-case | `fo-03` |
| Page component | PascalCase + Page | `FO03Page` |
| Layout component | PascalCase + Layout | `Fo03Layout` |
| Client wrapper | PascalCase + LayoutClient | `Fo03LayoutClient` |
| Nav href | kebab-case with leading slash | `/fo-03` |

### Import Alias
Use `@/` for root imports (e.g., `@/nav.config`, `@/components/top-submenu`).

### Component Height
Main page uses `h-[calc(100vh-4rem)]` to account for top nav bar height.

## Testing

No specific tests for navigation setup. Verification is manual:
1. Run `npm run dev`
2. Navigate to `/fo-03`
3. Confirm sidebar shows FO-03
4. Confirm top submenu shows Demo/Info tabs

## Files to Create/Modify

### Task [ehg]: Modify
- `nav.config.ts` - Add FO-03 entry after FO-02 (lines 98-99)

### Task [ilu]: Create
- `app/fo-03/page.tsx`
- `app/fo-03/layout.tsx`
- `app/fo-03/fo-03-layout-client.tsx`
- `app/fo-03/components/` (empty directory - create via `.gitkeep` or first component)

Note: The `FOExperience` component referenced in page.tsx doesn't exist yet - create a placeholder or comment for now.