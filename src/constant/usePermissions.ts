// usePermissions.ts - Updated version

import { useMemo } from 'react';
import {
  getPermissionsForRole,
  hasAccessToPath,
  canCreate,
  canEdit,
  canDelete,
  getAccessiblePaths,
  RoutePermission,
} from './rbacConfig';

/**
 * Check if user is super admin or developer
 */
const isSuperUser = (role: string): boolean => {
  const normalizedRole = role?.toLowerCase();
  return normalizedRole === 'super admin' || normalizedRole === 'developer';
};

export const usePermissions = (role: string, bagian: string) => {
  const permissions = useMemo(
    () => getPermissionsForRole(role, bagian),
    [role, bagian],
  );

  const checkAccess = (path: string) => {
    if (isSuperUser(role)) return true;
    return hasAccessToPath(role, bagian, path);
  };

  const checkCreate = (path: string) => {
    if (isSuperUser(role)) return true;
    return canCreate(role, bagian, path);
  };

  const checkEdit = (path: string) => {
    if (isSuperUser(role)) return true;
    return canEdit(role, bagian, path);
  };

  const checkDelete = (path: string) => {
    if (isSuperUser(role)) return true;
    return canDelete(role, bagian, path);
  };

  const accessiblePaths = useMemo(
    () => getAccessiblePaths(role, bagian),
    [role, bagian],
  );

  const getPermissionForPath = (path: string): RoutePermission | undefined => {
    if (isSuperUser(role)) {
      return {
        path,
        access: true,
        create: true,
        edit: true,
        delete: true,
      };
    }
    return permissions.find((p) => p.path === path);
  };

  const isSuper = isSuperUser(role);

  return {
    permissions,
    checkAccess,
    checkCreate,
    checkEdit,
    checkDelete,
    accessiblePaths,
    getPermissionForPath,
    isSuperUser: isSuper,
  };
};
