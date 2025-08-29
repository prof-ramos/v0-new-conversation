# 📊 PRD - Dashboard Pessoal de Estudos e Produtividade

---

## 🎯 **1. VISÃO GERAL**

### **Produto:** Dashboard Pessoal de Estudos e Produtividade
### **Versão:** 2.0 (Estado Atual: Fases 1-6 implementadas)
### **Owner:** Gabriel Ramos
### **Data:** 27 de agosto de 2025

---

## 📋 **2. RESUMO EXECUTIVO**

### **2.1 Problema**
A preparação para concursos públicos e gestão de produtividade pessoal exigem controle rigoroso de tempo, progresso de estudos e tarefas diárias. Ferramentas genéricas não atendem às necessidades específicas de:
- Acompanhamento detalhado de progresso por matéria/tópico do edital
- Controle de tempo de estudo com cronômetro integrado
- Gestão de tarefas diárias com estimativas de tempo
- Analytics detalhados de produtividade e evolução

### **2.2 Solução**
Dashboard web personalizado que unifica:
- **Sistema de estudos:** cronômetro, seleção de matérias/tópicos, tracking automático
- **Checklist do edital:** progresso visual por disciplina (17 matérias, centenas de tópicos)
- **Analytics avançados:** gráficos de evolução, heatmaps, distribuição por matéria
- **Tarefas diárias:** gestão com tags de tempo, filtros inteligentes, progresso do dia
- **Autenticação segura:** proteção de dados pessoais

### **2.3 Objetivos de Negócio**
- **Produtividade:** Aumentar eficiência nos estudos e tarefas pessoais
- **Visibilidade:** Ter controle total sobre progresso e tempo investido  
- **Motivação:** Gamificar o processo com métricas e visualizações
- **Dados:** Construir histórico para análise e otimização contínua

---

## 👤 **3. USUÁRIO ALVO**

### **3.1 Persona Principal**
**Gabriel Ramos - Estudante de Concurso Público**
- **Idade:** 25-35 anos
- **Perfil:** Profissional estudando para concurso público (ASOF/Ministério das Relações Exteriores)
- **Dispositivos:** MacBook Air M3, iPhone (uso secundário)
- **Comportamento:** Organizado, orientado a dados, busca controle total sobre progresso
- **Dores:** Falta de visibilidade sobre evolução, dificuldade em manter consistência, ausência de métricas confiáveis

### **3.2 Necessidades**
- Controlar tempo de estudo por matéria/tópico
- Visualizar progresso do edital em tempo real
- Gerenciar tarefas diárias além dos estudos
- Analisar padrões de produtividade ao longo do tempo
- Manter histórico completo para tomada de decisões

---

## ⚙️ **4. FUNCIONALIDADES ATUAIS (Fases 1-6)**

### **4.1 Sistema de Autenticação**
- **Login/Registro** via Supabase Auth
- **Proteção de rotas** com middleware Next.js
- **Row Level Security (RLS)** para isolamento de dados
- **Sessões persistentes** e logout seguro

### **4.2 Dashboard Principal**
- **KPIs centrais:** total de horas estudadas, sessões realizadas
- **Progresso geral:** percentual de conclusão do edital
- **Atalhos rápidos:** para todas as funcionalidades
- **Visão consolidada:** últimas sessões e tarefas

### **4.3 Sistema de Estudos**
- **Cronômetro integrado:** play/pause/stop com persistência
- **Seleção de matéria:** 17 disciplinas do edital ASOF
- **Seleção de tópico:** centenas de subtópicos organizados
- **Campo de observações:** insights e notas por sessão
- **Tracking automático:** progresso atualizado em tempo real

### **4.4 Checklist do Edital**
- **17 matérias organizadas:** 10 básicas + 7 específicas ASOF
- **Centenas de tópicos:** estrutura hierárquica expansível
- **Status visual:** não iniciado → em progresso → concluído
- **Percentual por matéria:** acompanhamento granular
- **Integração com estudos:** progresso automático baseado em sessões

### **4.5 Analytics Avançados**
- **Timeline de evolução:** progresso ao longo do tempo
- **Distribuição por matéria:** gráfico de barras comparativo
- **Heatmap de atividade:** padrões de estudo por dia/hora
- **Comparação de performance:** diferentes períodos
- **Filtros temporais:** última semana, mês, trimestre, ano

### **4.6 Histórico de Sessões**
- **Lista completa:** todas as sessões com detalhes
- **Filtros avançados:** por matéria, período, duração
- **Estatísticas:** tempo médio, sessões por dia, streaks
- **Observações:** registro de insights e progresso qualitativo

### **4.7 Sistema de Tarefas Diárias**
- **CRUD completo:** criar, editar, excluir, marcar como concluída
- **Tags de tempo:** 5, 10, 15, 20, 30, 45, 60 minutos
- **Seção especial:** tarefas rápidas (≤ 10min) destacadas
- **Categorias:** estudo, trabalho, pessoal, geral
- **Prioridades:** baixa, média, alta
- **Filtros inteligentes:** por tempo estimado, categoria, prioridade
- **Tarefas atrasadas:** destaque visual para pendências
- **Progress do dia:** percentual de conclusão em tempo real
- **Interface colorida:** cores por categoria e tempo estimado

