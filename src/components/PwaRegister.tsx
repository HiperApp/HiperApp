"use client";

import { useEffect } from "react";

/**
 * Registra o service worker, necessário apenas para o HiperApp poder
 * ser instalado na tela inicial e funcionar offline nas telas já
 * visitadas. Não há mais lembretes/notificações neste app.
 */
export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return null;
}
