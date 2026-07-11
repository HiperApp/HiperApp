import Link from "next/link";
import Card from "@/components/Card";
import InstallPrompt from "@/components/InstallPrompt";

export default function InstalarPage() {
  return (
    <div className="px-6 pt-14 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-2xl" aria-label="Voltar">
          ←
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Instalar o HiperApp</h1>
      </div>

      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-20 h-20 rounded-2xl bg-hiper-red flex items-center justify-center text-4xl mb-4">
          ❤️
        </div>
        <p className="text-gray-500 max-w-xs">
          Adicione o HiperApp à sua tela inicial para acessar mais rápido, como um aplicativo de
          verdade.
        </p>
      </div>

      <InstallPrompt />

      <Card className="mt-4">
        <p className="font-semibold text-gray-900 mb-3">📱 No Android (Chrome)</p>
        <ol className="list-decimal pl-5 space-y-2 text-gray-600">
          <li>Toque no menu (⋮) no canto superior do navegador.</li>
          <li>
            Escolha <strong>&quot;Adicionar à tela inicial&quot;</strong>.
          </li>
          <li>Confirme tocando em &quot;Adicionar&quot;.</li>
        </ol>
      </Card>

      <Card className="mt-4">
        <p className="font-semibold text-gray-900 mb-3">🍎 No iPhone (Safari)</p>
        <ol className="list-decimal pl-5 space-y-2 text-gray-600">
          <li>
            Toque no ícone de compartilhar <span aria-hidden>⬆️</span> na barra inferior.
          </li>
          <li>
            Escolha <strong>&quot;Adicionar à Tela de Início&quot;</strong>.
          </li>
          <li>Toque em &quot;Adicionar&quot; no canto superior direito.</li>
        </ol>
        <p className="text-xs text-gray-400 mt-3">
          No iPhone, precisa estar no Safari (não funciona pelo Chrome) e o iOS precisa estar
          atualizado para receber lembretes.
        </p>
      </Card>
    </div>
  );
}
