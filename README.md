# Study Dashboard

Dashboard de estudos e tarefas, desenvolvido de forma incremental e testado a cada fase.  
Objetivo: oferecer um painel simples e poderoso para acompanhar progresso no edital, evolução dos estudos e rotina diária.

## 🚀 Stack
- **Frontend:** React + Vite
- **Estilo:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth + Postgres)
- **Deploy:** Vercel
- **Automação:** Integração via Webhooks → n8n

## 📂 Estrutura de pastas

/docs/specs/         -> anotações e decisões
/supabase/migrations -> arquivos SQL
/src/app/            -> rotas/pages
/src/components/     -> ui
/src/features/       -> dashboard, syllabus, timeline, tasks
/src/lib/            -> supabase client
/public/             -> estáticos

## 🔑 Variáveis de ambiente
Copiar `.env.example` para `.env.local` e preencher:
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## 🧑‍💻 Como rodar
```bash
pnpm install
pnpm dev
```

## ✅ Roadmap

O desenvolvimento segue em fases incrementais.  
Cada fase só começa após a anterior estar concluída, testada e aprovada.

Confira o ROADMAP.md.

