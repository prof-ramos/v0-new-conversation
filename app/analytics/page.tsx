import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AnalyticsHeader } from "@/components/analytics/analytics-header"
import { TimelineChart } from "@/components/analytics/timeline-chart"
import { SubjectDistribution } from "@/components/analytics/subject-distribution"
import { StudyHeatmap } from "@/components/analytics/study-heatmap"
import { ProgressEvolution } from "@/components/analytics/progress-evolution"
import { PerformanceComparison } from "@/components/analytics/performance-comparison"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Buscar dados das sessões de estudo com detalhes
  const { data: sessionsData } = await supabase
    .from("sessoes_estudo")
    .select(`
      *,
      topicos (
        nome,
        materias (
          nome,
          categoria
        )
      )
    `)
    .eq("user_id", user.id)
    .order("data_inicio", { ascending: true })

  // Buscar progresso histórico
  const { data: progressHistory } = await supabase
    .from("progresso_usuario")
    .select(`
      *,
      topicos (
        nome,
        materias (
          nome,
          categoria
        )
      )
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: true })

  // Buscar dados atuais de progresso
  const { data: currentProgress } = await supabase
    .from("progresso_usuario")
    .select(`
      *,
      topicos (
        nome,
        materias (
          nome,
          categoria
        )
      )
    `)
    .eq("user_id", user.id)

  return (
    <div className="min-h-screen bg-background">
      <AnalyticsHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Timeline de Progresso */}
        <TimelineChart sessionsData={sessionsData || []} />

        {/* Gráficos de distribuição e heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SubjectDistribution sessionsData={sessionsData || []} />
          <StudyHeatmap sessionsData={sessionsData || []} />
        </div>

        {/* Evolução do progresso e comparação */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProgressEvolution progressHistory={progressHistory || []} />
          <PerformanceComparison currentProgress={currentProgress || []} />
        </div>
      </main>
    </div>
  )
}
