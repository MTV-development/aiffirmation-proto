import { navTree } from "@/nav.config";
import { TopSubmenu } from "@/components/top-submenu";

export default function AF01Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const af01Node = navTree.find((x) => x.href === "/ag-aff-01");

  return (
    <div className="flex-1 flex flex-col">
      <TopSubmenu
        items={af01Node?.children ?? []}
        actions={af01Node?.actions}
      />
      <main className="p-6 flex-1">{children}</main>
    </div>
  );
}
