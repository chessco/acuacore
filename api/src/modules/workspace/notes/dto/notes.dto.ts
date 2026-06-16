export class CreateNoteDto {
  title: string;
  content: string;
  tags?: any;
}

export class UpdateNoteDto {
  title?: string;
  content?: string;
  summary?: string;
  tags?: any;
}
