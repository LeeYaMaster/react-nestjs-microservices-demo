import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 允许本地 Vite 开发服务器（默认 5173，被占用时可能递增）
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (
        !origin ||
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
      ) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  });

  const port = Number(process.env.GATEWAY_PORT || 3000);
  await app.listen(port);
  console.log(`[gateway] HTTP API listening on http://localhost:${port}`);
}
bootstrap();
