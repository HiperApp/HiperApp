import { classificarPressao, CorStatus } from "./classification";

export type Tendencia =
  | "aumento_forte"
  | "aumento"
  | "reducao_forte"
  | "reducao"
  | "instavel"
  | "estavel";

export function tendencia(valores: number[]): Tendencia {
  if (valores.length < 2) return "estavel";
  const metade = Math.floor(valores.length / 2);
  const mediaInicio = valores.slice(0, metade || 1).reduce((a, b) => a + b, 0) / (metade || 1);
  const mediaFim =
    valores.slice(-metade || -1).reduce((a, b) => a + b, 0) / (metade || 1 || 1);
  const diff = mediaFim - mediaInicio;

  // Amplitude (maior - menor) indica quanto os valores oscilaram na semana,
  // independente de terem uma direção clara de subida ou descida.
  const amplitude = Math.max(...valores) - Math.min(...valores);
  if (amplitude >= 20 && Math.abs(diff) <= 8) return "instavel";

  if (diff > 10) return "aumento_forte";
  if (diff > 2) return "aumento";
  if (diff < -10) return "reducao_forte";
  if (diff < -2) return "reducao";
  return "estavel";
}

/**
 * Classifica o NÍVEL médio da pressão na semana (normal/alterada/alta),
 * usando a mesma régua oficial da tela de nova aferição.
 */
export function nivelSemana(sistolicas: number[], diastolicas: number[]): CorStatus {
  const media = (lista: number[]) => lista.reduce((a, b) => a + b, 0) / lista.length;
  return classificarPressao(media(sistolicas), media(diastolicas)).cor;
}

/**
 * Monta o texto do "Resumo da semana" combinando SEMPRE dois eixos:
 * como a pressão variou (subiu, baixou, ficou estável, oscilou) e em que
 * nível ela está (normal, alterada ou alta).
 *
 * Importante: nunca usamos "estável" (ou "baixou") sozinho quando o nível
 * está alterado/alto — isso poderia passar a falsa impressão de que está
 * tudo bem, quando na verdade a pressão continua alta. Ex.: uma pessoa que
 * ficou com a pressão alta a semana inteira, sem oscilar, precisa ler
 * "permaneceu alta", nunca só "estável".
 */
export function textoResumoSemana(
  tend: Tendencia,
  nivel: CorStatus
): { texto: string; emoji: string } {
  const alto = nivel === "vermelho";
  const alterado = nivel === "amarelo";

  if (tend === "estavel") {
    if (alto) return { texto: "Sua pressão permaneceu alta a semana inteira", emoji: "🔴" };
    if (alterado)
      return { texto: "Sua pressão permaneceu alterada a semana inteira", emoji: "🟡" };
    return { texto: "Sua pressão ficou estável esta semana, dentro do esperado", emoji: "➡️" };
  }

  if (tend === "instavel") {
    if (alto)
      return { texto: "Sua pressão variou bastante esta semana, e ficou alta em vários momentos", emoji: "🔴" };
    return { texto: "Sua pressão variou bastante esta semana", emoji: "〰️" };
  }

  if (tend === "aumento_forte") {
    return {
      texto: alto || alterado ? "Sua pressão subiu bastante esta semana e está alta" : "Sua pressão subiu bastante esta semana",
      emoji: alto ? "🔴" : "📈",
    };
  }

  if (tend === "aumento") {
    return {
      texto: alto || alterado ? "Sua pressão subiu um pouco esta semana e continua alta" : "Sua pressão subiu um pouco esta semana",
      emoji: alto ? "🔴" : "📈",
    };
  }

  if (tend === "reducao_forte") {
    return {
      texto: alto || alterado ? "Sua pressão baixou bastante esta semana, mas ainda está alta" : "Sua pressão baixou bastante esta semana",
      emoji: alto ? "🔴" : "📉",
    };
  }

  // reducao
  return {
    texto: alto || alterado ? "Sua pressão baixou um pouco esta semana, mas ainda está alta" : "Sua pressão baixou um pouco esta semana",
    emoji: alto ? "🔴" : "📉",
  };
}
