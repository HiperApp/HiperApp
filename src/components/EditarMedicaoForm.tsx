"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/Button";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import {
  classificarPressao,
  MENSAGEM_ALERTA_EMERGENCIA,
  MENSAGEM_ALERTA_HIPOTENSAO,
  STATUS_TAILWIND,
} from "@/lib/classification";
import { Medicao, Periodo } from "@/lib/types";

// Mesma convenção da tela "Nova Aferição": permite digitar "12" para 120.
function interpretarValor(valorDigitado: number, minimoReal: number): number {
  if (valorDigitado > 0 && valorDigitado < minimoReal) {
    return valorDigitado * 10;
  }
  return valorDigitado;
}

export default function EditarMedicaoForm({ medicao }: { medicao: Medicao }) {
  const router = useRouter();

  const [data, setData] = useState(medicao.data);
  const [horario, setHorario] = useState(medicao.horario.slice(0, 5));
  const [periodo, setPeriodo] = useState<Periodo>(medicao.periodo);
  const [sistolica, setSistolica] = useState(String(medicao.pressao_sistolica));
  const [diastolica, setDiastolica] = useState(String(medicao.pressao_diastolica));
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const pas = interpretarValor(Number(sistolica), 40);
  const pad = interpretarValor(Number(diastolica), 20);
  const previaValida = sistolica.length > 0 && diastolica.length > 0 && pas > 0 && pad > 0;
  // A pressão sistólica é sempre maior que a diastólica. Se vier igual ou menor,
  // é sinal de que os valores foram digitados trocados — bloqueamos para não
  // mostrar uma classificação de emergência equivocada por causa da inversão.
  const valoresInvertidos = previaValida && pad >= pas;
  const previa = previaValida && !valoresInvertidos ? classificarPressao(pas, pad) : null;

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!previaValida || pas < 40 || pas > 300 || pad < 20 || pad > 200) {
      setErro("Confira os valores de pressão arterial informados.");
      return;
    }

    if (valoresInvertidos) {
      setErro(
        "O primeiro número (sistólica) deve ser maior que o segundo (diastólica). Parece que os valores foram digitados trocados — confira e tente de novo."
      );
      return;
    }

    setSalvando(true);
    const supabase = createClient();
    const classificacao = classificarPressao(pas, pad);

    const { error } = await supabase
      .from("medicoes")
      .update({
        data,
        horario,
        periodo,
        pressao_sistolica: pas,
        pressao_diastolica: pad,
        classificacao: classificacao.titulo,
        cor_status: classificacao.cor,
      })
      .eq("id", medicao.id);

    setSalvando(false);

    if (error) {
      console.error("ERRO AO ATUALIZAR AFERIÇÃO:", error);
      setErro("Não foi possível salvar. Tente novamente.");
      return;
    }

    router.push("/historico");
    router.refresh();
  }

  return (
    <div className="px-6 pt-14 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/historico" className="text-2xl" aria-label="Voltar">
          ←
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Editar Aferição</h1>
      </div>

      <form onSubmit={handleSalvar} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Data</label>
            <input
              type="date"
              required
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full tap-target rounded-button border border-gray-200 px-3 bg-white text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Horário</label>
            <input
              type="time"
              required
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="w-full tap-target rounded-button border border-gray-200 px-3 bg-white text-base"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Período</label>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { valor: "manha", label: "Manhã", emoji: "☀️" },
                { valor: "tarde", label: "Tarde", emoji: "🌤️" },
                { valor: "noite", label: "Noite", emoji: "🌙" },
              ] as const
            ).map((op) => (
              <button
                type="button"
                key={op.valor}
                onClick={() => setPeriodo(op.valor)}
                className={`tap-target rounded-button border-2 flex flex-col items-center justify-center gap-1 text-sm font-medium ${
                  periodo === op.valor
                    ? "border-hiper-red bg-red-50 text-hiper-red"
                    : "border-gray-200 bg-white text-gray-500"
                }`}
              >
                <span className="text-xl">{op.emoji}</span>
                {op.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Pressão arterial sistólica (maior)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              value={sistolica}
              onChange={(e) => setSistolica(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full tap-target rounded-button border border-gray-200 px-4 text-lg bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Pressão arterial diastólica (menor)
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              value={diastolica}
              onChange={(e) => setDiastolica(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-full tap-target rounded-button border border-gray-200 px-4 text-lg bg-white"
            />
          </div>
        </div>

        {valoresInvertidos && (
          <div
            role="alert"
            className="bg-amber-50 border-2 border-amber-400 rounded-card p-4"
          >
            <p className="font-bold text-amber-700 mb-1">⚠️ Confira os valores</p>
            <p className="text-sm text-gray-800">
              O primeiro número (sistólica) costuma ser maior que o segundo (diastólica).
              Parece que os valores foram digitados trocados.
            </p>
          </div>
        )}

        {previa && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Classificação:</span>
            <StatusBadge cor={previa.cor} texto={previa.titulo} simbolo={previa.simbolo} />
          </div>
        )}

        {previa?.alertaEmergencia && (
          <div role="alert" className="bg-red-50 border-2 border-hiper-red rounded-card p-4">
            <p className="font-bold text-hiper-red mb-1">🚨 Atenção</p>
            <p className="text-sm text-gray-800">{MENSAGEM_ALERTA_EMERGENCIA}</p>
          </div>
        )}

        {previa?.alertaHipotensao && (
          <div
            role="alert"
            className={`${STATUS_TAILWIND.azul.bg} border-2 ${STATUS_TAILWIND.azul.border} rounded-card p-4`}
          >
            <p className={`font-bold ${STATUS_TAILWIND.azul.text} mb-1`}>🔵 Atenção — pressão baixa ↓</p>
            <p className="text-sm text-gray-800">{MENSAGEM_ALERTA_HIPOTENSAO}</p>
          </div>
        )}

        {erro && (
          <p role="alert" className="text-red-600 text-sm font-medium">
            {erro}
          </p>
        )}

        <Button type="submit" disabled={salvando} className="mt-2">
          {salvando ? "Salvando..." : "SALVAR ALTERAÇÕES"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/historico")}
        >
          Cancelar
        </Button>
      </form>
    </div>
  );
}
