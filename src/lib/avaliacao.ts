/**
 * Motor de orientações e alertas educativos do HiperApp.
 *
 * Implementa EXCLUSIVAMENTE as regras descritas em
 * "Regras Clínicas para o Motor de Alertas do HiperApp" (baseado na
 * Diretriz Brasileira de Hipertensão Arterial 2025 — SBC/SBH/SBN).
 *
 * IMPORTANTE (conforme o documento de regras):
 * - Isto NÃO é diagnóstico médico. São orientações e alertas educativos,
 *   gerados apenas a partir de PAS, PAD, data/horário e histórico de
 *   registros do próprio usuário.
 * - Nunca usar termos diagnósticos ("você tem hipertensão") ou
 *   prescritivos ("troque seu medicamento").
 * - Nunca nomear "crise" ou "emergência hipertensiva" — apenas orientar
 *   repetição da medida e busca de atendimento quando os valores forem
 *   muito elevados (≥ 180/120 mmHg).
 * - Regras que envolvem sintomas, exames ou avaliação clínica completa
 *   não podem ser implementadas pelo app e foram excluídas.
 */

import { Medicao } from "./types";

export type CorAvaliacao = "verde" | "amarelo" | "azul" | "vermelho";

export interface AvaliacaoResultado {
  // Código da regra do documento de referência (ex.: "1.4", "2.2").
  chave: string;
  // Resumo curto (2 a 5 palavras) exibido na tela inicial, antes de o
  // usuário abrir a avaliação completa. Deve dar uma ideia clara do
  // conteúdo sem repetir o texto integral de `mensagem`.
  titulo: string;
  mensagem: string;
  cor: CorAvaliacao;
  emoji: "🟢" | "🟡" | "🔵" | "🔴";
}

type MedicaoBasica = Pick<
  Medicao,
  "data" | "horario" | "periodo" | "pressao_sistolica" | "pressao_diastolica"
>;

function dataHoraMs(m: MedicaoBasica): number {
  return new Date(`${m.data}T${m.horario}`).getTime();
}

function diasAtras(m: MedicaoBasica, agora: number): number {
  return (agora - new Date(`${m.data}T00:00:00`).getTime()) / 86_400_000;
}

function ordenarRecentesPrimeiro(medicoes: MedicaoBasica[]): MedicaoBasica[] {
  return [...medicoes].sort((a, b) => dataHoraMs(b) - dataHoraMs(a));
}

// ------------------------------------------------------------------
// Regra 1.5 / (equivalente não listada para o Grupo 2) — variabilidade
// elevada entre as últimas 7 a 10 medições, comparando apenas medições do
// mesmo período do dia (manhã/tarde/noite), como pede a regra.
// ------------------------------------------------------------------
function variabilidadeElevada(recentes: MedicaoBasica[]): boolean {
  const ultimas = recentes.slice(0, 10);
  if (ultimas.length < 4) return false;

  const porPeriodo: Record<string, MedicaoBasica[]> = {};
  for (const m of ultimas) {
    (porPeriodo[m.periodo] ??= []).push(m);
  }

  return Object.values(porPeriodo).some((grupo) => {
    if (grupo.length < 2) return false;
    const pasValores = grupo.map((m) => m.pressao_sistolica);
    const padValores = grupo.map((m) => m.pressao_diastolica);
    const amplitudePas = Math.max(...pasValores) - Math.min(...pasValores);
    const amplitudePad = Math.max(...padValores) - Math.min(...padValores);
    return amplitudePas >= 30 || amplitudePad >= 20;
  });
}

// ------------------------------------------------------------------
// Regra 1.3 — padrão de piora progressiva: médias semanais dos últimos
// ~60 dias, exigindo no mínimo 6 semanas com registro.
// ------------------------------------------------------------------
function mediasSemanaisRecentes(
  medicoes: MedicaoBasica[],
  campo: "pressao_sistolica" | "pressao_diastolica",
  agora: number
): number[] | null {
  // Índice 0 = semana mais recente (0-6 dias atrás) ... índice 8 = há ~60 dias.
  const buckets: number[][] = Array.from({ length: 9 }, () => []);
  for (const m of medicoes) {
    const dias = diasAtras(m, agora);
    if (dias < 0 || dias > 62) continue;
    const indice = Math.floor(dias / 7);
    if (indice < 9) buckets[indice].push(m[campo]);
  }

  const semanasComDados = buckets
    .map((valores, indice) => ({
      indice,
      media: valores.length > 0 ? valores.reduce((a, b) => a + b, 0) / valores.length : null,
    }))
    .filter((s): s is { indice: number; media: number } => s.media !== null);

  if (semanasComDados.length < 6) return null;

  // As 6 semanas com dados mais recentes, ordenadas da mais antiga pra mais nova.
  return semanasComDados
    .sort((a, b) => a.indice - b.indice)
    .slice(0, 6)
    .sort((a, b) => b.indice - a.indice)
    .map((s) => s.media);
}

