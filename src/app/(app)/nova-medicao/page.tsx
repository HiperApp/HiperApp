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
import { Periodo } from "@/lib/types";

function periodoAtualPadrao(): Periodo {
  const hora = new Date().getHours();
  if (hora < 12) return "manha";
  if (hora < 18) return "tarde";
  return "noite";
}

// Muitas pessoas falam a pressão arterial de forma abreviada (ex: "12 por 8" para 120/80).
// Como nenhuma pressão sistólica real fica abaixo de 40, e nenhuma diastólica
// real fica abaixo de 20, um valor digitado menor que isso é interpretado como
// abreviação e multiplicado por 10.
function interpretarValor(valorDigitado: number, minimoReal: number): number {
  if (valorDigitado > 0 && valorDigitado < minimoReal) {
    return valorDigitado * 10;
  }
  return valorDigitado;
}

export default function NovaMedicaoPage() {
  const router = useRouter();
  const agora = new Date();

  const [data, setData] = useState(agora.toISOString().slice(0, 10));
  const [horario, setHorario] = useState(
    `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`
  );
  const [periodo, setPeriodo] = useState<Periodo>(periodoAtualPadrao());
  const [sistolica, setSistolica] = useState("");
  const [diastolica, setDiastolica] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState<ReturnType<typeof classificarPressao> | null>(null);

  const pas = interpretarValor(Number(sistolica), 40);
  const pad = interpretarValor(Number(diastolica), 20);
  const previaValida = sistolica.length > 0 && diastolica.length > 0 && pas > 0 && pad > 0;
  // A pressão sistólica é sempre maior que a diastólica. Se vier igual ou menor,
  // é sinal de que os valores foram digitados trocados — bloqueamos para não
  // mostrar uma classificação de emergência equivocada por causa da inversão.
  const valoresInvertidos = previaValida && pad >= pas;
  const previa = previaValida && !valoresInvertidos ? classificarPressao(pas, pad) : null;
  const sistolicaFoiInterpretada = sistolica.length > 0 && Number(sistolica) !== pas;
  const diastolicaFoiInterpretada = diastolica.length > 0 && Number(diastolica) !== pad;

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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const classificacao = classificarPressao(pas, pad);

    const { error } = await supabase.from("medicoes").insert({
      user_id: user!.id,
      data,
      horario,
      periodo,
      pressao_sistolica: pas,
      pressao_diastolica: pad,
      classificacao: classificacao.titulo,
      cor_status: classificacao.cor,
    });

    setSalvando(false);

    if (error) {
      console.error("ERRO AO SALVAR AFERIÇÃO:", error);
      setErro("Não foi possível salvar. Tente novamente.");
      return;
    }

    setResultado(classificacao);
  }

  if (resultado) {
    return (
      <div className="px-6 pt-14 pb-10 flex flex-col items-center text-center min-h-dvh justify-center">
        <span className="text-6xl mb-4">{resultado.emoji}</span>
        <h1 className="text-2xl font-bold text-gray-900">
          {resultado.titulo} {resultado.simbolo}
        </h1>
        <p className="text-gray-500 mt-2 max-w-xs">{resultado.mensagem}</p>
        <p className="text-3xl font-bold text-gray-900 mt-6">
          {pas} / {pad} <span className="text-base text-gray-400">mmHg</span>
        </p>
        {resultado.alertaEmergencia && (
          <div
            role="alert"
            className="mt-6 bg-red-50 border-2 border-hiper-red rounded-card p-4 text-left"
          >
            <p className="font-bold text-hiper-red mb-1">🚨 Atenção</p>
            <p className="text-sm text-gray-800">{MENSAGEM_ALERTA_EMERGENCIA}</p>
          </div>
        )}
        {resultado.alertaHipotensao && (
          <div
            role="alert"
            className={`mt-6 ${STATUS_TAILWIND.azul.bg} border-2 ${STATUS_TAILWIND.azul.border} rounded-card p-4 text-left`}
          >
            <p className={`font-bold ${STATUS_TAILWIND.azul.text} mb-1`}>🔵 Atenção — pressão baixa ↓</p>
            <p className="text-sm text-gray-800">{MENSAGEM_ALERTA_HIPOTENSAO}</p>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-6 max-w-xs">
          Essa classificação é educativa e não substitui uma avaliação médica.
        </p>
        <div className="w-full mt-8 flex flex-col gap-3">
          <Button onClick={() => router.push("/dashboard")}>Voltar ao início</Button>
          <Button variant="outline" onClick={() => router.push("/historico")}>
            Ver histórico
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-14 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-2xl" aria-label="Voltar">
          ←
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Nova Aferição</h1>
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
              placeholder="120 ou 12"
              className="w-full tap-target rounded-button border border-gray-200 px-4 text-lg bg-white"
            />
            {sistolicaFoiInterpretada && (
              <p className="text-sm text-hiper-red font-medium mt-1">= {pas}</p>
            )}
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
              placeholder="80 ou 8"
              className="w-full tap-target rounded-button border border-gray-200 px-4 text-lg bg-white"
            />
            {diastolicaFoiInterpretada && (
              <p className="text-sm text-hiper-red font-medium mt-1">= {pad}</p>
            )}
          </div>
        </div>

        <Card className="bg-hiper-mist border-0 shadow-none">
          <p className="text-sm text-gray-500">
            O primeiro número representa a pressão arterial sistólica. O segundo número
            representa a pressão arterial diastólica. Pode digitar do jeito que preferir:
            120/80 ou só 12/8.
          </p>
        </Card>

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
            <span className="text-sm text-gray-500">Classificação prévia:</span>
            <StatusBadge cor={previa.cor} simbolo={previa.simbolo} />
          </div>
        )}

        {previa?.alertaEmergencia && (
          <div
            role="alert"
            className="bg-red-50 border-2 border-hiper-red rounded-card p-4"
          >
            <p className="font-bold text-hiper-red mb-1">🚨 Atenção</p>
            <p className="text-sm text-gray-800">{MENSAGEM_ALERTA_EMERGENCIA}</p>
          </div>
        )}

        {previa?.alertaHipotensao && (
          <div
            role="alert"
            className="bg-amber-50 border-2 border-amber-400 rounded-card p-4"
          >
            <p className="font-bold text-amber-700 mb-1">⚠️ Atenção — pressão baixa</p>
            <p className="text-sm text-gray-800">{MENSAGEM_ALERTA_HIPOTENSAO}</p>
          </div>
        )}

        {erro && (
          <p role="alert" className="text-red-600 text-sm font-medium">
            {erro}
          </p>
        )}

        <Button type="submit" disabled={salvando} className="mt-2">
          {salvando ? "Salvando..." : "SALVAR AFERIÇÃO"}
        </Button>
      </form>
    </div>
  );
}
