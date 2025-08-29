import { test, expect, Page } from '@playwright/test'
import fs from 'fs'
import path from 'path'

// Logger específico para testes E2E
const testLogger = {
  log: (message: string, data?: any) => {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}\n`
    
    console.log(logEntry.trim())
    
    const logFile = path.join(process.cwd(), 'logs', `task-creation-debug_${Date.now()}_${new Date().toISOString().split('T')[0]}.log`)
    try {
      fs.appendFileSync(logFile, logEntry)
    } catch (error) {
      console.error('Erro ao escrever no log:', error)
    }
  }
}

test.describe('Debug: Problema do Botão Criar Tarefa', () => {
  test.beforeEach(async ({ page }) => {
    testLogger.log('=== INICIANDO TESTE DEBUG CRIAR TAREFA ===')
    
    // Interceptar logs do console da página
    page.on('console', msg => {
      if (msg.type() === 'error') {
        testLogger.log('ERRO NO CONSOLE DA PÁGINA:', msg.text())
      } else if (msg.text().includes('TASKS') || msg.text().includes('tarefa')) {
        testLogger.log('LOG RELACIONADO A TAREFAS:', msg.text())
      }
    })

    // Interceptar erros JavaScript
    page.on('pageerror', error => {
      testLogger.log('ERRO JAVASCRIPT NA PÁGINA:', {
        message: error.message,
        stack: error.stack
      })
    })

    // Ir para a página de login
    testLogger.log('Navegando para página de login')
    await page.goto('/auth/login')
    await page.waitForLoadState('networkidle')
  })

  test('Deve identificar e debugar o problema do botão "Nova Tarefa"', async ({ page }) => {
    testLogger.log('=== TESTE PRINCIPAL: DEBUGAR BOTÃO NOVA TAREFA ===')
    
    // Fazer login
    testLogger.log('Realizando login')
    await page.fill('input[type="email"]', 'teste@exemplo.com')
    await page.fill('input[type="password"]', 'senha123')
    await page.click('button[type="submit"]')
    await page.waitForLoadState('networkidle')
    
    testLogger.log('Login realizado, verificando redirecionamento')
    
    // Navegar para página de tarefas
    testLogger.log('Navegando para página de tarefas')
    await page.goto('/tasks')
    await page.waitForLoadState('networkidle')
    
    // Aguardar componentes carregarem
    testLogger.log('Aguardando componentes carregarem')
    await page.waitForTimeout(2000)
    
    // Capturar estado inicial da página
    testLogger.log('Capturando estado inicial da página')
    const initialScreenshot = await page.screenshot()
    fs.writeFileSync(path.join(process.cwd(), 'logs', 'initial-tasks-page.png'), initialScreenshot)
    
    // Verificar se a página de tarefas carregou corretamente
    testLogger.log('Verificando se a página de tarefas carregou')
    const pageTitle = await page.textContent('h1')
    testLogger.log('Título da página:', pageTitle)
    
    // Localizar o botão "Nova Tarefa" no cabeçalho
    testLogger.log('Procurando botão "Nova Tarefa" no cabeçalho')
    const headerButton = page.locator('header button:has-text("Nova Tarefa")')
    const headerButtonExists = await headerButton.count() > 0
    testLogger.log('Botão no header encontrado:', headerButtonExists)
    
    if (headerButtonExists) {
      testLogger.log('Verificando propriedades do botão no header')
      const isVisible = await headerButton.isVisible()
      const isEnabled = await headerButton.isEnabled()
      testLogger.log('Botão header - Visível:', isVisible, 'Habilitado:', isEnabled)
      
      // Testar clique no botão do header
      testLogger.log('TESTANDO CLIQUE NO BOTÃO DO HEADER')
      await headerButton.click()
      
      // Aguardar possíveis mudanças
      await page.waitForTimeout(1000)
      
      // Verificar se o formulário apareceu
      const formAfterHeaderClick = page.locator('form')
      const formVisibleAfterHeader = await formAfterHeaderClick.count() > 0
      testLogger.log('Formulário apareceu após clique no header:', formVisibleAfterHeader)
      
      if (formVisibleAfterHeader) {
        testLogger.log('✅ SUCESSO: Formulário apareceu após clique no header')
        // Testar preenchimento do formulário
        await testFormFunctionality(page, testLogger)
      } else {
        testLogger.log('❌ PROBLEMA: Formulário NÃO apareceu após clique no header')
      }
    }
    
    // Localizar botão "Nova" na seção de tarefas pendentes
    testLogger.log('Procurando botão "Nova" na seção de tarefas pendentes')
    const sectionButton = page.locator('[data-testid="pending-tasks-section"] button:has-text("Nova")')
    const sectionButtonExists = await sectionButton.count() > 0
    testLogger.log('Botão na seção encontrado:', sectionButtonExists)
    
    if (sectionButtonExists) {
      testLogger.log('Verificando propriedades do botão na seção')
      const isVisible = await sectionButton.isVisible()
      const isEnabled = await sectionButton.isEnabled()
      testLogger.log('Botão seção - Visível:', isVisible, 'Habilitado:', isEnabled)
      
      // Testar clique no botão da seção
      testLogger.log('TESTANDO CLIQUE NO BOTÃO DA SEÇÃO')
      await sectionButton.click()
      
      // Aguardar possíveis mudanças
      await page.waitForTimeout(1000)
      
      // Verificar se o formulário apareceu
      const formAfterSectionClick = page.locator('form')
      const formVisibleAfterSection = await formAfterSectionClick.count() > 0
      testLogger.log('Formulário apareceu após clique na seção:', formVisibleAfterSection)
      
      if (formVisibleAfterSection) {
        testLogger.log('✅ SUCESSO: Formulário apareceu após clique na seção')
        await testFormFunctionality(page, testLogger)
      } else {
        testLogger.log('❌ PROBLEMA: Formulário NÃO apareceu após clique na seção')
      }
    }
    
    // Capturar estado final da página
    testLogger.log('Capturando estado final da página')
    const finalScreenshot = await page.screenshot()
    fs.writeFileSync(path.join(process.cwd(), 'logs', 'final-tasks-page.png'), finalScreenshot)
    
    // Analisar DOM final
    testLogger.log('Analisando DOM final')
    const finalHtml = await page.content()
    fs.writeFileSync(path.join(process.cwd(), 'logs', 'final-dom.html'), finalHtml)
    
    testLogger.log('=== TESTE CONCLUÍDO ===')
  })
})

async function testFormFunctionality(page: Page, logger: any) {
  logger.log('=== TESTANDO FUNCIONALIDADE DO FORMULÁRIO ===')
  
  try {
    // Preencher formulário
    logger.log('Preenchendo formulário de nova tarefa')
    
    const titleInput = page.locator('input[placeholder*="Título"]')
    await titleInput.fill('Tarefa de teste E2E')
    logger.log('Título preenchido')
    
    const descriptionTextarea = page.locator('textarea[placeholder*="Descrição"]')
    await descriptionTextarea.fill('Descrição da tarefa de teste')
    logger.log('Descrição preenchida')
    
    // Submeter formulário
    logger.log('Submetendo formulário')
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    // Aguardar resposta
    await page.waitForTimeout(2000)
    
    // Verificar se tarefa foi criada
    logger.log('Verificando se tarefa foi criada')
    const taskCreated = await page.locator('text="Tarefa de teste E2E"').count() > 0
    logger.log('Tarefa aparece na lista:', taskCreated)
    
    if (taskCreated) {
      logger.log('✅ SUCESSO COMPLETO: Tarefa criada e apareceu na lista')
    } else {
      logger.log('❌ PROBLEMA: Tarefa não apareceu na lista após criação')
    }
    
  } catch (error) {
    logger.log('❌ ERRO ao testar formulário:', {
      message: error instanceof Error ? error.message : String(error)
    })
  }
}