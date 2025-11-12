import { Module } from '@nestjs/common';
import { SchemaApiService } from './schema.service';
import { SchemaController } from './schema.controller';

@Module({
    controllers: [SchemaController],
    providers: [SchemaApiService],
    exports: [SchemaApiService],
})
export class SchemaModule { }
