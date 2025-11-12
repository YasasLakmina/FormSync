import { LayoutPlugin } from '../interfaces';
import { FormModel } from '../../models';

export const VerticalLayoutPlugin: LayoutPlugin = {
    name: 'vertical',
    version: '1.0.0',
    type: 'layout',
    layoutType: 'vertical',

    generateLayout(fieldsCode: string[], form: FormModel): string {
        return `<div className="space-y-6">
      ${fieldsCode.join('\n')}
    </div>`;
    }
};
