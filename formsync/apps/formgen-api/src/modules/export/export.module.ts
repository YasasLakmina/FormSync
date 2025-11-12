import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';

@Module({
    controllers: [ExportController],
    providers: [ExportService],
})
export class ExportModule { }
