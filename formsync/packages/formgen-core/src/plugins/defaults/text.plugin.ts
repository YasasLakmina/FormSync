import { FieldPlugin, CodeGeneratorContext } from '../interfaces';
import { FieldModel } from '../../models';
import { generateFieldStyles } from '../../utils/style.utils';

export const TextPlugin: FieldPlugin = {
    name: 'text',
    version: '1.0.0',
    type: 'field',
    fieldType: 'string', // Generic string, can be refined by widget
    componentName: 'Input',

    generateCode(field: FieldModel, ctx: CodeGeneratorContext): string {
        const { labelStyle, inputStyleProp, placeholderClass } = generateFieldStyles(field.ui);

        return `<div className="space-y-2">
      <Label htmlFor="${field.id}" ${labelStyle}>${field.ui.label || field.key}</Label>
      <Input
        id="${field.id}"
        {...register("${field.key}")}
        placeholder="${field.ui.placeholder || ''}"
        className="${field.ui.variant === 'filled' ? 'bg-muted' : ''} ${placeholderClass}"
        ${inputStyleProp}
      />
      {errors.${field.key} && <span className="text-destructive text-sm">{errors.${field.key}?.message as string}</span>}
    </div>`;
    },

    generateValidation(field: FieldModel): string {
        let schema = 'z.string()';
        const rules = field.constraints || [];

        // Naive mapping
        rules.forEach(r => {
            if (r.type === 'min' || r.type === 'minLength') schema += `.min(${r.value}, "${r.message || 'Too short'}")`;
            if (r.type === 'max' || r.type === 'maxLength') schema += `.max(${r.value}, "${r.message || 'Too long'}")`;
            if (r.type === 'required') schema += `.min(1, "Required")`; // z.string().min(1) is typical for required text
            if (r.type === 'pattern') schema += `.regex(new RegExp(${JSON.stringify(r.value)}))`;
        });

        if (!rules.find(r => r.type === 'required')) {
            schema += '.optional()';
        }

        return schema;
    }
};
