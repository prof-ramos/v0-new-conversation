# Study Dashboard

Aplicação web para organizar estudos e tarefas, com fluxo de autenticação, checklist do edital e gestão de tarefas diárias. Desenvolvido de forma incremental com testes automatizados.

## 🚀 Stack
- Frontend: Next.js 15 (App Router) + React 18 + TypeScript
- UI: Tailwind CSS 4 + shadcn/ui + Radix UI + Geist
- Backend: Supabase (Auth + Postgres)
- Testes: Jest (unitários) + Playwright (E2E)
- Qualidade: ESLint (config Next)

## 📂 Estrutura de pastas

`/app/`               → rotas (App Router)
`/components/`        → componentes de UI e blocos de página
`/hooks/`             → hooks de estado, validação e erros
`/lib/`               → utilitários (logger, validações, supabase, health-check)
`/e2e-tests/`         → testes E2E (Playwright)
`/tests/`             → testes unitários/integrados (Jest/RTL)
`/docs/`              → documentação funcional e técnica
`/public/`            → estáticos
`middleware.ts`       → proteção de rotas/autenticação

## 🔧 Pré-requisitos
- Node.js 18+ (recomendado 20+)
- pnpm 8+

## 🔑 Variáveis de ambiente
Copie `.env.example` para `.env.local` e preencha:
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 🧑‍💻 Como rodar localmente
```bash
pnpm install
pnpm dev
# abrir http://localhost:3000
```

Login disponível em `/auth/login` (Supabase Auth). Algumas rotas exigem sessão autenticada.

## 🧪 Testes
- Unitários: `pnpm test`
- E2E (Playwright):
  - Instalar browsers (uma vez): `pnpm exec playwright install`
  - Headless: `pnpm run test:e2e`
  - Headed (navegador visível): `pnpm run test:e2e:headed`
  - UI runner: `pnpm run test:e2e:ui`
  - Relatório: `pnpm run test:e2e:report` (abre `playwright-report/`)

## 🧹 Linting
```bash
pnpm lint
```

## 📚 Documentação
- Visão geral e arquitetura: `docs/README.md` e `docs/architecture/README.md`
- Logs e análises de correções: diretório `logs/`

## ✅ Roadmap
O desenvolvimento segue em fases incrementais; cada fase só inicia após testes e validações da anterior. Consulte `ROADMAP.md`.
