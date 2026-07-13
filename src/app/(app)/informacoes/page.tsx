import Link from "next/link";
import FlashCard from "@/components/FlashCard";
import {
  MEDIDAS_NAO_MEDICAMENTOSAS,
  ORIENTACOES_MEDICAO,
  EXPLICACAO_120_80,
  EXPLICACAO_HIPOTENSAO,
  EXPLICACAO_USO_APLICATIVO,
  DICAS_IMPORTANTES,
  DIETA_DASH,
  ALIMENTOS_POTASSIO,
  ALIMENTOS_SODIO,
} from "@/lib/classification";

export default function InformacoesPage() {
  return (
    <div className="px-6 pt-14 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-2xl" aria-label="Voltar">
          ←
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Informações sobre Hipertensão</h1>
      </div>

      <div className="flex flex-col gap-3">
        <FlashCard
          emoji="🩸"
          titulo="O que é pressão arterial?"
          conteudo={
            <p>
              É a força que o sangue faz nas paredes das artérias. O primeiro número (sistólica)
              mostra a pressão arterial quando o coração bate. O segundo (diastólica) mostra a
              pressão arterial quando o coração descansa entre batidas.
            </p>
          }
        />

        <FlashCard
          emoji="🤔"
          titulo={EXPLICACAO_120_80.titulo}
          conteudo={
            <div className="space-y-3">
              {EXPLICACAO_120_80.paragrafos.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          }
        />

        <FlashCard
          emoji="💧"
          titulo={EXPLICACAO_HIPOTENSAO.titulo}
          conteudo={
            <div className="space-y-4">
              {EXPLICACAO_HIPOTENSAO.paragrafos.map((p, i) => (
                <p key={i}>{p}</p>
              ))}

              <div>
                <p className="font-semibold text-hiper-red mb-1">
                  Procure atendimento imediatamente se a pressão baixa vier acompanhada de:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  {EXPLICACAO_HIPOTENSAO.sinaisEmergencia.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-1">
                  Procure uma consulta médica (não necessariamente de emergência) se:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  {EXPLICACAO_HIPOTENSAO.sinaisConsulta.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          }
        />

        <FlashCard
          emoji="📏"
          titulo="Como aferir corretamente?"
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
          emoji="🥗"
          titulo="Dieta DASH"
          conteudo={
            <div className="space-y-4">
              <p>{DIETA_DASH.introducao}</p>

              <div>
                <p className="font-semibold text-gray-800 mb-1">Principais características</p>
                <ul className="list-disc pl-5 space-y-1">
                  {DIETA_DASH.caracteristicas.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-1">Alimentos recomendados</p>
                <ul className="list-disc pl-5 space-y-1">
                  {DIETA_DASH.recomendados.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-1">
                  Alimentos que devem ser reduzidos
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  {DIETA_DASH.reduzir.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-semibold text-gray-800 mb-1">Benefícios</p>
                <ul className="list-disc pl-5 space-y-1">
                  {DIETA_DASH.beneficios.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <p>{DIETA_DASH.conclusao}</p>
            </div>
          }
        />

        <FlashCard
          emoji="🍌"
          titulo="Alimentos ricos em potássio"
          conteudo={
            <div className="space-y-3">
              <p>{ALIMENTOS_POTASSIO.introducao}</p>
              <ul className="list-disc pl-5 space-y-1">
                {ALIMENTOS_POTASSIO.grupos.map((grupo) => (
                  <li key={grupo.categoria}>
                    <span className="font-semibold text-gray-800">{grupo.categoria}: </span>
                    {grupo.itens}
                  </li>
                ))}
              </ul>
            </div>
          }
        />

        <FlashCard
          emoji="🧂"
          titulo="Alimentos ricos em sódio"
          conteudo={
            <div className="space-y-3">
              <p>{ALIMENTOS_SODIO.introducao}</p>
              <ul className="list-disc pl-5 space-y-1">
                {ALIMENTOS_SODIO.grupos.map((grupo) => (
                  <li key={grupo.categoria}>
                    <span className="font-semibold text-gray-800">{grupo.categoria}: </span>
                    {grupo.itens}
                  </li>
                ))}
              </ul>
            </div>
          }
        />

        <FlashCard
          emoji="✅"
          titulo="Dicas importantes"
          conteudo={
            <ul className="list-disc pl-5 space-y-1">
              {DICAS_IMPORTANTES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          }
        />

        <FlashCard
          emoji="📲"
          titulo={EXPLICACAO_USO_APLICATIVO.titulo}
          conteudo={<p>{EXPLICACAO_USO_APLICATIVO.texto}</p>}
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

      <Link
        href="/sobre"
        className="tap-target mt-4 w-full bg-white rounded-card shadow-card px-5 flex items-center justify-between"
      >
        <span className="font-medium text-gray-700">ℹ️ Sobre o HiperApp</span>
        <span className="text-gray-400">›</span>
      </Link>
    </div>
  );
}
