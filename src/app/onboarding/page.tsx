"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/Button";

const SLIDES = [
  {
    emoji: "❤️",
    titulo: "HiperApp",
    texto: "Seu aplicativo para acompanhar sua pressão arterial de forma simples e organizada.",
  },
  {
    emoji: "➕",
    titulo: "Adicionar aferições",
    texto: "Registre seus valores de pressão arterial diariamente.",
  },
  {
    emoji: "📈",
    titulo: "Acompanhe sua evolução",
    texto: "Veja seu histórico e gráficos de acompanhamento.",
  },
  {
    emoji: "🤝",
    titulo: "Cuide da sua saúde",
    texto:
      "Leve o histórico de medições registrado no aplicativo para suas consultas — ele ajuda o profissional de saúde a avaliar a evolução e as variações da sua pressão arterial ao longo do tempo.",
  },
];

export default function OnboardingPage() {
  const [indice, setIndice] = useState(0);
  const router = useRouter();
  const slide = SLIDES[indice];
  const ultimo = indice === SLIDES.length - 1;

  function marcarVisto() {
    document.cookie = "hiperapp_onboarding_visto=1; max-age=31536000; path=/";
  }

  function avancar() {
    if (ultimo) {
      marcarVisto();
      router.push("/login");
    } else {
      setIndice((i) => i + 1);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 pt-16 pb-10">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-28 h-28 rounded-full bg-hiper-red/10 flex items-center justify-center text-6xl mb-8">
          {slide.emoji}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{slide.titulo}</h1>
        <p className="text-gray-500 mt-3 max-w-xs">{slide.texto}</p>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === indice ? "w-6 bg-hiper-red" : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </div>

      <Link
        href="/instalar"
        className="tap-target mb-4 w-full bg-white rounded-card shadow-card px-5 flex items-center justify-between"
      >
        <span className="font-medium text-gray-700">📲 Como instalar na tela inicial</span>
        <span className="text-gray-400">›</span>
      </Link>

      <div className="flex gap-3">
        {!ultimo && (
          <Button variant="ghost" fullWidth={false} onClick={() => { marcarVisto(); router.push("/login"); }}>
            Pular
          </Button>
        )}
        <Button onClick={avancar}>{ultimo ? "COMEÇAR" : "Próximo"}</Button>
      </div>
    </div>
  );
}
