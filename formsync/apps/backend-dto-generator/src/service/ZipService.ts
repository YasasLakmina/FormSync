
import * as fs from 'fs';
import archiver from 'archiver';

export class ZipService {
    public async zipDirectory(sourceDir: string): Promise<archiver.Archiver> {
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        // Good practice to listen for errors
        archive.on('error', (err: any) => {
            throw err;
        });

        // Append files from sourceDir
        archive.directory(sourceDir, false);
        archive.finalize();

        return archive;
    }
}
