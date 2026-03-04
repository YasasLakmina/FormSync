import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TemplateModule } from './template/template.module';
import { HealthModule } from './health/health.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '../../.env',
        }),
        AuthModule,
        UserModule,
        TemplateModule,
        HealthModule,
    ],
    providers: [PrismaService],
    exports: [PrismaService],
})
export class AppModule { }
