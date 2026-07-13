export type Periodo = "manha" | "tarde" | "noite";
export type CorStatus = "verde" | "amarelo" | "azul" | "vermelho";

export interface Profile {
  id: string;
  nome: string;
  email: string;
  data_nascimento: string | null;
  telefone: string | null;
  avatar_url: string | null;
  onboarding_visto: boolean;
  notificacoes_ativas: boolean;
  horario_lembrete_1: string | null;
  horario_lembrete_2: string | null;
  // Declarado pelo próprio usuário — null enquanto ele ainda não respondeu.
  // Não é uma informação de diagnóstico feita pelo app.
  diagnostico_hipertensao: boolean | null;
}

export interface Medicao {
  id: string;
  user_id: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:mm
  periodo: Periodo;
  pressao_sistolica: number;
  pressao_diastolica: number;
  classificacao: string;
  cor_status: CorStatus;
  created_at: string;
}

export const PERIODO_INFO: Record<Periodo, { label: string; emoji: string }> = {
  manha: { label: "Manhã", emoji: "☀️" },
  tarde: { label: "Tarde", emoji: "🌤️" },
  noite: { label: "Noite", emoji: "🌙" },
};
