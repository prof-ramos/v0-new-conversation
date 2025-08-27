"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { useMemo } from "react"

interface SubjectDistributionProps {
  sessionsData: any[]
}

export function SubjectDistribution({ sessionsData }: SubjectDistributionProps) {
  const distributionData = useMemo(() => {
    // Agrupar tempo por matéria
    const subjectTime = sessionsData.reduce(
      (acc, session) => {
        const subjectName = session.topicos?.materias?.nome || "Outros"
        const minutes = session.duracao_minutos || 0

        if (!acc[subjectName]) {
          acc[subjectName] = 0
        }
        acc[subjectName] += minutes

        return acc
      },
      {} as Record<string, number>,
    )

    // Converter para formato do gráfico
    const data = Object.entries(subjectTime)
      .map(([name, minutes]) => ({
        name,
        minutes,
        hours: Math.round((minutes / 60) * 10) / 10,
        percentage: 0, // Será calculado depois
      }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 8) // Top 8 matérias

    // Calcular percentuais
    const totalMinutes = data.reduce((acc, item) => acc + item.minutes, 0)
    data.forEach((item) => {
      item.percentage = totalMinutes > 0 ? Math.round((item.minutes / totalMinutes) * 100) : 0
    })

    return data
  }, [sessionsData])

  // Cores para o gráfico
  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Distribuição de Tempo por Matéria</CardTitle>
      </CardHeader>
      <CardContent>
        {distributionData.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum dado de estudo disponível ainda.</p>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="minutes"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-card border rounded-lg p-3 shadow-md">
                          <p className="font-medium text-foreground">{data.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {data.hours}h ({data.minutes}min) - {data.percentage}%
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
