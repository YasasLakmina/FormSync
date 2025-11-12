import { FieldPlugin, CodeGeneratorContext } from '../interfaces';
import { FieldModel } from '../../models';
import { generateFieldStyles } from '../../utils/style.utils';

export const EmailPlugin: FieldPlugin = {
  name: 'email',
  version: '1.0.0', // Fixed version
  type: 'field',
  fieldType: 'string', // format: email
  componentName: 'Input',
  generateCode(field: FieldModel, ctx: CodeGeneratorContext): string {
    const { labelStyle, inputStyleProp, placeholderClass } = generateFieldStyles(field.ui);

    return `<div className="space-y-2">
      <Label htmlFor="${field.id}" ${labelStyle}>${field.ui.label || field.key}</Label>
      <Input
        id="${field.id}"
        type="email"
        {...register("${field.key}")}
        placeholder="${field.ui.placeholder || ''}"
        className="${placeholderClass}"
        ${inputStyleProp}
      />
      {errors.${field.key} && <span className="text-destructive text-sm">{errors.${field.key}?.message as string}</span>}
    </div>`;
  },
  generateValidation(field: FieldModel): string {
    // Reuses logic basically but enforces email
    return `z.string().email("Invalid email").min(1, "Required")` + (field.constraints.find(c => c.type === 'required') ? '' : '.optional()');
  }
};

export const PasswordPlugin: FieldPlugin = {
  name: 'password',
  version: '1.0.0',
  type: 'field',
  fieldType: 'string',
  componentName: 'Input',
  generateCode(field: FieldModel, ctx: CodeGeneratorContext): string {
    const { labelStyle, inputStyleProp, placeholderClass } = generateFieldStyles(field.ui);

    return `<div className="space-y-2">
      <Label htmlFor="${field.id}" ${labelStyle}>${field.ui.label || field.key}</Label>
      <Input
        id="${field.id}"
        type="password"
        {...register("${field.key}")}
        placeholder="${field.ui.placeholder || ''}"
        className="${placeholderClass}"
        ${inputStyleProp}
      />
      {errors.${field.key} && <span className="text-destructive text-sm">{errors.${field.key}?.message as string}</span>}
    </div>`;
  },
  generateValidation(field: FieldModel): string {
    return `z.string()` + (field.constraints.find(c => c.type === 'required') ? '.min(1, "Required")' : '.optional()');
  }
};

export const TextareaPlugin: FieldPlugin = {
  name: 'textarea',
  version: '1.0.0',
  type: 'field',
  fieldType: 'string',
  componentName: 'Textarea',
  generateCode(field: FieldModel, ctx: CodeGeneratorContext): string {
    const { labelStyle, inputStyleProp, placeholderClass } = generateFieldStyles(field.ui);

    return `<div className="space-y-2">
      <Label htmlFor="${field.id}" ${labelStyle}>${field.ui.label || field.key}</Label>
      <Textarea
        id="${field.id}"
        {...register("${field.key}")}
        placeholder="${field.ui.placeholder || ''}"
        className="${placeholderClass}"
        ${inputStyleProp}
      />
      {errors.${field.key} && <span className="text-destructive text-sm">{errors.${field.key}?.message as string}</span>}
    </div>`;
  },
  generateValidation(field: FieldModel): string {
    return `z.string()` + (field.constraints.find(c => c.type === 'required') ? '.min(1, "Required")' : '.optional()');
  }
};

export const CheckboxPlugin: FieldPlugin = {
  name: 'checkbox',
  version: '1.0.0',
  type: 'field',
  fieldType: 'boolean',
  componentName: 'Checkbox',
  generateCode(field: FieldModel, ctx: CodeGeneratorContext): string {
    const { labelStyle } = generateFieldStyles(field.ui);
    // Checkbox usually doesn't have bg color same way? But can apply to container or check.
    // Simplified: ignoring other styles for checkbox for now or applying to container?
    // Let's apply label style at least.

    return `<div className="flex items-center space-x-2">
      <Checkbox 
        id="${field.id}" 
        onCheckedChange={(checked) => setValue("${field.key}", checked)}
        {...register("${field.key}")} 
      />
      <Label htmlFor="${field.id}" ${labelStyle}>${field.ui.label || field.key}</Label>
    </div>`;
  },
  generateValidation(field: FieldModel): string {
    return `z.boolean()` + (field.constraints.find(c => c.type === 'required') ? '.refine(v => v === true, "Required")' : '.optional()');
  }
};

export const SelectPlugin: FieldPlugin = {
  name: 'select',
  version: '1.0.0',
  type: 'field',
  fieldType: 'string',
  componentName: 'Select',
  generateCode(field: FieldModel, ctx: CodeGeneratorContext): string {
    const { labelStyle } = generateFieldStyles(field.ui);
    // Note: shadcn select is complex to style inline for trigger/content without class manipulations.
    // We can try applying style to SelectTrigger or wrapping div.

    return `<div className="space-y-2">
      <Label ${labelStyle}>${field.ui.label || field.key}</Label>
      <Select onValueChange={(val) => setValue("${field.key}", val)}>
        <SelectTrigger>
          <SelectValue placeholder="${field.ui.placeholder || 'Select...'}" />
        </SelectTrigger>
        <SelectContent>
          ${(field.ui.options || []).map(o => `<SelectItem value="${o.value}">${o.label}</SelectItem>`).join('\n')}
        </SelectContent>
      </Select>
      {errors.${field.key} && <span className="text-destructive text-sm">{errors.${field.key}?.message as string}</span>}
    </div>`;
  },
  generateValidation(field: FieldModel): string {
    // enum validation
    return `z.string().min(1, "Required")` + (field.constraints.find(c => c.type === 'required') ? '' : '.optional()');
  }
};

export const NumberPlugin: FieldPlugin = {
  name: 'number',
  version: '1.0.0',
  type: 'field',
  fieldType: 'number',
  componentName: 'Input',
  generateCode(field: FieldModel, ctx: CodeGeneratorContext): string {
    const { labelStyle, inputStyleProp, placeholderClass } = generateFieldStyles(field.ui);

    return `<div className="space-y-2">
      <Label htmlFor="${field.id}" ${labelStyle}>${field.ui.label || field.key}</Label>
      <Input
        id="${field.id}"
        type="number"
        {...register("${field.key}", { valueAsNumber: true })}
        placeholder="${field.ui.placeholder || ''}"
        className="${placeholderClass}"
        ${inputStyleProp}
      />
      {errors.${field.key} && <span className="text-destructive text-sm">{errors.${field.key}?.message as string}</span>}
    </div>`;
  },
  generateValidation(field: FieldModel): string {
    return `z.number()` + (field.constraints.find(c => c.type === 'required') ? '' : '.optional()');
  }
};
