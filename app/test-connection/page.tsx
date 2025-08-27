import { createClient } from "@/lib/supabase/server"

export default async function TestConnection() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Teste de Conexão Supabase</h1>
        {error ? (
          <div className="bg-red-100 p-4 rounded">
            <p className="text-red-700">Erro: {error.message}</p>
          </div>
        ) : (
          <div className="bg-green-100 p-4 rounded">
            <p className="text-green-700">✅ Conexão com Supabase funcionando!</p>
            <p>User: {data.user?.email || 'Não autenticado'}</p>
          </div>
        )}
      </div>
    )
  } catch (err) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Teste de Conexão Supabase</h1>
        <div className="bg-red-100 p-4 rounded">
          <p className="text-red-700">Erro na conexão: {String(err)}</p>
        </div>
      </div>
    )
  }
}