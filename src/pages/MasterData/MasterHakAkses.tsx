// pages/Master/MasterHakAkses.tsx

import DefaultLayout from '../../layout/DefaultLayout';
import React, { useEffect, useState } from 'react';
import Loading from '../../components/Loading';
import ModalKosonganSmall from '../../components/Modals/ModalKosonganSmall';
import ModalXL from '../../components/Tables/PPIC/JadwalProduksi/ModalXL';
import { masterMenuApi } from './services/masterMenuApi';
import {
  Role,
  RoleMenuPermission,
  MenuNode,
  CreateRoleDto,
  UpdatePermissionDto,
} from './types/masterMenu.types';

function MasterHakAkses() {
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [rolePermissions, setRolePermissions] = useState<RoleMenuPermission[]>(
    [],
  );
  const [allMenus, setAllMenus] = useState<MenuNode[]>([]);

  // Form states
  const [newRole, setNewRole] = useState<CreateRoleDto>({
    name: '',
    description: '',
  });

  const [showModalTambah, setShowModalTambah] = useState(false);
  const [showEdit, setShowEdit] = useState<boolean[]>([]);

  useEffect(() => {
    loadRoles();
    loadAllMenus();
  }, []);

  const loadRoles = async () => {
    try {
      setIsLoading(true);
      const data = await masterMenuApi.getAllRoles();
      setRoles(data);
      setShowEdit(new Array(data.length).fill(false));
    } catch (error) {
      console.error('Error loading roles:', error);
      alert('Failed to load roles');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllMenus = async () => {
    try {
      const data = await masterMenuApi.getAllMenus();
      setAllMenus(data);
    } catch (error) {
      console.error('Error loading menus:', error);
    }
  };

  const loadRolePermissions = async (roleId: number) => {
    try {
      setIsLoading(true);
      const data = await masterMenuApi.getRoleMenuByRoleId(roleId);
      setRolePermissions(data);
    } catch (error) {
      console.error('Error loading permissions:', error);
      alert('Failed to load permissions');
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
    permissionId: number,
    updates: Partial<UpdatePermissionDto>,
  ) => {
    try {
      const permission = rolePermissions?.find((p) => p.id === permissionId);
      if (!permission) return;

      const updateData: UpdatePermissionDto = {
        can_view: updates.can_view ?? permission.can_view,
        can_create: updates.can_create ?? permission.can_create,
        can_edit: updates.can_edit ?? permission.can_edit,
        can_delete: updates.can_delete ?? permission.can_delete,
        is_active: updates.is_active ?? permission.is_active,
      };

      await masterMenuApi.updatePermission(permissionId, updateData);

      // Reload permissions to reflect changes
      if (selectedRole) {
        await loadRolePermissions(selectedRole.id);
      }
    } catch (error) {
      console.error('Error updating permission:', error);
      alert('Failed to update permission');
    }
  };

  const openModalTambah = () => setShowModalTambah(true);
  const closeModalTambah = () => {
    setShowModalTambah(false);
    setNewRole({ name: '', description: '' });
  };

  const openEdit = async (index: number, role: Role) => {
    const newShowEdit = [...showEdit];
    newShowEdit[index] = true;
    setShowEdit(newShowEdit);
    setSelectedRole(role);
    await loadRolePermissions(role.id);
  };

  const closeEdit = (index: number) => {
    const newShowEdit = [...showEdit];
    newShowEdit[index] = false;
    setShowEdit(newShowEdit);
    setSelectedRole(null);
    setRolePermissions([]);
  };

  // Helper function to organize permissions by menu hierarchy
  const organizePermissionsByMenu = () => {
    const menuMap = new Map<number, MenuNode>();
    allMenus.forEach((menu) => {
      menuMap.set(menu.id, menu);
    });

    const permissionMap = new Map<number, RoleMenuPermission>();
    rolePermissions.forEach((perm) => {
      permissionMap.set(perm.menu_id, perm);
    });

    return { menuMap, permissionMap };
  };

  const renderPermissionRow = (
    menu: MenuNode,
    permission: RoleMenuPermission | undefined,
    level: number = 0,
  ) => {
    if (!permission) return null;

    const indentClass = level > 0 ? `pl-${level * 8}` : '';

    return (
      <div key={menu.id} className="border-b border-stroke">
        <div className={`grid grid-cols-12 gap-4 py-3 px-4 ${indentClass}`}>
          {/* Menu Name */}
          <div className="col-span-4 flex items-center">
            <span className="font-medium text-sm">
              {level > 0 && '→ '.repeat(level)}
              {menu.name}
            </span>
            {menu.path && (
              <span className="ml-2 text-xs text-gray-500">({menu.path})</span>
            )}
          </div>

          {/* Can View */}
          <div className="col-span-2 flex items-center justify-center">
            <input
              type="checkbox"
              checked={permission.can_view}
              onChange={(e) =>
                handleUpdatePermission(permission.id, {
                  can_view: e.target.checked,
                })
              }
              className="w-4 h-4"
            />
          </div>

          {/* Can Create */}
          <div className="col-span-2 flex items-center justify-center">
            <input
              type="checkbox"
              checked={permission.can_create}
              onChange={(e) =>
                handleUpdatePermission(permission.id, {
                  can_create: e.target.checked,
                })
              }
              className="w-4 h-4"
              disabled={!permission.can_view}
            />
          </div>

          {/* Can Edit */}
          <div className="col-span-2 flex items-center justify-center">
            <input
              type="checkbox"
              checked={permission.can_edit}
              onChange={(e) =>
                handleUpdatePermission(permission.id, {
                  can_edit: e.target.checked,
                })
              }
              className="w-4 h-4"
              disabled={!permission.can_view}
            />
          </div>

          {/* Can Delete */}
          <div className="col-span-2 flex items-center justify-center">
            <input
              type="checkbox"
              checked={permission.can_delete}
              onChange={(e) =>
                handleUpdatePermission(permission.id, {
                  can_delete: e.target.checked,
                })
              }
              className="w-4 h-4"
              disabled={!permission.can_view}
            />
          </div>
        </div>

        {/* Render children recursively */}
        {menu.children &&
          menu.children.map((child) => {
            const childPermission = rolePermissions?.find(
              (p) => p.menu_id === child.id,
            );
            return renderPermissionRow(child, childPermission, level + 1);
          })}
      </div>
    );
  };

  return (
    <DefaultLayout>
      <>
        {isLoading && <Loading />}

        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px]">
          Master Data &gt; Role & Permissions
        </p>

        {/* Add Role Button */}
        <div className="flex w-full bg-white p-4 mb-4 justify-end">
          <button
            onClick={openModalTambah}
            className="px-6 py-2 text-sm font-semibold rounded-md text-white bg-primary hover:bg-primary/90"
          >
            Add New Role
          </button>
        </div>

        {/* Add Role Modal */}
        {showModalTambah && (
          <ModalKosonganSmall
            isOpen={showModalTambah}
            onClose={closeModalTambah}
            judul="Create New Role"
          >
            <div className="flex flex-col gap-4 py-4 px-4">
              <div>
                <label className="text-black text-sm font-bold mb-2 block">
                  Role Name *
                </label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                  className="w-full h-10 border-2 border-stroke rounded-md px-3"
                  placeholder="Enter role name"
                />
              </div>

              <div>
                <label className="text-black text-sm font-bold mb-2 block">
                  Description
                </label>
                <textarea
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                  className="w-full h-20 border-2 border-stroke rounded-md px-3 py-2"
                  placeholder="Enter role description"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={closeModalTambah}
                  className="px-6 py-2 text-sm font-semibold rounded-md border-2 border-stroke hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRole}
                  disabled={isLoading || !newRole.name.trim()}
                  className="px-6 py-2 text-sm font-semibold rounded-md text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  Create Role
                </button>
              </div>
            </div>
          </ModalKosonganSmall>
        )}

        {/* Header */}
        <div className="flex bg-white py-3 w-full mb-2 px-5 text-sm font-semibold rounded-md">
          <p className="w-20">No</p>
          <div className="grid grid-cols-12 w-full gap-4">
            <div className="col-span-3">Role Name</div>
            <div className="col-span-6">Description</div>
            <div className="col-span-3 text-center">Actions</div>
          </div>
        </div>

        {/* Roles List */}
        {roles.map((role, index) => (
          <div key={role.id}>
            <div className="flex bg-white py-3 w-full mb-2 px-5 text-sm rounded-md">
              <p className="w-20">{index + 1}</p>
              <div className="grid grid-cols-12 w-full gap-4">
                <div className="col-span-3 font-semibold">{role.name}</div>
                <div className="col-span-6 text-gray-600">
                  {role.description || '-'}
                </div>
                <div className="col-span-3 flex justify-center">
                  <button
                    onClick={() => openEdit(index, role)}
                    className="px-4 py-2 text-xs bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md"
                  >
                    Manage Permissions
                  </button>
                </div>
              </div>
            </div>

            {/* Permissions Modal */}
            {showEdit[index] && selectedRole?.id === role.id && (
              <ModalXL
                isOpen={showEdit[index]}
                onClose={() => closeEdit(index)}
                judul={`Permissions for: ${role.name}`}
              >
                <div className="bg-white">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-4 py-3 px-4 bg-gray-100 font-semibold text-sm border-b-2">
                    <div className="col-span-4">Menu / Feature</div>
                    <div className="col-span-2 text-center">View</div>
                    <div className="col-span-2 text-center">Create</div>
                    <div className="col-span-2 text-center">Edit</div>
                    <div className="col-span-2 text-center">Delete</div>
                  </div>

                  {/* Permissions List */}
                  <div className="max-h-[600px] overflow-y-auto">
                    {allMenus.map((menu) => {
                      const permission = rolePermissions?.find(
                        (p) => p.menu_id === menu.id,
                      );
                      return renderPermissionRow(menu, permission, 0);
                    })}
                  </div>

                  {rolePermissions.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-gray-500">
                      No permissions found for this role
                    </div>
                  )}
                </div>
              </ModalXL>
            )}
          </div>
        ))}

        {roles.length === 0 && !isLoading && (
          <div className="bg-white py-8 text-center text-gray-500 rounded-md">
            No roles found. Create your first role to get started.
          </div>
        )}
      </>
    </DefaultLayout>
  );
}

export default MasterHakAkses;
