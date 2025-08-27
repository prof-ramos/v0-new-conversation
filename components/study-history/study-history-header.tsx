"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

export function StudyHistoryHeader() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Histórico de Estudos</h1>
              <p className="text-sm text-muted-foreground">Todas as suas sessões de estudo registradas</p>
            </div>
          </div>

          <Button size="sm" asChild>
            <Link href="/study-session">
              <Plus className="h-4 w-4 mr-2" />
              Nova Sessão
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
