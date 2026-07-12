import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/Card";
import ExportButton from "@/components/ExportButton";
import MedicaoCard from "@/components/MedicaoCard";

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
            Você ainda não tem aferições registradas. Toque em “Nova Aferição” para começar.
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {medicoes?.map((m) => (
          <MedicaoCard key={m.id} medicao={m} />
        ))}
      </div>

      {medicoes && medicoes.length > 0 && <ExportButton />}
    </div>
  );
}
