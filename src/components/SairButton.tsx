"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SairButton({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();

  async function handleSair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSair}
      aria-label="Sair da conta"
      className={
        className ??
        "w-11 h-11 rounded-full bg-white shadow-soft flex items-center justify-center text-xl tap-target"
      }
    >
      {children ?? "🚪"}
    </button>
  );
}
