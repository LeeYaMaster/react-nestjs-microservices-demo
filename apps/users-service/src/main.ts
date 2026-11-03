import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const host = process.env.USERS_HOST || '127.0.0.1';
  const port = Number(process.env.USERS_PORT || 3001);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: { host, port },
    },
  );

  await app.listen();
  console.log(`[users-service] TCP microservice listening on ${host}:${port}`);
}
bootstrap();
