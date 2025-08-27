"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo } from "react"
import { format, parseISO, eachDayOfInterval, subDays, getDay } from "date-fns"
import { ptBR } from "date-fns/locale"

interface StudyHeatmapProps {
  sessionsData: any[]
}

export function StudyHeatmap({ sessionsData }: StudyHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Criar dados para os últimos 12 semanas (84 dias)
    const endDate = new Date()
    const startDate = subDays(endDate, 83)
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate })

    const data = dateRange.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd")
      const dayOfWeek = getDay(date) // 0 = domingo, 1 = segunda, etc.

      // Filtrar sessões do dia
      const daysSessions = sessionsData.filter((session) => {
        const sessionDate = format(parseISO(session.data_inicio), "yyyy-MM-dd")
        return sessionDate === dateStr
      })

      const totalMinutes = daysSessions.reduce((acc, session) => acc + (session.duracao_minutos || 0), 0)

      return {
        date: dateStr,
        dayOfWeek,
        totalMinutes,
        intensity: Math.min(Math.floor(totalMinutes / 30), 4), // 0-4 levels
        displayDate: format(date, "dd/MM"),
      }
    })

    // Organizar em semanas
    const weeks = []
    for (let i = 0; i < data.length; i += 7) {
      weeks.push(data.slice(i, i + 7))
    }

    return { data, weeks }
  }, [sessionsData])

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 0:
        return "bg-muted"
      case 1:
        return "bg-green-200"
      case 2:
        return "bg-green-300"
      case 3:
        return "bg-green-400"
      case 4:
        return "bg-green-500"
      default:
        return "bg-muted"
    }
  }

  const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Heatmap de Atividade - Últimas 12 Semanas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Labels dos dias da semana */}
          <div className="flex items-center gap-1">
            <div className="w-8"></div> {/* Espaço para alinhamento */}
            {dayLabels.map((day, index) => (
              <div key={index} className="w-3 h-3 text-xs text-muted-foreground text-center">
                {day[0]}
              </div>
            ))}
          </div>

          {/* Grid do heatmap */}
          <div className="space-y-1">
            {heatmapData.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex items-center gap-1">
                <div className="w-8 text-xs text-muted-foreground">
                  {weekIndex % 4 === 0 ? format(parseISO(week[0].date), "MMM", { locale: ptBR }) : ""}
                </div>
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm ${getIntensityColor(day.intensity)} cursor-pointer hover:ring-1 hover:ring-primary`}
                    title={`${day.displayDate}: ${day.totalMinutes} minutos`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legenda */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Menos</span>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div key={level} className={`w-3 h-3 rounded-sm ${getIntensityColor(level)}`} />
              ))}
            </div>
            <span>Mais</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
