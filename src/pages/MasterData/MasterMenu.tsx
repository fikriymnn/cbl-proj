// pages/Master/MasterMenu.tsx

import DefaultLayout from '../../layout/DefaultLayout';
import React, { useEffect, useMemo, useState } from 'react';
import Loading from '../../components/Loading';
import ModalKosonganSmall from '../../components/Modals/ModalKosonganSmall';
import { masterMenuApi } from './services/masterMenuApi';
import {
  MenuNode,
  CreateMenuDto,
  UpdateMenuDto,
} from './types/masterMenu.types';
import { IconComponent } from '../../constant/icons';

// Get all available icons from your icons file
const getAvailableIcons = () => {
  return [
    'dashboard',
    'settings',
    'maintenance',
    'sparepart',
    'stock',
    'monitoring',
    'machine',
    'project',
    'recap',
    'preventive',
    'kpi',
    'preparation',
    'report',
    'ncr',
    'capa',
    'outstanding',
    'attendance',
    'quality',
    'validation',
    'inspection',
    'qms',
    'defect',
    'document',
    'users',
    'role',
    'analysis',
    'grade',
    'access',
    'hr',
    'personnel',
    'company',
    'employee',
    'calendar',
    'payroll',
    'submission',
    'response',
    'shift',
    'warning',
    'department',
    'leave',
    'ppic',
    'schedule',
    'production',
    'breakdown',
    'waste',
    'history',
    'form',
    'input',
    'service',
    'lifetime',
    'opname',
    'submit',
    'adjustment',
    'outsourcing',
    'approval',
    'position',
  ];
};

/* ------------------------------------------------------------------ */
/* Pure helpers                                                        */
/* ------------------------------------------------------------------ */

// Keep a node if its own name/path/icon matches, or any descendant matches.
// If the node itself matches, keep its full subtree so context isn't lost.
function filterMenuTree(menus: MenuNode[], query: string): MenuNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return menus;

  const nodeMatches = (menu: MenuNode) =>
    menu.name.toLowerCase().includes(q) ||
    (menu.path ? menu.path.toLowerCase().includes(q) : false) ||
    (menu.icon ? menu.icon.toLowerCase().includes(q) : false);

  const filterNode = (menu: MenuNode): MenuNode | null => {
    if (nodeMatches(menu)) return menu;

    if (!menu.children || menu.children.length === 0) return null;

    const filteredChildren = menu.children
      .map(filterNode)
      .filter((m): m is MenuNode => m !== null);

    if (filteredChildren.length === 0) return null;
    return { ...menu, children: filteredChildren };
  };

  return menus.map(filterNode).filter((m): m is MenuNode => m !== null);
}

