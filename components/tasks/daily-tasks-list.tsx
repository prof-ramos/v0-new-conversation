"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskItem } from "./task-item"
import { NewTaskForm } from "./new-task-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, AlertTriangle, Calendar, Clock, Filter } from "lucide-react"

interface Task {
  id: string
  titulo: string
  descricao?: string
  categoria: string
  prioridade: string
  tempo_estimado?: number
  status: string
  data_vencimento: string
  concluida_em?: string
}

interface DailyTasksListProps {
  userId: string
  todayTasks: Task[]
  overdueTasks: Task[]
}

export function DailyTasksList({ userId, todayTasks, overdueTasks }: DailyTasksListProps) {
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [timeFilter, setTimeFilter] = useState<number | null>(null)

  // Separar tarefas por status
  const allPendingTasks = todayTasks.filter(task => task.status === 'pendente')
  const pendingTasks = timeFilter 
    ? allPendingTasks.filter(task => task.tempo_estimado === timeFilter)
    : allPendingTasks
  const completedTasks = todayTasks.filter(task => task.status === 'concluida')

  // Contar tarefas por tempo estimado
  const timeStats = allPendingTasks.reduce((acc, task) => {
    if (task.tempo_estimado) {
      acc[task.tempo_estimado] = (acc[task.tempo_estimado] || 0) + 1
    }
    return acc
  }, {} as Record<number, number>)

  const quickTasks = allPendingTasks.filter(task => task.tempo_estimado && task.tempo_estimado <= 10)

  return (
    <div className="space-y-6">
      {/* Tarefas Rápidas (≤ 10min) */}
      {quickTasks.length > 0 && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Clock className="h-5 w-5" />
              ⚡ Tarefas Rápidas ({quickTasks.length})
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                ≤ 10min
              </Badge>
            </CardTitle>
            <p className="text-sm text-green-600 dark:text-green-300">
              Tarefas que você pode concluir rapidamente!
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickTasks.map((task) => (
              <TaskItem key={task.id} task={task} userId={userId} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tarefas Atrasadas */}
      {overdueTasks.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Tarefas Atrasadas ({overdueTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueTasks.map((task) => (
              <TaskItem key={task.id} task={task} userId={userId} isOverdue />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tarefas de Hoje */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tarefas Pendentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Pendentes ({pendingTasks.length}{timeFilter ? ` de ${allPendingTasks.length}` : ''})
              </CardTitle>
              <Button 
                size="sm" 
                onClick={() => setShowNewTaskForm(!showNewTaskForm)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova
              </Button>
            </div>
            
            {/* Filtros por Tempo */}
            {Object.keys(timeStats).length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>Filtrar por tempo:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={timeFilter === null ? "default" : "outline"}
                    onClick={() => setTimeFilter(null)}
                  >
                    Todas
                  </Button>
                  {Object.entries(timeStats)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([minutes, count]) => (
                      <Button
                        key={minutes}
                        size="sm"
                        variant={timeFilter === Number(minutes) ? "default" : "outline"}
                        onClick={() => setTimeFilter(Number(minutes))}
                        className="gap-1"
                      >
                        <Clock className="h-3 w-3" />
                        {minutes}min ({count})
                      </Button>
                    ))}
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {showNewTaskForm && (
              <NewTaskForm 
                userId={userId}
                onSuccess={() => setShowNewTaskForm(false)}
                onCancel={() => setShowNewTaskForm(false)}
              />
            )}
            
            {pendingTasks.length === 0 && !showNewTaskForm ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Nenhuma tarefa pendente para hoje</p>
                <p className="text-xs">Que tal adicionar uma nova?</p>
              </div>
            ) : (
              pendingTasks.map((task) => (
                <TaskItem key={task.id} task={task} userId={userId} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Tarefas Concluídas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Concluídas ({completedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Nenhuma tarefa concluída ainda</p>
                <p className="text-xs">Complete suas tarefas para vê-las aqui!</p>
              </div>
            ) : (
              completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} userId={userId} />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}