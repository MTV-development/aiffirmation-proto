import { FullProcessLayoutClient } from "./full-process-layout-client";

export default function FullProcessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FullProcessLayoutClient>{children}</FullProcessLayoutClient>;
}
