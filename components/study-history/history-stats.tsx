"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, BookOpen, Calendar, TrendingUp } from "lucide-react"
import { useMemo } from "react"

interface HistoryStatsProps {
  sessions: any[]
}

export function HistoryStats({ sessions }: HistoryStatsProps) {
  const stats = useMemo(() => {
    const totalMinutes = sessions.reduce((acc, session) => acc + (session.duracao_minutos || 0), 0)
    const totalHours = Math.round((totalMinutes / 60) * 10) / 10
    const totalSessions = sessions.length

    // Calcular média de sessão
    const averageSession = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0

    // Calcular dias únicos de estudo
    const uniqueDays = new Set(sessions.map((session) => session.data_inicio.split("T")[0])).size

    return {
      totalHours,
      totalSessions,
      averageSession,
      uniqueDays,
    }
  }, [sessions])

  const statCards = [
    {
      title: "Total de Horas",
      value: stats.totalHours,
      unit: "h",
      icon: Clock,
      description: "Tempo total estudado",
      color: "text-blue-600",
    },
    {
      title: "Sessões Realizadas",
      value: stats.totalSessions,
      unit: "",
      icon: BookOpen,
      description: "Sessões de estudo",
      color: "text-green-600",
    },
    {
      title: "Média por Sessão",
      value: stats.averageSession,
      unit: "min",
      icon: TrendingUp,
      description: "Duração média",
      color: "text-purple-600",
    },
    {
      title: "Dias de Estudo",
      value: stats.uniqueDays,
      unit: "",
      icon: Calendar,
      description: "Dias únicos estudados",
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {stat.value}
              {stat.unit}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
