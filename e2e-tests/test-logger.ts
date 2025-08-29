import { writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'

export class TestLogger {
  private logFile: string
  private testName: string
  private startTime: Date
  
  constructor(testName: string) {
    this.testName = testName
    this.startTime = new Date()
    
    // Ensure logs directory exists
    const logsDir = path.join(process.cwd(), 'logs')
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true })
    }
    
    // Create timestamped log file
    const timestamp = this.startTime.toISOString().split('T')[0]
    this.logFile = path.join(logsDir, `e2e_${testName}_${timestamp}.log`)
    
    // Initialize log file with header
    this.log('INFO', `=== TESTE E2E INICIADO ===`)
    this.log('INFO', `Teste: ${testName}`)
    this.log('INFO', `Data/Hora: ${this.startTime.toISOString()}`)
    this.log('INFO', `================================`)
  }
  
  log(level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL', message: string, extra?: any) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      test: this.testName,
      message,
      extra: extra ? JSON.stringify(extra, null, 2) : undefined
    }
    
    // Format for file
    let logLine = `[${timestamp}] [${level}] [${this.testName}] ${message}`
    if (extra) {
      logLine += `\n  Extra Data: ${JSON.stringify(extra, null, 2)}`
    }
    logLine += '\n'
    
    // Write to file
    try {
      writeFileSync(this.logFile, logLine, { flag: 'a' })
    } catch (error) {
      console.error('Erro ao escrever no log:', error)
    }
    
    // Also log to console with colors
    const colors = {
      DEBUG: '\x1b[36m',    // Cyan
      INFO: '\x1b[32m',     // Green
      WARNING: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m',    // Red
      CRITICAL: '\x1b[35m'  // Magenta
    }
    const reset = '\x1b[0m'
    
    console.log(`${colors[level]}[${level}] [${this.testName}] ${message}${reset}`)
    if (extra) {
      console.log(`  ${JSON.stringify(extra, null, 2)}`)
    }
  }
  
  debug(message: string, extra?: any) {
    this.log('DEBUG', message, extra)
  }
  
  info(message: string, extra?: any) {
    this.log('INFO', message, extra)
  }
  
  warning(message: string, extra?: any) {
    this.log('WARNING', message, extra)
  }
  
  error(message: string, extra?: any) {
    this.log('ERROR', message, extra)
  }
  
  critical(message: string, extra?: any) {
    this.log('CRITICAL', message, extra)
  }
  
  finalize() {
    const endTime = new Date()
    const duration = endTime.getTime() - this.startTime.getTime()
    
    this.log('INFO', `=== TESTE FINALIZADO ===`)
    this.log('INFO', `Duração: ${duration}ms (${(duration/1000).toFixed(2)}s)`)
    this.log('INFO', `Fim: ${endTime.toISOString()}`)
    this.log('INFO', `=========================`)
  }
}