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

export type CorStatus = "verde" | "amarelo" | "azul" | "vermelho";

export interface ClassificacaoResultado {
  chave: string;
  titulo: string;
  mensagem: string;
  cor: CorStatus;
  emoji: "🟢" | "🟡" | "🔵" | "🔴";
  alertaEmergencia: boolean;
  alertaHipotensao?: boolean;
  // Identificação visual padronizada (não depende só da cor), usada em todo
  // o app: badges, gráficos e telas de aferição/histórico.
  // rotuloVisual: nome curto e acessível da categoria.
  // simbolo: seta/aviso que reforça visualmente a categoria (↑, ↓ ou ⚠),
  // vazio para a faixa adequada.
  rotuloVisual: "Adequada" | "Pressão levemente elevada" | "Pressão baixa" | "Pressão muito elevada";
  simbolo: "" | "↑" | "↓" | "⚠";
  // Palavra usada em frases (ex.: "sua pressão permaneceu ___"), null quando
  // a faixa é a adequada (não há nível "alterado" a descrever).
  nivelTexto: "alterada" | "alta" | "baixa" | "muito baixa" | null;
}

// Alerta de emergência hipertensiva (crise): PAS ≥ 180 ou PAD ≥ 120.
export const MENSAGEM_ALERTA_EMERGENCIA =
  "Pressão arterial muito elevada (≥ 180/120 mmHg). Repita a aferição após alguns minutos, seguindo a técnica correta. Se a pressão arterial permanecer nesse nível, procure avaliação médica. Procure atendimento de emergência imediatamente se houver sintomas como dor no peito, falta de ar, confusão, desmaio, alteração da fala, fraqueza em um lado do corpo, alteração visual ou dor de cabeça intensa.";

// Alerta de hipotensão (pressão baixa): abaixo de 90/60 mmHg.
// A gravidade da hipotensão depende muito dos sintomas, não só do número,
// por isso a mensagem sempre orienta a pessoa a observar os sinais de alerta.
export const MENSAGEM_ALERTA_HIPOTENSAO =
  "Procure atendimento imediatamente se a pressão baixa vier acompanhada de: desmaio ou perda de consciência; dor no peito; falta de ar; confusão mental ou dificuldade para falar; fraqueza intensa ou dificuldade para movimentar um lado do corpo; sangramento importante; febre alta junto com a pressão baixa; ou pele muito fria, úmida e pálida com pulso muito rápido ou muito fraco. Procure uma consulta médica, não necessariamente de emergência, se a pressão ficar repetidamente abaixo de 90/60 mmHg e causar sintomas, se houver tontura frequente ao levantar, se os episódios se repetirem mesmo com boa hidratação, se surgirem após começar um novo remédio, ou se houver perda de peso ou cansaço persistente.";

