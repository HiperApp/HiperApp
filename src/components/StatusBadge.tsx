import { CorStatus } from "@/lib/types";
import { STATUS_TAILWIND, ROTULO_STATUS } from "@/lib/classification";

export default function StatusBadge({
  cor,
  texto,
  simbolo,
}: {
  cor: CorStatus;
  texto?: string;
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
      {texto ?? ROTULO_STATUS[cor]}
      {simbolo && <span aria-hidden>{simbolo}</span>}
    </span>
  );
}
