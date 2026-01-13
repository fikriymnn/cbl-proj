// services/masterMenuApi.ts

import axios from 'axios';
import {
  MenuNode,
  Role,
  RoleMenuResponse,
  CreateMenuDto,
  CreateRoleDto,
  UpdatePermissionDto,
} from '../types/masterMenu.types';

const API_BASE = import.meta.env.VITE_API_LINK;

export const masterMenuApi = {
  // Menu endpoints
  getAllMenus: async (): Promise<MenuNode[]> => {
    const response = await axios.get(`${API_BASE}/master/menu`, {
      withCredentials: true,
    });
    console.log('Fetched menus:', response.data.data);
    return response.data.data;
  },

  createMenu: async (data: CreateMenuDto): Promise<MenuNode> => {
    const response = await axios.post(`${API_BASE}/master/menu`, data, {
      withCredentials: true,
    });
    return response.data;
  },

  deleteMenu: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/master/menu/${id}`, {
      withCredentials: true,
    });
  },

  // Role endpoints
  getAllRoles: async (): Promise<Role[]> => {
    const response = await axios.get(`${API_BASE}/master/roles`, {
      withCredentials: true,
    });
    console.log('Fetched roles:', response.data.data);
    return response.data.data;
  },

  createRole: async (data: CreateRoleDto): Promise<Role> => {
    const response = await axios.post(`${API_BASE}/master/roles`, data, {
      withCredentials: true,
    });
    return response.data;
  },

  // Role Menu endpoints - returns role data AND menus with permissions
  getRoleMenuByRoleId: async (roleId: number): Promise<RoleMenuResponse> => {
    const response = await axios.get(
      `${API_BASE}/master/roleMenu/byIdRole/${roleId}`,
      {
        withCredentials: true,
      },
    );
    console.log('Fetched role menu data:', response.data.data);
    return response.data.data;
  },

  updatePermission: async (
    id: number,
    data: UpdatePermissionDto,
  ): Promise<void> => {
    await axios.put(`${API_BASE}/master/roleMenu/single/${id}`, data, {
      withCredentials: true,
    });
  },
};
