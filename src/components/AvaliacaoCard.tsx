"use client";

import { useState } from "react";
import Card from "@/components/Card";
import { AvaliacaoResultado } from "@/lib/avaliacao";
import { STATUS_TAILWIND } from "@/lib/classification";

export default function AvaliacaoCard({ avaliacao }: { avaliacao: AvaliacaoResultado }) {
  const [aberto, setAberto] = useState(false);
  const cor = STATUS_TAILWIND[avaliacao.cor];

  return (
    <>
      {/* Card compacto na tela inicial: só o essencial, sem o texto longo */}
      <Card className={`mb-6 border-l-4 ${cor.border}`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden>
            {avaliacao.emoji}
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-700">Avaliação dos valores</p>
            <p className="text-base text-gray-900 font-medium mt-0.5">{avaliacao.titulo}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="tap-target w-full mt-4 rounded-button border-2 border-hiper-navy text-hiper-navy font-semibold"
        >
          Ver avaliação completa
        </button>
      </Card>

      {/* Tela de avaliação completa, aberta ao tocar no botão acima */}
      {aberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Avaliação completa dos valores"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setAberto(false)}
        >
          <div
            className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto bg-white rounded-t-card p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden>
                  {avaliacao.emoji}
                </span>
                <h2 className="text-lg font-bold text-gray-900 pt-0.5">{avaliacao.titulo}</h2>
              </div>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                className="tap-target px-3 text-2xl text-gray-500 shrink-0"
              >
                ✕
              </button>
            </div>

            <p className="text-base text-gray-700 leading-relaxed">{avaliacao.mensagem}</p>

            <p className="text-xs text-gray-400 mt-4">
              Essa avaliação é educativa, baseada nos seus registros, e não substitui uma consulta
              médica.
            </p>

            <button
              type="button"
              onClick={() => setAberto(false)}
              className="tap-target w-full mt-6 rounded-button bg-hiper-navy text-white font-semibold text-lg"
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </>
  );
}
