import Link from "next/link";
import FlashCard from "@/components/FlashCard";
import { MEDIDAS_NAO_MEDICAMENTOSAS, ORIENTACOES_MEDICAO } from "@/lib/classification";

export default function InformacoesPage() {
  return (
    <div className="px-6 pt-14 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-2xl" aria-label="Voltar">
          ←
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Informações</h1>
      </div>

      <div className="flex flex-col gap-3">
        <FlashCard
          emoji="🩸"
          titulo="O que é pressão arterial?"
          conteudo={
            <p>
              É a força que o sangue faz nas paredes das artérias. O primeiro número (sistólica)
              mostra a pressão quando o coração bate. O segundo (diastólica) mostra a pressão
              quando o coração descansa entre batidas.
            </p>
          }
        />

        <FlashCard
          emoji="📏"
          titulo="Como medir corretamente?"
          conteudo={
            <ul className="list-disc pl-5 space-y-1">
              {ORIENTACOES_MEDICAO.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          }
        />

        <FlashCard
          emoji="❤️"
          titulo="Cuidados com a saúde"
          conteudo={
            <ul className="list-disc pl-5 space-y-1">
              {MEDIDAS_NAO_MEDICAMENTOSAS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          }
        />

        <FlashCard
          emoji="🏥"
          titulo="Acompanhamento regular na UBS"
          conteudo={
            <p>
              A hipertensão costuma não dar sintomas, por isso o acompanhamento regular é
              importante. Mantenha suas consultas em dia e leve seu histórico do HiperApp para
              a equipe de saúde acompanhar sua evolução. O aplicativo não substitui uma
              avaliação médica.
            </p>
          }
        />
      </div>
    </div>
  );
}
