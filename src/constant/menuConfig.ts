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

// Import your existing SVG files
import Dashboard from '../images/icon/dashboard.svg';
import QC from '../images/icon/qcc.svg';
import MaintenanceIcon from '../images/icon/dashboard.svg';
import HRIcon from '../images/icon/history2.svg';
import PPICIcon from '../images/icon/qcc.svg';
import ProductionIcon from '../images/icon/inspect.svg';
import MasterDataIcon from '../images/icon/master.svg';

export const menuCategories: MenuCategory[] = [
  {
    name: 'Dashboard',
    icon: Dashboard,
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
    name: 'Maintenance',
    icon: MaintenanceIcon,
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
    icon: QC,
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
        icon: 'calibration',
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
    icon: QC,
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
    icon: HRIcon,
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
    icon: PPICIcon,
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
        name: 'BOM',
        path: '#',
        icon: 'bom',
        children: [
          {
            name: 'Create BOM',
            path: '/ppic/bom/create',
            icon: 'create',
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
        icon: 'bom',
        children: [
          {
            name: 'Create BOM PPIC',
            path: '/ppic/bom-ppic/create',
            icon: 'create',
          },
        ],
      },
      {
        name: 'JO',
        path: '#',
        icon: 'jo',
        children: [
          {
            name: 'Create JO',
            path: '/ppic/jo/create',
            icon: 'create',
          },
          {
            name: 'Approval',
            path: '/ppic/jo/approval',
            icon: 'approval',
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
    icon: ProductionIcon,
    items: [
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
    ],
  },
  {
    name: 'Marketing',
    icon: ProductionIcon,
    items: [
      {
        name: 'Calculation',
        path: '#',
        icon: 'calculation',
        children: [
          {
            name: 'Create',
            path: '/marketing/calculation/create',
            icon: 'create',
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
        icon: 'okp',
        children: [
          {
            name: 'Create',
            path: '/marketing/okp/create',
            icon: 'create',
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
        icon: 'io',
        children: [
          {
            name: 'Create',
            path: '/marketing/io/create',
            icon: 'create',
          },
          {
            name: 'NPD',
            path: '/marketing/io/npd',
            icon: 'npd',
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
        icon: 'so',
        children: [
          {
            name: 'Create',
            path: '/marketing/so/create',
            icon: 'create',
          },
          {
            name: 'History',
            path: '/marketing/so/history',
            icon: 'history',
          },
        ],
      },
    ],
  },
  {
    name: 'Pre-Press',
    icon: ProductionIcon,
    items: [
      {
        name: 'Pre Press',
        path: '/prepress',
        icon: 'prepress',
      },
    ],
  },
  {
    name: 'Desain',
    icon: ProductionIcon,
    items: [
      {
        name: 'Desain',
        path: '/desain',
        icon: 'design',
      },
    ],
  },
  {
    name: 'Master Data',
    icon: MasterDataIcon,
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
            icon: 'user',
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
            icon: 'pm',
          },
          {
            name: 'PM2',
            path: '/master/maintenance/pm2',
            icon: 'pm',
          },
          {
            name: 'PM3',
            path: '/master/maintenance/pm3',
            icon: 'pm',
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
        ],
      },
      {
        name: 'Quality Control',
        path: '#',
        icon: 'qc',
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
            icon: 'user',
          },
          {
            name: 'Outsourcing BJ',
            path: '/master/qc/outsourcing-bj',
            icon: 'outsourcing',
          },
          {
            name: 'Kalibrasi',
            path: '/master/qc/kalibrasi',
            icon: 'calibration',
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
            icon: 'setting',
          },
          {
            name: 'User',
            path: '/master/hr/user',
            icon: 'user',
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
            icon: 'capacity',
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
            icon: 'capacity',
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
        icon: 'marketing',
        children: [
          {
            name: 'Marketing',
            path: '/master/marketing/marketing',
            icon: 'marketing',
          },
          {
            name: 'Customer',
            path: '/master/marketing/customer',
            icon: 'customer',
          },
          {
            name: 'Brand',
            path: '/master/marketing/brand',
            icon: 'brand',
          },
          {
            name: 'Delivery',
            path: '/master/marketing/delivery',
            icon: 'delivery',
          },
          {
            name: 'Product',
            path: '/master/marketing/product',
            icon: 'product',
          },
          {
            name: 'Unit',
            path: '/master/marketing/unit',
            icon: 'unit',
          },
          {
            name: 'Item',
            path: '/master/marketing/item',
            icon: 'item',
          },
          {
            name: 'Machine Stage',
            path: '/master/marketing/machine-stage',
            icon: 'machine',
          },
          {
            name: 'Stage',
            path: '/master/marketing/stage',
            icon: 'stage',
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
        icon: 'general',
        children: [
          {
            name: 'Access',
            path: '/master/access',
            icon: 'access',
          },
          {
            name: 'User',
            path: '/master/user',
            icon: 'user',
          },
        ],
      },
    ],
  },
];
