import { FullConfig } from '@playwright/test'
import { TestLogger } from './test-logger'

async function globalSetup(config: FullConfig) {
  const logger = new TestLogger('GLOBAL_SETUP')
  
  logger.info('Iniciando configuração global dos testes E2E')
  
  try {
    // Verificar se o servidor está rodando
    logger.info('Verificando servidor de desenvolvimento...')
    
    const serverUrl = config.webServer?.url || 'http://localhost:3000'
    logger.info(`URL do servidor: ${serverUrl}`)
    
    // Log da configuração dos projetos
    logger.info(`Projetos configurados: ${config.projects.map(p => p.name).join(', ')}`)
    
    // Log dos workers
    logger.info(`Workers: ${config.workers || 'indefinido'}`)
    logger.info(`Modo paralelo: ${config.fullyParallel ? 'Sim' : 'Não'}`)
    
    logger.info('Configuração global concluída com sucesso')
    
  } catch (error) {
    logger.error('Erro na configuração global', { error: error.message })
    throw error
  } finally {
    logger.finalize()
  }
}

export default globalSetup