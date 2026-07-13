"use client";

export default function ExportButton() {
  return (
    <button
      onClick={() => window.print()}
      className="tap-target w-full rounded-button border-2 border-hiper-navy text-hiper-navy font-semibold text-lg mt-4 print:hidden"
    >
      📄 Exportar / Compartilhar (PDF)
    </button>
  );
}
