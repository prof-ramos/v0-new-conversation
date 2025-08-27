"use client"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Plus, Calendar, CheckCircle2 } from "lucide-react"
import Link from "next/link"

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

          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      </div>
    </header>
  )
}