---

## 🏗️ **5. ARQUITETURA TÉCNICA**

### **5.1 Stack Tecnológica**
```
Frontend:
├── Next.js 15 (App Router)
├── React 19 (Latest)
├── TypeScript (Type Safety)
├── Tailwind CSS (Styling)
└── shadcn/ui + Radix UI (Components)

Backend:
├── Supabase (BaaS)
├── PostgreSQL (Database)
├── Row Level Security (RLS)
└── Real-time subscriptions

Infrastructure:
├── Vercel (Deployment)
├── GitHub (Version Control)
└── Environment Variables (Configuration)
```

### **5.2 Modelo de Dados**
```sql
-- 5 Tabelas principais
profiles          (user profiles)
materias         (17 subjects)
topicos          (hundreds of topics)
progresso_usuario (user progress by topic)
sessoes_estudo   (study sessions)
tarefas          (daily tasks)

-- Relacionamentos
User 1:N Sessions
User 1:N Tasks  
User 1:N Progress
Topic 1:N Progress
Topic 1:N Sessions
```

### **5.3 Estrutura do Projeto**
```
/app/                 (Next.js 15 App Router)
├── dashboard/        (Main dashboard)
├── study-session/    (Study timer)
├── checklist/        (Edital progress)
├── analytics/        (Charts & insights)
├── study-history/    (Session history)
├── tasks/           (Daily task management)
└── auth/            (Login/register)

/components/         (Reusable UI components)
├── ui/             (shadcn/ui components)
├── dashboard/      (Dashboard widgets)
├── study/          (Study-related components)
├── analytics/      (Chart components)
└── tasks/          (Task management)

/lib/               (Utilities & configuration)
├── supabase/       (Database client)
├── utils/          (Helper functions)
└── logger/         (Logging system)

/scripts/           (Database setup)
└── *.sql           (Table creation & data population)
```

---

## 📊 **6. MÉTRICAS E KPIs**

### **6.1 Métricas de Estudo**
- **Tempo total estudado:** horas acumuladas
- **Sessões realizadas:** contagem total de sessões
- **Média de tempo por sessão:** consistência de estudo
- **Progresso do edital:** % de tópicos concluídos
- **Distribuição por matéria:** tempo investido por disciplina
- **Streaks de estudo:** dias consecutivos estudando

### **6.2 Métricas de Tarefas**
- **Taxa de conclusão diária:** % de tarefas concluídas
- **Tempo médio por tarefa:** eficiência nas execuções
- **Distribuição por categoria:** foco em diferentes áreas
- **Tarefas atrasadas:** controle de pendências
- **Tarefas rápidas concluídas:** produtividade em micro-tarefas

### **6.3 Métricas de Produtividade**
- **Horas produtivas por dia:** tendência temporal
- **Padrões de atividade:** horários mais produtivos
- **Comparação semanal/mensal:** evolução de performance
- **Correlação estudo vs tarefas:** balance between activities

---

## 🚀 **7. ROADMAP FUTURO**

### **7.1 Próximas Implementações (Fase 7)**
**Integração com n8n - Automações Externas**
- Webhooks para eventos de estudo e tarefas
- Notificações automáticas para Slack/Discord
- Sincronização com Google Calendar
- Relatórios automáticos via email

### **7.2 Evoluções Médio Prazo (Fase 8)**
**Relatórios e Exportação**
- Relatórios PDF mensais de progresso
- Exportação de dados para Excel/CSV
- Relatórios personalizáveis por matéria
- Comparação de desempenho entre períodos

### **7.3 Visão de Longo Prazo (Fases 9-10)**
**Gamificação e Integrações**
- Sistema de badges e conquistas
- Metas diárias/semanais automáticas
- Integração com Notion, Anki, Trello
- API pública para extensibilidade
- Sistema de lembretes inteligentes

---

## 🎨 **8. DESIGN E UX**

### **8.1 Princípios de Design**
- **Minimalismo:** Interface limpa e focada
- **Responsividade:** Funcional em desktop e mobile
- **Consistência:** Padrões visuais unificados via shadcn/ui
- **Acessibilidade:** Contraste adequado, navegação por teclado
- **Performance:** Carregamento rápido, otimização de bundles

### **8.2 Tema e Branding**
- **Paleta de cores:** Dark/Light mode automático
- **Typography:** Geist Sans (clean, modern)
- **Componentes:** shadcn/ui + Radix UI (accessible)
- **Iconografia:** Lucide React (consistent icons)
- **Layout:** Grid-based, responsive breakpoints

