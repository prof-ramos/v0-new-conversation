"use client"

import { useEffect, useCallback, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { clientLogger } from '@/lib/client-logger'

interface AutoSaveOptions {
  key: string // Chave única para identificar o draft no localStorage
  debounceMs?: number // Delay para salvar após mudanças
  maxAge?: number // Idade máxima do draft em ms (padrão: 24 horas)
  enabled?: boolean // Se o auto-save está habilitado
  onSave?: (data: any) => void // Callback quando salva
  onRestore?: (data: any) => void // Callback quando restaura
  onClear?: () => void // Callback quando limpa
}

interface DraftData<T = any> {
  data: T
  timestamp: number
  version: string
}

const STORAGE_PREFIX = 'autosave_'
const DEFAULT_MAX_AGE = 24 * 60 * 60 * 1000 // 24 horas
const CURRENT_VERSION = '1.0.0'

/**
 * Hook para auto-save local de formulários
 * Salva automaticamente no localStorage e permite recuperação
 */
export function useAutoSave<T = any>(options: AutoSaveOptions) {
  const {
    key,
    debounceMs = 2000,
    maxAge = DEFAULT_MAX_AGE,
    enabled = true,
    onSave,
    onRestore,
    onClear
  } = options

  const [hasDraft, setHasDraft] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const isInitializedRef = useRef(false)
  const storageKey = `${STORAGE_PREFIX}${key}`

  /**
   * Salva dados no localStorage
   */
  const saveToStorage = useCallback((data: T) => {
    if (!enabled || typeof window === 'undefined') return

    try {
      const draftData: DraftData<T> = {
        data,
        timestamp: Date.now(),
        version: CURRENT_VERSION
      }

      localStorage.setItem(storageKey, JSON.stringify(draftData))
      setHasDraft(true)
      setLastSaved(new Date())
      
      clientLogger.debug('[AUTO_SAVE] Dados salvos localmente', {
        key,
        timestamp: draftData.timestamp
      })

      onSave?.(data)
    } catch (error) {
      clientLogger.error('[AUTO_SAVE] Erro ao salvar no localStorage', {
        key,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }, [enabled, storageKey, key, onSave])

  /**
   * Versão debounced do save
   */
  const debouncedSave = useDebouncedCallback(saveToStorage, debounceMs)

  /**
   * Carrega dados do localStorage
   */
  const loadFromStorage = useCallback((): T | null => {
    if (!enabled || typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) return null

      const draftData: DraftData<T> = JSON.parse(stored)
      
      // Verificar se o draft não está muito antigo
      const age = Date.now() - draftData.timestamp
      if (age > maxAge) {
        clientLogger.info('[AUTO_SAVE] Draft expirado, removendo', {
          key,
          age,
          maxAge
        })
        localStorage.removeItem(storageKey)
        return null
      }

      // Verificar compatibilidade de versão
      if (draftData.version !== CURRENT_VERSION) {
        clientLogger.warning('[AUTO_SAVE] Versão incompatível, removendo draft', {
          key,
          draftVersion: draftData.version,
          currentVersion: CURRENT_VERSION
        })
        localStorage.removeItem(storageKey)
        return null
      }

      setHasDraft(true)
      setLastSaved(new Date(draftData.timestamp))
      
      clientLogger.info('[AUTO_SAVE] Dados carregados do localStorage', {
        key,
        timestamp: draftData.timestamp
      })

      onRestore?.(draftData.data)
      return draftData.data
    } catch (error) {
      clientLogger.error('[AUTO_SAVE] Erro ao carregar do localStorage', {
        key,
        error: error instanceof Error ? error.message : String(error)
      })
      
      // Limpar dados corrompidos
      localStorage.removeItem(storageKey)
      return null
    }
  }, [enabled, storageKey, key, maxAge, onRestore])

  /**
   * Remove dados do localStorage
   */
  const clearStorage = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(storageKey)
      setHasDraft(false)
      setLastSaved(null)
      
      clientLogger.info('[AUTO_SAVE] Draft removido', { key })
      onClear?.()
    } catch (error) {
      clientLogger.error('[AUTO_SAVE] Erro ao limpar localStorage', {
        key,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }, [storageKey, key, onClear])

  /**
   * Força o salvamento imediatamente (sem debounce)
   */
  const forceSave = useCallback((data: T) => {
    debouncedSave.cancel() // Cancela debounce pendente
    saveToStorage(data)
  }, [debouncedSave, saveToStorage])

  /**
   * Obtém informações sobre o draft
   */
  const getDraftInfo = useCallback(() => {
    if (!hasDraft || !lastSaved) return null

    return {
      age: Date.now() - lastSaved.getTime(),
      timestamp: lastSaved,
      isExpired: (Date.now() - lastSaved.getTime()) > maxAge
    }
  }, [hasDraft, lastSaved, maxAge])

  /**
   * Verifica e limpa drafts expirados de outras chaves
   */
  const cleanupExpiredDrafts = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      const keysToRemove: string[] = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key || !key.startsWith(STORAGE_PREFIX)) continue

        const stored = localStorage.getItem(key)
        if (!stored) continue

        try {
          const draftData: DraftData = JSON.parse(stored)
          const age = Date.now() - draftData.timestamp
          
          if (age > maxAge) {
            keysToRemove.push(key)
          }
        } catch {
          // Dados corrompidos, marcar para remoção
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        clientLogger.debug('[AUTO_SAVE] Draft expirado removido', { key })
      })

      if (keysToRemove.length > 0) {
        clientLogger.info('[AUTO_SAVE] Cleanup completado', {
          removedCount: keysToRemove.length
        })
      }
    } catch (error) {
      clientLogger.error('[AUTO_SAVE] Erro durante cleanup', {
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }, [maxAge])

  /**
   * Inicialização do hook
   */
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true
      
      // Verificar se há draft salvo
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        setHasDraft(true)
        try {
          const draftData: DraftData = JSON.parse(stored)
          setLastSaved(new Date(draftData.timestamp))
        } catch {
          // Dados corrompidos, limpar
          localStorage.removeItem(storageKey)
        }
      }

      // Cleanup de drafts expirados
      cleanupExpiredDrafts()
    }
  }, [storageKey, cleanupExpiredDrafts])

  /**
   * Cleanup quando o componente é desmontado
   */
  useEffect(() => {
    return () => {
      debouncedSave.cancel()
    }
  }, [debouncedSave])

  /**
   * Salvar automaticamente quando a página é fechada
   */
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const handleBeforeUnload = () => {
      debouncedSave.flush() // Força a execução de qualquer save pendente
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [enabled, debouncedSave])

  return {
    // Estado
    hasDraft,
    lastSaved,
    
    // Métodos principais
    save: debouncedSave,
    forceSave,
    load: loadFromStorage,
    clear: clearStorage,
    
    // Utilitários
    getDraftInfo,
    cleanupExpiredDrafts,
    
    // Computados
    isEnabled: enabled
  }
}

