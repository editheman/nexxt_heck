import Image from "next/image";
import { cn } from "@/components/ui/cn";

/** Brand mark (llama). Decorative: the product name is always rendered as text next to it. */
export function Logo({ size = 32, className }: { size?: number; className?: string }) {
  return <Image src="/logo.png" alt="" width={size} height={size} priority className={cn("shrink-0 rounded-full", className)} />;
}
