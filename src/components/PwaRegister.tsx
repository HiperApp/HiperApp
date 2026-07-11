"use client";

import { useEffect } from "react";

/**
 * Registra o service worker (necessário para instalação como PWA e
 * para notificações) e faz uma verificação a cada minuto para
 * disparar o lembrete de medição, caso o horário configurado tenha
 * chegado e o app esteja aberto.
 *
 * Observação importante: navegadores (principalmente no iOS) podem
 * suspender essa verificação se o app ficar muito tempo em segundo
 * plano ou fechado. Por isso o lembrete é "melhor esforço", e não
 * uma garantia como um alarme nativo.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {});

    const chaveUltimoDisparo = "hiperapp_ultimo_lembrete";

    function verificarLembrete() {
      try {
        const perfilRaw = localStorage.getItem("hiperapp_horarios_lembrete");
        if (!perfilRaw) return;
        const horarios: string[] = JSON.parse(perfilRaw);

        const agora = new Date();
        const horaAtual = `${String(agora.getHours()).padStart(2, "0")}:${String(
          agora.getMinutes()
        ).padStart(2, "0")}`;

        if (!horarios.includes(horaAtual)) return;

        const chaveHoje = `${horaAtual}-${agora.toDateString()}`;
        if (localStorage.getItem(chaveUltimoDisparo) === chaveHoje) return;

        if (Notification.permission === "granted" && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: "MOSTRAR_LEMBRETE",
            mensagem: "Está na hora de medir sua pressão! ❤️",
          });
          localStorage.setItem(chaveUltimoDisparo, chaveHoje);
        }
      } catch {
        // Falha silenciosa: lembrete é um recurso auxiliar, não crítico.
      }
    }

    const intervalo = setInterval(verificarLembrete, 30_000);
    verificarLembrete();

    return () => clearInterval(intervalo);
  }, []);

  return null;
}
