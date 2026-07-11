import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/Card";
import { PERIODO_INFO } from "@/lib/types";

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
    .select("nome")
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

  // Dias consecutivos com pelo menos uma medição, olhando para trás a partir de hoje.
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

  return (
    <div className="px-6 pt-14 pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Olá, {primeiroNome}! 👋</h1>
          <p className="text-gray-500 text-sm">{saudacaoAtual()}</p>
        </div>
        <Link
          href="/configuracoes"
          className="w-11 h-11 rounded-full bg-white shadow-soft flex items-center justify-center text-xl"
          aria-label="Notificações e configurações"
        >
          🔔
        </Link>
      </div>

      <Card className="mb-6">
        <p className="text-gray-500 text-sm mb-2">Última medição</p>
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
          <p className="text-gray-400">Você ainda não registrou nenhuma medição.</p>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link
          href="/nova-medicao"
          className="tap-target bg-hiper-red text-white rounded-card shadow-card p-5 flex flex-col items-start justify-center gap-2"
        >
          <span className="text-2xl">➕</span>
          <span className="font-semibold">Nova Medição</span>
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
          className="tap-target bg-hiper-mist text-hiper-navy border border-hiper-steel/30 rounded-card shadow-card p-5 flex flex-col items-start justify-center gap-2"
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
          <p className="text-xs text-gray-400 mt-1">total de medições</p>
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
