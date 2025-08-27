# Roadmap de Desenvolvimento

## Fase 1 – Estrutura Base
**Objetivo:** App React no ar, conectado ao Supabase e deploy na Vercel.
- [ ] Configuração do projeto (Vite + React + Tailwind + shadcn)
- [ ] Supabase client conectado
- [ ] Deploy inicial na Vercel
**Aceite:** App acessível em produção com login funcionando.

---

## Fase 2 – Indicadores Básicos
**Objetivo:** Registrar sessões e visualizar números iniciais.
- [ ] Formulário "Nova sessão" (disciplina, atividade, duração, páginas, questões, acertos)
- [ ] Indicadores principais: horas totais, questões respondidas, % de acertos
- [ ] Persistência no Supabase
**Aceite:** Criar sessão → indicadores atualizam.

---

## Fase 3 – Controle de Matérias (Edital)
**Objetivo:** Checklist do edital, porcentagem por disciplina e total.
- [ ] Upload/importação do edital (CSV/JSON)
- [ ] Checklist de tópicos
- [ ] Cálculo de % por matéria e % total
**Aceite:** Marcar tópico → progresso atualizado.

---

## Fase 4 – Linha do Tempo
**Objetivo:** Evolução diária/semanal de estudos.
- [ ] Agregação de sessões por dia/semana
- [ ] Gráfico de evolução
**Aceite:** Gráfico reflete dados corretamente com filtros de período.

---

## Fase 5 – Refinamentos
**Objetivo:** Melhorias de análise e UX.
- [ ] Filtros (disciplina, categoria, turno)
- [ ] Comparativos entre estudo × revisão × exercícios
- [ ] Notas/insights por sessão
**Aceite:** Fluxo fluido, indicadores confiáveis.

---

## Fase 6 – Tarefas Diárias
**Objetivo:** Controle da rotina além dos estudos.
- [ ] Lista de tarefas do dia (criar, editar, excluir)
- [ ] Tarefas recorrentes / sugestões automáticas
- [ ] Percentual de conclusão do dia em tempo real
**Aceite:** Marcar tarefas → progresso diário reflete corretamente.

---

## Fase 7 – Integração com n8n
**Objetivo:** Permitir automações externas.
- [ ] Webhooks para eventos: criação/conclusão de tarefa e sessão
- [ ] Documentação de endpoints
**Aceite:** Eventos disparam corretamente e chegam ao n8n.

