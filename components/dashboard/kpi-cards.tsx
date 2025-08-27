import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, BookOpen, TrendingUp, Target } from "lucide-react"

interface KPICardsProps {
  totalHours: number
  totalSessions: number
  progressData: any[]
}

export function KPICards({ totalHours, totalSessions, progressData }: KPICardsProps) {
  // Calcular progresso médio
  const averageProgress =
    progressData.length > 0
      ? Math.round(progressData.reduce((acc, item) => acc + item.porcentagem_conclusao, 0) / progressData.length)
      : 0

  // Calcular tópicos concluídos
  const completedTopics = progressData.filter((item) => item.status === "concluido").length

  const kpis = [
    {
      title: "Horas Estudadas",
      value: totalHours,
      unit: "h",
      icon: Clock,
      description: "Total acumulado",
      color: "text-blue-600",
    },
    {
      title: "Sessões de Estudo",
      value: totalSessions,
      unit: "",
      icon: BookOpen,
      description: "Sessões realizadas",
      color: "text-green-600",
    },
    {
      title: "Progresso Médio",
      value: averageProgress,
      unit: "%",
      icon: TrendingUp,
      description: "Across all subjects",
      color: "text-purple-600",
    },
    {
      title: "Tópicos Concluídos",
      value: completedTopics,
      unit: "",
      icon: Target,
      description: "Finalizados com sucesso",
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {kpi.value}
              {kpi.unit}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
