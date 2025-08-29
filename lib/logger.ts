interface LogEntry {
  timestamp: string
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  component: string
  message: string
  data?: any
}

class Logger {
  private isServer = typeof window === 'undefined'
  private logFile?: string

  constructor(private context = 'APP') {
    if (this.isServer) {
      try {
        const fs = require('fs')
        const path = require('path')
        const logDir = path.join(process.cwd(), 'logs')
        
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true })
        }

        const timestamp = new Date().toISOString().split('T')[0]
        this.logFile = path.join(logDir, `${context.toLowerCase()}_${timestamp}.log`)
      } catch (error) {
        console.warn('Logger file system unavailable, using console only')
      }
    }

    // Log inicial apenas se tivermos contexto válido
    this.info('Logger inicializado', { context, logFile: this.logFile })
  }

  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry) + '\n'
  }

  private writeLog(level: LogEntry['level'], component: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data
    }

    // Log para console
    const consoleMsg = `[${entry.timestamp}] ${level} [${component}] ${message}`
    
    switch (level) {
      case 'DEBUG':
        console.debug(consoleMsg, data || '')
        break
      case 'INFO':
        console.info(consoleMsg, data || '')
        break
      case 'WARNING':
        console.warn(consoleMsg, data || '')
        break
      case 'ERROR':
      case 'CRITICAL':
        console.error(consoleMsg, data || '')
        break
    }

    // Log para arquivo apenas no servidor
    if (this.isServer && this.logFile) {
      try {
        const fs = require('fs')
        fs.appendFileSync(this.logFile, this.formatLog(entry))
      } catch (error) {
        console.error('Erro ao escrever no arquivo de log:', error)
      }
    }
  }

  debug(message: string, data?: any, component = this.context) {
    this.writeLog('DEBUG', component, message, data)
  }

  info(message: string, data?: any, component = this.context) {
    this.writeLog('INFO', component, message, data)
  }

  warning(message: string, data?: any, component = this.context) {
    this.writeLog('WARNING', component, message, data)
  }

  error(message: string, data?: any, component = this.context) {
    this.writeLog('ERROR', component, message, data)
  }

  critical(message: string, data?: any, component = this.context) {
    this.writeLog('CRITICAL', component, message, data)
  }
}

// Instâncias singleton para diferentes contextos
export const logger = new Logger('APP')
export const taskLogger = new Logger('TASKS')
export const testLogger = new Logger('TESTS')

// Hook para logging de erros React
export const useErrorLogger = () => {
  return {
    logError: (error: Error, context?: string, data?: any) => {
      logger.error(`React Error${context ? ` in ${context}` : ''}`, {
        message: error.message,
        stack: error.stack,
        data
      })
    }
  }
}

export default logger