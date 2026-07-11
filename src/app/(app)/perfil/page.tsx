import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Card from "@/components/Card";
import PerfilForm from "@/components/PerfilForm";
import { Profile } from "@/lib/types";

export default async function PerfilPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  return (
    <div className="px-6 pt-14 pb-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Meu Perfil</h1>

      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 rounded-full bg-hiper-mist flex items-center justify-center text-4xl">
          👤
        </div>
      </div>

      <Card>
        <PerfilForm profile={profile as Profile} />
      </Card>

      <Link
        href="/configuracoes"
        className="tap-target mt-4 w-full bg-white rounded-card shadow-card px-5 flex items-center justify-between"
      >
        <span className="font-medium text-gray-700">⚙️ Configurações</span>
        <span className="text-gray-400">›</span>
      </Link>
    </div>
  );
}
