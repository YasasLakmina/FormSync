import { FieldUiConfig } from '../models';

export function generateFieldStyles(ui: FieldUiConfig) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const styles = ui.style || {};
    const inputStyle = [
        styles.inputBackgroundColor ? `backgroundColor: "${styles.inputBackgroundColor}"` : '',
        styles.borderColor ? `borderColor: "${styles.borderColor}"` : '',
        styles.textColor ? `color: "${styles.textColor}"` : '',
    ].filter(Boolean).join(', ');

    const labelStyle = styles.labelColor ? `style={{ color: "${styles.labelColor}" }}` : '';
    const inputStyleProp = inputStyle ? `style={{ ${inputStyle} }}` : '';
    const placeholderClass = styles.placeholderColor ? `placeholder-[${styles.placeholderColor}]` : '';

    return { labelStyle, inputStyleProp, placeholderClass };
}
