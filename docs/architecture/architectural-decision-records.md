# Architecture Decision Records (ADRs)

Este documento mantém o registro histórico das principais decisões arquiteturais tomadas durante o desenvolvimento do Dashboard de Estudos.

## Índice

1. [Template de ADR](#template-de-adr)
2. [ADR-001: Framework Frontend](#adr-001-framework-frontend)
3. [ADR-002: Backend as a Service (BaaS)](#adr-002-backend-as-a-service-baas)
4. [ADR-003: Sistema de UI/UX](#adr-003-sistema-de-uiux)
5. [ADR-004: Gerenciamento de Estado](#adr-004-gerenciamento-de-estado)
6. [ADR-005: Arquitetura de Banco de Dados](#adr-005-arquitetura-de-banco-de-dados)
7. [ADR-006: Estratégia de Deploy](#adr-006-estratégia-de-deploy)
8. [ADR-007: Sistema de Autenticação](#adr-007-sistema-de-autenticação)
9. [ADR-008: Estratégia de Testing](#adr-008-estratégia-de-testing)
10. [ADR-009: Monitoramento e Logging](#adr-009-monitoramento-e-logging)

## Template de ADR

```markdown
# ADR-XXX: [Título da Decisão]

**Status**: [Proposto | Aceito | Rejeitado | Deprecado | Superseded]  
**Data**: YYYY-MM-DD  
**Decisores**: [Lista de pessoas envolvidas]  
**Tags**: [tecnologia, performance, security, etc.]

## Contexto e Problema

Descreva o contexto arquitetural e o problema que motiva essa decisão.

## Fatores de Decisão

* Fator 1
* Fator 2
* ...

## Opções Consideradas

* Opção 1
* Opção 2
* ...

## Decisão

Escolha da opção X, porque [razão].

## Consequências Positivas

* Benefício 1
* Benefício 2
* ...

## Consequências Negativas

* Limitação 1
* Limitação 2
* ...

## Prós e Contras das Outras Opções

### Opção 1
* Prós: ...
* Contras: ...

### Opção 2
* Prós: ...
* Contras: ...

## Links e Referências

* [Link 1](url)
* [Link 2](url)
```

---

## ADR-001: Framework Frontend

**Status**: Aceito  
**Data**: 2024-07-15  
**Decisores**: Gabriel Ramos  
**Tags**: frontend, react, nextjs, performance

### Contexto e Problema

Necessidade de escolher um framework para desenvolvimento da interface do dashboard de estudos, considerando:
- Requisitos de SEO para possível compartilhamento de conteúdo
- Necessidade de performance otimizada
- Developer Experience moderna
- Suporte a TypeScript nativo
- Ecosystem maduro e bem documentado

### Fatores de Decisão

* Performance (SSR/SSG)
* SEO capabilities
* Developer Experience
* Ecossistema e comunidade
* Curva de aprendizado
* Integração com outras ferramentas
* Manutenibilidade a longo prazo

### Opções Consideradas

* Next.js 15 (com App Router)
* Vite + React
* Remix
* SvelteKit

### Decisão

Escolha do **Next.js 15 com App Router**, porque oferece o melhor equilíbrio entre performance, DX e funcionalidades out-of-the-box.

### Consequências Positivas

* ✅ Server-Side Rendering automático para melhor SEO
* ✅ Otimizações de performance integradas (Image, Font, Bundle)
* ✅ Roteamento baseado em sistema de arquivos intuitivo
* ✅ API Routes para endpoints customizados
* ✅ Suporte nativo ao TypeScript
* ✅ Deployment otimizado na Vercel
* ✅ Streaming e Suspense para loading states
* ✅ Comunidade ativa e documentação excelente

### Consequências Negativas

* ⚠️ Curva de aprendizado do App Router (ainda novo)
* ⚠️ Algumas funcionalidades ainda em beta
* ⚠️ Vendor lock-in parcial com padrões do Next.js
* ⚠️ Bundle size maior comparado a soluções mais minimalistas

### Prós e Contras das Outras Opções

#### Vite + React
* **Prós**: Build mais rápido, configuração flexível, bundle menor
* **Contras**: Sem SSR out-of-the-box, necessária configuração manual para SEO

#### Remix  
* **Prós**: Excelente UX, nested routing, data loading otimizado
* **Contras**: Ecossistema menor, menos recursos de deploy

#### SvelteKit
* **Prós**: Performance superior, bundle muito pequeno
* **Contras**: Ecossistema menor, menos recursos de UI libraries

### Links e Referências

* [Next.js 15 Documentation](https://nextjs.org/docs)
* [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)

---

## ADR-002: Backend as a Service (BaaS)

**Status**: Aceito  
**Data**: 2024-07-16  
**Decisores**: Gabriel Ramos  
**Tags**: backend, baas, database, auth, supabase

### Contexto e Problema

Para um MVP de dashboard de estudos, precisávamos de uma solução backend que permitisse desenvolvimento rápido sem comprometer escalabilidade e segurança:
- Autenticação segura e compliance
- Banco de dados relacional com queries complexas
- Real-time updates para melhor UX
- API REST automática
- Redução de overhead de DevOps

### Fatores de Decisão

* Velocidade de desenvolvimento
* Qualidade da autenticação
* Flexibilidade do banco de dados
* Recursos real-time
* Escalabilidade automática
* Pricing model
* Developer Experience
* Vendor lock-in risk

### Opções Consideradas

* Supabase (PostgreSQL + Auth + Real-time)
* Firebase (Firestore + Auth)
* AWS Amplify
* PlanetScale + Clerk
* Backend próprio (Node.js + PostgreSQL)

### Decisão

Escolha do **Supabase**, porque oferece PostgreSQL completo com excelente DX e funcionalidades real-time nativas.

### Consequências Positivas

* ✅ PostgreSQL completo com SQL queries complexas
* ✅ Autenticação robusta com JWT e RLS
* ✅ Real-time subscriptions out-of-the-box
* ✅ API REST automática baseada no schema
* ✅ Row Level Security (RLS) para segurança granular
* ✅ Dashboard admin intuitivo
* ✅ Migrations e versionamento do banco
* ✅ Edge Functions para lógica personalizada
* ✅ Pricing transparente e generoso tier gratuito

### Consequências Negativas

* ⚠️ Vendor lock-in moderado (mitigado por ser PostgreSQL padrão)
* ⚠️ Menos controle sobre infraestrutura
* ⚠️ Dependência de conectividade para desenvolvimento
* ⚠️ Limitações de customização comparado a backend próprio

### Prós e Contras das Outras Opções

#### Firebase
* **Prós**: Ecossistema Google, excelente real-time
* **Contras**: NoSQL limitante, queries complexas difíceis, pricing baseado em reads

#### AWS Amplify
* **Prós**: Integração completa AWS, escalabilidade infinita
* **Contras**: Complexidade alta, curva de aprendizado íngreme, pricing complexo

#### Backend Próprio
* **Prós**: Controle total, sem vendor lock-in
* **Contras**: Overhead de DevOps, tempo de desenvolvimento, necessidade de expertise em infraestrutura

### Links e Referências

* [Supabase Documentation](https://supabase.com/docs)
* [PostgreSQL vs NoSQL Comparison](https://blog.supabase.com/postgres-vs-mongodb)

---

## ADR-003: Sistema de UI/UX

**Status**: Aceito  
**Data**: 2024-07-17  
**Decisores**: Gabriel Ramos  
**Tags**: ui, design-system, accessibility, tailwind, shadcn

### Contexto e Problema

Necessidade de um sistema de design consistente e acessível que permita desenvolvimento rápido sem comprometer qualidade visual:
- Componentes reutilizáveis e consistentes
- Acessibilidade (a11y) por padrão
- Customização flexível para branding
- Suporte a dark mode
- TypeScript first
- Manutenibilidade a longo prazo

### Fatores de Decisão

* Qualidade dos componentes base
* Acessibilidade (WCAG compliance)
* Flexibilidade de customização
* Performance e bundle size
* Developer Experience
* Documentação e comunidade
* Integração com TypeScript

### Opções Consideradas

* shadcn/ui + Tailwind CSS + Radix UI
* Material-UI (MUI)
* Ant Design
* Chakra UI
* Tailwind UI + Headless UI

### Decisão

Escolha do **shadcn/ui + Tailwind CSS + Radix UI**, porque oferece a melhor combinação de qualidade, acessibilidade e flexibilidade.

### Consequências Positivas

* ✅ Componentes totalmente acessíveis (Radix UI base)
* ✅ Customização completa via Tailwind
* ✅ Copy-paste approach - sem dependencies pesadas
* ✅ TypeScript nativo em todos os componentes
* ✅ Design moderno e profissional
* ✅ Performance otimizada (tree-shaking)
* ✅ Dark mode integrado
* ✅ Mantido ativamente pela comunidade

### Consequências Negativas

* ⚠️ Necessário copiar e manter componentes localmente
* ⚠️ Curva de aprendizado do Tailwind CSS
* ⚠️ Setup inicial mais complexo
* ⚠️ Menos componentes pré-construídos comparado a libraries completas

### Prós e Contras das Outras Opções

#### Material-UI
* **Prós**: Componentes completos, ecosystem maduro, Google backing
* **Contras**: Bundle size grande, customização complexa, design opinions fortes

#### Ant Design
* **Prós**: Componentes business-ready, documentação excelente
* **Contras**: Estilo muito específico, difícil customização, bundle pesado

#### Chakra UI
* **Prós**: API simples, boa acessibilidade, modular
* **Contras**: Menos componentes, styling em runtime

### Links e Referências

* [shadcn/ui Documentation](https://ui.shadcn.com/)
* [Radix UI Primitives](https://www.radix-ui.com/primitives)
* [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## ADR-004: Gerenciamento de Estado

**Status**: Aceito  
**Data**: 2024-07-18  
**Decisores**: Gabriel Ramos  
**Tags**: state-management, react, context, forms

### Contexto e Problema

Definir estratégia de gerenciamento de estado para aplicação com diferentes necessidades:
- Estado local de componentes
- Estado de formulários com validação
- Estado global da aplicação
- Estado do servidor (cache, sync)
- Performance e re-renders

### Fatores de Decisão

* Simplicidade e learning curve
* Performance (evitar re-renders desnecessários)
* Developer Experience
* Debugging capabilities
* Bundle size impact
* Integração com TypeScript

### Opções Consideradas

* useState + Context API + React Hook Form
* Redux Toolkit + RTK Query
* Zustand
* Jotai
* Valtio

### Decisão

Escolha da **combinação useState + Context API + React Hook Form**, porque oferece simplicidade adequada para o escopo atual sem over-engineering.

### Consequências Positivas

* ✅ Solução nativa do React (sem dependencies extras)
* ✅ React Hook Form excelente para formulários complexos
* ✅ Context API suficiente para estado global limitado
* ✅ Performance adequada com memoization
* ✅ Debugging simples com React DevTools
* ✅ TypeScript integrado naturalmente

### Consequências Negativas

* ⚠️ Pode não escalar para aplicações muito complexas
* ⚠️ Context re-render pode afetar performance se mal usado
* ⚠️ Boilerplate manual para actions complexas
* ⚠️ Sem time-travel debugging

### Estratégia por Tipo de Estado

```typescript
// Estado local simples
const [isOpen, setIsOpen] = useState(false)

// Formulários
const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(schema)
})

// Estado global (auth, theme)
const AuthContext = createContext<AuthContextType>()

// Estado do servidor
// Supabase real-time subscriptions
```

### Prós e Contras das Outras Opções

#### Redux Toolkit
* **Prós**: Predictable state, excellent debugging, mature ecosystem
* **Contras**: Boilerplate, learning curve, overkill para aplicação atual

#### Zustand
* **Prós**: Minimal boilerplate, great TypeScript support
* **Contras**: Ainda relativamente novo, menos recursos de debugging

### Links e Referências

* [React Hook Form Documentation](https://react-hook-form.com/)
* [React Context API Best Practices](https://kentcdodds.com/blog/how-to-use-react-context-effectively)

---

## ADR-005: Arquitetura de Banco de Dados

**Status**: Aceito  
**Data**: 2024-07-19  
**Decisores**: Gabriel Ramos  
**Tags**: database, postgresql, rls, security, performance

### Contexto e Problema

Definir estrutura de banco de dados que suporte:
- Multi-tenancy seguro (usuários isolados)
- Queries complexas para analytics
- Escalabilidade horizontal
- Integridade referencial
- Performance otimizada

### Fatores de Decisão

* Segurança (isolamento entre usuários)
* Performance de queries
* Integridade dos dados
* Facilidade de manutenção
* Flexibilidade para futuras mudanças
* Backup e recovery

### Opções Consideradas

* PostgreSQL com Row Level Security
* Schemas separados por usuário
* Database por tenant
* NoSQL (documento por usuário)

### Decisão

Escolha do **PostgreSQL com Row Level Security (RLS)**, porque oferece o melhor equilíbrio entre segurança, performance e simplicidade operacional.

### Consequências Positivas

* ✅ Segurança automática via RLS policies
* ✅ Queries SQL complexas para analytics
* ✅ Integridade referencial com Foreign Keys
* ✅ Performance otimizada com índices apropriados
* ✅ Backup e recovery simplificados
* ✅ Suporte nativo no Supabase
* ✅ Políticas granulares de acesso

### Consequências Negativas

* ⚠️ Overhead mínimo de RLS em queries
* ⚠️ Políticas podem ser complexas para casos avançados
* ⚠️ Single point of failure (mitigado por backup)
* ⚠️ Necessidade de planejamento cuidadoso de índices

### Estrutura de Segurança

```sql
-- Exemplo de política RLS
CREATE POLICY "users_see_own_data"
  ON tasks FOR ALL
  USING (auth.uid() = user_id);
```

### Prós e Contras das Outras Opções

#### Schemas Separados
* **Prós**: Isolamento completo, sem overhead de RLS
* **Contras**: Complexidade operacional, queries cross-tenant difíceis

#### Database por Tenant  
* **Prós**: Isolamento máximo, escalabilidade individual
* **Contras**: Operações complexas, custo de manutenção alto

#### NoSQL
* **Prós**: Escalabilidade horizontal, flexibilidade de schema
* **Contras**: Sem joins nativos, consistência eventual, menos maturidade

### Links e Referências

* [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
* [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## ADR-006: Estratégia de Deploy

**Status**: Aceito  
**Data**: 2024-07-20  
**Decisores**: Gabriel Ramos  
**Tags**: deployment, vercel, ci-cd, performance

### Contexto e Problema

Definir estratégia de deployment que garanta:
- Deploy automático e confiável
- Performance otimizada globalmente
- Rollback rápido em caso de problemas
- Preview deployments para testing
- Configuração simples de CI/CD

### Fatores de Decisão

* Integração com Next.js
* Performance (Edge, CDN)
* Facilidade de configuração
* Preview environments
* Pricing model
* DX (logs, monitoring)

### Opções Consideradas

* Vercel (Platform-as-a-Service)
* Netlify
* AWS (ECS + CloudFront)
* Railway
* Self-hosted (VPS)

### Decisão

Escolha da **Vercel**, porque oferece integração nativa com Next.js e excelente developer experience.

### Consequências Positivas

* ✅ Deploy automático no git push
* ✅ Preview deployments para PRs
* ✅ Edge runtime para performance global
* ✅ Image optimization automática
* ✅ Analytics integrado
* ✅ Rollback em um clique
* ✅ Zero-config deployment
* ✅ Excellent logging e monitoring

### Consequências Negativas

* ⚠️ Vendor lock-in com padrões Vercel
* ⚠️ Pricing pode escalar com tráfego
* ⚠️ Menos controle sobre infraestrutura
* ⚠️ Cold start em serverless functions

### Configuração de Deploy

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["cle1", "sfo1"]
}
```

### Prós e Contras das Outras Opções

#### Netlify
* **Prós**: Boa integração com Git, edge functions
* **Contras**: Menos otimizado para Next.js, build limits

#### AWS
* **Prós**: Máximo controle, integração com outros serviços AWS
* **Contras**: Complexidade alta, necessita expertise DevOps

#### Self-hosted
* **Prós**: Controle total, custo fixo
* **Contras**: Overhead operacional, necessita expertise

### Links e Referências

* [Vercel Next.js Documentation](https://vercel.com/docs/frameworks/nextjs)
* [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

---

## ADR-007: Sistema de Autenticação

**Status**: Aceito  
**Data**: 2024-07-21  
**Decisores**: Gabriel Ramos  
**Tags**: auth, security, jwt, supabase

### Contexto e Problema

Implementar sistema de autenticação seguro que suporte:
- Login/registro com email/password
- Proteção de rotas
- Session management
- Security best practices
- Possível expansão para OAuth

### Fatores de Decisão

* Segurança (compliance, encryption)
* Developer Experience
* Flexibilidade para futuras expansões
* Integration com database (RLS)
* Manutenção e updates

### Opções Consideradas

* Supabase Auth (integrado)
* NextAuth.js
* Auth0
* Firebase Auth
* Implementação própria

### Decisão

Escolha do **Supabase Auth**, porque está integrado com a base de dados e oferece RLS nativo.

### Consequências Positivas

* ✅ Integração perfeita com RLS policies
* ✅ JWT tokens seguros com refresh automático
* ✅ Email/password + social providers ready
* ✅ User management dashboard
* ✅ Password reset integrado
* ✅ Rate limiting automático
* ✅ Compliance (SOC2, GDPR ready)

### Consequências Negativas

* ⚠️ Vendor lock-in com Supabase
* ⚠️ Menos customização comparado a soluções dedicadas
* ⚠️ Dependência de conectividade Supabase

### Implementação de Middleware

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient({
    req: request,
    res: new Response(),
  })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  return response
}
```

### Prós e Contras das Outras Opções

#### NextAuth.js
* **Prós**: Flexibilidade máxima, muitos providers, open source
* **Contras**: Setup mais complexo, necessita database adicional

#### Auth0
* **Prós**: Especialista em auth, muito completo
* **Contras**: Pricing alto, over-engineering para caso simples

### Links e Referências

* [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
* [Next.js Middleware Auth](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

---

## ADR-008: Estratégia de Testing

**Status**: Aceito  
**Data**: 2024-07-22  
**Decisores**: Gabriel Ramos  
**Tags**: testing, jest, playwright, quality

### Contexto e Problema

Definir estratégia de testing que garanta:
- Confiabilidade das features principais
- Prevenção de regressões
- Feedback rápido para desenvolvedores
- Coverage adequado sem over-testing

### Fatores de Decisão

* ROI de cada tipo de teste
* Feedback loop speed
* Manutenção dos testes
* CI/CD integration
* Developer Experience

### Opções Consideradas

* Jest + React Testing Library + Playwright
* Vitest + Testing Library + Cypress
* Jest only (unit tests)
* Playwright only (E2E)

### Decisão

Escolha da **combinação Jest + React Testing Library + Playwright**, seguindo a pirâmide de testes com foco nos testes mais valiosos.

### Consequências Positivas

* ✅ Unit tests rápidos para lógica de negócio
* ✅ Component tests para UI components
* ✅ E2E tests para user journeys críticos
* ✅ Integração nativa com Next.js
* ✅ Parallel execution no CI
* ✅ Visual regression testing (Playwright)

### Consequências Negativas

* ⚠️ Setup de múltiplas ferramentas
* ⚠️ Manutenção de diferentes tipos de teste
* ⚠️ Possível slow down do CI com E2E tests

### Estratégia por Camada

```
E2E Tests (Playwright)          🔺 poucos, caros, lentos
├─ Login flow                   
├─ Task creation
└─ Study session

Component Tests (RTL)           🔳 alguns, médio custo
├─ Form components
├─ Chart components  
└─ List components

Unit Tests (Jest)               🔳 muitos, baratos, rápidos
├─ Utility functions
├─ Hooks
└─ Business logic
```

### Configuração de Testes

```typescript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

// playwright.config.ts  
export default defineConfig({
  testDir: './e2e-tests',
  use: {
    baseURL: 'http://localhost:3000',
  },
})
```

### Links e Referências

* [Testing Next.js Applications](https://nextjs.org/docs/testing)
* [Playwright Documentation](https://playwright.dev/docs/intro)

---

## ADR-009: Monitoramento e Logging

**Status**: Aceito  
**Data**: 2024-07-23  
**Decisores**: Gabriel Ramos  
**Tags**: monitoring, logging, observability, vercel

### Contexto e Problema

Implementar observabilidade adequada para:
- Debug de problemas em produção
- Monitoring de performance
- Alertas para issues críticos  
- Analytics de uso

### Fatores de Decisão

* Simplicidade de setup
* Integração com stack existente
* Cost-effectiveness
* Real-time capabilities
* Privacy compliance

### Opções Consideradas

* Vercel Analytics + Console logs
* Sentry + Vercel Analytics
* LogRocket + Custom analytics
* DataDog (full observability)

### Decisão

Escolha do **Vercel Analytics + Structured Console Logs**, porque oferece observabilidade adequada para o estágio atual com mínima complexidade.

### Consequências Positivas

* ✅ Setup zero-config com Vercel
* ✅ Web Vitals monitoring automático
* ✅ Real User Monitoring (RUM)
* ✅ Structured logging para debugging
* ✅ Privacy-friendly analytics
* ✅ No impact na performance

### Consequências Negativas

* ⚠️ Logging limitado comparado a soluções dedicadas
* ⚠️ Sem alerting automático
* ⚠️ Analytics básico (sem funnels avançados)

### Implementação de Logging

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({ 
      level: 'info', 
      message, 
      timestamp: new Date().toISOString(),
      ...meta 
    }))
  },
  error: (message: string, error?: Error, meta?: object) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.stack,
      timestamp: new Date().toISOString(),
      ...meta
    }))
  }
}
```

### Métricas Importantes

```typescript
// Métricas de negócio
- Taxa de conclusão de tarefas
- Tempo médio de sessões de estudo  
- Progresso nos tópicos
- User engagement (DAU, retention)

// Métricas técnicas  
- Core Web Vitals (LCP, FID, CLS)
- Error rate
- API response times
- Database query performance
```

### Prós e Contras das Outras Opções

#### Sentry
* **Prós**: Excellent error tracking, performance monitoring
* **Contras**: Additional cost, setup complexity

#### DataDog
* **Prós**: Complete observability platform
* **Contras**: High cost, over-engineering para current scale

### Links e Referências

* [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
* [Next.js Logging Best Practices](https://nextjs.org/docs/going-to-production#logging)

---

## Processo de ADR

### Quando Criar um ADR

Crie um ADR quando:
- A decisão impacta a arquitetura significativamente
- Há múltiplas opções viáveis com trade-offs importantes
- A decisão afeta desenvolvimento futuro
- Há necessidade de documentar o raciocínio para revisões futuras

### Revisão de ADRs

ADRs devem ser revisados:
- **Trimestralmente**: Para verificar se ainda são válidos
- **Antes de mudanças grandes**: Para entender impactos
- **Durante onboarding**: Para transferir contexto arquitetural

### Status de ADRs

- **Proposto**: Em discussão, não implementado
- **Aceito**: Aprovado e em implementação
- **Rejeitado**: Considerado mas rejeitado
- **Deprecado**: Era válido, mas não mais aplicável
- **Superseded**: Substituído por decisão mais recente

---

**Última atualização**: Agosto 2024  
**Versão da documentação**: 1.0