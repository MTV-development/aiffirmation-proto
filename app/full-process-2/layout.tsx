import { FullProcess2LayoutClient } from "./full-process-2-layout-client";

export default function FullProcess2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FullProcess2LayoutClient>{children}</FullProcess2LayoutClient>;
}
