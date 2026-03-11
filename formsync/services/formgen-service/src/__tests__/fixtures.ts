import { FormModel, FieldModel } from '../types';

export const emptyFormModel: FormModel = {
    id: 'empty-1',
    name: 'Empty Form',
    version: '1.0',
    theme: {
        mode: 'light',
        density: 'normal',
        colors: { primary: '#3b82f6', background: '#ffffff', surface: '#ffffff', text: '#111827', muted: '#6b7280', border: '#e5e7eb', error: '#ef4444', inputBackground: '#ffffff' },
        typography: { fontFamily: 'Inter', baseFontSize: 16 },
        radius: 4,
    },
    layout: { order: [] },
    fields: [],
};

export const flatFormModel: FormModel = {
    ...emptyFormModel,
    id: 'flat-1',
    name: 'Contact Form',
    meta: { title: 'Contact Us', description: 'Please fill out the form below.' },
    layout: { order: ['name', 'email', 'message'] },
    fields: [
        { id: 'name', key: 'name', type: 'text', label: 'Full Name', required: true, ui: { placeholder: 'Enter your name' } },
        { id: 'email', key: 'email', type: 'email', label: 'Email Address', required: true },
        { id: 'message', key: 'message', type: 'textarea', label: 'Message', required: false },
    ],
    submit: { text: 'Send Message' }
};

export const groupedFormModel: FormModel = {
    ...emptyFormModel,
    id: 'group-1',
    name: 'Grouped Form',
    layout: { order: ['personalInfo'] },
    fields: [
        {
            id: 'personalInfo', key: 'personalInfo', type: 'group', label: 'Personal Information', required: false,
            children: [
                { id: 'firstName', key: 'firstName', type: 'text', label: 'First Name', required: true },
                { id: 'lastName', key: 'lastName', type: 'text', label: 'Last Name', required: true }
            ]
        }
    ]
};

export const wizardFormModel: FormModel = {
    ...emptyFormModel,
    id: 'wizard-1',
    name: 'Multi Step Wizard Form',
    layout: {
        order: ['step1field', 'step2field', 'unassignedField'],
        steps: [{ id: 'step-1', title: 'Step 1' }, { id: 'step-2', title: 'Step 2' }]
    },
    fields: [
        { id: 'step1field', key: 'step1field', type: 'text', label: 'Step 1 Field', required: true, stepIndex: 0 },
        { id: 'step2field', key: 'step2field', type: 'text', label: 'Step 2 Field', required: false, stepIndex: 1 },
        { id: 'unassignedField', key: 'unassignedField', type: 'text', label: 'Unassigned Field', required: false }
    ]
};

export const exhaustiveFieldsModel: FormModel = {
    ...emptyFormModel,
    id: 'exhaustive-1',
    name: 'Exhaustive Fields Form',
    layout: { order: ['textF', 'emailF', 'passwordF', 'newPasswordF', 'numberF', 'selectF', 'checkboxF', 'textareaF', 'dateF'] },
    fields: [
        { id: 'textF', key: 'textF', type: 'text', label: 'Text Field', required: true, ui: { placeholder: 'text', helpText: 'Help for text', styleOverrides: { labelColor: 'red', backgroundColor: 'blue', borderColor: 'green', inputTextColor: 'white', focusColor: 'yellow' } } },
        { id: 'emailF', key: 'emailF', type: 'email', label: 'Email Field', required: false },
        { id: 'passwordF', key: 'password', type: 'password', label: 'Password', required: true },
        { id: 'newPasswordF', key: 'newPassword', type: 'password', label: 'New Password', required: true },
        { id: 'numberF', key: 'numberF', type: 'number', label: 'Number Field', required: false, constraints: { min: 0, max: 100 } },
        { id: 'selectF', key: 'selectF', type: 'select', label: 'Select Field', required: true, constraints: { enum: ['Option A', 'Option B'] } },
        { id: 'checkboxF', key: 'checkboxF', type: 'checkbox', label: 'Checkbox Field', required: true, ui: { helpText: 'Check this' } },
        { id: 'textareaF', key: 'textareaF', type: 'textarea', label: 'Textarea Field', required: false },
        { id: 'dateF', key: 'dateF', type: 'date', label: 'Date Field', required: true },
    ]
};

export const complexNestedModel: FormModel = {
    ...emptyFormModel,
    id: 'nested-1',
    name: 'Complex Nested Form',
    layout: { order: ['rootGroup'] },
    fields: [
        {
            id: 'rootGroup', key: 'rootGroup', type: 'group', label: 'Root Level', required: false,
            children: [
                {
                    id: 'subGroup', key: 'subGroup', type: 'group', label: 'Sub Level', required: false,
                    children: [
                        { id: 'deepInput', key: 'deepInput', type: 'text', label: 'Deep Input', required: true }
                    ]
                }
            ]
        }
    ]
};
