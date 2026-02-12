export interface MenuItem {
  name: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
}

export interface MenuCategory {
  name: string;
  icon: string;
  items: MenuItem[];
}

export const menuCategories: MenuCategory[] = [
  {
    name: 'Dashboard',
    icon: 'dashboard',
    items: [
      {
        name: 'Main Dashboard',
        path: '/dashboard',
        icon: 'dashboard',
      },
      {
        name: 'Maintenance Dashboard',
        path: '/dashboard/maintenance',
        icon: 'dashboard',
      },
    ],
  },
  {
    name: 'Security',
    icon: 'dashboard',
    items: [
      {
        name: 'Monitoring',
        path: '/security/monitoring',
        icon: 'dashboard',
      },
    ],
  },

  {
    name: 'Maintenance',
    icon: 'maintenance',
    items: [
      {
        name: 'Corrective (CM)',
        path: '/maintenance/corrective',
        icon: 'machine',
      },
      {
        name: 'Preventive Maintenance (PM)',
        path: '#',
        icon: 'preventive',
        children: [
          {
            name: 'PM1',
            path: '/maintenance/preventive/pm1',
            icon: 'preventive',
          },
          {
            name: 'PM2',
            path: '/maintenance/preventive/pm2',
            icon: 'preventive',
          },
          {
            name: 'PM3',
            path: '/maintenance/preventive/pm3',
            icon: 'preventive',
          },
          {
            name: 'OS3',
            path: '/maintenance/preventive/os3',
            icon: 'preventive',
          },
          {
            name: 'History',
            path: '/maintenance/preventive/history',
            icon: 'history',
          },
        ],
      },
      {
        name: 'Outstanding',
        path: '/maintenance/outstanding',
        icon: 'outstanding',
      },
      {
        name: 'Absensi',
        path: '/maintenance/absensi',
        icon: 'attendance',
      },
      {
        name: 'Sparepart',
        path: '#',
        icon: 'sparepart',
        children: [
          {
            name: 'Opname Adjustment',
            path: '/maintenance/sparepart/opname/adjustment',
            icon: 'adjustment',
          },
          {
            name: 'Stock Master',
            path: '/maintenance/sparepart/stock-master',
            icon: 'stock',
          },
          {
            name: 'Monitoring Sparepart',
            path: '/maintenance/sparepart/monitoring',
            icon: 'monitoring',
          },
          {
            name: 'Monitoring Service',
            path: '/maintenance/sparepart/monitoring-service',
            icon: 'monitoring',
          },
        ],
      },
      {
        name: 'Project',
        path: '/maintenance/project',
        icon: 'project',
      },
      {
        name: 'Recap',
        path: '/maintenance/recap',
        icon: 'recap',
      },
      {
        name: 'KPI',
        path: '#',
        icon: 'kpi',
        children: [
          {
            name: 'Dashboard',
            path: '/maintenance/kpi',
            icon: 'dashboard',
          },
          {
            name: 'Form',
            path: '/maintenance/kpi/form',
            icon: 'form',
          },
          {
            name: 'Input',
            path: '/maintenance/kpi/input',
            icon: 'input',
          },
        ],
      },
      {
        name: 'Report',
        path: '#',
        icon: 'ncr',
        children: [
          {
            name: 'NCR',
            path: '/maintenance/report/ncr',
            icon: 'ncr',
          },
          {
            name: 'CAPA',
            path: '/maintenance/report/capa',
            icon: 'capa',
          },
        ],
      },
      {
        name: 'SPB',
        path: '/maintenance/spb',
        icon: 'service',
      },
      {
        name: 'Submission to HR',
        path: '#',
        icon: 'document',
        children: [
          {
            name: 'Submission',
            path: '/maintenance/submission',
            icon: 'submission',
          },
          {
            name: 'Submission History',
            path: '/maintenance/submission/history',
            icon: 'history',
          },
          {
            name: 'Position Submission',
            path: '/maintenance/submission/position',
            icon: 'submission',
          },
          {
            name: 'Position History',
            path: '/maintenance/submission/position/history',
            icon: 'history',
          },
        ],
      },
    ],
  },
  {
    name: 'Quality Control',
    icon: 'quality',
    items: [
      {
        name: 'Validate & Verify',
        path: '/qc/validate-verify',
        icon: 'validation',
      },
      {
        name: 'Quality Inspection',
        path: '/qc/inspection',
        icon: 'inspection',
      },
      {
        name: 'Kalibrasi Alat Ukur',
        path: '/qc/kalibrasi',
        icon: 'calendar',
      },
      {
        name: 'Kabag Approval',
        path: '/qc/kabag-approval',
        icon: 'approval',
      },
      {
        name: 'Outstanding',
        path: '/qc/outstanding',
        icon: 'outstanding',
      },
      {
        name: 'Recap',
        path: '/qc/recap',
        icon: 'recap',
      },
      {
        name: 'QMS',
        path: '#',
        icon: 'qms',
        children: [
          { name: 'NCR', path: '/qc/qms/ncr', icon: 'ncr' },
          { name: 'CAPA', path: '/qc/qms/capa', icon: 'capa' },
        ],
      },
      {
        name: 'Report',
        path: '#',
        icon: 'report',
        children: [
          { name: 'NCR', path: '/qc/report/ncr', icon: 'ncr' },
          { name: 'CAPA', path: '/qc/report/capa', icon: 'capa' },
        ],
      },
      {
        name: 'Absensi',
        path: '/qc/absensi',
        icon: 'attendance',
      },
      {
        name: 'Submission to HR',
        path: '#',
        icon: 'document',
        children: [
          {
            name: 'Submission',
            path: '/qc/submission',
            icon: 'submission',
          },
          {
            name: 'Submission History',
            path: '/qc/submission/history',
            icon: 'history',
          },
          {
            name: 'Position Submission',
            path: '/qc/submission/position',
            icon: 'submission',
          },
          {
            name: 'Position History',
            path: '/qc/submission/position/history',
            icon: 'history',
          },
        ],
      },
    ],
  },
  {
    name: 'MR',
    icon: 'quality',
    items: [
      {
        name: 'QMS',
        path: '#',
        icon: 'qms',
        children: [
          { name: 'NCR', path: '/mr/qms/ncr', icon: 'ncr' },
          { name: 'CAPA', path: '/mr/qms/capa', icon: 'capa' },
        ],
      },
      {
        name: 'Report',
        path: '#',
        icon: 'report',
        children: [
          { name: 'NCR', path: '/mr/report/ncr', icon: 'ncr' },
          { name: 'CAPA', path: '/mr/report/capa', icon: 'capa' },
        ],
      },
    ],
  },
  {
    name: 'Human Resources',
    icon: 'hr',
    items: [
      {
        name: 'Personnel Management',
        path: '#',
        icon: 'personnel',
        children: [
          {
            name: 'Company',
            path: '/hr/personnel/company',
            icon: 'company',
          },
          {
            name: 'Employee',
            path: '/hr/personnel/employee',
            icon: 'employee',
          },
          {
            name: 'Work Calendar',
            path: '/hr/personnel/work-calendar',
            icon: 'calendar',
          },
          {
            name: 'Absensi',
            path: '/hr/personnel/absensi',
            icon: 'attendance',
          },
        ],
      },
      {
        name: 'Payroll',
        path: '#',
        icon: 'payroll',
        children: [
          { name: 'Payroll', path: '/hr/payroll', icon: 'payroll' },
          {
            name: 'Monthly Payroll',
            path: '/hr/payroll/monthly',
            icon: 'payroll',
          },
          {
            name: 'Approval',
            path: '/hr/payroll/approval',
            icon: 'approval',
          },
        ],
      },
      {
        name: 'Submission',
        path: '#',
        icon: 'submission',
        children: [
          {
            name: 'Submission',
            path: '/hr/submission',
            icon: 'submission',
          },
          {
            name: 'Submission History',
            path: '/hr/submission/history',
            icon: 'history',
          },
          {
            name: 'Position Submission',
            path: '/hr/submission/position',
            icon: 'position',
          },
          {
            name: 'Position History',
            path: '/hr/submission/position/history',
            icon: 'history',
          },
        ],
      },
      {
        name: 'Response',
        path: '#',
        icon: 'response',
        children: [
          {
            name: 'Response',
            path: '/hr/response',
            icon: 'response',
          },
          {
            name: 'Response History',
            path: '/hr/response/history',
            icon: 'history',
          },
          {
            name: 'Position Response',
            path: '/hr/response/position',
            icon: 'position',
          },
          {
            name: 'Position History',
            path: '/hr/response/position/history',
            icon: 'history',
          },
        ],
      },
      {
        name: 'Recap',
        path: '/hr/recap',
        icon: 'recap',
      },
      {
        name: 'Outstanding',
        path: '/hr/outstanding',
        icon: 'outstanding',
      },
      {
        name: 'Report',
        path: '#',
        icon: 'report',
        children: [
          { name: 'NCR', path: '/hr/report/ncr', icon: 'ncr' },
          { name: 'CAPA', path: '/hr/report/capa', icon: 'capa' },
        ],
      },
    ],
  },
  {
    name: 'PPIC',
    icon: 'ppic',
    items: [
      {
        name: 'Production Schedule',
        path: '/ppic/production-schedule',
        icon: 'schedule',
      },
      {
        name: 'Scheduled JO',
        path: '/ppic/scheduled-jo',
        icon: 'schedule',
      },
      {
        name: 'Approval Perubahan Tanggal Kirim',
        path: '/ppic/perubahan-tanggal-kirim',
        icon: 'schedule',
      },
      {
        name: 'Delivery Schedule',
        path: '/ppic/delivery-schedule',
        icon: 'schedule',
      },
      {
        name: 'Outstanding',
        path: '/ppic/outstanding',
        icon: 'outstanding',
      },
      {
        name: 'Recap',
        path: '/ppic/recap',
        icon: 'recap',
      },
      {
        name: 'Absensi',
        path: '/ppic/absensi',
        icon: 'attendance',
      },
      {
        name: 'BOM',
        path: '#',
        icon: 'document',
        children: [
          {
            name: 'Create BOM',
            path: '/ppic/bom/create',
            icon: 'form',
          },
          {
            name: 'Approval',
            path: '/ppic/bom/approval',
            icon: 'approval',
          },
        ],
      },
      {
        name: 'BOM PPIC',
        path: '#',
        icon: 'document',
        children: [
          {
            name: 'Create BOM PPIC',
            path: '/ppic/bom-ppic/create',
            icon: 'form',
          },
        ],
      },
      {
        name: 'JO',
        path: '#',
        icon: 'document',
        children: [
          {
            name: 'Create JO',
            path: '/ppic/jo/create',
            icon: 'form',
          },
          {
            name: 'Approval',
            path: '/ppic/jo/approval',
            icon: 'approval',
          },

          {
            name: 'History',
            path: '/ppic/jo/history',
            icon: 'history',
          },
        ],
      },
      {
        name: 'Submission to HR',
        path: '#',
        icon: 'document',
        children: [
          {
            name: 'Submission',
            path: '/ppic/submission',
            icon: 'submission',
          },
          {
            name: 'Submission History',
            path: '/ppic/submission/history',
            icon: 'history',
          },
          {
            name: 'Position Submission',
            path: '/ppic/submission/position',
            icon: 'submission',
          },
          {
            name: 'Position History',
            path: '/ppic/submission/position/history',
            icon: 'history',
          },
        ],
      },
    ],
  },
  {
    name: 'Production',
    icon: 'production',
    items: [
      {
        name: 'Input LKH',
        path: '/production/input-lkh',
        icon: 'input',
      },
      {
        name: 'Monitoring LKH',
        path: '/production/monitoring-lkh',
        icon: 'input',
      },
      {
        name: 'Approve LKH',
        path: '/production/approve-lkh',
        icon: 'input',
      },

      {
        name: 'All Data LKH',
        path: '/production/alldata-lkh',
        icon: 'input',
      },
      {
        name: 'Buka LKH',
        path: '/production/buka-lkh',
        icon: 'input',
      },
      {
        name: 'List JO Selesai',
        path: '/production/list-jo-selesai',
        icon: 'input',
      },
      {
        name: 'Breakdown Recap',
        path: '/production/breakdown-recap',
        icon: 'breakdown',
      },
      {
        name: 'Waste Report',
        path: '/production/waste-report',
        icon: 'waste',
      },
      {
        name: 'OS2',
        path: '/production/os2',
        icon: 'machine',
      },
      {
        name: 'Absensi',
        path: '/production/absensi',
        icon: 'attendance',
      },
      {
        name: 'Submission to HR',
        path: '#',
        icon: 'document',
        children: [
          {
            name: 'Submission',
            path: '/production/submission',
            icon: 'submission',
          },
          {
            name: 'Submission History',
            path: '/production/submission/history',
            icon: 'history',
          },
          {
            name: 'Position Submission',
            path: '/production/submission/position',
            icon: 'submission',
          },
          {
            name: 'Position History',
            path: '/production/submission/position/history',
            icon: 'history',
          },
        ],
      },
    ],
  },
  {
    name: 'Marketing',
    icon: 'production',
    items: [
      {
        name: 'Calculation',
        path: '#',
        icon: 'analysis',
        children: [
          {
            name: 'Create',
            path: '/marketing/calculation/create',
            icon: 'form',
          },
          {
            name: 'History',
            path: '/marketing/calculation/history',
            icon: 'history',
          },
        ],
      },
      {
        name: 'Kabag Approval',
        path: '#',
        icon: 'approval',
        children: [
          {
            name: 'Approval',
            path: '/marketing/kabag-approval/list',
            icon: 'approval',
          },
          {
            name: 'History',
            path: '/marketing/kabag-approval/history',
            icon: 'history',
          },
        ],
      },
      {
        name: 'OKP',
        path: '#',
        icon: 'document',
        children: [
          {
            name: 'Create',
            path: '/marketing/okp/create',
            icon: 'form',
          },
          {
            name: 'History',
            path: '/marketing/okp/history',
            icon: 'history',
          },
        ],
      },
      {
        name: 'IO',
        path: '#',
        icon: 'document',
        children: [
          {
            name: 'Create',
            path: '/marketing/io/create',
            icon: 'form',
          },
          {
            name: 'NPD',
            path: '/marketing/io/npd',
            icon: 'document',
          },
          {
            name: 'History',
            path: '/marketing/io/history',
            icon: 'history',
          },
        ],
      },
      {
        name: 'SO',
        path: '#',
        icon: 'document',
        children: [
          {
            name: 'Create',
            path: '/marketing/so/create',
            icon: 'form',
          },
          {
            name: 'History',
            path: '/marketing/so/history',
            icon: 'history',
          },
        ],
      },
      {
        name: 'Perubahan Invoice',
        path: '#',
        icon: 'document',
        children: [
          {
            name: 'Create',
            path: '/marketing/perubahan/create-perubahan',
            icon: 'form',
          },
          {
            name: 'List',
            path: '/marketing/perubahan/list-perubahan',
            icon: 'report',
          },
          {
            name: 'History',
            path: '/marketing/perubahan/history-perubahan',
            icon: 'history',
          },
        ],
      },
    ],
  },
  {
    name: 'Pre-Press',
    icon: 'production',
    items: [
      {
        name: 'Pre Press',
        path: '/prepress',
        icon: 'production',
      },
    ],
  },
  {
    name: 'Desain',
    icon: 'production',
    items: [
      {
        name: 'Desain',
        path: '/desain',
        icon: 'production',
      },
    ],
  },
  {
    name: 'Delivery Order',
    icon: 'quality',
    items: [
      { name: 'List DO', path: '/do/list-do', icon: 'capa' },
      { name: 'Konfirmasi DO', path: '/do/konfirmasi-do', icon: 'production' },
    ],
  },
  {
    name: 'Accounting',
    icon: 'quality',
    items: [
      {
        name: 'List Outstanding',
        path: '/accounting/list-outstanding',
        icon: 'outstanding',
      },
      {
        name: 'List Request Invoice',
        path: '/accounting/list-request-invoice',
        icon: 'document',
      },
      {
        name: 'List Approve Invoice',
        path: '/accounting/list-approval-invoice',
        icon: 'approval',
      },
      {
        name: 'List Approve Perubahan',
        path: '/accounting/list-approval-perubahan',
        icon: 'approval',
      },
      {
        name: 'List All Invoice',
        path: '/accounting/list-invoice',
        icon: 'document',
      },
      { name: 'List Retur', path: '/accounting/list-retur', icon: 'report' },
      { name: 'Deposit', path: '/accounting/deposit', icon: 'payroll' },
      {
        name: ' Approval',
        path: '#',
        icon: 'approval',
        children: [
          {
            name: 'Approval Deposit',
            path: '/accounting/approval/deposit',
            icon: 'approval',
          },
          {
            name: 'History Approval Deposit',
            path: '/accounting/approval/deposit-history',
            icon: 'history',
          },
        ],
      },
    ],
  },

  {
    name: 'Master Data',
    icon: 'settings',
    items: [
      {
        name: 'Maintenance',
        path: '#',
        icon: 'maintenance',
        children: [
          {
            name: 'Machine',
            path: '/master/maintenance/machine',
            icon: 'machine',
          },
          {
            name: 'User',
            path: '/master/maintenance/user',
            icon: 'employee',
          },
          {
            name: 'Role',
            path: '/master/maintenance/role',
            icon: 'role',
          },
          {
            name: 'Sparepart',
            path: '/master/maintenance/sparepart',
            icon: 'sparepart',
          },
          {
            name: 'Analysis',
            path: '/master/maintenance/analysis',
            icon: 'analysis',
          },
          {
            name: 'Monitoring',
            path: '/master/maintenance/monitoring',
            icon: 'monitoring',
          },
          {
            name: 'PM1',
            path: '/master/maintenance/pm1',
            icon: 'preventive',
          },
          {
            name: 'PM2',
            path: '/master/maintenance/pm2',
            icon: 'preventive',
          },
          {
            name: 'PM3',
            path: '/master/maintenance/pm3',
            icon: 'preventive',
          },
          {
            name: 'KPI',
            path: '/master/maintenance/kpi',
            icon: 'kpi',
          },
          {
            name: 'Grade',
            path: '/master/maintenance/grade',
            icon: 'grade',
          },
          {
            name: 'Skor MTC',
            path: '/master/maintenance/skor-mtc',
            icon: 'grade',
          },
        ],
      },
      {
        name: 'Quality Control',
        path: '#',
        icon: 'quality',
        children: [
          {
            name: 'Defect',
            path: '/master/qc/defect',
            icon: 'defect',
          },
          {
            name: 'Document',
            path: '/master/qc/document',
            icon: 'document',
          },
          {
            name: 'Final Inspection',
            path: '/master/qc/final-inspection',
            icon: 'inspection',
          },
          {
            name: 'User',
            path: '/master/qc/user',
            icon: 'employee',
          },
          {
            name: 'Outsourcing BJ',
            path: '/master/qc/outsourcing-bj',
            icon: 'outsourcing',
          },
          {
            name: 'Kalibrasi',
            path: '/master/qc/kalibrasi',
            icon: 'calendar',
          },
        ],
      },
      {
        name: 'Human Resources',
        path: '#',
        icon: 'hr',
        children: [
          {
            name: 'Shift',
            path: '/master/hr/shift',
            icon: 'shift',
          },
          {
            name: 'SP & Teguran',
            path: '/master/hr/sp-teguran',
            icon: 'warning',
          },
          {
            name: 'Setting',
            path: '/master/hr/setting',
            icon: 'settings',
          },
          {
            name: 'User',
            path: '/master/hr/user',
            icon: 'employee',
          },
          {
            name: 'Kendaraan',
            path: '/master/hr/kendaraan',
            icon: 'stock',
          },
          {
            name: 'Department',
            path: '/master/hr/department',
            icon: 'department',
          },
          {
            name: 'Cuti Khusus',
            path: '/master/hr/cuti-khusus',
            icon: 'leave',
          },
          {
            name: 'Grade',
            path: '/master/hr/grade',
            icon: 'grade',
          },
          {
            name: 'Payroll',
            path: '/master/hr/payroll',
            icon: 'payroll',
          },
          {
            name: 'Izin Terlambat',
            path: '/master/hr/izinterlambat',
            icon: 'leave',
          },
        ],
      },
      {
        name: 'PPIC',
        path: '#',
        icon: 'ppic',
        children: [
          {
            name: 'Schedule',
            path: '/master/ppic/schedule',
            icon: 'schedule',
          },
          {
            name: 'Fleet Capacity',
            path: '/master/ppic/fleet-capacity',
            icon: 'stock',
          },
        ],
      },
      {
        name: 'Production',
        path: '#',
        icon: 'production',
        children: [
          {
            name: 'Kategori Kendala',
            path: '/master/produksi/kategori-kendala',
            icon: 'schedule',
          },
          {
            name: 'Kriteria Kendala',
            path: '/master/produksi/kriteria-kendala',
            icon: 'stock',
          },
          {
            name: 'Kode Produksi',
            path: '/master/produksi/kode-produksi',
            icon: 'schedule',
          },
        ],
      },
      {
        name: 'Marketing',
        path: '#',
        icon: 'production',
        children: [
          {
            name: 'Marketing',
            path: '/master/marketing/marketing',
            icon: 'production',
          },
          {
            name: 'Customer',
            path: '/master/marketing/customer',
            icon: 'employee',
          },
          {
            name: 'Brand',
            path: '/master/marketing/brand',
            icon: 'grade',
          },
          {
            name: 'Delivery',
            path: '/master/marketing/delivery',
            icon: 'stock',
          },
          {
            name: 'Product',
            path: '/master/marketing/product',
            icon: 'production',
          },
          {
            name: 'Unit',
            path: '/master/marketing/unit',
            icon: 'analysis',
          },
          {
            name: 'Item',
            path: '/master/marketing/item',
            icon: 'document',
          },
          {
            name: 'Machine Stage',
            path: '/master/marketing/machine-stage',
            icon: 'machine',
          },
          {
            name: 'Stage',
            path: '/master/marketing/stage',
            icon: 'schedule',
          },
          {
            name: 'Stage Machine',
            path: '/master/marketing/stage-machine',
            icon: 'machine',
          },
        ],
      },

      {
        name: 'General',
        path: '#',
        icon: 'settings',
        children: [
          {
            name: 'Access',
            path: '/master-data/general/access',
            icon: 'access',
          },
          {
            name: 'Menu',
            path: '/master-data/general/menu',
            icon: 'document',
          },
          {
            name: 'User',
            path: '/master-data/general/user',
            icon: 'employee',
          },
        ],
      },
    ],
  },
  {
    name: 'Management Menu',
    icon: 'settings',
    items: [
      {
        name: 'approval',
        path: '/management-menu/approval-management',
        icon: 'access',
      },
    ],
  },
  {
    name: 'User Menu',
    icon: 'settings',
    items: [
      {
        name: 'Submission',
        path: '/user-menu/submission',
        icon: 'access',
      },
      {
        name: 'Absensi',
        path: '/user-menu/absensi',
        icon: 'access',
      },
      {
        name: 'Izin Terlambat Atasan',
        path: '/user-menu/izin-terlambat-atasan',
        icon: 'access',
      },
      {
        name: 'Izin Terlambat Bawahan',
        path: '/user-menu/izin-terlambat-bawahan',
        icon: 'access',
      },
    ],
  },
];
