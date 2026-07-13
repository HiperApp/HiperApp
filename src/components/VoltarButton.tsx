"use client";

import { useRouter } from "next/navigation";

export default function VoltarButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="text-2xl"
      aria-label="Voltar"
    >
      ←
    </button>
  );
}
