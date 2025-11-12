import { Controller, Post, Body, Res, Header } from '@nestjs/common';
import { Response } from 'express';
import { ExportService } from './export.service';
import { FormModel } from '@formsync/formgen-core';

@Controller('export')
export class ExportController {
    constructor(private readonly exportService: ExportService) { }

    @Post('react-vite')
    @Header('Content-Type', 'application/zip')
    @Header('Content-Disposition', 'attachment; filename="form-project.zip"')
    async exportReactVite(@Body() formModel: FormModel, @Res() res: Response) {
        const stream = await this.exportService.generateReactViteZip(formModel);
        stream.pipe(res);
    }
}
