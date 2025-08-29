// Mapeamento inteligente de erros do sistema
import { PostgrestError } from '@supabase/supabase-js'

export type ErrorCode = 
  | 'AUTH_001' | 'AUTH_002' | 'AUTH_003'
  | 'DB_001' | 'DB_002' | 'DB_003' 
  | 'NET_001' | 'NET_002'
  | 'VAL_001' | 'VAL_002' | 'VAL_003'
  | 'UI_001' | 'UI_002'
  | 'SYS_001'
  | 'UNKNOWN_ERROR'

export interface ErrorConfig {
  title: string
  message: string
  variant: 'default' | 'destructive' | 'warning' | 'success'
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  retryable?: boolean
  logLevel: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
}

export const errorMappings: Record<ErrorCode, ErrorConfig> = {
  // Erros de Autenticação
  AUTH_001: {
    title: '🔐 Login Necessário',
    message: 'Para criar tarefas, você precisa estar autenticado.',
    variant: 'default',
    action: {
      label: 'Fazer Login',
      href: '/auth/login'
    },
    retryable: false,
    logLevel: 'INFO'
  },
  
  AUTH_002: {
    title: '⏰ Sessão Expirada',
    message: 'Sua sessão expirou. Redirecionando para o login...',
    variant: 'warning',
    action: {
      label: 'Login Agora',
      href: '/auth/login'
    },
    retryable: false,
    logLevel: 'WARNING'
  },
  
  AUTH_003: {
    title: '🚫 Acesso Não Autorizado',
    message: 'Você não tem permissão para esta operação.',
    variant: 'destructive',
    retryable: false,
    logLevel: 'CRITICAL'
  },

  // Erros de Banco de Dados
  DB_001: {
    title: '💾 Erro ao Salvar',
    message: 'Não foi possível salvar. Tentando novamente...',
    variant: 'destructive',
    action: {
      label: 'Tentar Novamente',
      onClick: () => window.location.reload()
    },
    retryable: true,
    logLevel: 'ERROR'
  },
  
  DB_002: {
    title: '⏳ Carregamento Lento',
    message: 'A operação está demorando mais que o normal.',
    variant: 'warning',
    retryable: true,
    logLevel: 'WARNING'
  },
  
  DB_003: {
    title: '❌ Dados Inválidos',
    message: 'Verifique os campos destacados e tente novamente.',
    variant: 'destructive',
    retryable: false,
    logLevel: 'WARNING'
  },

  // Erros de Rede
  NET_001: {
    title: '🌐 Sem Conexão',
    message: 'Verifique sua conexão com a internet.',
    variant: 'destructive',
    action: {
      label: 'Tentar Novamente',
      onClick: () => window.location.reload()
    },
    retryable: true,
    logLevel: 'CRITICAL'
  },
  
  NET_002: {
    title: '🐌 Conexão Lenta',
    message: 'A operação pode demorar mais que o normal.',
    variant: 'warning',
    retryable: true,
    logLevel: 'WARNING'
  },

  // Erros de Validação
  VAL_001: {
    title: '❌ Campo Obrigatório',
    message: 'Por favor, preencha todos os campos obrigatórios.',
    variant: 'destructive',
    retryable: false,
    logLevel: 'INFO'
  },
  
  VAL_002: {
    title: '📅 Data Inválida',
    message: 'A data deve ser hoje ou no futuro.',
    variant: 'destructive',
    retryable: false,
    logLevel: 'INFO'
  },
  
  VAL_003: {
    title: '⏱️ Tempo Inválido',
    message: 'O tempo estimado deve estar entre 5 e 480 minutos.',
    variant: 'destructive',
    retryable: false,
    logLevel: 'INFO'
  },

  // Erros de Interface
  UI_001: {
    title: '🔄 Interface Não Responde',
    message: 'Recarregue a página para resolver.',
    variant: 'warning',
    action: {
      label: 'Recarregar',
      onClick: () => window.location.reload()
    },
    retryable: true,
    logLevel: 'DEBUG'
  },
  
  UI_002: {
    title: '📝 Formulário Não Resetou',
    message: 'Limpe manualmente ou recarregue a página.',
    variant: 'warning',
    retryable: true,
    logLevel: 'DEBUG'
  },

  // Erros de Sistema
  SYS_001: {
    title: '😞 Algo Deu Errado',
    message: 'Erro inesperado. Nossa equipe foi notificada.',
    variant: 'destructive',
    action: {
      label: 'Reportar Problema',
      onClick: () => {
        const email = 'suporte@dashboard.com'
        const subject = 'Erro no Sistema - SYS_001'
        const body = `Descreva o que estava fazendo quando o erro ocorreu:\n\n\nTimestamp: ${new Date().toISOString()}`
        window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
      }
    },
    retryable: false,
    logLevel: 'CRITICAL'
  },

  // Erro Desconhecido
  UNKNOWN_ERROR: {
    title: '🤔 Erro Desconhecido',
    message: 'Algo inesperado aconteceu. Tente recarregar a página.',
    variant: 'destructive',
    action: {
      label: 'Recarregar',
      onClick: () => window.location.reload()
    },
    retryable: true,
    logLevel: 'ERROR'
  }
}

/**
 * Mapeia um erro para um código de erro específico
 */
export function mapErrorToCode(error: Error | PostgrestError | string | unknown): ErrorCode {
  if (typeof error === 'string') {
    // Strings de erro comuns
    if (error.toLowerCase().includes('authentication') || error.toLowerCase().includes('unauthorized')) {
      return 'AUTH_001'
    }
    if (error.toLowerCase().includes('network') || error.toLowerCase().includes('fetch')) {
      return 'NET_001'
    }
    return 'UNKNOWN_ERROR'
  }
  
  // Erros do Supabase/PostgreSQL
  if (error && typeof error === 'object' && 'code' in error) {
    const pgError = error as PostgrestError
    
    switch (pgError.code) {
      case 'PGRST116': // JWT token invalid
      case 'PGRST301': // JWT token expired
        return 'AUTH_002'
      
      case '42501': // Insufficient privilege (RLS violation)
        return 'AUTH_003'
      
      case '23505': // Unique constraint violation
        return 'DB_003'
      
      case '23514': // Check constraint violation
        return 'VAL_003'
      
      case '23502': // Not null constraint violation
        return 'VAL_001'
      
      case '08006': // Connection failure
      case '08001': // Unable to connect
        return 'NET_001'
      
      case '57014': // Query timeout
        return 'DB_002'
      
      default:
        return 'DB_001'
    }
  }
  
  // Erros JavaScript padrão
  if (error instanceof Error) {
    // Network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'NET_001'
    }
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      return 'NET_001'
    }
    
    // Authentication errors
    if (error.message.toLowerCase().includes('authentication') || 
        error.message.toLowerCase().includes('unauthorized')) {
      return 'AUTH_001'
    }
    
    // Validation errors
    if (error.message.toLowerCase().includes('required') || 
        error.message.toLowerCase().includes('missing')) {
      return 'VAL_001'
    }
    
    // Generic network timeout
    if (error.message.toLowerCase().includes('timeout')) {
      return 'NET_002'
    }
  }
  
  return 'UNKNOWN_ERROR'
}

/**
 * Verifica se um erro é retryable
 */
export function isRetryableError(errorCode: ErrorCode): boolean {
  return errorMappings[errorCode]?.retryable || false
}

/**
 * Obtém a configuração de um erro
 */
export function getErrorConfig(errorCode: ErrorCode): ErrorConfig {
  return errorMappings[errorCode] || errorMappings.UNKNOWN_ERROR
}