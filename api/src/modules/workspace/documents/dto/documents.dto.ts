export class CreateDocumentDto {
  title: string;
  description?: string;
  filePath: string;
  fileType: string;
  tags?: any;
}

export class UpdateDocumentDto {
  title?: string;
  description?: string;
  tags?: any;
}
