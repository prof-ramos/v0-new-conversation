#!/usr/bin/env npx ts-node

import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import path from 'path'

const execAsync = promisify(exec)

class TestRunner {
  private logFile: string
  
  constructor() {
    const logsDir = path.join(process.cwd(), 'logs')
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true })
    }
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]
    this.logFile = path.join(logsDir, `test-runner_${timestamp}.log`)
    
    this.log('INFO', '=== INICIANDO RUNNER DE TESTES E2E ===')
  }
  
  private log(level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG', message: string, data?: any) {
    const timestamp = new Date().toISOString()
    const logLine = `[${timestamp}] [${level}] ${message}${data ? `\n  ${JSON.stringify(data, null, 2)}` : ''}\n`
    
    // Console com cores
    const colors = {
      INFO: '\x1b[32m',     // Green
      WARNING: '\x1b[33m',  // Yellow  
      ERROR: '\x1b[31m',    // Red
      DEBUG: '\x1b[36m'     // Cyan
    }
    const reset = '\x1b[0m'
    console.log(`${colors[level] || ''}[${level}] ${message}${reset}`)
    
    if (data) {
      console.log(`  ${JSON.stringify(data, null, 2)}`)
    }
    
    // Arquivo
    try {
      writeFileSync(this.logFile, logLine, { flag: 'a' })
    } catch (error) {
      console.error('Erro ao escrever log:', error)
    }
  }
  
  async checkEnvironment() {
    this.log('INFO', 'Verificando ambiente de testes...')
    
    try {
      // Verificar se o servidor dev está rodando
      const { stdout: curlOutput } = await execAsync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "0"')
      const serverStatus = curlOutput.trim()
      
      if (serverStatus !== '200') {
        this.log('WARNING', 'Servidor de desenvolvimento não está rodando na porta 3000')
        this.log('INFO', 'Tentando iniciar servidor de desenvolvimento...')
        
        // Tentar iniciar o servidor em background
        exec('pnpm dev > logs/dev-server.log 2>&1 &', (error) => {
          if (error) {
            this.log('ERROR', 'Erro ao iniciar servidor dev', { error: (error as Error).message })
          }
        })
        
        // Aguardar servidor iniciar
        this.log('INFO', 'Aguardando servidor inicializar...')
        await new Promise(resolve => setTimeout(resolve, 10000))
        
        // Verificar novamente
        const { stdout: newStatus } = await execAsync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "0"')
        if (newStatus.trim() !== '200') {
          throw new Error('Não foi possível iniciar o servidor de desenvolvimento')
        }
      }
      
      this.log('INFO', 'Servidor de desenvolvimento está rodando (HTTP 200)')
      
      // Verificar se Playwright está configurado
      const { stdout: playwrightVersion } = await execAsync('npx playwright --version')
      this.log('INFO', `Playwright versão: ${playwrightVersion.trim()}`)
      
    } catch (error) {
      this.log('ERROR', 'Erro na verificação do ambiente', { error: (error as Error).message })
      throw error
    }
  }
  
  async runTests() {
    this.log('INFO', 'Executando testes E2E...')
    
    try {
      const startTime = Date.now()
      
      // Executar testes com configurações específicas
      const command = 'npx playwright test --config=playwright.config.ts --reporter=list,json --output-dir=logs/test-results'
      this.log('INFO', `Comando de teste: ${command}`)
      
      const { stdout, stderr } = await execAsync(command, { 
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        timeout: 300000 // 5 minutos timeout
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      this.log('INFO', 'Testes executados com sucesso!', {
        duration: `${duration}ms (${(duration/1000).toFixed(2)}s)`,
        stdout: stdout.slice(0, 2000), // Primeiros 2000 chars
        stderr: stderr ? stderr.slice(0, 1000) : 'Nenhum erro'
      })
      
      return { success: true, stdout, stderr, duration }
      
    } catch (error: any) {
      this.log('ERROR', 'Erro durante execução dos testes', { 
        error: error.message,
        stdout: error.stdout?.slice(0, 2000),
        stderr: error.stderr?.slice(0, 1000)
      })
      
      return { success: false, error: error.message }
    }
  }
  
  async generateSummary(testResult: any) {
    this.log('INFO', 'Gerando resumo dos resultados...')
    
    const summary = {
      timestamp: new Date().toISOString(),
      success: testResult.success,
      duration: testResult.duration,
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      },
      logs: {
        mainLog: this.logFile,
        testResults: 'logs/test-results.json',
        screenshots: 'logs/',
        videos: 'logs/test-results/'
      }
    }
    
    const summaryPath = path.join('logs', 'test-summary.json')
    writeFileSync(summaryPath, JSON.stringify(summary, null, 2))
    
    this.log('INFO', 'Resumo salvo em:', { path: summaryPath })
    
    // Mostrar resumo no console
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMO DOS TESTES E2E')
    console.log('='.repeat(60))
    console.log(`✅ Status: ${testResult.success ? 'SUCESSO' : 'FALHA'}`)
    if (testResult.duration) {
      console.log(`⏱️  Duração: ${(testResult.duration/1000).toFixed(2)}s`)
    }
    console.log(`📁 Logs disponíveis em: logs/`)
    console.log(`🖼️  Screenshots em: logs/`)
    console.log(`📋 Relatório JSON: logs/test-results.json`)
    console.log('='.repeat(60))
  }
  
  async run() {
    try {
      await this.checkEnvironment()
      const testResult = await this.runTests()
      await this.generateSummary(testResult)
      
      this.log('INFO', '=== RUNNER CONCLUÍDO ===')
      
      process.exit(testResult.success ? 0 : 1)
      
    } catch (error) {
      this.log('ERROR', 'Erro crítico no runner', { error: (error as Error).message })
      process.exit(1)
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const runner = new TestRunner()
  runner.run().catch(console.error)
}

export { TestRunner }