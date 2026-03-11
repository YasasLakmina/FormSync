import { TemplateService } from './TemplateService';
import { DataType } from '../model/InternalModel';

describe('TemplateService', () => {
    let service: TemplateService;

    beforeEach(() => {
        service = new TemplateService();
    });

    describe('render', () => {
        it('should render entity template with minimal context', () => {
            const context = {
                name: 'User',
                basePackage: 'com.example',
                fields: [
                    {
                        name: 'username',
                        type: DataType.STRING,
                        constraints: { required: true },
                        description: undefined
                    }
                ]
            };
            const out = service.render('entity', context);
            expect(out).toBeTruthy();
            expect(out.length).toBeGreaterThan(0);
            expect(out).not.toContain('{{');
            expect(out).toContain('public class User');
            expect(out).toContain('com.example.model');
        });

        it('should render enum template with minimal context', () => {
            const context = {
                name: 'StatusEnum',
                basePackage: 'com.example',
                values: ['ACTIVE', 'INACTIVE']
            };
            const out = service.render('enum', context);
            expect(out).toBeTruthy();
            expect(out).not.toContain('{{');
            expect(out).toContain('public enum StatusEnum');
            expect(out).toContain('ACTIVE');
            expect(out).toContain('INACTIVE');
        });

        it('should render repository template', () => {
            const context = { name: 'User', basePackage: 'com.example' };
            const out = service.render('repository', context);
            expect(out).toBeTruthy();
            expect(out).not.toContain('{{');
            expect(out).toContain('UserRepository');
            expect(out).toContain('JpaRepository');
        });

        it('should render service template', () => {
            const context = { name: 'User', basePackage: 'com.example' };
            const out = service.render('service', context);
            expect(out).toBeTruthy();
            expect(out).not.toContain('{{');
            expect(out).toContain('UserService');
        });

        it('should render controller template', () => {
            const context = { name: 'User', basePackage: 'com.example' };
            const out = service.render('controller', context);
            expect(out).toBeTruthy();
            expect(out).not.toContain('{{');
            expect(out).toContain('UserController');
            expect(out).toContain('/api/');
        });

        it('should render pom template', () => {
            const context = {
                name: 'DemoApp',
                version: '1.0.0',
                basePackage: 'com.demo'
            };
            const out = service.render('pom', context);
            expect(out).toBeTruthy();
            expect(out).not.toContain('{{');
            expect(out).toContain('demo-app');
            expect(out).toContain('1.0.0');
        });

        it('should use toSnakeCase in entity table name', () => {
            const context = {
                name: 'UserProfile',
                basePackage: 'com.example',
                fields: []
            };
            const out = service.render('entity', context);
            expect(out).toContain('user_profile');
        });

        it('should use toKebabCase in controller path and pom', () => {
            const context = { name: 'UserProfile', basePackage: 'com.example' };
            const controllerOut = service.render('controller', context);
            expect(controllerOut).toContain('/api/user-profiles');
            const pomContext = { name: 'UserProfile', version: '1.0.0', basePackage: 'com.example' };
            const pomOut = service.render('pom', pomContext);
            expect(pomOut).toContain('user-profile');
        });

        it('should use toJavaType for all DataType values in entity', () => {
            const context = {
                name: 'AllTypes',
                basePackage: 'com.example',
                fields: [
                    { name: 'a', type: DataType.STRING, constraints: {} },
                    { name: 'b', type: DataType.INTEGER, constraints: {} },
                    { name: 'c', type: DataType.LONG, constraints: {} },
                    { name: 'd', type: DataType.DOUBLE, constraints: {} },
                    { name: 'e', type: DataType.BOOLEAN, constraints: {} },
                    { name: 'f', type: DataType.LOCAL_DATE, constraints: {} },
                    { name: 'g', type: DataType.LOCAL_TIME_TIME, constraints: {} },
                    { name: 'h', type: DataType.OBJECT, referenceType: 'Address', constraints: {} },
                    { name: 'i', type: DataType.ENUM, referenceType: 'StatusEnum', constraints: {} },
                    { name: 'j', type: DataType.LIST, referenceType: 'String', constraints: {} },
                    { name: 'k', type: DataType.SET, referenceType: 'Tag', constraints: {} },
                    { name: 'l', type: DataType.MAP, referenceType: 'Object', constraints: {} }
                ]
            };
            const out = service.render('entity', context);
            expect(out).toContain('String');
            expect(out).toContain('Integer');
            expect(out).toContain('Long');
            expect(out).toContain('Double');
            expect(out).toContain('Boolean');
            expect(out).toContain('java.time.LocalDate');
            expect(out).toContain('java.time.LocalDateTime');
            expect(out).toContain('Address');
            expect(out).toContain('StatusEnum');
            expect(out).toMatch(/List[<&]/);
            expect(out).toMatch(/Set[<&]/);
            expect(out).toMatch(/Map[<&]/);
        });

        it('should throw when template not found', () => {
            expect(() => service.render('nonexistent', {})).toThrow(/not found/);
        });
    });
});
