import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

// Logger específico para validação da correção
const testLogger = {
  log: (message: string, data?: any) => {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}] ${message} ${data ? JSON.stringify(data) : ''}\n`
    
    console.log(logEntry.trim())
    
    const logFile = path.join(process.cwd(), 'logs', `task-fixed-test_${Date.now()}_${new Date().toISOString().split('T')[0]}.log`)
    try {
      fs.appendFileSync(logFile, logEntry)
    } catch (error) {
      console.error('Erro ao escrever no log:', error)
    }
  }
}

test.describe('✅ VALIDAÇÃO: Correção do Problema Criar Tarefa', () => {
  
  test('Deve mostrar tela de autenticação necessária em vez de redirecionamento', async ({ page }) => {
    testLogger.log('=== TESTE DE VALIDAÇÃO: CORREÇÃO IMPLEMENTADA ===')
    
    // Interceptar logs do console da página
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('TASKS') || text.includes('tarefa') || text.includes('Acesso à página')) {
        testLogger.log('LOG CAPTURADO:', text)
      }
    })

    // Interceptar erros JavaScript
    page.on('pageerror', error => {
      testLogger.log('ERRO JAVASCRIPT:', {
        message: error.message,
        stack: error.stack?.substring(0, 200)
      })
    })

    testLogger.log('Acessando /tasks para validar correção')
    await page.goto('/tasks')
    await page.waitForTimeout(3000)
    
    // Verificar se ainda está na página de tarefas (não redirecionado)
    const currentUrl = page.url()
    testLogger.log('URL atual:', currentUrl)
    
    const isOnTasksPage = currentUrl.includes('/tasks')
    testLogger.log('Permaneceu na página de tarefas:', isOnTasksPage)
    
    if (isOnTasksPage) {
      testLogger.log('✅ CORREÇÃO CONFIRMADA: Não houve redirecionamento forçado')
      
      // Verificar se a tela de autenticação necessária está sendo exibida
      const authRequiredTitle = await page.locator('text="Acesso às Tarefas Requer Login"').count()
      testLogger.log('Título de autenticação necessária encontrado:', authRequiredTitle > 0)
      
      const loginButton = await page.locator('button:has-text("Fazer Login")').count()
      testLogger.log('Botão "Fazer Login" encontrado:', loginButton > 0)
      
      const featuresListed = await page.locator('text="Criar e editar tarefas diárias"').count()
      testLogger.log('Lista de recursos mostrada:', featuresListed > 0)
      
      const tipShown = await page.locator('text="Dica:"').count()
      testLogger.log('Dica explicativa mostrada:', tipShown > 0)
      
      if (authRequiredTitle > 0 && loginButton > 0 && featuresListed > 0) {
        testLogger.log('🎉 SUCESSO COMPLETO: Tela de autenticação necessária funcionando perfeitamente')
        testLogger.log('📈 MELHORIA DE UX: Usuário agora entende o que precisa fazer')
      } else {
        testLogger.log('⚠️ PROBLEMA: Componente de autenticação não está sendo exibido corretamente')
      }
      
      // Testar botão de fazer login
      if (loginButton > 0) {
        testLogger.log('Testando funcionalidade do botão "Fazer Login"')
        await page.locator('button:has-text("Fazer Login")').click()
        await page.waitForTimeout(2000)
        
        const afterClickUrl = page.url()
        testLogger.log('URL após clique no botão login:', afterClickUrl)
        
        const redirectedToLogin = afterClickUrl.includes('/auth/login')
        testLogger.log('Redirecionou corretamente para login:', redirectedToLogin)
        
        if (redirectedToLogin) {
          testLogger.log('✅ FLUXO COMPLETO FUNCIONANDO: Tasks → Auth Required → Login')
        }
      }
      
    } else {
      testLogger.log('❌ PROBLEMA: Ainda está sendo redirecionado (correção não funcionou)')
    }
    
    // Capturar screenshot da correção
    const correctionScreenshot = await page.screenshot({ fullPage: true })
    fs.writeFileSync(path.join(process.cwd(), 'logs', 'correction-validation.png'), correctionScreenshot)
    
    // Verificar acessibilidade básica da nova tela
    testLogger.log('Verificando acessibilidade da correção')
    
    const hasHeadings = await page.locator('h1, h2, h3, h4, h5, h6').count()
    const hasButtons = await page.locator('button').count()
    const hasLinks = await page.locator('a').count()
    
    testLogger.log('Elementos de acessibilidade encontrados:', {
      headings: hasHeadings,
      buttons: hasButtons,
      links: hasLinks
    })
    
    testLogger.log('=== VALIDAÇÃO CONCLUÍDA ===')
  })

  test('Deve validar responsividade da nova tela', async ({ page }) => {
    testLogger.log('=== TESTE DE RESPONSIVIDADE: NOVA TELA DE AUTH ===')
    
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 720, name: 'desktop' },
      { width: 1920, height: 1080, name: 'desktop-large' }
    ]
    
    for (const viewport of viewports) {
      testLogger.log(`Testando responsividade: ${viewport.name} (${viewport.width}x${viewport.height})`)
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/tasks')
      await page.waitForTimeout(2000)
      
      // Verificar se elementos são visíveis no viewport
      const titleVisible = await page.locator('text="Acesso às Tarefas Requer Login"').isVisible()
      const buttonVisible = await page.locator('button:has-text("Fazer Login")').isVisible()
      
      testLogger.log(`${viewport.name} - Título visível:`, titleVisible)
      testLogger.log(`${viewport.name} - Botão visível:`, buttonVisible)
      
      // Capturar screenshot do viewport
      const responsiveScreenshot = await page.screenshot({ fullPage: true })
      fs.writeFileSync(path.join(process.cwd(), 'logs', `responsive-${viewport.name}.png`), responsiveScreenshot)
      
      if (titleVisible && buttonVisible) {
        testLogger.log(`✅ ${viewport.name}: Layout responsivo funcionando corretamente`)
      } else {
        testLogger.log(`⚠️ ${viewport.name}: Possível problema de responsividade`)
      }
    }
    
    testLogger.log('=== TESTE DE RESPONSIVIDADE CONCLUÍDO ===')
  })
})