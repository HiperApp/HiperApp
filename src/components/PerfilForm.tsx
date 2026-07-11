"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/Button";
import { Profile } from "@/lib/types";

export default function PerfilForm({ profile }: { profile: Profile }) {
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(profile.nome ?? "");
  const [dataNascimento, setDataNascimento] = useState(profile.data_nascimento ?? "");
  const [telefone, setTelefone] = useState(profile.telefone ?? "");
  const [salvando, setSalvando] = useState(false);
  const router = useRouter();

  async function salvar() {
    setSalvando(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ nome, data_nascimento: dataNascimento || null, telefone })
      .eq("id", profile.id);
    setSalvando(false);
    setEditando(false);
    router.refresh();
  }

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600">Nome</label>
        <input
          disabled={!editando}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="tap-target rounded-button border border-gray-200 px-4 bg-white disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600">Data de nascimento</label>
        <input
          type="date"
          disabled={!editando}
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
          className="tap-target rounded-button border border-gray-200 px-4 bg-white disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600">E-mail</label>
        <input
          disabled
          value={profile.email}
          className="tap-target rounded-button border border-gray-200 px-4 bg-gray-50 text-gray-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-600">Telefone</label>
        <input
          disabled={!editando}
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="tap-target rounded-button border border-gray-200 px-4 bg-white disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      {editando ? (
        <Button onClick={salvar} disabled={salvando} className="mt-2">
          {salvando ? "Salvando..." : "Salvar dados"}
        </Button>
      ) : (
        <Button variant="outline" onClick={() => setEditando(true)} className="mt-2">
          Editar dados
        </Button>
      )}

      <Button variant="ghost" onClick={sair} className="text-hiper-red mt-4">
        Sair da conta
      </Button>
    </div>
  );
}
