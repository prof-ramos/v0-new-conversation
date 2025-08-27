"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Calendar, TrendingUp, Target } from "lucide-react"

interface TasksStatsProps {
  weekTasks: any[]
  overdueTasks: any[]
}

export function TasksStats({ weekTasks, overdueTasks }: TasksStatsProps) {
  // Calcular estatísticas da semana
  const totalWeek = weekTasks.length
  const completedWeek = weekTasks.filter(task => task.status === 'concluida').length
  const weekProgress = totalWeek > 0 ? Math.round((completedWeek / totalWeek) * 100) : 0
  
  // Estatísticas por categoria
  const categoryStats = weekTasks.reduce((acc, task) => {
    acc[task.categoria] = (acc[task.categoria] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Estatísticas por prioridade
  const priorityStats = weekTasks.reduce((acc, task) => {
    if (task.status === 'pendente') {
      acc[task.prioridade] = (acc[task.prioridade] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Tarefas Atrasadas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
          <p className="text-xs text-muted-foreground">
            {overdueTasks.length === 0 ? 'Parabéns!' : 'Precisam de atenção'}
          </p>
        </CardContent>
      </Card>

      {/* Progresso da Semana */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Semana</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{weekProgress}%</div>
          <p className="text-xs text-muted-foreground">
            {completedWeek} de {totalWeek} concluídas
          </p>
        </CardContent>
      </Card>

      {/* Categoria Principal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Foco Principal</CardTitle>
          <Target className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">
            {Object.keys(categoryStats).length > 0 
              ? Object.entries(categoryStats).sort(([,a], [,b]) => b - a)[0][0]
              : 'Nenhuma'
            }
          </div>
          <p className="text-xs text-muted-foreground">
            Categoria com mais tarefas
          </p>
        </CardContent>
      </Card>

      {/* Prioridades Pendentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Prioridades</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {priorityStats.alta && (
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">Alta</Badge>
                <span className="text-sm">{priorityStats.alta}</span>
              </div>
            )}
            {priorityStats.media && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">Média</Badge>
                <span className="text-sm">{priorityStats.media}</span>
              </div>
            )}
            {priorityStats.baixa && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Baixa</Badge>
                <span className="text-sm">{priorityStats.baixa}</span>
              </div>
            )}
            {Object.keys(priorityStats).length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhuma pendente</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}