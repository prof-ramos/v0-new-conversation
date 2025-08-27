"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useMemo } from "react"

interface PerformanceComparisonProps {
  currentProgress: any[]
}

export function PerformanceComparison({ currentProgress }: PerformanceComparisonProps) {
  const comparisonData = useMemo(() => {
    // Agrupar progresso por matéria
    const progressBySubject = currentProgress.reduce(
      (acc, progress) => {
        const subjectName = progress.topicos?.materias?.nome || "Outros"
        const category = progress.topicos?.materias?.categoria || "outros"

        if (!acc[subjectName]) {
          acc[subjectName] = {
            name: subjectName,
            category,
            progressItems: [],
          }
        }

        acc[subjectName].progressItems.push(progress.porcentagem_conclusao)
        return acc
      },
      {} as Record<string, any>,
    )

    // Calcular progresso médio por matéria
    const data = Object.values(progressBySubject)
      .map((subject: any) => ({
        name: subject.name.length > 20 ? subject.name.substring(0, 20) + "..." : subject.name,
        fullName: subject.name,
        category: subject.category,
        progress: Math.round(
          subject.progressItems.reduce((acc: number, val: number) => acc + val, 0) / subject.progressItems.length,
        ),
        topicsCount: subject.progressItems.length,
      }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 10) // Top 10 matérias

    return data
  }, [currentProgress])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Comparação de Performance por Matéria</CardTitle>
      </CardHeader>
      <CardContent>
        {comparisonData.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum progresso registrado ainda.</p>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" domain={[0, 100]} className="text-muted-foreground" fontSize={12} />
                <YAxis dataKey="name" type="category" className="text-muted-foreground" fontSize={12} width={120} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-card border rounded-lg p-3 shadow-md">
                          <p className="font-medium text-foreground">{data.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            Progresso: {data.progress}% ({data.topicsCount} tópicos)
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Categoria:{" "}
                            {data.category === "basicos" ? "Conhecimentos Básicos" : "Conhecimentos Específicos"}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar
                  dataKey="progress"
                  fill={(entry) => (entry.category === "basicos" ? "hsl(var(--chart-1))" : "hsl(var(--chart-2))")}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
