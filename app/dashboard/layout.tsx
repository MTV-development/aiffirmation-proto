import { navTree } from "@/nav.config";
import { TopSubmenu } from "@/components/top-submenu";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dashboardNode = navTree.find((x) => x.href === "/dashboard");

  return (
    <div className="flex-1 flex flex-col">
      {dashboardNode?.children && (
        <TopSubmenu
          items={dashboardNode.children}
          actions={dashboardNode.actions}
        />
      )}
      <main className="p-6 flex-1">{children}</main>
    </div>
  );
}
