import { GoodTenLayoutClient } from "./good-ten-layout-client";

export default function GoodTenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GoodTenLayoutClient>{children}</GoodTenLayoutClient>;
}
