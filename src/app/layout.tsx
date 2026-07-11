import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

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
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="app-shell">{children}</div>
        <PwaRegister />
      </body>
    </html>
  );
}