// Faixas oficiais (mmHg) — não modificar sem atualizar a fonte.
export const FAIXAS_PRESSAO = {
  // Hipotensão: valores abaixo de 90/60 mmHg. Dentro disso, valores bem
  // abaixo (< 80/50) recebem atenção redobrada, já que costumam vir
  // acompanhados de sintomas mais fortes — mas a gravidade real sempre
  // depende dos sintomas, por isso o app sempre reforça os sinais de alerta.
  hipotensaoGrave: { pasMax: 79, padMax: 49 },
  hipotensao: { pasMax: 89, padMax: 59 },
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
  const alertaEmergencia = pas >= 180 || pad >= 120;

  // Estágio 3 — vermelho
  if (pas >= FAIXAS_PRESSAO.estagio3.pasMin || pad >= FAIXAS_PRESSAO.estagio3.padMin) {
    return {
      chave: "estagio3",
      titulo: "Pressão arterial muito elevada",
      mensagem:
        "Seus valores estão bem acima do recomendado. Procure atendimento médico o quanto antes.",
      cor: "vermelho",
      emoji: "🔴",
      alertaEmergencia,
      rotuloVisual: "Pressão muito elevada",
      simbolo: "⚠",
      nivelTexto: "alta",
    };
  }

  // Estágio 2 — vermelho
  if (
    (pas >= FAIXAS_PRESSAO.estagio2.pasMin && pas <= FAIXAS_PRESSAO.estagio2.pasMax) ||
    (pad >= FAIXAS_PRESSAO.estagio2.padMin && pad <= FAIXAS_PRESSAO.estagio2.padMax)
  ) {
    return {
      chave: "estagio2",
      titulo: "Pressão arterial elevada",
      mensagem: "Seus valores estão elevados. Converse com seu médico sobre esse resultado.",
      cor: "vermelho",
      emoji: "🔴",
      alertaEmergencia,
      rotuloVisual: "Pressão muito elevada",
      simbolo: "⚠",
      nivelTexto: "alta",
    };
  }

  // Estágio 1 — amarelo
  if (
    (pas >= FAIXAS_PRESSAO.estagio1.pasMin && pas <= FAIXAS_PRESSAO.estagio1.pasMax) ||
    (pad >= FAIXAS_PRESSAO.estagio1.padMin && pad <= FAIXAS_PRESSAO.estagio1.padMax)
  ) {
    return {
      chave: "estagio1",
      titulo: "Pressão arterial alterada",
      mensagem: "Seus valores estão um pouco acima do ideal. Vale acompanhar de perto.",
      cor: "amarelo",
      emoji: "🟡",
      alertaEmergencia,
      rotuloVisual: "Pressão levemente elevada",
      simbolo: "↑",
      nivelTexto: "alterada",
    };
  }

  // Pré-hipertensão — amarelo
  if (
    (pas >= FAIXAS_PRESSAO.preHipertensao.pasMin && pas <= FAIXAS_PRESSAO.preHipertensao.pasMax) ||
    (pad >= FAIXAS_PRESSAO.preHipertensao.padMin && pad <= FAIXAS_PRESSAO.preHipertensao.padMax)
  ) {
    return {
      chave: "preHipertensao",
      titulo: "Pressão arterial um pouco acima do ideal",
      mensagem: "Fique atento aos seus hábitos e continue registrando suas aferições.",
      cor: "amarelo",
      emoji: "🟡",
      alertaEmergencia,
      rotuloVisual: "Pressão levemente elevada",
      simbolo: "↑",
      nivelTexto: "alterada",
    };
  }

  // Hipotensão grave — azul, com alerta específico de hipotensão.
  // Continua sendo tratada com mais atenção na mensagem (não na cor): a cor
  // azul identifica toda pressão baixa, distinta do vermelho usado para
  // pressão muito elevada, para não confundir as duas situações.
  if (pas <= FAIXAS_PRESSAO.hipotensaoGrave.pasMax || pad <= FAIXAS_PRESSAO.hipotensaoGrave.padMax) {
    return {
      chave: "hipotensaoGrave",
      titulo: "Pressão arterial muito baixa",
      mensagem:
        "Seus valores estão bem abaixo do esperado (hipotensão). Fique atento aos sinais de alerta abaixo.",
      cor: "azul",
      emoji: "🔵",
      alertaEmergencia: false,
      alertaHipotensao: true,
      rotuloVisual: "Pressão baixa",
      simbolo: "↓",
      nivelTexto: "muito baixa",
    };
  }

  // Hipotensão — azul, com alerta específico de hipotensão
  if (pas <= FAIXAS_PRESSAO.hipotensao.pasMax || pad <= FAIXAS_PRESSAO.hipotensao.padMax) {
    return {
      chave: "hipotensao",
      titulo: "Pressão arterial baixa",
      mensagem:
        "Seus valores estão abaixo de 90/60 mmHg (hipotensão). Pode causar tontura e desmaio.",
      cor: "azul",
      emoji: "🔵",
      alertaEmergencia: false,
      alertaHipotensao: true,
      rotuloVisual: "Pressão baixa",
      simbolo: "↓",
      nivelTexto: "baixa",
    };
  }

  // Normal — verde
  return {
    chave: "normal",
    titulo: "Pressão arterial adequada",
    mensagem: "Seus valores estão dentro do esperado. Continue com os bons hábitos!",
    cor: "verde",
    emoji: "🟢",
    alertaEmergencia,
    rotuloVisual: "Adequada",
    simbolo: "",
    nivelTexto: null,
  };
}

