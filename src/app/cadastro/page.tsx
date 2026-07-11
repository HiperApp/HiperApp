"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/Button";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const router = useRouter();

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setCarregando(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } },
    });

    setCarregando(false);

    if (error) {
  console.error("ERRO SUPABASE:", error);

  setErro(error.message);

  return;
}

    // Se a confirmação de e-mail estiver desativada no Supabase, já existe sessão.
    if (data.session) {
      router.push("/onboarding");
      router.refresh();
    } else {
      setSucesso(true);
    }
  }

  if (sucesso) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-4">📩</div>
        <h1 className="text-xl font-bold text-gray-900">Confirme seu e-mail</h1>
        <p className="text-gray-500 mt-2 max-w-xs">
          Enviamos um link de confirmação para {email}. Confirme para poder entrar no HiperApp.
        </p>
        <Button className="mt-8" onClick={() => router.push("/login")}>
          Voltar para o login
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 pt-16 pb-10">
      <div className="text-center mb-8">
        <div className="text-4xl mb-2">❤️</div>
        <h1 className="text-2xl font-bold text-hiper-red">Criar conta</h1>
      </div>

      <form onSubmit={handleCadastro} className="flex flex-col gap-4">
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-600 mb-1">
            Nome
          </label>
          <input
            id="nome"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full tap-target rounded-button border border-gray-200 px-4 text-lg bg-white"
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full tap-target rounded-button border border-gray-200 px-4 text-lg bg-white"
            placeholder="seuemail@exemplo.com"
          />
        </div>

        <div>
          <label htmlFor="senha" className="block text-sm font-medium text-gray-600 mb-1">
            Senha
          </label>
          <input
            id="senha"
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full tap-target rounded-button border border-gray-200 px-4 text-lg bg-white"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        {erro && (
          <p role="alert" className="text-red-600 text-sm font-medium">
            {erro}
          </p>
        )}

        <Button type="submit" disabled={carregando} className="mt-2">
          {carregando ? "Criando conta..." : "Criar conta"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/login")}>
          Já tenho conta
        </Button>
      </form>
    </div>
  );
}
