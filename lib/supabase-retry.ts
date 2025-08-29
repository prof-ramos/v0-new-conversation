"use client"

import { createClient } from '@/lib/supabase/client'
import { clientLogger } from '@/lib/client-logger'
import { mapErrorToCode, isRetryableError } from '@/lib/error-mappings'

interface RetryOptions {
  maxRetries?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  onRetry?: (attempt: number, error: Error) => void
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 segundo
  maxDelay: 30000, // 30 segundos
  backoffFactor: 2,
  onRetry: () => {}
}

/**
 * Aguarda por um determinado tempo
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Calcula o delay para o próximo retry com backoff exponencial
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  const exponentialDelay = options.baseDelay * Math.pow(options.backoffFactor, attempt - 1)
  const jitteredDelay = exponentialDelay * (0.5 + Math.random() * 0.5) // Adiciona jitter
  return Math.min(jitteredDelay, options.maxDelay)
}

/**
 * Executa uma operação com retry automático
 */
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options }
  let lastError: Error = new Error('Unknown error')

  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      clientLogger.debug(`[RETRY] Tentativa ${attempt}/${opts.maxRetries + 1} para ${operationName}`)
      
      const result = await operation()
      
      if (attempt > 1) {
        clientLogger.info(`[RETRY] Operação ${operationName} bem-sucedida após ${attempt - 1} tentativas`)
      }
      
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      lastError = err
      
      clientLogger.warning(`[RETRY] Tentativa ${attempt} falhou para ${operationName}`, {
        error: err.message,
        attempt,
        maxRetries: opts.maxRetries
      })
      
      // Se é a última tentativa, não tenta novamente
      if (attempt > opts.maxRetries) {
        break
      }
      
      // Verifica se o erro é retryable
      const errorCode = mapErrorToCode(err)
      if (!isRetryableError(errorCode)) {
        clientLogger.info(`[RETRY] Erro não é retryable (${errorCode}), parando tentativas`)
        throw err
      }
      
      // Chama callback de retry se fornecido
      opts.onRetry(attempt, err)
      
      // Espera antes da próxima tentativa
      const delayMs = calculateDelay(attempt, opts)
      clientLogger.debug(`[RETRY] Aguardando ${delayMs}ms antes da próxima tentativa`)
      await delay(delayMs)
    }
  }
  
  clientLogger.error(`[RETRY] Todas as tentativas falharam para ${operationName}`)
  throw lastError
}

/**
 * Wrapper para operações do Supabase com retry automático
 */
export class SupabaseRetryClient {
  private supabase = createClient()
  
  /**
   * Insere dados com retry automático
   */
  async insertWithRetry<T>(
    tableName: string,
    data: Partial<T> | Partial<T>[],
    options: RetryOptions = {}
  ) {
    return executeWithRetry(
      async () => {
        const result = await this.supabase
          .from(tableName)
          .insert(data as any)
        
        if (result.error) {
          throw result.error
        }
        
        return result.data
      },
      `insert into ${tableName}`,
      options
    )
  }
  
  /**
   * Atualiza dados com retry automático
   */
  async updateWithRetry<T>(
    tableName: string,
    data: Partial<T>,
    filters: Record<string, any>,
    options: RetryOptions = {}
  ) {
    return executeWithRetry(
      async () => {
        let query = this.supabase.from(tableName).update(data as any)
        
        // Aplica filtros
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
        
        const result = await query
        
        if (result.error) {
          throw result.error
        }
        
        return result.data
      },
      `update ${tableName}`,
      options
    )
  }
  
