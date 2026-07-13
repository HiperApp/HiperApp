"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type TamanhoFonte = "normal" | "grande" | "muito-grande";

interface AccessibilityContextValue {
  fonte: TamanhoFonte;
  setFonte: (f: TamanhoFonte) => void;
  contrasteAlto: boolean;
  setContrasteAlto: (v: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

const CHAVE_FONTE = "hiperapp:fonte";
const CHAVE_CONTRASTE = "hiperapp:contraste";

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fonte, setFonteState] = useState<TamanhoFonte>("normal");
  const [contrasteAlto, setContrasteAltoState] = useState(false);

  // Lê preferências salvas assim que o app carrega no navegador.
  useEffect(() => {
    const fonteSalva = window.localStorage.getItem(CHAVE_FONTE) as TamanhoFonte | null;
    const contrasteSalvo = window.localStorage.getItem(CHAVE_CONTRASTE);
    if (fonteSalva) setFonteState(fonteSalva);
    if (contrasteSalvo) setContrasteAltoState(contrasteSalvo === "1");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-fonte", fonte);
    window.localStorage.setItem(CHAVE_FONTE, fonte);
  }, [fonte]);

  useEffect(() => {
    document.documentElement.setAttribute("data-contraste", contrasteAlto ? "alto" : "normal");
    window.localStorage.setItem(CHAVE_CONTRASTE, contrasteAlto ? "1" : "0");
  }, [contrasteAlto]);

  return (
    <AccessibilityContext.Provider
      value={{ fonte, setFonte: setFonteState, contrasteAlto, setContrasteAlto: setContrasteAltoState }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error("useAccessibility precisa estar dentro de <AccessibilityProvider>");
  }
  return ctx;
}
