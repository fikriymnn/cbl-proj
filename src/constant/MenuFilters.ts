import { MenuItem, MenuCategory } from './menuConfig';

export const canAccessDepartmentMasterData = (role: string) => {
  const departmentMasterDataRoles = [
    'section head',
    'supervisor',
    'admin',
    'super admin',
    'developer',
  ];
  return departmentMasterDataRoles.includes(role?.toLowerCase());
};

export const isInspectorRole = (role: string) => {
  return role?.toLowerCase() === 'inspector';
};

export const isPayrollRole = (role: string) => {
  return role?.toLowerCase() === 'payroll';
};

export const isMaintenanceDashboard = (bagian: string, role: string) => {
  return (
    bagian?.toLowerCase() === 'maintenance' ||
    bagian?.toLowerCase() === 'pemeliharaan' ||
    role?.toLowerCase() === 'super admin' ||
    role?.toLowerCase() === 'developer'
  );
};

export const filterQCItems = (items: MenuItem[], role: string) => {
  if (isInspectorRole(role)) {
    return items
      .filter(
        (item) =>
          item.name !== 'QMS' &&
          item.name !== 'Report' &&
          item.name !== 'Absensi',
      )
      .map((item) => {
        if (item.name === 'Submission to HR' && item.children) {
          return {
            ...item,
            children: item.children.filter(
              (child) =>
                child.name !== 'Submission History' &&
                child.name !== 'Position History',
            ),
          };
        }
        return item;
      });
  }
  return items;
};

export const filterDashboardItems = (
  items: MenuItem[],
  bagian: string,
  role: string,
) => {
  return items.filter((item) => {
    if (item.name === 'Main Dashboard') {
      return (
        bagian?.toLowerCase() === 'maintenance' ||
        role?.toLowerCase() === 'super admin' ||
        role?.toLowerCase() === 'developer' ||
        bagian?.toLowerCase() === 'pemeliharaan'
      );
    }
    if (item.name === 'Maintenance Dashboard') {
      return isMaintenanceDashboard(bagian, role);
    }
    return true;
  });
};

export const filterHRMasterItems = (items: MenuItem[], role: string) => {
  if (isPayrollRole(role)) {
    return items.filter(
      (item) => item.name === 'Payroll' || item.name === 'Grade',
    );
  }
  return items;
};

export const filterHRItems = (items: MenuItem[], role: string) => {
  if (isPayrollRole(role)) {
    return items.filter(
      (item) => item.name === 'Personnel Management' || item.name === 'Payroll',
    );
  }
  return items;
};

export const filterMasterDataItems = (
  items: MenuItem[],
  role: string,
  bagian: string,
) => {
  // Filter based on role - only admin, kabag, super admin, and developer can access
  const allowedRoles = ['admin', 'kabag', 'super admin', 'developer'];
  const normalizedRole = role?.toLowerCase();

  if (!allowedRoles.includes(normalizedRole)) {
    return [];
  }

  // Super admin and developer can access all master data
  if (normalizedRole === 'super admin' || normalizedRole === 'developer') {
    // Return all items including General submenu
    return items;
  }

  // For admin and kabag, remove General submenu first
  let filteredItems = items.filter((item) => item.name !== 'General');

  // Filter master data submenus based on bagian
  filteredItems = filteredItems.filter((item) => {
    switch (bagian?.toLowerCase()) {
      case 'maintenance':
      case 'pemeliharaan':
        return item.name === 'Maintenance';

      case 'qc':
      case 'quality control':
        return item.name === 'Quality Control';

      case 'hr':
      case 'sdm':
        return item.name === 'Human Resources';

      case 'ppic':
        return item.name === 'PPIC';

      case 'production':
      case 'produksi':
        return item.name === 'Production';

      case 'marketing':
        return item.name === 'Marketing';

      default:
        return false;
    }
  });

  return filteredItems;
};

export const getFilteredMenuCategories = (
  menuCategories: MenuCategory[],
  role: string,
) => {
  return menuCategories.filter((category) => {
    if (category.name === 'Marketing') {
      return role?.toLowerCase() === 'developer';
    }
    return true;
  });
};

// Check if user is a technician role
export const isTechnicianRole = (role: string) => {
  const technicianRoles = [
    'senior technician',
    'junior technician',
    'shift technician',
  ];
  return technicianRoles.includes(role?.toLowerCase());
};

