import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface ProgressOverviewProps {
  progressData: any[]
}

export function ProgressOverview({ progressData }: ProgressOverviewProps) {
  // Agrupar progresso por matéria
  const progressBySubject = progressData.reduce(
    (acc, item) => {
      const subjectName = item.topicos?.materias?.nome || "Desconhecido"
      const category = item.topicos?.materias?.categoria || "outros"

      if (!acc[subjectName]) {
        acc[subjectName] = {
          name: subjectName,
          category,
          topics: [],
          averageProgress: 0,
        }
      }

      acc[subjectName].topics.push(item)
      return acc
    },
    {} as Record<string, any>,
  )

  // Calcular progresso médio por matéria
  Object.values(progressBySubject).forEach((subject: any) => {
    subject.averageProgress = Math.round(
      subject.topics.reduce((acc: number, topic: any) => acc + topic.porcentagem_conclusao, 0) / subject.topics.length,
    )
  })

  const subjects = Object.values(progressBySubject).sort((a: any, b: any) => b.averageProgress - a.averageProgress)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Progresso por Matéria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subjects.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum progresso registrado ainda. Comece estudando!</p>
        ) : (
          subjects.map((subject: any, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground">{subject.name}</span>
                  <Badge variant={subject.category === "basicos" ? "default" : "secondary"} className="text-xs">
                    {subject.category === "basicos" ? "Básicos" : "Específicos"}
                  </Badge>
                </div>
                <span className="text-sm font-medium text-muted-foreground">{subject.averageProgress}%</span>
              </div>
              <Progress value={subject.averageProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {subject.topics.length} tópico{subject.topics.length !== 1 ? "s" : ""}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
