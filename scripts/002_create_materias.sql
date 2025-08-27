-- Tabela de matérias do concurso
create table if not exists public.materias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  categoria text not null, -- 'basicos' ou 'especificos'
  descricao text,
  ordem integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Inserir matérias baseadas no conteúdo do concurso
insert into public.materias (nome, categoria, descricao, ordem) values
-- Conhecimentos Básicos
('Língua Portuguesa', 'basicos', 'Compreensão e interpretação de textos, tipologia textual, ortografia oficial, acentuação gráfica, emprego das classes de palavras, emprego do sinal indicativo de crase, sintaxe da oração e do período, pontuação, concordância nominal e verbal, regência nominal e verbal, significação das palavras, redação de correspondências oficiais', 1),
('Língua Inglesa', 'basicos', 'Compreensão de textos escritos em língua inglesa e itens gramaticais relevantes para o entendimento dos sentidos dos textos', 2),
('Matemática Financeira', 'basicos', 'Juros simples e compostos: capitalização e desconto, taxas de juros: nominal, efetiva, equivalentes, proporcionais, real e aparente, rendas uniformes e variáveis, planos de amortização de empréstimos e financiamentos, cálculo financeiro: custo real efetivo de operações de financiamento, empréstimo e investimento, avaliação de alternativas de investimento, taxas de retorno', 3),
('Controle Externo', 'basicos', 'Conceito, tipos e formas de controle, controle interno e externo, controle parlamentar, controle pelos tribunais de contas, controle jurisdicional, sustentabilidade e responsabilidade na gestão fiscal', 4),
('Administração Pública', 'basicos', 'Características básicas das organizações formais modernas: tipos de estrutura organizacional, natureza, finalidades e critérios de departamentalização, organização administrativa: centralização, descentralização, concentração e desconcentração, organização administrativa da União, administração direta e indireta, agências executivas e reguladoras', 5),
('Direito Constitucional', 'basicos', 'Constituição da República Federativa do Brasil de 1988: princípios fundamentais, aplicabilidade das normas constitucionais, direitos e garantias fundamentais, organização político-administrativa do Estado, administração pública, organização dos Poderes, controle de constitucionalidade, defesa do Estado e das instituições democráticas', 6),
('Direito Administrativo', 'basicos', 'Estado, governo e administração pública: conceitos, elementos, poderes, natureza, fins e princípios, direito administrativo: conceito, fontes e princípios, organização administrativa, ato administrativo, agentes públicos, poderes administrativos, controle e responsabilização da administração, improbidade administrativa, processo administrativo, licitações e contratos administrativos', 7),
('Direito Civil', 'basicos', 'Lei de Introdução às Normas do Direito Brasileiro, das pessoas naturais e jurídicas, domicílio, bens, fatos jurídicos, prescrição e decadência, obrigações, contratos em geral, responsabilidade civil', 8),
('Direito Processual Civil', 'basicos', 'Normas processuais civis, aplicação das normas processuais, jurisdição e ação, partes e procuradores, Ministério Público, competência, petição inicial, resposta do réu, revelia, providências preliminares, julgamento conforme o estado do processo, provas, audiência, sentença e coisa julgada, liquidação e cumprimento da sentença, processo de execução, recursos', 9),
('Sistema Normativo Anticorrupção', 'basicos', 'Lei nº 12.846/2013 e alterações (Lei Anticorrupção), Lei nº 8.429/1992 e alterações (Lei de Improbidade Administrativa), Lei nº 14.230/2021 (alterações na Lei de Improbidade Administrativa)', 10),

-- Conhecimentos Específicos
('Estatística', 'especificos', 'Conceitos fundamentais de estatística, coleta, organização e apresentação de dados, distribuições de frequências, medidas de posição, dispersão, assimetria e curtose, probabilidade, distribuições discretas e contínuas, amostragem, estimação, testes de hipóteses, análise de regressão e correlação', 11),
('Análise de Dados', 'especificos', 'Conceitos básicos de análise de dados, técnicas de mineração de dados, análise exploratória de dados, visualização de dados, análise preditiva, big data e analytics, ferramentas de análise de dados', 12),
('Auditoria Governamental', 'especificos', 'Conceitos básicos de auditoria, normas de auditoria aplicáveis ao setor público, planejamento de auditoria, procedimentos de auditoria, evidências de auditoria, papéis de trabalho, relatórios de auditoria, auditoria de conformidade, auditoria operacional, auditoria de sistemas informatizados', 13),
('Contabilidade do Setor Público', 'especificos', 'Conceitos e campo de aplicação da contabilidade pública, regime contábil, Plano de Contas Aplicado ao Setor Público (PCASP), demonstrações contábeis aplicadas ao setor público, consolidação das demonstrações contábeis, controle interno na administração pública', 14),
('Análise das Demonstrações Contábeis', 'especificos', 'Análise horizontal e vertical, índices de liquidez, atividade, endividamento e rentabilidade, análise da demonstração dos fluxos de caixa, análise da demonstração do valor adicionado, limitações da análise por índices', 15),
('Administração Financeira e Orçamentária', 'especificos', 'Orçamento público: conceitos e princípios, ciclo orçamentário, processo orçamentário, métodos, técnicas e instrumentos do orçamento público, receita pública, despesa pública, programação e execução orçamentária e financeira, controle interno e externo', 16),
('Economia do Setor Público e Regulação', 'especificos', 'Microeconomia: teoria do consumidor, teoria da firma, estruturas de mercado, falhas de mercado, macroeconomia: agregados macroeconômicos, política fiscal e monetária, economia do setor público: funções do governo, teoria da tributação, federalismo fiscal, regulação econômica', 17);

-- Políticas RLS para materias (leitura pública)
alter table public.materias enable row level security;

create policy "materias_select_all"
  on public.materias for select
  using (true);