export const CORES_STATUS: Record<CorStatus, string> = {
  verde: "#2E9E5B",
  amarelo: "#E0A500",
  azul: "#2563EB",
  vermelho: "#D93B3B",
};

/**
 * Classes Tailwind padronizadas por status, para que badges, alertas e
 * cartões usem sempre a mesma identidade visual em todo o app (nunca
 * definidas separadamente em cada tela/componente).
 */
export const STATUS_TAILWIND: Record<
  CorStatus,
  { bg: string; border: string; text: string; dot: string }
> = {
  verde: { bg: "bg-green-50", border: "border-green-400", text: "text-green-700", dot: "bg-green-500" },
  amarelo: { bg: "bg-yellow-50", border: "border-amber-400", text: "text-yellow-700", dot: "bg-yellow-500" },
  azul: { bg: "bg-blue-50", border: "border-blue-400", text: "text-blue-700", dot: "bg-blue-500" },
  vermelho: { bg: "bg-red-50", border: "border-red-400", text: "text-red-700", dot: "bg-red-500" },
};

// Rótulo curto e padronizado por status, usado como texto de apoio sempre
// que só a cor estiver disponível (ex.: fallback de badge).
export const ROTULO_STATUS: Record<CorStatus, string> = {
  verde: "Adequada",
  amarelo: "Pressão levemente elevada",
  azul: "Pressão baixa",
  vermelho: "Pressão muito elevada",
};

// Flashcard educativo sobre o papel do próprio aplicativo no acompanhamento,
// usado na tela de Informações.
export const EXPLICACAO_USO_APLICATIVO = {
  titulo: "Use o aplicativo como aliado no seu acompanhamento",
  texto:
    "Registre regularmente seus valores de pressão arterial no aplicativo. Ao longo do tempo, esses registros criam um histórico que ajuda a acompanhar as variações da sua pressão. Leve esse histórico para suas consultas e mostre ao seu médico, pois essas informações podem auxiliar na avaliação do seu acompanhamento.",
};

// Explicação educativa sobre hipotensão (pressão baixa), usada num flashcard
// próprio na tela de Informações.
export const EXPLICACAO_HIPOTENSAO = {
  titulo: "O que é hipotensão (pressão baixa)?",
  paragrafos: [
    "Hipotensão, ou pressão baixa, ocorre quando a pressão arterial cai abaixo de 90/60 mmHg (9 por 6). Embora muitas vezes não seja grave, pode causar tonturas e desmaios.",
  ],
  sinaisEmergencia: [
    "Desmaio ou perda de consciência.",
    "Dor no peito.",
    "Falta de ar.",
    "Confusão mental ou dificuldade para falar.",
    "Fraqueza intensa ou dificuldade para movimentar um lado do corpo.",
    "Sangramento importante.",
    "Febre alta com pressão baixa (pode indicar infecção grave).",
    "Pele muito fria, úmida e pálida, pulso muito rápido ou muito fraco (sinais de choque).",
  ],
  sinaisConsulta: [
    "A pressão fica repetidamente abaixo de 90/60 mmHg e causa sintomas.",
    "Você apresenta tonturas frequentes ao levantar (hipotensão ortostática).",
    "Os episódios são recorrentes, mesmo com boa hidratação.",
    "Surgiram após iniciar um novo medicamento (como anti-hipertensivos, diuréticos ou antidepressivos).",
    "Há perda de peso, fadiga persistente ou outros sintomas que possam sugerir uma doença de base.",
  ],
};

