import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StudyHistoryHeader } from "@/components/study-history/study-history-header"
import { SessionsList } from "@/components/study-history/sessions-list"
import { HistoryStats } from "@/components/study-history/history-stats"

export default async function StudyHistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Buscar todas as sessões do usuário
  const { data: sessions } = await supabase
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
    .order("data_inicio", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <StudyHistoryHeader />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Estatísticas */}
        <HistoryStats sessions={sessions || []} />

        {/* Lista de Sessões */}
        <SessionsList sessions={sessions || []} />
      </main>
    </div>
  )
}
