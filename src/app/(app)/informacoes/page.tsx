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

        <FlashCard
          emoji="👨‍⚕️"
          titulo="Equipe responsável pelo desenvolvimento"
          conteudo={
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-gray-900">Matheus Batista de Souza</p>
                <p>Idealizador e desenvolvedor do aplicativo</p>
                <p>Graduando em Medicina – FACAPE</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Mariane Barbosa Castelo Branco</p>
                <p>Colaboradora do projeto</p>
                <p>Graduanda em Medicina – FACAPE</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Pedro Henrique Gomes de Almeida</p>
                <p>Colaborador do projeto</p>
                <p>Graduando em Medicina – FACAPE</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">João Henrique Fernandes Araújo</p>
                <p>Colaborador do projeto</p>
                <p>Graduando em Medicina – FACAPE</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Bruna Bortoloni Gouveia</p>
                <p>Colaboradora científica</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Licenciada em Biologia – Universidade de Pernambuco (UPE)</li>
                  <li>
                    Bacharela em Medicina Veterinária – Universidade Federal do Vale do São
                    Francisco (UNIVASF)
                  </li>
                  <li>
                    Mestra em Ciências Veterinárias no Semiárido – Linha de Pesquisa:
                    Biotecnologia Aplicada à Medicina Veterinária
                  </li>
                  <li>
                    Doutora em Biotecnologia – RENORBIO / Universidade Federal Rural de
                    Pernambuco (UFRPE)
                  </li>
                  <li>
                    Integrante do Grupo de Pesquisa Biotecnologia Aplicada ao Desenvolvimento de
                    Folículos Ovarianos (BioFOV)
                  </li>
                  <li>Universidade Federal do Vale do São Francisco (UNIVASF)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Pedro Henrique Pereira Gomes</p>
                <p>Colaborador científico</p>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  <li>Cirurgião-Dentista – Universidade Federal de Campina Grande (UFCG)</li>
                  <li>
                    Aperfeiçoado em Cirurgia Oral Menor – Centro Universitário de Patos (UNIFIP)
                  </li>
                  <li>
                    Residente em Cirurgia e Traumatologia Buco-Maxilo-Facial – Secretaria
                    Municipal de Saúde de São Paulo (SMS-SP)
                  </li>
                </ul>
              </div>
            </div>
          }
        />

        <FlashCard
          emoji="📚"
          titulo="Referência científica"
          conteudo={
            <p>
              Todas as informações relacionadas à saúde presentes neste aplicativo são baseadas
              nas Diretrizes da Sociedade Brasileira de Cardiologia (2025), buscando fornecer
              conteúdo atualizado e fundamentado nas melhores evidências científicas disponíveis.
            </p>
          }
        />

        <FlashCard
          emoji="⚠️"
          titulo="Aviso importante"
          conteudo={
            <p>
              Este aplicativo possui finalidade educativa e de acompanhamento dos registros de
              pressão arterial. Ele não substitui a avaliação, o diagnóstico ou o tratamento
              realizados por um profissional de saúde.
            </p>
          }
        />
      </div>
    </div>
  );
}
