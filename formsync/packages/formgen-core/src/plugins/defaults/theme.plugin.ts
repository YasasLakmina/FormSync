import { ThemePlugin } from '../interfaces';
import { FormModel } from '../../models';

export const CssVariablesThemePlugin: ThemePlugin = {
    name: 'css-variables',
    version: '1.0.0',
    type: 'theme',

    generateCss(theme: FormModel['theme']): string {
        return `:root {
  --color-primary: ${theme.colors.primary};
  --color-background: ${theme.colors.background};
  --color-text: ${theme.colors.text};
  --color-error: ${theme.colors.error};
  --color-border: ${theme.colors.border};
  
  --spacing-base: ${theme.spacing.base};
  --radius-base: ${theme.borderRadius.base};
  
  --font-family: ${theme.typography.fontFamily};
}`;
    }
};
