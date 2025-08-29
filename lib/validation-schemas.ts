import { z } from 'zod'

/**
 * Schema de validação para tarefas
 * Usado tanto no frontend quanto no backend para consistência
 */
export const taskSchema = z.object({
  titulo: z.string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .trim(),
  
  descricao: z.string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional()
    .nullable()
    .transform(val => val?.trim() || null),
  
  categoria: z.enum(['estudo', 'trabalho', 'pessoal', 'geral'], {
    errorMap: () => ({ message: 'Selecione uma categoria válida' })
  }),
  
  prioridade: z.enum(['baixa', 'media', 'alta'], {
    errorMap: () => ({ message: 'Selecione uma prioridade válida' })
  }),
  
  tempo_estimado: z.number()
    .min(5, 'Tempo mínimo é 5 minutos')
    .max(480, 'Tempo máximo é 8 horas (480 minutos)')
    .int('Tempo deve ser um número inteiro')
    .optional()
    .nullable(),
  
  data_vencimento: z.string()
    .min(1, 'Data de vencimento é obrigatória')
    .refine((date) => {
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    }, 'Data deve ser hoje ou no futuro'),
  
  is_recorrente: z.boolean().optional().default(false),
  
  recorrencia_tipo: z.enum(['diaria', 'semanal', 'mensal']).optional().nullable(),
  
  recorrencia_config: z.object({
    intervalo: z.number().min(1).optional(),
    dias_semana: z.array(z.number().min(0).max(6)).optional(),
    fim_recorrencia: z.string().optional().nullable(),
    max_ocorrencias: z.number().min(1).optional()
  }).optional().nullable()
})

/**
 * Schema para criação de tarefa (campos obrigatórios mínimos)
 */
export const createTaskSchema = taskSchema.pick({
  titulo: true,
  categoria: true,
  prioridade: true,
  data_vencimento: true
}).extend({
  descricao: taskSchema.shape.descricao,
  tempo_estimado: taskSchema.shape.tempo_estimado
})

/**
 * Schema para atualização de tarefa (todos os campos opcionais)
 */
export const updateTaskSchema = taskSchema.partial()

/**
 * Schema para validação de campo individual
 */
export const fieldSchemas = {
  titulo: taskSchema.shape.titulo,
  descricao: taskSchema.shape.descricao,
  categoria: taskSchema.shape.categoria,
  prioridade: taskSchema.shape.prioridade,
  tempo_estimado: taskSchema.shape.tempo_estimado,
  data_vencimento: taskSchema.shape.data_vencimento,
  is_recorrente: taskSchema.shape.is_recorrente,
  recorrencia_tipo: taskSchema.shape.recorrencia_tipo,
  recorrencia_config: taskSchema.shape.recorrencia_config
}

/**
 * Tipos TypeScript gerados a partir dos schemas
 */
export type TaskFormData = z.infer<typeof taskSchema>
export type CreateTaskFormData = z.infer<typeof createTaskSchema>
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>

/**
 * Utilitário para validar um campo específico
 */
export function validateField(fieldName: keyof typeof fieldSchemas, value: any) {
  try {
    const schema = fieldSchemas[fieldName]
    schema.parse(value)
    return { success: true, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors[0]?.message || 'Valor inválido' 
      }
    }
    return { success: false, error: 'Erro de validação desconhecido' }
  }
}

/**
 * Utilitário para validar todo o formulário
 */
export function validateTaskForm(data: Partial<TaskFormData>) {
  try {
    const validatedData = createTaskSchema.parse(data)
    return { success: true, data: validatedData, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        const field = err.path[0] as string
        acc[field] = err.message
        return acc
      }, {} as Record<string, string>)
      
      return { 
        success: false, 
        data: null, 
        errors 
      }
    }
    return { 
      success: false, 
      data: null, 
      errors: { general: 'Erro de validação desconhecido' } 
    }
  }
}

/**
 * Schema de validação para perfil de usuário
 */
export const profileSchema = z.object({
  nome_completo: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email muito longo'),
})

/**
 * Schema de validação para sessão de estudo
 */
export const studySessionSchema = z.object({
  topico_id: z.string()
    .uuid('ID do tópico inválido'),
  
  duracao_minutos: z.number()
    .min(1, 'Duração mínima é 1 minuto')
    .max(480, 'Duração máxima é 8 horas')
    .int('Duração deve ser um número inteiro'),
  
  observacoes: z.string()
    .max(500, 'Observações devem ter no máximo 500 caracteres')
    .optional()
    .nullable()
    .transform(val => val?.trim() || null),
  
  data_inicio: z.date(),
  data_fim: z.date().optional()
})

export type ProfileFormData = z.infer<typeof profileSchema>
export type StudySessionFormData = z.infer<typeof studySessionSchema>