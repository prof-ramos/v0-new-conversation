"use client"

import { useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { mapErrorToCode, getErrorConfig, ErrorCode } from '@/lib/error-mappings'
import { clientLogger } from '@/lib/client-logger'
import Link from 'next/link'

interface ErrorContext {
  component?: string
  operation?: string
  userId?: string
  timestamp?: number
  metadata?: Record<string, any>
}

/**
 * Hook personalizado para tratamento centralizado de erros
 * Fornece feedback visual via toast e logging estruturado
 */
export function useErrorHandler() {
  const { toast } = useToast()
  
  const handleError = useCallback((
    error: Error | string | unknown, 
    context?: ErrorContext
  ) => {
    const timestamp = Date.now()
    const errorCode = mapErrorToCode(error)
    const errorConfig = getErrorConfig(errorCode)
    
    // Enriquecer contexto
    const enrichedContext = {
      timestamp,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      ...context
    }
    
    // Log estruturado para desenvolvedores
    const logData = {
      errorCode,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : String(error),
      context: enrichedContext
    }
    
    switch (errorConfig.logLevel) {
      case 'DEBUG':
        clientLogger.debug(`[${errorCode}] ${errorConfig.title}`, logData)
        break
      case 'INFO':
        clientLogger.info(`[${errorCode}] ${errorConfig.title}`, logData)
        break
      case 'WARNING':
        clientLogger.warning(`[${errorCode}] ${errorConfig.title}`, logData)
        break
      case 'ERROR':
        clientLogger.error(`[${errorCode}] ${errorConfig.title}`, logData)
        break
      case 'CRITICAL':
        clientLogger.critical(`[${errorCode}] ${errorConfig.title}`, logData)
        break
    }
    
    // Toast notification para usuário
    toast({
      variant: errorConfig.variant,
      title: errorConfig.title,
      description: errorConfig.message,
      action: errorConfig.action && (
        errorConfig.action.href ? (
          <Button asChild variant="outline" size="sm">
            <Link href={errorConfig.action.href}>
              {errorConfig.action.label}
            </Link>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={errorConfig.action.onClick}
          >
            {errorConfig.action.label}
          </Button>
        )
      )
    })
    
    // Métricas (em ambiente de produção, enviar para serviço de analytics)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      trackErrorMetric(errorCode, enrichedContext)
    }
    
    return {
      errorCode,
      config: errorConfig,
      canRetry: errorConfig.retryable
    }
  }, [toast])
  
  /**
   * Wrapper para operações assíncronas com tratamento de erro automático
   */
  const withErrorHandling = useCallback(
    <T extends any[], R>(
      fn: (...args: T) => Promise<R>,
      context?: ErrorContext
    ) => {
      return async (...args: T): Promise<R | null> => {
        try {
          return await fn(...args)
        } catch (error) {
          handleError(error, context)
          return null
        }
      }
    },
    [handleError]
  )
  
  /**
   * Versão síncrona do wrapper
   */
  const withErrorHandlingSync = useCallback(
    <T extends any[], R>(
      fn: (...args: T) => R,
      context?: ErrorContext
    ) => {
      return (...args: T): R | null => {
        try {
          return fn(...args)
        } catch (error) {
          handleError(error, context)
          return null
        }
      }
    },
    [handleError]
  )
  
  return {
    handleError,
    withErrorHandling,
    withErrorHandlingSync
  }
}

/**
 * Hook especializado para erros de formulário
 */
export function useFormErrorHandler() {
  const { handleError } = useErrorHandler()
  
  const handleFormError = useCallback((
    error: Error | string | unknown,
    fieldName?: string,
    formName?: string
  ) => {
    return handleError(error, {
      component: 'Form',
      operation: 'submit',
      metadata: {
        fieldName,
        formName
      }
    })
  }, [handleError])
  
  return { handleFormError }
}

/**
 * Hook especializado para erros de API
 */
export function useApiErrorHandler() {
  const { handleError } = useErrorHandler()
  
  const handleApiError = useCallback((
    error: Error | string | unknown,
    endpoint?: string,
    method?: string
  ) => {
    return handleError(error, {
      component: 'API',
      operation: method || 'unknown',
      metadata: {
        endpoint
      }
    })
  }, [handleError])
  
  return { handleApiError }
}

/**
 * Função para tracking de métricas de erro
 * Em produção, isso enviaria dados para um serviço de analytics
 */
function trackErrorMetric(errorCode: ErrorCode, context: ErrorContext) {
  try {
    // Simular envio de métrica
    if (typeof window !== 'undefined' && 'gtag' in window) {
      // Google Analytics example
      ;(window as any).gtag('event', 'exception', {
        description: errorCode,
        fatal: ['CRITICAL', 'ERROR'].includes(getErrorConfig(errorCode).logLevel),
        custom_map: {
          error_code: errorCode,
          component: context.component,
          operation: context.operation
        }
      })
    }
    
    // Ou outro serviço de analytics
    console.debug('[METRICS] Error tracked:', {
      errorCode,
      timestamp: context.timestamp,
      component: context.component
    })
  } catch (metricsError) {
    // Não quebrar a aplicação se métricas falharem
    console.debug('Failed to track error metric:', metricsError)
  }
}