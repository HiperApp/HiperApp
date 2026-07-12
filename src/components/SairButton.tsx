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
        "tap-target px-5 rounded-button bg-white shadow-soft flex items-center justify-center text-base font-semibold text-gray-600 border border-gray-200"
      }
    >
      {children ?? "Sair"}
    </button>
  );
}
