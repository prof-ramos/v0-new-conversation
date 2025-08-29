// Logger para uso no lado cliente (componentes React)
interface LogEntry {
  timestamp: string
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  component: string
  message: string
  data?: any
}

class ClientLogger {
  constructor(private context = 'CLIENT') {}

  private formatLog(entry: LogEntry): string {
    return `[${entry.timestamp}] ${entry.level} [${entry.component}] ${entry.message} ${
      entry.data ? JSON.stringify(entry.data) : ''
    }`
  }

  private writeLog(level: LogEntry['level'], component: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      data
    }

    // Log apenas no console (cliente não pode escrever arquivos)
    const consoleMsg = this.formatLog(entry)
    
    switch (level) {
      case 'DEBUG':
        console.debug(consoleMsg)
        break
      case 'INFO':
        console.info(consoleMsg)
        break
      case 'WARNING':
        console.warn(consoleMsg)
        break
      case 'ERROR':
      case 'CRITICAL':
        console.error(consoleMsg)
        break
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

// Instâncias para uso no cliente
export const clientLogger = new ClientLogger('CLIENT')
export const clientTaskLogger = new ClientLogger('CLIENT_TASKS')

export default clientLogger