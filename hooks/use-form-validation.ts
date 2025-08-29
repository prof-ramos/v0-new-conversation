"use client"

import { useState, useCallback } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import { validateField, fieldSchemas } from '@/lib/validation-schemas'

type FieldName = keyof typeof fieldSchemas

interface ValidationState {
  errors: Record<string, string>
  isValidating: Record<string, boolean>
  hasBeenTouched: Record<string, boolean>
}

interface UseFormValidationOptions {
  validateOnChange?: boolean
  validateOnBlur?: boolean
  debounceMs?: number
}

/**
 * Hook para validação em tempo real de formulários
 * Suporta validação debounced, por campo e estados de loading
 */
export function useFormValidation(options: UseFormValidationOptions = {}) {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 500
  } = options

  const [validationState, setValidationState] = useState<ValidationState>({
    errors: {},
    isValidating: {},
    hasBeenTouched: {}
  })

  /**
   * Valida um campo específico
   */
  const validateSingleField = useCallback((fieldName: FieldName, value: any) => {
    setValidationState(prev => ({
      ...prev,
      isValidating: { ...prev.isValidating, [fieldName]: true }
    }))

    const result = validateField(fieldName, value)

    setValidationState(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [fieldName]: result.success ? '' : result.error || ''
      },
      isValidating: { ...prev.isValidating, [fieldName]: false },
      hasBeenTouched: { ...prev.hasBeenTouched, [fieldName]: true }
    }))

    return result.success
  }, [])

  /**
   * Versão debounced da validação
   */
  const debouncedValidateField = useDebouncedCallback(
    validateSingleField,
    debounceMs
  )

  /**
   * Handler para mudança de campo (onChange)
   */
  const handleFieldChange = useCallback((fieldName: FieldName, value: any) => {
    // Limpar erro imediatamente quando usuário começa a digitar
    setValidationState(prev => ({
      ...prev,
      errors: { ...prev.errors, [fieldName]: '' }
    }))

    // Validar com debounce se habilitado
    if (validateOnChange) {
      debouncedValidateField(fieldName, value)
    }
  }, [validateOnChange, debouncedValidateField])

  /**
   * Handler para blur de campo (onBlur)
   */
  const handleFieldBlur = useCallback((fieldName: FieldName, value: any) => {
    if (validateOnBlur) {
      // Cancelar validação debounced e validar imediatamente
      debouncedValidateField.cancel()
      validateSingleField(fieldName, value)
    }
  }, [validateOnBlur, validateSingleField, debouncedValidateField])

  /**
   * Força a validação de um campo específico
   */
  const forceValidateField = useCallback((fieldName: FieldName, value: any) => {
    debouncedValidateField.cancel()
    return validateSingleField(fieldName, value)
  }, [validateSingleField, debouncedValidateField])

  /**
   * Valida todos os campos fornecidos
   */
  const validateAllFields = useCallback((formData: Record<string, any>) => {
    const fieldNames = Object.keys(formData) as FieldName[]
    const results: Record<string, boolean> = {}

    // Cancelar todas as validações debounced pendentes
    debouncedValidateField.cancel()

    // Validar todos os campos
    fieldNames.forEach(fieldName => {
      if (fieldName in fieldSchemas) {
        results[fieldName] = validateSingleField(fieldName, formData[fieldName])
      }
    })

    const isValid = Object.values(results).every(Boolean)
    return { isValid, results }
  }, [validateSingleField, debouncedValidateField])

  /**
   * Limpa todos os erros e estados
   */
  const clearValidation = useCallback(() => {
    debouncedValidateField.cancel()
    setValidationState({
      errors: {},
      isValidating: {},
      hasBeenTouched: {}
    })
  }, [debouncedValidateField])

  /**
   * Limpa erro de um campo específico
   */
  const clearFieldError = useCallback((fieldName: FieldName) => {
    setValidationState(prev => ({
      ...prev,
      errors: { ...prev.errors, [fieldName]: '' }
    }))
  }, [])

  /**
   * Verifica se um campo tem erro
   */
  const hasError = useCallback((fieldName: FieldName) => {
    return !!validationState.errors[fieldName]
  }, [validationState.errors])

  /**
   * Obtém a mensagem de erro de um campo
   */
  const getError = useCallback((fieldName: FieldName) => {
    return validationState.errors[fieldName] || ''
  }, [validationState.errors])

  /**
   * Verifica se um campo está sendo validado
   */
  const isValidating = useCallback((fieldName: FieldName) => {
    return !!validationState.isValidating[fieldName]
  }, [validationState.isValidating])

  /**
   * Verifica se um campo foi tocado
   */
  const hasBeenTouched = useCallback((fieldName: FieldName) => {
    return !!validationState.hasBeenTouched[fieldName]
  }, [validationState.hasBeenTouched])

  /**
   * Verifica se o formulário tem algum erro
   */
  const hasAnyError = useCallback(() => {
    return Object.values(validationState.errors).some(error => !!error)
  }, [validationState.errors])

  /**
   * Verifica se algum campo está sendo validado
   */
  const isAnyFieldValidating = useCallback(() => {
    return Object.values(validationState.isValidating).some(Boolean)
  }, [validationState.isValidating])

  return {
    // Estados
    errors: validationState.errors,
    validatingFields: validationState.isValidating,
    touchedFields: validationState.hasBeenTouched,

    // Handlers
    handleFieldChange,
    handleFieldBlur,

    // Métodos de validação
    forceValidateField,
    validateAllFields,

    // Utilitários
    clearValidation,
    clearFieldError,
    hasError,
    getError,
    isValidating,
    hasBeenTouched,
    hasAnyError,
    isAnyFieldValidating
  }
}

/**
 * Hook especializado para validação de tarefas
 */
export function useTaskValidation(options?: UseFormValidationOptions) {
  const validation = useFormValidation(options)

  /**
   * Validação específica para formulário de tarefa
   */
  const validateTaskForm = useCallback((formData: {
    titulo?: string
    categoria?: string
    prioridade?: string
    data_vencimento?: string
    descricao?: string
    tempo_estimado?: number | null
  }) => {
    return validation.validateAllFields({
      titulo: formData.titulo || '',
      categoria: formData.categoria || '',
      prioridade: formData.prioridade || '',
      data_vencimento: formData.data_vencimento || '',
      descricao: formData.descricao || '',
      tempo_estimado: formData.tempo_estimado
    })
  }, [validation])

  return {
    ...validation,
    validateTaskForm
  }
}

/**
 * Hook para validação com feedback visual
 */
export function useFieldValidationFeedback() {
  const getFieldProps = useCallback((
    fieldName: FieldName,
    validation: ReturnType<typeof useFormValidation>,
    value: any
  ) => {
    const hasError = validation.hasError(fieldName)
    const isValidating = validation.isValidating(fieldName)
    const hasBeenTouched = validation.hasBeenTouched(fieldName)

    return {
      // Props para o input
      'aria-invalid': hasError,
      'aria-describedby': hasError ? `${fieldName}-error` : undefined,
      className: hasError ? 'border-destructive focus:ring-destructive' : undefined,

      // Handlers
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const newValue = e.target.value
        validation.handleFieldChange(fieldName, newValue)
      },
      onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const newValue = e.target.value
        validation.handleFieldBlur(fieldName, newValue)
      },

      // Estados para UI
      error: validation.getError(fieldName),
      isValidating,
      hasBeenTouched,
      hasError
    }
  }, [])

  return { getFieldProps }
}