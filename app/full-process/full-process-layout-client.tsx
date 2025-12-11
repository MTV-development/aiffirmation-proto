'use client';

import { navTree } from "@/nav.config";
import { TopSubmenu } from "@/components/top-submenu";

export function FullProcessLayoutClient({ children }: { children: React.ReactNode }) {
  const fullProcessNode = navTree.find((x) => x.href === "/full-process");

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu
        items={fullProcessNode?.children ?? []}
        actions={fullProcessNode?.actions}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
