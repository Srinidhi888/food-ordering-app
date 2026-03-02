import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: "*",
  });
  app.use((req, _res, next) => {
    // ensure GraphQL context receives headers similarly to HTTP
    req.headers = req.headers || {};
    next();
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
