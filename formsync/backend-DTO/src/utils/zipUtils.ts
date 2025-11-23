import JSZip from 'jszip';
import { GenerationResult, GeneratedArtifact } from '../core/types';

export async function createBackendZip(result: GenerationResult): Promise<Buffer> {
    const zip = new JSZip();

    // Helper to add artifact to zip
    const addArtifact = (artifact: GeneratedArtifact) => {
        zip.file(artifact.relativePath, artifact.content);
    };

    addArtifact(result.model);
    addArtifact(result.dto);
    addArtifact(result.repository);
    addArtifact(result.service);

    result.commonArtifacts.forEach(addArtifact);

    // Add README
    const readmeContent = `# Generated Backend for ${result.entity.entityName}

## Overview
This package contains generated Spring Boot code including:
- **Model**: ${result.entity.entityName}.java
- **DTO**: ${result.entity.entityName}DTO.java
- **Repository**: ${result.entity.entityName}Repository.java
- **Service**: ${result.entity.entityName}Service.java

## Dependencies
Ensure your project has:
- Spring Boot Starter Web
- Spring Boot Starter Data JPA
- Spring Boot Starter Validation
- PostgreSQL Driver

## Usage
1. Copy the contents of 'src/main/java' into your project's source tree.
2. Ensure the package names match or are scannable by your @SpringBootApplication.
`;

    zip.file('README.md', readmeContent);

    // JSZip generateAsync returns a Promise<Buffer> (when type is nodebuffer)
    return await zip.generateAsync({ type: 'nodebuffer' });
}
