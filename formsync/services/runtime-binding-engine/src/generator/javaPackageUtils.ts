/**
 * Java reserved keywords and boolean/null literals that cannot appear alone
 * as a package name segment (JLS identifier rules).
 */
const JAVA_PACKAGE_SEGMENT_FORBIDDEN = new Set([
    'abstract',
    'assert',
    'boolean',
    'break',
    'byte',
    'case',
    'catch',
    'char',
    'class',
    'const',
    'continue',
    'default',
    'do',
    'double',
    'else',
    'enum',
    'extends',
    'final',
    'finally',
    'float',
    'for',
    'goto',
    'if',
    'implements',
    'import',
    'instanceof',
    'int',
    'interface',
    'long',
    'native',
    'new',
    'package',
    'private',
    'protected',
    'public',
    'return',
    'short',
    'static',
    'strictfp',
    'super',
    'switch',
    'synchronized',
    'this',
    'throw',
    'throws',
    'transient',
    'try',
    'void',
    'volatile',
    'while',
    'true',
    'false',
    'null',
    'var',
    'yield',
    'record',
    'sealed',
    'permits',
    'non-sealed',
    'nonsealed',
    'module',
    'exports',
    'opens',
    'requires',
    'uses',
    'provides',
    'transitive',
    'open',
    'to',
    'with',
]);

/** Ensures a package segment is not a reserved word (e.g. `new` → `new_`). */
export function sanitizeJavaPackageSegment(segment: string): string {
    const s = segment.trim();
    if (!s) return 'pkg';
    if (JAVA_PACKAGE_SEGMENT_FORBIDDEN.has(s.toLowerCase())) {
        return `${s}_`;
    }
    return s;
}

/** Sanitizes a full base package (e.g. `com.new` → `com.new_`). */
export function sanitizeJavaBasePackage(basePackage: string): string {
    const parts = basePackage
        .split('.')
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
        .map(sanitizeJavaPackageSegment);
    if (parts.length === 0) return 'com.app';
    return parts.join('.');
}
