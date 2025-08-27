"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useMemo } from "react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ProgressEvolutionProps {
  progressHistory: any[]
}

export function ProgressEvolution({ progressHistory }: ProgressEvolutionProps) {
  const evolutionData = useMemo(() => {
    if (progressHistory.length === 0) return []

    // Agrupar por data e calcular progresso médio
    const progressByDate = progressHistory.reduce(
      (acc, progress) => {
        const date = format(parseISO(progress.updated_at), "yyyy-MM-dd")

        if (!acc[date]) {
          acc[date] = {
            date,
            progressItems: [],
            basicItems: [],
            specificItems: [],
          }
        }

        acc[date].progressItems.push(progress.porcentagem_conclusao)

        if (progress.topicos?.materias?.categoria === "basicos") {
          acc[date].basicItems.push(progress.porcentagem_conclusao)
        } else if (progress.topicos?.materias?.categoria === "especificos") {
          acc[date].specificItems.push(progress.porcentagem_conclusao)
        }

        return acc
      },
      {} as Record<string, any>,
    )

    // Converter para array e calcular médias
    const data = Object.values(progressByDate)
      .map((item: any) => ({
        date: format(parseISO(item.date), "dd/MM", { locale: ptBR }),
        fullDate: item.date,
        averageProgress: Math.round(
          item.progressItems.reduce((acc: number, val: number) => acc + val, 0) / item.progressItems.length,
        ),
        basicProgress:
          item.basicItems.length > 0
            ? Math.round(item.basicItems.reduce((acc: number, val: number) => acc + val, 0) / item.basicItems.length)
            : 0,
        specificProgress:
          item.specificItems.length > 0
            ? Math.round(
                item.specificItems.reduce((acc: number, val: number) => acc + val, 0) / item.specificItems.length,
              )
            : 0,
      }))
      .sort((a, b) => a.fullDate.localeCompare(b.fullDate))
      .slice(-30) // Últimos 30 pontos de dados

    return data
  }, [progressHistory])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Evolução do Progresso</CardTitle>
      </CardHeader>
      <CardContent>
        {evolutionData.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum histórico de progresso disponível ainda.</p>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-muted-foreground" fontSize={12} />
                <YAxis className="text-muted-foreground" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-card border rounded-lg p-3 shadow-md">
                          <p className="font-medium text-foreground">{label}</p>
                          <p className="text-sm text-blue-600">Conhecimentos Básicos: {data.basicProgress}%</p>
                          <p className="text-sm text-purple-600">Conhecimentos Específicos: {data.specificProgress}%</p>
                          <p className="text-sm font-medium text-foreground">
                            Progresso Médio: {data.averageProgress}%
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="basicProgress"
                  stackId="1"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="specificProgress"
                  stackId="2"
                  stroke="hsl(var(--chart-2))"
                  fill="hsl(var(--chart-2))"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
