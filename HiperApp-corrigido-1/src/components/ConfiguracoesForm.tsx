"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Card from "@/components/Card";
import { Profile } from "@/lib/types";

export default function ConfiguracoesForm({ profile }: { profile: Profile }) {
  const [ativas, setAtivas] = useState(profile.notificacoes_ativas);
  const [horario1, setHorario1] = useState(profile.horario_lembrete_1?.slice(0, 5) ?? "08:00");
  const [horario2, setHorario2] = useState(profile.horario_lembrete_2?.slice(0, 5) ?? "20:00");
  const [permissao, setPermissao] = useState<NotificationPermission | "indisponivel">(
    "indisponivel"
  );

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermissao(Notification.permission);
    }
    sincronizarLocalStorage(ativas, [horario1, horario2]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sincronizarLocalStorage(ligado: boolean, horarios: string[]) {
    if (ligado) {
      localStorage.setItem("hiperapp_horarios_lembrete", JSON.stringify(horarios));
    } else {
      localStorage.removeItem("hiperapp_horarios_lembrete");
    }
  }

  async function pedirPermissao() {
    if (typeof Notification === "undefined") return;
    const resultado = await Notification.requestPermission();
    setPermissao(resultado);
  }

  async function salvarNoBanco(campos: Partial<Profile>) {
    const supabase = createClient();
    await supabase.from("profiles").update(campos).eq("id", profile.id);
  }

  async function alternarNotificacoes() {
    const novoValor = !ativas;
    setAtivas(novoValor);
    sincronizarLocalStorage(novoValor, [horario1, horario2]);
    await salvarNoBanco({ notificacoes_ativas: novoValor });
    if (novoValor && permissao !== "granted") {
      await pedirPermissao();
    }
  }

  async function atualizarHorario(indice: 1 | 2, valor: string) {
    if (indice === 1) setHorario1(valor);
    else setHorario2(valor);
    const novosHorarios = indice === 1 ? [valor, horario2] : [horario1, valor];
    sincronizarLocalStorage(ativas, novosHorarios);
    await salvarNoBanco(
      indice === 1 ? { horario_lembrete_1: valor } : { horario_lembrete_2: valor }
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">Notificações</p>
          <p className="text-sm text-gray-500">Lembretes para medir sua pressão.</p>
        </div>
        <button
          role="switch"
          aria-checked={ativas}
          onClick={alternarNotificacoes}
          className={`w-14 h-8 rounded-full flex items-center transition ${
            ativas ? "bg-hiper-red justify-end" : "bg-gray-200 justify-start"
          } px-1`}
        >
          <span className="w-6 h-6 bg-white rounded-full shadow" />
        </button>
      </Card>

      {ativas && permissao !== "granted" && (
        <button
          onClick={pedirPermissao}
          className="tap-target text-sm text-hiper-navy font-medium underline self-start px-1"
        >
          Permitir notificações no navegador
        </button>
      )}

      <Card>
        <p className="font-semibold text-gray-900 mb-3">Horários de lembrete</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">1º lembrete</label>
            <input
              type="time"
              value={horario1}
              onChange={(e) => atualizarHorario(1, e.target.value)}
              className="w-full tap-target rounded-button border border-gray-200 px-3 bg-white mt-1"
            />
          </div>
          <div>
            <label className="text-sm text-gray-500">2º lembrete</label>
            <input
              type="time"
              value={horario2}
              onChange={(e) => atualizarHorario(2, e.target.value)}
              className="w-full tap-target rounded-button border border-gray-200 px-3 bg-white mt-1"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Os lembretes funcionam melhor com o HiperApp instalado na tela inicial e aberto de vez
          em quando. Em alguns celulares, o sistema pode atrasar notificações para economizar
          bateria.
        </p>
      </Card>

      <Card>
        <p className="font-semibold text-gray-900">Sobre o HiperApp</p>
        <p className="text-sm text-gray-500 mt-1">Versão 1.0.0</p>
      </Card>
    </div>
  );
}
