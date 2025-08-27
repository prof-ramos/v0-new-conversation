"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, Circle, Clock, Play } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface TopicItemProps {
  topico: any
  userId: string
}

export function TopicItem({ topico, userId }: TopicItemProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  // Estado atual do progresso
  const userProgress = topico.progresso_usuario?.[0]
  const currentStatus = userProgress?.status || "nao_iniciado"
  const currentProgress = userProgress?.porcentagem_conclusao || 0

  const [localProgress, setLocalProgress] = useState(currentProgress)

  useEffect(() => {
    setLocalProgress(currentProgress)
  }, [currentProgress])

  const updateProgress = async (newStatus: string, newProgress?: number) => {
    setIsUpdating(true)
    const supabase = createClient()

    try {
      const progressValue = newProgress !== undefined ? newProgress : newStatus === "concluido" ? 100 : localProgress

      const { error } = await supabase.from("progresso_usuario").upsert(
        {
          user_id: userId,
          topico_id: topico.id,
          status: newStatus,
          porcentagem_conclusao: progressValue,
        },
        {
          onConflict: "user_id,topico_id",
        },
      )

      if (error) throw error

      // Refresh da página para atualizar os dados
      router.refresh()
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleProgressChange = (value: number[]) => {
    const newProgress = value[0]
    setLocalProgress(newProgress)

    // Determinar status baseado no progresso
    let newStatus = "nao_iniciado"
    if (newProgress > 0 && newProgress < 100) {
      newStatus = "em_progresso"
    } else if (newProgress === 100) {
      newStatus = "concluido"
    }

    updateProgress(newStatus, newProgress)
  }

  const getStatusIcon = () => {
    switch (currentStatus) {
      case "concluido":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "em_progresso":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = () => {
    switch (currentStatus) {
      case "concluido":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
            Concluído
          </Badge>
        )
      case "em_progresso":
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Em Progresso
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-gray-600">
            Não Iniciado
          </Badge>
        )
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        {getStatusIcon()}
        <div className="flex-1">
          <h4 className="font-medium text-foreground">{topico.nome}</h4>
          {topico.descricao && <p className="text-sm text-muted-foreground mt-1">{topico.descricao}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Slider de progresso */}
        <div className="flex items-center gap-2 min-w-[120px]">
          <Slider
            value={[localProgress]}
            onValueChange={handleProgressChange}
            max={100}
            step={5}
            className="flex-1"
            disabled={isUpdating}
          />
          <span className="text-xs text-muted-foreground w-8">{localProgress}%</span>
        </div>

        {/* Badge de status */}
        {getStatusBadge()}

        {/* Botão de iniciar sessão */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.push(`/study-session?topic=${topico.id}`)}
          disabled={isUpdating}
        >
          <Play className="h-3 w-3 mr-1" />
          Estudar
        </Button>
      </div>
    </div>
  )
}
