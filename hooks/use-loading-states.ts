"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import { clientLogger } from '@/lib/client-logger'

type LoadingOperation = 
  | 'idle'
  | 'validating'
  | 'saving' 
  | 'loading'
  | 'deleting'
  | 'updating'
  | 'uploading'
  | 'processing'
  | 'submitting'

interface LoadingState {
  isLoading: boolean
  operation: LoadingOperation
  progress?: number
  message?: string
  startTime?: number
}

interface UseLoadingStateOptions {
  defaultMessage?: Record<LoadingOperation, string>
  logOperations?: boolean
  timeoutMs?: number
}

const DEFAULT_MESSAGES: Record<LoadingOperation, string> = {
  idle: '',
  validating: 'Validando dados...',
  saving: 'Salvando...',
  loading: 'Carregando...',
  deleting: 'Removendo...',
  updating: 'Atualizando...',
  uploading: 'Enviando...',
  processing: 'Processando...',
  submitting: 'Enviando...'
}

/**
 * Hook para gerenciamento de estados de loading contextuais
 * Suporta diferentes operações, progresso e timeouts
 */
export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const {
    defaultMessage = DEFAULT_MESSAGES,
    logOperations = true,
    timeoutMs = 30000 // 30 segundos
  } = options

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    operation: 'idle'
  })

  const timeoutRef = useRef<NodeJS.Timeout>()
  const operationIdRef = useRef<string>()

  /**
   * Inicia uma operação de loading
   */
  const startLoading = useCallback((
    operation: LoadingOperation,
    customMessage?: string,
    initialProgress?: number
  ) => {
    const operationId = Math.random().toString(36).substr(2, 9)
    operationIdRef.current = operationId

    const message = customMessage || defaultMessage[operation] || DEFAULT_MESSAGES[operation]
    const startTime = Date.now()

    setState({
      isLoading: true,
      operation,
      progress: initialProgress,
      message,
      startTime
    })

    if (logOperations) {
      clientLogger.info(`[LOADING] Iniciando operação: ${operation}`, {
        operationId,
        message,
        progress: initialProgress
      })
    }

    // Timeout para operações que ficam "presas"
    if (timeoutMs > 0) {
      timeoutRef.current = setTimeout(() => {
        if (operationIdRef.current === operationId) {
          clientLogger.warning(`[LOADING] Timeout na operação: ${operation}`, {
            operationId,
            duration: Date.now() - startTime
          })
          
          setState(prev => ({
            ...prev,
            isLoading: false,
            operation: 'idle',
            message: 'Operação demorou muito. Tente novamente.',
            progress: undefined
          }))
        }
      }, timeoutMs)
    }

    return operationId
  }, [defaultMessage, logOperations, timeoutMs])

  /**
   * Atualiza o progresso da operação atual
   */
  const updateProgress = useCallback((progress: number, customMessage?: string) => {
    setState(prev => {
      if (!prev.isLoading) return prev
      
      const message = customMessage || prev.message
      
      if (logOperations) {
        clientLogger.debug(`[LOADING] Progresso atualizado: ${progress}%`, {
          operation: prev.operation,
          message
        })
      }
      
      return {
        ...prev,
        progress: Math.max(0, Math.min(100, progress)),
        message
      }
    })
  }, [logOperations])

  /**
   * Finaliza a operação de loading
   */
  const stopLoading = useCallback((successMessage?: string) => {
    setState(prev => {
      if (!prev.isLoading) return prev
      
      const duration = prev.startTime ? Date.now() - prev.startTime : 0
      
      if (logOperations) {
        clientLogger.info(`[LOADING] Operação finalizada: ${prev.operation}`, {
          duration,
          success: true,
          message: successMessage
        })
      }
      
      // Limpar timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = undefined
      }
      
      operationIdRef.current = undefined
      
      return {
        isLoading: false,
        operation: 'idle',
        progress: undefined,
        message: successMessage,
        startTime: undefined
      }
    })
  }, [logOperations])

  /**
   * Cancela a operação atual
   */
  const cancelLoading = useCallback((reason?: string) => {
    setState(prev => {
      if (!prev.isLoading) return prev
      
      const duration = prev.startTime ? Date.now() - prev.startTime : 0
      
      if (logOperations) {
        clientLogger.warning(`[LOADING] Operação cancelada: ${prev.operation}`, {
          duration,
          reason
        })
      }
      
      // Limpar timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = undefined
      }
      
      operationIdRef.current = undefined
      
      return {
        isLoading: false,
        operation: 'idle',
        progress: undefined,
        message: reason || 'Operação cancelada',
        startTime: undefined
      }
    })
  }, [logOperations])

  /**
   * Wrapper para executar operação assíncrona com loading automático
   */
  const withLoading = useCallback(async <T,>(
    operation: LoadingOperation,
    asyncFn: () => Promise<T>,
    options?: {
      message?: string
      onProgress?: (progress: number) => void
      successMessage?: string
    }
  ): Promise<T | null> => {
    const operationId = startLoading(operation, options?.message)
    
    try {
      const result = await asyncFn()
      
      // Verificar se a operação ainda é válida (não foi cancelada)
      if (operationIdRef.current === operationId) {
        stopLoading(options?.successMessage)
      }
      
      return result
    } catch (error) {
      // Verificar se a operação ainda é válida
      if (operationIdRef.current === operationId) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
        
        if (logOperations) {
          clientLogger.error(`[LOADING] Erro na operação: ${operation}`, {
            error: errorMessage,
            operationId
          })
        }
        
        stopLoading()
      }
      
      throw error
    }
  }, [startLoading, stopLoading, logOperations])

  /**
   * Cleanup quando component é desmontado
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    // Estado atual
    ...state,
    
    // Helpers computados
    isValidating: state.operation === 'validating',
    isSaving: state.operation === 'saving',
    isDeleting: state.operation === 'deleting',
    isUpdating: state.operation === 'updating',
    isUploading: state.operation === 'uploading',
    
    // Métodos de controle
    startLoading,
    updateProgress,
    stopLoading,
    cancelLoading,
    withLoading
  }
}

/**
 * Hook especializado para formulários
 */
