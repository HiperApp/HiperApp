"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS_ESQUERDA = [
  { href: "/dashboard", label: "Início", icon: "🏠" },
  { href: "/historico", label: "Histórico", icon: "📋" },
];

const ITENS_DIREITA = [{ href: "/evolucao", label: "Evolução", icon: "📈" }];

function ItemNav({ item, ativo }: { item: { href: string; label: string; icon: string }; ativo: boolean }) {
  return (
    <Link
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
}

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-gray-100 pb-safe z-40 print:hidden"
      aria-label="Navegação principal"
    >
      <div className="flex items-stretch justify-between px-2">
        <div className="flex-1 flex items-stretch justify-around">
          {ITENS_ESQUERDA.map((item) => (
            <ItemNav key={item.href} item={item} ativo={pathname === item.href} />
          ))}
        </div>

        {/* Espaço reservado para o botão + flutuante, que fica centralizado
            de forma absoluta logo abaixo (independente da quantidade de
            itens de cada lado, para nunca ficar desalinhado). */}
        <div className="w-16 shrink-0" aria-hidden />

        <div className="flex-1 flex items-stretch justify-around">
          {ITENS_DIREITA.map((item) => (
            <ItemNav key={item.href} item={item} ativo={pathname === item.href} />
          ))}
        </div>
      </div>

      <Link
        href="/nova-medicao"
        aria-label="Nova aferição"
        className="absolute left-1/2 -translate-x-1/2 -top-5 flex items-center justify-center"
      >
        <span className="w-14 h-14 rounded-full bg-hiper-red text-white text-2xl flex items-center justify-center shadow-card">
          ➕
        </span>
      </Link>
    </nav>
  );
}
