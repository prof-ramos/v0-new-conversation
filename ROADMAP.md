# Roadmap de Desenvolvimento

## Fase 1 – Estrutura Base ✅ CONCLUÍDA
**Objetivo:** App React no ar, conectado ao Supabase e deploy na Vercel.
- [x] Configuração do projeto (Next.js + React + Tailwind + shadcn)
- [x] Supabase client conectado (browser e server)
- [x] Deploy inicial na Vercel
- [x] Sistema de autenticação completo (login/registro)
- [x] Middleware para proteção de rotas
- [x] Row Level Security (RLS) configurado
**Aceite:** App acessível em produção com login funcionando. ✅

---

## Fase 2 – Indicadores Básicos ✅ CONCLUÍDA
**Objetivo:** Registrar sessões e visualizar números iniciais.
- [x] Interface de sessão de estudo com cronômetro
- [x] Seleção de matéria e tópico
- [x] Controles de play/pause/stop
- [x] Campo para observações da sessão
- [x] Indicadores básicos no dashboard (horas totais, sessões)
- [x] Persistência no Supabase com tabelas estruturadas
- [x] Atualização automática de progresso por tópico
**Aceite:** Criar sessão → indicadores atualizam. ✅

---

## Fase 3 – Controle de Matérias (Edital) ✅ CONCLUÍDA
**Objetivo:** Checklist do edital, porcentagem por disciplina e total.
- [x] Estrutura de dados com 17 matérias (10 básicas + 7 específicas)
- [x] Centenas de tópicos organizados por matéria
- [x] Interface de checklist interativa e expansível
- [x] Cálculo de % por matéria e status visual
- [x] Sistema de progresso: não iniciado → em progresso → concluído
- [x] Integração com sessões de estudo
**Aceite:** Marcar tópico → progresso atualizado. ✅

---

## Fase 4 – Linha do Tempo ✅ CONCLUÍDA
**Objetivo:** Evolução diária/semanal de estudos.
- [x] Página de Analytics completa com múltiplos gráficos
- [x] Timeline chart mostrando evolução temporal
- [x] Distribuição de estudo por matéria
- [x] Heatmap de atividade de estudos
- [x] Evolução do progresso ao longo do tempo
- [x] Comparação de performance por categoria
**Aceite:** Gráfico reflete dados corretamente com filtros de período. ✅

---

## Fase 5 – Refinamentos ✅ CONCLUÍDA
**Objetivo:** Melhorias de análise e UX.
- [x] Página de histórico de sessões detalhada
- [x] Estatísticas consolidadas por período
- [x] Interface intuitiva e responsiva
- [x] Navegação completa entre todas as funcionalidades
- [x] Sistema de observações/insights por sessão
- [x] Controles de progresso manual nos tópicos
- [x] Interface moderna com shadcn/ui
**Aceite:** Fluxo fluido, indicadores confiáveis. ✅

---

## Fase 6 – Tarefas Diárias ✅ CONCLUÍDA
**Objetivo:** Controle da rotina além dos estudos.
- [x] Lista de tarefas do dia (criar, editar, excluir)
- [x] Sistema de tags de tempo estimado (5, 10, 15, 20, 30, 45, 60min)
- [x] Seção especial para tarefas rápidas (≤ 10min)
- [x] Filtros por tempo estimado
- [x] Categorias (estudo, trabalho, pessoal, geral)
- [x] Prioridades (baixa, média, alta)
- [x] Tarefas atrasadas em destaque
- [x] Percentual de conclusão do dia em tempo real
- [x] Interface intuitiva com cores por tempo/categoria
**Aceite:** Marcar tarefas → progresso diário reflete corretamente. ✅

---

## Fase 7 – Integração com n8n ⏳ PENDENTE
**Objetivo:** Permitir automações externas.
- [ ] Webhooks para eventos: criação/conclusão de tarefa e sessão
- [ ] Documentação de endpoints
**Aceite:** Eventos disparam corretamente e chegam ao n8n.

---

## Fase 8 – Relatórios e Exportação 🚀 FUTURO
**Objetivo:** Gerar relatórios detalhados e exportar dados.
- [ ] Relatórios em PDF/Excel do progresso mensal
- [ ] Exportação de histórico de sessões
- [ ] Relatórios de produtividade por período
- [ ] Comparação de desempenho entre períodos
- [ ] Relatórios personalizáveis por matéria
**Aceite:** Relatórios gerados corretamente com dados atualizados.

---

## Fase 9 – Gamificação e Metas 🚀 FUTURO
**Objetivo:** Aumentar engajamento com elementos de gamificação.
- [ ] Sistema de streaks e recompensas
- [ ] Badges por conquistas
- [ ] Sistema de metas diárias/semanais
- [ ] Ranking de produtividade (opcional)
- [ ] Notificações e lembretes personalizados
**Aceite:** Sistema de gamificação funcional e motivador.

---

## Fase 10 – Integrações Externas 🚀 FUTURO
**Objetivo:** Conectar com outras ferramentas e serviços.
- [ ] Integração com Google Calendar
- [ ] Sincronização com Notion/Trello
- [ ] Exportação para planilhas Google Sheets
- [ ] Integração com sistemas de flashcards (Anki)
- [ ] API pública para desenvolvedores
**Aceite:** Integrações funcionais e seguras.

---

## Status do Projeto 🎯

### ✅ **IMPLEMENTADO (Fases 1-6)**
- **Sistema completo de estudo** com cronômetro e tracking
- **Dashboard interativo** com KPIs e estatísticas
- **Checklist do edital** com 17 matérias e centenas de tópicos
- **Analytics avançado** com múltiplos gráficos e insights
- **Histórico detalhado** de todas as sessões
- **Sistema de tarefas diárias** com tags de tempo e filtros inteligentes
- **Autenticação segura** com Supabase Auth
- **Interface moderna** com shadcn/ui e Tailwind
- **Deploy funcional** na Vercel

### ⏳ **PRÓXIMAS FASES**
- Integração com n8n para automações (Fase 7)

### 🚀 **FUTURO**
- Relatórios e exportação de dados (Fase 8)
- Gamificação e sistema de metas (Fase 9)
- Integrações externas (Fase 10)

### 🛠️ **RECURSOS TÉCNICOS**
- **Frontend:** Next.js 15 + React 19 + TypeScript
- **UI:** shadcn/ui + Tailwind CSS + Radix UI  
- **Backend:** Supabase (Auth + PostgreSQL)
- **Deploy:** Vercel
- **Database:** 5 tabelas com RLS configurado

