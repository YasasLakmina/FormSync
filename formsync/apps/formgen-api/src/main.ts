import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({ origin: true }); // Todo: Lock down in prod
    await app.listen(3001);
}
bootstrap();
