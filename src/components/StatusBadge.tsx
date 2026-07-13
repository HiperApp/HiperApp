import { CorStatus } from "@/lib/types";
import { STATUS_TAILWIND, ROTULO_EXIBICAO } from "@/lib/classification";

// Identificação visual padronizada da classificação, usada em todo o app
// (cards, formulários, dashboard). O texto exibido é sempre derivado da cor
// via ROTULO_EXIBICAO: para todas as faixas acima da referência (amarelo,
// laranja, vermelho) o texto mostrado é apenas "Alta" — a diferenciação
// entre elas é só visual (cor + emoji/símbolo), nunca textual. Isso é uma
// decisão de apresentação; a regra de avaliação que define a cor continua
// a mesma (ver @/lib/classification).
export default function StatusBadge({
  cor,
  simbolo,
}: {
  cor: CorStatus;
  // Seta (↑/↓) ou aviso (⚠) que reforça visualmente a categoria, sem
  // depender apenas da cor. Omitir para a faixa adequada.
  simbolo?: string;
}) {
  const c = STATUS_TAILWIND[cor];
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${c.bg} ${c.text} text-sm font-semibold px-3 py-1 rounded-full`}
    >
      <span className={`w-2 h-2 rounded-full ${c.dot}`} aria-hidden />
      {ROTULO_EXIBICAO[cor]}
      {simbolo && <span aria-hidden>{simbolo}</span>}
    </span>
  );
}
