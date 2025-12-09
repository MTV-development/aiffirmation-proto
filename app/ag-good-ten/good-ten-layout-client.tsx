'use client';

import { navTree } from "@/nav.config";
import { TopSubmenu } from "@/components/top-submenu";
import { ImplementationProvider, ImplementationSelector } from "@/src/ag-good-ten";

export function GoodTenLayoutClient({ children }: { children: React.ReactNode }) {
  const goodTenNode = navTree.find((x) => x.href === "/ag-good-ten");

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
          items={goodTenNode?.children ?? []}
          actions={goodTenNode?.actions}
          rightContent={implementationDropdown}
        />
        <main className="p-6 flex-1">{children}</main>
      </div>
    </ImplementationProvider>
  );
}
