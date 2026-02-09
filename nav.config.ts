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
    label: "Overview",
    href: "/overview",
  },
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
  {
    label: "FO-01",
    href: "/fo-01",
    children: [
      { label: "Demo", href: "/fo-01" },
      { label: "Info", href: "/fo-01/info" },
    ],
  },
  {
    label: "FO-02",
    href: "/fo-02",
    children: [
      { label: "Demo", href: "/fo-02" },
      { label: "Info", href: "/fo-02/info" },
    ],
  },
  {
    label: "FO-03",
    href: "/fo-03",
    children: [
      { label: "Demo", href: "/fo-03" },
      { label: "Info", href: "/fo-03/info" },
    ],
  },
  {
    label: "FO-04",
    href: "/fo-04",
    children: [
      { label: "Demo", href: "/fo-04" },
      { label: "Info", href: "/fo-04/info" },
    ],
  },
  {
    label: "FO-05",
    href: "/fo-05",
    children: [
      { label: "Demo", href: "/fo-05" },
      { label: "Info", href: "/fo-05/info" },
    ],
  },
  {
    label: "FO-06",
    href: "/fo-06",
    children: [
      { label: "Demo", href: "/fo-06" },
      { label: "Info", href: "/fo-06/info" },
    ],
  },
  {
    label: "FO-07",
    href: "/fo-07",
    children: [
      { label: "Demo", href: "/fo-07" },
      { label: "Info", href: "/fo-07/info" },
    ],
  },
  {
    label: "FO-08",
    href: "/fo-08",
    children: [
      { label: "Demo", href: "/fo-08" },
      { label: "Info", href: "/fo-08/info" },
    ],
  },
  {
    label: "FO-09",
    href: "/fo-09",
    children: [
      { label: "Demo", href: "/fo-09" },
      { label: "Info", href: "/fo-09/info" },
    ],
  },
  {
    label: "FO-10",
    href: "/fo-10",
    children: [
      { label: "Demo", href: "/fo-10" },
      { label: "Info", href: "/fo-10/info" },
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
