'use client';

import { navTree } from '@/nav.config';
import { TopSubmenu } from '@/components/top-submenu';

export function FullProcess3LayoutClient({ children }: { children: React.ReactNode }) {
  const fullProcess3Node = navTree.find((x) => x.href === '/full-process-3');

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu items={fullProcess3Node?.children ?? []} actions={fullProcess3Node?.actions} />
      <main className="flex-1">{children}</main>
    </div>
  );
}


