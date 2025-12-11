import { GoodTenV2LayoutClient } from "./good-ten-v2-layout-client";

export default function GoodTenV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GoodTenV2LayoutClient>{children}</GoodTenV2LayoutClient>;
}
