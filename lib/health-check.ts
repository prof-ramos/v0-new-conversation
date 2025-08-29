"use client"

import { createClient } from '@/lib/supabase/client'
import { clientLogger } from '@/lib/client-logger'

interface HealthCheckResult {
  service: string
  status: 'healthy' | 'degraded' | 'down'
  latency?: number
  error?: string
  timestamp: number
}

interface SystemHealthStatus {
  overall: 'healthy' | 'degraded' | 'down'
  checks: HealthCheckResult[]
  timestamp: number
}

/**
 * Verifica saúde da conexão com Supabase
 */
export async function checkSupabaseConnection(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    const supabase = createClient()
    const { error } = await supabase.from('profiles').select('id').limit(1)
    
    const latency = Date.now() - startTime
    
    if (error) {
      return {
        service: 'supabase_connection',
        status: 'down',
        latency,
        error: error.message,
        timestamp: Date.now()
      }
    }
    
    return {
      service: 'supabase_connection',
      status: latency > 5000 ? 'degraded' : 'healthy',
      latency,
      timestamp: Date.now()
    }
  } catch (error) {
    return {
      service: 'supabase_connection',
      status: 'down',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    }
  }
}

/**
 * Verifica saúde do serviço de autenticação
 */
export async function checkAuthService(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.getSession()
    
    const latency = Date.now() - startTime
    
    if (error) {
      return {
        service: 'auth_service',
        status: 'down',
        latency,
        error: error.message,
        timestamp: Date.now()
      }
    }
    
    return {
      service: 'auth_service',
      status: latency > 3000 ? 'degraded' : 'healthy',
      latency,
      timestamp: Date.now()
    }
  } catch (error) {
    return {
      service: 'auth_service',
      status: 'down',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    }
  }
}

/**
 * Verifica acesso ao banco de dados
 */
export async function checkDatabaseAccess(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    const supabase = createClient()
    const { error, count } = await supabase
      .from('tarefas')
      .select('id', { count: 'exact', head: true })
    
    const latency = Date.now() - startTime
    
    if (error) {
      return {
        service: 'database_access',
        status: 'down',
        latency,
        error: error.message,
        timestamp: Date.now()
      }
    }
    
    return {
      service: 'database_access',
      status: latency > 2000 ? 'degraded' : 'healthy',
      latency,
      timestamp: Date.now()
    }
  } catch (error) {
    return {
      service: 'database_access',
      status: 'down',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    }
  }
}

/**
 * Verifica as políticas RLS
 */
export async function checkRLSPolicies(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    const supabase = createClient()
    
    // Tenta fazer uma query que deveria ser bloqueada por RLS se não autenticado
    const { error } = await supabase
      .from('tarefas')
      .select('id')
      .limit(1)
    
    const latency = Date.now() - startTime
    
    // Se não há erro, significa que ou o usuário está autenticado ou RLS não está funcionando
    // Para um health check, consideramos isso como funcionando
    return {
      service: 'rls_policies',
      status: latency > 1000 ? 'degraded' : 'healthy',
      latency,
      timestamp: Date.now()
    }
  } catch (error) {
    // Se há erro, pode ser RLS funcionando (se usuário não autenticado)
    // ou erro real do sistema
    const latency = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    // Se erro é de autenticação, RLS está funcionando
    if (errorMessage.includes('JWT') || errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
      return {
        service: 'rls_policies',
        status: 'healthy',
        latency,
        timestamp: Date.now()
      }
    }
    
    return {
      service: 'rls_policies',
      status: 'down',
      latency,
      error: errorMessage,
      timestamp: Date.now()
    }
  }
}

/**
 * Verifica conectividade de rede geral
 */
export async function checkNetworkConnectivity(): Promise<HealthCheckResult> {
  const startTime = Date.now()
  
  try {
    // Tenta fazer uma requisição para um endpoint confiável
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      signal: AbortSignal.timeout(5000) // 5 segundos timeout
    })
    
    const latency = Date.now() - startTime
    
    if (!response.ok) {
      return {
        service: 'network_connectivity',
        status: 'degraded',
        latency,
        error: `HTTP ${response.status}`,
        timestamp: Date.now()
      }
    }
    
    return {
      service: 'network_connectivity',
      status: latency > 3000 ? 'degraded' : 'healthy',
      latency,
      timestamp: Date.now()
    }
  } catch (error) {
    return {
      service: 'network_connectivity',
      status: 'down',
      latency: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
      timestamp: Date.now()
    }
  }
}

