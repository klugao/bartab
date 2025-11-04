import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

// Configura o timezone do processo Node.js para São Paulo
process.env.TZ = 'America/Sao_Paulo';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: false,
  });

  // Aumentar limite de payload para aceitar imagens grandes em base64
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ limit: '10mb', extended: true }));

  // CORS configurado - permite localhost e domínios do Render
  app.enableCors({
    origin: (origin, callback) => {
      // Lista de origens permitidas
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175',
        'https://bartab-frontend.onrender.com',
      ];

      // Adicionar variáveis de ambiente se existirem
      if (process.env.CORS_ORIGIN) {
        allowedOrigins.push(process.env.CORS_ORIGIN);
      }
      if (process.env.FRONTEND_URL) {
        allowedOrigins.push(process.env.FRONTEND_URL);
      }

      // Permitir requisições sem origin (como Postman, curl)
      if (!origin) {
        callback(null, true);
        return;
      }

      // Verificar se a origin está na lista
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('❌ CORS blocked origin:', origin);
        console.log('✅ Allowed origins:', allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefixo global da API
  app.setGlobalPrefix('api');
  
  const port = 3000;
  await app.listen(port);
  
  console.log(`🚀 Backend rodando na porta ${port}`);
  console.log(`📊 API disponível em: http://localhost:${port}/api`);
  console.log(`🕐 Timezone: ${process.env.TZ} (${new Date().toString()})`);
}
bootstrap();