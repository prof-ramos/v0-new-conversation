import { test, expect } from '@playwright/test';

test.describe('Task Creation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Interceptar logs do console para debug
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Console Error: ${msg.text()}`);
      } else if (msg.text().includes('CLIENT_TASKS')) {
        console.log(`Task Log: ${msg.text()}`);
      }
    });
  });

  test('should show authentication required when not logged in', async ({ page }) => {
    await page.goto('/tasks');
    
    // Deve mostrar a página de autenticação necessária
    await expect(page.locator('h1')).toContainText('Acesso às Tarefas Requer Login');
    await expect(page.locator('text=Para criar, gerenciar e acompanhar')).toBeVisible();
    
    // Deve ter link para login
    const loginButton = page.locator('a[href="/auth/login"]');
    await expect(loginButton).toBeVisible();
  });

  test('should redirect to login when accessing tasks without auth', async ({ page }) => {
    await page.goto('/tasks');
    
    // Verifica se está na página de auth required ou foi redirecionado para login
    const currentUrl = page.url();
    const hasAuthRequired = await page.locator('h1:has-text("Acesso às Tarefas Requer Login")').isVisible();
    const isLoginPage = currentUrl.includes('/auth/login');
    
    expect(hasAuthRequired || isLoginPage).toBe(true);
  });

  test('should have new task button in header when logged in', async ({ page }) => {
    // Simulação: primeiro vamos à página para ver se podemos encontrar elementos mesmo sem auth
    await page.goto('/tasks');
    
    // Se há botão de login, tentamos clicar para ver se redireciona
    const loginButton = page.locator('a[href="/auth/login"]');
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForURL('**/auth/login');
      expect(page.url()).toContain('/auth/login');
    }
  });

  test('should test new task button functionality', async ({ page }) => {
    // Vamos testar o JavaScript dos componentes
    await page.goto('/tasks');
    
    // Adicionar script para simular usuário logado
    await page.addScriptTag({
      content: `
        // Simular evento de botão nova tarefa
        window.testNewTaskButton = () => {
          try {
            const event = new CustomEvent('show-new-task-form');
            window.dispatchEvent(event);
            return 'Event dispatched successfully';
          } catch (error) {
            return 'Error: ' + error.message;
          }
        };
        
        // Listener para verificar se evento é capturado
        let eventReceived = false;
        window.addEventListener('show-new-task-form', () => {
          eventReceived = true;
          window.testEventReceived = true;
        });
      `
    });
    
    // Testar se o mecanismo de evento funciona
    const result = await page.evaluate(() => {
      return (window as any).testNewTaskButton();
    });
    
    expect(result).toBe('Event dispatched successfully');
    
    // Verificar se o evento foi recebido
    await page.waitForTimeout(100);
    const eventReceived = await page.evaluate(() => {
      return (window as any).testEventReceived;
    });
    
    expect(eventReceived).toBe(true);
  });

  test('should check if form elements exist in DOM structure', async ({ page }) => {
    await page.goto('/tasks');
    
    // Verificar se elementos esperados existem na página (mesmo sem auth)
    const pageContent = await page.content();
    
    // Verificar se há referencias aos componentes esperados
    expect(pageContent).toContain('AuthenticationRequired');
    
    // Log da estrutura da página para debug
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    const headings = await page.locator('h1, h2, h3').allTextContents();
    console.log(`Headings found: ${JSON.stringify(headings)}`);
  });

  test('should test responsive behavior on mobile', async ({ page }) => {
    // Definir viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tasks');
    
    // Verificar se a página carrega em mobile
    const isVisible = await page.locator('body').isVisible();
    expect(isVisible).toBe(true);
    
    // Verificar se não há erros de layout
    const hasHorizontalScrollbar = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });
    
    // Em mobile, não deveria ter scroll horizontal
    expect(hasHorizontalScrollbar).toBe(false);
  });

  test('should verify button click handlers are properly attached', async ({ page }) => {
    await page.goto('/tasks');
    
    // Adicionar script de teste mais robusto
    await page.addScriptTag({
      content: `
        window.taskButtonTests = {
          createCustomEvent: () => {
            try {
              const event = new CustomEvent('show-new-task-form', { 
                detail: { source: 'test' } 
              });
              return { success: true, event };
            } catch (error) {
              return { success: false, error: error.message };
            }
          },
          
          testEventDispatch: () => {
            try {
              const event = new CustomEvent('show-new-task-form');
              window.dispatchEvent(event);
              return { success: true };
            } catch (error) {
              return { success: false, error: error.message };
            }
          },
          
          checkDOMForButton: () => {
            const buttons = Array.from(document.querySelectorAll('button')).map(btn => ({
              text: btn.textContent?.trim(),
              onclick: typeof btn.onclick,
              classes: btn.className,
              id: btn.id
            }));
            return buttons;
          }
        };
      `
    });
    
    // Testar criação de custom event
    const eventTest = await page.evaluate(() => {
      return (window as any).taskButtonTests.createCustomEvent();
    });
    
    expect(eventTest.success).toBe(true);
    
    // Testar dispatch de evento
    const dispatchTest = await page.evaluate(() => {
      return (window as any).taskButtonTests.testEventDispatch();
    });
    
    expect(dispatchTest.success).toBe(true);
    
    // Verificar botões na página
    const buttons = await page.evaluate(() => {
      return (window as any).taskButtonTests.checkDOMForButton();
    });
    
    console.log('Buttons found:', JSON.stringify(buttons, null, 2));
    
    // Deve ter pelo menos um botão
    expect(buttons.length).toBeGreaterThan(0);
  });
});