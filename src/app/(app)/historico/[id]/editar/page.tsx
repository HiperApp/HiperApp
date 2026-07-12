import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditarMedicaoForm from "@/components/EditarMedicaoForm";

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
