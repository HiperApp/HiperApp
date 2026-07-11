"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/Button";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setCarregando(false);
    if (error) {
      setErro("Não foi possível enviar o e-mail. Confira o endereço digitado.");
      return;
    }
    setEnviado(true);
  }

  return (
    <div className="min-h-dvh flex flex-col px-6 pt-16 pb-10">
      <div className="text-center mb-10">
        <div className="text-4xl mb-2">🔑</div>
        <h1 className="text-2xl font-bold text-gray-900">Recuperar senha</h1>
        <p className="text-gray-500 mt-2">
          Informe seu e-mail para receber um link de redefinição de senha.
        </p>
      </div>

      {enviado ? (
        <p className="text-center text-hiper-navy font-medium">
          Enviamos um link para {email}. Verifique sua caixa de entrada.
        </p>
      ) : (
        <form onSubmit={handleEnviar} className="flex flex-col gap-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            className="w-full tap-target rounded-button border border-gray-200 px-4 text-lg bg-white"
          />
          {erro && (
            <p role="alert" className="text-red-600 text-sm font-medium">
              {erro}
            </p>
          )}
          <Button type="submit" disabled={carregando}>
            {carregando ? "Enviando..." : "Enviar link"}
          </Button>
        </form>
      )}

      <Link href="/login" className="text-hiper-navy text-center font-medium mt-6">
        Voltar para o login
      </Link>
    </div>
  );
}
