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
import { classificarPressao, CORES_STATUS, FAIXAS_PRESSAO } from "@/lib/classification";
import { useAccessibility } from "@/context/AccessibilityContext";

const JANELAS = [
  { dias: 7, label: "7 dias" },
  { dias: 30, label: "30 dias" },
  { dias: 90, label: "90 dias" },
];

// Referência de 120/80 mmHg, usada apenas para desenhar a linha de
// referência no gráfico (mesmo valor explicado em EXPLICACAO_120_80).
// Não faz parte da lógica de avaliação (@/lib/classification) e não deve
// ser confundida com as faixas oficiais usadas em classificarPressao().
const REFERENCIA_PAS = 120;
const REFERENCIA_PAD = 80;

// Legenda fixa da identificação visual (cor + emoji + texto), igual em
// todo o app. O texto usa o mesmo rótulo colapsado do restante do app:
// todas as faixas acima da referência (amarelo, laranja, vermelho) mostram
// apenas "Alta" — a diferença entre elas é só visual (cor/emoji).
const LEGENDA_STATUS = [
  { emoji: "🔵", texto: "Baixa" },
  { emoji: "🟢", texto: "Adequada" },
  { emoji: "🟡", texto: "Alta" },
  { emoji: "🟠", texto: "Alta" },
  { emoji: "🔴", texto: "Alta" },
] as const;

function LegendaStatus() {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        {LEGENDA_STATUS.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1">
            <span aria-hidden>{item.emoji}</span>
            {item.texto}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-2">
        Uma pressão arterial igual ou acima de 120/80 mmHg já é considerada alta. As cores acima
        simplificam essas faixas para facilitar a identificação visual ao longo do tempo e não
        substituem uma avaliação médica.
      </p>
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
              <ReferenceLine
                y={REFERENCIA_PAS}
                stroke="#345B99"
                strokeDasharray="4 4"
                label={{
                  value: "120 · Alta",
                  position: "insideTopRight",
                  fill: "#345B99",
                  fontSize: fontSizeReferencia,
                }}
              />
              <ReferenceLine
                y={FAIXAS_PRESSAO.baixa.pasMax}
                stroke="#2563EB"
                strokeDasharray="4 4"
                label={{
                  value: "Hipotensão",
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
          A linha em 120 mmHg marca a referência (120/80); a partir desse valor a pressão já é
          considerada alta, e abaixo de {FAIXAS_PRESSAO.baixa.pasMax + 1} mmHg é considerado
          hipotensão. Cada ponto é colorido pela aferição completa (sistólica e diastólica juntas),
          então a cor pode refletir a diastólica mesmo com a sistólica próxima da referência.
          Avaliação educativa, não substitui consulta médica.
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
              <ReferenceLine
                y={REFERENCIA_PAD}
                stroke="#345B99"
                strokeDasharray="4 4"
                label={{
                  value: "80 · Alta",
                  position: "insideTopRight",
                  fill: "#345B99",
                  fontSize: fontSizeReferencia,
                }}
              />
              <ReferenceLine
                y={FAIXAS_PRESSAO.baixa.padMax}
                stroke="#2563EB"
                strokeDasharray="4 4"
                label={{
                  value: "Hipotensão",
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
          A linha em 80 mmHg marca a referência (120/80); a partir desse valor a pressão já é
          considerada alta, e abaixo de {FAIXAS_PRESSAO.baixa.padMax + 1} mmHg é considerado
          hipotensão. Cada ponto é colorido pela aferição completa (sistólica e diastólica
          juntas), então a cor pode refletir a sistólica mesmo com a diastólica próxima da
          referência. Avaliação educativa, não substitui consulta médica.
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
