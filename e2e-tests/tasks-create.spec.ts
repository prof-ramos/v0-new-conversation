import { test, expect, Page, BrowserContext } from '@playwright/test'
import { TestLogger } from './test-logger'

// Helper para simular login básico (assumindo que não há auth real nos testes)
async function mockLogin(page: Page, logger: TestLogger) {
  logger.info('Simulando login de usuário...')
  
  try {
    // Para este teste, vamos assumir que podemos acessar direto a página de tasks
    // Em um ambiente real, seria necessário fazer login primeiro
    await page.goto('/tasks')
    logger.info('Navegou para página de tasks')
  } catch (error) {
    logger.error('Erro ao navegar para página de tasks', { error: error.message })
    throw error
  }
}

// Helper para capturar erros do console JavaScript
async function setupConsoleListener(page: Page, logger: TestLogger) {
  page.on('console', (msg) => {
    const type = msg.type()
    const text = msg.text()
    
    if (type === 'error') {
      logger.error(`CONSOLE ERROR: ${text}`)
    } else if (type === 'warning') {
      logger.warning(`CONSOLE WARNING: ${text}`)
    } else if (type === 'log') {
      logger.debug(`CONSOLE LOG: ${text}`)
    }
  })
  
  page.on('pageerror', (error) => {
    logger.critical(`PAGE ERROR: ${error.message}`, { stack: error.stack })
  })
  
  page.on('requestfailed', (request) => {
    logger.error(`REQUEST FAILED: ${request.method()} ${request.url()}`, {
      failure: request.failure()?.errorText
    })
  })
}

