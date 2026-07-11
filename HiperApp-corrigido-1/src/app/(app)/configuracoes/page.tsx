import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ConfiguracoesForm from "@/components/ConfiguracoesForm";
import { Profile } from "@/lib/types";

export default async function ConfiguracoesPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  if (!profile) {
    const { data: novoProfile, error: erroInsert } = await supabase
      .from("profiles")
      .insert({
        id: user!.id,
        nome: user!.user_metadata?.nome ?? "",
        email: user!.email ?? "",
      })
      .select()
      .single();

    if (erroInsert) {
      console.error("ERRO AO CRIAR PROFILE:", erroInsert);
    }
    profile = novoProfile;
  }

  if (!profile) {
    return (
      <div className="px-6 pt-14 pb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Configurações</h1>
        <p className="text-gray-600">
          Não foi possível carregar suas configurações agora. Tente sair e entrar novamente.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 pt-14 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/perfil" className="text-2xl" aria-label="Voltar">
          ←
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Configurações</h1>
      </div>

      <ConfiguracoesForm profile={profile as Profile} />

      <Link
        href="/instalar"
        className="tap-target mt-4 w-full bg-white rounded-card shadow-card px-5 flex items-center justify-between"
      >
        <span className="font-medium text-gray-700">📲 Como instalar o HiperApp</span>
        <span className="text-gray-400">›</span>
      </Link>
    </div>
  );
}