  /**
   * Busca dados com retry automático
   */
  async selectWithRetry<T>(
    tableName: string,
    columns: string = '*',
    filters: Record<string, any> = {},
    options: RetryOptions = {}
  ) {
    return executeWithRetry(
      async () => {
        let query = this.supabase.from(tableName).select(columns)
        
        // Aplica filtros
        Object.entries(filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value)
          } else if (typeof value === 'object' && value !== null) {
            // Suporte para operadores especiais
            Object.entries(value).forEach(([operator, operatorValue]) => {
              switch (operator) {
                case 'gt':
                  query = query.gt(key, operatorValue)
                  break
                case 'gte':
                  query = query.gte(key, operatorValue)
                  break
                case 'lt':
                  query = query.lt(key, operatorValue)
                  break
                case 'lte':
                  query = query.lte(key, operatorValue)
                  break
                case 'like':
                  query = query.like(key, String(operatorValue))
                  break
                case 'ilike':
                  query = query.ilike(key, String(operatorValue))
                  break
                default:
                  query = query.eq(key, operatorValue)
              }
            })
          } else {
            query = query.eq(key, value)
          }
        })
        
        const result = await query
        
        if (result.error) {
          throw result.error
        }
        
        return result.data as T[]
      },
      `select from ${tableName}`,
      options
    )
  }
  
  /**
   * Deleta dados com retry automático
   */
  async deleteWithRetry(
    tableName: string,
    filters: Record<string, any>,
    options: RetryOptions = {}
  ) {
    return executeWithRetry(
      async () => {
        let query = this.supabase.from(tableName).delete()
        
        // Aplica filtros
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
        
        const result = await query
        
        if (result.error) {
          throw result.error
        }
        
        return result.data
      },
      `delete from ${tableName}`,
      options
    )
  }
  
  /**
   * Executa RPC (Remote Procedure Call) com retry automático
   */
  async rpcWithRetry<T>(
    functionName: string,
    params: Record<string, any> = {},
    options: RetryOptions = {}
  ): Promise<T> {
    return executeWithRetry(
      async () => {
        const result = await this.supabase.rpc(functionName, params)
        
        if (result.error) {
          throw result.error
        }
        
        return result.data as T
      },
      `rpc ${functionName}`,
      options
    )
  }
  
  /**
   * Health check do Supabase
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.supabase.from('profiles').select('id').limit(1)
      return !result.error
    } catch (error) {
      return false
    }
  }
}

// Instância singleton para uso em toda a aplicação
export const supabaseRetry = new SupabaseRetryClient()

/**
 * Hook React para usar o cliente com retry
 */
import { useMemo } from 'react'

export function useSupabaseRetry(defaultOptions?: RetryOptions) {
  return useMemo(() => {
    const client = new SupabaseRetryClient()
    
    // Se opções padrão foram fornecidas, criar métodos wrapper
    if (defaultOptions) {
      return {
        insert: <T>(tableName: string, data: Partial<T> | Partial<T>[]) =>
          client.insertWithRetry(tableName, data, defaultOptions),
        update: <T>(tableName: string, data: Partial<T>, filters: Record<string, any>) =>
          client.updateWithRetry(tableName, data, filters, defaultOptions),
        select: <T>(tableName: string, columns?: string, filters?: Record<string, any>) =>
          client.selectWithRetry<T>(tableName, columns, filters, defaultOptions),
        delete: (tableName: string, filters: Record<string, any>) =>
          client.deleteWithRetry(tableName, filters, defaultOptions),
        rpc: <T>(functionName: string, params?: Record<string, any>) =>
          client.rpcWithRetry<T>(functionName, params, defaultOptions),
        healthCheck: () => client.healthCheck()
      }
    }
    
    return client
  }, [defaultOptions])
}

/**
 * Utilitários para configurações de retry específicas
 */
export const retryConfigs = {
  // Para operações críticas (inserção de dados importantes)
  critical: {
    maxRetries: 5,
    baseDelay: 1000,
    maxDelay: 60000,
    backoffFactor: 2
  } as RetryOptions,
  
  // Para operações normais
  standard: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    backoffFactor: 2
  } as RetryOptions,
  
  // Para operações rápidas (health checks, etc)
  fast: {
    maxRetries: 2,
    baseDelay: 500,
    maxDelay: 5000,
    backoffFactor: 1.5
  } as RetryOptions,
  
  // Para operações que não devem ter retry (single attempt)
  none: {
    maxRetries: 0
  } as RetryOptions
}