### **8.3 Fluxos Principais**
```
1. Login → Dashboard → Visão geral
2. Dashboard → Study Session → Timer → Save
3. Dashboard → Checklist → Mark Progress
4. Dashboard → Analytics → View Charts
5. Dashboard → Tasks → Create → Manage → Complete
6. Dashboard → History → Filter → Review
```

---

## 🔒 **9. SEGURANÇA E PRIVACIDADE**

### **9.1 Autenticação**
- **Supabase Auth:** Email/password seguro
- **JWT tokens:** Gerenciados automaticamente
- **Session management:** Timeout e refresh automático
- **Password policies:** Validação no client/server

### **9.2 Autorização**
- **Row Level Security (RLS):** Isolamento por usuário
- **Middleware protection:** Rotas protegidas no Next.js
- **API security:** Validação de tokens em todas as requests
- **Data isolation:** Cada usuário acessa apenas seus dados

### **9.3 Privacidade**
- **Dados pessoais:** Armazenados exclusivamente no Supabase
- **LGPD compliance:** Controle total sobre dados próprios
- **No tracking:** Sem analytics externos ou cookies de terceiros
- **Local-first:** Dados processados localmente quando possível

---

## 📈 **10. CRITÉRIOS DE SUCESSO**

### **10.1 Métricas de Adoção**
- **Uso diário:** Dashboard acessado 5+ dias por semana
- **Sessões de estudo:** 2+ sessões registradas por dia de estudo
- **Taxa de conclusão:** 80%+ de tarefas diárias concluídas
- **Engajamento:** Analytics consultados semanalmente

### **10.2 Métricas de Performance**
- **Load time:** < 2s para primeira carga
- **Time to interactive:** < 1s para interações
- **Uptime:** 99.9% de disponibilidade
- **Mobile usability:** Funcional em dispositivos móveis

### **10.3 Métricas de Qualidade**
- **Bug rate:** < 1 bug crítico por mês
- **Data integrity:** 100% de consistência nos dados
- **Backup reliability:** Dados seguros no Supabase
- **User satisfaction:** Uso contínuo e melhorias incrementais

---

## 🛠️ **11. OPERAÇÃO E MANUTENÇÃO**

### **11.1 Deploy e CI/CD**
- **Vercel integration:** Deploy automático via GitHub
- **Environment variables:** Configuração segura de secrets
- **Preview deployments:** Teste de branches antes do merge
- **Rollback capability:** Reversão rápida em caso de problemas

### **11.2 Monitoring**
- **Error tracking:** Console logs estruturados
- **Performance monitoring:** Core Web Vitals
- **Database health:** Queries e performance no Supabase
- **User feedback:** Sistema de logging interno

### **11.3 Backup e Recovery**
- **Supabase backup:** Backup automático diário
- **Code versioning:** Git history completo
- **Database migrations:** Versionamento de schema
- **Disaster recovery:** Plano de recuperação documentado

---

## 💰 **12. CUSTOS E ROI**

### **12.1 Custos Operacionais**
```
Vercel (Hobby): $0/mês
Supabase (Free tier): $0/mês  
GitHub (Free): $0/mês
Domain (opcional): ~$12/ano

Total: $0-12/ano 🎯
```

### **12.2 ROI Esperado**
- **Produtividade:** +30% eficiência em estudos
- **Organização:** +50% controle sobre tarefas
- **Insights:** Decisões baseadas em dados reais
- **Motivação:** Gamificação através de métricas
- **Tempo economizado:** Eliminação de ferramentas múltiplas

---

## 📋 **13. PRÓXIMOS PASSOS**

### **13.1 Imediato (1-2 semanas)**
- [ ] Implementar integração com n8n (Fase 7)
- [ ] Documentar API endpoints para webhooks
- [ ] Testar automações básicas

### **13.2 Curto Prazo (1-2 meses)**
- [ ] Sistema de relatórios em PDF
- [ ] Exportação de dados históricos
- [ ] Melhorias de UX baseadas no uso

### **13.3 Médio Prazo (3-6 meses)**
- [ ] Sistema de gamificação
- [ ] Integrações externas (Calendar, Notion)
- [ ] API pública para extensibilidade

---

## 🎯 **14. CONCLUSÃO**

O **Dashboard Pessoal de Estudos e Produtividade** representa uma solução completa e personalizada para gestão de estudos e tarefas pessoais. Com **6 fases já implementadas**, o sistema oferece:

- ✅ **Controle total** sobre tempo e progresso de estudos
- ✅ **Visibilidade completa** através de analytics detalhados  
- ✅ **Gestão eficiente** de tarefas diárias com filtros inteligentes
- ✅ **Interface moderna** e responsiva
- ✅ **Dados seguros** com isolamento por usuário

As próximas fases focarão em **automações**, **relatórios avançados** e **integrações externas**, expandindo ainda mais o valor e utilidade da plataforma.

**Status Atual:** ✅ **MVP COMPLETO E FUNCIONAL**  
**Próximo Marco:** 🚀 **Integração com n8n (Fase 7)**

---

*Documento criado em 27/08/2025 | Versão 2.0 | Gabriel Ramos*