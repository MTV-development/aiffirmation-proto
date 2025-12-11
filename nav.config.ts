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
    label: "AF-01",
    href: "/ag-aff-01",
    children: [
      { label: "Demo", href: "/ag-aff-01" },
      { label: "Info", href: "/ag-aff-01/info" },
    ],
  },
  {
    label: "Good Ten",
    href: "/ag-good-ten",
    children: [
      { label: "Demo", href: "/ag-good-ten" },
      { label: "Info", href: "/ag-good-ten/info" },
    ],
  },
  {
    label: "Full Process",
    href: "/full-process",
    children: [
      { label: "Demo", href: "/full-process" },
      { label: "Info", href: "/full-process/info" },
    ],
  },
  // {
  //   label: "Weather Demo",
  //   href: "/weatherdemo",
  // },
  {
    label: "Settings",
    href: "/settings",
    children: [
      { label: "KV Editor", href: "/settings/store/edit" },
      { label: "Models", href: "/settings/models" },
    ],
  },
];
