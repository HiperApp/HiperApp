"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/dashboard", label: "Início", icon: "🏠" },
  { href: "/historico", label: "Histórico", icon: "📋" },
  { href: "/nova-medicao", label: "", icon: "➕", central: true },
  { href: "/evolucao", label: "Evolução", icon: "📈" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 flex items-stretch justify-between px-2 pb-safe z-40"
      aria-label="Navegação principal"
    >
      {ITENS.map((item) => {
        const ativo = pathname === item.href;
        if (item.central) {
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label="Nova medição"
              className="flex-1 flex items-center justify-center"
            >
              <span className="w-14 h-14 -mt-5 rounded-full bg-hiper-red text-white text-2xl flex items-center justify-center shadow-card">
                {item.icon}
              </span>
            </Link>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 tap-target ${
              ativo ? "text-hiper-red" : "text-gray-400"
            }`}
            aria-current={ativo ? "page" : undefined}
          >
            <span className="text-xl" aria-hidden>
              {item.icon}
            </span>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
