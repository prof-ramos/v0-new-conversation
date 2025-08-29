import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TasksHeader } from "@/components/tasks/tasks-header"
import { DailyTasksList } from "@/components/tasks/daily-tasks-list"
import { TasksStats } from "@/components/tasks/tasks-stats"
import { AuthenticationRequired } from "@/components/auth/authentication-required"
import { taskLogger } from "@/lib/logger"

export default async function TasksPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  
  taskLogger.info('Acesso à página de tarefas', {
    hasUser: !!user,
    hasError: !!error,
    timestamp: Date.now()
  })
  
  if (error || !user) {
    taskLogger.warning('Usuário não autenticado tentando acessar /tasks', {
      error: error?.message,
      redirecting: 'Mostrando componente de autenticação necessária'
    })
    
    return (
      <AuthenticationRequired
        title="🔐 Acesso às Tarefas Requer Login"
        description="Para criar, gerenciar e acompanhar suas tarefas diárias, você precisa estar autenticado."
        features={[
          "✅ Criar e editar tarefas diárias",
          "📊 Acompanhar progresso e estatísticas", 
          "⚡ Filtrar tarefas por tempo estimado",
          "📱 Sincronizar entre dispositivos",
          "🏆 Visualizar tarefas concluídas"
        ]}
        returnPath="/auth/login"
      />
    )
  }

  // Buscar tarefas do dia atual
  const today = new Date().toISOString().split('T')[0]
  const { data: todayTasks } = await supabase
    .from("tarefas")
    .select("*")
    .eq("user_id", user.id)
    .eq("data_vencimento", today)
    .order("ordem", { ascending: true })
    .order("prioridade", { ascending: false })

  // Buscar tarefas atrasadas
  const { data: overdueTasks } = await supabase
    .from("tarefas")
    .select("*")
    .eq("user_id", user.id)
    .lt("data_vencimento", today)
    .eq("status", "pendente")
    .order("data_vencimento", { ascending: true })

  // Buscar tarefas dos próximos 7 dias para estatísticas
  const weekAhead = new Date()
  weekAhead.setDate(weekAhead.getDate() + 7)
  const { data: weekTasks } = await supabase
    .from("tarefas")
    .select("*")
    .eq("user_id", user.id)
    .gte("data_vencimento", today)
    .lte("data_vencimento", weekAhead.toISOString().split('T')[0])

  // Calcular estatísticas do dia
  const completedToday = todayTasks?.filter(task => task.status === 'concluida').length || 0
  const totalToday = todayTasks?.length || 0
  const progressPercentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      <TasksHeader 
        progressPercentage={progressPercentage}
        completedToday={completedToday}
        totalToday={totalToday}
      />

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Estatísticas */}
        <TasksStats 
          weekTasks={weekTasks || []}
          overdueTasks={overdueTasks || []}
        />

        {/* Lista de Tarefas */}
        <DailyTasksList 
          userId={user.id}
          todayTasks={todayTasks || []}
          overdueTasks={overdueTasks || []}
        />
      </main>
    </div>
  )
}