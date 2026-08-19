// pages/Master/MasterHakAkses.tsx

import DefaultLayout from '../../layout/DefaultLayout';
import React, { useEffect, useMemo, useState } from 'react';
import Loading from '../../components/Loading';
import ModalKosonganSmall from '../../components/Modals/ModalKosonganSmall';
import { masterMenuApi } from './services/masterMenuApi';
import {
  Role,
  CreateRoleDto,
  UpdatePermissionDto,
  MenuWithPermissions,
} from './types/masterMenu.types';
import { IconComponent } from '../../constant/icons';
import ModalFullScreen from './ModalFullScreen';

type PermissionFlags = {
  is_active: boolean;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
};

/* ------------------------------------------------------------------ */
/* Pure helpers (kept outside the component so they never re-allocate  */
/* on every render, and so they're easy to unit test in isolation)     */
/* ------------------------------------------------------------------ */

// Immutably patch a single row's permissions anywhere in the tree by role_menu_id
function updateTreePermission(
  menus: MenuWithPermissions[],
  roleMenuId: number,
  updates: Partial<PermissionFlags>,
): MenuWithPermissions[] {
  return menus.map((menu) => {
    let updatedMenu = menu;

    if (menu.role_menu_id === roleMenuId && menu.permissions) {
      updatedMenu = {
        ...menu,
        permissions: { ...menu.permissions, ...updates },
      };
    }

    if (menu.children && menu.children.length > 0) {
      const newChildren = updateTreePermission(
        menu.children,
        roleMenuId,
        updates,
      );
      updatedMenu = { ...updatedMenu, children: newChildren };
    }

    return updatedMenu;
  });
}

// Apply the same flags to a menu node and every descendant that has a permission row
function applyBulkToSubtree(
  menu: MenuWithPermissions,
  updates: Partial<PermissionFlags>,
): MenuWithPermissions {
  return {
    ...menu,
    permissions: menu.permissions
      ? { ...menu.permissions, ...updates }
      : menu.permissions,
    children: menu.children
      ? menu.children.map((child) => applyBulkToSubtree(child, updates))
      : menu.children,
  };
}

function updateSubtreeBulk(
  menus: MenuWithPermissions[],
  targetId: number,
  updates: Partial<PermissionFlags>,
): MenuWithPermissions[] {
  return menus.map((menu) =>
    menu.id === targetId ? applyBulkToSubtree(menu, updates) : menu,
  );
}

// Collect every {role_menu_id, permissions} pair under (and including) a node
function collectPermissionEntries(
  menu: MenuWithPermissions,
): Array<{ roleMenuId: number; permission: PermissionFlags }> {
  let entries: Array<{ roleMenuId: number; permission: PermissionFlags }> = [];

  if (menu.permissions && menu.role_menu_id) {
    entries.push({
      roleMenuId: menu.role_menu_id,
      permission: menu.permissions,
    });
  }
  if (menu.children && menu.children.length > 0) {
    menu.children.forEach((child) => {
      entries = entries.concat(collectPermissionEntries(child));
    });
  }
  return entries;
}

// Keep a node if its own name matches, OR if any descendant matches.
// If the node itself matches, keep its full subtree (so context isn't lost).
function filterMenuTree(
  menus: MenuWithPermissions[],
  query: string,
): MenuWithPermissions[] {
  const q = query.trim().toLowerCase();
  if (!q) return menus;

  const filterNode = (
    menu: MenuWithPermissions,
  ): MenuWithPermissions | null => {
    const nameMatches = menu.name.toLowerCase().includes(q);
    if (nameMatches) return menu;

    if (!menu.children || menu.children.length === 0) return null;

    const filteredChildren = menu.children
      .map(filterNode)
      .filter((m): m is MenuWithPermissions => m !== null);

    if (filteredChildren.length === 0) return null;
    return { ...menu, children: filteredChildren };
  };

  return menus
    .map(filterNode)
    .filter((m): m is MenuWithPermissions => m !== null);
}

