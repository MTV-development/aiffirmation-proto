// nav.config.ts
import type { ReactNode } from "react";

export type NavItem = {
  label: string;
  href?: string;
  icon?: ReactNode;
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
    label: "Affirmations",
    href: "/ag-aff-01",
  },
  {
    label: "Weather Demo",
    href: "/weatherdemo",
  },
  {
    label: "Projects",
    href: "/projects",
    children: [
      { label: "Overview", href: "/projects" },
      { label: "Active", href: "/projects/active" },
      { label: "Archived", href: "/projects/archived" },
    ],
    actions: [{ label: "New Project", onClickId: "createProject" }],
  },
  {
    label: "Settings",
    href: "/settings",
    children: [
      { label: "Profile", href: "/settings/profile" },
      { label: "Team", href: "/settings/team" },
      { label: "Store", href: "/settings/store" },
      { label: "KV Editor", href: "/settings/store/edit" },
    ],
  },
];
