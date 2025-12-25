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
  {
    label: "Full Process 2",
    href: "/full-process-2",
    children: [
      { label: "Demo", href: "/full-process-2" },
      { label: "Info", href: "/full-process-2/info" },
    ],
  },
  {
    label: "Full Process 3",
    href: "/full-process-3",
    children: [
      { label: "Demo", href: "/full-process-3" },
      { label: "Info", href: "/full-process-3/info" },
    ],
  },
  {
    label: "AP-01",
    href: "/alt-process-1",
    children: [
      { label: "Demo", href: "/alt-process-1" },
      { label: "Info", href: "/alt-process-1/info" },
    ],
  },
  {
    label: "AP-02",
    href: "/alt-process-2",
    children: [
      { label: "Demo", href: "/alt-process-2" },
      { label: "Info", href: "/alt-process-2/info" },
    ],
  },
  {
    label: "CS-01",
    href: "/chat-survey",
    children: [
      { label: "Demo", href: "/chat-survey" },
      { label: "Info", href: "/chat-survey/info" },
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
