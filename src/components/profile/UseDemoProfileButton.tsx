"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { DEMO_PROFILE } from "@/content/demoProfile";
import { actions } from "@/lib/useDemoState";

export function UseDemoProfileButton({ variant = "secondary" }: { variant?: "secondary" | "ghost" }) {
  const router = useRouter();
  return (
    <Button
      variant={variant}
      onClick={() => {
        actions.saveProfile(DEMO_PROFILE);
        router.push("/reality-check");
      }}
    >
      Folosește un profil exemplu
    </Button>
  );
}
