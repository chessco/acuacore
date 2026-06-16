import { WorkspaceIdeaStatus } from '@prisma/mysql-client';

export class CreateIdeaDto {
  title: string;
  description?: string;
  status?: WorkspaceIdeaStatus;
  priority?: string;
  category?: string;
}

export class UpdateIdeaDto {
  title?: string;
  description?: string;
  status?: WorkspaceIdeaStatus;
  priority?: string;
  category?: string;
}