// Recomendações não-medicamentosas oficiais, usadas na tela de Informações.
export const MEDIDAS_NAO_MEDICAMENTOSAS = [
  "Não fumar",
  "Manter o peso adequado",
  "Reduzir o sal na alimentação por conta do sódio",
  "Aumentar o consumo de potássio (salvo orientação médica em caso de doença renal). Alimentos ricos em potássio: batata cozida, abacate, folhas de beterraba, espinafre e banana.",
  "Limitar o consumo de álcool",
  "Praticar atividade física regularmente",
  "Praticar meditação e controlar o estresse",
  "Manter acompanhamento com a equipe de saúde",
];

export const ORIENTACOES_MEDICAO = [
  "Descanse 5 minutos antes de aferir",
  "Não pratique atividade física 30 minutos antes",
  "Evite café 30 minutos antes",
  "Não fume 30 minutos antes",
  "Vá ao banheiro antes de aferir",
  "Não converse durante a aferição",
  "Apoie as costas na cadeira e os pés no chão",
  "Não cruze as pernas",
  "Apoie o braço na altura do coração",
];

// Explicação educativa sobre por que 120/80 recebe atenção hoje em dia.
export const EXPLICACAO_120_80 = {
  titulo: "Por que hoje se fala que 120 por 80 merece atenção?",
  paragrafos: [
    "Antigamente, 120 por 80 era visto como a pressão arterial ideal. Hoje, os estudos mostram que, quando a pressão arterial começa a subir acima desse valor, o risco de problemas no coração e na circulação aumenta aos poucos.",
    "Isso não significa que 120 por 80 seja uma pressão arterial alta ou uma doença. Significa apenas que esse valor marca o ponto em que os médicos passam a incentivar ainda mais hábitos saudáveis para evitar que a pressão arterial continue aumentando com o tempo.",
    "Em outras palavras: 120 por 80 é um sinal para cuidar da saúde, e não um motivo para preocupação. Manter uma alimentação saudável, praticar atividade física e acompanhar a pressão arterial regularmente ajuda a proteger o coração e os vasos sanguíneos.",
  ],
};

// Conteúdo educativo sobre a Dieta DASH, usado num flashcard próprio na tela de Informações.
export const DIETA_DASH = {
  introducao:
    "A Dieta DASH (Dietary Approaches to Stop Hypertension) é um padrão alimentar criado para prevenir e controlar a hipertensão arterial, mas também traz benefícios para a saúde cardiovascular, controle do peso e redução do risco de diabetes tipo 2.",
  caracteristicas: [
    "Rica em frutas, verduras e legumes.",
    "Prioriza grãos integrais.",
    "Inclui leite e derivados com baixo teor de gordura.",
    "Incentiva proteínas magras, como peixes, frango e leguminosas (feijão, lentilha e grão-de-bico).",
    "Estimula o consumo de oleaginosas (castanhas, nozes e amêndoas).",
    "Limita alimentos ricos em sódio, gorduras saturadas, gorduras trans, açúcares e ultraprocessados.",
  ],
  recomendados: [
    "Frutas.",
    "Verduras e legumes.",
    "Cereais integrais (aveia, arroz integral, pão integral).",
    "Feijões e outras leguminosas.",
    "Leite, iogurte e queijos com baixo teor de gordura.",
    "Carnes magras, peixes e aves.",
    "Castanhas, sementes e azeite de oliva.",
  ],
  reduzir: [
    "Sal de cozinha e temperos industrializados.",
    "Embutidos (presunto, salame, salsicha, linguiça).",
    "Alimentos ultraprocessados.",
    "Refrigerantes e bebidas açucaradas.",
    "Doces e sobremesas em excesso.",
    "Carnes gordurosas e frituras.",
  ],
  beneficios: [
    "Reduz a pressão arterial.",
    "Diminui o risco de doenças cardiovasculares.",
    "Ajuda no controle do colesterol.",
    "Favorece o controle do peso quando associada a um consumo adequado de calorias.",
    "Promove uma alimentação rica em fibras, potássio, cálcio e magnésio.",
  ],
  conclusao:
    "A dieta DASH é considerada uma das estratégias alimentares com maior respaldo científico para o tratamento não medicamentoso da hipertensão, especialmente quando associada à redução do consumo de sódio, prática regular de atividade física e manutenção de um peso saudável.",
};

