import type { Metadata } from "next";
import { Portal } from "@/components/portal/Portal";

export const metadata: Metadata = { title: "Portalul tău" };

export default function Page() {
  return <Portal />;
}
