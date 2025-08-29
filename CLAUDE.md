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

## Enterprise Development Standards

### Error Handling & Resilience
**ALWAYS implement comprehensive error handling in production applications:**
- **Error Mapping**: Create intelligent error mapping systems (14+ error types minimum)
- **User Feedback**: Provide contextual, actionable error messages with clear next steps  
- **Retry Logic**: Implement exponential backoff with jitter for database/API operations
- **Logging**: Structure logs with multiple levels (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- **Graceful Degradation**: Never leave users in broken states - always provide recovery paths

### Validation & Data Integrity
**Implement multi-layer validation for all user inputs:**
- **Schema Validation**: Use Zod schemas consistently across frontend/backend
- **Real-time Validation**: Debounced field validation (500ms) with visual feedback
- **Type Safety**: Leverage TypeScript strictly - avoid `any` types
- **Sanitization**: Always sanitize user inputs before database operations
- **Constraint Enforcement**: Database-level constraints + application-level validation

### User Experience (UX) Excellence
**Prioritize user experience in every interaction:**
- **Loading States**: Contextual loading messages for specific operations
- **Auto-save**: Implement auto-save with visual indicators and recovery
- **Feedback Loops**: Immediate visual feedback for all user actions
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Accessibility**: Follow WCAG guidelines, semantic HTML, proper ARIA labels

### Performance & Monitoring
**Build for performance and observability from day one:**
- **Health Monitoring**: Implement proactive system health checks
- **Performance Metrics**: Track and log response times, error rates
- **Caching Strategy**: Implement intelligent caching with proper invalidation
- **Bundle Optimization**: Code splitting, lazy loading, tree shaking
- **Database Optimization**: Query optimization, proper indexing, connection pooling

### Testing & Quality Assurance
**Comprehensive testing strategy is non-negotiable:**
- **E2E Testing**: Playwright/Cypress for critical user journeys
- **Unit Testing**: Jest/Vitest for business logic and utilities
- **Integration Testing**: Test API endpoints and database interactions
- **Visual Testing**: Screenshot testing for UI consistency
- **Performance Testing**: Load testing for critical paths

### Development Practices
**Follow these practices for maintainable, scalable code:**
- **Hook-based Architecture**: Create reusable custom hooks for business logic
- **Component Composition**: Prefer composition over inheritance
- **Separation of Concerns**: Clear separation between UI, business logic, and data
- **Documentation**: Comprehensive README, API docs, architectural decisions
- **Code Reviews**: Mandatory reviews with focus on security, performance, UX

### Security & Compliance
**Security must be built-in, not bolted-on:**
- **Authentication**: Proper JWT handling, secure session management
- **Authorization**: Row Level Security (RLS), role-based access control
- **Data Protection**: Encrypt sensitive data, secure API endpoints
- **Input Validation**: Prevent XSS, SQL injection, CSRF attacks
- **Audit Trails**: Log all critical operations for compliance

### Problem-Solving Methodology
**When debugging issues, follow this systematic approach:**
1. **Root Cause Analysis**: Look beyond symptoms to find underlying issues
2. **User Impact Assessment**: Understand how issues affect real users
3. **Technical Audit**: Document findings comprehensively before fixing
4. **Implementation Strategy**: Plan fixes with minimal disruption
5. **Validation**: Test thoroughly before deploying to production

### Code Organization Principles
**Maintain clean, discoverable code structure:**
- **Feature-based Organization**: Group related files by business domain
- **Consistent Naming**: Use descriptive, consistent naming conventions
- **Barrel Exports**: Use index files for clean imports
- **Utility Libraries**: Create reusable utilities and helpers
- **Configuration Management**: Centralize configuration, environment handling

## Implementation Guidelines

### Pre-Implementation Analysis
**Before implementing any feature or fix:**
1. **Technical Audit**: Document current state, identify root causes
2. **Impact Assessment**: Understand user pain points and business impact  
3. **Solution Design**: Plan comprehensive solution addressing all aspects
4. **Risk Analysis**: Identify potential breaking changes or side effects

### Implementation Approach  
**Follow systematic implementation process:**
1. **Infrastructure First**: Error handling, logging, monitoring systems
2. **Core Logic**: Business logic with proper validation and testing
3. **User Interface**: Intuitive UI with proper feedback and states
4. **Integration**: Seamless integration with existing systems
5. **Documentation**: Comprehensive documentation for maintainability

### Quality Validation
**Every implementation must pass these checks:**
- **✅ Build Success**: Production build completes without errors
- **✅ Type Safety**: TypeScript compilation with strict mode
- **✅ Test Coverage**: Unit, integration, and E2E tests passing  
- **✅ Performance**: No degradation in key metrics
- **✅ UX Validation**: User flows tested and optimized
- **✅ Security Review**: No security vulnerabilities introduced
- **✅ Accessibility**: WCAG compliance maintained

### Deployment Standards
**Production deployment requirements:**
- **Health Checks**: System monitoring confirms all services healthy
- **Rollback Plan**: Clear rollback strategy for any issues
- **Monitoring**: Enhanced monitoring during and after deployment
- **User Communication**: Clear communication for any user-facing changes
- **Performance Baseline**: Establish and monitor performance benchmarks

### Continuous Improvement
**Maintain excellence through continuous improvement:**
- **Metrics Collection**: Collect and analyze user behavior and performance data
- **Feedback Loops**: Regular user feedback collection and analysis
- **Technical Debt**: Regular technical debt assessment and reduction
- **Knowledge Sharing**: Document learnings and best practices
- **Process Refinement**: Continuously improve development and deployment processes

## Key Success Metrics

### Technical Excellence
- **Error Rate**: < 2% for critical operations
- **Response Time**: < 200ms for UI interactions, < 2s for API calls
- **Uptime**: > 99.9% availability
- **Build Time**: < 5 minutes for full CI/CD pipeline
- **Test Coverage**: > 80% for critical business logic

### User Experience  
- **User Satisfaction**: > 4.5/5 rating
- **Task Completion Rate**: > 95% for critical user journeys
- **Support Tickets**: < 5% related to UX confusion
- **Feature Adoption**: > 70% adoption rate for new features
- **User Retention**: Positive month-over-month growth

### Development Velocity
- **Feature Lead Time**: < 2 weeks from concept to production
- **Bug Resolution**: < 24 hours for critical bugs, < 1 week for standard bugs
- **Code Review Time**: < 24 hours average review turnaround
- **Deployment Frequency**: Daily deployments without issues
- **Developer Satisfaction**: High team satisfaction with development processes