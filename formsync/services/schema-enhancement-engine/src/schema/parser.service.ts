/**
 * Parser Service
 *
 * Direct NestJS service that exposes JSON, YAML, and XML parsers
 * without any plugin registry indirection.
 */

import { Injectable } from '@nestjs/common';
import { FormatParserPlugin } from '../types';
import { JsonParserPlugin } from '../plugins/parsers/json-parser.plugin';
import { YamlParserPlugin } from '../plugins/parsers/yaml-parser.plugin';
import { XmlParserPlugin } from '../plugins/parsers/xml-parser.plugin';

@Injectable()
export class ParserService {
  private readonly parsers: FormatParserPlugin[];

  constructor() {
    this.parsers = [
      new JsonParserPlugin(),
      new YamlParserPlugin(),
      new XmlParserPlugin(),
    ];
  }

  getAllParsers(): FormatParserPlugin[] {
    return this.parsers;
  }

  getParserForFormat(format: string): FormatParserPlugin | undefined {
    return this.parsers.find((p) => p.getSupportedFormats().includes(format));
  }

  detectParser(input: string): FormatParserPlugin | undefined {
    return this.parsers.find((p) => p.canParse(input));
  }
}
