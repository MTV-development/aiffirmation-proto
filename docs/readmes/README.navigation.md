# Navigation System Documentation

This document explains how to maintain and extend the navigation system in this application.

## Overview

The navigation system uses a **single source of truth** pattern where all navigation items are defined in `nav.config.ts`. The UI components (Sidebar and TopSubmenu) render based on this configuration.

## navTree Structure

The navigation tree is defined in `nav.config.ts`:

```ts
export type NavItem = {
  label: string;        // Display text
  href?: string;        // Route path
  icon?: ReactNode;     // Optional icon component
  children?: NavItem[]; // Submenu items (shown in top submenu)
  actions?: { label: string; onClickId: string }[]; // Action buttons
  permissions?: string[]; // Role-based visibility (future use)
  type?: "link" | "tab" | "button"; // Item type (future use)
};
```

## Adding New Sections

### 1. Add to navTree

Edit `nav.config.ts` and add a new entry:

```ts
{
  label: "Reports",
  href: "/reports",
  children: [
    { label: "Overview", href: "/reports" },
    { label: "Analytics", href: "/reports/analytics" },
  ],
}
```

### 2. Create Route Group

Create the folder structure under `app/`:

```
app/
  reports/
    layout.tsx     # Section layout with TopSubmenu
    page.tsx       # /reports page
    analytics/
      page.tsx     # /reports/analytics page
```

### 3. Create Section Layout

Each section needs a layout that injects the top submenu:

```tsx
// app/reports/layout.tsx
import { navTree } from "@/nav.config";
import { TopSubmenu } from "@/components/top-submenu";

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reportsNode = navTree.find((x) => x.href === "/reports");

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu
        items={reportsNode?.children ?? []}
        actions={reportsNode?.actions}
      />
      <main className="p-6 flex-1">{children}</main>
    </div>
  );
}
```

## Routing Conventions

- Top-level nav items map to route folders: `app/section/`
- Each section folder has its own `layout.tsx` for section-specific UI
- Nested routes go inside the section folder (e.g., `app/projects/active/`)

## Layout Conventions

- **Root layout** (`app/layout.tsx`): Contains the global shell with Sidebar
- **Section layouts** (`app/(section)/layout.tsx`): Inject the TopSubmenu

## Adding Actions

Actions appear as buttons on the right side of the top submenu:

```ts
{
  label: "Projects",
  href: "/projects",
  children: [...],
  actions: [
    { label: "New Project", onClickId: "createProject" }
  ]
}
```

Handle actions in your components by checking the `onClickId`.

## Adding Icons

Import and use React components as icons:

```ts
import { HomeIcon } from "lucide-react";

{
  label: "Dashboard",
  href: "/dashboard",
  icon: <HomeIcon className="w-4 h-4" />,
}
```

Update the Sidebar component to render the icon.

## Rules for Consistency

1. **Single source of truth**: Never hardcode labels or paths outside `nav.config.ts`
2. **Route/nav sync**: Every nav item with `children` needs a corresponding route group with layout
3. **Naming**: Use kebab-case for routes, match the href in navTree
4. **Submenu visibility**: Items without `children` won't show a top submenu
