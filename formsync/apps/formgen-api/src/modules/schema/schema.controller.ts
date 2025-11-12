import { Controller, Get, Param, Query } from '@nestjs/common';
import { SchemaApiService } from './schema.service';

@Controller('schemas')
export class SchemaController {
    constructor(private readonly schemaService: SchemaApiService) { }

    @Get()
    async getSchemas() {
        return this.schemaService.getSchemas();
    }

    @Get(':id')
    async getSchema(@Param('id') id: string) {
        return this.schemaService.getSchemaById(id);
    }
}
