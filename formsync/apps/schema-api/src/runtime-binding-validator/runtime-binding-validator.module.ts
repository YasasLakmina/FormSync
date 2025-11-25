import { Module } from '@nestjs/common';
import { RuntimeBindingValidatorController } from './runtime-binding-validator.controller';
import { SpringBootScaffoldService } from './services/springboot-scaffold.service';
import { DtoGeneratorService } from './services/dto-generator.service';
import { ControllerGeneratorService } from './services/controller-generator.service';
import { ZipGeneratorService } from './services/zip-generator.service';
import { FormSyncSchemaConverter } from './services/formsync-schema-converter.service';

/**
 * RuntimeBindingValidatorModule
 * 
 * Module for runtime binding and validation engine.
 * Provides Spring Boot project generation capabilities.
 */
@Module({
  controllers: [RuntimeBindingValidatorController],
  providers: [
    SpringBootScaffoldService,
    DtoGeneratorService,
    ControllerGeneratorService,
    ZipGeneratorService,
    FormSyncSchemaConverter,
  ],
  exports: [
    SpringBootScaffoldService,
    DtoGeneratorService,
    ControllerGeneratorService,
    ZipGeneratorService,
    FormSyncSchemaConverter,
  ],
})
export class RuntimeBindingValidatorModule {}
