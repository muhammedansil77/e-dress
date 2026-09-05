import { Request, Response, NextFunction } from 'express';
import { AdminRole, Permission } from '../constants';
import { ForbiddenError, UnauthorizedError } from '../errors/app-error';

export const requireRoles = (...allowedRoles: AdminRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.admin) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (req.admin.role === AdminRole.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return next(
        new ForbiddenError(
          `Forbidden: Role '${req.admin.role}' does not have access to this resource. Required: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};

export const requirePermissions = (...requiredPermissions: (Permission | string)[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.admin) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // SUPER_ADMIN has master override
    if (req.admin.role === AdminRole.SUPER_ADMIN) {
      return next();
    }

    const adminPermissions = req.admin.permissions || [];
    const hasAll = requiredPermissions.every((perm) => adminPermissions.includes(perm));

    if (!hasAll) {
      return next(
        new ForbiddenError(
          `Forbidden: Missing required permissions (${requiredPermissions.join(', ')})`
        )
      );
    }

    next();
  };
};
