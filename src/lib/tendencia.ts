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
  emoji: string;
  // Palavra usada em frases como "sua pressão permaneceu ___ a semana
  // inteira" (ex.: "alterada", "alta", "baixa", "muito baixa"), ou null
  // quando a média da semana está dentro do esperado. Vem diretamente da
  // classificação padronizada — nunca é derivada só da cor, já que a mesma
  // cor (azul) agora identifica toda pressão baixa, e o vermelho identifica
  // toda pressão muito elevada.
  nivelTexto: NonNullable<ReturnType<typeof classificarPressao>["nivelTexto"]> | null;
}

/**
 * Classifica o NÍVEL médio da pressão na semana (baixa/normal/alterada/alta),
 * usando a mesma régua oficial da tela de nova aferição.
 */
export function nivelSemana(sistolicas: number[], diastolicas: number[]): NivelSemana {
  const media = (lista: number[]) => lista.reduce((a, b) => a + b, 0) / lista.length;
  const classificacao = classificarPressao(media(sistolicas), media(diastolicas));
  return { cor: classificacao.cor, emoji: classificacao.emoji, nivelTexto: classificacao.nivelTexto };
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
  const { emoji, nivelTexto } = nivel;
  // alterado = true sempre que a média da semana não está na faixa
  // adequada — cobre pressão levemente elevada, muito elevada, baixa ou
  // muito baixa, cada uma com seu próprio texto e cor/emoji já corretos.
  const alterado = nivelTexto !== null;
  const palavraNivel = nivelTexto ?? "";

  if (tend === "estavel") {
    if (alterado)
      return { texto: `Sua pressão permaneceu ${palavraNivel} a semana inteira`, emoji };
    return { texto: "Sua pressão ficou estável esta semana, dentro do esperado", emoji: "➡️" };
  }

  if (tend === "instavel") {
    if (alterado)
      return {
        texto: `Sua pressão variou bastante esta semana, e ficou ${palavraNivel} em vários momentos`,
        emoji,
      };
    return { texto: "Sua pressão variou bastante esta semana", emoji: "〰️" };
  }

  if (tend === "aumento_forte") {
    return {
      texto: alterado
        ? `Sua pressão subiu bastante esta semana e está ${palavraNivel}`
        : "Sua pressão subiu bastante esta semana",
      emoji: alterado ? emoji : "📈",
    };
  }

  if (tend === "aumento") {
    return {
      texto: alterado
        ? `Sua pressão subiu um pouco esta semana e continua ${palavraNivel}`
        : "Sua pressão subiu um pouco esta semana",
      emoji: alterado ? emoji : "📈",
    };
  }

  if (tend === "reducao_forte") {
    return {
      texto: alterado
        ? `Sua pressão baixou bastante esta semana, mas ainda está ${palavraNivel}`
        : "Sua pressão baixou bastante esta semana",
      emoji: alterado ? emoji : "📉",
    };
  }

  // reducao
  return {
    texto: alterado
      ? `Sua pressão baixou um pouco esta semana, mas ainda está ${palavraNivel}`
      : "Sua pressão baixou um pouco esta semana",
    emoji: alterado ? emoji : "📉",
  };
}
