// pages/Master/MasterHakAkses.tsx

import DefaultLayout from '../../layout/DefaultLayout';
import React, { useEffect, useState } from 'react';
import Loading from '../../components/Loading';
import ModalKosonganSmall from '../../components/Modals/ModalKosonganSmall';
import ModalXL from '../../components/Tables/PPIC/JadwalProduksi/ModalXL';
import { masterMenuApi } from './services/masterMenuApi';
import {
  Role,
  CreateRoleDto,
  UpdatePermissionDto,
  MenuWithPermissions,
} from './types/masterMenu.types';
import { IconComponent } from '../../constant/icons';

function MasterHakAkses() {
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [menusWithPermissions, setMenusWithPermissions] = useState<
    MenuWithPermissions[]
  >([]);

  // Form states
  const [newRole, setNewRole] = useState<CreateRoleDto>({
    name: '',
    description: '',
  });

  const [showModalTambah, setShowModalTambah] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [updatingPermissions, setUpdatingPermissions] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setIsLoading(true);
      const data = await masterMenuApi.getAllRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error loading roles:', error);
      alert('Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRolePermissions = async (roleId: number) => {
    try {
      setIsLoading(true);
      const response = await masterMenuApi.getRoleMenuByRoleId(roleId);
      console.log('Role menu data loaded:', response);

      // The API returns { role: Role, menus: MenuWithPermissions[] }
      if (response.menus) {
        setMenusWithPermissions(response.menus);
      }

      // Update selected role with the role data from response
      if (response.role) {
        setSelectedRole(response.role);
      }
    } catch (error) {
      console.error('Error loading role permissions:', error);
      alert('Failed to load permissions');
      setMenusWithPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.name.trim()) {
      alert('Role name is required');
      return;
    }

    try {
      setIsLoading(true);
      await masterMenuApi.createRole(newRole);
      setNewRole({ name: '', description: '' });
      closeModalTambah();
      await loadRoles();
      alert('Role created successfully');
    } catch (error) {
      console.error('Error creating role:', error);
      alert('Failed to create role');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePermission = async (
    roleMenuId: number,
    updates: Partial<UpdatePermissionDto>,
    currentPermissions: MenuWithPermissions['permissions'],
  ) => {
    if (!currentPermissions) return;

    try {
      setUpdatingPermissions((prev) => new Set(prev).add(roleMenuId));

      const updateData: UpdatePermissionDto = {
        can_view: updates.can_view ?? currentPermissions.can_view,
        can_create: updates.can_create ?? currentPermissions.can_create,
        can_edit: updates.can_edit ?? currentPermissions.can_edit,
        can_delete: updates.can_delete ?? currentPermissions.can_delete,
        is_active: updates.is_active ?? currentPermissions.is_active,
      };

      await masterMenuApi.updatePermission(roleMenuId, updateData);

      // Reload permissions after update
      if (selectedRole) {
        await loadRolePermissions(selectedRole.id);
      }
    } catch (error) {
      console.error('Error updating permission:', error);
      alert('Failed to update permission');
    } finally {
      setUpdatingPermissions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(roleMenuId);
        return newSet;
      });
    }
  };

  const openModalTambah = () => setShowModalTambah(true);
  const closeModalTambah = () => {
    setShowModalTambah(false);
    setNewRole({ name: '', description: '' });
  };

  const openPermissionModal = async (role: Role) => {
    setSelectedRole(role);
    setShowPermissionModal(true);
    await loadRolePermissions(role.id);
  };

  const closePermissionModal = () => {
    setShowPermissionModal(false);
    setSelectedRole(null);
    setMenusWithPermissions([]);
  };

  const renderPermissionRow = (
    menu: MenuWithPermissions,
    level: number = 0,
  ): React.ReactNode => {
    const permission = menu.permissions;
    const roleMenuId = menu.role_menu_id;
    const isUpdating = roleMenuId ? updatingPermissions.has(roleMenuId) : false;

    return (
      <React.Fragment key={menu.id}>
        <div
          className={`grid grid-cols-12 gap-4 py-4 px-4 border-b border-gray-200 hover:bg-gray-50 transition-colors ${
            isUpdating ? 'opacity-50' : ''
          } ${!permission ? 'bg-red-50' : ''}`}
        >
          {/* Menu Name */}
          <div
            className="col-span-4 flex items-center gap-2"
            style={{ paddingLeft: `${level * 24}px` }}
          >
            {level > 0 && <span className="text-gray-400 text-xs">{'└─'}</span>}
            {menu.icon && <IconComponent name={menu.icon} size={18} />}
            <div className="flex flex-col">
              <span className="font-medium text-sm text-gray-900">
                {menu.name}
              </span>
              {menu.path && (
                <span className="text-xs text-gray-500 mt-0.5">
                  {menu.path}
                </span>
              )}
            </div>
            <span
              className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                menu.level === 1
                  ? 'bg-blue-100 text-blue-700'
                  : menu.level === 2
                  ? 'bg-green-100 text-green-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              L{menu.level}
            </span>
            {!permission && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700">
                No Permission Record
              </span>
            )}
          </div>

          {permission && roleMenuId ? (
            <>
              {/* Can View */}
              <div className="col-span-2 flex items-center justify-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permission.can_view}
                    onChange={(e) =>
                      handleUpdatePermission(
                        roleMenuId,
                        { can_view: e.target.checked },
                        permission,
                      )
                    }
                    disabled={isUpdating}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Can Create */}
              <div className="col-span-2 flex items-center justify-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permission.can_create}
                    onChange={(e) =>
                      handleUpdatePermission(
                        roleMenuId,
                        { can_create: e.target.checked },
                        permission,
                      )
                    }
                    disabled={!permission.can_view || isUpdating}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              {/* Can Edit */}
              <div className="col-span-2 flex items-center justify-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permission.can_edit}
                    onChange={(e) =>
                      handleUpdatePermission(
                        roleMenuId,
                        { can_edit: e.target.checked },
                        permission,
                      )
                    }
                    disabled={!permission.can_view || isUpdating}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>

              {/* Can Delete */}
              <div className="col-span-2 flex items-center justify-center">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permission.can_delete}
                    onChange={(e) =>
                      handleUpdatePermission(
                        roleMenuId,
                        { can_delete: e.target.checked },
                        permission,
                      )
                    }
                    disabled={!permission.can_view || isUpdating}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                </label>
              </div>
            </>
          ) : (
            <>
              <div className="col-span-2 flex items-center justify-center">
                <span className="text-xs text-gray-400 italic">-</span>
              </div>
              <div className="col-span-2 flex items-center justify-center">
                <span className="text-xs text-gray-400 italic">-</span>
              </div>
              <div className="col-span-2 flex items-center justify-center">
                <span className="text-xs text-gray-400 italic">-</span>
              </div>
              <div className="col-span-2 flex items-center justify-center">
                <span className="text-xs text-gray-400 italic">-</span>
              </div>
            </>
          )}
        </div>

        {/* Render children recursively */}
        {menu.children &&
          menu.children.length > 0 &&
          menu.children.map((child) => renderPermissionRow(child, level + 1))}
      </React.Fragment>
    );
  };

  const countTotalMenus = (menus: MenuWithPermissions[]): number => {
    let count = menus.length;
    menus.forEach((menu) => {
      if (menu.children && menu.children.length > 0) {
        count += countTotalMenus(menu.children);
      }
    });
    return count;
  };

  const countActivePermissions = (menus: MenuWithPermissions[]): number => {
    let count = 0;
    menus.forEach((menu) => {
      if (menu.permissions && menu.permissions.can_view) count++;
      if (menu.children && menu.children.length > 0) {
        count += countActivePermissions(menu.children);
      }
    });
    return count;
  };

  return (
    <DefaultLayout>
      <>
        {isLoading && <Loading />}

        <div className="mb-6">
          <h1 className="font-semibold md:text-[28px] text-[20px] text-primary">
            Master Data &gt; Role & Permissions Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage roles and their access permissions to system features
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {roles.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Roles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {roles.filter((r) => r.is_active).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">System Menus</p>
                <p className="text-2xl font-bold text-gray-900">
                  {menusWithPermissions.length > 0
                    ? countTotalMenus(menusWithPermissions)
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 flex items-center justify-center">
            <button
              onClick={openModalTambah}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Role
            </button>
          </div>
        </div>

        {/* Add Role Modal */}
        {showModalTambah && (
          <ModalKosonganSmall
            isOpen={showModalTambah}
            onClose={closeModalTambah}
            judul="Create New Role"
          >
            <div className="flex flex-col gap-5 py-4 px-4">
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-2 block">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                  className="w-full h-11 border-2 border-gray-300 rounded-lg px-4 focus:border-primary focus:outline-none transition-colors"
                  placeholder="e.g., Manager, Supervisor, Admin"
                />
              </div>

              <div>
                <label className="text-gray-700 text-sm font-semibold mb-2 block">
                  Description
                </label>
                <textarea
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                  className="w-full h-24 border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-primary focus:outline-none transition-colors resize-none"
                  placeholder="Brief description of this role's responsibilities"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t-2 border-gray-200">
                <button
                  onClick={closeModalTambah}
                  className="px-6 py-2.5 text-sm font-semibold rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRole}
                  disabled={isLoading || !newRole.name.trim()}
                  className="px-6 py-2.5 text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {isLoading ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </div>
          </ModalKosonganSmall>
        )}

        {/* Roles Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-16">
                    No
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role Name
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-4 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {roles.map((role, index) => (
                  <tr
                    key={role.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          <svg
                            className="w-5 h-5 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">
                            {role.name}
                          </p>
                          <p className="text-xs text-gray-500">ID: {role.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">
                      {role.description || (
                        <span className="italic text-gray-400">
                          No description
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          role.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            role.is_active ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        ></span>
                        {role.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => openPermissionModal(role)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                          />
                        </svg>
                        Manage Permissions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {roles.length === 0 && !isLoading && (
            <div className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                No roles found
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Get started by creating your first role
              </p>
              <button
                onClick={openModalTambah}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create First Role
              </button>
            </div>
          )}
        </div>

        {/* Permissions Modal */}
        {showPermissionModal && selectedRole && (
          <ModalXL
            isOpen={showPermissionModal}
            onClose={closePermissionModal}
            judul={`Permission Management: ${selectedRole.name}`}
          >
            <div className="bg-white pt-8">
              {/* Info Banner */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">
                      Permission Settings
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Configure what actions users with the{' '}
                      <strong>{selectedRole.name}</strong> role can perform.
                      Changes are saved automatically.
                    </p>
                    {menusWithPermissions.length > 0 && (
                      <p className="text-xs text-blue-600 mt-2">
                        Total Menus: {countTotalMenus(menusWithPermissions)} |
                        Active Permissions:{' '}
                        {countActivePermissions(menusWithPermissions)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 py-4 px-4 bg-gradient-to-r from-gray-50 to-gray-100 font-semibold text-sm border-b-2 border-gray-200 sticky top-0 z-10">
                <div className="col-span-4 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  Menu / Feature
                </div>
                <div className="col-span-2 text-center flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  View
                </div>
                <div className="col-span-2 text-center flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create
                </div>
                <div className="col-span-2 text-center flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </div>
                <div className="col-span-2 text-center flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </div>
              </div>

              {/* Permissions List */}
              <div className="max-h-[600px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : menusWithPermissions.length > 0 ? (
                  menusWithPermissions.map((menu) =>
                    renderPermissionRow(menu, 0),
                  )
                ) : (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-1">
                      No menus available
                    </p>
                    <p className="text-sm text-gray-500">
                      Please create menus first before managing permissions
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t-2 border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Note:</span> Disabling "View"
                  will automatically disable other permissions for that menu.
                </div>
                <button
                  onClick={closePermissionModal}
                  className="px-6 py-2.5 text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </ModalXL>
        )}
      </>
    </DefaultLayout>
  );
}
export default MasterHakAkses;
