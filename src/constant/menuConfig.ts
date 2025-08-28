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
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'dashboard',
      },
      {
        name: 'Maintenance Dashboard',
        path: '/maintenance/DashboardMaintenance',
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
        path: '/maintenance/machine',
        icon: 'machine',
      },
      {
        name: 'Preventive Maintenance (PM)',
        path: '/maintenance/inspection',
        icon: 'preventive',
        children: [
          {
            name: 'PM1',
            path: '/maintenance/inspection/pm_1',
            icon: 'preventive',
          },
          {
            name: 'PM2',
            path: '/maintenance/inspection/pm_2',
            icon: 'preventive',
          },
          {
            name: 'PM3',
            path: '/maintenance/inspection/pm_3',
            icon: 'preventive',
          },
          {
            name: 'OS3',
            path: '/maintenance/inspection/OS_3',
            icon: 'preventive',
          },
          {
            name: 'Inspection History',
            path: '/maintenance/inspection/histori',
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
        name: 'Maintenance Absensi',
        path: '/maintenance/absensi',
        icon: 'attendance',
      },
      {
        name: 'Sparepart',
        path: '/maintenance/sparepart',
        icon: 'sparepart',
        children: [
          {
            name: 'Opname Adjustment',
            path: '/maintenance/sparepart/opname/adjustment',
            icon: 'adjustment',
          },
          {
            name: 'Stock Master',
            path: '/maintenance/sparepart/stockmaster_sparepart',
            icon: 'stock',
          },
          {
            name: 'Monitoring Sparepart',
            path: '/maintenance/sparepart/monitoringSparepart',
            icon: 'monitoring',
          },
          {
            name: ' Monitoring Service',
            path: '/maintenance/sparepart/monitoringService',
            icon: 'monitoring',
          },
        ],
      },
      {
        name: 'Project MTC',
        path: '/maintenance/projectMtc',
        icon: 'project',
      },
      { name: 'Rekap', path: '/maintenance/recap', icon: 'recap' },
      {
        name: 'KPI',
        path: '/maintenance/KPI',
        icon: 'kpi',
        children: [
          {
            name: 'KPI Dashboard',
            path: '/maintenance/KPI',
            icon: 'dashboard',
          },
          { name: 'KPI Form', path: '/maintenance/KPIForm', icon: 'form' },
          {
            name: 'KPI Input',
            path: '/maintenance/KPI/Form/Input',
            icon: 'input',
          },
        ],
      },
      {
        name: 'Lapor',
        path: '/maintenance/lapor/ncr',
        icon: 'ncr',
        children: [
          { name: 'NCR ', path: '/maintenance/lapor/ncr', icon: 'ncr' },
          {
            name: 'CAPA ',
            path: '/maintenance/lapor/capa',
            icon: 'capa',
          },
        ],
      },
      { name: 'SPB', path: '/maintenance/spb', icon: 'service' },
      {
        name: 'Pengajuan Ke HR',
        path: '/pengajuanallkehr',
        icon: 'document',
        children: [
          {
            name: 'Pengajuan ',
            path: '/pengajuanallkehr',
            icon: 'submition',
          },
          {
            name: 'History ',
            path: '/pengajuanallkehrhistory',
            icon: 'history',
          },
          {
            name: 'Pengajuan Jabatan',
            path: '/pengajuanJabatanallkehr',
            icon: 'submition',
          },
          {
            name: 'History Pengajuan Jabatan',
            path: '/pengajuanJabatanallkehrhistory',
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
        path: '/qc/validatenverify',
        icon: 'validation',
      },
      {
        name: 'Quality Inspection',
        path: '/qc/qualityinspection',
        icon: 'inspection',
      },
      {
        name: 'Kalibrasi Alat Ukur',
        path: '/qc/kalibrasi',
        icon: 'qms',
      },
      {
        name: 'QC Outstanding',
        path: '/qc/outstanding',
        icon: 'outstanding',
      },
      { name: 'QC Recap', path: '/qc/rekap', icon: 'recap' },
      {
        name: 'QMS',
        path: '/qc/qms',
        icon: 'qms',
        children: [
          { name: 'QMS NCR', path: '/qc/qms/ncr', icon: 'ncr' },
          { name: 'QMS CAPA', path: '/qc/qms/capa', icon: 'capa' },
        ],
      },
      {
        name: 'Lapor',
        path: '/qc/lapor',
        icon: 'qms',
        children: [
          { name: 'QC NCR Report', path: '/qc/lapor/ncr', icon: 'ncr' },
          { name: 'QC CAPA Report', path: '/qc/lapor/capa', icon: 'capa' },
        ],
      },
      { name: 'QC Absensi', path: '/qc/absensi', icon: 'attendance' },
      {
        name: 'Pengajuan Ke HR',
        path: '/pengajuanallkehr',
        icon: 'document',
        children: [
          {
            name: 'Pengajuan ',
            path: '/pengajuanallkehr',
            icon: 'submition',
          },
          {
            name: 'History ',
            path: '/pengajuanallkehrhistory',
            icon: 'history',
          },
          {
            name: 'Pengajuan Jabatan',
            path: '/pengajuanJabatanallkehr',
            icon: 'submition',
          },
          {
            name: 'History Pengajuan Jabatan',
            path: '/pengajuanJabatanallkehrhistory',
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
        path: '/mr/qms',
        icon: 'qms',
        children: [
          { name: 'QMS NCR', path: '/mr/qms/ncr', icon: 'ncr' },
          { name: 'QMS CAPA', path: '/mr/qms/capa', icon: 'capa' },
        ],
      },
      {
        name: 'Lapor',
        path: '/mr/lapor',
        icon: 'qms',
        children: [
          { name: 'MR NCR Report', path: '/mr/lapor/ncr', icon: 'ncr' },
          { name: 'MR CAPA Report', path: '/mr/lapor/capa', icon: 'capa' },
        ],
      },
    ],
  },
  {
    name: 'QC Master Data',
    icon: MasterDataIcon,
    items: [
      {
        name: 'Document Master',
        path: '/masterdata/nodoc',
        icon: 'document',
      },
      {
        name: 'Final Inspection Master',
        path: '/masterdata/finalinspection',
        icon: 'inspection',
      },
      { name: 'QC User Master', path: '/masterdata/users', icon: 'users' },
      {
        name: 'Outsourcing Barang Jadi Master',
        path: '/masterdata/outsourcing_bj',
        icon: 'outsourcing',
      },
      {
        name: 'Kalibrasi Master',
        path: '/masterdata/kalibrasimaster',
        icon: 'document',
      },
    ],
  },
  {
    name: 'Master Data',
    icon: MasterDataIcon,
    items: [
      {
        name: 'Machine Master',
        path: '/masterdata/machine',
        icon: 'machine',
      },
      { name: 'User Master', path: '/masterdata/masterUsers', icon: 'users' },
      { name: 'Role Master', path: '/masterdata/masterRole', icon: 'role' },
      {
        name: 'Sparepart Master',
        path: '/masterdata/mastersparepart',
        icon: 'sparepart',
      },
      {
        name: 'Analysis Master',
        path: '/masterdata/masteranalisis',
        icon: 'analysis',
      },
      {
        name: 'Monitoring Master',
        path: '/masterdata/mastermonitoring',
        icon: 'monitoring',
      },
      {
        name: 'PM1 Master',
        path: '/masterdata/masterpm1',
        icon: 'preventive',
      },
      {
        name: 'PM2 Master',
        path: '/masterdata/masterpm2',
        icon: 'preventive',
      },
      {
        name: 'PM3 Master',
        path: '/masterdata/masterpm3',
        icon: 'preventive',
      },
      { name: 'KPI Master', path: '/masterdata/masterkpi', icon: 'kpi' },
      { name: 'Grade Master', path: '/masterdata/grade', icon: 'grade' },
      {
        name: 'KPI Form Master',
        path: '/masterdata/masterkpi/form',
        icon: 'form',
      },
      { name: 'Access Master', path: '/masterHakAkses', icon: 'access' },
      { name: 'All User Master', path: '/masteruserall', icon: 'users' },
    ],
  },
  {
    name: 'Human Resources',
    icon: HRIcon,
    items: [
      {
        name: 'Personnel Management',
        path: '/hr/pm',
        icon: 'personnel',
        children: [
          {
            name: 'Master Perusahaan',
            path: '/hr/pm/masterperusahaan',
            icon: 'company',
          },
          {
            name: 'Master Karyawan',
            path: '/hr/pm/masterkaryawan',
            icon: 'employee',
          },
          {
            name: 'Kalender Kerja',
            path: '/hr/pm/kalenderKerja',
            icon: 'calendar',
          },
          { name: 'Absensi', path: '/hr/pm/absensi', icon: 'attendance' },
        ],
      },
      {
        name: 'Payroll',
        path: '/hr/payroll',
        icon: 'payroll',
        children: [
          { name: 'Payroll', path: '/hr/payroll', icon: 'payroll' },
          {
            name: 'Monthly Payroll',
            path: '/hr/payrollbulan',
            icon: 'payroll',
          },
          {
            name: 'Payroll Approval',
            path: '/hr/accpayroll',
            icon: 'approval',
          },
        ],
      },
      {
        name: 'Pengajuan',
        path: '/hr/pengajuan',
        icon: 'submission',
        children: [
          {
            name: 'Pengajuan',
            path: '/hr/pengajuan',
            icon: 'submission',
          },
          {
            name: 'Pengajuan Jabatan',
            path: '/hr/pengajuanJabatan',
            icon: 'position',
          },
          {
            name: 'Pengajuan History',
            path: '/hr/pengajuanhistory',
            icon: 'history',
          },
          {
            name: 'Pengajuan Jabatan History',
            path: '/hr/pengajuanJabatanHistory',
            icon: 'history',
          },
        ],
      },
      {
        name: 'Respon Pengajuan',
        path: '/hr/rp',
        icon: 'response',
        children: [
          {
            name: ' Pengajuan',
            path: '/hr/rp/respon',
            icon: 'response',
          },
          {
            name: ' Pengajuan History',
            path: '/hr/rp/history',
            icon: 'history',
          },
          {
            name: ' Pengajuan Jabatan',
            path: '/hr/rp/jabatan',
            icon: 'position',
          },
          {
            name: ' Pengajuan Jabatan History',
            path: '/hr/rp/jabatanHistory',
            icon: 'history',
          },
        ],
      },
      { name: 'Rekap HR', path: '/hr/rekap', icon: 'recap' },
      {
        name: 'HR Outstanding',
        path: '/hr/outstanding',
        icon: 'outstanding',
      },
      {
        name: 'Lapor',
        path: '/hr/lapor',
        icon: 'qms',
        children: [
          { name: 'HR NCR Report', path: '/hr/lapor/ncr', icon: 'ncr' },
          { name: 'HR CAPA Report', path: '/hr/lapor/capa', icon: 'capa' },
        ],
      },
    ],
  },
  {
    name: 'HR Master',
    icon: HRIcon,
    items: [
      { name: 'Shift Master', path: '/hr/master/shift', icon: 'shift' },
      {
        name: 'SP & Teguran Master',
        path: '/hr/master/spteguran',
        icon: 'warning',
      },
      {
        name: 'HR Settings Master',
        path: '/hr/master/setting',
        icon: 'settings',
      },
      { name: 'HR User Master', path: '/hr/master/users', icon: 'users' },
      {
        name: 'Department Master',
        path: '/hr/master/department',
        icon: 'department',
      },
      {
        name: 'Cuti Khusus Master',
        path: '/hr/master/cutikhusus',
        icon: 'leave',
      },
      { name: 'HR Grade Master', path: '/hr/master/grade', icon: 'grade' },
      {
        name: 'HR Payroll Master',
        path: '/hr/master/payroll',
        icon: 'payroll',
      },
    ],
  },
  {
    name: 'PPIC',
    icon: PPICIcon,
    items: [
      {
        name: 'Jadwal Produksi',
        path: '/ppic/jadwalProduksi',
        icon: 'schedule',
      },
      {
        name: 'Jo Terjadwal',
        path: '/ppic/joterjadwal',
        icon: 'schedule',
      },
      {
        name: 'Jadwal Kirim',
        path: '/ppic/jadwalKirim',
        icon: 'schedule',
      },
      {
        name: 'Master Kalkulasi',
        path: '/ppic/master/jadwal',
        icon: 'schedule',
      },
      {
        name: 'Master Kapasitas Armada',
        path: '/ppic/master/kapasitasArmada',
        icon: 'schedule',
      },
      {
        name: 'PPIC Outstanding',
        path: '/ppic/outstanding',
        icon: 'outstanding',
      },
      { name: 'Rekap PPIC', path: '/ppic/rekap', icon: 'recap' },
      { name: 'Laporan Waste', path: '/produksi/waste', icon: 'waste' },
      {
        name: 'Pengajuan Ke HR',
        path: '/pengajuanallkehr',
        icon: 'document',
        children: [
          {
            name: 'Pengajuan ',
            path: '/pengajuanallkehr',
            icon: 'submition',
          },
          {
            name: 'History ',
            path: '/pengajuanallkehrhistory',
            icon: 'history',
          },
          {
            name: 'Pengajuan Jabatan',
            path: '/pengajuanJabatanallkehr',
            icon: 'submition',
          },
          {
            name: 'History Pengajuan Jabatan',
            path: '/pengajuanJabatanallkehrhistory',
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
        name: 'Rekap Breakdown',
        path: '/master/marketing',
        icon: 'breakdown',
      },
      { name: 'Laporan Waste', path: '/produksi/waste', icon: 'waste' },
      { name: 'OS2', path: '/produksi/os2', icon: 'machine' },
    ],
  },
  {
    name: 'Marketing',
    icon: ProductionIcon,
    items: [
      {
        name: 'Kalkulasi',
        path: '/marketing/kalkulasi',
        icon: 'payroll',
      },
      {
        name: 'Master Marketing',
        path: '/master/marketing',
        icon: 'payroll',
      },
      {
        name: 'Master Customer',
        path: '/master/customer',
        icon: 'payroll',
      },
      {
        name: 'Master Brand',
        path: '/master/brand',
        icon: 'payroll',
      },
      {
        name: 'Master Pengiriman',
        path: '/master/pengiriman',
        icon: 'payroll',
      },
      {
        name: 'Master Produk',
        path: '/master/produk',
        icon: 'payroll',
      },
      {
        name: 'Master Unit',
        path: '/master/unit',
        icon: 'payroll',
      },
      {
        name: 'Master Barang',
        path: '/master/barang',
        icon: 'payroll',
      },
      {
        name: 'Master Mesin Tahapan',
        path: '/master/mesintahapan',
        icon: 'payroll',
      },
      {
        name: 'Master Tahapan',
        path: '/master/tahapan',
        icon: 'payroll',
      },
      {
        name: 'Master Tahapan Mesin',
        path: '/master/tahapanmesin',
        icon: 'payroll',
      },
    ],
  },
  {
    name: 'Pre-Press',
    icon: ProductionIcon,
    items: [{ name: 'Pre Press', path: '/prepress', icon: 'machine' }],
  },
  // ... continue with all other categories
];
