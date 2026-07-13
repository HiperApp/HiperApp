"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import { createClient } from "@/lib/supabase/client";
import { Medicao, PERIODO_INFO } from "@/lib/types";
import { classificarPressao } from "@/lib/classification";

export default function MedicaoCard({ medicao }: { medicao: Medicao }) {
  const router = useRouter();
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const p = PERIODO_INFO[medicao.periodo as keyof typeof PERIODO_INFO];
  // Recalculada a partir dos valores (em vez de usar cor_status/classificacao
  // já salvos) para que registros antigos também sigam sempre a identificação
  // visual mais atual — mesma regra de classificação, mesmos números.
  const classificacao = classificarPressao(medicao.pressao_sistolica, medicao.pressao_diastolica);

  async function handleExcluir() {
    const confirmou = window.confirm(
      "Tem certeza que deseja excluir esta aferição? Essa ação não pode ser desfeita."
    );
    if (!confirmou) return;

    setExcluindo(true);
    setErro(null);
    const supabase = createClient();
    const { error } = await supabase.from("medicoes").delete().eq("id", medicao.id);
    setExcluindo(false);

    if (error) {
      console.error("ERRO AO EXCLUIR MEDIÇÃO:", error);
      setErro("Não foi possível excluir. Tente novamente.");
      return;
    }

    router.refresh();
  }

  return (
    <Card className="print:shadow-none print:border print:border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">
            {new Date(medicao.data + "T00:00:00").toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}{" "}
            {medicao.horario.slice(0, 5)} · {p.emoji} {p.label}
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {medicao.pressao_sistolica} / {medicao.pressao_diastolica}
            <span className="text-sm font-medium text-gray-400 ml-1">mmHg</span>
          </p>
        </div>
        <StatusBadge cor={classificacao.cor} simbolo={classificacao.simbolo} />
      </div>

      <div className="flex gap-3 mt-4 print:hidden">
        <button
          type="button"
          onClick={() => router.push(`/historico/${medicao.id}/editar`)}
          className="tap-target flex-1 rounded-button border-2 border-hiper-navy text-hiper-navy font-semibold text-sm"
        >
          ✏️ Editar
        </button>
        <button
          type="button"
          onClick={handleExcluir}
          disabled={excluindo}
          className="tap-target flex-1 rounded-button border-2 border-red-600 text-red-600 font-semibold text-sm disabled:opacity-50"
        >
          {excluindo ? "Excluindo..." : "🗑️ Excluir"}
        </button>
      </div>
      {erro && (
        <p role="alert" className="text-red-600 text-sm font-medium mt-2">
          {erro}
        </p>
      )}
    </Card>
  );
}
