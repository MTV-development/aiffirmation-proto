'use client';

import { navTree } from "@/nav.config";
import { TopSubmenu } from "@/components/top-submenu";
import { ImplementationProvider, ImplementationSelector } from "@/src/ag-good-ten-v2";

export function GoodTenV2LayoutClient({ children }: { children: React.ReactNode }) {
  const goodTenV2Node = navTree.find((x) => x.href === "/ag-good-ten-v2");

  const implementationDropdown = (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Implementation:</span>
      <ImplementationSelector />
    </div>
  );

  return (
    <ImplementationProvider>
      <div className="flex-1 flex flex-col">
        <TopSubmenu
          items={goodTenV2Node?.children ?? []}
          actions={goodTenV2Node?.actions}
          rightContent={implementationDropdown}
        />
        <main className="p-6 flex-1">{children}</main>
      </div>
    </ImplementationProvider>
  );
}
