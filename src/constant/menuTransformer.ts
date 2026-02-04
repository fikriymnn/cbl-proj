// menuTransformer.ts
import { MenuItem, MenuCategory } from './menuConfig';

/**
 * Interface for API menu response structure
 */
interface APIMenuItem {
  id: number;
  name: string;
  icon: string;
  path: string | null;
  parent_id: number | null;
  level: number;
  is_active: boolean;
  permissions: {
    can_view: boolean;
    can_create: boolean;
    can_edit: boolean;
    can_delete: boolean;
    is_active: boolean;
  };
  children?: APIMenuItem[];
}

/**
 * Transform API menu item to MenuItem format
 */
const transformAPIMenuItem = (apiItem: APIMenuItem): MenuItem => {
  const menuItem: MenuItem = {
    name: apiItem.name,
    path: apiItem.path || '#',
    // Use icon from API, fallback to 'dashboard' if null or empty
    icon:
      apiItem.icon && apiItem.icon.trim() !== '' ? apiItem.icon : 'dashboard',
  };

  // Transform children if they exist
  if (apiItem.children && apiItem.children.length > 0) {
    menuItem.children = apiItem.children.map(transformAPIMenuItem);
  }

  return menuItem;
};

/**
 * Transform API menu response to MenuCategory format
 * @param apiMenuData - Array of menu items from API response
 * @returns Array of MenuCategory
 */
export const transformAPIMenuToCategories = (
  apiMenuData: APIMenuItem[],
): MenuCategory[] => {
  // Filter only level 1 items (top-level categories)
  const topLevelItems = apiMenuData.filter(
    (item) => item.level === 1 && item.is_active,
  );

  return topLevelItems.map((category) => ({
    name: category.name,
    // Use icon string from API, fallback to 'dashboard' if null or empty
    icon:
      category.icon && category.icon.trim() !== ''
        ? category.icon
        : 'dashboard',
    items: category.children ? category.children.map(transformAPIMenuItem) : [],
  }));
};

/**
 * Check if user has custom menu from API
 * @param menu - Menu data from login response
 * @returns boolean
 */
export const hasCustomMenu = (menu: any): boolean => {
  return menu !== null && Array.isArray(menu) && menu.length > 0;
};