// Alimentos ricos em potássio, usado num flashcard próprio na tela de Informações.
export const ALIMENTOS_POTASSIO = {
  introducao:
    "O potássio pode ajudar no controle da pressão arterial. Se você tem doença renal ou outra contraindicação, siga a orientação da equipe de saúde.",
  grupos: [
    { categoria: "Frutas", itens: "banana, mamão, laranja, abacate, melão, kiwi e manga." },
    { categoria: "Leguminosas", itens: "feijão, lentilha, grão-de-bico e ervilha." },
    {
      categoria: "Verduras e legumes",
      itens: "batata, batata-doce, abóbora, espinafre, couve, brócolis, tomate e beterraba.",
    },
    {
      categoria: "Outros alimentos",
      itens: "água de coco, leite natural e iogurte natural sem adição de sal.",
    },
  ],
};

// Alimentos ricos em sódio, usado num flashcard próprio na tela de Informações.
export const ALIMENTOS_SODIO = {
  introducao:
    "O excesso de sódio pode aumentar a pressão arterial. Prefira consumir esses alimentos com menos frequência.",
  grupos: [
    { categoria: "Evite o excesso de", itens: "sal, shoyu, temperos prontos e caldos em cubo." },
    {
      categoria: "Embutidos",
      itens: "presunto, mortadela, salame, linguiça, salsicha e bacon.",
    },
    {
      categoria: "Outros",
      itens:
        "macarrão instantâneo, salgadinhos, enlatados, picles, azeitonas, pizzas, hambúrgueres, fast-food e molhos prontos.",
    },
  ],
};

// Dicas curtas e práticas para o dia a dia do paciente.
// Uma dica diferente é mostrada na tela inicial a cada período do dia
// (manhã, tarde e noite) — ver função dicaDoPeriodo() em "@/lib/tendencia".
export const DICAS_IMPORTANTES = [
  "Afira sua pressão arterial regularmente.",
  "Tome seus medicamentos nos horários certos.",
  "Não interrompa o tratamento sem orientação da equipe de saúde.",
  "Reduzir o consumo de sal ajuda a controlar a pressão arterial.",
  "Pratique atividade física regularmente.",
  "Prefira alimentos naturais e frescos.",
  "A pressão arterial alta pode não causar sintomas.",
  "Controlar a pressão arterial reduz o risco de AVC e infarto.",
  "Vá às consultas de acompanhamento regularmente.",
  "Sal, shoyu e temperos prontos têm muito sódio, evite.",
  "Presunto, salame e mortadela são ricos em sódio, evite.",
  "Linguiça, salsicha e bacon têm muito sódio, evite.",
  "Charque, carne-seca e carnes salgadas contêm muito sódio, evite.",
  "Banana, mamão e laranja são ricos em potássio.",
  "Abacate, kiwi e manga são boas fontes de potássio.",
  "Batata, batata-doce e abóbora contêm potássio.",
  "Feijão, lentilha e grão-de-bico são ricos em potássio.",
  "Espinafre, couve e brócolis são boas fontes de potássio.",
  "A UBS pode ajudar no controle da hipertensão.",
  "Descanse por 5 minutos antes de aferir a pressão arterial.",
  "Esvazie a bexiga antes de aferir a pressão arterial.",
  "Não converse durante a aferição da pressão arterial.",
  "Evite fumar e o consumo excessivo de bebidas alcoólicas.",
  "Pequenas mudanças de hábitos fazem grande diferença.",
  "Mostre o histórico do aplicativo para o seu médico para que ele avalie as variações da sua pressão.",
];
