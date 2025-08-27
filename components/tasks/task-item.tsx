"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Clock, MoreVertical, Edit3, Trash2, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface TaskItemProps {
  task: any
  userId: string
  isOverdue?: boolean
}

export function TaskItem({ task, userId, isOverdue = false }: TaskItemProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(task.titulo)
  const [editedDescription, setEditedDescription] = useState(task.descricao || "")
  const router = useRouter()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'destructive'
      case 'media': return 'secondary'
      case 'baixa': return 'outline'
      default: return 'outline'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'estudo': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'trabalho': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pessoal': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTimeEstimateColor = (minutes: number) => {
    if (minutes <= 10) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    if (minutes <= 20) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    if (minutes <= 45) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const handleComplete = async (completed: boolean) => {
    setIsCompleting(true)
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from("tarefas")
        .update({ 
          status: completed ? 'concluida' : 'pendente',
          concluida_em: completed ? new Date().toISOString() : null
        })
        .eq("id", task.id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleSaveEdit = async () => {
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from("tarefas")
        .update({ 
          titulo: editedTitle,
          descricao: editedDescription.trim() || null
        })
        .eq("id", task.id)

      if (error) throw error
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error("Erro ao editar tarefa:", error)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return
    
    const supabase = createClient()
    
    try {
      const { error } = await supabase
        .from("tarefas")
        .delete()
        .eq("id", task.id)

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error)
    }
  }

  return (
    <Card className={`${isOverdue ? 'border-red-200' : ''} ${task.status === 'concluida' ? 'opacity-75' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.status === 'concluida'}
            onCheckedChange={handleComplete}
            disabled={isCompleting}
            className="mt-1"
          />
          
          <div className="flex-1 space-y-2">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="Título da tarefa"
                />
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="text-sm"
                  placeholder="Descrição (opcional)"
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${task.status === 'concluida' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.titulo}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {task.descricao && (
                  <p className={`text-sm text-muted-foreground ${task.status === 'concluida' ? 'line-through' : ''}`}>
                    {task.descricao}
                  </p>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getPriorityColor(task.prioridade)} className="text-xs">
                    {task.prioridade}
                  </Badge>
                  
                  <Badge className={`text-xs ${getCategoryColor(task.categoria)}`}>
                    {task.categoria}
                  </Badge>

                  {task.tempo_estimado && (
                    <Badge className={`text-xs ${getTimeEstimateColor(task.tempo_estimado)}`}>
                      <Clock className="h-3 w-3 mr-1" />
                      {task.tempo_estimado}min
                    </Badge>
                  )}

                  {isOverdue && (
                    <Badge className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(task.data_vencimento)}
                    </Badge>
                  )}
                </div>

                {task.concluida_em && (
                  <p className="text-xs text-muted-foreground">
                    Concluída em {new Date(task.concluida_em).toLocaleString('pt-BR')}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}