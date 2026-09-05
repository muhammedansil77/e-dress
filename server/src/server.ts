import { createApp } from './app';
import { Database } from './config/database';
import { env } from './config/env.config';
import http from 'http';

async function bootstrap() {
  // Connect to Database
  await Database.connect();

  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    console.log(`
🚀 ===================================================
👗 APPAREL E-COMMERCE BACKEND API RUNNING
📡 URL: http://localhost:${env.PORT}
🌍 Environment: ${env.NODE_ENV}
🛠️ Health Check: http://localhost:${env.PORT}/api/v1/health
===================================================
    `);
  });

  // Graceful Shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      console.log('🔒 HTTP Server closed.');
      await Database.disconnect();
      process.exit(0);
    });

    setTimeout(() => {
      console.error('⚠️ Forcefully terminating after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception thrown:', error);
    process.exit(1);
  });
}

bootstrap();
