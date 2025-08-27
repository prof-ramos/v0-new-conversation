-- Inserir tópicos para as matérias já cadastradas

-- Tópicos para Língua Portuguesa
INSERT INTO public.topicos (materia_id, nome, descricao, ordem)
SELECT id, 'Compreensão e Interpretação de Textos', 'Técnicas de leitura e interpretação', 1
FROM public.materias WHERE nome = 'Língua Portuguesa';

INSERT INTO public.topicos (materia_id, nome, descricao, ordem)
SELECT id, 'Ortografia Oficial', 'Regras ortográficas do português brasileiro', 2
FROM public.materias WHERE nome = 'Língua Portuguesa';

INSERT INTO public.topicos (materia_id, nome, descricao, ordem)
SELECT id, 'Sintaxe da Oração e do Período', 'Análise sintática e estrutura frasal', 3
FROM public.materias WHERE nome = 'Língua Portuguesa';

-- Tópicos para Matemática Financeira
INSERT INTO public.topicos (materia_id, nome, descricao, ordem)
SELECT id, 'Juros Simples e Compostos', 'Cálculos de capitalização e desconto', 1
FROM public.materias WHERE nome = 'Matemática Financeira';

INSERT INTO public.topicos (materia_id, nome, descricao, ordem)
SELECT id, 'Taxas de Juros', 'Nominal, efetiva, equivalentes e proporcionais', 2
FROM public.materias WHERE nome = 'Matemática Financeira';

INSERT INTO public.topicos (materia_id, nome, descricao, ordem)
SELECT id, 'Rendas Uniformes e Variáveis', 'Séries de pagamentos e recebimentos', 3
FROM public.materias WHERE nome = 'Matemática Financeira';

-- Tópicos para Direito Constitucional
INSERT INTO public.topicos (materia_id, nome, descricao, ordem)
SELECT id, 'Princípios Fundamentais', 'Fundamentos da República Federativa do Brasil', 1
FROM public.materias WHERE nome = 'Direito Constitucional';

INSERT INTO public.topicos (materia_id, nome, descricao, ordem)
SELECT id, 'Direitos e Garantias Fundamentais', 'Direitos individuais e coletivos', 2
FROM public.materias WHERE nome = 'Direito Constitucional';

INSERT INTO public.topicos (materia_id, nome, descricao, ordem)
SELECT id, 'Organização dos Poderes', 'Executivo, Legislativo e Judiciário', 3
FROM public.materias WHERE nome = 'Direito Constitucional';

-- Tópicos para Auditoria Governamental
INSERT INTO public.topicos (materia_id, nome, descricao, ordem)
SELECT id, 'Conceitos Básicos de Auditoria', 'Fundamentos e objetivos da auditoria', 1
FROM public.materias WHERE nome = 'Auditoria Governamental';

INSERT INTO public.topicos (materia_id, nome, descricao, ordem)
SELECT id, 'Normas de Auditoria do Setor Público', 'NBC TSP e outras normas aplicáveis', 2
FROM public.materias WHERE nome = 'Auditoria Governamental';

INSERT INTO public.topicos (materia_id, nome, descricao, ordem)
SELECT id, 'Planejamento de Auditoria', 'Estratégia e plano de auditoria', 3
FROM public.materias WHERE nome = 'Auditoria Governamental';

-- Tópicos para Estatística
INSERT INTO public.topicos (materia_id, nome, descricao, ordem)
SELECT id, 'Conceitos Fundamentais', 'População, amostra, variáveis', 1
FROM public.materias WHERE nome = 'Estatística';

INSERT INTO public.topicos (materia_id, nome, descricao, ordem)
SELECT id, 'Medidas de Posição e Dispersão', 'Média, mediana, moda, desvio padrão', 2
FROM public.materias WHERE nome = 'Estatística';

INSERT INTO public.topicos (materia_id, nome, descricao, ordem)
SELECT id, 'Probabilidade', 'Conceitos e cálculos probabilísticos', 3
FROM public.materias WHERE nome = 'Estatística';
