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
  createdAt: string;
  updatedAt: string;
}

export interface RoleMenuPermission {
  id: number;
  role_id: number;
  menu_id: number;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  is_active: boolean;
  menu?: MenuNode;
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
