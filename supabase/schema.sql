-- ============================================================
-- HIPERAPP — SCHEMA DO BANCO DE DADOS (SUPABASE / POSTGRES)
-- ============================================================
-- Como usar:
-- 1. Abra o painel do Supabase do seu projeto.
-- 2. Vá em "SQL Editor" -> "New query".
-- 3. Cole todo este arquivo e clique em "Run".
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABELA DE PERFIS DE USUÁRIO
-- ------------------------------------------------------------
-- O Supabase já cria e gerencia a tabela auth.users (autenticação).
-- Aqui criamos uma tabela "profiles" para guardar dados extras do
-- usuário (nome, data de nascimento, telefone, preferências),
-- ligada 1-para-1 com auth.users.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  data_nascimento date,
  telefone text,
  avatar_url text,
  onboarding_visto boolean not null default false,
  notificacoes_ativas boolean not null default true,
  horario_lembrete_1 time default '08:00',
  horario_lembrete_2 time default '20:00',
  -- Informação DECLARADA PELO PRÓPRIO USUÁRIO sobre já ter diagnóstico de
  -- hipertensão arterial. NULL = ainda não respondeu. Usada apenas como
  -- contexto para orientações educativas — o app não diagnostica hipertensão.
  diagnostico_hipertensao boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Coluna adicionada em atualização posterior: garante que ela exista mesmo em
-- bancos onde a tabela "profiles" já tinha sido criada antes desta mudança.
alter table public.profiles
  add column if not exists diagnostico_hipertensao boolean;

comment on table public.profiles is 'Dados de perfil de cada usuário do HiperApp, complementando auth.users.';

-- ------------------------------------------------------------
-- 2. TABELA DE MEDIÇÕES DE PRESSÃO
-- ------------------------------------------------------------

create table if not exists public.medicoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data date not null,
  horario time not null,
  periodo text not null check (periodo in ('manha', 'tarde', 'noite')),
  pressao_sistolica smallint not null check (pressao_sistolica between 40 and 300),
  pressao_diastolica smallint not null check (pressao_diastolica between 20 and 200),
  classificacao text not null,
  cor_status text not null check (cor_status in ('verde', 'amarelo', 'vermelho')),
  created_at timestamptz not null default now()
);

comment on table public.medicoes is 'Registros de pressão arterial informados pelo usuário.';

-- Atualização posterior: identificação visual passou a usar uma cor própria
-- ('azul') para pressão baixa, em vez de reaproveitar 'amarelo'/'vermelho'
-- (que também representam pressão elevada). Recria a constraint para aceitar
-- 'azul' e não quebrar bancos onde a tabela já existia antes desta mudança.
alter table public.medicoes drop constraint if exists medicoes_cor_status_check;
alter table public.medicoes
  add constraint medicoes_cor_status_check
  check (cor_status in ('verde', 'amarelo', 'azul', 'vermelho'));

-- Corrige registros já salvos: aferições de pressão baixa gravadas antes
-- desta atualização ficaram com cor_status 'amarelo' (ou, nos casos mais
-- graves, 'vermelho'); passam a usar 'azul', igual às novas aferições.
update public.medicoes
  set cor_status = 'azul'
  where pressao_sistolica < 90 or pressao_diastolica < 60;

-- Atualização posterior: a classificação passou a ter 5 faixas, com uma cor
-- própria ('laranja') para a faixa "Alta" (antes reaproveitava 'vermelho').
-- Recria a constraint para aceitar 'laranja' e não quebrar bancos onde a
-- tabela já existia antes desta mudança.
alter table public.medicoes drop constraint if exists medicoes_cor_status_check;
alter table public.medicoes
  add constraint medicoes_cor_status_check
  check (cor_status in ('verde', 'amarelo', 'laranja', 'azul', 'vermelho'));

-- Corrige registros já salvos: aferições na faixa "Alta" (PAS 140–159 e/ou
-- PAD 90–99) gravadas antes desta atualização ficaram com cor_status
-- 'vermelho'; passam a usar 'laranja', igual às novas aferições. Não altera
-- registros na faixa "Muito alta" (PAS ≥ 160 e/ou PAD ≥ 100), que continuam
-- corretamente como 'vermelho'.
update public.medicoes
  set cor_status = 'laranja'
  where (pressao_sistolica between 140 and 159 or pressao_diastolica between 90 and 99)
    and pressao_sistolica < 160
    and pressao_diastolica < 100;

create index if not exists medicoes_user_id_idx on public.medicoes (user_id);
create index if not exists medicoes_user_data_idx on public.medicoes (user_id, data desc, horario desc);

-- ------------------------------------------------------------
-- 3. FUNÇÃO + TRIGGER: criar profile automaticamente no cadastro
-- ------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome, email, diagnostico_hipertensao)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', ''),
    new.email,
    (new.raw_user_meta_data->>'diagnostico_hipertensao')::boolean
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------
-- 4. FUNÇÃO: manter updated_at sempre atualizado
-- ------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ------------------------------------------------------------
-- 5. SEGURANÇA (ROW LEVEL SECURITY)
-- ------------------------------------------------------------
-- Cada usuário só pode ver e alterar os próprios dados.

alter table public.profiles enable row level security;
alter table public.medicoes enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "medicoes_select_own" on public.medicoes;
create policy "medicoes_select_own"
  on public.medicoes for select
  using (auth.uid() = user_id);

drop policy if exists "medicoes_insert_own" on public.medicoes;
create policy "medicoes_insert_own"
  on public.medicoes for insert
  with check (auth.uid() = user_id);

drop policy if exists "medicoes_update_own" on public.medicoes;
create policy "medicoes_update_own"
  on public.medicoes for update
  using (auth.uid() = user_id);

drop policy if exists "medicoes_delete_own" on public.medicoes;
create policy "medicoes_delete_own"
  on public.medicoes for delete
  using (auth.uid() = user_id);

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================