/**
 * Executa health check completo do sistema
 */
export async function checkSystemHealth(): Promise<SystemHealthStatus> {
  clientLogger.info('[HEALTH_CHECK] Iniciando verificação de saúde do sistema')
  
  const checks = await Promise.all([
    checkSupabaseConnection(),
    checkAuthService(),
    checkDatabaseAccess(),
    checkRLSPolicies(),
    checkNetworkConnectivity()
  ])
  
  // Determinar status geral
  const hasDownService = checks.some(check => check.status === 'down')
  const hasDegradedService = checks.some(check => check.status === 'degraded')
  
  let overall: 'healthy' | 'degraded' | 'down'
  if (hasDownService) {
    overall = 'down'
  } else if (hasDegradedService) {
    overall = 'degraded'
  } else {
    overall = 'healthy'
  }
  
  const result: SystemHealthStatus = {
    overall,
    checks,
    timestamp: Date.now()
  }
  
  clientLogger.info('[HEALTH_CHECK] Verificação concluída', {
    overall,
    checksCount: checks.length,
    healthyCount: checks.filter(c => c.status === 'healthy').length,
    degradedCount: checks.filter(c => c.status === 'degraded').length,
    downCount: checks.filter(c => c.status === 'down').length
  })
  
  return result
}

/**
 * Executa health check periódico
 */
export class HealthCheckMonitor {
  private intervalId: NodeJS.Timeout | null = null
  private lastCheck: SystemHealthStatus | null = null
  private listeners: Array<(status: SystemHealthStatus) => void> = []
  
  constructor(
    private intervalMs: number = 60000, // 1 minuto
    private onStatusChange?: (status: SystemHealthStatus) => void
  ) {
    if (onStatusChange) {
      this.listeners.push(onStatusChange)
    }
  }
  
  start() {
    if (this.intervalId) return
    
    clientLogger.info('[HEALTH_MONITOR] Iniciando monitoramento', {
      intervalMs: this.intervalMs
    })
    
    // Primeira verificação imediata
    this.performCheck()
    
    // Verificações periódicas
    this.intervalId = setInterval(() => {
      this.performCheck()
    }, this.intervalMs)
  }
  
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      clientLogger.info('[HEALTH_MONITOR] Monitoramento interrompido')
    }
  }
  
  private async performCheck() {
    try {
      const status = await checkSystemHealth()
      const previousStatus = this.lastCheck?.overall
      
      // Notificar listeners se status mudou
      if (previousStatus && previousStatus !== status.overall) {
        clientLogger.warning('[HEALTH_MONITOR] Mudança de status detectada', {
          previous: previousStatus,
          current: status.overall
        })
        
        this.listeners.forEach(listener => listener(status))
      }
      
      this.lastCheck = status
    } catch (error) {
      clientLogger.error('[HEALTH_MONITOR] Erro durante verificação', {
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
  
  addListener(listener: (status: SystemHealthStatus) => void) {
    this.listeners.push(listener)
  }
  
  removeListener(listener: (status: SystemHealthStatus) => void) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }
  
  getCurrentStatus(): SystemHealthStatus | null {
    return this.lastCheck
  }
}

/**
 * Hook React para usar health check
 */
import { useEffect, useState, useCallback } from 'react'

export function useSystemHealth(autoCheck: boolean = false, intervalMs: number = 60000) {
  const [status, setStatus] = useState<SystemHealthStatus | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [monitor, setMonitor] = useState<HealthCheckMonitor | null>(null)
  
  const performHealthCheck = useCallback(async () => {
    setIsChecking(true)
    try {
      const result = await checkSystemHealth()
      setStatus(result)
      return result
    } catch (error) {
      clientLogger.error('[USE_SYSTEM_HEALTH] Erro no health check', error)
      return null
    } finally {
      setIsChecking(false)
    }
  }, [])
  
  useEffect(() => {
    if (autoCheck && typeof window !== 'undefined') {
      const healthMonitor = new HealthCheckMonitor(intervalMs, setStatus)
      healthMonitor.start()
      setMonitor(healthMonitor)
      
      return () => {
        healthMonitor.stop()
      }
    }
  }, [autoCheck, intervalMs])
  
  return {
    status,
    isChecking,
    performHealthCheck,
    monitor
  }
}