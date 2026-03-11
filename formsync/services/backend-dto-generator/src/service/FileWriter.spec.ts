import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { FileWriter } from './FileWriter';

describe('FileWriter', () => {
    let writer: FileWriter;
    let tempRoot: string;

    beforeEach(() => {
        writer = new FileWriter();
        tempRoot = path.join(os.tmpdir(), `formsync-filewriter-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    });

    afterEach(() => {
        if (fs.existsSync(tempRoot)) {
            fs.rmSync(tempRoot, { recursive: true });
        }
    });

    it('should create directory and write file', () => {
        const filePath = path.join(tempRoot, 'subdir', 'nested', 'file.txt');
        const content = 'hello world';

        writer.write(filePath, content);

        expect(fs.existsSync(path.dirname(filePath))).toBe(true);
        expect(fs.existsSync(filePath)).toBe(true);
        expect(fs.readFileSync(filePath, 'utf-8')).toBe(content);
    });

    it('should overwrite existing file', () => {
        const filePath = path.join(tempRoot, 'out.txt');
        writer.write(filePath, 'first');
        writer.write(filePath, 'second');

        expect(fs.readFileSync(filePath, 'utf-8')).toBe('second');
    });
});
