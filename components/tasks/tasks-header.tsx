"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Plus, Calendar, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { clientTaskLogger as taskLogger } from "@/lib/client-logger"

interface TasksHeaderProps {
  progressPercentage: number
  completedToday: number
  totalToday: number
}

export function TasksHeader({ progressPercentage, completedToday, totalToday }: TasksHeaderProps) {
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const handleNewTaskClick = () => {
    taskLogger.info('Botão "Nova Tarefa" clicado no header', {
      timestamp: Date.now(),
      component: 'TasksHeader'
    })
    
    try {
      // Disparar evento personalizado que será capturado pelo DailyTasksList
      taskLogger.debug('Disparando evento show-new-task-form')
      const event = new CustomEvent('show-new-task-form')
      window.dispatchEvent(event)
      taskLogger.debug('Evento disparado com sucesso')
      
      // Scroll suave para a seção de tarefas pendentes
      setTimeout(() => {
        taskLogger.debug('Executando scroll para seção de tarefas pendentes')
        const pendingSection = document.querySelector('[data-testid="pending-tasks-section"]')
        if (pendingSection) {
          taskLogger.debug('Seção encontrada, executando scroll')
          pendingSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          taskLogger.warning('Seção de tarefas pendentes não encontrada no DOM')
        }
      }, 100)
    } catch (error) {
      taskLogger.error('Erro ao processar clique do botão Nova Tarefa', {
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Tarefas Diárias</h1>
            <p className="text-sm text-muted-foreground capitalize">{today}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {completedToday} de {totalToday} concluídas
              </span>
            </div>
            
            <div className="flex items-center gap-2 min-w-[200px]">
              <Progress value={progressPercentage} className="h-2 flex-1" />
              <span className="text-sm font-medium text-foreground">
                {progressPercentage}%
              </span>
            </div>

            {progressPercentage === 100 && totalToday > 0 && (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Dia completo!</span>
              </div>
            )}
          </div>

          <Button size="sm" onClick={handleNewTaskClick}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      </div>
    </header>
  )
}