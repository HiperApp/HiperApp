"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/Button";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import { classificarPressao } from "@/lib/classification";
import { Periodo } from "@/lib/types";

function periodoAtualPadrao(): Periodo {
  const hora = new Date().getHours();
  if (hora < 12) return "manha";
  if (hora < 18) return "tarde";
  return "noite";
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

  const pas = Number(sistolica);
  const pad = Number(diastolica);
  const previaValida = sistolica.length > 0 && diastolica.length > 0 && pas > 0 && pad > 0;
  const previa = previaValida ? classificarPressao(pas, pad) : null;

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (!previaValida || pas < 40 || pas > 300 || pad < 20 || pad > 200) {
      setErro("Confira os valores de pressão informados.");
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
      setErro("Não foi possível salvar. Tente novamente.");
      return;
    }

    setResultado(classificacao);
  }

  if (resultado) {
    return (
      <div className="px-6 pt-14 pb-10 flex flex-col items-center text-center min-h-dvh justify-center">
        <span className="text-6xl mb-4">{resultado.emoji}</span>
        <h1 className="text-2xl font-bold text-gray-900">{resultado.titulo}</h1>
        <p className="text-gray-500 mt-2 max-w-xs">{resultado.mensagem}</p>
        <p className="text-3xl font-bold text-gray-900 mt-6">
          {sistolica} / {diastolica} <span className="text-base text-gray-400">mmHg</span>
        </p>
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
        <h1 className="text-xl font-bold text-gray-900">Nova Medição</h1>
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
              Pressão sistólica (maior)
            </label>
            <input
              type="number"
              inputMode="numeric"
              required
              value={sistolica}
              onChange={(e) => setSistolica(e.target.value)}
              placeholder="120"
              className="w-full tap-target rounded-button border border-gray-200 px-4 text-lg bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Pressão diastólica (menor)
            </label>
            <input
              type="number"
              inputMode="numeric"
              required
              value={diastolica}
              onChange={(e) => setDiastolica(e.target.value)}
              placeholder="80"
              className="w-full tap-target rounded-button border border-gray-200 px-4 text-lg bg-white"
            />
          </div>
        </div>

        <Card className="bg-hiper-mist border-0 shadow-none">
          <p className="text-sm text-gray-500">
            O primeiro número representa a pressão sistólica. O segundo número representa a
            pressão diastólica.
          </p>
        </Card>

        {previa && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Classificação prévia:</span>
            <StatusBadge cor={previa.cor} texto={previa.titulo} />
          </div>
        )}

        {erro && (
          <p role="alert" className="text-red-600 text-sm font-medium">
            {erro}
          </p>
        )}

        <Button type="submit" disabled={salvando} className="mt-2">
          {salvando ? "Salvando..." : "SALVAR MEDIÇÃO"}
        </Button>
      </form>
    </div>
  );
}
