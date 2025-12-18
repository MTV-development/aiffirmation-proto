'use client';

import { navTree } from '@/nav.config';
import { TopSubmenu } from '@/components/top-submenu';

export function AltProcess2LayoutClient({ children }: { children: React.ReactNode }) {
  const altProcess2Node = navTree.find((x) => x.href === '/alt-process-2');

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu items={altProcess2Node?.children ?? []} actions={altProcess2Node?.actions} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