/**
 * Hook especializado para formulários
 */
export function useFormAutoSave<T extends Record<string, any>>(
  formKey: string,
  options?: Omit<AutoSaveOptions, 'key'>
) {
  const autoSave = useAutoSave<T>({
    key: `form_${formKey}`,
    ...options
  })

  /**
   * Salva apenas campos que têm valor
   */
  const saveFormData = useCallback((formData: T) => {
    // Filtrar campos vazios para não poluir o storage
    const nonEmptyData = Object.entries(formData as Record<string, any>).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        (acc as any)[key] = value
      }
      return acc
    }, {} as Partial<T>)

    if (Object.keys(nonEmptyData).length > 0) {
      autoSave.save(nonEmptyData as T)
    }
  }, [autoSave])

  /**
   * Restaura dados do formulário
   */
  const restoreFormData = useCallback((): Partial<T> | null => {
    return autoSave.load()
  }, [autoSave])

  return {
    ...autoSave,
    saveFormData,
    restoreFormData
  }
}

/**
 * Utilitários para gerenciar auto-save globalmente
 */
export const autoSaveUtils = {
  /**
   * Lista todas as chaves de auto-save
   */
  getAllKeys(): string[] {
    if (typeof window === 'undefined') return []
    
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keys.push(key.replace(STORAGE_PREFIX, ''))
      }
    }
    return keys
  },

  /**
   * Remove todos os drafts
   */
  clearAll(): void {
    if (typeof window === 'undefined') return
    
    const keysToRemove = this.getAllKeys()
    keysToRemove.forEach(key => {
      localStorage.removeItem(`${STORAGE_PREFIX}${key}`)
    })
    
    clientLogger.info('[AUTO_SAVE] Todos os drafts foram limpos', {
      count: keysToRemove.length
    })
  },

  /**
   * Obtém estatísticas dos drafts
   */
  getStats() {
    if (typeof window === 'undefined') return null
    
    const keys = this.getAllKeys()
    let totalSize = 0
    let oldestTimestamp = Date.now()
    let newestTimestamp = 0

    keys.forEach(key => {
      try {
        const data = localStorage.getItem(`${STORAGE_PREFIX}${key}`)
        if (data) {
          totalSize += data.length
          const draft: DraftData = JSON.parse(data)
          oldestTimestamp = Math.min(oldestTimestamp, draft.timestamp)
          newestTimestamp = Math.max(newestTimestamp, draft.timestamp)
        }
      } catch {
        // Ignorar dados corrompidos
      }
    })

    return {
      count: keys.length,
      totalSizeBytes: totalSize,
      oldestTimestamp: oldestTimestamp === Date.now() ? null : oldestTimestamp,
      newestTimestamp: newestTimestamp === 0 ? null : newestTimestamp
    }
  }
}