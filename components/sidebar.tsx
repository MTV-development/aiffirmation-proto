"use client";

import { navTree } from "@/nav.config";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 p-4 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <nav className="space-y-2">
        {navTree.map((item) => {
          const active = pathname.startsWith(item.href ?? "");
          return (
            <Link
              key={item.label}
              href={item.href ?? "#"}
              className={`block px-3 py-2 rounded ${
                active
                  ? "bg-gray-200 dark:bg-gray-700 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
