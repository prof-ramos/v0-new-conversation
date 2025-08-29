import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

// Logger específico para testes E2E
const testLogger = {
  log: (message: string, data?: any) => {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}\n`
    
    console.log(logEntry.trim())
    
    const logFile = path.join(process.cwd(), 'logs', `simple-task-test_${Date.now()}_${new Date().toISOString().split('T')[0]}.log`)
    try {
      fs.appendFileSync(logFile, logEntry)
    } catch (error) {
      console.error('Erro ao escrever no log:', error)
    }
  }
}

test.describe('Teste Simples: Carregar Página de Tarefas', () => {
  test('Deve carregar a página de tarefas e verificar elementos', async ({ page }) => {
    testLogger.log('=== TESTE SIMPLES: CARREGAR PÁGINA DE TAREFAS ===')
    
    // Interceptar logs do console da página
    page.on('console', msg => {
      if (msg.type() === 'error') {
        testLogger.log('ERRO NO CONSOLE:', msg.text())
      } else if (msg.text().includes('TASKS') || msg.text().includes('tarefa')) {
        testLogger.log('LOG RELACIONADO A TAREFAS:', msg.text())
      }
    })

    // Interceptar erros JavaScript
    page.on('pageerror', error => {
      testLogger.log('ERRO JAVASCRIPT:', {
        message: error.message,
        stack: error.stack?.substring(0, 200)
      })
    })

    try {
      // Ir diretamente para a página de tarefas
      testLogger.log('Navegando para /tasks')
      await page.goto('/tasks')
      await page.waitForTimeout(3000) // Aguardar carregamento
      
      // Capturar screenshot da página
      testLogger.log('Capturando screenshot da página')
      const screenshot = await page.screenshot({ fullPage: true })
      fs.writeFileSync(path.join(process.cwd(), 'logs', 'tasks-page-screenshot.png'), screenshot)
      
      // Verificar se a página carregou
      testLogger.log('Verificando carregamento da página')
      const hasHeader = await page.locator('header').count() > 0
      const hasMainContent = await page.locator('main').count() > 0
      
      testLogger.log('Página carregou - Header:', hasHeader, 'Main:', hasMainContent)
      
      // Procurar por botões "Nova Tarefa" ou "Nova"
      testLogger.log('Procurando botões relacionados à criação de tarefas')
      
      const allButtons = await page.locator('button').allTextContents()
      testLogger.log('Todos os botões encontrados:', allButtons)
      
      const newTaskButtons = await page.locator('button:has-text("Nova")').count()
      const createTaskButtons = await page.locator('button:has-text("Criar")').count()
      
      testLogger.log('Botões "Nova":', newTaskButtons)
      testLogger.log('Botões "Criar":', createTaskButtons)
      
      // Verificar se existe algum formulário inicialmente
      const forms = await page.locator('form').count()
      testLogger.log('Formulários encontrados inicialmente:', forms)
      
      // Tentar localizar área de tarefas pendentes
      const pendingSection = await page.locator('[data-testid="pending-tasks-section"]').count()
      testLogger.log('Seção de tarefas pendentes encontrada:', pendingSection)
      
      if (newTaskButtons > 0) {
        testLogger.log('Tentando clicar no primeiro botão "Nova"')
        await page.locator('button:has-text("Nova")').first().click()
        await page.waitForTimeout(2000)
        
        // Verificar se formulário apareceu
        const formsAfterClick = await page.locator('form').count()
        testLogger.log('Formulários após clique:', formsAfterClick)
        
        // Capturar screenshot após clique
        const afterClickScreenshot = await page.screenshot({ fullPage: true })
        fs.writeFileSync(path.join(process.cwd(), 'logs', 'after-click-screenshot.png'), afterClickScreenshot)
      }
      
      // Analisar HTML da página
      testLogger.log('Analisando estrutura HTML')
      const html = await page.content()
      fs.writeFileSync(path.join(process.cwd(), 'logs', 'tasks-page-html.html'), html)
      
      testLogger.log('✅ Teste concluído com sucesso')
      
    } catch (error) {
      testLogger.log('❌ ERRO no teste:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined
      })
      
      // Capturar screenshot do erro
      try {
        const errorScreenshot = await page.screenshot({ fullPage: true })
        fs.writeFileSync(path.join(process.cwd(), 'logs', 'error-screenshot.png'), errorScreenshot)
      } catch (screenshotError) {
        testLogger.log('Erro ao capturar screenshot:', screenshotError)
      }
      
      throw error
    }
  })
})