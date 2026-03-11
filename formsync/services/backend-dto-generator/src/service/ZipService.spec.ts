import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { ZipService } from './ZipService';

describe('ZipService', () => {
    let zipService: ZipService;
    let tempDir: string;

    beforeEach(() => {
        zipService = new ZipService();
        tempDir = path.join(os.tmpdir(), `formsync-zip-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        fs.mkdirSync(tempDir, { recursive: true });
    });

    afterEach(() => {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true });
        }
    });

    function collectArchiveToBuffer(archive: NodeJS.ReadableStream): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            archive.on('data', (chunk: Buffer) => chunks.push(chunk));
            archive.on('end', () => resolve(Buffer.concat(chunks)));
            archive.on('error', reject);
        });
    }

    it('should return an archiver that produces valid zip data', async () => {
        fs.writeFileSync(path.join(tempDir, 'hello.txt'), 'hello');
        const archive = await zipService.zipDirectory(tempDir);
        const buffer = await collectArchiveToBuffer(archive);

        expect(buffer.length).toBeGreaterThan(0);
        expect(buffer[0]).toBe(0x50); // 'P'
        expect(buffer[1]).toBe(0x4b); // 'K'
    });

    it('should include files from the directory', async () => {
        const subDir = path.join(tempDir, 'src', 'main');
        fs.mkdirSync(subDir, { recursive: true });
        fs.writeFileSync(path.join(tempDir, 'root.txt'), 'root');
        fs.writeFileSync(path.join(subDir, 'nested.txt'), 'nested');

        const archive = await zipService.zipDirectory(tempDir);
        const buffer = await collectArchiveToBuffer(archive);
        const asString = buffer.toString('binary');

        expect(asString).toContain('root.txt');
        expect(asString).toContain('nested.txt');
    });
});
