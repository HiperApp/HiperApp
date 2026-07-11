import { CorStatus } from "@/lib/types";

const CONFIG: Record<CorStatus, { bg: string; text: string; dot: string }> = {
  verde: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  amarelo: { bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  vermelho: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

export default function StatusBadge({
  cor,
  texto,
}: {
  cor: CorStatus;
  texto?: string;
}) {
  const c = CONFIG[cor];
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${c.bg} ${c.text} text-sm font-semibold px-3 py-1 rounded-full`}
    >
      <span className={`w-2 h-2 rounded-full ${c.dot}`} aria-hidden />
      {texto ?? cor}
    </span>
  );
}
