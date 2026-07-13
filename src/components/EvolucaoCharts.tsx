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
  ReferenceArea,
} from "recharts";
import Card from "@/components/Card";
import { Medicao } from "@/lib/types";
import { classificarPressao, CORES_STATUS, FAIXAS_PRESSAO } from "@/lib/classification";
import { useAccessibility } from "@/context/AccessibilityContext";

const JANELAS = [
  { dias: 7, label: "7 dias" },
  { dias: 30, label: "30 dias" },
  { dias: 90, label: "90 dias" },
];

// Legenda fixa da identificação visual (cor + emoji + texto + símbolo),
// igual em todo o app, para que a cor do gráfico nunca seja a única forma
// de entender o resultado.
const LEGENDA_STATUS = [
  { emoji: "🔵", texto: "Baixa ↓" },
  { emoji: "🟢", texto: "Adequada" },
  { emoji: "🟡", texto: "Levemente elevada ↑" },
  { emoji: "🟠", texto: "Alta ↑" },
  { emoji: "🔴", texto: "Muito elevada ⚠" },
] as const;

function LegendaStatus() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-xs text-gray-500">
      {LEGENDA_STATUS.map((item) => (
        <span key={item.texto} className="inline-flex items-center gap-1">
          <span aria-hidden>{item.emoji}</span>
          {item.texto}
        </span>
      ))}
    </div>
  );
}

// Cada ponto do gráfico é colorido conforme a classificação da aferição
// completa (sistólica + diastólica), a mesma regra usada no restante do
// app — assim fica visível de imediato quais aferições estavam alteradas.
function PontoColorido(props: {
  cx?: number;
  cy?: number;
  payload?: { sistolica: number; diastolica: number };
}) {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined || !payload) return null;
  const cor = classificarPressao(payload.sistolica, payload.diastolica).cor;
  return (
    <circle cx={cx} cy={cy} r={4} fill={CORES_STATUS[cor]} stroke="#fff" strokeWidth={1} />
  );
}

export default function EvolucaoCharts({ medicoes }: { medicoes: Medicao[] }) {
  const [janela, setJanela] = useState(7);
  const { fonte } = useAccessibility();

  // Os textos do gráfico (eixos e linhas de referência) são desenhados
  // pelo Recharts dentro de um SVG, em pixels fixos — não são classes
  // Tailwind, então não escalam sozinhos com o "rem" do resto do app.
  // Por isso aumentamos o tamanho manualmente conforme a preferência de
  // fonte escolhida em Acessibilidade, na mesma proporção usada para os
  // textos secundários (text-xs) do restante do app.
  const escalaFonte = fonte === "muito-grande" ? 1.55 : fonte === "grande" ? 1.3 : 1;
  const fontSizeEixo = Math.round(11 * escalaFonte);
  const fontSizeReferencia = Math.round(10 * escalaFonte);
  const margemEsquerda = fonte === "normal" ? 0 : Math.round(6 * escalaFonte);

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

      <LegendaStatus />

      <Card className="mb-4">
        <p className="text-sm font-semibold text-gray-600 mb-3">
          Pressão Arterial Sistólica (máxima)
        </p>
        <div className="h-48 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dados} margin={{ top: 5, right: 10, left: margemEsquerda, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: fontSizeEixo }} />
              <YAxis domain={[80, 200]} tick={{ fontSize: fontSizeEixo }} />
              <ReferenceArea
                y1={FAIXAS_PRESSAO.baixa.pasMax + 1}
                y2={FAIXAS_PRESSAO.adequada.pasMax}
                fill="#2E9E5B"
                fillOpacity={0.08}
              />
              <ReferenceLine
                y={FAIXAS_PRESSAO.alta.pasMin}
                stroke="#E8730C"
                strokeDasharray="4 4"
                label={{
                  value: "Alta ↑",
                  position: "insideTopRight",
                  fill: "#E8730C",
                  fontSize: fontSizeReferencia,
                }}
              />
              <ReferenceLine
                y={FAIXAS_PRESSAO.levementeAlterada.pasMin}
                stroke="#E0A500"
                strokeDasharray="4 4"
                label={{
                  value: "Elevada ↑",
                  position: "insideTopRight",
                  fill: "#E0A500",
                  fontSize: fontSizeReferencia,
                }}
              />
              <ReferenceLine
                y={FAIXAS_PRESSAO.baixa.pasMax}
                stroke="#2563EB"
                strokeDasharray="4 4"
                label={{
                  value: "Baixa ↓",
                  position: "insideBottomRight",
                  fill: "#2563EB",
                  fontSize: fontSizeReferencia,
                }}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sistolica"
                stroke="#E2333D"
                strokeWidth={2.5}
                dot={<PontoColorido />}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Acima de {FAIXAS_PRESSAO.levementeAlterada.pasMin} mmHg já é considerado elevado; abaixo
          de {FAIXAS_PRESSAO.baixa.pasMax + 1} mmHg é considerado baixo. A faixa verde mostra o
          intervalo adequado. Como cada ponto é colorido pela aferição completa (sistólica e
          diastólica juntas), a cor pode refletir a diastólica mesmo com a sistólica na faixa
          verde. Avaliação educativa, não substitui consulta médica.
        </p>
      </Card>

      <Card className="mb-4">
        <p className="text-sm font-semibold text-gray-600 mb-3">
          Pressão Arterial Diastólica (mínima)
        </p>
        <div className="h-48 -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dados} margin={{ top: 5, right: 10, left: margemEsquerda, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: fontSizeEixo }} />
              <YAxis domain={[40, 120]} tick={{ fontSize: fontSizeEixo }} />
              <ReferenceArea
                y1={FAIXAS_PRESSAO.baixa.padMax + 1}
                y2={FAIXAS_PRESSAO.adequada.padMax}
                fill="#2E9E5B"
                fillOpacity={0.08}
              />
              <ReferenceLine
                y={FAIXAS_PRESSAO.alta.padMin}
                stroke="#E8730C"
                strokeDasharray="4 4"
                label={{
                  value: "Alta ↑",
                  position: "insideTopRight",
                  fill: "#E8730C",
                  fontSize: fontSizeReferencia,
                }}
              />
              <ReferenceLine
                y={FAIXAS_PRESSAO.levementeAlterada.padMin}
                stroke="#E0A500"
                strokeDasharray="4 4"
                label={{
                  value: "Elevada ↑",
                  position: "insideTopRight",
                  fill: "#E0A500",
                  fontSize: fontSizeReferencia,
                }}
              />
              <ReferenceLine
                y={FAIXAS_PRESSAO.baixa.padMax}
                stroke="#2563EB"
                strokeDasharray="4 4"
                label={{
                  value: "Baixa ↓",
                  position: "insideBottomRight",
                  fill: "#2563EB",
                  fontSize: fontSizeReferencia,
                }}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="diastolica"
                stroke="#345B99"
                strokeWidth={2.5}
                dot={<PontoColorido />}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Acima de {FAIXAS_PRESSAO.levementeAlterada.padMin} mmHg já é considerado elevado; abaixo
          de {FAIXAS_PRESSAO.baixa.padMax + 1} mmHg é considerado baixo. A faixa verde mostra o
          intervalo adequado. Como cada ponto é colorido pela aferição completa (sistólica e
          diastólica juntas), a cor pode refletir a sistólica mesmo com a diastólica na faixa
          verde. Avaliação educativa, não substitui consulta médica.
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
