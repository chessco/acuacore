import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/documents.dto';

// TODO: Import the specific auth guard and FileInterceptor for uploads

@Controller('workspace/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  // @UseInterceptors(FileInterceptor('file')) // Assume we'll add this later depending on the upload strategy
  create(@Request() req: any, @Body() createDocumentDto: CreateDocumentDto) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    return this.documentsService.create(tenantId, userId, createDocumentDto);
  }

  @Get()
  findAll(@Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.documentsService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.documentsService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    const tenantId = req.user.tenantId;
    return this.documentsService.update(tenantId, id, updateDocumentDto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.documentsService.remove(tenantId, id);
  }
}
