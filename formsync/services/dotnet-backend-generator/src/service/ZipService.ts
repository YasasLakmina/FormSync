import archiver from 'archiver';

export class ZipService {
  public async zipDirectory(sourceDir: string): Promise<archiver.Archiver> {
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err: any) => {
      throw err;
    });

    archive.directory(sourceDir, false);
    archive.finalize();
    return archive;
  }
}
