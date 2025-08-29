"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, ArrowLeft, CheckCircle2, Calendar, Plus } from "lucide-react"
import Link from "next/link"

interface AuthenticationRequiredProps {
  title?: string
  description?: string
  features?: string[]
  returnPath?: string
}

export function AuthenticationRequired({ 
  title = "🔐 Autenticação Necessária",
  description = "Para acessar suas tarefas diárias e gerenciar sua rotina de estudos, você precisa fazer login.",
  features = [
    "Criar e gerenciar tarefas diárias",
    "Acompanhar progresso dos estudos", 
    "Visualizar analytics e estatísticas",
    "Sincronizar dados entre dispositivos"
  ],
  returnPath = "/auth/login"
}: AuthenticationRequiredProps) {
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Navegação de volta */}
        <div className="text-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Link>
          </Button>
        </div>

        {/* Card principal */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <p className="text-muted-foreground mt-2">
              {description}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Lista de recursos disponíveis */}
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                O que você pode fazer após o login:
              </h3>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Botão de ação */}
            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href={returnPath}>
                  <User className="w-4 h-4 mr-2" />
                  Fazer Login
                </Link>
              </Button>
              
              <div className="text-center">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/sign-up" className="text-muted-foreground">
                    Não tem uma conta? <span className="underline">Criar conta</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Informação adicional */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 dark:bg-blue-950/10 dark:border-blue-900/20">
              <div className="flex items-start gap-2">
                <Plus className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Dica:</strong> Após o login, você será redirecionado automaticamente 
                  para onde queria ir e poderá usar todas as funcionalidades.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          Sistema seguro de autenticação • Seus dados estão protegidos
        </div>
      </div>
    </div>
  )
}