'use client';

import { navTree } from '@/nav.config';
import { TopSubmenu } from '@/components/top-submenu';

export function Fo05LayoutClient({ children }: { children: React.ReactNode }) {
  const fo05Node = navTree.find((x) => x.href === '/fo-05');

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu items={fo05Node?.children ?? []} actions={fo05Node?.actions} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
