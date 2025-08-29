import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

// Logger específico para testes E2E
const testLogger = {
  log: (message: string, data?: any) => {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}\n`
    
    console.log(logEntry.trim())
    
    const logFile = path.join(process.cwd(), 'logs', `task-complete-test_${Date.now()}_${new Date().toISOString().split('T')[0]}.log`)
    try {
      fs.appendFileSync(logFile, logEntry)
    } catch (error) {
      console.error('Erro ao escrever no log:', error)
    }
  }
}

test.describe('Análise Completa: Problema do Botão Criar Tarefa', () => {
  
  test('Deve identificar o problema de redirecionamento de autenticação', async ({ page }) => {
    testLogger.log('=== TESTE 1: VERIFICAR REDIRECIONAMENTO DE AUTENTICAÇÃO ===')
    
    // Interceptar logs do console da página
    page.on('console', msg => {
      if (msg.type() === 'error') {
        testLogger.log('ERRO NO CONSOLE:', msg.text())
      } else if (msg.text().includes('TASKS') || msg.text().includes('tarefa')) {
        testLogger.log('LOG RELACIONADO A TAREFAS:', msg.text())
      }
    })

    // Ir para a página de tarefas sem autenticação
    testLogger.log('Tentando acessar /tasks sem autenticação')
    await page.goto('/tasks')
    await page.waitForTimeout(3000)
    
    // Verificar se foi redirecionado para login
    const currentUrl = page.url()
    testLogger.log('URL atual após tentativa de acesso:', currentUrl)
    
    const isOnLoginPage = currentUrl.includes('/auth/login')
    testLogger.log('Foi redirecionado para login:', isOnLoginPage)
    
    if (isOnLoginPage) {
      testLogger.log('✅ CONFIRMADO: Sistema de autenticação está funcionando corretamente')
      testLogger.log('📋 PROBLEMA IDENTIFICADO: Usuário precisa estar autenticado para acessar /tasks')
    } else {
      testLogger.log('❌ PROBLEMA: Não foi redirecionado para login quando deveria')
    }
    
    // Capturar screenshot da página de login
    const loginScreenshot = await page.screenshot({ fullPage: true })
    fs.writeFileSync(path.join(process.cwd(), 'logs', 'login-redirect-page.png'), loginScreenshot)
    
    testLogger.log('=== FIM TESTE 1 ===')
  })

  test('Deve testar funcionalidade com autenticação simulada', async ({ page }) => {
    testLogger.log('=== TESTE 2: FUNCIONALIDADE COM AUTENTICAÇÃO SIMULADA ===')
    
    // Simular usuário autenticado usando localStorage/cookies
    testLogger.log('Simulando autenticação via cookies/localStorage')
    
    // Ir para qualquer página primeiro para configurar o contexto
    await page.goto('/')
    
    // Simular sessão de autenticação (método comum com Supabase)
    await page.evaluate(() => {
      // Simular dados de sessão do Supabase
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: {
          id: 'mock-user-id',
          email: 'teste@exemplo.com',
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        }
      }
      
      // Tentar diferentes estratégias de simular autenticação
      localStorage.setItem('supabase.auth.token', JSON.stringify(mockSession))
      localStorage.setItem('sb-project-auth-token', JSON.stringify(mockSession))
      
      // Simular cookies também
      document.cookie = `sb-access-token=${mockSession.access_token}; path=/`
      document.cookie = `sb-refresh-token=${mockSession.refresh_token}; path=/`
    })
    
    testLogger.log('Dados de autenticação simulados configurados')
    
    // Tentar acessar a página de tarefas novamente
    testLogger.log('Tentando acessar /tasks com autenticação simulada')
    await page.goto('/tasks')
    await page.waitForTimeout(5000) // Aguardar mais tempo para carregamento
    
    // Verificar URL atual
    const currentUrl = page.url()
    testLogger.log('URL atual após simulação de auth:', currentUrl)
    
    // Verificar se ainda está sendo redirecionado
    const isStillOnLogin = currentUrl.includes('/auth/login')
    testLogger.log('Ainda redirecionado para login:', isStillOnLogin)
    
    if (isStillOnLogin) {
      testLogger.log('⚠️ OBSERVAÇÃO: Simulação de auth não foi suficiente - middleware do Next.js é mais rigoroso')
      testLogger.log('💡 SOLUÇÃO: Em ambiente real, usar credenciais válidas ou mock do Supabase')
    } else {
      // Se conseguiu acessar, testar a funcionalidade do botão
      testLogger.log('✅ Acesso concedido! Testando funcionalidade do botão')
      await testTaskCreationFunctionality(page, testLogger)
    }
    
    // Capturar screenshot do resultado
    const authTestScreenshot = await page.screenshot({ fullPage: true })
    fs.writeFileSync(path.join(process.cwd(), 'logs', 'auth-simulation-result.png'), authTestScreenshot)
    
    testLogger.log('=== FIM TESTE 2 ===')
  })

  test('Deve analisar o comportamento dos logs de tasks', async ({ page }) => {
    testLogger.log('=== TESTE 3: ANÁLISE DOS LOGS DE TASKS ===')
    
    // Interceptar todos os logs relacionados a tasks
    const taskLogs: string[] = []
    
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('TASKS') || text.includes('tarefa') || text.includes('Nova Tarefa') || 
          text.includes('show-new-task-form') || text.includes('NewTaskForm')) {
        taskLogs.push(`[${msg.type()}] ${text}`)
        testLogger.log('LOG CAPTURADO:', text)
      }
    })

    // Tentar ir para a página de tarefas
    testLogger.log('Acessando página para capturar logs de tasks')
    await page.goto('/tasks')
    await page.waitForTimeout(3000)
    
    // Verificar se algum JavaScript de tasks foi carregado
    testLogger.log('Verificando carregamento de scripts relacionados a tasks')
    
    const scriptTags = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'))
      return scripts
        .map(script => script.src || 'inline')
        .filter(src => src.includes('tasks') || src.includes('Tasks'))
    })
    
    testLogger.log('Scripts de tasks encontrados:', scriptTags)
    
    // Verificar se há elementos relacionados a tasks no DOM
    const taskElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('*')
      const taskRelated = []
      
      for (const el of elements) {
        const text = el.textContent?.toLowerCase() || ''
        const className = el.className || ''
        const id = el.id || ''
        
        if (text.includes('tarefa') || text.includes('task') || 
            className.includes('task') || id.includes('task')) {
          taskRelated.push({
            tag: el.tagName,
            text: text.substring(0, 100),
            className,
            id
          })
        }
      }
      
      return taskRelated.slice(0, 10) // Limitar a 10 elementos
    })
    
    testLogger.log('Elementos relacionados a tasks no DOM:', taskElements)
    
    // Resumir logs capturados
    testLogger.log('Total de logs de tasks capturados:', taskLogs.length)
    taskLogs.forEach((log, index) => {
      testLogger.log(`Log ${index + 1}:`, log)
    })
    
    testLogger.log('=== FIM TESTE 3 ===')
  })
})

async function testTaskCreationFunctionality(page: any, logger: any) {
  logger.log('=== TESTANDO FUNCIONALIDADE DE CRIAÇÃO DE TAREFAS ===')
  
  try {
    // Procurar por botão "Nova Tarefa" no header
    const headerButton = page.locator('header button:has-text("Nova Tarefa")')
    const headerButtonExists = await headerButton.count() > 0
    
    logger.log('Botão "Nova Tarefa" no header encontrado:', headerButtonExists)
    
    if (headerButtonExists) {
      logger.log('Clicando no botão do header')
      await headerButton.click()
      await page.waitForTimeout(2000)
      
      // Verificar se formulário apareceu
      const form = page.locator('form')
      const formExists = await form.count() > 0
      logger.log('Formulário apareceu após clique:', formExists)
      
      if (formExists) {
        logger.log('Testando preenchimento do formulário')
        await form.locator('input[placeholder*="Título"]').fill('Teste E2E Task')
        await form.locator('textarea').fill('Descrição teste')
        await page.waitForTimeout(1000)
        
        logger.log('Submetendo formulário')
        await form.locator('button[type="submit"]').click()
        await page.waitForTimeout(3000)
        
        // Verificar se tarefa apareceu
        const taskCreated = await page.locator('text="Teste E2E Task"').count() > 0
        logger.log('Tarefa criada e visível:', taskCreated)
      }
    }
    
    // Procurar por botão "Nova" na seção
    const sectionButton = page.locator('button:has-text("Nova")')
    const sectionButtonExists = await sectionButton.count() > 0
    logger.log('Botão "Nova" na seção encontrado:', sectionButtonExists)
    
    if (sectionButtonExists) {
      logger.log('Testando botão da seção')
      await sectionButton.first().click()
      await page.waitForTimeout(2000)
      
      const formAfterSection = await page.locator('form').count()
      logger.log('Formulários após clique na seção:', formAfterSection)
    }
    
  } catch (error) {
    logger.log('Erro durante teste de funcionalidade:', {
      message: error instanceof Error ? error.message : String(error)
    })
  }
}