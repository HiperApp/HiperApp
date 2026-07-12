# HiperApp

Aplicativo (PWA) de monitoramento residencial da pressão arterial.

Stack: **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase (banco + autenticação) + Recharts**.

---

## 1. Antes de começar

Você vai precisar de:

- Uma conta gratuita no [Supabase](https://supabase.com)
- Uma conta gratuita na [Vercel](https://vercel.com)
- [Node.js](https://nodejs.org) instalado (versão 18 ou mais recente), se quiser rodar localmente
- Uma conta no [GitHub](https://github.com) (recomendado, facilita o deploy na Vercel)

---

## 2. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto (escolha uma senha de banco de dados e guarde-a).
2. Espere o projeto terminar de ser criado (leva 1–2 minutos).
3. No menu lateral, vá em **SQL Editor** → **New query**.
4. Abra o arquivo `supabase/schema.sql` deste projeto, copie todo o conteúdo, cole no editor e clique em **Run**.
   - Isso cria as tabelas `profiles` e `medicoes`, as regras de segurança (RLS) e o gatilho que cria o perfil automaticamente quando alguém se cadastra.
5. No menu lateral, vá em **Authentication** → **Providers** → confirme que **Email** está habilitado.
6. (Opcional, recomendado para não travar o cadastro em testes) Em **Authentication** → **Settings**, você pode desativar temporariamente a confirmação por e-mail para testar mais rápido. Em produção, o ideal é manter a confirmação ativada.
7. Vá em **Project Settings** → **API**. Copie:
   - **Project URL**
   - **anon public key**

---

## 3. Configurar as variáveis de ambiente

Na raiz do projeto, copie o arquivo de exemplo:

```bash
cp .env.local.example .env.local
```

Abra `.env.local` e cole os valores copiados do Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLICA
```

---

## 4. Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000` no navegador. Para testar a instalação como PWA e as notificações, use o Chrome no celular (Android) acessando pelo IP da sua rede, ou publique primeiro na Vercel (passo 5) — PWA funciona melhor em HTTPS.

---

## 5. Publicar na Vercel (gratuito)

**Opção recomendada — via GitHub:**

1. Crie um repositório no GitHub e envie este projeto para lá:
   ```bash
   git init
   git add .
   git commit -m "HiperApp inicial"
   git branch -M main
   git remote add origin SEU_REPOSITORIO_GIT
   git push -u origin main
   ```
2. Acesse [vercel.com/new](https://vercel.com/new) e importe o repositório.
3. Na tela de configuração do projeto, adicione as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique em **Deploy**.
5. Pronto — a Vercel vai te dar uma URL pública (ex: `hiperapp.vercel.app`), já em HTTPS, pronta para instalar no celular.

**Opção alternativa — via linha de comando (Vercel CLI):**

```bash
npm install -g vercel
vercel
vercel --prod
```

Depois adicione as variáveis de ambiente pelo painel da Vercel (Settings → Environment Variables) e refaça o deploy.

---

## 6. Instalar no celular

Depois de publicado, abra o link no celular:

- **Android (Chrome):** menu (⋮) → "Adicionar à tela inicial".
- **iPhone (Safari):** ícone de compartilhar → "Adicionar à Tela de Início".

O próprio app tem uma tela explicando isso em **Perfil → Configurações → Como instalar o HiperApp**.

---

## 7. Estrutura do projeto

```
src/
  app/
    page.tsx                  → Splash screen (decide para onde redirecionar)
    onboarding/                → Apresentação inicial (4 telas)
    login/                     → Login
    cadastro/                  → Criar conta
    recuperar-senha/           → Recuperação de senha
    (app)/                     → Telas internas (exigem login)
      dashboard/                → Tela inicial
      nova-medicao/              → Registrar pressão
      historico/                 → Lista de medições
      evolucao/                  → Gráficos
      informacoes/                → Conteúdo educativo
      perfil/                     → Dados da conta
      configuracoes/               → Notificações e lembretes
      instalar/                    → Instruções de instalação do PWA
  components/                 → Componentes de UI reutilizáveis
  lib/
    classification.ts          → Classificação oficial da pressão (Diretriz 2025)
    supabase/                  → Clientes Supabase (browser, server, middleware)
    types.ts                   → Tipos TypeScript
  middleware.ts                → Protege rotas que exigem login
supabase/
  schema.sql                  → Schema completo do banco (tabelas + segurança)
public/
  manifest.json                → Manifesto do PWA
  sw.js                         → Service worker (offline + notificações)
  icons/                        → Ícones gerados a partir da logo oficial
```

---

## 8. Sobre a classificação de pressão

A classificação usada no app segue **exclusivamente** a Diretriz Brasileira de
Hipertensão Arterial 2025 (SBC/SBH/SBN), conforme os valores fornecidos. As
faixas ficam centralizadas em `src/lib/classification.ts`, como constantes,
para facilitar qualquer atualização futura. O app deixa claro em várias telas
que essa classificação é educativa e **não substitui avaliação médica**.

---

## 9. Sobre notificações (importante)

O HiperApp usa a Web Notifications API para lembrar o usuário de medir a
pressão nos horários configurados em Configurações. Isso funciona bem no
Android. No iPhone, só funciona a partir do iOS 16.4+ e **somente depois de
instalado na tela inicial** (não funciona pelo Safari aberto normalmente). Em
qualquer plataforma, se o navegador ficar muito tempo fechado ou em segundo
plano, o sistema operacional pode atrasar ou não disparar o lembrete — é uma
limitação de PWAs, e não um defeito do app.

---

## 10. Próximos passos sugeridos (não incluídos nesta entrega)

- Envio de notificações via **push real** (servidor), caso queira lembretes
  garantidos mesmo com o app fechado por dias — exigiria um pequeno backend
  adicional para dispar os pushes nos horários certos.
- Exportação de PDF mais elaborada (hoje usa a função de impressão do
  navegador, que já gera PDF, mas sem um layout de relatório clínico).
