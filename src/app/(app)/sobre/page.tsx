import Link from "next/link";
import FlashCard from "@/components/FlashCard";

export default function SobrePage() {
  return (
    <div className="px-6 pt-14 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/informacoes" className="text-2xl" aria-label="Voltar">
          ←
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Sobre o HiperApp</h1>
      </div>

      <div className="flex flex-col gap-3">
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

      <Link
        href="/instalar"
        className="tap-target mt-4 w-full bg-white rounded-card shadow-card px-5 flex items-center justify-between"
      >
        <span className="font-medium text-gray-700">📲 Como instalar o HiperApp</span>
        <span className="text-gray-400">›</span>
      </Link>
    </div>
  );
}
