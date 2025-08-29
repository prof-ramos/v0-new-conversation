// Script de debug para testar funcionamento do botão Nova Tarefa
// Execute este script no console do navegador na página /tasks

console.log("🔍 Iniciando debug do botão Nova Tarefa...");

// 1. Verificar se o botão existe
const newTaskButton = document.querySelector('button:has-text("Nova Tarefa")') || 
                     document.querySelector('button[aria-label*="Nova"]') ||
                     Array.from(document.querySelectorAll('button')).find(btn => 
                       btn.textContent?.includes('Nova Tarefa')
                     );

console.log("🔎 Botão Nova Tarefa encontrado:", !!newTaskButton);
if (newTaskButton) {
  console.log("📍 Elemento do botão:", newTaskButton);
  console.log("📝 Texto do botão:", newTaskButton.textContent);
  console.log("🎯 Classes:", newTaskButton.className);
  console.log("⚡ Tem onClick:", typeof newTaskButton.onclick);
}

// 2. Verificar listeners de evento
console.log("🎧 Verificando event listeners...");

// 3. Testar dispatch manual do evento
console.log("📤 Testando dispatch manual do evento...");
try {
  const testEvent = new CustomEvent('show-new-task-form', { 
    detail: { source: 'debug-test' } 
  });
  
  let eventCaught = false;
  const testListener = (e) => {
    eventCaught = true;
    console.log("✅ Evento capturado:", e.detail);
  };
  
  window.addEventListener('show-new-task-form', testListener, { once: true });
  window.dispatchEvent(testEvent);
  
  setTimeout(() => {
    console.log("📊 Resultado do teste de evento:", eventCaught ? "✅ SUCESSO" : "❌ FALHOU");
  }, 100);
  
} catch (error) {
  console.error("❌ Erro ao testar evento:", error);
}

// 4. Verificar se há elementos de formulário de tarefa
console.log("📋 Procurando formulário de nova tarefa...");
const taskForm = document.querySelector('[data-testid*="task-form"]') ||
                document.querySelector('form') ||
                document.querySelector('[class*="task-form"]');

console.log("📋 Formulário encontrado:", !!taskForm);

// 5. Verificar seção de tarefas pendentes
const pendingSection = document.querySelector('[data-testid="pending-tasks-section"]');
console.log("📌 Seção de tarefas pendentes encontrada:", !!pendingSection);

// 6. Simular clique no botão se existir
if (newTaskButton && typeof newTaskButton.click === 'function') {
  console.log("👆 Simulando clique no botão...");
  setTimeout(() => {
    try {
      newTaskButton.click();
      console.log("✅ Clique simulado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao simular clique:", error);
    }
  }, 500);
}

console.log("🏁 Debug concluído. Verifique os resultados acima.");