function countTotalMenus(menus: MenuWithPermissions[]): number {
  let count = menus.length;
  menus.forEach((menu) => {
    if (menu.children && menu.children.length > 0) {
      count += countTotalMenus(menu.children);
    }
  });
  return count;
}

function countActivePermissions(menus: MenuWithPermissions[]): number {
  let count = 0;
  menus.forEach((menu) => {
    if (menu.permissions && menu.permissions.can_view) count++;
    if (menu.children && menu.children.length > 0) {
      count += countActivePermissions(menu.children);
    }
  });
  return count;
}

function groupStats(menu: MenuWithPermissions): {
  enabled: number;
  total: number;
} {
  const entries = collectPermissionEntries(menu);
  const enabled = entries.filter(
    (e) => e.permission.is_active && e.permission.can_view,
  ).length;
  return { enabled, total: entries.length };
}

function isSubtreeFullyEnabled(menu: MenuWithPermissions): boolean {
  const entries = collectPermissionEntries(menu);
  if (entries.length === 0) return false;
  return entries.every(
    (e) =>
      e.permission.is_active &&
      e.permission.can_view &&
      e.permission.can_create &&
      e.permission.can_edit &&
      e.permission.can_delete,
  );
}

/* ------------------------------------------------------------------ */
/* Small presentational bits                                           */
/* ------------------------------------------------------------------ */

const ToggleSwitch: React.FC<{
  checked: boolean;
  disabled?: boolean;
  color: 'purple' | 'blue' | 'green' | 'yellow' | 'red';
  onChange: (checked: boolean) => void;
  label: string;
}> = ({ checked, disabled, color, onChange, label }) => {
  const ring: Record<string, string> = {
    purple: 'peer-focus:ring-purple-300 peer-checked:bg-purple-600',
    blue: 'peer-focus:ring-blue-300 peer-checked:bg-blue-600',
    green: 'peer-focus:ring-green-300 peer-checked:bg-green-600',
    yellow: 'peer-focus:ring-yellow-300 peer-checked:bg-yellow-500',
    red: 'peer-focus:ring-red-300 peer-checked:bg-red-600',
  };

  return (
    <label
      className="relative inline-flex items-center cursor-pointer"
      title={label}
      aria-label={label}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div
        className={`w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all after:shadow-sm peer-disabled:opacity-40 peer-disabled:cursor-not-allowed transition-colors ${ring[color]}`}
      ></div>
    </label>
  );
};

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

