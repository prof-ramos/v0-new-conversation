import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, FileText } from "lucide-react"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

interface SessionsListProps {
  sessions: any[]
}

export function SessionsList({ sessions }: SessionsListProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma sessão de estudo registrada ainda.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Todas as Sessões</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sessions.map((session, index) => (
            <div
              key={index}
              className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-foreground">{session.topicos?.materias?.nome || "Matéria"}</h4>
                  <Badge variant="outline" className="text-xs">
                    {session.topicos?.nome || "Tópico"}
                  </Badge>
                  <Badge
                    variant={session.topicos?.materias?.categoria === "basicos" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {session.topicos?.materias?.categoria === "basicos" ? "Básicos" : "Específicos"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{session.duracao_minutos || 0} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {format(parseISO(session.data_inicio), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>

                {session.observacoes && (
                  <div className="flex items-start gap-1 mt-2">
                    <FileText className="h-3 w-3 mt-0.5 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground line-clamp-2">{session.observacoes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
