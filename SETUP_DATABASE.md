# Setup do Banco de Dados - Supabase

Este documento fornece instruções para configurar o banco de dados do projeto no Supabase.

## Pré-requisitos

1. Conta criada no [Supabase](https://supabase.com/)
2. Projeto criado no Supabase
3. Variáveis de ambiente configuradas no `.env.local`

## Scripts SQL para Executar

Execute os scripts SQL na seguinte ordem no **SQL Editor** do Supabase:

### 1. Criar Tabela de Perfis (`001_create_profiles.sql`)
- Cria tabela para armazenar perfis de usuário
- Configura Row Level Security (RLS)
- Permite que usuários vejam/editem apenas seus próprios dados

### 2. Criar Tabela de Matérias (`002_create_materias.sql`)
- Cria tabela com as matérias do concurso
- Inclui 17 matérias (10 básicas + 7 específicas)
- Configurada para leitura pública

### 3. Criar Tabela de Tópicos (`003_create_topicos.sql`)
- Cria tabela para tópicos de cada matéria
- Estabelece relacionamento com a tabela de matérias
- Configurada para leitura pública

### 4. Criar Tabela de Progresso do Usuário (`004_create_progresso_usuario.sql`)
- Armazena o progresso de cada usuário nos tópicos
- Status: 'nao_iniciado', 'em_progresso', 'concluido'
- Porcentagem de conclusão (0-100)

### 5. Criar Tabela de Sessões de Estudo (`005_create_sessoes_estudo.sql`)
- Registra todas as sessões de estudo realizadas
- Inclui duração, observações e timestamps
- Relacionada com tópicos e usuários

### 6. Criar Triggers (`006_create_triggers.sql`)
- Triggers para atualizar timestamps automaticamente
- Mantém dados consistentes

### 7. Popular Tópicos (`007_populate_topicos.sql`)
- Insere tópicos específicos para cada matéria
- Dados baseados no edital do concurso

### 8. Criar Tabela de Tarefas (`008_create_tarefas.sql`)
- Cria tabela para tarefas diárias
- Inclui sistema de tags de tempo estimado (5-60min)
- Suporte a categorias, prioridades e recorrência
- **Execute por último**

## Configuração das Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local` e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

## Verificação da Instalação

Após executar todos os scripts, você deve ter as seguintes tabelas:
- `profiles`
- `materias` (com 17 registros)
- `topicos` (com dezenas de registros)
- `progresso_usuario` (inicialmente vazia)
- `sessoes_estudo` (inicialmente vazia)
- `tarefas` (inicialmente vazia)

## Políticas de Segurança (RLS)

O sistema implementa Row Level Security para garantir que:
- Usuários só acessam seus próprios dados de progresso e sessões
- Matérias e tópicos são públicos (leitura apenas)
- Perfis são privados por usuário