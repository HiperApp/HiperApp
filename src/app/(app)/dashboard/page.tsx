import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/Card";
import PerfilButton from "@/components/PerfilButton";
import StatusBadge from "@/components/StatusBadge";
import { PERIODO_INFO } from "@/lib/types";
import { avaliarRegistros } from "@/lib/avaliacao";
import { dicaDoPeriodo } from "@/lib/dicaDoDia";
import { DICAS_IMPORTANTES, STATUS_TAILWIND, classificarPressao } from "@/lib/classification";

// Força renderização e busca de dados sempre dinâmicas (sem cache do Next.js).
// Sem isso, o Next pode reaproveitar a resposta cacheada da consulta ao
// Supabase entre requisições, fazendo a "Avaliação dos valores" (e os demais
// dados desta página) continuarem mostrando o resultado antigo mesmo depois
// de uma nova aferição ou de uma reavaliação com valores atualizados.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Como esta página roda no servidor (que pode estar em UTC, ex: Vercel),
// calculamos a hora explicitamente no fuso de Brasília para a saudação
// bater com o horário real do usuário no Brasil.
function saudacaoAtual(): string {
  const horaBrasil = Number(
    new Intl.DateTimeFormat("pt-BR", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    }).format(new Date())
  );
  if (horaBrasil < 12) return "Bom dia!";
  if (horaBrasil < 18) return "Boa tarde!";
  return "Boa noite!";
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, diagnostico_hipertensao")
    .eq("id", user!.id)
    .single();

  const { data: medicoes } = await supabase
    .from("medicoes")
    .select("*")
    .eq("user_id", user!.id)
    .order("data", { ascending: false })
    .order("horario", { ascending: false });

  const ultima = medicoes?.[0];
  const total = medicoes?.length ?? 0;

  // Classificação da última aferição (mesma regra usada em todo o app),
  // para o card inicial já indicar se o valor foi adequado ou alterado
  // sem depender só do número.
  const classificacaoUltima = ultima
    ? classificarPressao(ultima.pressao_sistolica, ultima.pressao_diastolica)
    : null;

  // Dias consecutivos com pelo menos uma aferição, olhando para trás a partir de hoje.
  let diasConsecutivos = 0;
  if (medicoes && medicoes.length > 0) {
    const datasUnicas = Array.from(new Set(medicoes.map((m) => m.data))).sort().reverse();
    let cursor = new Date();
    for (const dataStr of datasUnicas) {
      const cursorStr = cursor.toISOString().slice(0, 10);
      if (dataStr === cursorStr) {
        diasConsecutivos++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  }

  const primeiroNome = (profile?.nome || "").split(" ")[0] || "Olá";

  // Avaliação dos valores: orientações educativas geradas a partir das
  // regras clínicas do documento de referência. Usa todo o histórico
  // disponível (cada regra define sua própria janela de tempo) e a
  // informação declarada pelo usuário sobre diagnóstico prévio.
  const avaliacao = avaliarRegistros(medicoes ?? [], profile?.diagnostico_hipertensao ?? null);

  const dica = dicaDoPeriodo(DICAS_IMPORTANTES);

  return (
    <div className="px-6 pt-14 pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Olá, {primeiroNome}! 👋</h1>
          <p className="text-gray-500 text-sm">{saudacaoAtual()}</p>
        </div>
        <PerfilButton />
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-500 text-sm">Última aferição</p>
          {classificacaoUltima && (
            <StatusBadge
              cor={classificacaoUltima.cor}
              texto={classificacaoUltima.rotuloVisual}
              simbolo={classificacaoUltima.simbolo}
            />
          )}
        </div>
        {ultima ? (
          <>
            <div className="flex items-center gap-3">
              <span className="text-3xl">❤️</span>
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {ultima.pressao_sistolica} / {ultima.pressao_diastolica}
                  <span className="text-base font-medium text-gray-400 ml-1">mmHg</span>
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-3">
              {new Date(ultima.data + "T00:00:00").toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
              })}{" "}
              · {ultima.horario.slice(0, 5)} · {PERIODO_INFO[ultima.periodo as keyof typeof PERIODO_INFO].emoji}{" "}
              {PERIODO_INFO[ultima.periodo as keyof typeof PERIODO_INFO].label}
            </p>
          </>
        ) : (
          <p className="text-gray-400">Você ainda não registrou nenhuma aferição.</p>
        )}
      </Card>

      {avaliacao && (
        <Card className={`mb-6 border-l-4 ${STATUS_TAILWIND[avaliacao.cor].border}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden>
              {avaliacao.emoji}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-700">Avaliação dos valores</p>
              <p className="text-sm text-gray-500">{avaliacao.mensagem}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Essa avaliação é educativa, baseada nos seus registros, e não substitui uma consulta
            médica.
          </p>
        </Card>
      )}

      <Card className="mb-6 bg-hiper-mist border-0 shadow-none flex items-start gap-3">
        <span className="text-2xl" aria-hidden>
          💡
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-700">Dica do dia</p>
          <p className="text-sm text-gray-600 mt-0.5">{dica}</p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link
          href="/nova-medicao"
          className="tap-target bg-hiper-red text-white rounded-card shadow-card p-5 flex flex-col items-start justify-center gap-2"
        >
          <span className="text-2xl">➕</span>
          <span className="font-semibold">Nova Aferição</span>
        </Link>
        <Link
          href="/historico"
          className="tap-target bg-hiper-navy text-white rounded-card shadow-card p-5 flex flex-col items-start justify-center gap-2"
        >
          <span className="text-2xl">📋</span>
          <span className="font-semibold">Meu Histórico</span>
        </Link>
        <Link
          href="/evolucao"
          className="tap-target bg-hiper-steel text-white rounded-card shadow-card p-5 flex flex-col items-start justify-center gap-2"
        >
          <span className="text-2xl">📈</span>
          <span className="font-semibold">Evolução</span>
        </Link>
        <Link
          href="/informacoes"
          className="tap-target bg-white text-hiper-navy border-2 border-hiper-navy rounded-card shadow-card p-5 flex flex-col items-start justify-center gap-2"
        >
          <span className="text-2xl">❤️</span>
          <span className="font-semibold">Informações</span>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <Card className="py-4">
          <p className="text-xl font-bold text-gray-900">{diasConsecutivos}</p>
          <p className="text-xs text-gray-400 mt-1">dias consecutivos</p>
        </Card>
        <Card className="py-4">
          <p className="text-xl font-bold text-gray-900">{total}</p>
          <p className="text-xs text-gray-400 mt-1">total de aferições</p>
        </Card>
        <Card className="py-4">
          <p className="text-xl font-bold text-gray-900">
            {ultima ? ultima.horario.slice(0, 5) : "--:--"}
          </p>
          <p className="text-xs text-gray-400 mt-1">última atualização</p>
        </Card>
      </div>
    </div>
  );
}
