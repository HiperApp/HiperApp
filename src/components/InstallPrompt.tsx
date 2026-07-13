"use client";

import { useEffect, useState } from "react";
import Button from "@/components/Button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [evento, setEvento] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalado, setInstalado] = useState(false);

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault();
      setEvento(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handler);

    const jaInstalado = window.matchMedia("(display-mode: standalone)").matches;
    setInstalado(jaInstalado);

    window.addEventListener("appinstalled", () => setInstalado(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (instalado) {
    return (
      <p className="text-center text-hiper-navy font-medium py-4">
        ✅ O HiperApp já está instalado neste aparelho.
      </p>
    );
  }

  if (!evento) return null;

  async function instalar() {
    if (!evento) return;
    await evento.prompt();
    setEvento(null);
  }

  return (
    <Button onClick={instalar} className="mb-2">
      Instalar agora
    </Button>
  );
}
