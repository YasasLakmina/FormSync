import { sanitizeJavaBasePackage, sanitizeJavaPackageSegment } from './javaPackageUtils';

describe('javaPackageUtils', () => {
    it('suffixes reserved keyword segments so package declarations compile', () => {
        expect(sanitizeJavaBasePackage('com.new')).toBe('com.new_');
        expect(sanitizeJavaBasePackage('com.int')).toBe('com.int_');
        expect(sanitizeJavaBasePackage('com.class')).toBe('com.class_');
        expect(sanitizeJavaBasePackage('com.package')).toBe('com.package_');
    });

    it('leaves safe segments unchanged', () => {
        expect(sanitizeJavaBasePackage('com.example.demo')).toBe('com.example.demo');
        expect(sanitizeJavaBasePackage('com.employee')).toBe('com.employee');
    });

    it('sanitizeJavaPackageSegment appends underscore only for reserved words', () => {
        expect(sanitizeJavaPackageSegment('new')).toBe('new_');
        expect(sanitizeJavaPackageSegment('news')).toBe('news');
        expect(sanitizeJavaPackageSegment('New')).toBe('New_');
    });

    it('handles empty input', () => {
        expect(sanitizeJavaBasePackage('')).toBe('com.app');
        expect(sanitizeJavaBasePackage('...')).toBe('com.app');
    });
});
