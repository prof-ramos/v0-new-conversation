import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ChecklistHeader } from "@/components/checklist/checklist-header"
import { SubjectChecklist } from "@/components/checklist/subject-checklist"

export default async function ChecklistPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Buscar todas as matérias com seus tópicos
  const { data: materias } = await supabase
    .from("materias")
    .select(`
      *,
      topicos (
        *,
        progresso_usuario!inner (
          *
        )
      )
    `)
    .eq("topicos.progresso_usuario.user_id", user.id)
    .order("ordem")

  // Buscar matérias sem progresso ainda
  const { data: materiasWithoutProgress } = await supabase
    .from("materias")
    .select(`
      *,
      topicos (*)
    `)
    .order("ordem")

  // Combinar dados e garantir que todas as matérias apareçam
  const allMaterias = materiasWithoutProgress?.map((materia) => {
    const materiaWithProgress = materias?.find((m) => m.id === materia.id)
    return {
      ...materia,
      topicos: materia.topicos?.map((topico: any) => {
        const topicoWithProgress = materiaWithProgress?.topicos?.find((t: any) => t.id === topico.id)
        return {
          ...topico,
          progresso_usuario: topicoWithProgress?.progresso_usuario || [],
        }
      }),
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <ChecklistHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Conhecimentos Básicos */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Conhecimentos Básicos</h2>
            <div className="space-y-4">
              {allMaterias
                ?.filter((materia) => materia.categoria === "basicos")
                .map((materia) => (
                  <SubjectChecklist key={materia.id} materia={materia} userId={user.id} />
                ))}
            </div>
          </section>

          {/* Conhecimentos Específicos */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Conhecimentos Específicos</h2>
            <div className="space-y-4">
              {allMaterias
                ?.filter((materia) => materia.categoria === "especificos")
                .map((materia) => (
                  <SubjectChecklist key={materia.id} materia={materia} userId={user.id} />
                ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
