-- Tabela de sessões de estudo
create table if not exists public.sessoes_estudo (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topico_id uuid not null references public.topicos(id) on delete cascade,
  data_inicio timestamp with time zone not null,
  data_fim timestamp with time zone,
  duracao_minutos integer,
  observacoes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.sessoes_estudo enable row level security;

-- Políticas RLS para sessoes_estudo
create policy "sessoes_select_own"
  on public.sessoes_estudo for select
  using (auth.uid() = user_id);

create policy "sessoes_insert_own"
  on public.sessoes_estudo for insert
  with check (auth.uid() = user_id);

create policy "sessoes_update_own"
  on public.sessoes_estudo for update
  using (auth.uid() = user_id);

create policy "sessoes_delete_own"
  on public.sessoes_estudo for delete
  using (auth.uid() = user_id);
