"use client";

import { useState } from "react";
import { useAccessibility, TamanhoFonte } from "@/context/AccessibilityContext";

const OPCOES_FONTE: { valor: TamanhoFonte; label: string; amostra: string }[] = [
  { valor: "normal", label: "Normal", amostra: "A" },
  { valor: "grande", label: "Grande", amostra: "A" },
  { valor: "muito-grande", label: "Muito grande", amostra: "A" },
];

export default function AccessibilityButton() {
  const [aberto, setAberto] = useState(false);
  const { fonte, setFonte, contrasteAlto, setContrasteAlto } = useAccessibility();

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Abrir opções de acessibilidade: tamanho da letra e contraste"
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-hiper-navy text-white shadow-card flex items-center justify-center text-xl font-bold border-2 border-white print:hidden"
      >
        Aa
      </button>

      {aberto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Opções de acessibilidade"
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setAberto(false)}
        >
          <div
            className="w-full max-w-[480px] bg-white rounded-t-card p-6 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Acessibilidade</h2>
              <button
                type="button"
                onClick={() => setAberto(false)}
                aria-label="Fechar"
                className="tap-target px-3 text-2xl text-gray-500"
              >
                ✕
              </button>
            </div>

            <p className="text-sm font-medium text-gray-600 mb-2">Tamanho da letra</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {OPCOES_FONTE.map((op) => (
                <button
                  key={op.valor}
                  type="button"
                  onClick={() => setFonte(op.valor)}
                  aria-pressed={fonte === op.valor}
                  className={`tap-target rounded-button border-2 flex flex-col items-center justify-center gap-1 font-semibold ${
                    fonte === op.valor
                      ? "border-hiper-navy bg-hiper-mist text-hiper-navy"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  <span
                    style={{
                      fontSize:
                        op.valor === "normal" ? "18px" : op.valor === "grande" ? "24px" : "30px",
                    }}
                  >
                    {op.amostra}
                  </span>
                  <span className="text-xs">{op.label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setContrasteAlto(!contrasteAlto)}
              aria-pressed={contrasteAlto}
              className={`tap-target w-full rounded-button border-2 flex items-center justify-between px-4 font-semibold ${
                contrasteAlto
                  ? "border-hiper-navy bg-hiper-mist text-hiper-navy"
                  : "border-gray-200 text-gray-700"
              }`}
            >
              <span>Modo alto contraste</span>
              <span
                aria-hidden
                className={`w-12 h-7 rounded-full flex items-center px-1 transition ${
                  contrasteAlto ? "bg-hiper-navy justify-end" : "bg-gray-300 justify-start"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white block" />
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
