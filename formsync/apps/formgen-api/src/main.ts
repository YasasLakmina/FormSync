import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // Using 3002 or next available port to avoid conflict with other services
    await app.listen(3002);
    console.log(`FormGen API is running on: ${await app.getUrl()}`);
}
bootstrap();
