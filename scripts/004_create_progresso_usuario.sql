-- Tabela de progresso do usuário por tópico
create table if not exists public.progresso_usuario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topico_id uuid not null references public.topicos(id) on delete cascade,
  status text not null default 'nao_iniciado', -- 'nao_iniciado', 'em_progresso', 'concluido'
  porcentagem_conclusao integer default 0 check (porcentagem_conclusao >= 0 and porcentagem_conclusao <= 100),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, topico_id)
);

alter table public.progresso_usuario enable row level security;

-- Políticas RLS para progresso_usuario
create policy "progresso_select_own"
  on public.progresso_usuario for select
  using (auth.uid() = user_id);

create policy "progresso_insert_own"
  on public.progresso_usuario for insert
  with check (auth.uid() = user_id);

create policy "progresso_update_own"
  on public.progresso_usuario for update
  using (auth.uid() = user_id);

create policy "progresso_delete_own"
  on public.progresso_usuario for delete
  using (auth.uid() = user_id);
