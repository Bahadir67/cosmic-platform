import Fastify from 'fastify'
import { PrismaClient } from '@prisma/client'

const fastify = Fastify({
  logger: true
})

const prisma = new PrismaClient()

// Health check
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001 })
    console.log('🚀 Cosmic Platform API running on http://localhost:3001')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
