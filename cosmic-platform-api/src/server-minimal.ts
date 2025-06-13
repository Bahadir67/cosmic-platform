// src/server-minimal.ts - Debug version
import Fastify from 'fastify';

console.log('🔍 Starting minimal server test...');

const fastify = Fastify({
  logger: true
});

// Basit health endpoint
fastify.get('/health', async (request, reply) => {
  console.log('✅ Health endpoint called');
  return { status: 'ok', message: 'Minimal server working' };
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  console.error('❌ Server Error:', error);
  reply.status(500).send({ error: error.message });
});

async function start() {
  try {
    console.log('🚀 Attempting to start server...');
    
    const port = 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    
    console.log(`✅ Minimal server started on http://localhost:${port}`);
    console.log(`🏥 Test: http://localhost:${port}/health`);
    
  } catch (error) {
    console.error('❌ Failed to start minimal server:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

start();