export function useFormLoadingState() {
  const loading = useLoadingState({
    defaultMessage: {
      ...DEFAULT_MESSAGES,
      validating: 'Validando formulário...',
      saving: 'Salvando dados...',
      submitting: 'Enviando formulário...',
      processing: 'Processando dados...',
      idle: '',
      loading: 'Carregando...',
      deleting: 'Removendo...',
      updating: 'Atualizando...',
      uploading: 'Enviando...'
    }
  })

  const submitWithLoading = useCallback(async <T,>(
    submitFn: () => Promise<T>,
    options?: {
      validationMessage?: string
      submissionMessage?: string
      successMessage?: string
    }
  ) => {
    // Fase de validação
    loading.startLoading('validating', options?.validationMessage)
    await new Promise(resolve => setTimeout(resolve, 200)) // Simular validação
    
    // Fase de submissão
    loading.startLoading('submitting', options?.submissionMessage)
    
    try {
      const result = await submitFn()
      loading.stopLoading(options?.successMessage || 'Dados salvos com sucesso!')
      return result
    } catch (error) {
      loading.stopLoading()
      throw error
    }
  }, [loading])

  return {
    ...loading,
    submitWithLoading
  }
}

/**
 * Hook para múltiplos estados de loading simultâneos
 */
export function useMultipleLoadingStates() {
  const [states, setStates] = useState<Record<string, LoadingState>>({})

  const startLoading = useCallback((
    key: string,
    operation: LoadingOperation,
    message?: string
  ) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        isLoading: true,
        operation,
        message: message || DEFAULT_MESSAGES[operation],
        startTime: Date.now()
      }
    }))
  }, [])

  const stopLoading = useCallback((key: string, message?: string) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        isLoading: false,
        operation: 'idle',
        message,
        progress: undefined,
        startTime: undefined
      }
    }))
  }, [])

  const updateProgress = useCallback((key: string, progress: number, message?: string) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        progress,
        message: message || prev[key]?.message
      }
    }))
  }, [])

  const isAnyLoading = useCallback(() => {
    return Object.values(states).some(state => state.isLoading)
  }, [states])

  const getLoadingState = useCallback((key: string) => {
    return states[key] || { isLoading: false, operation: 'idle' as LoadingOperation }
  }, [states])

  return {
    states,
    startLoading,
    stopLoading,
    updateProgress,
    isAnyLoading,
    getLoadingState
  }
}