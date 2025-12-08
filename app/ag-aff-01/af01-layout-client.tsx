'use client';

import { navTree } from "@/nav.config";
import { TopSubmenu } from "@/components/top-submenu";
import { ImplementationProvider, ImplementationSelector } from "@/src/ag-aff-01";

export function AF01LayoutClient({ children }: { children: React.ReactNode }) {
  const af01Node = navTree.find((x) => x.href === "/ag-aff-01");

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
          items={af01Node?.children ?? []}
          actions={af01Node?.actions}
          rightContent={implementationDropdown}
        />
        <main className="p-6 flex-1">{children}</main>
      </div>
    </ImplementationProvider>
  );
}
