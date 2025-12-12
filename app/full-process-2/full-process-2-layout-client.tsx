'use client';

import { navTree } from "@/nav.config";
import { TopSubmenu } from "@/components/top-submenu";

export function FullProcess2LayoutClient({ children }: { children: React.ReactNode }) {
  const fullProcess2Node = navTree.find((x) => x.href === "/full-process-2");

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu
        items={fullProcess2Node?.children ?? []}
        actions={fullProcess2Node?.actions}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
