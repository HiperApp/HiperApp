export type Periodo = "manha" | "tarde" | "noite";

// Calcula o período do dia (manhã/tarde/noite) sempre no fuso de Brasília,
// já que o servidor pode rodar em UTC (ex: Vercel).
export function periodoAtualBrasil(data: Date = new Date()): Periodo {
  const hora = Number(
    new Intl.DateTimeFormat("pt-BR", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    }).format(data)
  );
  if (hora < 12) return "manha";
  if (hora < 18) return "tarde";
  return "noite";
}

// Número do dia no ano (1, 2, 3...), calculado na data de Brasília.
function diaDoAnoBrasil(data: Date): number {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(data);

  const ano = Number(partes.find((p) => p.type === "year")!.value);
  const mes = Number(partes.find((p) => p.type === "month")!.value);
  const dia = Number(partes.find((p) => p.type === "day")!.value);

  const inicioAno = Date.UTC(ano, 0, 1);
  const atual = Date.UTC(ano, mes - 1, dia);
  return Math.floor((atual - inicioAno) / 86400000);
}

const INDICE_PERIODO: Record<Periodo, number> = { manha: 0, tarde: 1, noite: 2 };

// Escolhe uma dica da lista que muda a cada período do dia (manhã, tarde e
// noite recebem dicas diferentes) e também muda de um dia para o outro.
export function dicaDoPeriodo(dicas: string[], data: Date = new Date()): string {
  if (dicas.length === 0) return "";
  const dia = diaDoAnoBrasil(data);
  const periodo = periodoAtualBrasil(data);
  const indice = (dia * 3 + INDICE_PERIODO[periodo]) % dicas.length;
  return dicas[indice];
}
