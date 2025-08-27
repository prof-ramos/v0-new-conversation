-- Tabela de tópicos dentro de cada matéria
create table if not exists public.topicos (
  id uuid primary key default gen_random_uuid(),
  materia_id uuid not null references public.materias(id) on delete cascade,
  nome text not null,
  descricao text,
  ordem integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Políticas RLS para topicos (leitura pública)
alter table public.topicos enable row level security;

create policy "topicos_select_all"
  on public.topicos for select
  using (true);
