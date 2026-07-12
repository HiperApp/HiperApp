"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha incorretos. Tente novamente.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 pt-16 pb-10">
      <div className="text-center mb-10">
        <div className="text-4xl mb-2">❤️</div>
        <h1 className="text-2xl font-bold text-hiper-red">HiperApp</h1>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
            E-mail
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
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
          <div className="relative">
            <input
              id="senha"
              type={mostrarSenha ? "text" : "password"}
              required
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full tap-target rounded-button border border-gray-200 px-4 pr-14 text-lg bg-white"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              className="absolute right-4 top-0 h-full text-gray-400 text-sm font-medium"
              aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            >
              {mostrarSenha ? "Ocultar" : "Ver"}
            </button>
          </div>
        </div>

        {erro && (
          <p role="alert" className="text-red-600 text-sm font-medium">
            {erro}
          </p>
        )}

        <Link href="/recuperar-senha" className="text-hiper-navy text-sm font-medium self-end">
          Esqueci minha senha
        </Link>

        <Button type="submit" disabled={carregando} className="mt-2">
          {carregando ? "Entrando..." : "Entrar"}
        </Button>

        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">ou</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <Button type="button" variant="outline" onClick={() => router.push("/cadastro")}>
          Criar conta
        </Button>
      </form>
    </div>
  );
}
