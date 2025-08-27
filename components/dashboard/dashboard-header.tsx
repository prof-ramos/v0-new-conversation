"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User, CheckSquare, BarChart3, Clock, History } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface DashboardHeaderProps {
  user: any
  profile: any
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">ES</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Estudo Tracker</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button size="sm" asChild>
              <Link href="/study-session">
                <Clock className="h-4 w-4 mr-2" />
                Estudar
              </Link>
            </Button>

            <Button variant="outline" size="sm" asChild>
              <Link href="/checklist">
                <CheckSquare className="h-4 w-4 mr-2" />
                Checklist
              </Link>
            </Button>

            <Button variant="outline" size="sm" asChild>
              <Link href="/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Link>
            </Button>

            <Button variant="outline" size="sm" asChild>
              <Link href="/study-history">
                <History className="h-4 w-4 mr-2" />
                Histórico
              </Link>
            </Button>

            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{profile?.nome_completo || "Usuário"}</p>
              <p className="text-xs text-muted-foreground">Concurso: Auditor Geral</p>
            </div>

            <UserMenu user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}

function UserMenu({ user }: { user: any }) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="/placeholder.svg" alt="Avatar" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
