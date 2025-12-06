# Building a Structured Navigation System in Next.js

This document describes a recommended approach for creating a **left-hand sidebar navigation + top submenu system** in a modern **Next.js App Router** application. It covers:

- Overall architecture
- How to use layouts and route segments
- Creating a `navTree` configuration
- Rendering sidebar + top submenu from the config
- Using `usePathname()` to mark active items
- Extending navigation behavior (actions, icons, tabs, permissions)
- A demo hierarchy of pages
- Instructions to create a `README.navigation.md` file explaining how the navigation system should be maintained

---

## 1. Overview of the Architecture

The navigation system is built on these principles:

### **App Router + Nested Layouts**
Use:
- Root layout (`app/layout.tsx`) for the **global shell** containing the left sidebar.
- Section layouts (`app/(section)/layout.tsx`) for injecting a **top submenu** per section.

### **navTree Configuration**
Create a `nav.config.ts` file that defines:
- Top-level menu items (left sidebar)
- Secondary items (top submenu)
- Rich metadata (icons, actions, permissions, layout types)

### **Dynamic Rendering**
Render:
- The **sidebar** based on the top-level items in the nav tree
- The **top submenu** based on the currently active primary menu section

### **Active Route Highlighting**
Use `usePathname()` to determine which menu item is currently active.

### **UI Library**
Use **Tailwind + shadcn/ui** or another UI component system for:
- Styling
- Consistency
- Avoiding hand-rolled components

---

## 2. File & Folder Structure (Simplified)

Example:

```
app/
  layout.tsx              # global layout (sidebar)
  (dashboard)/
    layout.tsx            # dashboard section layout (top submenu)
    page.tsx
  (projects)/
    layout.tsx            # projects section layout (top submenu)
    page.tsx
    active/
      page.tsx
    archived/
      page.tsx
  (settings)/
    layout.tsx
    profile/
      page.tsx
    team/
      page.tsx
nav.config.ts             # navigation tree definition
components/
  sidebar.tsx
  top-submenu.tsx
```

---

## 3. Defining the Navigation Tree

Create a `nav.config.ts` file to describe the full structure of your navigation.

```ts
// nav.config.ts
export type NavItem = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
  actions?: { label: string; onClickId: string }[];
  permissions?: string[];
  type?: "link" | "tab" | "button";
};

export const navTree: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Projects",
    href: "/projects",
    children: [
      { label: "Overview", href: "/projects" },
      { label: "Active", href: "/projects/active" },
      { label: "Archived", href: "/projects/archived" },
    ],
    actions: [
      { label: "New Project", onClickId: "createProject" }
    ]
  },
  {
    label: "Settings",
    href: "/settings",
    children: [
      { label: "Profile", href: "/settings/profile" },
      { label: "Team", href: "/settings/team" },
    ]
  },
];
```

This becomes the **single source of truth** for the navigation UI.

---

## 4. Global Layout with Sidebar (`app/layout.tsx`)

```tsx
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
```

---

## 5. Section Layout with Top Submenu

Example: `app/(projects)/layout.tsx`.

```tsx
import { navTree } from "@/nav.config";
import { TopSubmenu } from "@/components/top-submenu";

export default function ProjectsLayout({ children }) {
  const projectsNode = navTree.find(x => x.href === "/projects");

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu
        items={projectsNode?.children ?? []}
        actions={projectsNode?.actions ?? []}
      />
      <main className="p-6 flex-1">
        {children}
      </main>
    </div>
  );
}
```

---

## 6. Sidebar Component

The sidebar renders the top-level items from the navigation tree.

```tsx
"use client";
import { navTree } from "@/nav.config";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 p-4 border-r">
      <nav className="space-y-2">
        {navTree.map(item => {
          const active = pathname.startsWith(item.href ?? "");
          return (
            <Link
              key={item.label}
              href={item.href ?? "#"}
              className={`block px-3 py-2 rounded ${active ? "bg-gray-200 font-medium" : "text-gray-600"}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

---

## 7. Top Submenu Component

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopSubmenu({ items, actions }) {
  const pathname = usePathname();

  return (
    <div className="border-b px-4 py-2 bg-gray-50 flex items-center justify-between">
      <nav className="flex space-x-4">
        {items.map(item => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href ?? "#"}
              className={active ? "font-semibold" : "text-gray-600"}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {actions?.length > 0 && (
        <div className="flex space-x-2">
          {actions.map(a => (
            <button key={a.onClickId} className="px-3 py-1 bg-blue-600 text-white rounded">
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 8. Demo Navigation Hierarchy

Included in this example project:

### **Primary (left sidebar)**
- Dashboard → `/dashboard`
- Projects → `/projects`
  - Overview → `/projects`
  - Active → `/projects/active`
  - Archived → `/projects/archived`
- Settings → `/settings`
  - Profile → `/settings/profile`
  - Team → `/settings/team`

This hierarchy appears automatically in:
- Sidebar (primary)
- Section top bar (secondary)

---

## 9. Extending the navTree

You can add:

### **Actions**
Shown on the right side of the submenu.

### **Icons**
Useful for sidebar.

### **Permissions**
To hide/show items based on user role.

### **Types**
Tabs, buttons, dropdowns, etc.

The navigation system can grow without rewriting UI components.

---

## 10. Creating a `README.navigation.md` File

Every project using this navigation system **must include** a file named:

```
README.navigation.md
```

This file should include:

### **1. Explanation of navTree structure**
- How to add new sections
- How to add subsections
- How to add actions, icons, permissions, etc.

### **2. Routing conventions**
Example:
- A top-level nav item must map to a folder under `app/(section)/`.

### **3. Layout conventions**
- Every primary section must include a `layout.tsx` that injects a top submenu.

### **4. How to add new pages that automatically appear in the navigation**
- Add the route folder
- Add the entry to navTree

### **5. Rules for keeping navigation consistent**
- One source of truth → never hardcode labels or paths outside `nav.config.ts`

---

## 11. Summary

This approach provides:

- A **complete multi-level navigation system**
- Fully driven by a single config file
- Automatically synchronized with routing
- Easily extensible with custom behavior
- Consistent UI via a component library (Tailwind + shadcn/ui recommended)

You now have a scalable pattern for:
- Left sidebar navigation
- Section-specific top menus
- Rich navigation metadata and behaviors