test.describe('Funcionalidade Criar Tarefa', () => {
  let logger: TestLogger
  
  test.beforeEach(async ({ page }) => {
    logger = new TestLogger(`CREATE_TASK_${Date.now()}`)
    
    // Setup listeners para capturar erros
    await setupConsoleListener(page, logger)
    
    logger.info('Iniciando teste de criação de tarefa')
    
    // Mock login
    await mockLogin(page, logger)
  })
  
  test.afterEach(async () => {
    if (logger) {
      logger.finalize()
    }
  })
  
  test('Deve identificar todos os botões "criar tarefa" na página', async ({ page }) => {
    logger.info('=== TESTE 1: Identificação de botões ===')
    
    // Aguardar carregamento da página
    await page.waitForLoadState('networkidle')
    logger.info('Página carregada completamente')
    
    // Capturar screenshot inicial
    await page.screenshot({ path: 'logs/tasks-page-initial.png', fullPage: true })
    logger.info('Screenshot inicial capturada')
    
    // Procurar por todos os botões que podem criar tarefa
    const buttons = await page.locator('button').all()
    logger.info(`Encontrados ${buttons.length} botões na página`)
    
    let createTaskButtons = []
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i]
      const text = await button.textContent()
      const isVisible = await button.isVisible()
      const isEnabled = await button.isEnabled()
      
      logger.debug(`Botão ${i + 1}: "${text}" (Visível: ${isVisible}, Habilitado: ${isEnabled})`)
      
      // Identificar botões de criar tarefa
      if (text && (text.includes('Nova') || text.includes('Criar') || text.includes('Adicionar'))) {
        createTaskButtons.push({
          index: i,
          text,
          isVisible,
          isEnabled,
          element: button
        })
        logger.info(`BOTÃO DE CRIAR TAREFA ENCONTRADO: "${text}"`)
      }
    }
    
    logger.info(`Total de botões de criar tarefa: ${createTaskButtons.length}`)
    
    // Verificar se encontramos botões
    expect(createTaskButtons.length).toBeGreaterThan(0)
    
    // Log detalhado de cada botão encontrado
    for (const btn of createTaskButtons) {
      logger.info(`Analisando botão: "${btn.text}"`, {
        visible: btn.isVisible,
        enabled: btn.isEnabled,
        boundingBox: await btn.element.boundingBox()
      })
    }
  })
  
  test('Deve testar clique no botão do cabeçalho "Nova Tarefa"', async ({ page }) => {
    logger.info('=== TESTE 2: Clique no botão do cabeçalho ===')
    
    await page.waitForLoadState('networkidle')
    
    // Procurar especificamente o botão "Nova Tarefa" no cabeçalho
    const headerButton = page.locator('header button:has-text("Nova Tarefa")')
    
    logger.info('Verificando existência do botão "Nova Tarefa" no cabeçalho...')
    const exists = await headerButton.count() > 0
    logger.info(`Botão no cabeçalho existe: ${exists}`)
    
    if (exists) {
      const isVisible = await headerButton.isVisible()
      const isEnabled = await headerButton.isEnabled()
      const boundingBox = await headerButton.boundingBox()
      
      logger.info('Propriedades do botão do cabeçalho', {
        visible: isVisible,
        enabled: isEnabled,
        boundingBox
      })
      
      if (isVisible && isEnabled) {
        logger.info('Tentando clicar no botão "Nova Tarefa" do cabeçalho...')
        
        // Capturar screenshot antes do clique
        await page.screenshot({ path: 'logs/before-header-click.png', fullPage: true })
        
        await headerButton.click()
        logger.info('Clique executado no botão do cabeçalho')
        
        // Aguardar um momento para ver se algo acontece
        await page.waitForTimeout(2000)
        
        // Capturar screenshot depois do clique
        await page.screenshot({ path: 'logs/after-header-click.png', fullPage: true })
        
        // Verificar se algum formulário apareceu
        const form = page.locator('form')
        const formCount = await form.count()
        logger.info(`Formulários visíveis após clique: ${formCount}`)
        
        const modal = page.locator('[role="dialog"], .modal, .popup')
        const modalCount = await modal.count()
        logger.info(`Modais/popups visíveis após clique: ${modalCount}`)
        
        // Verificar se houve mudança na URL
        const currentUrl = page.url()
        logger.info(`URL atual após clique: ${currentUrl}`)
        
        if (formCount === 0 && modalCount === 0) {
          logger.warning('PROBLEMA IDENTIFICADO: Clique no botão do cabeçalho não produziu nenhum resultado visível')
        }
      } else {
        logger.warning('Botão do cabeçalho não está visível ou habilitado')
      }
    } else {
      logger.error('Botão "Nova Tarefa" não encontrado no cabeçalho')
    }
  })
  
  test('Deve testar clique no botão "Nova" da lista de tarefas', async ({ page }) => {
    logger.info('=== TESTE 3: Clique no botão "Nova" da lista ===')
    
    await page.waitForLoadState('networkidle')
    
    // Procurar o botão "Nova" na seção de tarefas pendentes
    const listButton = page.locator('button:has-text("Nova"):not(header button)')
    
    logger.info('Verificando existência do botão "Nova" na lista...')
    const exists = await listButton.count() > 0
    logger.info(`Botão na lista existe: ${exists}`)
    
    if (exists) {
      const isVisible = await listButton.isVisible()
      const isEnabled = await listButton.isEnabled()
      const boundingBox = await listButton.boundingBox()
      
      logger.info('Propriedades do botão da lista', {
        visible: isVisible,
        enabled: isEnabled,
        boundingBox
      })
      
      if (isVisible && isEnabled) {
        logger.info('Tentando clicar no botão "Nova" da lista...')
        
        // Capturar screenshot antes do clique
        await page.screenshot({ path: 'logs/before-list-click.png', fullPage: true })
        
        await listButton.click()
        logger.info('Clique executado no botão da lista')
        
        // Aguardar um momento para carregar o formulário
        await page.waitForTimeout(1000)
        
        // Verificar se formulário apareceu
        const newTaskForm = page.locator('form').first()
        const formVisible = await newTaskForm.isVisible()
        logger.info(`Formulário de nova tarefa visível: ${formVisible}`)
        
        if (formVisible) {
          logger.info('✅ SUCESSO: Formulário de nova tarefa foi exibido após clique na lista')
          
          // Capturar screenshot do formulário
          await page.screenshot({ path: 'logs/new-task-form.png', fullPage: true })
          
          // Analisar elementos do formulário
          const titleInput = newTaskForm.locator('input[placeholder*="Título"]')
          const descriptionTextarea = newTaskForm.locator('textarea')
          const submitButton = newTaskForm.locator('button[type="submit"]')
          
          logger.info('Elementos do formulário encontrados:', {
            titleInput: await titleInput.count() > 0,
            descriptionTextarea: await descriptionTextarea.count() > 0,
            submitButton: await submitButton.count() > 0
          })
          
        } else {
          logger.error('PROBLEMA: Formulário não apareceu após clique no botão da lista')
        }
      }
    }
  })
  
  test('Deve testar preenchimento completo e submissão do formulário', async ({ page }) => {
    logger.info('=== TESTE 4: Preenchimento completo do formulário ===')
    
    await page.waitForLoadState('networkidle')
    
    // Primeiro, abrir o formulário usando o botão que funciona
    const listButton = page.locator('button:has-text("Nova"):not(header button)')
    
    if (await listButton.count() > 0) {
      await listButton.click()
      await page.waitForTimeout(1000)
      
      const form = page.locator('form').first()
      if (await form.isVisible()) {
        logger.info('Formulário aberto, iniciando preenchimento...')
        
        // Preencher título
        const titleInput = form.locator('input[placeholder*="Título"]')
        await titleInput.fill('Tarefa de Teste E2E')
        logger.info('Título preenchido')
        
        // Preencher descrição
        const descriptionTextarea = form.locator('textarea')
        await descriptionTextarea.fill('Esta é uma tarefa criada durante o teste E2E para verificar a funcionalidade')
        logger.info('Descrição preenchida')
        
        // Selecionar categoria
        const categorySelect = form.locator('select, [role="combobox"]').first()
        if (await categorySelect.count() > 0) {
          await categorySelect.click()
          await page.waitForTimeout(500)
          const estudoOption = page.locator('text="📚 Estudo"')
          if (await estudoOption.count() > 0) {
            await estudoOption.click()
            logger.info('Categoria "Estudo" selecionada')
          }
        }
        
        // Selecionar tempo estimado
        const timeButton = form.locator('button:has-text("15min")')
        if (await timeButton.count() > 0) {
          await timeButton.click()
          logger.info('Tempo estimado 15min selecionado')
        }
        
        // Capturar screenshot do formulário preenchido
        await page.screenshot({ path: 'logs/form-filled.png', fullPage: true })
        
        // Tentar submeter o formulário
        const submitButton = form.locator('button[type="submit"]')
        const submitButtonText = await submitButton.textContent()
        logger.info(`Botão de submissão: "${submitButtonText}"`)
        
        if (await submitButton.isEnabled()) {
          logger.info('Submetendo formulário...')
          await submitButton.click()
          
          // Aguardar processamento
          await page.waitForTimeout(3000)
          
          // Verificar se formulário foi fechado (sucesso)
          const formStillVisible = await form.isVisible()
          logger.info(`Formulário ainda visível após submissão: ${formStillVisible}`)
          
          // Capturar screenshot final
          await page.screenshot({ path: 'logs/after-submit.png', fullPage: true })
          
          if (!formStillVisible) {
            logger.info('✅ SUCESSO: Formulário foi fechado, indicando submissão bem-sucedida')
          } else {
            logger.warning('Formulário ainda visível - pode haver erro de validação ou submissão')
          }
        } else {
          logger.error('Botão de submissão está desabilitado')
        }
      }
    }
  })
  
  test('Deve verificar responsividade em diferentes tamanhos de tela', async ({ page, browserName }) => {
    logger.info('=== TESTE 5: Responsividade ===')
    
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1366, height: 768, name: 'Desktop Medium' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ]
    
    for (const viewport of viewports) {
      logger.info(`Testando viewport: ${viewport.name} (${viewport.width}x${viewport.height})`)
      
      await page.setViewportSize(viewport)
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Capturar screenshot
      await page.screenshot({ 
        path: `logs/responsive-${viewport.name.toLowerCase().replace(' ', '-')}.png`, 
        fullPage: true 
      })
      
      // Verificar se botões são visíveis
      const headerButton = page.locator('header button:has-text("Nova Tarefa")')
      const listButton = page.locator('button:has-text("Nova"):not(header button)')
      
      const headerVisible = await headerButton.isVisible()
      const listVisible = await listButton.isVisible()
      
      logger.info(`${viewport.name} - Botão cabeçalho visível: ${headerVisible}`)
      logger.info(`${viewport.name} - Botão lista visível: ${listVisible}`)
      
      // Em mobile, alguns botões podem estar em menus colapsados
      if (viewport.width <= 768 && !headerVisible && !listVisible) {
        logger.warning(`Possível problema de responsividade em ${viewport.name}`)
      }
    }
  })
})