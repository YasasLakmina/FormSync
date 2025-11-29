/**
 * AI Service for Schema Validation and Fixing
 * Uses LLM to fix syntax errors in JSON, XML, and YAML
 */

interface FixSchemaRequest {
  input: string;
  format: 'json' | 'xml' | 'yaml';
  error: string;
}

interface FixSchemaResponse {
  fixedSchema: string;
  explanation?: string;
}

/**
 * Calls LLM API to fix schema syntax errors
 */
export async function fixSchemaWithAI(
  input: string,
  format: 'json' | 'xml' | 'yaml',
  errorMessage: string
): Promise<string> {
  try {
    // TODO: Replace with your actual LLM API endpoint
    // Example: OpenAI, Anthropic, Google AI, etc.
    const API_ENDPOINT = import.meta.env.VITE_AI_API_ENDPOINT || 'http://localhost:3000/api/ai/fix-schema';
    const API_KEY = import.meta.env.VITE_AI_API_KEY;

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(API_KEY && { 'Authorization': `Bearer ${API_KEY}` }),
      },
      body: JSON.stringify({
        input,
        format,
        error: errorMessage,
        task: 'fix_syntax_only', // Important: only fix syntax, don't enhance
      } as FixSchemaRequest),
    });

    if (!response.ok) {
      throw new Error(`AI service returned ${response.status}`);
    }

    const data: FixSchemaResponse = await response.json();
    return data.fixedSchema;
  } catch (error) {
    console.error('AI fix service error:', error);
    throw new Error('Failed to connect to AI service');
  }
}

/**
 * Mock AI fix for development (when API is not available)
 * Preserves all content while fixing syntax errors
 */
export async function mockAIFix(
  input: string,
  format: 'json' | 'xml' | 'yaml'
): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  if (format === 'json') {
    try {
      // Step 1: Basic fixes that preserve content
      let fixed = input
        .replace(/,(\s*[}\]])/g, '$1')           // Remove trailing commas
        .replace(/'/g, '"');                      // Fix quotes
      
      // Step 2: Try to fix unquoted keys while preserving structure
      // More careful regex that doesn't break string values
      fixed = fixed.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*):/g, '$1"$2"$3:');
      
      // Step 3: Smart bracket/brace balancing
      const lines = fixed.split('\n');
      const openBraces = (fixed.match(/{/g) || []).length;
      const closeBraces = (fixed.match(/}/g) || []).length;
      const openBrackets = (fixed.match(/\[/g) || []).length;
      const closeBrackets = (fixed.match(/\]/g) || []).length;
      
      // Add missing closing brackets at appropriate positions
      if (openBrackets > closeBrackets || openBraces > closeBraces) {
        const lastLine = lines[lines.length - 1].trim();
        const needsBrackets = openBrackets - closeBrackets;
        const needsBraces = openBraces - closeBraces;
        
        // Remove empty last line if exists
        if (!lastLine) {
          lines.pop();
        }
        
        // Add missing closings with proper indentation
        for (let i = 0; i < needsBrackets; i++) {
          lines.push(']');
        }
        for (let i = 0; i < needsBraces; i++) {
          lines.push('}');
        }
        
        fixed = lines.join('\n');
      }
      
      // Step 4: Validate the fix
      JSON.parse(fixed);
      
      // Ensure we didn't lose any keys (safety check)
      const originalKeys = input.match(/"[^"]+"\s*:/g) || [];
      const fixedKeys = fixed.match(/"[^"]+"\s*:/g) || [];
      
      if (fixedKeys.length < originalKeys.length * 0.8) {
        // If we lost more than 20% of keys, something went wrong
        throw new Error('Fix would lose too much data');
      }
      
      return fixed;
    } catch (error) {
      // If we can't fix it safely, throw error so user knows
      throw new Error(`Unable to automatically fix JSON: ${error instanceof Error ? error.message : 'Parse error'}`);
    }
  }

  // For XML and YAML, just return cleaned input for now
  return input.trim();
}
