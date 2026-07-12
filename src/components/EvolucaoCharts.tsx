"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import Card from "@/components/Card";
import { Medicao } from "@/lib/types";

const JANELAS = [
  { dias: 7, label: "7 dias" },
  { dias: 30, label: "30 dias" },
  { dias: 90, label: "90 dias" },
];

export default function EvolucaoCharts({ medicoes }: { medicoes: Medicao[] }) {
  const [janela, setJanela] = useState(7);

  const dados = useMemo(() => {
    const limite = new Date();
    limite.setDate(limite.getDate() - janela);

    return medicoes
      .filter((m) => new Date(m.data + "T00:00:00") >= limite)
      .sort((a, b) => (a.data + a.horario).localeCompare(b.data + b.horario))
      .map((m) => ({
        label: new Date(m.data + "T00:00:00").toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        }),
        sistolica: m.pressao_sistolica,
        diastolica: m.pressao_diastolica,
      }));
  }, [medicoes, janela]);

  const sistolicas = dados.map((d) => d.sistolica);
  const diastolicas = dados.map((d) => d.diastolica);

  const mediaSist = sistolicas.length
    ? Math.round(sistolicas.reduce((a, b) => a + b, 0) / sistolicas.length)
    : 0;
  const mediaDiast = diastolicas.length
    ? Math.round(diastolicas.reduce((a, b) => a + b, 0) / diastolicas.length)
    : 0;

  if (medicoes.length === 0) {
    return (
      <Card className="text-center py-10">
        <p className="text-gray-400">
          Registre algumas aferições para ver seus gráficos de evolução aqui.
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="flex gap-2 mb-5">
        {JANELAS.map((j) => (
          <button
            key={j.dias}
            onClick={() => setJanela(j.dias)}
            className={`tap-target flex-1 rounded-button text-sm font-semibold ${
              janela === j.dias ? "bg-hiper-navy text-white" : "bg-white text-gray-500"
            }`}
          >
            {j.label}
          </button>
        ))}
      </div>

      <Card className="mb-4">
        <p className="text-sm font-semibold text-gray-600 mb-3">
          Pressão Arterial Sistólica (máxima)
        </p>
        <div className="h-48 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dados} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis domain={[80, 200]} tick={{ fontSize: 11 }} />
              <ReferenceLine y={140} stroke="#E0A500" strokeDasharray="4 4" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sistolica"
                stroke="#E2333D"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          A linha amarela (140) é só uma referência visual do gráfico, não um diagnóstico. Ajuda
          a visualizar sua tendência ao longo do tempo — converse com seu médico sobre o que os
          números significam para você.
        </p>
      </Card>

      <Card className="mb-4">
        <p className="text-sm font-semibold text-gray-600 mb-3">
          Pressão Arterial Diastólica (mínima)
        </p>
        <div className="h-48 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dados} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis domain={[40, 120]} tick={{ fontSize: 11 }} />
              <ReferenceLine y={90} stroke="#E0A500" strokeDasharray="4 4" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="diastolica"
                stroke="#345B99"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          A linha amarela (90) é só uma referência visual do gráfico, não um diagnóstico. Ajuda a
          visualizar sua tendência ao longo do tempo — converse com seu médico sobre o que os
          números significam para você.
        </p>
      </Card>

      <Card>
        <p className="text-sm text-gray-500 mb-3">Média no período</p>
        <div className="flex justify-between">
          <div>
            <p className="text-xs text-gray-400">Média Sistólica</p>
            <p className="text-2xl font-bold text-gray-900">
              {mediaSist} <span className="text-sm font-normal text-gray-400">mmHg</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Média Diastólica</p>
            <p className="text-2xl font-bold text-gray-900">
              {mediaDiast} <span className="text-sm font-normal text-gray-400">mmHg</span>
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}
