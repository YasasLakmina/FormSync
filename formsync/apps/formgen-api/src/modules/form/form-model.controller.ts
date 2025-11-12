import { Controller, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { FormModelService } from './form-model.service';

@Controller('form-model')
export class FormModelController {
    constructor(private readonly formModelService: FormModelService) { }

    @Post('from-schema')
    async createFromSchema(
        @Body() body: { schemaId?: string; versionId?: string; schema?: any }
    ) {
        if (body.schemaId) {
            return this.formModelService.createFromSchemaId(body.schemaId, body.versionId);
        } else if (body.schema) {
            return this.formModelService.createFromRawSchema(body.schema);
        }
        throw new BadRequestException('Must provide either schemaId or raw schema');
    }
}
