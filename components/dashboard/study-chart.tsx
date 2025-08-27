"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useMemo } from "react"

interface StudyChartProps {
  sessionsData: any[]
}

export function StudyChart({ sessionsData }: StudyChartProps) {
  const chartData = useMemo(() => {
    // Agrupar sessões por dia dos últimos 7 dias
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    return last7Days.map((date) => {
      const dayName = new Date(date).toLocaleDateString("pt-BR", { weekday: "short" })
      const sessionsForDay = sessionsData.filter((session) => session.created_at?.startsWith(date))

      const totalMinutes = sessionsForDay.reduce((acc, session) => acc + (session.duracao_minutos || 0), 0)

      return {
        day: dayName,
        minutes: totalMinutes,
        hours: Math.round((totalMinutes / 60) * 10) / 10,
      }
    })
  }, [sessionsData])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Atividade dos Últimos 7 Dias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="day" className="text-muted-foreground" fontSize={12} />
              <YAxis className="text-muted-foreground" fontSize={12} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border rounded-lg p-3 shadow-md">
                        <p className="font-medium text-foreground">{label}</p>
                        <p className="text-sm text-muted-foreground">
                          {payload[0].value} minutos ({Math.round((Number(payload[0].value) / 60) * 10) / 10}h)
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
