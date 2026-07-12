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

export interface NivelSemana {
  cor: CorStatus;
  // true quando o nível médio da semana é de hipotensão (pressão baixa),
  // e não de pressão alta — os dois usam as cores amarelo/vermelho, mas
  // o texto do resumo precisa dizer a coisa certa em cada caso.
  baixa: boolean;
}

/**
 * Classifica o NÍVEL médio da pressão na semana (baixa/normal/alterada/alta),
 * usando a mesma régua oficial da tela de nova aferição.
 */
export function nivelSemana(sistolicas: number[], diastolicas: number[]): NivelSemana {
  const media = (lista: number[]) => lista.reduce((a, b) => a + b, 0) / lista.length;
  const classificacao = classificarPressao(media(sistolicas), media(diastolicas));
  return { cor: classificacao.cor, baixa: !!classificacao.alertaHipotensao };
}

/**
 * Monta o texto do "Resumo da semana" combinando SEMPRE dois eixos:
 * como a pressão variou (subiu, baixou, ficou estável, oscilou) e em que
 * nível ela está (baixa, normal, alterada ou alta).
 *
 * Importante: nunca usamos "estável" (ou "baixou"/"subiu") sozinho quando o
 * nível está alterado, alto ou baixo — isso poderia passar a falsa
 * impressão de que está tudo bem. Ex.: uma pessoa que ficou com a pressão
 * alta a semana inteira, sem oscilar, precisa ler "permaneceu alta", nunca
 * só "estável"; e isso vale igualmente para hipotensão (pressão baixa).
 */
export function textoResumoSemana(
  tend: Tendencia,
  nivel: NivelSemana
): { texto: string; emoji: string } {
  const { cor, baixa } = nivel;
  const critico = cor === "vermelho";
  const alterado = cor === "amarelo";
  // Palavra usada para descrever o nível quando ele não está normal.
  const palavraNivel = baixa ? (critico ? "muito baixa" : "baixa") : critico ? "alta" : "alterada";
  const emojiNivel = critico ? "🔴" : "🟡";

  if (tend === "estavel") {
    if (critico || alterado)
      return { texto: `Sua pressão permaneceu ${palavraNivel} a semana inteira`, emoji: emojiNivel };
    return { texto: "Sua pressão ficou estável esta semana, dentro do esperado", emoji: "➡️" };
  }

  if (tend === "instavel") {
    if (critico || alterado)
      return {
        texto: `Sua pressão variou bastante esta semana, e ficou ${palavraNivel} em vários momentos`,
        emoji: emojiNivel,
      };
    return { texto: "Sua pressão variou bastante esta semana", emoji: "〰️" };
  }

  if (tend === "aumento_forte") {
    return {
      texto:
        critico || alterado
          ? `Sua pressão subiu bastante esta semana e está ${palavraNivel}`
          : "Sua pressão subiu bastante esta semana",
      emoji: critico ? emojiNivel : "📈",
    };
  }

  if (tend === "aumento") {
    return {
      texto:
        critico || alterado
          ? `Sua pressão subiu um pouco esta semana e continua ${palavraNivel}`
          : "Sua pressão subiu um pouco esta semana",
      emoji: critico ? emojiNivel : "📈",
    };
  }

  if (tend === "reducao_forte") {
    return {
      texto:
        critico || alterado
          ? `Sua pressão baixou bastante esta semana, mas ainda está ${palavraNivel}`
          : "Sua pressão baixou bastante esta semana",
      emoji: critico ? emojiNivel : "📉",
    };
  }

  // reducao
  return {
    texto:
      critico || alterado
        ? `Sua pressão baixou um pouco esta semana, mas ainda está ${palavraNivel}`
        : "Sua pressão baixou um pouco esta semana",
    emoji: critico ? emojiNivel : "📉",
  };
}
