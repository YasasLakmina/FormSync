import { Module } from '@nestjs/common';
import { SchemaModule } from './modules/schema/schema.module';
import { ExportModule } from './modules/export/export.module';
import { FormModule } from './modules/form/form.module';

@Module({
    imports: [SchemaModule, ExportModule, FormModule],
    controllers: [],
    providers: [],
})
export class AppModule { }