function countSubtree(menu: MenuNode): number {
  let count = 1;
  if (menu.children) {
    menu.children.forEach((child) => {
      count += countSubtree(child);
    });
  }
  return count;
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

function MasterMenu() {
  const [isLoading, setIsLoading] = useState(false);
  const [menus, setMenus] = useState<MenuNode[]>([]);
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [showModalEdit, setShowModalEdit] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuNode | null>(null);
  const [newMenu, setNewMenu] = useState<CreateMenuDto>({
    name: '',
    icon: '',
    path: null,
    parent_id: null,
    order_index: 1,
    level: 1,
  });
  const [editMenu, setEditMenu] = useState<UpdateMenuDto>({
    name: '',
    icon: '',
    path: null,
    parent_id: null,
    order_index: 1,
    level: 1,
  });
  const [selectedParent, setSelectedParent] = useState<MenuNode | null>(null);
  const [selectedEditParent, setSelectedEditParent] = useState<MenuNode | null>(
    null,
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedModules, setCollapsedModules] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    try {
      setIsLoading(true);
      const data = await masterMenuApi.getAllMenus();
      setMenus(data);
    } catch (error) {
      console.error('Error loading menus:', error);
      alert('Failed to load menus');
    } finally {
      setIsLoading(false);
    }
  };

  // Get all menus for parent selection (flatten tree) - only level 1 and 2
  const getAllMenusFlat = (
    menus: MenuNode[],
    result: MenuNode[] = [],
  ): MenuNode[] => {
    menus.forEach((menu) => {
      result.push(menu);
      if (menu.children && menu.level < 2) {
        // Only include children if parent is level 1 or 2
        getAllMenusFlat(menu.children, result);
      }
    });
    return result;
  };

  const flatMenus = getAllMenusFlat(menus).filter((m) => m.level <= 2); // Only level 1 and 2 can be parents

  // Build full path from root to a menu
  const getFullPath = (menuId: number, menus: MenuNode[]): string => {
    const findMenuPath = (
      nodes: MenuNode[],
      targetId: number,
      currentPath: string = '',
    ): string | null => {
      for (const node of nodes) {
        const nodePath = currentPath
          ? `${currentPath}/${node.name
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '')}`
          : `/${node.name
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '')}`;

        if (node.id === targetId) {
          return nodePath;
        }

        if (node.children) {
          const found = findMenuPath(node.children, targetId, nodePath);
          if (found) return found;
        }
      }
      return null;
    };

    return findMenuPath(menus, menuId) || '';
  };

  // Get next order index for siblings
  const getNextOrderIndex = (parentId: number | null): number => {
    let siblings: MenuNode[] = [];

    if (parentId === null) {
      siblings = menus;
    } else {
      const findChildren = (nodes: MenuNode[]): MenuNode[] => {
        for (const node of nodes) {
          if (node.id === parentId) {
            return node.children || [];
          }
          if (node.children) {
            const found = findChildren(node.children);
            if (found.length > 0) return found;
          }
        }
        return [];
      };
      siblings = findChildren(menus);
    }

    if (siblings.length === 0) return 1;
    const maxOrder = Math.max(...siblings.map((s) => s.order_index));
    return maxOrder + 1;
  };

  // Build automatic path based on parent's full path and menu name
  const buildAutoPath = (parentId: number | null, menuName: string): string => {
    const pathSegment = menuName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    if (!parentId) {
      return `/${pathSegment}`;
    }

    const parentFullPath = getFullPath(parentId, menus);
    return `${parentFullPath}/${pathSegment}`;
  };

  // Handle parent selection for create
  const handleParentChange = (parentId: string) => {
    if (!parentId) {
      setSelectedParent(null);
      setNewMenu({
        ...newMenu,
        parent_id: null,
        level: 1,
        order_index: getNextOrderIndex(null),
        path: newMenu.name ? buildAutoPath(null, newMenu.name) : null,
      });
    } else {
      const parent = flatMenus.find((m) => m.id === Number(parentId));
      setSelectedParent(parent || null);
      setNewMenu({
        ...newMenu,
        parent_id: Number(parentId),
        level: parent ? parent.level + 1 : 1,
        order_index: getNextOrderIndex(Number(parentId)),
        path: newMenu.name
          ? buildAutoPath(Number(parentId), newMenu.name)
          : null,
      });
    }
  };

  // Handle parent selection for edit
  const handleEditParentChange = (parentId: string) => {
    if (!parentId) {
      setSelectedEditParent(null);
      setEditMenu({
        ...editMenu,
        parent_id: null,
        level: 1,
        order_index: getNextOrderIndex(null),
        path: editMenu.name ? buildAutoPath(null, editMenu.name) : null,
      });
    } else {
      const parent = flatMenus.find((m) => m.id === Number(parentId));
      setSelectedEditParent(parent || null);
      setEditMenu({
        ...editMenu,
        parent_id: Number(parentId),
        level: parent ? parent.level + 1 : 1,
        order_index: getNextOrderIndex(Number(parentId)),
        path: editMenu.name
          ? buildAutoPath(Number(parentId), editMenu.name)
          : null,
      });
    }
  };

  // Handle menu name change for create
  const handleNameChange = (name: string) => {
    const autoPath = newMenu.parent_id
      ? buildAutoPath(newMenu.parent_id, name)
      : buildAutoPath(null, name);

    setNewMenu({
      ...newMenu,
      name,
      path: name ? autoPath : null,
    });
  };

  // Handle menu name change for edit
  const handleEditNameChange = (name: string) => {
    const autoPath = editMenu.parent_id
      ? buildAutoPath(editMenu.parent_id, name)
      : buildAutoPath(null, name);

    setEditMenu({
      ...editMenu,
      name,
      path: name ? autoPath : null,
    });
  };

  const handleCreateMenu = async () => {
    if (!newMenu.name.trim()) {
      alert('Menu name is required');
      return;
    }

    if (!newMenu.icon) {
      alert('Please select an icon');
      return;
    }

    try {
      setIsLoading(true);
      await masterMenuApi.createMenu(newMenu);
      resetForm();
      setShowModalCreate(false);
      await loadMenus();
      alert('Menu created successfully');
    } catch (error) {
      console.error('Error creating menu:', error);
      alert('Failed to create menu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMenuClick = (menu: MenuNode) => {
    setEditingMenu(menu);

    // Find parent if exists
    const parent = menu.parent_id
      ? flatMenus.find((m) => m.id === menu.parent_id)
      : null;

    setSelectedEditParent(parent || null);

    setEditMenu({
      name: menu.name,
      icon: menu.icon,
      path: menu.path,
      parent_id: menu.parent_id,
      order_index: menu.order_index,
      level: menu.level,
    });

    setShowModalEdit(true);
  };

  const handleUpdateMenu = async () => {
    if (!editingMenu) return;

    if (!editMenu.name.trim()) {
      alert('Menu name is required');
      return;
    }

    if (!editMenu.icon) {
      alert('Please select an icon');
      return;
    }

    try {
      setIsLoading(true);
      await masterMenuApi.updateMenu(editingMenu.id, editMenu);
      resetEditForm();
      setShowModalEdit(false);
      await loadMenus();
      alert('Menu updated successfully');
    } catch (error) {
      console.error('Error updating menu:', error);
      alert('Failed to update menu');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewMenu({
      name: '',
      icon: '',
      path: null,
      parent_id: null,
      order_index: 1,
      level: 1,
    });
    setSelectedParent(null);
  };

  const resetEditForm = () => {
    setEditMenu({
      name: '',
      icon: '',
      path: null,
      parent_id: null,
      order_index: 1,
      level: 1,
    });
    setSelectedEditParent(null);
    setEditingMenu(null);
  };

  const handleDeleteMenu = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      setIsLoading(true);
      await masterMenuApi.deleteMenu(id);
      await loadMenus();
      alert('Menu deleted successfully');
    } catch (error) {
      console.error('Error deleting menu:', error);
      alert('Failed to delete menu. It may have child menus.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModuleCollapsed = (menuId: number) => {
    setCollapsedModules((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) next.delete(menuId);
      else next.add(menuId);
      return next;
    });
  };

  const filteredMenus = useMemo(
    () => filterMenuTree(menus, searchQuery),
    [menus, searchQuery],
  );
  const isSearching = searchQuery.trim().length > 0;

  const renderMenuTree = (menu: MenuNode, level: number = 0) => {
    return (
      <React.Fragment key={menu.id}>
        <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
          <td className="py-3 px-4">
            <div className="flex items-center gap-2">
              <span
                style={{ marginLeft: `${level * 24}px` }}
                className="flex items-center gap-2"
              >
                {level > 0 && (
                  <span className="text-gray-400">{'└─ '.repeat(1)}</span>
                )}
                <IconComponent name={menu.icon} size={16} />
                <span className="font-medium text-sm text-gray-900">
                  {menu.name}
                </span>
              </span>
            </div>
          </td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-2 text-gray-600">
              <IconComponent name={menu.icon} size={14} />
              <span className="text-xs">{menu.icon}</span>
            </div>
          </td>
          <td className="py-3 px-4">
            {menu.path ? (
              <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                {menu.path}
              </code>
            ) : (
              <span className="text-xs text-gray-400 italic">
                No path (parent menu)
              </span>
            )}
          </td>
          <td className="py-3 px-4 text-center">
            <span
              className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
                menu.level === 1
                  ? 'bg-blue-100 text-blue-700'
                  : menu.level === 2
                  ? 'bg-green-100 text-green-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              {menu.level}
            </span>
          </td>
          <td className="py-3 px-4 text-center">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
              {menu.order_index}
            </span>
          </td>
          <td className="py-3 px-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handleEditMenuClick(menu)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
              <button
                onClick={() => handleDeleteMenu(menu.id, menu.name)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </button>
            </div>
          </td>
        </tr>

        {menu.children &&
          menu.children.map((child) => renderMenuTree(child, level + 1))}
      </React.Fragment>
    );
  };

  const availableIcons = getAvailableIcons();

  // Get parent full path for display
  const getParentDisplayPath = (parent: MenuNode | null) => {
    if (!parent) return null;
    return getFullPath(parent.id, menus);
  };

  return (
    <DefaultLayout>
      <>
        {isLoading && <Loading />}

        <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-6">
          Master Data &gt; Menu Management
        </p>

        {/* Stats and Add Button */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Menus</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getAllMenusFlat(menus).length}
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
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">Modules (Top Level)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {menus.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 flex items-center justify-center">
            <button
              onClick={() => {
                resetForm();
                setShowModalCreate(true);
              }}
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
              Add New Menu
            </button>
          </div>
        </div>

        {/* Create Menu Modal */}
        {showModalCreate && (
          <ModalKosonganSmall
            isOpen={showModalCreate}
            onClose={() => {
              setShowModalCreate(false);
              resetForm();
            }}
            judul="Create New Menu"
          >
            <div className="flex flex-col gap-5 py-4 px-4 overflow-y-auto max-h-[70vh]">
              {/* Menu Name */}
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-2 block">
                  Menu Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMenu.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full h-11 border-2 border-gray-300 rounded-lg px-4 focus:border-primary focus:outline-none transition-colors"
                  placeholder="e.g., Preventive Maintenance"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Path will be generated automatically based on this name
                </p>
              </div>

              {/* Parent Menu */}
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-2 block">
                  Parent Menu
                </label>
                <select
                  value={newMenu.parent_id || ''}
                  onChange={(e) => handleParentChange(e.target.value)}
                  className="w-full h-11 border-2 border-gray-300 rounded-lg px-4 focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="">None (Top Level Menu)</option>
                  {flatMenus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {'  '.repeat(menu.level - 1)}
                      {menu.name} (Level {menu.level})
                    </option>
                  ))}
                </select>
                {selectedParent && (
                  <p className="text-xs text-blue-600 mt-1.5 font-medium">
                    Parent path:{' '}
                    <code className="bg-blue-50 px-2 py-0.5 rounded">
                      {getParentDisplayPath(selectedParent)}
                    </code>
                  </p>
                )}
              </div>

              {/* Icon Selection with Preview */}
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-2 block">
                  Icon <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={newMenu.icon}
                    onChange={(e) =>
                      setNewMenu({ ...newMenu, icon: e.target.value })
                    }
                    className="w-full h-11 border-2 border-gray-300 rounded-lg px-4 focus:border-primary focus:outline-none transition-colors appearance-none"
                  >
                    <option value="">Select an icon</option>
                    {availableIcons.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
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
                  </div>
                </div>
                {newMenu.icon && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <IconComponent name={newMenu.icon} size={20} />
                    <span>Selected: {newMenu.icon}</span>
                  </div>
                )}
              </div>

              {/* Auto-generated Path Display */}
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-2 block">
                  Path
                </label>
                <input
                  type="text"
                  value={newMenu.path || ''}
                  onChange={(e) =>
                    setNewMenu({ ...newMenu, path: e.target.value || null })
                  }
                  className="w-full h-11 border-2 border-gray-300 rounded-lg px-4 focus:border-primary focus:outline-none transition-colors font-mono text-sm"
                  placeholder="Enter menu name to auto-generate, or type your own path"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Auto-filled from the menu name — edit it directly if you need
                  a custom path
                </p>
              </div>

              {/* Level and Order Display */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 text-sm font-semibold mb-2 block">
                    Level (Auto)
                  </label>
                  <div className="w-full h-11 border-2 border-gray-300 rounded-lg px-4 bg-gray-50 flex items-center justify-center">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                        newMenu.level === 1
                          ? 'bg-blue-100 text-blue-700'
                          : newMenu.level === 2
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {newMenu.level}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-gray-700 text-sm font-semibold mb-2 block">
                    Order (Auto)
                  </label>
                  <div className="w-full h-11 border-2 border-gray-300 rounded-lg px-4 bg-gray-50 flex items-center justify-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
                      {newMenu.order_index}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary Box */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-blue-900 mb-3 flex items-center gap-2">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-blue-600 font-medium min-w-20">
                      Name:
                    </span>
                    <span className="text-blue-900">
                      {newMenu.name || (
                        <span className="italic text-blue-400">(not set)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-blue-600 font-medium min-w-20">
                      Parent:
                    </span>
                    <span className="text-blue-900">
                      {selectedParent?.name || 'None (Top Level)'}
                    </span>
                  </div>
                  {selectedParent && (
                    <div className="flex items-start gap-2 text-xs">
                      <span className="text-blue-600 font-medium min-w-20">
                        Parent Path:
                      </span>
                      <code className="text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded text-xs">
                        {getParentDisplayPath(selectedParent)}
                      </code>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-blue-600 font-medium min-w-20">
                      Icon:
                    </span>
                    <span className="text-blue-900 flex items-center gap-1">
                      {newMenu.icon ? (
                        <>
                          <IconComponent name={newMenu.icon} size={14} />
                          {newMenu.icon}
                        </>
                      ) : (
                        <span className="italic text-blue-400">
                          (not selected)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-blue-600 font-medium min-w-20">
                      Path:
                    </span>
                    <code className="text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded text-xs">
                      {newMenu.path || (
                        <span className="italic text-blue-400">
                          (not generated)
                        </span>
                      )}
                    </code>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-blue-600 font-medium min-w-20">
                      Level:
                    </span>
                    <span className="text-blue-900 font-semibold">
                      {newMenu.level}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-blue-600 font-medium min-w-20">
                      Order:
                    </span>
                    <span className="text-blue-900 font-semibold">
                      {newMenu.order_index}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t-2 border-gray-200">
                <button
                  onClick={() => {
                    setShowModalCreate(false);
                    resetForm();
                  }}
                  className="px-6 py-2.5 text-sm font-semibold rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateMenu}
                  disabled={isLoading || !newMenu.name.trim() || !newMenu.icon}
                  className="px-6 py-2.5 text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create Menu'
                  )}
                </button>
              </div>
            </div>
          </ModalKosonganSmall>
        )}

        {/* Edit Menu Modal */}
        {showModalEdit && editingMenu && (
          <ModalKosonganSmall
            isOpen={showModalEdit}
            onClose={() => {
              setShowModalEdit(false);
              resetEditForm();
            }}
            judul={`Edit Menu: ${editingMenu.name}`}
          >
            <div className="flex flex-col gap-5 py-4 px-4 overflow-y-auto max-h-[70vh]">
              {/* Menu Name */}
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-2 block">
                  Menu Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editMenu.name}
                  onChange={(e) => handleEditNameChange(e.target.value)}
                  className="w-full h-11 border-2 border-gray-300 rounded-lg px-4 focus:border-primary focus:outline-none transition-colors"
                  placeholder="e.g., Preventive Maintenance"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Path will be regenerated automatically based on this name
                </p>
              </div>

              {/* Parent Menu */}
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-2 block">
                  Parent Menu
                </label>
                <select
                  value={editMenu.parent_id || ''}
                  onChange={(e) => handleEditParentChange(e.target.value)}
                  className="w-full h-11 border-2 border-gray-300 rounded-lg px-4 focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="">None (Top Level Menu)</option>
                  {flatMenus
                    .filter((m) => m.id !== editingMenu.id)
                    .map((menu) => (
                      <option key={menu.id} value={menu.id}>
                        {'  '.repeat(menu.level - 1)}
                        {menu.name} (Level {menu.level})
                      </option>
                    ))}
                </select>
                {selectedEditParent && (
                  <p className="text-xs text-blue-600 mt-1.5 font-medium">
                    Parent path:{' '}
                    <code className="bg-blue-50 px-2 py-0.5 rounded">
                      {getParentDisplayPath(selectedEditParent)}
                    </code>
                  </p>
                )}
              </div>

              {/* Icon Selection with Preview */}
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-2 block">
                  Icon <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={editMenu.icon}
                    onChange={(e) =>
                      setEditMenu({ ...editMenu, icon: e.target.value })
                    }
                    className="w-full h-11 border-2 border-gray-300 rounded-lg px-4 focus:border-primary focus:outline-none transition-colors appearance-none"
                  >
                    <option value="">Select an icon</option>
                    {availableIcons.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
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
                  </div>
                </div>
                {editMenu.icon && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <IconComponent name={editMenu.icon} size={20} />
                    <span>Selected: {editMenu.icon}</span>
                  </div>
                )}
              </div>
              {/* Auto-generated Path Display */}
              <div>
                <label className="text-gray-700 text-sm font-semibold mb-2 block">
                  Path
                </label>
                <input
                  type="text"
                  value={editMenu.path || ''}
                  onChange={(e) =>
                    setEditMenu({ ...editMenu, path: e.target.value || null })
                  }
                  className="w-full h-11 border-2 border-gray-300 rounded-lg px-4 focus:border-primary focus:outline-none transition-colors font-mono text-sm"
                  placeholder="Enter menu name to auto-generate, or type your own path"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Auto-filled from the menu name — edit it directly if you need
                  a custom path
                </p>
              </div>

              {/* Level and Order Display */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-700 text-sm font-semibold mb-2 block">
                    Level (Auto)
                  </label>
                  <div className="w-full h-11 border-2 border-gray-300 rounded-lg px-4 bg-gray-50 flex items-center justify-center">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                        editMenu.level === 1
                          ? 'bg-blue-100 text-blue-700'
                          : editMenu.level === 2
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {editMenu.level}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-gray-700 text-sm font-semibold mb-2 block">
                    Order (Auto)
                  </label>
                  <div className="w-full h-11 border-2 border-gray-300 rounded-lg px-4 bg-gray-50 flex items-center justify-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold">
                      {editMenu.order_index}
                    </span>
                  </div>
                </div>
              </div>

              {/* Summary Box */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-green-900 mb-3 flex items-center gap-2">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Updated Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-green-600 font-medium min-w-20">
                      Name:
                    </span>
                    <span className="text-green-900">
                      {editMenu.name || (
                        <span className="italic text-green-400">(not set)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-green-600 font-medium min-w-20">
                      Parent:
                    </span>
                    <span className="text-green-900">
                      {selectedEditParent?.name || 'None (Top Level)'}
                    </span>
                  </div>
                  {selectedEditParent && (
                    <div className="flex items-start gap-2 text-xs">
                      <span className="text-green-600 font-medium min-w-20">
                        Parent Path:
                      </span>
                      <code className="text-green-900 bg-green-100 px-1.5 py-0.5 rounded text-xs">
                        {getParentDisplayPath(selectedEditParent)}
                      </code>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-green-600 font-medium min-w-20">
                      Icon:
                    </span>
                    <span className="text-green-900 flex items-center gap-1">
                      {editMenu.icon ? (
                        <>
                          <IconComponent name={editMenu.icon} size={14} />
                          {editMenu.icon}
                        </>
                      ) : (
                        <span className="italic text-green-400">
                          (not selected)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-green-600 font-medium min-w-20">
                      Path:
                    </span>
                    <code className="text-green-900 bg-green-100 px-1.5 py-0.5 rounded text-xs">
                      {editMenu.path || (
                        <span className="italic text-green-400">
                          (not generated)
                        </span>
                      )}
                    </code>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-green-600 font-medium min-w-20">
                      Level:
                    </span>
                    <span className="text-green-900 font-semibold">
                      {editMenu.level}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-green-600 font-medium min-w-20">
                      Order:
                    </span>
                    <span className="text-green-900 font-semibold">
                      {editMenu.order_index}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t-2 border-gray-200">
                <button
                  onClick={() => {
                    setShowModalEdit(false);
                    resetEditForm();
                  }}
                  className="px-6 py-2.5 text-sm font-semibold rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateMenu}
                  disabled={
                    isLoading || !editMenu.name.trim() || !editMenu.icon
                  }
                  className="px-6 py-2.5 text-sm font-semibold rounded-lg text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Updating...
                    </span>
                  ) : (
                    'Update Menu'
                  )}
                </button>
              </div>
            </div>
          </ModalKosonganSmall>
        )}

        {/* Search */}
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
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
              placeholder="Search by menu name, path, or icon..."
              className="w-full h-10 pl-9 pr-9 border-2 border-gray-200 rounded-lg text-sm focus:border-primary focus:outline-none transition-colors bg-white"
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
          {menus.length > 0 && (
            <div className="text-xs text-gray-500">
              Showing{' '}
              <span className="font-semibold text-gray-700">
                {filteredMenus.length}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-gray-700">
                {menus.length}
              </span>{' '}
              modules
            </div>
          )}
        </div>

        {/* Modules grid */}
        {filteredMenus.length > 0 ? (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(740px, 1fr))',
            }}
          >
            {filteredMenus.map((module) => {
              const collapsed = collapsedModules.has(module.id);
              const total = countSubtree(module) - 1; // exclude the module itself

              return (
                <div
                  key={module.id}
                  className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden shadow-sm flex flex-col"
                >
                  {/* Module header */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <button
                      onClick={() => toggleModuleCollapsed(module.id)}
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

                    <IconComponent name={module.icon} size={18} />

                    <div className="flex flex-col min-w-0 flex-1">
                      <span
                        className="font-semibold text-sm text-gray-900 truncate"
                        title={module.name}
                      >
                        {module.name}
                      </span>
                      {module.path && (
                        <code className="text-[10px] text-gray-500 truncate">
                          {module.path}
                        </code>
                      )}
                    </div>

                    <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-semibold rounded bg-blue-100 text-blue-700">
                      L{module.level}
                    </span>
                    <span className="shrink-0 text-[10px] font-medium text-gray-500">
                      {total} sub-menu{total === 1 ? '' : 's'}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEditMenuClick(module)}
                        className="inline-flex items-center justify-center w-7 h-7 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        aria-label={`Edit ${module.name}`}
                        title="Edit module"
                      >
                        <svg
                          className="w-3.5 h-3.5"
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
                      </button>
                      <button
                        onClick={() => handleDeleteMenu(module.id, module.name)}
                        className="inline-flex items-center justify-center w-7 h-7 text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                        aria-label={`Delete ${module.name}`}
                        title="Delete module"
                      >
                        <svg
                          className="w-3.5 h-3.5"
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
                      </button>
                    </div>
                  </div>

                  {/* Module body */}
                  {!collapsed && (
                    <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                      {module.children && module.children.length > 0 ? (
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 sticky top-0">
                              <th className="py-2 px-4 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                Menu Name
                              </th>
                              <th className="py-2 px-4 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                Icon
                              </th>
                              <th className="py-2 px-4 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                Path
                              </th>
                              <th className="py-2 px-4 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                Level
                              </th>
                              <th className="py-2 px-4 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                Order
                              </th>
                              <th className="py-2 px-4 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {module.children.map((child) =>
                              renderMenuTree(child, 0),
                            )}
                          </tbody>
                        </table>
                      ) : (
                        <div className="py-8 text-center text-xs text-gray-400 italic">
                          No sub-menus yet
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : isSearching ? (
          <div className="bg-white rounded-lg border border-gray-200 py-16 text-center">
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
            <p className="text-sm text-gray-500">Try a different search term</p>
          </div>
        ) : (
          !isLoading && (
            <div className="bg-white rounded-lg border border-gray-200 py-16 text-center">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                No menus found
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Get started by creating your first menu
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowModalCreate(true);
                }}
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
                Create First Menu
              </button>
            </div>
          )
        )}
      </>
    </DefaultLayout>
  );
}
export default MasterMenu;
