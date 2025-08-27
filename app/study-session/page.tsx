import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StudySessionInterface } from "@/components/study-session/study-session-interface"

export default async function StudySessionPage({ searchParams }: { searchParams: { topic?: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Buscar todas as matérias com tópicos para seleção
  const { data: materias } = await supabase
    .from("materias")
    .select(`
      *,
      topicos (*)
    `)
    .order("ordem")

  // Se um tópico específico foi passado, buscar seus detalhes
  let selectedTopic = null
  if (searchParams.topic) {
    const { data: topicData } = await supabase
      .from("topicos")
      .select(`
        *,
        materias (*)
      `)
      .eq("id", searchParams.topic)
      .single()

    selectedTopic = topicData
  }

  return (
    <div className="min-h-screen bg-background">
      <StudySessionInterface userId={user.id} materias={materias || []} preSelectedTopic={selectedTopic} />
    </div>
  )
}