// Filter categories for technicians
export const filterTechnicianCategories = (
  menuCategories: MenuCategory[],
  role: string,
) => {
  if (!isTechnicianRole(role)) return menuCategories;

  return menuCategories
    .filter(
      (category) =>
        category.name === 'Dashboard' || category.name === 'Maintenance',
    )
    .map((category) => {
      if (category.name === 'Dashboard') {
        // Only show maintenance dashboard for technicians
        return {
          ...category,
          items: category.items.filter(
            (item) => item.name === 'Maintenance Dashboard',
          ),
        };
      }

      if (category.name === 'Maintenance') {
        // Only show CM and PM for technicians
        return {
          ...category,
          items: category.items.filter(
            (item) =>
              item.name === 'Corrective (CM)' ||
              item.name === 'Preventive Maintenance (PM)' ||
              item.name === 'SPB',
          ),
        };
      }
      return category;
    });
};

// Main function to get filtered categories based on role and bagian
export const getFilteredCategoriesByRoleAndBagian = (
  menuCategories: MenuCategory[],
  role: string,
  bagian: string,
) => {
  // Super admin can access everything
  if (
    role?.toLowerCase() === 'super admin' ||
    role?.toLowerCase() === 'developer'
  ) {
    return getFilteredMenuCategories(menuCategories, role);
  }

  // Admin role in marketing bagian - access Marketing category AND Master Data
  if (
    role?.toLowerCase() === 'admin' &&
    bagian?.toLowerCase() === 'marketing'
  ) {
    return menuCategories
      .filter(
        (category) =>
          category.name === 'Marketing' || category.name === 'Master Data',
      )
      .map((category) => {
        if (category.name === 'Master Data') {
          return {
            ...category,
            items: filterMasterDataItems(category.items, role, bagian),
          };
        }
        return category;
      });
  }

  // Payroll role - special case for HR
  if (isPayrollRole(role)) {
    return menuCategories
      .filter(
        (category) =>
          category.name === 'Human Resources' ||
          category.name === 'Master Data',
      )
      .map((category) => {
        if (category.name === 'Master Data') {
          return {
            ...category,
            items: category.items.filter(
              (item) => item.name === 'Human Resources',
            ),
          };
        }
        return {
          ...category,
          items: filterHRItems(category.items, role),
        };
      });
  }

  // Technician roles
  if (isTechnicianRole(role)) {
    return filterTechnicianCategories(menuCategories, role);
  }

  // Filter categories based on role and bagian
  return menuCategories
    .filter((category) => {
      // Always show Dashboard
      if (category.name === 'Dashboard') {
        return true;
      }

      // Master Data access control - consolidated single Master Data category
      if (category.name === 'Master Data') {
        // Check if user has department-specific master data access
        return canAccessDepartmentMasterData(role);
      }

      // Marketing access - only for developer role
      if (category.name === 'Marketing') {
        return role?.toLowerCase() === 'developer';
      }

      // Bagian-based access for regular menus
      switch (bagian?.toLowerCase()) {
        case 'maintenance':
        case 'pemeliharaan':
          return category.name === 'Maintenance';

        case 'qc':
        case 'quality control':
          return category.name === 'Quality Control';

        case 'hr':
        case 'sdm':
          return category.name === 'Human Resources';

        case 'ppic':
          return category.name === 'PPIC';

        case 'production':
        case 'produksi':
          return category.name === 'Production';

        case 'marketing':
          return category.name === 'Marketing';

        case 'prepress':
        case 'pre-press':
          return category.name === 'Pre-Press';

        case 'desain':
        case 'design':
          return category.name === 'Desain';

        case 'mr':
          return category.name === 'MR';

        default:
          return false;
      }
    })
    .map((category) => {
      // Apply filtering for Master Data category
      if (category.name === 'Master Data') {
        return {
          ...category,
          items: filterMasterDataItems(category.items, role, bagian),
        };
      }

      // Apply filtering for Quality Control category
      if (category.name === 'Quality Control') {
        return {
          ...category,
          items: filterQCItems(category.items, role),
        };
      }

      // Apply filtering for Dashboard category
      if (category.name === 'Dashboard') {
        return {
          ...category,
          items: filterDashboardItems(category.items, bagian, role),
        };
      }

      // Apply filtering for Human Resources category
      if (category.name === 'Human Resources') {
        return {
          ...category,
          items: filterHRItems(category.items, role),
        };
      }

      return category;
    });
};
