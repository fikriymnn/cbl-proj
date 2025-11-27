// menuPermissionFilter.ts - Updated version

import { MenuItem, MenuCategory } from './menuConfig';
import { getPermissionsForRole } from './rbacConfig';

/**
 * Check if user is super admin or developer
 */
const isSuperUser = (role: string): boolean => {
  const normalizedRole = role?.toLowerCase();
  return normalizedRole === 'super admin' || normalizedRole === 'developer';
};

/**
 * Filters menu items based on user permissions
 */
export const filterMenuItemsByPermissions = (
  items: MenuItem[],
  role: string,
  bagian: string,
): MenuItem[] => {
  // Super Admin and Developer have access to everything
  if (isSuperUser(role)) {
    return items;
  }

  const permissions = getPermissionsForRole(role, bagian);

  // Create a map for faster lookup
  const permissionMap = new Map(permissions.map((p) => [p.path, p]));

  const filterItems = (menuItems: MenuItem[]): MenuItem[] => {
    return menuItems
      .map((item) => {
        // Check if this item or any of its children have access
        if (item.children && item.children.length > 0) {
          // Recursively filter children
          const filteredChildren = filterItems(item.children);

          // If no children have access, hide the parent
          if (filteredChildren.length === 0) {
            return null;
          }

          // Return item with filtered children
          return {
            ...item,
            children: filteredChildren,
          };
        }

        // For leaf items, check if they have access permission
        const permission = permissionMap.get(item.path);

        // If no permission defined or access is false, hide the item
        if (!permission || !permission.access) {
          return null;
        }

        return item;
      })
      .filter((item): item is MenuItem => item !== null);
  };

  return filterItems(items);
};

/**
 * Filters menu categories based on user permissions
 */
export const filterCategoriesByPermissions = (
  categories: MenuCategory[],
  role: string,
  bagian: string,
): MenuCategory[] => {
  // Super Admin and Developer have access to everything
  if (isSuperUser(role)) {
    return categories;
  }

  return categories
    .map((category) => {
      // Filter items within the category
      const filteredItems = filterMenuItemsByPermissions(
        category.items,
        role,
        bagian,
      );

      // If no items remain, hide the category
      if (filteredItems.length === 0) {
        return null;
      }

      return {
        ...category,
        items: filteredItems,
      };
    })
    .filter((category): category is MenuCategory => category !== null);
};
