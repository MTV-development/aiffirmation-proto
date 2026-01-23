'use client';

import { navTree } from '@/nav.config';
import { TopSubmenu } from '@/components/top-submenu';

export function Fo04LayoutClient({ children }: { children: React.ReactNode }) {
  const fo04Node = navTree.find((x) => x.href === '/fo-04');

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu items={fo04Node?.children ?? []} actions={fo04Node?.actions} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
