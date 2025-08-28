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
          item.name !== 'Lapor' &&
          item.name !== 'QC Absensi',
      )
      .map((item) => {
        if (item.name === 'Pengajuan Ke HR' && item.children) {
          return {
            ...item,
            children: item.children.filter(
              (child) =>
                child.name !== 'History ' &&
                child.name !== 'History Pengajuan Jabatan',
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
    if (item.name === 'Dashboard') {
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
      (item) =>
        item.name === 'HR Payroll Master' || item.name === 'HR Grade Master',
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

export const filterMasterDataItems = (items: MenuItem[], role: string) => {
  if (role !== 'super admin' && role !== 'developer') {
    return items.filter(
      (item) =>
        item.name !== 'Role Master' &&
        item.name !== 'All User Master' &&
        item.name !== 'Access Master' &&
        item.name !== 'payroll',
    );
  }
  return items;
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
      if (category.name === 'Master Data') {
        return {
          ...category,
          items: filterMasterDataItems(category.items, role),
        };
      }

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

  // Admin role in marketing bagian - only access Marketing category
  if (
    role?.toLowerCase() === 'admin' &&
    bagian?.toLowerCase() === 'marketing'
  ) {
    return menuCategories.filter((category) => category.name === 'Marketing');
  }

  // Payroll role - special case for HR
  if (isPayrollRole(role)) {
    return menuCategories.filter(
      (category) =>
        category.name === 'Human Resources' || category.name === 'HR Master',
    );
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

      // Master Data access control
      if (
        category.name === 'Master Data' ||
        category.name === 'QC Master Data' ||
        category.name === 'HR Master'
      ) {
        // Super admin can access all master data
        if (role === 'super admin') {
          return true;
        }

        // Check if user has department-specific master data access
        if (!canAccessDepartmentMasterData(role)) {
          return false;
        }

        // Department-specific master data access
        if (category.name === 'Master Data') {
          return (
            bagian?.toLowerCase() === 'maintenance' ||
            bagian?.toLowerCase() === 'pemeliharaan'
          );
        }
        if (category.name === 'QC Master Data') {
          return (
            bagian?.toLowerCase() === 'qc' ||
            bagian?.toLowerCase() === 'quality control'
          );
        }
        if (category.name === 'HR Master') {
          return (
            bagian?.toLowerCase() === 'hr' || bagian?.toLowerCase() === 'sdm'
          );
        }
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
        default:
          return false;
      }
    })
    .map((category) => {
      // Apply filtering for specific category items
      if (category.name === 'Master Data') {
        return {
          ...category,
          items: filterMasterDataItems(category.items, role),
        };
      }

      if (category.name === 'Quality Control') {
        return {
          ...category,
          items: filterQCItems(category.items, role),
        };
      }

      if (category.name === 'Dashboard') {
        return {
          ...category,
          items: filterDashboardItems(category.items, bagian, role),
        };
      }

      if (category.name === 'HR Master') {
        return {
          ...category,
          items: filterHRMasterItems(category.items, role),
        };
      }

      if (category.name === 'Human Resources') {
        return {
          ...category,
          items: filterHRItems(category.items, role),
        };
      }

      return category;
    });
};
