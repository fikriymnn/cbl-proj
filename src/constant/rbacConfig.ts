// rbacConfig.ts

export interface RoutePermission {
  path: string;
  access: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface RolePermissions {
  role: string;
  bagian: string;
  permissions: RoutePermission[];
}

// Helper function to create permission object
const createPermission = (
  path: string,
  access: boolean = true,
  create: boolean = true,
  edit: boolean = true,
  deletePermission: boolean = true,
): RoutePermission => ({
  path,
  access,
  create,
  edit,
  delete: deletePermission,
});

// Helper to create full access permission
const fullAccess = (path: string) =>
  createPermission(path, true, true, true, true);

// Helper to create read-only permission
const readOnly = (path: string) =>
  createPermission(path, true, false, false, false);

// Helper to create no access permission
const noAccess = (path: string) =>
  createPermission(path, false, false, false, false);

export const mockRBACData: RolePermissions[] = [
  {
    role: 'super admin',
    bagian: 'super admin',
    permissions: [
      // This role will be handled specially in the filter
      // to grant access to all routes
      fullAccess('*'),
    ],
  },
  {
    role: 'developer',
    bagian: 'developer',
    permissions: [
      // This role will be handled specially in the filter
      // to grant access to all routes
      fullAccess('*'),
    ],
  },
  // ============================================
  // MAINTENANCE DEPARTMENT
  // ============================================

  // Maintenance - Section Head
  {
    role: 'section head',
    bagian: 'maintenance',
    permissions: [
      // Dashboard
      fullAccess('/dashboard'),
      fullAccess('/dashboard/maintenance'),

      // Corrective Maintenance
      fullAccess('/maintenance/corrective'),

      // Preventive Maintenance
      fullAccess('/maintenance/preventive/pm1'),
      fullAccess('/maintenance/preventive/pm2'),
      fullAccess('/maintenance/preventive/pm3'),
      fullAccess('/maintenance/preventive/os3'),
      fullAccess('/maintenance/preventive/history'),

      // Outstanding
      fullAccess('/maintenance/outstanding'),

      // Absensi
      fullAccess('/maintenance/absensi'),

      // Sparepart
      fullAccess('/maintenance/sparepart/opname/adjustment'),
      fullAccess('/maintenance/sparepart/stock-master'),
      fullAccess('/maintenance/sparepart/monitoring'),
      fullAccess('/maintenance/sparepart/monitoring-service'),

      // Project
      fullAccess('/maintenance/project'),

      // Recap
      fullAccess('/maintenance/recap'),

      // KPI
      fullAccess('/maintenance/kpi'),
      fullAccess('/maintenance/kpi/form'),
      fullAccess('/maintenance/kpi/input'),

      // Report
      fullAccess('/maintenance/report/ncr'),
      fullAccess('/maintenance/report/capa'),

      // SPB
      fullAccess('/maintenance/spb'),

      // Submission to HR
      fullAccess('/maintenance/submission'),
      fullAccess('/maintenance/submission/history'),
      fullAccess('/maintenance/submission/position'),
      fullAccess('/maintenance/submission/position/history'),

      // Master Data - Maintenance
      fullAccess('/master/maintenance/machine'),
      fullAccess('/master/maintenance/user'),
      fullAccess('/master/maintenance/role'),
      fullAccess('/master/maintenance/sparepart'),
      fullAccess('/master/maintenance/analysis'),
      fullAccess('/master/maintenance/monitoring'),
      fullAccess('/master/maintenance/pm1'),
      fullAccess('/master/maintenance/pm2'),
      fullAccess('/master/maintenance/pm3'),
      fullAccess('/master/maintenance/kpi'),
      fullAccess('/master/maintenance/grade'),
      fullAccess('/master/maintenance/skor-mtc'),
    ],
  },

  // Maintenance - Supervisor
  {
    role: 'supervisor',
    bagian: 'maintenance',
    permissions: [
      // Dashboard
      fullAccess('/dashboard/maintenance'),
      noAccess('/dashboard'),

      // Corrective Maintenance
      fullAccess('/maintenance/corrective'),

      // Preventive Maintenance
      fullAccess('/maintenance/preventive/pm1'),
      fullAccess('/maintenance/preventive/pm2'),
      fullAccess('/maintenance/preventive/pm3'),
      fullAccess('/maintenance/preventive/os3'),
      fullAccess('/maintenance/preventive/history'),

      // Outstanding
      fullAccess('/maintenance/outstanding'),

      // Absensi
      fullAccess('/maintenance/absensi'),

      //   // Sparepart
      //   fullAccess('/maintenance/sparepart/opname/adjustment'),
      //   fullAccess('/maintenance/sparepart/stock-master'),
      //   fullAccess('/maintenance/sparepart/monitoring'),
      //   fullAccess('/maintenance/sparepart/monitoring-service'),

      //   // Project
      //   fullAccess('/maintenance/project'),

      // Recap
      readOnly('/maintenance/recap'),

      //   // KPI
      //   fullAccess('/maintenance/kpi'),
      //   fullAccess('/maintenance/kpi/form'),
      //   fullAccess('/maintenance/kpi/input'),

      // Report
      fullAccess('/maintenance/report/ncr'),
      fullAccess('/maintenance/report/capa'),

      //   // SPB
      //   fullAccess('/maintenance/spb'),

      // Submission to HR
      fullAccess('/maintenance/submission'),
      fullAccess('/maintenance/submission/history'),
      fullAccess('/maintenance/submission/position'),
      fullAccess('/maintenance/submission/position/history'),

      //   // Master Data - Maintenance
      //   fullAccess('/master/maintenance/machine'),
      //   fullAccess('/master/maintenance/user'),
      //   fullAccess('/master/maintenance/role'),
      //   fullAccess('/master/maintenance/sparepart'),
      //   fullAccess('/master/maintenance/analysis'),
      //   fullAccess('/master/maintenance/monitoring'),
      //   fullAccess('/master/maintenance/pm1'),
      //   fullAccess('/master/maintenance/pm2'),
      //   fullAccess('/master/maintenance/pm3'),
      //   fullAccess('/master/maintenance/kpi'),
      //   fullAccess('/master/maintenance/grade'),
    ],
  },

  // Maintenance - Admin
  {
    role: 'admin',
    bagian: 'maintenance',
    permissions: [
      // Dashboard
      fullAccess('/dashboard/maintenance'),
      noAccess('/dashboard'),

      // Corrective Maintenance
      fullAccess('/maintenance/corrective'),

      // Preventive Maintenance
      fullAccess('/maintenance/preventive/pm1'),
      fullAccess('/maintenance/preventive/pm2'),
      fullAccess('/maintenance/preventive/pm3'),
      fullAccess('/maintenance/preventive/os3'),
      readOnly('/maintenance/preventive/history'),

      // Outstanding
      readOnly('/maintenance/outstanding'),

      // Absensi
      fullAccess('/maintenance/absensi'),

      // Sparepart
      fullAccess('/maintenance/sparepart/opname/adjustment'),
      fullAccess('/maintenance/sparepart/stock-master'),
      readOnly('/maintenance/sparepart/monitoring'),
      readOnly('/maintenance/sparepart/monitoring-service'),

      // Project
      createPermission('/maintenance/project', true, true, true, false),

      // Recap
      readOnly('/maintenance/recap'),

      // KPI
      readOnly('/maintenance/kpi'),
      fullAccess('/maintenance/kpi/form'),
      fullAccess('/maintenance/kpi/input'),

      // Report
      readOnly('/maintenance/report/ncr'),
      readOnly('/maintenance/report/capa'),

      // SPB
      fullAccess('/maintenance/spb'),

      // Submission to HR
      fullAccess('/maintenance/submission'),
      readOnly('/maintenance/submission/history'),
      fullAccess('/maintenance/submission/position'),
      readOnly('/maintenance/submission/position/history'),

      // Master Data - Maintenance
      fullAccess('/master/maintenance/machine'),
      createPermission('/master/maintenance/user', true, true, true, false),
      noAccess('/master/maintenance/role'),
      fullAccess('/master/maintenance/sparepart'),
      fullAccess('/master/maintenance/analysis'),
      fullAccess('/master/maintenance/monitoring'),
      fullAccess('/master/maintenance/pm1'),
      fullAccess('/master/maintenance/pm2'),
      fullAccess('/master/maintenance/pm3'),
      createPermission('/master/maintenance/kpi', true, false, true, false),
      noAccess('/master/maintenance/grade'),
      fullAccess('/master/maintenance/skor-mtc'),
    ],
  },

  // Maintenance - Senior Technician
  {
    role: 'senior technician',
    bagian: 'maintenance',
    permissions: [
      // Dashboard
      fullAccess('/dashboard/maintenance'),

      // Corrective Maintenance
      fullAccess('/maintenance/corrective'),

      // Preventive Maintenance
      fullAccess('/maintenance/preventive/pm1'),
      fullAccess('/maintenance/preventive/pm2'),
      fullAccess('/maintenance/preventive/pm3'),
      fullAccess('/maintenance/preventive/os3'),
      readOnly('/maintenance/preventive/history'),

      // SPB
      createPermission('/maintenance/spb', true, true, false, false),
    ],
  },

  // Maintenance - Shift Technician
  {
    role: 'shift technician',
    bagian: 'maintenance',
    permissions: [
      // Dashboard
      readOnly('/dashboard/maintenance'),

      // Corrective Maintenance
      createPermission('/maintenance/corrective', true, true, false, false),

      // Preventive Maintenance
      createPermission('/maintenance/preventive/pm1', true, true, false, false),
      createPermission('/maintenance/preventive/pm2', true, true, false, false),
      createPermission('/maintenance/preventive/pm3', true, true, false, false),
      readOnly('/maintenance/preventive/os3'),
      readOnly('/maintenance/preventive/history'),

      // SPB
      createPermission('/maintenance/spb', true, true, false, false),
    ],
  },

  // Maintenance - Junior Technician
  {
    role: 'junior technician',
    bagian: 'maintenance',
    permissions: [
      // Dashboard
      readOnly('/dashboard/maintenance'),

      // Corrective Maintenance
      createPermission('/maintenance/corrective', true, true, false, false),

      // Preventive Maintenance
      createPermission('/maintenance/preventive/pm1', true, true, false, false),
      createPermission('/maintenance/preventive/pm2', true, true, false, false),
      readOnly('/maintenance/preventive/pm3'),
      readOnly('/maintenance/preventive/os3'),
      readOnly('/maintenance/preventive/history'),

      // SPB
      createPermission('/maintenance/spb', true, true, false, false),
    ],
  },

  // ============================================
  // QUALITY CONTROL DEPARTMENT
  // ============================================

  // QC - Section Head
  {
    role: 'section head',
    bagian: 'quality control',
    permissions: [
      // Dashboard
      fullAccess('/dashboard'),

      // QC Menu
      fullAccess('/qc/validate-verify'),
      fullAccess('/qc/inspection'),
      fullAccess('/qc/kalibrasi'),
      fullAccess('/qc/kabag-approval'),
      fullAccess('/qc/outstanding'),
      fullAccess('/qc/recap'),

      // QMS
      fullAccess('/qc/qms/ncr'),
      fullAccess('/qc/qms/capa'),

      // Report
      fullAccess('/qc/report/ncr'),
      fullAccess('/qc/report/capa'),

      // Absensi
      fullAccess('/qc/absensi'),

      // Submission to HR
      fullAccess('/qc/submission'),
      fullAccess('/qc/submission/history'),
      fullAccess('/qc/submission/position'),
      fullAccess('/qc/submission/position/history'),

      // Master Data - QC
      fullAccess('/master/qc/defect'),
      fullAccess('/master/qc/document'),
      fullAccess('/master/qc/final-inspection'),
      fullAccess('/master/qc/user'),
      fullAccess('/master/qc/outsourcing-bj'),
      fullAccess('/master/qc/kalibrasi'),
    ],
  },

  // QC - Inspector
  {
    role: 'inspector',
    bagian: 'quality control',
    permissions: [
      // Dashboard
      readOnly('/dashboard'),

      // QC Menu
      fullAccess('/qc/validate-verify'),
      fullAccess('/qc/inspection'),
      readOnly('/qc/kalibrasi'),
      readOnly('/qc/kabag-approval'),
      readOnly('/qc/outstanding'),

      // No access to QMS, Report, Absensi
      noAccess('/qc/qms/ncr'),
      noAccess('/qc/qms/capa'),
      noAccess('/qc/report/ncr'),
      noAccess('/qc/report/capa'),
      noAccess('/qc/absensi'),

      // Submission to HR - Limited
      createPermission('/qc/submission', true, true, false, false),
      noAccess('/qc/submission/history'),
      createPermission('/qc/submission/position', true, true, false, false),
      noAccess('/qc/submission/position/history'),
    ],
  },

  // QC - Admin
  {
    role: 'admin',
    bagian: 'quality control',
    permissions: [
      // Dashboard
      readOnly('/dashboard'),

      // QC Menu
      fullAccess('/qc/validate-verify'),
      fullAccess('/qc/inspection'),
      fullAccess('/qc/kalibrasi'),
      createPermission('/qc/kabag-approval', true, false, false, false),
      readOnly('/qc/outstanding'),
      readOnly('/qc/recap'),

      // QMS
      fullAccess('/qc/qms/ncr'),
      fullAccess('/qc/qms/capa'),

      // Report
      readOnly('/qc/report/ncr'),
      readOnly('/qc/report/capa'),

      // Absensi
      fullAccess('/qc/absensi'),

      // Submission to HR
      fullAccess('/qc/submission'),
      readOnly('/qc/submission/history'),
      fullAccess('/qc/submission/position'),
      readOnly('/qc/submission/position/history'),

      // Master Data - QC
      fullAccess('/master/qc/defect'),
      fullAccess('/master/qc/document'),
      fullAccess('/master/qc/final-inspection'),
      createPermission('/master/qc/user', true, true, true, false),
      fullAccess('/master/qc/outsourcing-bj'),
      fullAccess('/master/qc/kalibrasi'),
    ],
  },

  // ============================================
  // HR DEPARTMENT
  // ============================================

  // HR - Section Head
  {
    role: 'section head',
    bagian: 'hr',
    permissions: [
      // Dashboard
      fullAccess('/dashboard'),

      // Personnel Management
      fullAccess('/hr/personnel/company'),
      fullAccess('/hr/personnel/employee'),
      fullAccess('/hr/personnel/work-calendar'),
      fullAccess('/hr/personnel/absensi'),

      // Payroll
      fullAccess('/hr/payroll'),
      fullAccess('/hr/payroll/monthly'),
      fullAccess('/hr/payroll/approval'),

      // Submission
      fullAccess('/hr/submission'),
      fullAccess('/hr/submission/history'),
      fullAccess('/hr/submission/position'),
      fullAccess('/hr/submission/position/history'),

      // Response
      fullAccess('/hr/response'),
      fullAccess('/hr/response/history'),
      fullAccess('/hr/response/position'),
      fullAccess('/hr/response/position/history'),

      // Recap & Outstanding
      fullAccess('/hr/recap'),
      fullAccess('/hr/outstanding'),

      // Report
      fullAccess('/hr/report/ncr'),
      fullAccess('/hr/report/capa'),

      // Master Data - HR
      fullAccess('/master/hr/shift'),
      fullAccess('/master/hr/sp-teguran'),
      fullAccess('/master/hr/setting'),
      fullAccess('/master/hr/user'),
      fullAccess('/master/hr/department'),
      fullAccess('/master/hr/cuti-khusus'),
      fullAccess('/master/hr/grade'),
      fullAccess('/master/hr/payroll'),
    ],
  },

  // HR - Payroll
  {
    role: 'payroll',
    bagian: 'hr',
    permissions: [
      // No Dashboard access
      noAccess('/dashboard'),

      // No Personnel Management
      noAccess('/hr/personnel/company'),
      noAccess('/hr/personnel/employee'),
      noAccess('/hr/personnel/work-calendar'),
      noAccess('/hr/personnel/absensi'),

      // Payroll only
      fullAccess('/hr/payroll'),
      fullAccess('/hr/payroll/monthly'),
      createPermission('/hr/payroll/approval', true, false, false, false),

      // No other HR features
      noAccess('/hr/submission'),
      noAccess('/hr/submission/history'),
      noAccess('/hr/submission/position'),
      noAccess('/hr/submission/position/history'),
      noAccess('/hr/response'),
      noAccess('/hr/response/history'),
      noAccess('/hr/response/position'),
      noAccess('/hr/response/position/history'),
      noAccess('/hr/recap'),
      noAccess('/hr/outstanding'),
      noAccess('/hr/report/ncr'),
      noAccess('/hr/report/capa'),

      // Master Data - HR Limited
      noAccess('/master/hr/shift'),
      noAccess('/master/hr/sp-teguran'),
      noAccess('/master/hr/setting'),
      noAccess('/master/hr/user'),
      noAccess('/master/hr/department'),
      noAccess('/master/hr/cuti-khusus'),
      readOnly('/master/hr/grade'),
      readOnly('/master/hr/payroll'),
    ],
  },

  // HR - Admin
  {
    role: 'admin',
    bagian: 'hr',
    permissions: [
      // Dashboard
      readOnly('/dashboard'),

      // Personnel Management
      fullAccess('/hr/personnel/company'),
      fullAccess('/hr/personnel/employee'),
      fullAccess('/hr/personnel/work-calendar'),
      fullAccess('/hr/personnel/absensi'),

      // Payroll
      createPermission('/hr/payroll', true, true, true, false),
      createPermission('/hr/payroll/monthly', true, true, true, false),
      noAccess('/hr/payroll/approval'),

      // Submission
      fullAccess('/hr/submission'),
      readOnly('/hr/submission/history'),
      fullAccess('/hr/submission/position'),
      readOnly('/hr/submission/position/history'),

      // Response
      fullAccess('/hr/response'),
      readOnly('/hr/response/history'),
      fullAccess('/hr/response/position'),
      readOnly('/hr/response/position/history'),

      // Recap & Outstanding
      readOnly('/hr/recap'),
      readOnly('/hr/outstanding'),

      // Report
      readOnly('/hr/report/ncr'),
      readOnly('/hr/report/capa'),

      // Master Data - HR
      fullAccess('/master/hr/shift'),
      fullAccess('/master/hr/kendaraan'),
      fullAccess('/master/hr/sp-teguran'),
      createPermission('/master/hr/setting', true, false, true, false),
      createPermission('/master/hr/user', true, true, true, false),
      fullAccess('/master/hr/department'),
      fullAccess('/master/hr/cuti-khusus'),
      createPermission('/master/hr/grade', true, false, true, false),
      createPermission('/master/hr/payroll', true, false, true, false),
    ],
  },

  // ============================================
  // PPIC DEPARTMENT
  // ============================================

  // PPIC - Section Head
  {
    role: 'section head',
    bagian: 'ppic',
    permissions: [
      // Dashboard
      fullAccess('/dashboard'),

      // PPIC Menu
      fullAccess('/ppic/production-schedule'),
      fullAccess('/ppic/scheduled-jo'),
      fullAccess('/ppic/delivery-schedule'),
      fullAccess('/ppic/outstanding'),
      fullAccess('/ppic/recap'),

      // BOM
      fullAccess('/ppic/bom/create'),
      fullAccess('/ppic/bom/approval'),

      // BOM PPIC
      fullAccess('/ppic/bom-ppic/create'),

      // JO
      fullAccess('/ppic/jo/create'),
      fullAccess('/ppic/jo/approval'),
      fullAccess('/ppic/jo/history'),

      // Submission to HR
      fullAccess('/ppic/submission'),
      fullAccess('/ppic/submission/history'),
      fullAccess('/ppic/submission/position'),
      fullAccess('/ppic/submission/position/history'),

      // Master Data - PPIC
      fullAccess('/master/ppic/schedule'),
      fullAccess('/master/ppic/fleet-capacity'),
    ],
  },

  // PPIC - Admin
  {
    role: 'admin',
    bagian: 'ppic',
    permissions: [
      // Dashboard
      readOnly('/dashboard'),

      // PPIC Menu
      fullAccess('/ppic/production-schedule'),
      fullAccess('/ppic/scheduled-jo'),
      fullAccess('/ppic/delivery-schedule'),
      readOnly('/ppic/outstanding'),
      readOnly('/ppic/recap'),

      // BOM
      fullAccess('/ppic/bom/create'),
      createPermission('/ppic/bom/approval', true, false, false, false),

      // BOM PPIC
      fullAccess('/ppic/bom-ppic/create'),

      // JO
      fullAccess('/ppic/jo/create'),
      createPermission('/ppic/jo/approval', true, false, false, false),
      readOnly('/ppic/jo/history'),

      // Submission to HR
      fullAccess('/ppic/submission'),
      readOnly('/ppic/submission/history'),
      fullAccess('/ppic/submission/position'),
      readOnly('/ppic/submission/position/history'),

      // Master Data - PPIC
      fullAccess('/master/ppic/schedule'),
      fullAccess('/master/ppic/fleet-capacity'),
    ],
  },

  // ============================================
  // PRODUCTION DEPARTMENT
  // ============================================

  // Production - Section Head
  {
    role: 'section head',
    bagian: 'produksi',
    permissions: [
      // Dashboard
      fullAccess('/dashboard'),

      // Production Menu
      fullAccess('/production/input-lkh'),
      fullAccess('/production/monitoring-lkh'),
      fullAccess('/production/approve-lkh'),
      fullAccess('/production/alldata-lkh'),
      fullAccess('/production/list-jo-selesai'),
      fullAccess('/production/buka-lkh'),
      fullAccess('/production/breakdown-recap'),
      fullAccess('/production/waste-report'),
      fullAccess('/production/os2'),
      fullAccess('/production/absensi'),

      // Submission to HR
      fullAccess('/production/submission'),
      fullAccess('/production/submission/history'),
      fullAccess('/production/submission/position'),
      fullAccess('/production/submission/position/history'),

      // Master Data - Production
      fullAccess('/master/produksi/kategori-kendala'),
      fullAccess('/master/produksi/kriteria-kendala'),
      fullAccess('/master/produksi/kode-produksi'),
    ],
  },

  // Production - Supervisor
  {
    role: 'supervisor',
    bagian: 'produksi',
    permissions: [
      // Dashboard
      readOnly('/dashboard'),

      // Production Menu
      fullAccess('/production/input-lkh'),
      fullAccess('/production/monitoring-lkh'),
      fullAccess('/production/approve-lkh'),
      fullAccess('/production/buka-lkh'),
      fullAccess('/production/alldata-lkh'),
      readOnly('/production/breakdown-recap'),
      fullAccess('/production/waste-report'),
      fullAccess('/production/os2'),
      fullAccess('/production/absensi'),

      // Submission to HR
      fullAccess('/production/submission'),
      readOnly('/production/submission/history'),
      fullAccess('/production/submission/position'),
      readOnly('/production/submission/position/history'),

      // Master Data - Production
      fullAccess('/master/produksi/kategori-kendala'),
      fullAccess('/master/produksi/kriteria-kendala'),
      fullAccess('/master/produksi/kode-produksi'),
    ],
  },

  // Production - Admin
  {
    role: 'admin',
    bagian: 'produksi',
    permissions: [
      // Dashboard
      readOnly('/dashboard'),

      // Production Menu
      fullAccess('/production/input-lkh'),
      readOnly('/production/monitoring-lkh'),
      fullAccess('/production/buka-lkh'),
      createPermission('/production/approve-lkh', true, false, false, false),
      readOnly('/production/breakdown-recap'),
      fullAccess('/production/alldata-lkh'),
      createPermission('/production/waste-report', true, true, false, false),
      fullAccess('/production/os2'),
      fullAccess('/production/absensi'),

      // Submission to HR
      fullAccess('/production/submission'),
      readOnly('/production/submission/history'),
      fullAccess('/production/submission/position'),
      readOnly('/production/submission/position/history'),

      // Master Data - Production
      fullAccess('/master/produksi/kategori-kendala'),
      fullAccess('/master/produksi/kriteria-kendala'),
      fullAccess('/master/produksi/kode-produksi'),
    ],
  },

  // ============================================
  // MARKETING DEPARTMENT
  // ============================================

  // Marketing - Admin
  {
    role: 'admin',
    bagian: 'marketing',
    permissions: [
      // Dashboard
      readOnly('/dashboard'),

      // Marketing Menu - Calculation
      fullAccess('/marketing/calculation/create'),
      readOnly('/marketing/calculation/history'),

      // Kabag Approval
      createPermission(
        '/marketing/kabag-approval/list',
        true,
        false,
        false,
        false,
      ),
      readOnly('/marketing/kabag-approval/history'),

      // OKP
      fullAccess('/marketing/okp/create'),
      readOnly('/marketing/okp/history'),

      // IO
      fullAccess('/marketing/io/create'),
      fullAccess('/marketing/io/npd'),
      readOnly('/marketing/io/history'),

      // SO
      fullAccess('/marketing/so/create'),
      readOnly('/marketing/so/history'),

      // Master Data - Marketing
      fullAccess('/master/marketing/marketing'),
      fullAccess('/master/marketing/customer'),
      fullAccess('/master/marketing/brand'),
      fullAccess('/master/marketing/delivery'),
      fullAccess('/master/marketing/product'),
      fullAccess('/master/marketing/unit'),
      fullAccess('/master/marketing/item'),
      fullAccess('/master/marketing/machine-stage'),
      fullAccess('/master/marketing/stage'),
      fullAccess('/master/marketing/stage-machine'),
    ],
  },
  {
    role: 'supervisor',
    bagian: 'marketing',
    permissions: [
      // Dashboard
      readOnly('/dashboard'),

      // Marketing Menu - Calculation
      fullAccess('/marketing/calculation/create'),
      readOnly('/marketing/calculation/history'),

      // Kabag Approval
      createPermission(
        '/marketing/kabag-approval/list',
        true,
        false,
        false,
        false,
      ),
      readOnly('/marketing/kabag-approval/history'),

      // OKP
      fullAccess('/marketing/okp/create'),
      readOnly('/marketing/okp/history'),

      // IO
      fullAccess('/marketing/io/create'),
      fullAccess('/marketing/io/npd'),
      readOnly('/marketing/io/history'),

      // SO
      fullAccess('/marketing/so/create'),
      readOnly('/marketing/so/history'),

      // Master Data - Marketing
      fullAccess('/master/marketing/marketing'),
      fullAccess('/master/marketing/customer'),
      fullAccess('/master/marketing/brand'),
      fullAccess('/master/marketing/delivery'),
      fullAccess('/master/marketing/product'),
      fullAccess('/master/marketing/unit'),
      fullAccess('/master/marketing/item'),
      fullAccess('/master/marketing/machine-stage'),
      fullAccess('/master/marketing/stage'),
      fullAccess('/master/marketing/stage-machine'),
    ],
  },
  {
    role: 'section head',
    bagian: 'marketing',
    permissions: [
      // Dashboard
      readOnly('/dashboard'),

      // Marketing Menu - Calculation
      fullAccess('/marketing/calculation/create'),
      readOnly('/marketing/calculation/history'),

      // Kabag Approval
      createPermission(
        '/marketing/kabag-approval/list',
        true,
        false,
        false,
        false,
      ),
      readOnly('/marketing/kabag-approval/history'),

      // OKP
      fullAccess('/marketing/okp/create'),
      readOnly('/marketing/okp/history'),

      // IO
      fullAccess('/marketing/io/create'),
      fullAccess('/marketing/io/npd'),
      readOnly('/marketing/io/history'),

      // SO
      fullAccess('/marketing/so/create'),
      readOnly('/marketing/so/history'),

      // Master Data - Marketing
      fullAccess('/master/marketing/marketing'),
      fullAccess('/master/marketing/customer'),
      fullAccess('/master/marketing/brand'),
      fullAccess('/master/marketing/delivery'),
      fullAccess('/master/marketing/product'),
      fullAccess('/master/marketing/unit'),
      fullAccess('/master/marketing/item'),
      fullAccess('/master/marketing/machine-stage'),
      fullAccess('/master/marketing/stage'),
      fullAccess('/master/marketing/stage-machine'),
    ],
  },
  // ============================================
  // PRE-PRESS DEPARTMENT
  // ============================================

  // Pre-Press
  {
    role: 'pre_press',
    bagian: 'prepress',
    permissions: [
      // Dashboard
      noAccess('/dashboard'),

      // Pre-Press Menu
      fullAccess('/prepress'),
    ],
  },
  // Add these new role configurations to the mockRBACData array

  // ============================================
  // DELIVERY ORDER DEPARTMENT
  // ============================================

  // Delivery Order - Section Head
  {
    role: 'section head',
    bagian: 'delivery order',
    permissions: [
      // Dashboard
      fullAccess('/dashboard'),

      // Delivery Order Menu
      fullAccess('/do/list-do'),
      fullAccess('/do/konfirmasi-do'),

      // Submission to HR
      fullAccess('/do/submission'),
      fullAccess('/do/submission/history'),
      fullAccess('/do/submission/position'),
      fullAccess('/do/submission/position/history'),

      // Report
      fullAccess('/do/report/ncr'),
      fullAccess('/do/report/capa'),
    ],
  },

  // Delivery Order - Admin
  {
    role: 'admin',
    bagian: 'delivery order',
    permissions: [
      // Dashboard
      readOnly('/dashboard'),

      // Delivery Order Menu
      fullAccess('/do/list-do'),
      fullAccess('/do/konfirmasi-do'),

      // Submission to HR
      fullAccess('/do/submission'),
      readOnly('/do/submission/history'),
      fullAccess('/do/submission/position'),
      readOnly('/do/submission/position/history'),

      // Report
      readOnly('/do/report/ncr'),
      readOnly('/do/report/capa'),
    ],
  },

  // Delivery Order - Supervisor
  {
    role: 'supervisor',
    bagian: 'delivery order',
    permissions: [
      // Dashboard
      readOnly('/dashboard'),

      // Delivery Order Menu
      fullAccess('/do/list-do'),
      fullAccess('/do/konfirmasi-do'),

      // Submission to HR
      fullAccess('/do/submission'),
      readOnly('/do/submission/history'),
      fullAccess('/do/submission/position'),
      readOnly('/do/submission/position/history'),
    ],
  },

  // ============================================
  // ACCOUNTING DEPARTMENT
  // ============================================

  // Accounting - Section Head
  {
    role: 'section head',
    bagian: 'accounting',
    permissions: [
      // Dashboard
      fullAccess('/dashboard'),

      // Accounting Menu
      fullAccess('/accounting/list-outstanding'),
      fullAccess('/accounting/list-request-invoice'),
      fullAccess('/accounting/list-approval-invoice'),
      fullAccess('/accounting/list-approval-perubahan'),
      fullAccess('/accounting/list-invoice'),
      fullAccess('/accounting/list-retur'),
      fullAccess('/accounting/deposit'),

      // Approval
      fullAccess('/accounting/approval/deposit'),
      fullAccess('/accounting/approval/deposit-history'),

      // Submission to HR
      fullAccess('/accounting/submission'),
      fullAccess('/accounting/submission/history'),
      fullAccess('/accounting/submission/position'),
      fullAccess('/accounting/submission/position/history'),

      // Report
      fullAccess('/accounting/report/ncr'),
      fullAccess('/accounting/report/capa'),

      // Master Data - Accounting (if any)
      fullAccess('/master/accounting/chart-of-accounts'),
      fullAccess('/master/accounting/user'),
    ],
  },

  // Accounting - Admin
  {
    role: 'admin',
    bagian: 'accounting',
    permissions: [
      // Dashboard
      readOnly('/dashboard'),

      // Accounting Menu
      fullAccess('/accounting/list-outstanding'),
      fullAccess('/accounting/list-request-invoice'),
      fullAccess('/accounting/list-approval-invoice'),
      fullAccess('/accounting/list-approval-perubahan'),
      fullAccess('/accounting/list-invoice'),
      fullAccess('/accounting/list-retur'),
      fullAccess('/accounting/deposit'),

      // Approval - Limited
      createPermission(
        '/accounting/approval/deposit',
        true,
        true,
        false,
        false,
      ),
      readOnly('/accounting/approval/deposit-history'),

      // Submission to HR
      fullAccess('/accounting/submission'),
      readOnly('/accounting/submission/history'),
      fullAccess('/accounting/submission/position'),
      readOnly('/accounting/submission/position/history'),

      // Report
      readOnly('/accounting/report/ncr'),
      readOnly('/accounting/report/capa'),

      // Master Data - Accounting (if any)
      createPermission(
        '/master/accounting/chart-of-accounts',
        true,
        true,
        true,
        false,
      ),
      createPermission('/master/accounting/user', true, true, true, false),
    ],
  },

  // Accounting - Supervisor
  {
    role: 'supervisor',
    bagian: 'accounting',
    permissions: [
      // Dashboard
      readOnly('/dashboard'),

      // Accounting Menu
      fullAccess('/accounting/list-outstanding'),
      fullAccess('/accounting/list-request-invoice'),
      fullAccess('/accounting/list-approval-invoice'),
      fullAccess('/accounting/list-approval-perubahan'),
      readOnly('/accounting/list-invoice'),
      fullAccess('/accounting/list-retur'),
      fullAccess('/accounting/deposit'),

      // Approval
      fullAccess('/accounting/approval/deposit'),
      readOnly('/accounting/approval/deposit-history'),

      // Submission to HR
      fullAccess('/accounting/submission'),
      readOnly('/accounting/submission/history'),
      fullAccess('/accounting/submission/position'),
      readOnly('/accounting/submission/position/history'),

      // Report
      readOnly('/accounting/report/ncr'),
      readOnly('/accounting/report/capa'),
    ],
  },
];

export const getPermissionsForRole = (
  role: string,
  bagian: string,
): RoutePermission[] => {
  const normalizedRole = role?.toLowerCase();
  const normalizedBagian = bagian?.toLowerCase();

  // Super Admin and Developer have access to everything
  if (normalizedRole === 'super admin' || normalizedRole === 'developer') {
    return [
      {
        path: '*',
        access: true,
        create: true,
        edit: true,
        delete: true,
      },
    ];
  }

  const rolePermissions = mockRBACData.find(
    (rp) =>
      rp.role.toLowerCase() === normalizedRole &&
      rp.bagian.toLowerCase() === normalizedBagian,
  );

  return rolePermissions?.permissions || [];
};

export const hasAccessToPath = (
  role: string,
  bagian: string,
  path: string,
): boolean => {
  const normalizedRole = role?.toLowerCase();

  // Super Admin and Developer have access to everything
  if (normalizedRole === 'super admin' || normalizedRole === 'developer') {
    return true;
  }

  const permissions = getPermissionsForRole(role, bagian);
  const permission = permissions.find((p) => p.path === path);
  return permission?.access || false;
};

export const canCreate = (
  role: string,
  bagian: string,
  path: string,
): boolean => {
  const normalizedRole = role?.toLowerCase();

  if (normalizedRole === 'super admin' || normalizedRole === 'developer') {
    return true;
  }

  const permissions = getPermissionsForRole(role, bagian);
  const permission = permissions.find((p) => p.path === path);
  return permission?.create || false;
};

export const canEdit = (
  role: string,
  bagian: string,
  path: string,
): boolean => {
  const normalizedRole = role?.toLowerCase();

  if (normalizedRole === 'super admin' || normalizedRole === 'developer') {
    return true;
  }

  const permissions = getPermissionsForRole(role, bagian);
  const permission = permissions.find((p) => p.path === path);
  return permission?.edit || false;
};

export const canDelete = (
  role: string,
  bagian: string,
  path: string,
): boolean => {
  const normalizedRole = role?.toLowerCase();

  if (normalizedRole === 'super admin' || normalizedRole === 'developer') {
    return true;
  }

  const permissions = getPermissionsForRole(role, bagian);
  const permission = permissions.find((p) => p.path === path);
  return permission?.delete || false;
};
// Get all accessible paths for a role
export const getAccessiblePaths = (role: string, bagian: string): string[] => {
  const permissions = getPermissionsForRole(role, bagian);
  return permissions.filter((p) => p.access).map((p) => p.path);
};