function temAumentoSustentado(mediasOrdenadas: number[]): boolean {
  if (mediasOrdenadas.length < 6) return false;
  let aumentos = 0;
  for (let i = 1; i < mediasOrdenadas.length; i++) {
    if (mediasOrdenadas[i] > mediasOrdenadas[i - 1]) aumentos++;
  }
  return aumentos >= 4;
}

// ------------------------------------------------------------------
// Regra (nova) — registro de pressão arterial abaixo de 90/60 mmHg.
// Aplicável a ambos os grupos, pois não depende do diagnóstico prévio
// de hipertensão informado pelo usuário. Baseada na Diretriz Brasileira
// de Hipertensão Arterial — recomendações relacionadas à avaliação dos
// níveis pressóricos e abordagem clínica conforme apresentação do
// paciente.
// ------------------------------------------------------------------
function avaliarHipotensao(ultima: MedicaoBasica | undefined): AvaliacaoResultado | null {
  if (ultima && (ultima.pressao_sistolica < 90 || ultima.pressao_diastolica < 60)) {
    return {
      chave: "HIPO.1",
      titulo: "Pressão abaixo do esperado",
      mensagem:
        "Foi registrado um valor de pressão arterial abaixo do esperado. Repita a medição seguindo as orientações corretas e continue acompanhando seus próximos registros. Se a pressão baixa vier acompanhada de sintomas como desmaio, dor no peito, falta de ar, confusão mental, fraqueza intensa ou mal-estar importante, procure atendimento médico. Caso esses valores baixos se repitam, procure orientação de um profissional de saúde para avaliação.",
      cor: "azul",
      emoji: "🔵",
    };
  }
  return null;
}

