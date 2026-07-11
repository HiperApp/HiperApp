import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/Card";
import StatusBadge from "@/components/StatusBadge";
import ExportButton from "@/components/ExportButton";
import { PERIODO_INFO } from "@/lib/types";

export default async function HistoricoPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: medicoes } = await supabase
    .from("medicoes")
    .select("*")
    .eq("user_id", user!.id)
    .order("data", { ascending: false })
    .order("horario", { ascending: false });

  return (
    <div className="px-6 pt-14 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-2xl" aria-label="Voltar">
          ←
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Meu Histórico</h1>
      </div>

      {(!medicoes || medicoes.length === 0) && (
        <Card className="text-center py-10">
          <p className="text-gray-400">
            Você ainda não tem medições registradas. Toque em “Nova Medição” para começar.
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {medicoes?.map((m) => {
          const p = PERIODO_INFO[m.periodo as keyof typeof PERIODO_INFO];
          return (
            <Card key={m.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">
                  {new Date(m.data + "T00:00:00").toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}{" "}
                  {m.horario.slice(0, 5)} · {p.emoji} {p.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {m.pressao_sistolica} / {m.pressao_diastolica}
                  <span className="text-sm font-medium text-gray-400 ml-1">mmHg</span>
                </p>
              </div>
              <StatusBadge cor={m.cor_status} />
            </Card>
          );
        })}
      </div>

      {medicoes && medicoes.length > 0 && <ExportButton />}
    </div>
  );
}
