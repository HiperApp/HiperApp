"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/Button";
import VoltarButton from "@/components/VoltarButton";

export default function DiagnosticoHipertensaoPage() {
  const router = useRouter();
  const [resposta, setResposta] = useState<"sim" | "nao" | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [carregandoInicial, setCarregandoInicial] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  // Uma única instância do client, reaproveitada no carregamento e no
  // salvamento. Antes cada função criava sua própria instância via
  // createClient(); ter mais de um client Supabase ativo na mesma página
  // pode deixar o estado de autenticação inconsistente entre as chamadas
  // (ver aviso "Multiple GoTrueClient instances" do Supabase), o que podia
  // fazer o update abaixo não encontrar/alterar nenhuma linha.
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    async function carregar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setCarregandoInicial(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("diagnostico_hipertensao")
        .eq("id", user.id)
        .single();

      if (profile?.diagnostico_hipertensao === true) setResposta("sim");
      if (profile?.diagnostico_hipertensao === false) setResposta("nao");
      setCarregandoInicial(false);
    }
    carregar();
  }, [supabase]);

  async function handleSalvar() {
    setErro(null);
    if (resposta === null) {
      setErro("Selecione uma opção para continuar.");
      return;
    }

    setCarregando(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCarregando(false);
      setErro("Sua sessão expirou. Faça login novamente para salvar.");
      return;
    }

    // Pedimos a linha atualizada de volta (.select().single()) em vez de só
    // checar "error": um update sem select não avisa se 0 linhas foram
    // afetadas (ex.: sessão inconsistente), então o app achava que tinha
    // salvo mesmo quando nada mudou no banco. Agora, se a linha não vier de
    // volta, tratamos como falha e avisamos o usuário em vez de navegar
    // para o dashboard como se tivesse dado certo.
    const { data: atualizado, error } = await supabase
      .from("profiles")
      .update({ diagnostico_hipertensao: resposta === "sim" })
      .eq("id", user.id)
      .select("diagnostico_hipertensao")
      .single();

    setCarregando(false);

    if (error || !atualizado) {
      setErro("Não foi possível salvar. Tente novamente.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  if (carregandoInicial) {
    return <div className="px-6 pt-14 pb-6" />;
  }

  return (
    <div className="px-6 pt-14 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <VoltarButton />
        <h1 className="text-xl font-bold text-gray-900">Diagnóstico de hipertensão</h1>
      </div>

      <p className="text-gray-500 mb-6">
        Essa informação é apenas o que você já sabe sobre sua saúde — o HiperApp não faz
        diagnóstico. Ela ajuda o aplicativo a te dar orientações mais adequadas ao seu contexto.
      </p>

      <p className="block text-sm font-medium text-gray-600 mb-2">
        Você possui diagnóstico de hipertensão arterial?
      </p>
      <div className="flex flex-col gap-2 mb-8">
        <label
          className={`tap-target flex items-center gap-3 rounded-button border px-4 text-base cursor-pointer ${
            resposta === "sim" ? "border-hiper-red bg-hiper-red/5" : "border-gray-200 bg-white"
          }`}
        >
          <input
            type="radio"
            name="diagnosticoHipertensao"
            value="sim"
            checked={resposta === "sim"}
            onChange={() => setResposta("sim")}
            className="w-5 h-5 accent-hiper-red"
          />
          Sim, tenho diagnóstico de hipertensão
        </label>
        <label
          className={`tap-target flex items-center gap-3 rounded-button border px-4 text-base cursor-pointer ${
            resposta === "nao" ? "border-hiper-red bg-hiper-red/5" : "border-gray-200 bg-white"
          }`}
        >
          <input
            type="radio"
            name="diagnosticoHipertensao"
            value="nao"
            checked={resposta === "nao"}
            onChange={() => setResposta("nao")}
            className="w-5 h-5 accent-hiper-red"
          />
          Não tenho diagnóstico de hipertensão
        </label>
      </div>

      {erro && (
        <p role="alert" className="text-red-600 text-sm font-medium mb-4">
          {erro}
        </p>
      )}

      <Button onClick={handleSalvar} disabled={carregando}>
        {carregando ? "Salvando..." : "Salvar"}
      </Button>
    </div>
  );
}