// ------------------------------------------------------------------
// GRUPO 1 — usuários com diagnóstico prévio declarado de hipertensão.
// ------------------------------------------------------------------
function avaliarGrupo1(medicoes: MedicaoBasica[], agora: number): AvaliacaoResultado | null {
  const recentes = ordenarRecentesPrimeiro(medicoes);
  const ultima = recentes[0];

  // Regra 1.4 — valor isolado muito elevado (prioridade máxima: segurança).
  if (ultima && (ultima.pressao_sistolica >= 180 || ultima.pressao_diastolica >= 120)) {
    return {
      chave: "1.4",
      titulo: "Valor muito elevado nesta medição",
      mensagem:
        "Foi identificado um valor de pressão arterial bastante elevado nesta medição. Repita a medida após alguns minutos de repouso, seguindo a técnica correta. Caso o valor se confirme, ou caso você sinta algo diferente do habitual, procure atendimento médico o quanto antes. Se possível, leve o histórico de medições registrado no aplicativo.",
      cor: "vermelho",
      emoji: "🔴",
    };
  }

  // Regra (nova) — pressão arterial abaixo de 90/60 mmHg.
  const hipotensao1 = avaliarHipotensao(ultima);
  if (hipotensao1) return hipotensao1;

  // Regra 1.1 — meta terapêutica não alcançada.
  if (recentes.length >= 5) {
    const cincoUltimas = recentes.slice(0, 5);
    if (diasAtras(cincoUltimas[4], agora) <= 14) {
      const foraDaMeta = cincoUltimas.filter(
        (m) => m.pressao_sistolica >= 130 || m.pressao_diastolica >= 80
      ).length;
      if (foraDaMeta / 5 >= 0.6) {
        return {
          chave: "1.1",
          titulo: "Meta de pressão não alcançada",
          mensagem:
            "Os valores registrados nas últimas medições estão frequentemente acima da meta recomendada para o controle da pressão arterial. Continue seu acompanhamento regular e procure seu médico para revisar seu plano de tratamento. Leve o histórico registrado no aplicativo para a consulta.",
          cor: "amarelo",
          emoji: "🟡",
        };
      }
    }
  }

  // Regra 1.5 — variabilidade elevada entre medições.
  if (variabilidadeElevada(recentes)) {
    return {
      chave: "1.5",
      titulo: "Variação importante entre medições",
      mensagem:
        "Notamos uma variação importante entre suas medições recentes. Isso pode estar relacionado à técnica de medição, ao momento do dia ou a outros fatores. Reveja as orientações para medir corretamente e, se a variação persistir, converse com seu profissional de saúde sobre a possibilidade de uma avaliação complementar, como o MAPA ou a MRPA. Leve o histórico registrado no aplicativo para essa conversa.",
      cor: "amarelo",
      emoji: "🟡",
    };
  }

  // Regra 1.3 — padrão de piora progressiva ao longo do tempo.
  const mediasPas = mediasSemanaisRecentes(medicoes, "pressao_sistolica", agora);
  const mediasPad = mediasSemanaisRecentes(medicoes, "pressao_diastolica", agora);
  if ((mediasPas && temAumentoSustentado(mediasPas)) || (mediasPad && temAumentoSustentado(mediasPad))) {
    return {
      chave: "1.3",
      titulo: "Tendência de aumento gradual",
      mensagem:
        "Foi identificada uma tendência de aumento gradual nos seus valores de pressão arterial ao longo das últimas semanas. Recomendamos agendar uma avaliação com seu profissional de saúde para revisar seu acompanhamento. Mostre o histórico de medições deste aplicativo durante a consulta.",
      cor: "amarelo",
      emoji: "🟡",
    };
  }

  // Regra 1.2 — controle adequado da pressão arterial.
  if (recentes.length >= 5) {
    const cincoUltimas = recentes.slice(0, 5);
    if (diasAtras(cincoUltimas[4], agora) <= 14) {
      const dentroMeta = cincoUltimas.filter(
        (m) => m.pressao_sistolica < 130 && m.pressao_diastolica < 80
      ).length;
      if (dentroMeta / 5 >= 0.8) {
        return {
          chave: "1.2",
          titulo: "Pressão dentro da meta",
          mensagem:
            "Seus registros indicam que a pressão arterial está dentro da meta recomendada na maioria das medições. Continue com o acompanhamento e mantenha os hábitos que têm contribuído para esse resultado.",
          cor: "verde",
          emoji: "🟢",
        };
      }
    }
  }

  // Regra 1.6 — interrupção do acompanhamento.
  if (ultima && diasAtras(ultima, agora) >= 14 && medicoes.length >= 3) {
    return {
      chave: "1.6",
      titulo: "Retome seu acompanhamento",
      mensagem:
        "Notamos que faz um tempo desde seu último registro de pressão arterial. Manter o acompanhamento regular ajuda você e seu profissional de saúde a entenderem melhor sua evolução. Que tal registrar uma nova medição hoje?",
      cor: "amarelo",
      emoji: "🟡",
    };
  }

  return null;
}

