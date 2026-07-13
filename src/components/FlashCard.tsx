"use client";

import { useState } from "react";
import Card from "@/components/Card";

export default function FlashCard({
  emoji,
  titulo,
  conteudo,
}: {
  emoji: string;
  titulo: string;
  conteudo: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);

  return (
    <Card className="!p-0 overflow-hidden">
      <button
        onClick={() => setAberto((v) => !v)}
        className="tap-target w-full flex items-center gap-4 p-5 text-left"
        aria-expanded={aberto}
      >
        <span className="text-2xl">{emoji}</span>
        <span className="flex-1 font-semibold text-gray-900">{titulo}</span>
        <span className="text-gray-400 text-xl">{aberto ? "−" : "+"}</span>
      </button>
      {aberto && (
        <div className="px-5 pb-5 -mt-2 text-gray-600 text-base leading-relaxed">{conteudo}</div>
      )}
    </Card>
  );
}
