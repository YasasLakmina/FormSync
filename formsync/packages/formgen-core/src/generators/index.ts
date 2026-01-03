/**
 * Code Generator Public API
 * 
 * Exports all generator functionality for React code export
 */

export * from './templates';
export * from './react-generator';

// Re-export for convenience
export { generateAppTsx } from './react-generator';
export {
    generatePackageJson,
    generateViteConfig,
    generateTsConfig,
    generateTsConfigNode,
    generateIndexHtml,
    generateMainTsx,
    generateIndexCss,
    generateReadme,
} from './templates';
