/**
 * Validator Service
 *
 * Direct NestJS service that exposes Ajv and WCAG validators
 * without any plugin registry indirection.
 */

import { Injectable } from '@nestjs/common';
import { SchemaValidatorPlugin } from '../types';
import { AjvValidatorPlugin } from '../plugins/validators/ajv-validator.plugin';
import { WcagValidatorPlugin } from '../plugins/validators/wcag-validator.plugin';

@Injectable()
export class ValidatorService {
  private readonly validators: SchemaValidatorPlugin[];

  constructor() {
    this.validators = [
      new AjvValidatorPlugin(),
      new WcagValidatorPlugin(),
    ];
  }

  getAllValidators(): SchemaValidatorPlugin[] {
    return this.validators;
  }

  getValidator(name: string): SchemaValidatorPlugin | undefined {
    return this.validators.find((v) => v.name === name);
  }
}
