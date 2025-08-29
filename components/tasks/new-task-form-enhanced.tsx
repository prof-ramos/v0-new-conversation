"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { clientTaskLogger as taskLogger } from "@/lib/client-logger"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { useFormLoadingState } from "@/hooks/use-loading-states"
import { useTaskValidation } from "@/hooks/use-form-validation"
import { useFormAutoSave } from "@/hooks/use-auto-save"
import { supabaseRetry, retryConfigs } from "@/lib/supabase-retry"

interface NewTaskFormEnhancedProps {
  userId: string
  onSuccess: () => void
  onCancel: () => void
}

const TIME_OPTIONS = [5, 10, 15, 20, 30, 45, 60]

export function NewTaskFormEnhanced({ userId, onSuccess, onCancel }: NewTaskFormEnhancedProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("geral")
  const [priority, setPriority] = useState("media")
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)
  const [dueDate, setDueDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  
  const router = useRouter()
  const { handleError } = useErrorHandler()
  const { 
    isLoading, 
    message: loadingMessage, 
    submitWithLoading 
  } = useFormLoadingState()
  const validation = useTaskValidation()
  const autoSave = useFormAutoSave(`new-task-${userId}`, {
    onRestore: (savedData) => {
      if (savedData.titulo) setTitle(savedData.titulo)
      if (savedData.descricao) setDescription(savedData.descricao)
      if (savedData.categoria) setCategory(savedData.categoria)
      if (savedData.prioridade) setPriority(savedData.prioridade)
      if (savedData.tempo_estimado) setEstimatedTime(savedData.tempo_estimado)
      if (savedData.data_vencimento) setDueDate(savedData.data_vencimento)
    }
  })

  // Auto-save quando dados mudarem
  useEffect(() => {
    const formData = {
      titulo: title,
      descricao: description,
      categoria: category,
      prioridade: priority,
      tempo_estimado: estimatedTime,
      data_vencimento: dueDate
    }
    
    // Só salvar se tiver pelo menos título
    if (title.trim()) {
      autoSave.saveFormData(formData)
    }
  }, [title, description, category, priority, estimatedTime, dueDate, autoSave])

  // Carregar dados salvos na inicialização
  useEffect(() => {
    const savedData = autoSave.restoreFormData()
    if (savedData) {
      taskLogger.info('Dados do formulário restaurados do auto-save', savedData)
    }
  }, [])

  const getTimeColor = (minutes: number) => {
    if (minutes <= 10) return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
    if (minutes <= 20) return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200'
    if (minutes <= 45) return 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200'
    return 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar formulário antes de submeter
    const formData = {
      titulo: title.trim(),
      categoria: category,
      prioridade: priority,
      data_vencimento: dueDate,
      descricao: description.trim(),
      tempo_estimado: estimatedTime
    }
    
    const { isValid } = validation.validateAllFields(formData)
    if (!isValid) {
      handleError('Verifique os dados do formulário', {
        component: 'NewTaskFormEnhanced',
        operation: 'validation'
      })
      return
    }
    
    try {
      await submitWithLoading(async () => {
        taskLogger.info('Iniciando criação de nova tarefa', {
          component: 'NewTaskFormEnhanced',
          formData
        })
        
        const taskData = {
          user_id: userId,
          titulo: title.trim(),
          descricao: description.trim() || null,
          categoria: category,
          prioridade: priority,
          tempo_estimado: estimatedTime,
          data_vencimento: dueDate,
          status: 'pendente'
        }
        
        // Usar cliente com retry automático
        await supabaseRetry.insertWithRetry('tarefas', taskData, retryConfigs.standard)
        
        // Limpar auto-save após sucesso
        autoSave.clear()
        
        taskLogger.info('Tarefa criada com sucesso')
        onSuccess()
        router.refresh()
      }, {
        validationMessage: 'Validando dados...',
        submissionMessage: 'Criando tarefa...',
        successMessage: 'Tarefa criada com sucesso!'
      })
    } catch (error) {
      handleError(error, {
        component: 'NewTaskFormEnhanced',
        operation: 'create',
        userId
      })
    }
  }

  return (
    <Card className="border-2 border-dashed border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Nova Tarefa
          {autoSave.hasDraft && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground font-normal">
              <Save className="w-3 h-3 text-blue-500" />
              Rascunho salvo
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Título da tarefa"
              value={title}
              onChange={(e) => {
                const newValue = e.target.value
                setTitle(newValue)
                validation.handleFieldChange('titulo', newValue)
              }}
              onBlur={(e) => validation.handleFieldBlur('titulo', e.target.value)}
              className={validation.hasError('titulo') ? 'border-destructive focus:ring-destructive' : ''}
              required
            />
            {validation.hasError('titulo') && (
              <p className="text-sm text-destructive mt-1">
                {validation.getError('titulo')}
              </p>
            )}
          </div>

          <div>
            <Textarea
              placeholder="Descrição (opcional)"
              value={description}
              onChange={(e) => {
                const newValue = e.target.value
                setDescription(newValue)
                validation.handleFieldChange('descricao', newValue)
              }}
              onBlur={(e) => validation.handleFieldBlur('descricao', e.target.value)}
              className={validation.hasError('descricao') ? 'border-destructive focus:ring-destructive' : ''}
              rows={2}
            />
            {validation.hasError('descricao') && (
              <p className="text-sm text-destructive mt-1">
                {validation.getError('descricao')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select value={category} onValueChange={(value) => {
                setCategory(value)
                validation.handleFieldChange('categoria', value)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="estudo">📚 Estudo</SelectItem>
                  <SelectItem value="trabalho">💼 Trabalho</SelectItem>
                  <SelectItem value="pessoal">👤 Pessoal</SelectItem>
                  <SelectItem value="geral">📌 Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={priority} onValueChange={(value) => {
                setPriority(value)
                validation.handleFieldChange('prioridade', value)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">🟢 Baixa</SelectItem>
                  <SelectItem value="media">🟡 Média</SelectItem>
                  <SelectItem value="alta">🔴 Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  const newValue = e.target.value
                  setDueDate(newValue)
                  validation.handleFieldChange('data_vencimento', newValue)
                }}
                onBlur={(e) => validation.handleFieldBlur('data_vencimento', e.target.value)}
                className={validation.hasError('data_vencimento') ? 'border-destructive focus:ring-destructive' : ''}
                required
              />
              {validation.hasError('data_vencimento') && (
                <p className="text-sm text-destructive mt-1">
                  {validation.getError('data_vencimento')}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              ⏱️ Tempo Estimado
            </label>
            <div className="flex flex-wrap gap-2">
              {TIME_OPTIONS.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() => {
                    const newValue = estimatedTime === minutes ? null : minutes
                    setEstimatedTime(newValue)
                    validation.handleFieldChange('tempo_estimado', newValue)
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-colors cursor-pointer border-0 ${
                    estimatedTime === minutes 
                      ? getTimeColor(minutes) + ' ring-2 ring-primary/50' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  <Clock className="h-3 w-3 inline mr-1" />
                  {minutes}min
                </button>
              ))}
            </div>
            {estimatedTime && (
              <p className="text-xs text-muted-foreground mt-1">
                Tempo estimado selecionado: <strong>{estimatedTime} minutos</strong>
              </p>
            )}
            {validation.hasError('tempo_estimado') && (
              <p className="text-sm text-destructive mt-1">
                {validation.getError('tempo_estimado')}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              type="submit" 
              disabled={isLoading || !title.trim() || validation.hasAnyError()}
            >
              {isLoading ? (loadingMessage || "Criando...") : "Criar Tarefa"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                autoSave.clear()
                onCancel()
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>

          {/* Indicador de auto-save */}
          {autoSave.hasDraft && autoSave.lastSaved && (
            <div className="text-xs text-muted-foreground flex items-center gap-1 pt-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Rascunho salvo automaticamente às {autoSave.lastSaved.toLocaleTimeString()}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}