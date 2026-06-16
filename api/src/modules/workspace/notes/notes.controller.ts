import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto } from './dto/notes.dto';

// TODO: Import the specific auth and permissions guard for AcuaCore

@Controller('workspace/notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  create(@Request() req, @Body() createNoteDto: CreateNoteDto) {
    const tenantId = req.user.tenantId;
    const userId = req.user.id;
    return this.notesService.create(tenantId, userId, createNoteDto);
  }

  @Get()
  findAll(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.notesService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.notesService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto) {
    const tenantId = req.user.tenantId;
    return this.notesService.update(tenantId, id, updateNoteDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.notesService.remove(tenantId, id);
  }
}
