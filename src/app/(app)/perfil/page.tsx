import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/Card";
import SairButton from "@/components/SairButton";
import VoltarButton from "@/components/VoltarButton";

// Ver comentário equivalente em dashboard/page.tsx: garante que o
// diagnóstico exibido reflita sempre o valor mais recente salvo pelo
// usuário (usado, inclusive, para escolher o grupo de regras da avaliação).
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PerfilPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, diagnostico_hipertensao")
    .eq("id", user!.id)
    .single();

  const diagnostico = profile?.diagnostico_hipertensao;
  const statusDiagnostico =
    diagnostico === true ? "Sim" : diagnostico === false ? "Não" : "Não respondido";

  return (
    <div className="px-6 pt-14 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <VoltarButton />
        <h1 className="text-xl font-bold text-gray-900">Perfil</h1>
      </div>

      <Card className="mb-6 flex items-center gap-4">
        <span className="w-14 h-14 rounded-full bg-hiper-mist flex items-center justify-center text-2xl">
          👤
        </span>
        <div>
          <p className="font-semibold text-gray-900">{profile?.nome || "Usuário"}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>
      </Card>

      <Link
        href="/perfil/diagnostico"
        className="tap-target mb-6 w-full bg-white rounded-card shadow-card px-5 flex items-center justify-between"
      >
        <span className="font-medium text-gray-700 text-sm">
          🩺 Você possui diagnóstico de hipertensão?
        </span>
        <span className="flex items-center gap-2 text-gray-400">
          {statusDiagnostico}
          <span aria-hidden>›</span>
        </span>
      </Link>

      <SairButton className="tap-target w-full rounded-button bg-white shadow-card flex items-center justify-center text-base font-semibold text-hiper-red border-2 border-hiper-red">
        Sair da conta
      </SairButton>
    </div>
  );
}
