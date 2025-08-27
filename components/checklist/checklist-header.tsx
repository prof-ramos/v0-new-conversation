"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

export function ChecklistHeader() {
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
              <h1 className="text-xl font-bold text-foreground">Checklist de Estudos</h1>
              <p className="text-sm text-muted-foreground">Acompanhe seu progresso por matéria e tópico</p>
            </div>
          </div>

          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Tópico
          </Button>
        </div>
      </div>
    </header>
  )
}
