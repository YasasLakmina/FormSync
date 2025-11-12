import { ExportPlugin, ArtifactFile } from '../interfaces';
import { FormModel } from '../../models';
import { PluginRegistry } from '../../registry';

export class ReactViteExportPlugin implements ExportPlugin {
  name = 'react-vite-export';
  version = '1.0.0';
  type = 'export' as const;
  target = 'react-vite';

  constructor(private registry: PluginRegistry) { }

  async generate(form: FormModel): Promise<ArtifactFile[]> {
    const files: ArtifactFile[] = [];

    // 1. Generate Form Component
    const componentCode = this.generateComponent(form);
    files.push({ path: 'src/generated/GeneratedForm.tsx', content: componentCode });

    // 2. Generate Validation Schema
    const validationCode = this.generateValidation(form);
    files.push({ path: 'src/generated/validation.ts', content: validationCode });

    // 3. Generate Types
    const typesCode = this.generateTypes(form);
    files.push({ path: 'src/generated/types.ts', content: typesCode });

    // 4. Generate Theme
    const themePlugin = this.registry.get('theme', 'css-variables');
    // Naively assume one theme plugin or use default logic? 
    // The prompt says "Implement CssVariablesThemePlugin".
    // We can manually invoke it if registered, or just hardcode the check.
    if (themePlugin) {
      // castings needed due to loose typing in registry return
      const css = (themePlugin as any).generateCss(form.theme);
      files.push({ path: 'src/generated/theme.css', content: css });
    }

    return files;
  }

  private generateComponent(form: FormModel): string {
    // Needs to gather imports, field codes, layout code
    const layoutPlugin = this.registry.get('layout', form.layout.type || 'vertical');

    // Generate code for each field
    const fieldCodes = form.fields.map(field => {
      const plugin = this.registry.getFieldPlugin(field.ui.widget || field.type); // prioritization
      if (!plugin) {
        // Fallback for missing plugins to prevent build errors
        return `<div className="p-4 border border-red-200 bg-red-50 rounded text-red-600 text-sm">
            Unsupported field type: <strong>${field.ui.widget || field.type}</strong>
          </div>`;
      }
      return plugin.generateCode(field, { form });
    });

    const layoutCode = layoutPlugin
      ? (layoutPlugin as any).generateLayout(fieldCodes, form)
      : fieldCodes.join('\n');

    return `import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formSchema } from './validation';
import { FormValues } from './types';
import { 
  Input, Button, Label, Textarea, Checkbox, 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '../components/ui'; // Assuming template has these
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export const GeneratedForm = () => {
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    alert(JSON.stringify(data, null, 2));
  };

    return (
    <Card className="w-full max-w-2xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>${form.title}</CardTitle>
        ${(form as any).description ? `<p className="text-gray-500">${(form as any).description}</p>` : ''}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          ${layoutCode}
          <div className="pt-4">
             <Button type="submit" className="w-full sm:w-auto">${(form.ui as any)?.submitLabel || 'Submit'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
`;
  }

  private generateValidation(form: FormModel): string {
    const fields = form.fields.map(field => {
      const plugin = this.registry.getFieldPlugin(field.ui.widget || field.type);
      return `${field.key}: ${plugin ? plugin.generateValidation(field) : 'z.any()'}`;
    });

    return `import { z } from 'zod';

export const formSchema = z.object({
  ${fields.join(',\n  ')}
});
`;
  }

  private generateTypes(form: FormModel): string {
    return `import { z } from 'zod';
import { formSchema } from './validation';

export type FormValues = z.infer<typeof formSchema>;
`;
  }
}
