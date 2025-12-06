"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/nav.config";

type TopSubmenuProps = {
  items: NavItem[];
  actions?: { label: string; onClickId: string }[];
};

export function TopSubmenu({ items, actions }: TopSubmenuProps) {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-2 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
      <nav className="flex space-x-4">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href ?? "#"}
              className={
                active
                  ? "font-semibold text-foreground"
                  : "text-gray-600 dark:text-gray-400 hover:text-foreground"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {actions && actions.length > 0 && (
        <div className="flex space-x-2">
          {actions.map((a) => (
            <button
              key={a.onClickId}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
