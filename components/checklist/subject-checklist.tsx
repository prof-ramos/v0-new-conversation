"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TopicItem } from "./topic-item"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"

interface SubjectChecklistProps {
  materia: any
  userId: string
}

export function SubjectChecklist({ materia, userId }: SubjectChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Calcular progresso da matéria
  const progress = useMemo(() => {
    if (!materia.topicos || materia.topicos.length === 0) return 0

    const totalTopics = materia.topicos.length
    const completedTopics = materia.topicos.filter((topico: any) => {
      const userProgress = topico.progresso_usuario?.[0]
      return userProgress?.status === "concluido"
    }).length

    return Math.round((completedTopics / totalTopics) * 100)
  }, [materia.topicos])

  // Contar tópicos por status
  const statusCounts = useMemo(() => {
    if (!materia.topicos) return { nao_iniciado: 0, em_progresso: 0, concluido: 0 }

    return materia.topicos.reduce(
      (acc: any, topico: any) => {
        const userProgress = topico.progresso_usuario?.[0]
        const status = userProgress?.status || "nao_iniciado"
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      { nao_iniciado: 0, em_progresso: 0, concluido: 0 },
    )
  }, [materia.topicos])

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="flex items-center gap-2 p-0 h-auto font-semibold text-left"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="text-lg">{materia.nome}</span>
          </Button>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {materia.topicos?.length || 0} tópicos
            </Badge>
            <span className="text-sm font-medium text-muted-foreground">{progress}%</span>
          </div>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {statusCounts.concluido} concluído{statusCounts.concluido !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              {statusCounts.em_progresso} em progresso
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              {statusCounts.nao_iniciado} não iniciado{statusCounts.nao_iniciado !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {materia.descricao && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{materia.descricao}</p>}
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {materia.topicos?.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum tópico cadastrado para esta matéria.
              </p>
            ) : (
              materia.topicos?.map((topico: any) => <TopicItem key={topico.id} topico={topico} userId={userId} />)
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
