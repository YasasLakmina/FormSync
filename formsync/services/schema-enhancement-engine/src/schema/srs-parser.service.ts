import { Injectable, BadRequestException } from '@nestjs/common';
import { OpenAILLMPlugin } from '../plugins/llm/openai-llm.plugin';
import OpenAI from 'openai';

export interface SuggestedField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  format?: string;
  label: string;
  placeholder?: string;
  validationHint?: string;
}

export interface ExtractedUserStory {
  id: string;
  title: string;
  role: string;
  action: string;
  benefit: string;
  acceptanceCriteria: string[];
  suggestedFields: SuggestedField[];
  featureArea: string;
  confidence: number;
  rawText: string;
}

export interface SrsParseResult {
  projectName: string;
  userStories: ExtractedUserStory[];
  totalFound: number;
  rawTextPreview: string;
  processingNotes?: string[];
}

@Injectable()
export class SrsParserService {
  private client: OpenAI | null = null;
  private model: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL;
    this.model = process.env.OPENAI_MODEL || 'gpt-4';

    if (apiKey) {
      this.client = new OpenAI({ apiKey, ...(baseURL && { baseURL }) });
    }
  }

  async parseFile(buffer: Buffer, mimetype: string, originalName: string): Promise<SrsParseResult> {
    const notes: string[] = [];

    let rawText = '';
    if (mimetype === 'application/pdf' || originalName.toLowerCase().endsWith('.pdf')) {
      rawText = await this.extractPdf(buffer);
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      originalName.toLowerCase().endsWith('.docx')
    ) {
      rawText = await this.extractDocx(buffer);
    } else if (
      mimetype === 'text/plain' ||
      originalName.toLowerCase().endsWith('.txt')
    ) {
      rawText = buffer.toString('utf-8');
    } else {
      throw new BadRequestException('Unsupported file type. Please upload a PDF, DOCX, or plain text file.');
    }

    if (!rawText || rawText.trim().length < 50) {
      throw new BadRequestException('Could not extract readable text from the document. The file may be scanned or image-based.');
    }

    const cleanedText = this.cleanText(rawText);
    const preview = cleanedText.slice(0, 600);

    if (!this.client) {
      notes.push('LLM not configured — returning mock user stories for preview.');
      return this.buildMockResult(originalName, preview);
    }

    const result = await this.extractUserStoriesWithLLM(cleanedText, originalName);
    result.rawTextPreview = preview;
    result.processingNotes = notes;
    return result;
  }

  private async extractPdf(buffer: Buffer): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParse: (buf: Buffer) => Promise<{ text: string }> = require('pdf-parse');
    const data = await pdfParse(buffer);
    return data.text;
  }

  private async extractDocx(buffer: Buffer): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mammoth: { extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }> } = require('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  private cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/[ ]{3,}/g, '  ')
      .replace(/\n{4,}/g, '\n\n\n')
      .trim();
  }

  private async extractUserStoriesWithLLM(text: string, fileName: string): Promise<SrsParseResult> {
    // Chunk to stay within token limits: ~12 000 chars ≈ ~3 000 tokens
    const MAX_CHARS = 12000;
    const chunk = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) + '\n\n[Document truncated for processing]' : text;

    const systemPrompt = `You are an expert business analyst that extracts user stories from SRS (Software Requirements Specification) documents.

TASK:
Analyze the provided SRS document text and extract ALL user stories.

User stories may appear in multiple formats:
1. Formal Agile: "As a [role], I want [action], so that [benefit]"
2. Gherkin: "Given/When/Then" scenarios
3. Informal: bullet points, numbered requirements, feature descriptions
4. Use case format: actor + system interactions

For EACH user story found, also infer the form fields that would be needed to implement it.

OUTPUT FORMAT (strict JSON only):
{
  "projectName": "inferred project name from document title/content",
  "userStories": [
    {
      "id": "us-1",
      "title": "Short descriptive title (5-8 words max)",
      "role": "user role or actor",
      "action": "what they want to do",
      "benefit": "the value or goal achieved",
      "acceptanceCriteria": ["criterion 1", "criterion 2"],
      "suggestedFields": [
        {
          "name": "camelCaseName",
          "type": "string",
          "required": true,
          "format": "email",
          "label": "Human Readable Label",
          "placeholder": "e.g. john@example.com",
          "validationHint": "Must be a valid email address"
        }
      ],
      "featureArea": "Authentication",
      "confidence": 0.95
    }
  ]
}

FIELD TYPE RULES:
- email fields → type: "string", format: "email"
- phone → type: "string", format: "phone"
- date/time → type: "string", format: "date"
- passwords → type: "string", format: "password"
- numbers/ages/quantities → type: "number"
- yes/no toggles → type: "boolean"
- lists/multi-select → type: "array"
- everything else → type: "string"

FEATURE AREA TAXONOMY (use these exactly):
Authentication, Profile, Search, Registration, Checkout, Payment, Dashboard, Notifications, Messaging, Settings, Reporting, Administration, Content, Media, Social

CONFIDENCE SCORING:
- 0.9-1.0: Explicit "As a... I want... So that..." format
- 0.7-0.89: Clear requirement with identifiable actor and goal
- 0.5-0.69: Inferred from feature description
- <0.5: Ambiguous — still include but flag it

Return JSON ONLY. No markdown, no explanations.`;

    try {
      const response = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `File: ${fileName}\n\nDocument content:\n\n${chunk}` },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      const content = response.choices?.[0]?.message?.content ?? '{}';
      let parsed: any;
      try {
        parsed = JSON.parse(content);
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        parsed = match ? JSON.parse(match[0]) : {};
      }

      const stories: ExtractedUserStory[] = (parsed.userStories ?? []).map((s: any, i: number) => ({
        id: s.id ?? `us-${i + 1}`,
        title: s.title ?? `User Story ${i + 1}`,
        role: s.role ?? 'user',
        action: s.action ?? '',
        benefit: s.benefit ?? '',
        acceptanceCriteria: Array.isArray(s.acceptanceCriteria) ? s.acceptanceCriteria : [],
        suggestedFields: Array.isArray(s.suggestedFields) ? s.suggestedFields : [],
        featureArea: s.featureArea ?? 'General',
        confidence: typeof s.confidence === 'number' ? s.confidence : 0.7,
        rawText: `As a ${s.role ?? 'user'}, I want to ${s.action ?? ''}, so that ${s.benefit ?? ''}.`,
      }));

      return {
        projectName: parsed.projectName ?? fileName.replace(/\.[^.]+$/, ''),
        userStories: stories,
        totalFound: stories.length,
        rawTextPreview: '',
      };
    } catch (err: any) {
      throw new BadRequestException(`AI extraction failed: ${err.message}`);
    }
  }

  private buildMockResult(fileName: string, preview: string): SrsParseResult {
    return {
      projectName: fileName.replace(/\.[^.]+$/, ''),
      userStories: [
        {
          id: 'us-1',
          title: 'User Registration',
          role: 'new user',
          action: 'create an account with email and password',
          benefit: 'I can access the platform',
          acceptanceCriteria: ['Email must be valid', 'Password minimum 8 characters', 'Confirm password must match'],
          suggestedFields: [
            { name: 'fullName', type: 'string', required: true, label: 'Full Name', placeholder: 'John Doe' },
            { name: 'email', type: 'string', required: true, format: 'email', label: 'Email Address', placeholder: 'john@example.com', validationHint: 'Must be a valid email' },
            { name: 'password', type: 'string', required: true, format: 'password', label: 'Password', validationHint: 'Minimum 8 characters' },
            { name: 'confirmPassword', type: 'string', required: true, format: 'password', label: 'Confirm Password' },
          ],
          featureArea: 'Authentication',
          confidence: 0.95,
          rawText: 'As a new user, I want to create an account with email and password, so that I can access the platform.',
        },
      ],
      totalFound: 1,
      rawTextPreview: preview,
      processingNotes: ['LLM not configured — sample user story shown.'],
    };
  }
}
