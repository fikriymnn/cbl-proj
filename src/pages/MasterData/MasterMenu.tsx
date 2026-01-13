// pages/Master/MasterMenu.tsx

import DefaultLayout from '../../layout/DefaultLayout';
import React, { useEffect, useState } from 'react';
import Loading from '../../components/Loading';
import ModalKosonganSmall from '../../components/Modals/ModalKosonganSmall';
import { masterMenuApi } from './services/masterMenuApi';
import { MenuNode, CreateMenuDto } from './types/masterMenu.types';
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

function MasterMenu() {
  const [isLoading, setIsLoading] = useState(false);
  const [menus, setMenus] = useState<MenuNode[]>([]);
  const [showModalCreate, setShowModalCreate] = useState(false);
  const [newMenu, setNewMenu] = useState<CreateMenuDto>({
    name: '',
    icon: '',
    path: null,
    parent_id: null,
    order_index: 1,
    level: 1,
  });
  const [selectedParent, setSelectedParent] = useState<MenuNode | null>(null);

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

  // Handle parent selection
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

  // Handle menu name change
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

  const renderMenuTree = (menu: MenuNode, level: number = 0) => {
    return (
      <React.Fragment key={menu.id}>
        <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
          <td className="py-4 px-6">
            <div className="flex items-center gap-2">
              <span
                style={{ marginLeft: `${level * 24}px` }}
                className="flex items-center gap-2"
              >
                {level > 0 && (
                  <span className="text-gray-400">{'└─ '.repeat(1)}</span>
                )}
                <IconComponent name={menu.icon} size={18} />
                <span className="font-medium text-gray-900">{menu.name}</span>
              </span>
            </div>
          </td>
          <td className="py-4 px-6">
            <div className="flex items-center gap-2 text-gray-600">
              <IconComponent name={menu.icon} size={16} />
              <span className="text-sm">{menu.icon}</span>
            </div>
          </td>
          <td className="py-4 px-6">
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
          <td className="py-4 px-6 text-center">
            <span
              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${
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
          <td className="py-4 px-6 text-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold">
              {menu.order_index}
            </span>
          </td>
          <td className="py-4 px-6 text-center">
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
          </td>
        </tr>

        {menu.children &&
          menu.children.map((child) => renderMenuTree(child, level + 1))}
      </React.Fragment>
    );
  };

  const availableIcons = getAvailableIcons();

  // Get parent full path for display
  const getParentDisplayPath = () => {
    if (!selectedParent) return null;
    return getFullPath(selectedParent.id, menus);
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
                <p className="text-sm text-gray-600">Top Level</p>
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
                      {getParentDisplayPath()}
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
                  Generated Path
                </label>
                <div className="w-full min-h-11 border-2 border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 flex items-center">
                  {newMenu.path ? (
                    <code className="text-sm text-gray-700 font-mono">
                      {newMenu.path}
                    </code>
                  ) : (
                    <span className="text-gray-400 italic text-sm">
                      Enter menu name to generate path
                    </span>
                  )}
                </div>
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
                        {getParentDisplayPath()}
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

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Menu Name
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Icon
                </th>
                <th className="py-4 px-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Path
                </th>
                <th className="py-4 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Level
                </th>
                <th className="py-4 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Order
                </th>
                <th className="py-4 px-6 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {menus.map((menu) => renderMenuTree(menu, 0))}
            </tbody>
          </table>

          {menus.length === 0 && !isLoading && (
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
          )}
        </div>
      </>
    </DefaultLayout>
  );
}
export default MasterMenu;
