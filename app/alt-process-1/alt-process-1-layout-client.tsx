'use client';

import { navTree } from '@/nav.config';
import { TopSubmenu } from '@/components/top-submenu';

export function AltProcess1LayoutClient({ children }: { children: React.ReactNode }) {
  const altProcess1Node = navTree.find((x) => x.href === '/alt-process-1');

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu items={altProcess1Node?.children ?? []} actions={altProcess1Node?.actions} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
