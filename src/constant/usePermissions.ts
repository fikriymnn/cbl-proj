// usePermissions.ts - Updated with API menu support

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
 * Interface for API menu permissions
 */
interface APIMenuPermission {
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  is_active: boolean;
}

/**
 * Interface for API menu item
 */
interface APIMenuItem {
  id: number;
  name: string;
  icon: string;
  path: string | null;
  parent_id: number | null;
  level: number;
  is_active: boolean;
  permissions: APIMenuPermission;
  children?: APIMenuItem[];
}

/**
 * Check if user is super admin or developer
 */
const isSuperUser = (role: string): boolean => {
  const normalizedRole = role?.toLowerCase();
  return normalizedRole === 'super admin' || normalizedRole === 'developer';
};

/**
 * Get permissions from API menu data
 */
const getPermissionsFromAPIMenu = (
  menuData: APIMenuItem[],
): RoutePermission[] => {
  const permissions: RoutePermission[] = [];

  const extractPermissions = (items: APIMenuItem[]) => {
    items.forEach((item) => {
      if (item.path && item.path !== null && item.is_active) {
        permissions.push({
          path: item.path,
          access: item.permissions.can_view,
          create: item.permissions.can_create,
          edit: item.permissions.can_edit,
          delete: item.permissions.can_delete,
        });
      }

      // Recursively extract from children
      if (item.children && item.children.length > 0) {
        extractPermissions(item.children);
      }
    });
  };

  extractPermissions(menuData);
  return permissions;
};

/**
 * Find permission for a specific path in API menu
 */
const findPermissionInAPIMenu = (
  menuData: APIMenuItem[],
  targetPath: string,
): RoutePermission | undefined => {
  const findInItems = (items: APIMenuItem[]): RoutePermission | undefined => {
    for (const item of items) {
      if (item.path === targetPath && item.is_active) {
        return {
          path: item.path,
          access: item.permissions.can_view,
          create: item.permissions.can_create,
          edit: item.permissions.can_edit,
          delete: item.permissions.can_delete,
        };
      }

      if (item.children && item.children.length > 0) {
        const found = findInItems(item.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  return findInItems(menuData);
};

export const usePermissions = (role: string, bagian: string) => {
  // Check if we should use custom menu from API
  const useCustomMenu = localStorage.getItem('useCustomMenu') === 'true';
  const userMenuData = localStorage.getItem('userMenu');

  // Get permissions based on source (API or rbacConfig)
  const permissions = useMemo(() => {
    if (isSuperUser(role)) {
      return [
        {
          path: '*',
          access: true,
          create: true,
          edit: true,
          delete: true,
        },
      ];
    }

    // Try to use API menu data first
    if (useCustomMenu && userMenuData) {
      try {
        const parsedMenu = JSON.parse(userMenuData);
        if (Array.isArray(parsedMenu) && parsedMenu.length > 0) {
          return getPermissionsFromAPIMenu(parsedMenu);
        }
      } catch (error) {
        console.error('Error parsing user menu for permissions:', error);
      }
    }

    // Fallback to rbacConfig
    return getPermissionsForRole(role, bagian);
  }, [role, bagian, useCustomMenu, userMenuData]);

  const checkAccess = (path: string) => {
    if (isSuperUser(role)) return true;

    // Check in API menu data first
    if (useCustomMenu && userMenuData) {
      try {
        const parsedMenu = JSON.parse(userMenuData);
        const permission = findPermissionInAPIMenu(parsedMenu, path);
        if (permission) return permission.access;
      } catch (error) {
        console.error('Error checking access from API menu:', error);
      }
    }

    // Fallback to rbacConfig
    return hasAccessToPath(role, bagian, path);
  };

  const checkCreate = (path: string) => {
    if (isSuperUser(role)) return true;

    // Check in API menu data first
    if (useCustomMenu && userMenuData) {
      try {
        const parsedMenu = JSON.parse(userMenuData);
        const permission = findPermissionInAPIMenu(parsedMenu, path);
        if (permission) return permission.create;
      } catch (error) {
        console.error('Error checking create permission from API menu:', error);
      }
    }

    // Fallback to rbacConfig
    return canCreate(role, bagian, path);
  };

  const checkEdit = (path: string) => {
    if (isSuperUser(role)) return true;

    // Check in API menu data first
    if (useCustomMenu && userMenuData) {
      try {
        const parsedMenu = JSON.parse(userMenuData);
        const permission = findPermissionInAPIMenu(parsedMenu, path);
        if (permission) return permission.edit;
      } catch (error) {
        console.error('Error checking edit permission from API menu:', error);
      }
    }

    // Fallback to rbacConfig
    return canEdit(role, bagian, path);
  };

  const checkDelete = (path: string) => {
    if (isSuperUser(role)) return true;

    // Check in API menu data first
    if (useCustomMenu && userMenuData) {
      try {
        const parsedMenu = JSON.parse(userMenuData);
        const permission = findPermissionInAPIMenu(parsedMenu, path);
        if (permission) return permission.delete;
      } catch (error) {
        console.error('Error checking delete permission from API menu:', error);
      }
    }

    // Fallback to rbacConfig
    return canDelete(role, bagian, path);
  };

  const accessiblePaths = useMemo(() => {
    if (isSuperUser(role)) return ['*'];

    // Get from API menu if available
    if (useCustomMenu && userMenuData) {
      try {
        const parsedMenu = JSON.parse(userMenuData);
        return getPermissionsFromAPIMenu(parsedMenu)
          .filter((p) => p.access)
          .map((p) => p.path);
      } catch (error) {
        console.error('Error getting accessible paths from API menu:', error);
      }
    }

    // Fallback to rbacConfig
    return getAccessiblePaths(role, bagian);
  }, [role, bagian, useCustomMenu, userMenuData]);

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

    // Check in API menu data first
    if (useCustomMenu && userMenuData) {
      try {
        const parsedMenu = JSON.parse(userMenuData);
        const permission = findPermissionInAPIMenu(parsedMenu, path);
        if (permission) return permission;
      } catch (error) {
        console.error('Error getting permission from API menu:', error);
      }
    }

    // Fallback to rbacConfig
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
