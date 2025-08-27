"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useMemo } from "react"
import { format, parseISO, eachDayOfInterval, subDays } from "date-fns"
import { ptBR } from "date-fns/locale"

interface TimelineChartProps {
  sessionsData: any[]
}

export function TimelineChart({ sessionsData }: TimelineChartProps) {
  const chartData = useMemo(() => {
    // Criar dados para os últimos 30 dias
    const endDate = new Date()
    const startDate = subDays(endDate, 29)
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate })

    return dateRange.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd")
      const dayName = format(date, "dd/MM", { locale: ptBR })

      // Filtrar sessões do dia
      const daysSessions = sessionsData.filter((session) => {
        const sessionDate = format(parseISO(session.data_inicio), "yyyy-MM-dd")
        return sessionDate === dateStr
      })

      // Calcular métricas do dia
      const totalMinutes = daysSessions.reduce((acc, session) => acc + (session.duracao_minutos || 0), 0)
      const totalSessions = daysSessions.length

      // Separar por categoria
      const basicSessions = daysSessions.filter((s) => s.topicos?.materias?.categoria === "basicos")
      const specificSessions = daysSessions.filter((s) => s.topicos?.materias?.categoria === "especificos")

      const basicMinutes = basicSessions.reduce((acc, session) => acc + (session.duracao_minutos || 0), 0)
      const specificMinutes = specificSessions.reduce((acc, session) => acc + (session.duracao_minutos || 0), 0)

      return {
        date: dayName,
        fullDate: dateStr,
        totalMinutes,
        totalHours: Math.round((totalMinutes / 60) * 10) / 10,
        totalSessions,
        basicMinutes,
        specificMinutes,
        basicHours: Math.round((basicMinutes / 60) * 10) / 10,
        specificHours: Math.round((specificMinutes / 60) * 10) / 10,
      }
    })
  }, [sessionsData])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Timeline de Estudos - Últimos 30 Dias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-muted-foreground" fontSize={12} />
              <YAxis className="text-muted-foreground" fontSize={12} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-card border rounded-lg p-3 shadow-md">
                        <p className="font-medium text-foreground">{label}</p>
                        <p className="text-sm text-blue-600">
                          Conhecimentos Básicos: {data.basicHours}h ({data.basicMinutes}min)
                        </p>
                        <p className="text-sm text-purple-600">
                          Conhecimentos Específicos: {data.specificHours}h ({data.specificMinutes}min)
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          Total: {data.totalHours}h ({data.totalSessions} sessões)
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="basicHours"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                name="Conhecimentos Básicos (h)"
                dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="specificHours"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="Conhecimentos Específicos (h)"
                dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
