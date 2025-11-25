import { Injectable } from '@nestjs/common';
import archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const mkdirAsync = promisify(fs.mkdir);
const writeFileAsync = promisify(fs.writeFile);
const rmdirAsync = promisify(fs.rm);

export interface FileToZip {
  path: string;
  content: string;
}

/**
 * ZipGeneratorService
 * 
 * Handles ZIP file creation for Spring Boot projects.
 * Creates temporary directories, organizes files, and generates ZIP archives.
 */
@Injectable()
export class ZipGeneratorService {
  /**
   * Generate a ZIP file from an array of files
   * 
   * @param files Array of files to include in the ZIP
   * @param projectName Name of the project (used for root folder)
   * @returns Buffer containing the ZIP file
   */
  async generateZip(files: FileToZip[], projectName: string): Promise<Buffer> {
    const tempDir = path.join(process.cwd(), 'temp', `${projectName}-${Date.now()}`);
    
    try {
      // Create temporary directory structure
      await this.createProjectStructure(tempDir, projectName, files);
      
      // Create ZIP file
      const zipBuffer = await this.createZipFromDirectory(tempDir, projectName);
      
      return zipBuffer;
    } finally {
      // Cleanup temporary directory
      try {
        await rmdirAsync(tempDir, { recursive: true, force: true });
      } catch (error) {
        console.error('Failed to cleanup temp directory:', error);
      }
    }
  }

  /**
   * Create the project directory structure and write files
   */
  private async createProjectStructure(
    tempDir: string,
    projectName: string,
    files: FileToZip[]
  ): Promise<void> {
    // Create root temp directory
    await mkdirAsync(tempDir, { recursive: true });
    
    // Create project root directory
    const projectRoot = path.join(tempDir, projectName);
    await mkdirAsync(projectRoot, { recursive: true });

    // Write all files
    for (const file of files) {
      const filePath = path.join(projectRoot, file.path);
      const fileDir = path.dirname(filePath);
      
      // Ensure directory exists
      await mkdirAsync(fileDir, { recursive: true });
      
      // Write file
      await writeFileAsync(filePath, file.content, 'utf-8');
    }
  }

  /**
   * Create ZIP archive from directory
   */
  private async createZipFromDirectory(
    sourceDir: string,
    projectName: string
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const archive = archiver('zip', {
        zlib: { level: 9 } // Maximum compression
      });

      // Collect chunks
      archive.on('data', (chunk) => chunks.push(chunk));
      
      // Handle completion
      archive.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer);
      });

      // Handle errors
      archive.on('error', (err) => {
        reject(err);
      });

      // Add the project directory to the archive
      archive.directory(path.join(sourceDir, projectName), projectName);

      // Finalize the archive
      archive.finalize();
    });
  }

  /**
   * Organize files into Spring Boot project structure
   * 
   * @param packageName Base package name (e.g., 'com.formsync.generated')
   * @param className Main class name
   * @param dtoClassName DTO class name
   * @param controllerClassName Controller class name
   * @param files Object containing file contents
   * @returns Array of files with proper paths
   */
  organizeSpringBootFiles(
    packageName: string,
    className: string,
    dtoClassName: string,
    controllerClassName: string,
    files: {
      mainClass: string;
      dto: string;
      controller: string;
      applicationProperties: string;
      pomXml: string;
      readme: string;
      gitignore: string;
    }
  ): FileToZip[] {
    const packagePath = packageName.replace(/\./g, '/');
    const srcMainJava = `src/main/java/${packagePath}`;
    const srcMainResources = 'src/main/resources';

    return [
      // Main application class
      {
        path: `${srcMainJava}/${className}Application.java`,
        content: files.mainClass,
      },
      // DTO
      {
        path: `${srcMainJava}/dto/${dtoClassName}Dto.java`,
        content: files.dto,
      },
      // Controller
      {
        path: `${srcMainJava}/controller/${controllerClassName}Controller.java`,
        content: files.controller,
      },
      // Application properties
      {
        path: `${srcMainResources}/application.properties`,
        content: files.applicationProperties,
      },
      // Maven POM
      {
        path: 'pom.xml',
        content: files.pomXml,
      },
      // README
      {
        path: 'README.md',
        content: files.readme,
      },
      // .gitignore
      {
        path: '.gitignore',
        content: files.gitignore,
      },
    ];
  }
}
