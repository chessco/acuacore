const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'api/src/modules/workspace');
const webDir = path.join(__dirname, 'web/src/modules/workspace/hooks');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(filePath, content);
}

// 1. Fix Workspace.module.ts
replaceInFile(path.join(apiDir, 'workspace.module.ts'), [
    ["import { PrismaModule } from '../../prisma/prisma.module';", "import { DatabaseModule } from '../../common/database/database.module';"],
    ["imports: [PrismaModule],", "imports: [DatabaseModule],"]
]);

// 2. Fix API Controllers (add : any to req)
const controllers = [
    'ai/ai.controller.ts',
    'documents/documents.controller.ts',
    'ideas/ideas.controller.ts',
    'notes/notes.controller.ts',
    'search/search.controller.ts'
];
for (const ctrl of controllers) {
    replaceInFile(path.join(apiDir, ctrl), [
        ['@Request() req,', '@Request() req: any,'],
        ['@Request() req)', '@Request() req: any)']
    ]);
}

// 3. Fix API Services (PrismaService -> DatabaseService)
const services = [
    'ai/ai.service.ts',
    'documents/documents.service.ts',
    'ideas/ideas.service.ts',
    'notes/notes.service.ts',
    'search/search.service.ts'
];
for (const svc of services) {
    replaceInFile(path.join(apiDir, svc), [
        ["import { PrismaService } from '../../../prisma/prisma.service';", "import { DatabaseService } from '../../../common/database/database.service';"],
        ["constructor(private prisma: PrismaService)", "constructor(private db: DatabaseService)"],
        ["this.prisma.workspaceNote", "this.db.mysql.workspaceNote"],
        ["this.prisma.workspaceDocument", "this.db.mysql.workspaceDocument"],
        ["this.prisma.workspaceIdea", "this.db.mysql.workspaceIdea"],
        ["this.prisma.", "this.db.mysql."]
    ]);
}

// 4. Fix Web Hooks (import Context path)
const hooks = [
    'useWorkspaceDocuments.ts',
    'useWorkspaceIdeas.ts',
    'useWorkspaceNotes.ts',
    'useWorkspaceSearch.ts'
];
for (const hook of hooks) {
    replaceInFile(path.join(webDir, hook), [
        ["import { useTenant } from '../../contexts/TenantContext';", "import { useTenant } from '../../../contexts/TenantContext';"]
    ]);
}

console.log("All fixes applied successfully.");
