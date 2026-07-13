import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditarMedicaoForm from "@/components/EditarMedicaoForm";

// Ver comentário equivalente em dashboard/page.tsx: sem isso, o Next.js pode
// reaproveitar uma resposta cacheada do Supabase e abrir o formulário de
// edição com os valores antigos da aferição, em vez dos valores mais
// recentes salvos.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditarMedicaoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: medicao } = await supabase
    .from("medicoes")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!medicao) {
    notFound();
  }

  return <EditarMedicaoForm medicao={medicao} />;
}
