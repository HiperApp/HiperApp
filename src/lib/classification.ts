/**
 * Classificação da pressão arterial.
 *
 * Baseado EXCLUSIVAMENTE na Diretriz Brasileira de Hipertensão Arterial 2025
 * (Sociedade Brasileira de Cardiologia, Sociedade Brasileira de Hipertensão,
 * Sociedade Brasileira de Nefrologia).
 *
 * IMPORTANTE: os valores abaixo não devem ser alterados sem atualizar
 * também a referência oficial. Mantidos como constantes para fácil
 * alteração futura, conforme solicitado.
 *
 * Esta classificação é educativa e NÃO substitui diagnóstico médico.
 */

export type CorStatus = "verde" | "amarelo" | "vermelho";

export interface ClassificacaoResultado {
  chave: string;
  titulo: string;
  mensagem: string;
  cor: CorStatus;
  emoji: "🟢" | "🟡" | "🔴";
}

// Faixas oficiais (mmHg) — não modificar sem atualizar a fonte.
export const FAIXAS_PRESSAO = {
  normal: { pasMax: 119, padMax: 79 },
  preHipertensao: { pasMin: 120, pasMax: 139, padMin: 80, padMax: 89 },
  estagio1: { pasMin: 140, pasMax: 159, padMin: 90, padMax: 99 },
  estagio2: { pasMin: 160, pasMax: 179, padMin: 100, padMax: 109 },
  estagio3: { pasMin: 180, padMin: 110 },
} as const;

/**
 * Classifica a pressão arterial pelo MAIOR valor entre PAS e PAD,
 * conforme a regra oficial: "A classificação é definida pelo maior
 * valor (PAS ou PAD)."
 */
export function classificarPressao(
  pasInput: number,
  padInput: number
): ClassificacaoResultado {
  const pas = Math.round(pasInput);
  const pad = Math.round(padInput);

  // Estágio 3 — vermelho
  if (pas >= FAIXAS_PRESSAO.estagio3.pasMin || pad >= FAIXAS_PRESSAO.estagio3.padMin) {
    return {
      chave: "estagio3",
      titulo: "Pressão muito elevada",
      mensagem:
        "Seus valores estão bem acima do recomendado. Procure atendimento médico o quanto antes.",
      cor: "vermelho",
      emoji: "🔴",
    };
  }

  // Estágio 2 — vermelho
  if (
    (pas >= FAIXAS_PRESSAO.estagio2.pasMin && pas <= FAIXAS_PRESSAO.estagio2.pasMax) ||
    (pad >= FAIXAS_PRESSAO.estagio2.padMin && pad <= FAIXAS_PRESSAO.estagio2.padMax)
  ) {
    return {
      chave: "estagio2",
      titulo: "Pressão elevada",
      mensagem: "Seus valores estão elevados. Converse com seu médico sobre esse resultado.",
      cor: "vermelho",
      emoji: "🔴",
    };
  }

  // Estágio 1 — amarelo
  if (
    (pas >= FAIXAS_PRESSAO.estagio1.pasMin && pas <= FAIXAS_PRESSAO.estagio1.pasMax) ||
    (pad >= FAIXAS_PRESSAO.estagio1.padMin && pad <= FAIXAS_PRESSAO.estagio1.padMax)
  ) {
    return {
      chave: "estagio1",
      titulo: "Pressão alterada",
      mensagem: "Seus valores estão um pouco acima do ideal. Vale acompanhar de perto.",
      cor: "amarelo",
      emoji: "🟡",
    };
  }

  // Pré-hipertensão — amarelo
  if (
    (pas >= FAIXAS_PRESSAO.preHipertensao.pasMin && pas <= FAIXAS_PRESSAO.preHipertensao.pasMax) ||
    (pad >= FAIXAS_PRESSAO.preHipertensao.padMin && pad <= FAIXAS_PRESSAO.preHipertensao.padMax)
  ) {
    return {
      chave: "preHipertensao",
      titulo: "Pressão um pouco acima do ideal",
      mensagem: "Fique atento aos seus hábitos e continue registrando suas medições.",
      cor: "amarelo",
      emoji: "🟡",
    };
  }

  // Normal — verde
  return {
    chave: "normal",
    titulo: "Pressão adequada",
    mensagem: "Seus valores estão dentro do esperado. Continue com os bons hábitos!",
    cor: "verde",
    emoji: "🟢",
  };
}

export const CORES_STATUS: Record<CorStatus, string> = {
  verde: "#2E9E5B",
  amarelo: "#E0A500",
  vermelho: "#D93B3B",
};

// Recomendações não-medicamentosas oficiais, usadas na tela de Informações.
export const MEDIDAS_NAO_MEDICAMENTOSAS = [
  "Não fumar",
  "Manter o peso adequado",
  "Reduzir o sal e o sódio na alimentação",
  "Aumentar o consumo de potássio (salvo orientação médica em caso de doença renal)",
  "Limitar o consumo de álcool",
  "Seguir uma alimentação equilibrada, como a dieta DASH",
  "Praticar atividade física regularmente",
  "Praticar meditação e controlar o estresse",
  "Manter acompanhamento com a equipe de saúde",
];

export const ORIENTACOES_MEDICAO = [
  "Descanse 5 minutos antes de medir",
  "Não pratique atividade física 30 minutos antes",
  "Evite café 30 minutos antes",
  "Não fume 30 minutos antes",
  "Vá ao banheiro antes de medir",
  "Não converse durante a medição",
  "Apoie as costas e os pés no chão",
  "Não cruze as pernas",
  "Apoie o braço na altura do coração",
];