// ------------------------------------------------------------------
// GRUPO 2 — usuários sem diagnóstico prévio declarado (inclui quem ainda
// não respondeu à pergunta, já que o app não pode presumir um diagnóstico
// que o usuário não informou).
// ------------------------------------------------------------------
function avaliarGrupo2(medicoes: MedicaoBasica[], agora: number): AvaliacaoResultado | null {
  const recentes = ordenarRecentesPrimeiro(medicoes);
  const ultima = recentes[0];

  // Regra 2.4 — elevação acentuada isolada (atenção redobrada).
  if (ultima && (ultima.pressao_sistolica >= 180 || ultima.pressao_diastolica >= 120)) {
    return {
      chave: "2.4",
      titulo: "Valor muito elevado nesta medição",
      mensagem:
        "Foi identificado um valor de pressão arterial bastante elevado nesta medição. Repita a medida em alguns minutos, em repouso. Caso o valor permaneça elevado, procure atendimento médico o quanto antes para uma avaliação presencial. Se possível, leve o histórico de medições registrado no aplicativo.",
      cor: "vermelho",
      emoji: "🔴",
    };
  }

  // Regra (nova) — pressão arterial abaixo de 90/60 mmHg.
  const hipotensao2 = avaliarHipotensao(ultima);
  if (hipotensao2) return hipotensao2;

  // Medições elevadas (PAS ≥ 140 e/ou PAD ≥ 90, abaixo do limiar da regra
  // 2.4) nos últimos 30 dias, contadas por ocasião (dia) distinta —
  // usadas nas regras 2.1 e 2.2.
  const ultimos30Dias = recentes.filter((m) => diasAtras(m, agora) <= 30);
  const elevadas = ultimos30Dias.filter(
    (m) => m.pressao_sistolica >= 140 || m.pressao_diastolica >= 90
  );
  const ocasioesElevadas = new Set(elevadas.map((m) => m.data)).size;

  // Regra 2.2 — valores elevados em múltiplas medições (2+ ocasiões distintas).
  if (ocasioesElevadas >= 2) {
    return {
      chave: "2.2",
      titulo: "Valores elevados repetidas vezes",
      mensagem:
        "Os valores registrados apresentam níveis acima dos recomendados em mais de uma medição. É importante que você procure um médico para avaliar esses resultados. Leve o histórico de medições deste aplicativo para te ajudar durante a consulta.",
      cor: "amarelo",
      emoji: "🟡",
    };
  }

  // Regra 2.1 — valor elevado isolado, sem outras medições elevadas recentes.
  if (
    ocasioesElevadas === 1 &&
    ultima &&
    (ultima.pressao_sistolica >= 140 || ultima.pressao_diastolica >= 90)
  ) {
    return {
      chave: "2.1",
      titulo: "Valor elevado nesta medição",
      mensagem:
        "Foi identificado um valor de pressão arterial elevado. Realize uma nova medição seguindo as orientações corretas — em repouso, sentado e com a técnica adequada — e acompanhe os próximos registros.",
      cor: "amarelo",
      emoji: "🟡",
    };
  }

  // Regra 2.3 — padrão compatível com pré-hipertensão.
  if (recentes.length >= 5) {
    const cincoUltimas = recentes.slice(0, 5);
    if (diasAtras(cincoUltimas[4], agora) <= 30) {
      const temElevada = cincoUltimas.some(
        (m) => m.pressao_sistolica >= 140 || m.pressao_diastolica >= 90
      );
      const naFaixaPreHipertensao = cincoUltimas.filter(
        (m) =>
          (m.pressao_sistolica >= 120 && m.pressao_sistolica <= 139) ||
          (m.pressao_diastolica >= 80 && m.pressao_diastolica <= 89)
      ).length;
      if (!temElevada && naFaixaPreHipertensao / 5 >= 0.6) {
        return {
          chave: "2.3",
          titulo: "Faixa de atenção",
          mensagem:
            "Seus registros mostram valores em uma faixa de atenção, um pouco acima do considerado ideal. Pequenos ajustes no estilo de vida, como alimentação equilibrada e atividade física regular, podem ajudar. Continue acompanhando suas medições.",
          cor: "amarelo",
          emoji: "🟡",
        };
      }
    }
  }

  // Regra 2.5 — valores dentro da normalidade.
  if (recentes.length >= 5) {
    const cincoUltimas = recentes.slice(0, 5);
    const todasNormais = cincoUltimas.every(
      (m) => m.pressao_sistolica < 120 && m.pressao_diastolica < 80
    );
    if (todasNormais) {
      return {
        chave: "2.5",
        titulo: "Pressão dentro da normalidade",
        mensagem:
          "Seus valores de pressão arterial estão dentro da faixa considerada normal. Continue registrando suas medições periodicamente como parte do seu cuidado com a saúde.",
        cor: "verde",
        emoji: "🟢",
      };
    }
  }

  return null;
}

/**
 * Avalia o histórico de medições do usuário e retorna uma orientação
 * educativa (ou null, se nenhuma regra se aplicar aos dados disponíveis).
 *
 * `diagnosticoHipertensao` é a informação declarada pelo usuário (não um
 * diagnóstico feito pelo app) e define qual grupo de regras é usado.
 */
export function avaliarRegistros(
  medicoes: MedicaoBasica[],
  diagnosticoHipertensao: boolean | null,
  agora: number = Date.now()
): AvaliacaoResultado | null {
  if (!medicoes || medicoes.length === 0) return null;

  if (diagnosticoHipertensao === true) {
    return avaliarGrupo1(medicoes, agora);
  }
  return avaliarGrupo2(medicoes, agora);
}
