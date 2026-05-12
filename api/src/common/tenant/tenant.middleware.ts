import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AsyncLocalStorage } from 'async_hooks';

export const tenantStorage = new AsyncLocalStorage<string>();

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    // In a real app, we would validate the tenantId here
    // For now, we just pass it to the context
    if (tenantId) {
      tenantStorage.run(tenantId, () => next());
    } else {
      next();
    }
  }
}

export function getTenantId(): string {
  const tenantId = tenantStorage.getStore();
  if (!tenantId) {
    // Acuaequipos Enterprise is the primary tenant
    return 'edd1ac37-5ff9-4e46-bc7f-fff3c414d718'; 
  }
  return tenantId;
}
