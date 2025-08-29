"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { clientTaskLogger as taskLogger } from "@/lib/client-logger"

interface NewTaskFormProps {
  userId: string
  onSuccess: () => void
  onCancel: () => void
}

const TIME_OPTIONS = [5, 10, 15, 20, 30, 45, 60]

export function NewTaskForm({ userId, onSuccess, onCancel }: NewTaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("geral")
  const [priority, setPriority] = useState("media")
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)
  const [dueDate, setDueDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()

  const getTimeColor = (minutes: number) => {
    if (minutes <= 10) return 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
    if (minutes <= 20) return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200'
    if (minutes <= 45) return 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200'
    return 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    taskLogger.info('Iniciando criação de nova tarefa', {
      component: 'NewTaskForm',
      formData: {
        title: title.trim(),
        category,
        priority,
        dueDate,
        estimatedTime,
        hasDescription: !!description.trim()
      }
    })
    
    if (!title.trim()) {
      taskLogger.warning('Tentativa de criar tarefa sem título')
      return
    }

    setIsLoading(true)
    const supabase = createClient()
    
    try {
      taskLogger.debug('Conectando com Supabase para inserir tarefa')
      
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
      
      taskLogger.debug('Dados da tarefa preparados', taskData)
      
      const { error } = await supabase
        .from("tarefas")
        .insert(taskData)

      if (error) {
        taskLogger.error('Erro do Supabase ao inserir tarefa', {
          error: error.message,
          code: error.code,
          details: error.details
        })
        throw error
      }
      
      taskLogger.info('Tarefa criada com sucesso')
      onSuccess()
      router.refresh()
      
    } catch (error) {
      taskLogger.error('Erro ao criar tarefa', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
    } finally {
      setIsLoading(false)
      taskLogger.debug('Estado de loading finalizado')
    }
  }

  return (
    <Card className="border-2 border-dashed border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">Nova Tarefa</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Título da tarefa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <Textarea
              placeholder="Descrição (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select value={category} onValueChange={setCategory}>
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
              <Select value={priority} onValueChange={setPriority}>
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
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
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
                  onClick={() => setEstimatedTime(estimatedTime === minutes ? null : minutes)}
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
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? "Criando..." : "Criar Tarefa"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}