import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { ProgressOverview } from "@/components/dashboard/progress-overview"
import { RecentSessions } from "@/components/dashboard/recent-sessions"
import { StudyChart } from "@/components/dashboard/study-chart"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Buscar dados do usuário
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Buscar estatísticas gerais
  const { data: totalSessions } = await supabase.from("sessoes_estudo").select("duracao_minutos").eq("user_id", user.id)

  const totalHours = totalSessions?.reduce((acc, session) => acc + (session.duracao_minutos || 0), 0) || 0

  // Buscar progresso por matéria
  const { data: progressData } = await supabase
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

  // Buscar sessões recentes
  const { data: recentSessions } = await supabase
    .from("sessoes_estudo")
    .select(`
      *,
      topicos (
        nome,
        materias (
          nome
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} profile={profile} />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* KPIs principais */}
        <KPICards
          totalHours={Math.round(totalHours / 60)}
          totalSessions={totalSessions?.length || 0}
          progressData={progressData || []}
        />

        {/* Visão geral do progresso e gráfico */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProgressOverview progressData={progressData || []} />
          <StudyChart sessionsData={totalSessions || []} />
        </div>

        {/* Sessões recentes */}
        <RecentSessions sessions={recentSessions || []} />
      </main>
    </div>
  )
}
