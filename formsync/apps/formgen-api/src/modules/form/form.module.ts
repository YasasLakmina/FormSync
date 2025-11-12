import { Module } from '@nestjs/common';
import { FormModelService } from './form-model.service';
import { FormModelController } from './form-model.controller';
import { SchemaModule } from '../schema/schema.module';

@Module({
    imports: [SchemaModule],
    controllers: [FormModelController],
    providers: [FormModelService],
})
export class FormModule { }
