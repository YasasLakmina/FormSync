/**
 * Import Service
 * 
 * Handles importing schemas from various sources:
 * - URL fetch
 * - File upload handling
 */

import { Injectable, BadRequestException } from '@nestjs/common';
import { ParserService } from './parser.service';
import axios from 'axios';

@Injectable()
export class ImportService {
  constructor(private readonly parserService: ParserService) {}

  /**
   * Import schema from a URL
   */
  async importFromUrl(url: string, format?: 'json' | 'yaml' | 'xml'): Promise<any> {
    try {
      // Fetch the content from the URL
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'FormSync Schema Importer',
        },
      });

      const content = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

      // Auto-detect format if not provided
      let detectedFormat = format;
      if (!detectedFormat) {
        if (url.endsWith('.json')) detectedFormat = 'json';
        else if (url.endsWith('.yaml') || url.endsWith('.yml')) detectedFormat = 'yaml';
        else if (url.endsWith('.xml')) detectedFormat = 'xml';
        else {
          // Try to detect from content
          const trimmed = content.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) detectedFormat = 'json';
          else if (trimmed.startsWith('<')) detectedFormat = 'xml';
          else detectedFormat = 'yaml';
        }
      }

      // Find the appropriate parser
      const parser = this.parserService.getParserForFormat(detectedFormat!);

      if (!parser) {
        throw new BadRequestException(`No parser found for format: ${detectedFormat}`);
      }

      // Parse the content
      const result = await parser.parse(content);

      if (!result.success) {
        throw new BadRequestException({
          message: 'Parsing failed',
          errors: result.errors,
        });
      }

      return {
        schema: result.schema,
        detectedFormat: result.detectedFormat,
        sourceUrl: url,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new BadRequestException(`Failed to fetch from URL: ${error.message}`);
      }
      throw error;
    }
  }
}
