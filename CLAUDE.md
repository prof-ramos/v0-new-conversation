# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Este é um dashboard de estudos e tarefas desenvolvido incrementalmente. O objetivo é oferecer um painel para acompanhar progresso no edital, evolução dos estudos e rotina diária.

## Tech Stack

- **Frontend:** Next.js 15 + React 19 + TypeScript
- **UI Framework:** shadcn/ui + Tailwind CSS + Radix UI
- **Backend:** Supabase (Auth + PostgreSQL)
- **Font:** Geist Sans/Mono
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod

## Common Commands

```bash
# Development
pnpm install        # Install dependencies  
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm start         # Start production server
pnpm lint          # Run ESLint

# Database setup
# Execute scripts in /scripts/ directory in Supabase SQL editor in numerical order
```

## Architecture

### Database Schema
O projeto usa Supabase com as seguintes tabelas principais:
- `profiles` - Perfis de usuário
- `materias` - Matérias do edital
- `topicos` - Tópicos por matéria
- `progresso_usuario` - Progresso nos tópicos
- `sessoes_estudo` - Sessões de estudo registradas

### Project Structure
```
/app/                  # Next.js App Router pages
  /analytics/          # Página de analytics
  /auth/              # Páginas de autenticação  
  /checklist/         # Checklist do edital
  /dashboard/         # Dashboard principal
  /study-session/     # Interface de sessão de estudo
  /study-history/     # Histórico de estudos
/components/          # Componentes React organizados por feature
  /ui/               # Componentes base do shadcn/ui
/lib/                # Utilitários
  /supabase/         # Cliente e configuração Supabase
/scripts/            # Scripts SQL para setup do banco
```

### Development Approach
O desenvolvimento segue fases incrementais definidas no ROADMAP.md:
1. Estrutura Base
2. Indicadores Básicos  
3. Controle de Matérias
4. Linha do Tempo
5. Refinamentos
6. Tarefas Diárias
7. Integração com n8n

### Environment Variables
Configurar no `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

### Import Aliases
O projeto usa o alias `@/*` que mapeia para o diretório raiz.

### UI Components
Todos os componentes UI seguem o padrão shadcn/ui com Radix UI como base e são estilizados com Tailwind CSS.