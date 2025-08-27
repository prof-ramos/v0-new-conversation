"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Play, Pause, Square, Clock, BookOpen } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface StudySessionInterfaceProps {
  userId: string
  materias: any[]
  preSelectedTopic?: any
}

export function StudySessionInterface({ userId, materias, preSelectedTopic }: StudySessionInterfaceProps) {
  const router = useRouter()
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedTopic, setSelectedTopic] = useState(preSelectedTopic?.id || "")
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [notes, setNotes] = useState("")
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Configurar tópico pré-selecionado
  useEffect(() => {
    if (preSelectedTopic) {
      setSelectedSubject(preSelectedTopic.materias.id)
      setSelectedTopic(preSelectedTopic.id)
    }
  }, [preSelectedTopic])

  // Timer effect
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused])

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startSession = () => {
    if (!selectedTopic) return

    setIsRunning(true)
    setIsPaused(false)
    setSessionStartTime(new Date())
  }

  const pauseSession = () => {
    setIsPaused(!isPaused)
  }

  const stopSession = async () => {
    if (!sessionStartTime || !selectedTopic) return

    setIsSaving(true)
    const supabase = createClient()

    try {
      const endTime = new Date()
      const durationMinutes = Math.floor(seconds / 60)

      // Salvar sessão de estudo
      const { error: sessionError } = await supabase.from("sessoes_estudo").insert({
        user_id: userId,
        topico_id: selectedTopic,
        data_inicio: sessionStartTime.toISOString(),
        data_fim: endTime.toISOString(),
        duracao_minutos: durationMinutes,
        observacoes: notes.trim() || null,
      })

      if (sessionError) throw sessionError

      // Atualizar progresso do tópico (se ainda não existe, criar)
      const { data: existingProgress } = await supabase
        .from("progresso_usuario")
        .select("*")
        .eq("user_id", userId)
        .eq("topico_id", selectedTopic)
        .single()

      let newStatus = "em_progresso"
      let newProgress = existingProgress?.porcentagem_conclusao || 10

      // Se já estava em progresso, incrementar um pouco
      if (existingProgress) {
        if (existingProgress.status === "nao_iniciado") {
          newProgress = 25
        } else if (existingProgress.porcentagem_conclusao < 100) {
          newProgress = Math.min(existingProgress.porcentagem_conclusao + 10, 100)
        }

        if (newProgress === 100) {
          newStatus = "concluido"
        }
      }

      const { error: progressError } = await supabase.from("progresso_usuario").upsert(
        {
          user_id: userId,
          topico_id: selectedTopic,
          status: newStatus,
          porcentagem_conclusao: newProgress,
        },
        {
          onConflict: "user_id,topico_id",
        },
      )

      if (progressError) throw progressError

      // Reset da interface
      setIsRunning(false)
      setIsPaused(false)
      setSeconds(0)
      setNotes("")
      setSessionStartTime(null)

      // Redirecionar para o dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Erro ao salvar sessão:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const selectedSubjectData = materias.find((m) => m.id === selectedSubject)
  const availableTopics = selectedSubjectData?.topicos || []
  const selectedTopicData = availableTopics.find((t: any) => t.id === selectedTopic)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Sessão de Estudo</h1>
              <p className="text-sm text-muted-foreground">Cronometrize e registre seu tempo de estudo</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Seleção de Matéria e Tópico */}
          {!isRunning && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Selecionar Tópico de Estudo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Matéria</label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma matéria" />
                    </SelectTrigger>
                    <SelectContent>
                      {materias.map((materia) => (
                        <SelectItem key={materia.id} value={materia.id}>
                          <div className="flex items-center gap-2">
                            <span>{materia.nome}</span>
                            <Badge
                              variant={materia.categoria === "basicos" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {materia.categoria === "basicos" ? "Básicos" : "Específicos"}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedSubject && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Tópico</label>
                    <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tópico" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTopics.map((topico: any) => (
                          <SelectItem key={topico.id} value={topico.id}>
                            {topico.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timer Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                {isRunning ? (
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>Estudando</span>
                    {selectedTopicData && (
                      <Badge variant="outline" className="ml-2">
                        {selectedTopicData.nome}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Pronto para Estudar</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {/* Display do Timer */}
              <div className="text-6xl font-mono font-bold text-foreground">{formatTime(seconds)}</div>

              {/* Status */}
              {isRunning && (
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isPaused ? "bg-yellow-500" : "bg-green-500"}`}></div>
                  <span className="text-sm text-muted-foreground">{isPaused ? "Pausado" : "Em andamento"}</span>
                </div>
              )}

              {/* Controles */}
              <div className="flex items-center justify-center gap-4">
                {!isRunning ? (
                  <Button onClick={startSession} disabled={!selectedTopic} size="lg" className="px-8">
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Sessão
                  </Button>
                ) : (
                  <>
                    <Button onClick={pauseSession} variant="outline" size="lg">
                      <Pause className="h-4 w-4 mr-2" />
                      {isPaused ? "Retomar" : "Pausar"}
                    </Button>
                    <Button onClick={stopSession} variant="destructive" size="lg" disabled={isSaving}>
                      <Square className="h-4 w-4 mr-2" />
                      {isSaving ? "Salvando..." : "Finalizar"}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notas da Sessão */}
          {isRunning && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Observações da Sessão</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Adicione suas observações sobre esta sessão de estudo..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>
          )}

          {/* Informações do Tópico Selecionado */}
          {selectedTopicData && !isRunning && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Tópico Selecionado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">{selectedTopicData.nome}</h3>
                  {selectedTopicData.descricao && (
                    <p className="text-sm text-muted-foreground">{selectedTopicData.descricao}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedSubjectData?.categoria === "basicos" ? "default" : "secondary"}>
                      {selectedSubjectData?.nome}
                    </Badge>
                    <Badge variant="outline">
                      {selectedSubjectData?.categoria === "basicos"
                        ? "Conhecimentos Básicos"
                        : "Conhecimentos Específicos"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
