import { AF01LayoutClient } from "./af01-layout-client";

export default function AF01Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AF01LayoutClient>{children}</AF01LayoutClient>;
}
