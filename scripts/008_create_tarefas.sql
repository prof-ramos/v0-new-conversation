-- Tabela de tarefas diárias
create table if not exists public.tarefas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  titulo text not null,
  descricao text,
  categoria text not null default 'geral', -- 'estudo', 'pessoal', 'trabalho', 'geral'
  prioridade text not null default 'media', -- 'baixa', 'media', 'alta'
  tempo_estimado integer, -- tempo estimado em minutos: 5, 10, 15, 20, 30, 45, 60
  status text not null default 'pendente', -- 'pendente', 'concluida', 'cancelada'
  data_vencimento date not null,
  concluida_em timestamp with time zone,
  is_recorrente boolean default false,
  recorrencia_tipo text, -- 'diaria', 'semanal', 'mensal'
  recorrencia_config jsonb, -- configurações específicas da recorrência
  ordem integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Políticas RLS para tarefas
alter table public.tarefas enable row level security;

create policy "tarefas_select_own"
  on public.tarefas for select
  using (auth.uid() = user_id);

create policy "tarefas_insert_own"
  on public.tarefas for insert
  with check (auth.uid() = user_id);

create policy "tarefas_update_own"
  on public.tarefas for update
  using (auth.uid() = user_id);

create policy "tarefas_delete_own"
  on public.tarefas for delete
  using (auth.uid() = user_id);

-- Trigger para atualizar updated_at
create or replace function public.handle_updated_at_tarefas()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger on_tarefas_updated
  before update on public.tarefas
  for each row execute procedure public.handle_updated_at_tarefas();

-- Índices para melhor performance
create index if not exists idx_tarefas_user_data on public.tarefas(user_id, data_vencimento);
create index if not exists idx_tarefas_status on public.tarefas(status);
create index if not exists idx_tarefas_categoria on public.tarefas(categoria);

-- Inserir algumas tarefas de exemplo (opcional)
-- Uncomment to add sample tasks
/*
insert into public.tarefas (user_id, titulo, descricao, categoria, prioridade, data_vencimento) values
(auth.uid(), 'Revisar Direito Constitucional', 'Revisar capítulos 1-3 dos direitos fundamentais', 'estudo', 'alta', current_date),
(auth.uid(), 'Resolver exercícios de Matemática Financeira', 'Lista de exercícios sobre juros compostos', 'estudo', 'media', current_date),
(auth.uid(), 'Agendar consulta médica', 'Check-up anual', 'pessoal', 'baixa', current_date + interval '3 days');
*/