import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EvolucaoCharts from "@/components/EvolucaoCharts";

export default async function EvolucaoPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: medicoes } = await supabase
    .from("medicoes")
    .select("*")
    .eq("user_id", user!.id)
    .order("data", { ascending: true });

  return (
    <div className="px-6 pt-14 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-2xl" aria-label="Voltar">
          ←
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Evolução</h1>
      </div>

      <EvolucaoCharts medicoes={medicoes ?? []} />
    </div>
  );
}
