import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import AccessibilityButton from "@/components/AccessibilityButton";

export const metadata: Metadata = {
  title: "HiperApp - Monitoramento de Pressão Arterial",
  description:
    "Registre, organize e acompanhe sua pressão arterial de forma simples e segura.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HiperApp",
  },
};

export const viewport: Viewport = {
  themeColor: "#E2333D",
  width: "device-width",
  initialScale: 1,
  // Sem maximumScale: permite que o usuário dê zoom com os dedos,
  // importante para quem tem baixa visão mesmo com fonte grande.
};

// Script pequeno e síncrono que aplica a fonte/contraste salvos
// ANTES da página ser exibida, evitando uma piscada de tamanho normal
// seguida por um "salto" para o tamanho escolhido pelo usuário.
const SCRIPT_PREFERENCIAS = `
try {
  var fonte = window.localStorage.getItem("hiperapp:fonte");
  var contraste = window.localStorage.getItem("hiperapp:contraste");
  document.documentElement.setAttribute("data-fonte", fonte || "normal");
  document.documentElement.setAttribute("data-contraste", contraste === "1" ? "alto" : "normal");
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_PREFERENCIAS }} />
      </head>
      <body>
        <AccessibilityProvider>
          <div className="app-shell">{children}</div>
          <AccessibilityButton />
        </AccessibilityProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
