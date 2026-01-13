// types/masterMenu.types.ts

export interface MenuNode {
  id: number;
  name: string;
  icon: string;
  path: string | null;
  parent_id: number | null;
  order_index: number;
  level: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  children?: MenuNode[];
}

export interface Role {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleMenuPermission {
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  is_active: boolean;
}

export interface MenuWithPermissions {
  id: number;
  name: string;
  icon: string;
  path: string | null;
  parent_id: number | null;
  order_index: number;
  level: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  role_menu_id?: number; // ID from the role_menu table
  permissions?: RoleMenuPermission;
  children?: MenuWithPermissions[];
}

export interface RoleMenuResponse {
  role: Role;
  menus: MenuWithPermissions[];
}

export interface CreateMenuDto {
  name: string;
  icon: string;
  path: string | null;
  parent_id: number | null;
  order_index: number;
  level: number;
}

export interface CreateRoleDto {
  name: string;
  description: string;
}

export interface UpdatePermissionDto {
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  is_active: boolean;
}