function MasterHakAkses() {
  const [isLoading, setIsLoading] = useState(false);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [menusWithPermissions, setMenusWithPermissions] = useState<
    MenuWithPermissions[]
  >([]);

  const [newRole, setNewRole] = useState<CreateRoleDto>({
    name: '',
    description: '',
  });

  const [showModalTambah, setShowModalTambah] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [updatingPermissions, setUpdatingPermissions] = useState<Set<number>>(
    new Set(),
  );
  const [bulkUpdatingGroups, setBulkUpdatingGroups] = useState<Set<number>>(
    new Set(),
  );
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState('');

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

  // `silent` = true skips the loading state so the grid never unmounts
  // (this is what previously caused scroll position to reset on every toggle)
  const loadRolePermissions = async (
    roleId: number,
    opts: { silent?: boolean } = {},
  ) => {
    try {
      if (!opts.silent) setPermissionsLoading(true);
      const response = await masterMenuApi.getRoleMenuByRoleId(roleId);

      if (response.menus) {
        setMenusWithPermissions(response.menus);
      }
      if (response.role) {
        setSelectedRole(response.role);
      }
    } catch (error) {
      console.error('Error loading role permissions:', error);
      alert('Failed to load permissions');
      if (!opts.silent) setMenusWithPermissions([]);
    } finally {
      if (!opts.silent) setPermissionsLoading(false);
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

  // Optimistic single-cell update: apply the change to local state immediately,
  // fire the API call in the background, and only reload (silently) on failure.
  const handleUpdatePermission = async (
    roleMenuId: number,
    updates: Partial<UpdatePermissionDto>,
    currentPermissions: MenuWithPermissions['permissions'],
  ) => {
    if (!currentPermissions) return;

    const updateData: UpdatePermissionDto = {
      can_view: updates.can_view ?? currentPermissions.can_view,
      can_create: updates.can_create ?? currentPermissions.can_create,
      can_edit: updates.can_edit ?? currentPermissions.can_edit,
      can_delete: updates.can_delete ?? currentPermissions.can_delete,
      is_active: updates.is_active ?? currentPermissions.is_active,
    };

    // 1. Optimistic UI update — instant feedback, no remount, no scroll jump
    setMenusWithPermissions((prev) =>
      updateTreePermission(prev, roleMenuId, updateData),
    );
    setUpdatingPermissions((prev) => new Set(prev).add(roleMenuId));

    try {
      // 2. Persist in the background
      await masterMenuApi.updatePermission(roleMenuId, updateData);
    } catch (error) {
      console.error('Error updating permission:', error);
      alert('Failed to update permission. Reverting.');
      // 3. Roll back by re-syncing from the server (silently, no spinner)
      if (selectedRole)
        await loadRolePermissions(selectedRole.id, { silent: true });
    } finally {
      setUpdatingPermissions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(roleMenuId);
        return newSet;
      });
    }
  };

  // Enable/disable every permission under one route menu in a single click
  const handleCheckAllRoute = async (menu: MenuWithPermissions) => {
    const entries = collectPermissionEntries(menu);
    if (entries.length === 0) return;

    const fullyEnabled = isSubtreeFullyEnabled(menu);
    const targetValue = !fullyEnabled;
    const updates: PermissionFlags = {
      is_active: targetValue,
      can_view: targetValue,
      can_create: targetValue,
      can_edit: targetValue,
      can_delete: targetValue,
    };

    setMenusWithPermissions((prev) =>
      updateSubtreeBulk(prev, menu.id, updates),
    );
    setBulkUpdatingGroups((prev) => new Set(prev).add(menu.id));

    try {
      await Promise.all(
        entries.map((e) =>
          masterMenuApi.updatePermission(e.roleMenuId, updates),
        ),
      );
    } catch (error) {
      console.error('Error bulk-updating permissions:', error);
      alert('Some permissions failed to update. Refreshing this role.');
      if (selectedRole)
        await loadRolePermissions(selectedRole.id, { silent: true });
    } finally {
      setBulkUpdatingGroups((prev) => {
        const newSet = new Set(prev);
        newSet.delete(menu.id);
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
    setSearchQuery('');
    setCollapsedGroups(new Set());
    await loadRolePermissions(role.id);
  };

  const closePermissionModal = () => {
    setShowPermissionModal(false);
    setSelectedRole(null);
    setMenusWithPermissions([]);
    setSearchQuery('');
  };

  const toggleGroupCollapsed = (menuId: number) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  };

  const filteredMenus = useMemo(
    () => filterMenuTree(menusWithPermissions, searchQuery),
    [menusWithPermissions, searchQuery],
  );

  const isSearching = searchQuery.trim().length > 0;

  const renderPermissionRow = (
    menu: MenuWithPermissions,
    level: number,
  ): React.ReactNode => {
    const permission = menu.permissions;
    const roleMenuId = menu.role_menu_id;
    const isUpdating = roleMenuId ? updatingPermissions.has(roleMenuId) : false;

    return (
      <div
        key={menu.id}
        className={`grid grid-cols-[1.6fr_repeat(5,0.55fr)] items-center gap-1 py-2 px-3 border-b border-gray-100 hover:bg-gray-50 transition-colors text-xs ${
          isUpdating ? 'opacity-50' : ''
        } ${!permission ? 'bg-red-50/60' : ''}`}
      >
        <div
          className="flex items-center gap-1.5 min-w-0"
          style={{ paddingLeft: `${level * 14}px` }}
        >
          {level > 0 && (
            <span className="text-gray-300 text-[11px] shrink-0">{'└'}</span>
          )}
          {menu.icon && <IconComponent name={menu.icon} size={13} />}
          <span
            className="font-medium text-[11.5px] text-gray-900 truncate"
            title={menu.name}
          >
            {menu.name}
          </span>
          <span
            className={`shrink-0 px-1.5 py-0.5 text-[9px] font-semibold rounded ${
              menu.level === 1
                ? 'bg-blue-100 text-blue-700'
                : menu.level === 2
                ? 'bg-green-100 text-green-700'
                : 'bg-purple-100 text-purple-700'
            }`}
          >
            L{menu.level}
          </span>
        </div>

        {permission && roleMenuId ? (
          <>
            <div className="flex items-center justify-center">
              <ToggleSwitch
                checked={permission.is_active}
                disabled={isUpdating}
                color="purple"
                label="Active"
                onChange={(checked) =>
                  handleUpdatePermission(
                    roleMenuId,
                    {
                      is_active: checked,
                      can_view: checked ? permission.can_view : false,
                    },
                    permission,
                  )
                }
              />
            </div>
            <div className="flex items-center justify-center">
              <ToggleSwitch
                checked={permission.can_view}
                disabled={isUpdating}
                color="blue"
                label="View"
                onChange={(checked) =>
                  handleUpdatePermission(
                    roleMenuId,
                    { can_view: checked, is_active: checked },
                    permission,
                  )
                }
              />
            </div>
            <div className="flex items-center justify-center">
              <ToggleSwitch
                checked={permission.can_create}
                disabled={
                  !permission.is_active || !permission.can_view || isUpdating
                }
                color="green"
                label="Create"
                onChange={(checked) =>
                  handleUpdatePermission(
                    roleMenuId,
                    { can_create: checked },
                    permission,
                  )
                }
              />
            </div>
            <div className="flex items-center justify-center">
              <ToggleSwitch
                checked={permission.can_edit}
                disabled={
                  !permission.is_active || !permission.can_view || isUpdating
                }
                color="yellow"
                label="Edit"
                onChange={(checked) =>
                  handleUpdatePermission(
                    roleMenuId,
                    { can_edit: checked },
                    permission,
                  )
                }
              />
            </div>
            <div className="flex items-center justify-center">
              <ToggleSwitch
                checked={permission.can_delete}
                disabled={
                  !permission.is_active || !permission.can_view || isUpdating
                }
                color="red"
                label="Delete"
                onChange={(checked) =>
                  handleUpdatePermission(
                    roleMenuId,
                    { can_delete: checked },
                    permission,
                  )
                }
              />
            </div>
          </>
        ) : (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              <span className="text-[10px] text-gray-300">—</span>
            </div>
          ))
        )}
      </div>
    );
  };

  // While searching, ignore the "hide children when parent is inactive" gating
  // so matched rows are never hidden from the person looking for them.
  const renderMenuNode = (
    menu: MenuWithPermissions,
    level = 0,
  ): React.ReactNode => {
    const shouldShowChildren =
      isSearching ||
      (menu.permissions
        ? menu.permissions.is_active && menu.permissions.can_view
        : true);

    return (
      <React.Fragment key={menu.id}>
        {renderPermissionRow(menu, level)}
        {shouldShowChildren &&
          menu.children &&
          menu.children.map((child) => renderMenuNode(child, level + 1))}
      </React.Fragment>
    );
  };

  const columnHeader = (
    <div className="grid grid-cols-[1.6fr_repeat(5,0.55fr)] gap-1 py-2 px-3 bg-gray-50 font-semibold text-[9.5px] uppercase tracking-wide text-gray-500 border-b border-gray-200 sticky top-0 z-10">
      <div>Menu</div>
      <div className="text-center" title="Active">
        Active
      </div>
      <div className="text-center" title="View">
        View
      </div>
      <div className="text-center" title="Create">
        Create
      </div>
      <div className="text-center" title="Edit">
        Edit
      </div>
      <div className="text-center" title="Delete">
        Delete
      </div>
    </div>
  );

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
          <ModalFullScreen
            isOpen={showPermissionModal}
            onClose={closePermissionModal}
            title={`Permission Management: ${selectedRole.name}`}
          >
            <div className="h-full flex flex-col">
              {/* Toolbar: search + legend */}
              <div className="px-4 pt-3 pb-3 flex flex-col sm:flex-row sm:items-center gap-3 border-b border-gray-200">
                <div className="relative flex-1 max-w-md">
                  <svg
                    className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search menu name..."
                    className="w-full h-10 pl-9 pr-9 border-2 border-gray-200 rounded-lg text-sm focus:border-primary focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Clear search"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Active
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    View
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Create
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Edit
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Delete
                  </span>
                </div>

                {menusWithPermissions.length > 0 && (
                  <div className="sm:ml-auto text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">
                      {countActivePermissions(menusWithPermissions)}
                    </span>{' '}
                    / {countTotalMenus(menusWithPermissions)} menus with view
                    access
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
                {permissionsLoading ? (
                  <div className="flex items-center justify-center h-full min-h-[300px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : filteredMenus.length > 0 ? (
                  <div
                    className="grid gap-4"
                    style={{
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(360px, 1fr))',
                    }}
                  >
                    {filteredMenus.map((menu) => {
                      const collapsed = collapsedGroups.has(menu.id);
                      const stats = groupStats(menu);
                      const fullyEnabled = isSubtreeFullyEnabled(menu);
                      const bulkBusy = bulkUpdatingGroups.has(menu.id);

                      return (
                        <div
                          key={menu.id}
                          className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden flex flex-col shadow-sm"
                        >
                          {/* Group header */}
                          <div className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <button
                              onClick={() => toggleGroupCollapsed(menu.id)}
                              className="text-gray-400 hover:text-gray-600 shrink-0"
                              aria-label={collapsed ? 'Expand' : 'Collapse'}
                            >
                              <svg
                                className={`w-4 h-4 transition-transform ${
                                  collapsed ? '-rotate-90' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>

                            {menu.icon && (
                              <IconComponent name={menu.icon} size={16} />
                            )}
                            <span
                              className="font-semibold text-sm text-gray-900 truncate flex-1"
                              title={menu.name}
                            >
                              {menu.name}
                            </span>

                            <span className="text-[10px] font-medium text-gray-500 shrink-0">
                              {stats.enabled}/{stats.total} on
                            </span>

                            <button
                              onClick={() => handleCheckAllRoute(menu)}
                              disabled={bulkBusy || stats.total === 0}
                              className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                fullyEnabled
                                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                  : 'bg-primary/10 text-primary hover:bg-primary/20'
                              }`}
                            >
                              {bulkBusy
                                ? '...'
                                : fullyEnabled
                                ? 'Disable All'
                                : 'Enable All'}
                            </button>
                          </div>

                          {/* Group body */}
                          {!collapsed && (
                            <div className="flex flex-col">
                              {columnHeader}
                              <div className="max-h-[420px] overflow-y-auto">
                                {/*
                                  FIX: render the parent menu's own permission row
                                  too (level 0), not just its children. Previously
                                  this branched on menu.children.length and, when
                                  children existed, skipped straight to mapping
                                  over menu.children — so a parent like
                                  "Delivery Order" that has its own is_active /
                                  can_view permissions never showed a row for
                                  itself inside the group card, even though the
                                  flat/legacy view (and the underlying data) had
                                  it. renderMenuNode already renders the node's
                                  own row and then recurses into children with
                                  the correct show/hide-children gating, so
                                  calling it directly on `menu` covers both
                                  cases (leaf menus and menus with children)
                                  correctly and consistently.
                                */}
                                {renderMenuNode(menu, 0)}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : isSearching ? (
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
                          d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-1">
                      No menus match "{searchQuery}"
                    </p>
                    <p className="text-sm text-gray-500">
                      Try a different search term
                    </p>
                  </div>
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
              <div className="border-t-2 border-gray-200 p-3 bg-gray-50 flex justify-between items-center">
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Note:</span> Turning on "View"
                  also turns on "Active". Turning off "Active" hides children.
                  Changes save automatically.
                </div>
                <button
                  onClick={closePermissionModal}
                  className="px-5 py-2 text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </ModalFullScreen>
        )}
      </>
    </DefaultLayout>
  );
}
export default MasterHakAkses;
