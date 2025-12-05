import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGINS', 'http://localhost:4200').split(','),
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
    exposedHeaders: ['X-Session-Id'],
  });

  // Augmenter la limite de taille du body pour les uploads d'images en base64
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ limit: '10mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  // Configuration de Swagger
  const config = new DocumentBuilder()
    .setTitle('StockLite API')
    .setDescription('API de gestion de stock pour StockLite - Support offline/online')
    .setVersion('1.0')
    .addTag('Auth', 'Endpoints d\'authentification')
    .addTag('Users', 'Gestion des utilisateurs')
    .addTag('Products', 'Gestion des produits')
    .addTag('Categories', 'Gestion des catégories de produits')
    .addTag('Sales', 'Gestion des ventes')
    .addTag('Reports', 'Rapports et statistiques financières')
    .addTag('Sync', 'Synchronisation des données offline/online')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entrez votre token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get<number>('PORT', 3000);
  const host = '0.0.0.0'; // Écouter sur toutes les interfaces réseau
  await app.listen(port, host);

  console.log(`
    ╔═════════════════════════════════════════════════════════╗
    ║                                                         ║
    ║         StockLite Backend API Started                   ║
    ║                                                         ║
    ║   Server running on: http://0.0.0.0:${port}             ║
    ║   Local: http://localhost:${port}/api                   ║
    ║   Network: http://10.79.235.31:${port}/api              ║
    ║   Swagger Docs: http://localhost:${port}/api/docs       ║
    ║                                                         ║
    ╚═════════════════════════════════════════════════════════╝
  `);
}
bootstrap();
