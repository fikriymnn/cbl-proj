import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import ECommerce from './pages/Dashboard/ECommerce';
import Login from './pages/Authentication/Login';
import Cobain from './pages/Cobain';
import ProtectedRoute from './components/Protectedroute';
import Machine from './pages/Maintenance/Machine';

import MaintenanceQC from './pages/QualityControl/validatenverify';
import HistoryMtc from './pages/History/Maintenance';

import MasterData from './pages/MasterData/MTC/Master';

import Dashboard from './pages/Maintenance/dashboard';
import Pm1Form from './pages/inspection/pm1/Pm1Form';
import Pm1 from './pages/inspection/pm1/Pm1';
import Pm2 from './pages/inspection/pm2/Pm2';
import Pm2Form from './pages/inspection/pm2/Pm2Form';
import Pm3Form from './pages/inspection/pm3/Pm3Form';

import KPI from './pages/Maintenance/KPI/KPI';
import MasterSparepart from './pages/MasterData/MTC/MasterSparepart';
import MasterAnalisis from './pages/MasterData/MTC/MasterAnalisis';
import MasterPM1 from './pages/MasterData/MTC/MasterPM1';
import MasterPM1Check from './pages/MasterData/MTC/MasterPM1Check';
import MasterPM1TambahInspection from './pages/MasterData/MTC/MasterPM1TambahInspection';
import Preventive from './pages/inspection/os3/Preventive';
import HistoriPage from './pages/inspection/histori/HistoriPage';
import KPIForm from './pages/Maintenance/KPI/KPIForm';
import KPIInput from './pages/Maintenance/KPI/KPIInput';
import MasterPM2 from './pages/MasterData/MTC/MasterPM2';

import MasterPM2Check from './pages/MasterData/MTC/MasterPM2Check';
import MasterPM2TambahInspection from './pages/MasterData/MTC/MasterPM2TambahInspection';
import MasterKPI from './pages/MasterData/MTC/MasterKPI';
import MasterKPIForm from './pages/MasterData/MTC/MasterKPIForm';

import MasterUsers from './pages/MasterData/MasterUsers';
import MasterRole from './pages/MasterData/MasterRole';
import Adjustment from './pages/sparepart/adjustment';
import MainOpname from './pages/sparepart/crumb/main';
import MasterMonitoring from './pages/MasterData/MTC/MasterMonitoring';
import SpbService from './pages/Maintenance/SPB/spbService';

import Stockmaster from './pages/sparepart/stockmaster/stockmaster';
import AddStock from './pages/sparepart/stockmaster/addStock';
import MonitoringSparepart from './pages/sparepart/monitoringSparepart/monitoringSparepart';
import AddStockLifetimes from './pages/sparepart/monitoringSparepart/addStock';
import SubmitOpname from './pages/sparepart/submitOpname';
import MonitoringService from './pages/sparepart/monitoringService/monitoringService';
import AddStockService from './pages/sparepart/monitoringService/addStock';
import Pm3page from './pages/inspection/pm3/Pm3page';
import Qualityinspection from './pages/QualityControl/QualityInspection';

import IncomingIns from './pages/QualityControl/Incoming/Incomingins';
import PotongBahanPage from './pages/QualityControl/Prosespotong/potongBahanpage';
import PotongJadiPage from './pages/QualityControl/Prosespotong/potongJadiPage';
import ProsesCetak from './pages/QualityControl/ProsesCetak/ProsesCetak';
import IncomingList from './pages/QualityControl/Incoming/DaftarIncoming';
import MasterPM3 from './pages/MasterData/MTC/MasterPM3';
import MasterPM3Check from './pages/MasterData/MTC/MasterPM3Check';
import MasterPM3TambahInspection from './pages/MasterData/MTC/MasterPM3TambahInspection';
import HistoryIns from './pages/QualityControl/Incoming/HistoryIns';
import PotongBahan1 from './pages/QualityControl/Prosespotong/PotongBahan1';
import PotongJadi1 from './pages/QualityControl/Prosespotong/PotongJadi1';
import ListBahan1 from './pages/QualityControl/Prosespotong/ListBahan';
import ListBahan2 from './pages/QualityControl/Prosespotong/ListBahan2';
import ListJadiItoh from './pages/QualityControl/Prosespotong/ListJadiItoh';
import ListJadiPolar from './pages/QualityControl/Prosespotong/ListJadiPolar';
import HistoryBahanItoh from './pages/QualityControl/Prosespotong/History/HistoryBahanItohpage';
import HistoryBahanPolar from './pages/QualityControl/Prosespotong/History/HistoryBahanPolarPage';
import HistoryJadiPolarPage from './pages/QualityControl/Prosespotong/History/HistoryJadiPolarPage';
import HistoryJadiItohPage from './pages/QualityControl/Prosespotong/History/HistoryJadiItohPage';
import JenisCetak from './pages/QualityControl/ProsesCetak/JenisCetak';
import CetakAwal from './pages/QualityControl/ProsesCetak/CetakAwal';
import ProsesPond from './pages/QualityControl/ProsesPond/ProsesPond';
import JenisPond from './pages/QualityControl/ProsesPond/JenisPond';
import PondAwal from './pages/QualityControl/ProsesPond/PondAwal';
import ProfilSetting from './pages/profilSetting';
import ProsesCoating from './pages/QualityControl/ProsesCoating/ProsesCoating';
import JenisCoating from './pages/QualityControl/ProsesCoating/JenisCoating';
import CoatingAwal from './pages/QualityControl/ProsesCoating/CoatingAwal';
import ProsesLem from './pages/QualityControl/ProsesLem/ProsesLem';
import JenisLem from './pages/QualityControl/ProsesLem/JenisLem';
import LemAwal from './pages/QualityControl/ProsesLem/LemAwal';
import CetakPeriode from './pages/QualityControl/ProsesCetak/CetakPeriode';
import MasterDefect from './pages/MasterData/QC/MasterDefect';
import PondPeriode from './pages/QualityControl/ProsesPond/PondPeriode';
import LemPeriode from './pages/QualityControl/ProsesLem/LemPeriode';
import CoatingPeriode from './pages/QualityControl/ProsesCoating/CoatingPeriode';
import SamplingHasilRabut from './pages/QualityControl/SamplingRabut/SamplingHasilRabut';
import AmparHasilLem from './pages/QualityControl/AmparHasilLem/AmparHasilLem';
import RabutAwal from './pages/QualityControl/SamplingRabut/RabutAwal';
import AmparLemAwal from './pages/QualityControl/AmparHasilLem/AmparLemAwal';
import NcrMtc from './pages/Maintenance/NCR/Ncrmtc';
import IncomingNCRQA from './pages/QualityControl/IncomingNCR/IncomingNCRQA';
import IncomingNCRMR from './pages/MR/NCR/IncomingNCRMR';
import CapaMtc from './pages/Maintenance/Capa/CapaMtc';
import QcCapa from './pages/QualityControl/Capa/QcCapa';
import MrCapa from './pages/MR/Capa/MrCapa';
import FinalInspection from './pages/QualityControl/FinalInspection/FinalInspection';
import FinalAwal from './pages/QualityControl/FinalInspection/FinalAwal';
import OutsourcingBJ from './pages/QualityControl/OutsourcingBJ/OutsourcingBJ';
import OutsourcingBJAwal from './pages/QualityControl/OutsourcingBJ/OutsourcingBJAwal';
import MasterFinalInspection from './pages/MasterData/QC/MasterFinalInspection';
import MasterOutsourcingBJ from './pages/MasterData/QC/MasterOutsourcingBJ';
import BarangRusak from './pages/QualityControl/BarangRusak/BarangRusak';
import BarangRSChecksheet from './pages/QualityControl/BarangRusak/BarangRSChecksheet';
import NcrLaporQC from './pages/QualityControl/Lapor/NCR/NcrLaporQC';
import CapaLaporQC from './pages/QualityControl/Lapor/Capa/CapaLaporQC';
import NcrLaporMR from './pages/MR/Lapor/NCR/NcrLaporQC';
import CapaLaporMR from './pages/MR/Lapor/Capa/CapaLaporQC';
import ProsesPotongFIX from './pages/QualityControl/ProsesPotongFix/ProsesPotongFix';
import PotongBahanCheck from './pages/QualityControl/ProsesPotongFix/PotongBahan';
import PotongJadiCheck from './pages/QualityControl/ProsesPotongFix/PotongJadi';
import IncomingOutsourcing from './pages/QualityControl/incomingOutsourcing/IncomingOutsourcing';
import IncomingOutsourcingAwal from './pages/QualityControl/incomingOutsourcing/IncomingOutsourcingAwal';
import ProsesPraplate from './pages/QualityControl/ProsesPraplate/ProsesPraplate';
import ChecksheetPralatePage from './pages/QualityControl/ProsesPraplate/ChecksheetPraplate';
import ProsesLipat from './pages/QualityControl/ProsesLipat/ProsesLipat';
import ChecksheetLipatPage from './pages/QualityControl/ProsesLipat/ChecksheetLipat';
import PrePress from './pages/PrePress/Prepress';
import MasterPerusahaan from './pages/HR/Personal/MasterPerusahaan';
import MasterKaryawan from './pages/HR/Personal/MasterKaryawan';
import AddMasterKaryawan from './pages/HR/Personal/AddMasterKaryawan';
import KalenderKerja from './pages/HR/Personal/KalenderKerja/KalenderKerja';
import RekapMtcPage from './pages/Maintenance/RekapMtc';

import LengkapiMasterKaryawan from './pages/HR/Personal/LengkapiMasterKaryawan';
import Absensi from './pages/HR/Personal/KalenderKerja/absensi';
import MasterGrade from './pages/MasterData/MTC/MasterGrade';

import MasterSHiftHR from './pages/HR/MasterDataHR/MastershiftHr';
import MasterDepartment from './pages/HR/MasterDataHR/MasterDepartment';
import EditMasterKaryawan from './pages/HR/Personal/EditMasterKaryawan';
import MasterCutiKhusus from './pages/HR/MasterDataHR/MasterCutiKhusus';
import MasterGradeHR from './pages/HR/MasterDataHR/MasterGrade';
import NcrHr from './pages/HR/Ncrhr/Ncrhr';
import CapaHR from './pages/HR/Capahr/Capahr';
import AbsenQC from './pages/QualityControl/Absensi/AbsenQC';
import DetailMasterKaryawan from './pages/HR/Personal/DetailMasterKaryawan';
import PengajuanKeHR from './pages/HR/PengajuanKeHR/PengajuanKeHR';
import HistoryPengajuanKeHR from './pages/HR/PengajuanKeHR/HistoryPengajuankeHR';
import ResponPengajuanHR from './pages/HR/Pengajuan/ResponPengajuan';
import HistoryResponPengajuan from './pages/HR/Pengajuan/HistoryResponPengajuan';
import OsQC from './pages/QualityControl/OutstandingQC/OutstandingQC';
import RekapQC from './pages/QualityControl/RekapQC/RekapQC';
import PayrollPage from './pages/HR/Payroll/Payrollpage';
import JadwalPPIC from './pages/PPIC/JadwalPPIC/JadwalPPIC';
import MasterPayrollHR from './pages/HR/MasterDataHR/MasterPayrollHR';
import MasterJadwal from './pages/PPIC/MasterPPIC/MasterJadwal';
import OsMTC from './pages/Maintenance/OutstandingMTC/OSMTC';
import OsHR from './pages/HR/Outstanding/OsHR';
import OsPPIC from './pages/PPIC/OutstandingPPIC/OutstandingPPIC';
import Project from './pages/Maintenance/Project';
import PengajuanJabatanKeHR from './pages/HR/PengajuanKeHR/PengajuanJabatanKeHR';
import HistoryPengajuanJabatanKeHR from './pages/HR/PengajuanKeHR/HistoryPengajuanJabatanKeHR';
import ResponJabatan from './pages/HR/Pengajuan/ResponJabatan';
import HistoryResponJabatan from './pages/HR/Pengajuan/HistoryResponJabatan';
import AbsenMTC from './pages/Maintenance/AbsensiMTC/AbsenMTC';
import MasterUserPageQC from './pages/MasterData/QC/MasterUserPage';
import MasterUserHR from './pages/HR/MasterDataHR/MasterUserHR';
import MasterHakAkses from './pages/MasterData/MasterHakAkses';
import AccPayroll from './pages/HR/Payroll/AccPayroll';
import MasterSettingHR from './pages/HR/MasterDataHR/MasterSettingHR';
import MasterUserAll from './pages/MasterData/MasterUserAll';
import ProduksiBreakdownTtime from './pages/Produksi/ProduksiBreakdown';
import PengajuanAllDept from './pages/AllDept/PengajuanKeHrAll';
import PengajuanAllDeptHistory from './pages/AllDept/PengajuanKeHrAllHistory';
import RekapPPIC from './pages/PPIC/RekapPPIC/RekapPPIC';
import IncomingChem from './pages/QualityControl/Incoming/IncomingChem';
import MasterSPTeguran from './pages/HR/MasterDataHR/MasterSPTeguran';
import ProduksiWaste from './pages/Produksi/ProduksiWaste';
import RekapHRPage from './pages/HR/Rekap/RekapHR';
import PayrollBulanPage from './pages/HR/Payroll/PayrollBulanPage';
import MasterDoc from './pages/MasterData/QC/MasterDoc';
import JadwalKirimPPIC from './pages/PPIC/JadwalPPIC/JadwalKirim';
import ProduksiOS2 from './pages/Produksi/ProduksiOS2';
import JoTerjadwal from './pages/PPIC/JadwalPPIC/JOTerjadwalPPIC';
import KalibrasiAlatUkur from './pages/QualityControl/Kalibrasi/kalibrasiqc';
import KalibrasiMaster from './pages/QualityControl/Kalibrasi/KalibrasiMaster';
import MasterKapasitasArmada from './pages/PPIC/MasterPPIC/MasterKapasitasArmada';
import PengajuanJabatanAllDept from './pages/AllDept/PengajuanJabatanAll';
import PengajuanJabatanAllDeptHistory from './pages/AllDept/PengajuanJabatanAllHistory';
import MasterMarketing from './pages/Marketing/MasterMarketing/MasterMarketing';
import MasterCustomer from './pages/MasterData/Marketing/MarketingCustomer';
import MasterProduk from './pages/MasterData/Marketing/MarketingProduk';
import MasterMesinTahapan from './pages/MasterData/Marketing/MarketingMesinTahapan';
import MasterTahapan from './pages/MasterData/Marketing/MarketingTahapan';
import MasterTahapanMesin from './pages/MasterData/Marketing/MarketingTahapanMesin';
import MasterMarketingPengiriman from './pages/MasterData/Marketing/MarketingPengiriman';
import MarketingBrand from './pages/MasterData/Marketing/MarketingBrand';
import MarketingUnit from './pages/MasterData/Marketing/MarketingUnit';
import MarketingBarang from './pages/MasterData/Marketing/MarketingBarang.';
import KalkulasiPageMarketing from './pages/Marketing/Kalkulasi/KalkulasiPage';
import KabagApproval from './pages/Marketing/Kabag/KabagApproval';
import OKPPage from './pages/Marketing/OKP/OKPPage';
import IOMarketingPage from './pages/Marketing/IO/IOMarketingPage';
import SOPage from './pages/Marketing/SO/SOPage';
import KalkulasiHistoryPage from './pages/Marketing/Kalkulasi/KalkulasiHistoryPage';
import HistorySOPage from './pages/Marketing/SO/HistorySOPage';
import KabagApprovalQC from './pages/QualityControl/Kabag/OSKabagQC';
import KabagApprovalDesain from './pages/Desain/Kabag/KabagApprovalDesain';
import BOMMarketing from './pages/PPIC/BOM/BOMPage';
import BOMApprovalPage from './pages/PPIC/BOM/BOMApprovalPage';
import BOMPPIC from './pages/PPIC/BOMPPIC/BOMPPICPage';
import IONPDPage from './pages/Marketing/IO/IONPDPage';
import JOPPIC from './pages/PPIC/JO/JOPage';
import JOApprovalPage from './pages/PPIC/JO/JOApprovalPage';
import AbsenProduction from './pages/Produksi/AbsenProduction';
import MasterKategoriKendala from './pages/Produksi/MasterData/MasterKategoriKendala';
import MasterKriteriaKendala from './pages/Produksi/MasterData/MasterKriteriaKendala';
import MasterKodeProduksi from './pages/Produksi/MasterData/MasterKodeProduksi';
import InputLKHPage from './pages/Produksi/InputLKH/InputLkhPage';
import MonitoringLKHPage from './pages/Produksi/MonitoringLKH/MonitoringLkhPage';
import ApproveSPVPage from './pages/Produksi/MonitoringLKH/ApproveSPVpage';
import HistoryOKPPage from './pages/Marketing/OKP/HistoryOKPPage';
import IOMarketingHistoryPage from './pages/Marketing/IO/IOMarketingHistoryPage';
import JOHistoryPage from './pages/PPIC/JO/JOHistoryPage';
import MasterSkorMTC from './pages/MasterData/MTC/MasterSkor';
import LKHAllDataPage from './pages/Produksi/MonitoringLKH/AllDataLKHPage';
import ListJOSelesaiPage from './pages/Produksi/MonitoringLKH/ListJOSelesai';
import ListDOPage from './pages/DO/listDOPage';
import KonfirmasiDOPage from './pages/DO/KonfirmasiDOPage';
import MasterKendaraanHR from './pages/HR/MasterDataHR/MasterKendaraanHR';
import DepositPage from './pages/Accounting/DepositPage';
import DepositApprovalPage from './pages/Accounting/DepositApprovalePage';
import DepositApprovalHistoryPage from './pages/Accounting/DepositApprovalHistory';
import ListOutstandingPage from './pages/Accounting/ListOutstandingPage';
import ListApprovalInvoicePage from './pages/Accounting/ListInvoicePage';
import ListInvoiceApprovePage from './pages/Accounting/ListInvoiceApprovePage';
import ListAllInvoicePage from './pages/Accounting/ListAllInvoicePage';
import ListReturPage from './pages/Accounting/ListReturPage';
import CreatePerubahanPage from './pages/Marketing/CreatePerubahanPage';
import ListPerubahanPage from './pages/Marketing/ListPerubahanPage';
import ListApprovalPerubahanPage from './pages/Accounting/ListApprovalPerubahanPage';
import KabagApprovalHistory from './pages/Marketing/Kabag/KabagApprovalHistory';
import BukaLKHPage from './pages/Produksi/MonitoringLKH/BukaLKHPage';
import PerubahanTglKirimPage from './pages/PPIC/PerubahanTglKirimPage';
import MasterMenu from './pages/MasterData/MasterMenu';
import AbsenPPICPage from './pages/PPIC/AbsenPPIC';
import SecurityMonitoringPage from './pages/Security/SecurityMonitoringPage';
import UserMenuPage from './pages/UserMenu/UserMenuPage';
import MasterTerlambatHPage from './pages/HR/MasterDataHR/MasterTerlambat';
import AtasanIzinTerlambatPage from './pages/UserMenu/AtasanIzinTerlambatPage';
import BawahanIzinTerlambatPage from './pages/UserMenu/BawahanIzinTerlambatPage';
import ApprovalManagementPage from './pages/UserMenu/ApprovalManagementPage';
import UserMenuAbsensi from './pages/UserMenu/UserMenuAbsensi';
import WelcomePage from './pages/Dashboard/WelcomePage';
import JOMonitoringPage from './pages/Monitoring/JOMonitoringPage';
import SOMonitoringPage from './pages/Monitoring/SOMonitoringPage';
import LabelPage from './pages/Print/LabelPage';
import LaporanDOPage from './pages/DO/LaporanDOPage';
import ApprovalStandarWarnaPage from './pages/QualityControl/ApprovalStandarWarnaPage';
import PenerimaanBarangJadiPage from './pages/GudangFG/PenerimaanBarangJadiPage';
import GudangFGPage from './pages/GudangFG/GudangFGPage';
import MutasiBarangPage from './pages/GudangFG/MutasiBarangPage';
import ApproveStandarWarnaPageMarketing from './pages/Marketing/ApproveStandarWarnaPageMarketing';
import LaporanRekapLKHPage from './pages/Monitoring/LaporanRekapLKHPage';
import LabelJOPage from './pages/Print/LabelJOPage';
import JODetailStandalone from './components/Tables/Print/Jodetailstandalone';
import FGBookingJo from './pages/GudangFG/FGBookingJo';
import AbsensiDivisiPage from './pages/UserMenu/AbsensiDivisiPage';
import QRScanPage from './pages/Print/qrscanpage';
import ListOTSPurchasePage from './pages/Purchasing/ListOTSPurchasePage';
import PengajuanPurchasePage from './pages/Purchasing/PengajuanPurchasePage';
import MasterVendor from './pages/MasterData/Marketing/MasterVendor';
import POApprovalFinacePage from './pages/Finance/POApprovalFinancePage';
import POApprovalPurchasePage from './pages/Purchasing/POApprovalPurhcasePage';
import DraftPOPage from './pages/Purchasing/DraftPOPage';
import TambahBahanSPVPage from './pages/Produksi/TambahBahanSPVPage';
import TambahBahanRMPage from './pages/GudangRM/TambahBahanRMPage';
import HistoryTambahBahanPage from './pages/Produksi/HistoryTambahBahanPage';
import MonitoringWIPPage from './pages/Monitoring/MonitoringWIPPage';
import BapPage from './pages/GudangFG/BapPage';

// Helper: wraps a page element in ProtectedRoute + PageTitle
const P = ({
  title = 'PT CBL',
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) => (
  <>
    <PageTitle title={title} />
    <ProtectedRoute>{children}</ProtectedRoute>
  </>
);

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return loading ? (
    <Loader />
  ) : (
    <>
      <Routes>
        {/* ============== PUBLIC / AUTH ROUTES (no ProtectedRoute) ============== */}
        <Route
          index
          element={
            <>
              <PageTitle title="PT CBL" />
              <Login />
            </>
          }
        />
        <Route
          path="/auth/login"
          element={
            <>
              <PageTitle title="PT CBL" />
              <Login />
            </>
          }
        />
        <Route
          path="/auth/signin"
          element={
            <>
              <PageTitle title="PT CBL" />
              <SignIn />
            </>
          }
        />
        <Route
          path="/auth/signup"
          element={
            <>
              <PageTitle title="PT CBL" />
              <SignUp />
            </>
          }
        />

        {/* ============== DASHBOARD ROUTES ============== */}
        <Route
          path="/dashboard"
          element={
            <P>
              <WelcomePage />
            </P>
          }
        />
        <Route
          path="/dashboard/maintenance"
          element={
            <P>
              <Dashboard />
            </P>
          }
        />
        <Route
          path="/dashboard/maintenance-overview-dashboard"
          element={
            <P>
              <ECommerce />
            </P>
          }
        />

        {/* Profile */}
        <Route
          path="/profile/setting"
          element={
            <P>
              <ProfilSetting />
            </P>
          }
        />

        {/* ============== SECURITY ROUTES ============== */}
        <Route
          path="/security/monitoring"
          element={
            <P>
              <SecurityMonitoringPage />
            </P>
          }
        />

        {/* ============== MAINTENANCE ROUTES ============== */}
        <Route
          path="/maintenance/corrective"
          element={
            <P>
              <Machine />
            </P>
          }
        />
        <Route
          path="/maintenance/preventive/pm1"
          element={
            <P>
              <Pm1 />
            </P>
          }
        />
        <Route
          path="/maintenance/preventive/pm1/form/:id"
          element={
            <P>
              <Pm1Form />
            </P>
          }
        />
        <Route
          path="/maintenance/inspection/pm_1_form/:id"
          element={
            <P>
              <Pm1Form />
            </P>
          }
        />
        <Route
          path="/maintenance/inspection/pm_2_form/:id"
          element={
            <P>
              <Pm2Form />
            </P>
          }
        />
        <Route
          path="/maintenance/inspection/pm_3_form/:id"
          element={
            <P>
              <Pm3Form />
            </P>
          }
        />
        <Route
          path="/maintenance/preventive/pm2"
          element={
            <P>
              <Pm2 />
            </P>
          }
        />
        <Route
          path="/maintenance/preventive/pm2/form/:id"
          element={
            <P>
              <Pm2Form />
            </P>
          }
        />
        <Route
          path="/maintenance/preventive/pm3"
          element={
            <P>
              <Pm3page />
            </P>
          }
        />
        <Route
          path="/maintenance/preventive/pm3/form/:id"
          element={
            <P>
              <Pm3Form />
            </P>
          }
        />
        <Route
          path="/maintenance/preventive/os3"
          element={
            <P>
              <Preventive />
            </P>
          }
        />
        <Route
          path="/maintenance/preventive/history"
          element={
            <P>
              <HistoriPage />
            </P>
          }
        />
        <Route
          path="/maintenance/outstanding"
          element={
            <P>
              <OsMTC />
            </P>
          }
        />
        <Route
          path="/maintenance/absensi"
          element={
            <P>
              <AbsenMTC />
            </P>
          }
        />
        <Route
          path="/maintenance/sparepart/opname/adjustment"
          element={
            <P>
              <Adjustment />
            </P>
          }
        />
        <Route
          path="/maintenance/sparepart/opname/submit"
          element={
            <P>
              <SubmitOpname />
            </P>
          }
        />
        <Route
          path="/maintenance/sparepart/opname/history"
          element={
            <P>
              <MainOpname />
            </P>
          }
        />
        <Route
          path="/maintenance/sparepart/stock-master"
          element={
            <P>
              <Stockmaster />
            </P>
          }
        />
        <Route
          path="/maintenance/sparepart/stock-master/add"
          element={
            <P>
              <AddStock />
            </P>
          }
        />
        <Route
          path="/maintenance/sparepart/stock-master-service/add"
          element={
            <P>
              <AddStockService />
            </P>
          }
        />
        <Route
          path="/maintenance/sparepart/monitoring"
          element={
            <P>
              <MonitoringSparepart />
            </P>
          }
        />
        <Route
          path="/maintenance/sparepart/monitoring-service"
          element={
            <P>
              <MonitoringService />
            </P>
          }
        />
        <Route
          path="/maintenance/sparepart/monitoring/add-lifetime"
          element={
            <P>
              <AddStockLifetimes />
            </P>
          }
        />
        <Route
          path="/maintenance/project"
          element={
            <P>
              <Project />
            </P>
          }
        />
        <Route
          path="/maintenance/recap"
          element={
            <P>
              <RekapMtcPage />
            </P>
          }
        />
        <Route
          path="/maintenance/kpi"
          element={
            <P>
              <KPI />
            </P>
          }
        />
        <Route
          path="/maintenance/kpi/form"
          element={
            <P>
              <KPIForm />
            </P>
          }
        />
        <Route
          path="/maintenance/kpi/input"
          element={
            <P>
              <KPIInput />
            </P>
          }
        />
        <Route
          path="/maintenance/report/ncr"
          element={
            <P>
              <NcrMtc />
            </P>
          }
        />
        <Route
          path="/maintenance/report/capa"
          element={
            <P>
              <CapaMtc />
            </P>
          }
        />
        <Route
          path="/maintenance/spb"
          element={
            <P>
              <SpbService />
            </P>
          }
        />
        <Route
          path="/maintenance/submission"
          element={
            <P>
              <PengajuanAllDept />
            </P>
          }
        />
        <Route
          path="/maintenance/submission/history"
          element={
            <P>
              <PengajuanAllDeptHistory />
            </P>
          }
        />
        <Route
          path="/maintenance/submission/position"
          element={
            <P>
              <PengajuanJabatanAllDept />
            </P>
          }
        />
        <Route
          path="/maintenance/submission/position/history"
          element={
            <P>
              <PengajuanJabatanAllDeptHistory />
            </P>
          }
        />

        {/* ============== QUALITY CONTROL ROUTES ============== */}
        <Route
          path="/qc/validate-verify"
          element={
            <P>
              <MaintenanceQC />
            </P>
          }
        />
        <Route
          path="/qc/inspection"
          element={
            <P>
              <Qualityinspection />
            </P>
          }
        />
        <Route
          path="/qc/inspection/list"
          element={
            <P>
              <IncomingList />
            </P>
          }
        />
        <Route
          path="/qc/inspection/list/:id"
          element={
            <P>
              <IncomingIns />
            </P>
          }
        />
        <Route
          path="/qc/inspection/chemical/list/:id"
          element={
            <P>
              <IncomingChem />
            </P>
          }
        />
        <Route
          path="/qc/inspection/history/:id"
          element={
            <P>
              <HistoryIns />
            </P>
          }
        />
        <Route
          path="/qc/inspection/potong"
          element={
            <P>
              <ProsesPotongFIX />
            </P>
          }
        />
        <Route
          path="/qc/inspection/potong/bahan/:id"
          element={
            <P>
              <PotongBahanCheck />
            </P>
          }
        />
        <Route
          path="/qc/inspection/potong/jadi/:id"
          element={
            <P>
              <PotongJadiCheck />
            </P>
          }
        />
        <Route
          path="/qc/inspection/potong-bahan"
          element={
            <P>
              <PotongBahan1 />
            </P>
          }
        />
        <Route
          path="/qc/inspection/potong-bahan/list-itoh"
          element={
            <P>
              <ListBahan1 />
            </P>
          }
        />
        <Route
          path="/qc/inspection/potong-bahan/list-polar"
          element={
            <P>
              <ListBahan2 />
            </P>
          }
        />
        <Route
          path="/qc/inspection/potong-bahan/history-itoh/:id"
          element={
            <P>
              <HistoryBahanItoh />
            </P>
          }
        />
        <Route
          path="/qc/inspection/potong-bahan/history-polar/:id"
          element={
            <P>
              <HistoryBahanPolar />
            </P>
          }
        />
        <Route
          path="/qc/inspection/potong-bahan/:id"
          element={
            <P>
              <PotongBahanPage />
            </P>
          }
        />
        <Route
          path="/qc/inspection/potong-jadi"
          element={
            <P>
              <PotongJadi1 />
            </P>
          }
        />
        <Route
          path="/qc/inspection/potong-jadi/list-itoh"
          element={
            <P>
              <ListJadiItoh />
            </P>
          }
        />
        <Route
          path="/qc/inspection/potong-jadi/list-polar"
          element={
            <P>
              <ListJadiPolar />
            </P>
          }
        />
        <Route
          path="/qc/inspection/potong-jadi/history-polar/:id"
          element={
            <P>
              <HistoryJadiPolarPage />
            </P>
          }
        />
        <Route
          path="/qc/inspection/potong-jadi/history-itoh/:id"
          element={
            <P>
              <HistoryJadiItohPage />
            </P>
          }
        />
        <Route
          path="/qc/inspection/potong-jadi/:id"
          element={
            <P>
              <PotongJadiPage />
            </P>
          }
        />
        <Route
          path="/qc/inspection/cetak"
          element={
            <P>
              <ProsesCetak />
            </P>
          }
        />
        <Route
          path="/qc/inspection/cetak/jenis/:id"
          element={
            <P>
              <JenisCetak />
            </P>
          }
        />
        <Route
          path="/qc/inspection/cetak/jenis/check-awal/:id"
          element={
            <P>
              <CetakAwal />
            </P>
          }
        />
        <Route
          path="/qc/inspection/cetak/jenis/check-periode/:id"
          element={
            <P>
              <CetakPeriode />
            </P>
          }
        />
        <Route
          path="/qc/inspection/pond"
          element={
            <P>
              <ProsesPond />
            </P>
          }
        />
        <Route
          path="/qc/inspection/pond/jenis/:id"
          element={
            <P>
              <JenisPond />
            </P>
          }
        />
        <Route
          path="/qc/inspection/pond/jenis/check-awal/:id"
          element={
            <P>
              <PondAwal />
            </P>
          }
        />
        <Route
          path="/qc/inspection/pond/jenis/check-periode/:id"
          element={
            <P>
              <PondPeriode />
            </P>
          }
        />
        <Route
          path="/qc/inspection/coating"
          element={
            <P>
              <ProsesCoating />
            </P>
          }
        />
        <Route
          path="/qc/inspection/coating/jenis/:id"
          element={
            <P>
              <JenisCoating />
            </P>
          }
        />
        <Route
          path="/qc/inspection/coating/jenis/check-awal/:id"
          element={
            <P>
              <CoatingAwal />
            </P>
          }
        />
        <Route
          path="/qc/inspection/coating/jenis/check-periode/:id"
          element={
            <P>
              <CoatingPeriode />
            </P>
          }
        />
        <Route
          path="/qc/inspection/praplate"
          element={
            <P>
              <ProsesPraplate />
            </P>
          }
        />
        <Route
          path="/qc/inspection/praplate/:id"
          element={
            <P>
              <ChecksheetPralatePage />
            </P>
          }
        />
        <Route
          path="/qc/inspection/lipat"
          element={
            <P>
              <ProsesLipat />
            </P>
          }
        />
        <Route
          path="/qc/inspection/lipat/:id"
          element={
            <P>
              <ChecksheetLipatPage />
            </P>
          }
        />
        <Route
          path="/qc/inspection/lem"
          element={
            <P>
              <ProsesLem />
            </P>
          }
        />
        <Route
          path="/qc/inspection/lem/jenis/:id"
          element={
            <P>
              <JenisLem />
            </P>
          }
        />
        <Route
          path="/qc/inspection/lem/jenis/check-awal/:id"
          element={
            <P>
              <LemAwal />
            </P>
          }
        />
        <Route
          path="/qc/inspection/lem/jenis/check-periode/:id"
          element={
            <P>
              <LemPeriode />
            </P>
          }
        />
        <Route
          path="/qc/inspection/incoming-outsourcing"
          element={
            <P>
              <IncomingOutsourcing />
            </P>
          }
        />
        <Route
          path="/qc/inspection/incoming-outsourcing/check-awal/:id"
          element={
            <P>
              <IncomingOutsourcingAwal />
            </P>
          }
        />
        <Route
          path="/qc/inspection/sampling-hasil-rabut"
          element={
            <P>
              <SamplingHasilRabut />
            </P>
          }
        />
        <Route
          path="/qc/inspection/sampling/jenis/check-awal/:id"
          element={
            <P>
              <RabutAwal />
            </P>
          }
        />
        <Route
          path="/qc/inspection/ampar-hasil-lem"
          element={
            <P>
              <AmparHasilLem />
            </P>
          }
        />
        <Route
          path="/qc/inspection/ampar/check-awal/:id"
          element={
            <P>
              <AmparLemAwal />
            </P>
          }
        />
        <Route
          path="/qc/inspection/final"
          element={
            <P>
              <FinalInspection />
            </P>
          }
        />
        <Route
          path="/qc/inspection/final/check-awal/:id"
          element={
            <P>
              <FinalAwal />
            </P>
          }
        />
        <Route
          path="/qc/inspection/outsourcing-barang-jadi"
          element={
            <P>
              <OutsourcingBJ />
            </P>
          }
        />
        <Route
          path="/qc/inspection/outsourcing-barang-jadi/check-awal/:id"
          element={
            <P>
              <OutsourcingBJAwal />
            </P>
          }
        />
        <Route
          path="/qc/inspection/barang-rusak"
          element={
            <P>
              <BarangRusak />
            </P>
          }
        />
        <Route
          path="/qc/inspection/barang-rusak/:id"
          element={
            <P>
              <BarangRSChecksheet />
            </P>
          }
        />
        <Route
          path="/qc/kalibrasi"
          element={
            <P>
              <KalibrasiAlatUkur />
            </P>
          }
        />
        <Route
          path="/qc/kabag-approval"
          element={
            <P>
              <KabagApprovalQC />
            </P>
          }
        />
        <Route
          path="/qc/outstanding"
          element={
            <P>
              <OsQC />
            </P>
          }
        />
        <Route
          path="/qc/recap"
          element={
            <P>
              <RekapQC />
            </P>
          }
        />
        <Route
          path="/qc/qms/ncr"
          element={
            <P>
              <IncomingNCRQA />
            </P>
          }
        />
        <Route
          path="/qc/qms/capa"
          element={
            <P>
              <QcCapa />
            </P>
          }
        />
        <Route
          path="/qc/report/ncr"
          element={
            <P>
              <NcrLaporQC />
            </P>
          }
        />
        <Route
          path="/qc/report/capa"
          element={
            <P>
              <CapaLaporQC />
            </P>
          }
        />
        <Route
          path="/qc/absensi"
          element={
            <P>
              <AbsenQC />
            </P>
          }
        />
        <Route
          path="/quality-control/approval-standar-warna"
          element={
            <P>
              <ApprovalStandarWarnaPage />
            </P>
          }
        />
        <Route
          path="/qc/submission"
          element={
            <P>
              <PengajuanAllDept />
            </P>
          }
        />
        <Route
          path="/qc/submission/history"
          element={
            <P>
              <PengajuanAllDeptHistory />
            </P>
          }
        />
        <Route
          path="/qc/submission/position"
          element={
            <P>
              <PengajuanJabatanAllDept />
            </P>
          }
        />
        <Route
          path="/qc/submission/position/history"
          element={
            <P>
              <PengajuanJabatanAllDeptHistory />
            </P>
          }
        />

        {/* ============== MR ROUTES ============== */}
        <Route
          path="/mr/qms/ncr"
          element={
            <P>
              <IncomingNCRMR />
            </P>
          }
        />
        <Route
          path="/mr/qms/capa"
          element={
            <P>
              <MrCapa />
            </P>
          }
        />
        <Route
          path="/mr/report/ncr"
          element={
            <P>
              <NcrLaporMR />
            </P>
          }
        />
        <Route
          path="/mr/report/capa"
          element={
            <P>
              <CapaLaporMR />
            </P>
          }
        />

        {/* ============== HR ROUTES ============== */}
        <Route
          path="/hr/personnel/company"
          element={
            <P>
              <MasterPerusahaan />
            </P>
          }
        />
        <Route
          path="/hr/personnel/employee"
          element={
            <P>
              <MasterKaryawan />
            </P>
          }
        />
        <Route
          path="/hr/personnel/employee/add"
          element={
            <P>
              <AddMasterKaryawan />
            </P>
          }
        />
        <Route
          path="/hr/personnel/employee/edit/:id"
          element={
            <P>
              <EditMasterKaryawan />
            </P>
          }
        />
        <Route
          path="/hr/personnel/employee/complete/:id"
          element={
            <P>
              <LengkapiMasterKaryawan />
            </P>
          }
        />
        <Route
          path="/hr/personnel/employee/detail/:id"
          element={
            <P>
              <DetailMasterKaryawan />
            </P>
          }
        />
        <Route
          path="/hr/personnel/work-calendar"
          element={
            <P>
              <KalenderKerja />
            </P>
          }
        />
        <Route
          path="/hr/personnel/absensi"
          element={
            <P>
              <Absensi />
            </P>
          }
        />
        <Route
          path="/hr/payroll"
          element={
            <P>
              <PayrollPage />
            </P>
          }
        />
        <Route
          path="/hr/payroll/monthly"
          element={
            <P>
              <PayrollBulanPage />
            </P>
          }
        />
        <Route
          path="/hr/payroll/approval"
          element={
            <P>
              <AccPayroll />
            </P>
          }
        />
        <Route
          path="/hr/submission"
          element={
            <P>
              <PengajuanKeHR />
            </P>
          }
        />
        <Route
          path="/hr/submission/history"
          element={
            <P>
              <HistoryPengajuanKeHR />
            </P>
          }
        />
        <Route
          path="/hr/submission/position"
          element={
            <P>
              <PengajuanJabatanKeHR />
            </P>
          }
        />
        <Route
          path="/hr/submission/position/history"
          element={
            <P>
              <HistoryPengajuanJabatanKeHR />
            </P>
          }
        />
        <Route
          path="/hr/response"
          element={
            <P>
              <ResponPengajuanHR />
            </P>
          }
        />
        <Route
          path="/hr/response/history"
          element={
            <P>
              <HistoryResponPengajuan />
            </P>
          }
        />
        <Route
          path="/hr/response/position"
          element={
            <P>
              <ResponJabatan />
            </P>
          }
        />
        <Route
          path="/hr/response/position/history"
          element={
            <P>
              <HistoryResponJabatan />
            </P>
          }
        />
        <Route
          path="/hr/recap"
          element={
            <P>
              <RekapHRPage />
            </P>
          }
        />
        <Route
          path="/hr/outstanding"
          element={
            <P>
              <OsHR />
            </P>
          }
        />
        <Route
          path="/hr/report/ncr"
          element={
            <P>
              <NcrHr />
            </P>
          }
        />
        <Route
          path="/hr/report/capa"
          element={
            <P>
              <CapaHR />
            </P>
          }
        />

        {/* ============== PPIC ROUTES ============== */}
        <Route
          path="/ppic/production-schedule"
          element={
            <P>
              <JadwalPPIC />
            </P>
          }
        />
        <Route
          path="/ppic/scheduled-jo"
          element={
            <P>
              <JoTerjadwal />
            </P>
          }
        />
        <Route
          path="/ppic/delivery-schedule"
          element={
            <P>
              <JadwalKirimPPIC />
            </P>
          }
        />
        <Route
          path="/ppic/outstanding"
          element={
            <P>
              <OsPPIC />
            </P>
          }
        />
        <Route
          path="/ppic/recap"
          element={
            <P>
              <RekapPPIC />
            </P>
          }
        />

        <Route
          path="/ppic/perubahan-tanggal-kirim"
          element={
            <P>
              <PerubahanTglKirimPage />
            </P>
          }
        />
        <Route
          path="/ppic/submission"
          element={
            <P>
              <PengajuanAllDept />
            </P>
          }
        />
        <Route
          path="/ppic/absensi"
          element={
            <P>
              <AbsenPPICPage />
            </P>
          }
        />
        <Route
          path="/ppic/submission/history"
          element={
            <P>
              <PengajuanAllDeptHistory />
            </P>
          }
        />
        <Route
          path="/ppic/submission/position"
          element={
            <P>
              <PengajuanJabatanAllDept />
            </P>
          }
        />
        <Route
          path="/ppic/submission/position/history"
          element={
            <P>
              <PengajuanJabatanAllDeptHistory />
            </P>
          }
        />
        <Route
          path="/ppic/bom/create"
          element={
            <P>
              <BOMMarketing />
            </P>
          }
        />
        <Route
          path="/ppic/bom/approval"
          element={
            <P>
              <BOMApprovalPage />
            </P>
          }
        />
        <Route
          path="/ppic/bom-ppic/create"
          element={
            <P>
              <BOMPPIC />
            </P>
          }
        />
        <Route
          path="/ppic/jo/create"
          element={
            <P>
              <JOPPIC />
            </P>
          }
        />
        <Route
          path="/ppic/jo/history"
          element={
            <P>
              <JOHistoryPage />
            </P>
          }
        />
        <Route
          path="/ppic/jo/approval"
          element={
            <P>
              <JOApprovalPage />
            </P>
          }
        />

        {/* ============== PRODUCTION ROUTES ============== */}
        <Route
          path="/production/breakdown-recap"
          element={
            <P>
              <ProduksiBreakdownTtime />
            </P>
          }
        />
        <Route
          path="/production/input-lkh"
          element={
            <P>
              <InputLKHPage />
            </P>
          }
        />
        <Route
          path="/production/monitoring-lkh"
          element={
            <P>
              <MonitoringLKHPage />
            </P>
          }
        />
        <Route
          path="/production/buka-lkh"
          element={
            <P>
              <BukaLKHPage />
            </P>
          }
        />
        <Route
          path="/production/approve-lkh"
          element={
            <P>
              <ApproveSPVPage />
            </P>
          }
        />
        <Route
          path="/production/alldata-lkh"
          element={
            <P>
              <LKHAllDataPage />
            </P>
          }
        />
        <Route
          path="/production/list-jo-selesai"
          element={
            <P>
              <ListJOSelesaiPage />
            </P>
          }
        />
        <Route
          path="/production/absensi"
          element={
            <P>
              <AbsenProduction />
            </P>
          }
        />
        <Route
          path="/production/submission"
          element={
            <P>
              <PengajuanAllDept />
            </P>
          }
        />
        <Route
          path="/production/submission/history"
          element={
            <P>
              <PengajuanAllDeptHistory />
            </P>
          }
        />
        <Route
          path="/production/submission/position"
          element={
            <P>
              <PengajuanJabatanAllDept />
            </P>
          }
        />
        <Route
          path="/production/submission/position/history"
          element={
            <P>
              <PengajuanJabatanAllDeptHistory />
            </P>
          }
        />
        <Route
          path="/production/waste-report"
          element={
            <P>
              <ProduksiWaste />
            </P>
          }
        />
        <Route
          path="/production/os2"
          element={
            <P>
              <ProduksiOS2 />
            </P>
          }
        />
        <Route
          path="/production/tambah-bahan-spv"
          element={
            <P>
              <TambahBahanSPVPage />
            </P>
          }
        />
        <Route
          path="/production/history-tambah-bahan"
          element={
            <P>
              <HistoryTambahBahanPage />
            </P>
          }
        />
        {/* ============== MARKETING ROUTES ============== */}
        <Route
          path="/marketing/calculation/create"
          element={
            <P>
              <KalkulasiPageMarketing />
            </P>
          }
        />
        <Route
          path="/marketing/calculation/history"
          element={
            <P>
              <KalkulasiHistoryPage />
            </P>
          }
        />
        <Route
          path="/marketing/kabag-approval/list"
          element={
            <P>
              <KabagApproval />
            </P>
          }
        />
        <Route
          path="/marketing/kabag-approval/history"
          element={
            <P>
              <KabagApprovalHistory />
            </P>
          }
        />
        <Route
          path="/marketing/okp/create"
          element={
            <P>
              <OKPPage />
            </P>
          }
        />
        <Route
          path="/marketing/okp/history"
          element={
            <P>
              <HistoryOKPPage />
            </P>
          }
        />
        <Route
          path="/marketing/io/npd"
          element={
            <P>
              <IONPDPage />
            </P>
          }
        />
        <Route
          path="/marketing/io/create"
          element={
            <P>
              <IOMarketingPage />
            </P>
          }
        />
        <Route
          path="/marketing/io/history"
          element={
            <P>
              <IOMarketingHistoryPage />
            </P>
          }
        />
        <Route
          path="/marketing/so/create"
          element={
            <P>
              <SOPage />
            </P>
          }
        />
        <Route
          path="/marketing/so/history"
          element={
            <P>
              <HistorySOPage />
            </P>
          }
        />
        <Route
          path="/marketing/approve-standar-warna"
          element={
            <P>
              <ApproveStandarWarnaPageMarketing />
            </P>
          }
        />
        <Route
          path="/marketing/perubahan/create-perubahan"
          element={
            <P>
              <CreatePerubahanPage />
            </P>
          }
        />
        <Route
          path="/marketing/perubahan/list-perubahan"
          element={
            <P>
              <ListPerubahanPage />
            </P>
          }
        />
        <Route
          path="/marketing/perubahan/history-perubahan"
          element={
            <P>
              <CreatePerubahanPage />
            </P>
          }
        />

        {/* ============== PRE-PRESS ROUTES ============== */}
        <Route
          path="/prepress"
          element={
            <P>
              <PrePress />
            </P>
          }
        />

        {/* ============== DESAIN ROUTES ============== */}
        <Route
          path="/desain"
          element={
            <P>
              <KabagApprovalDesain />
            </P>
          }
        />

        {/* ============== DO ROUTES ============== */}
        <Route
          path="/do/list-do"
          element={
            <P>
              <ListDOPage />
            </P>
          }
        />
        <Route
          path="/do/konfirmasi-do"
          element={
            <P>
              <KonfirmasiDOPage />
            </P>
          }
        />
        <Route
          path="/delivery-order/laporan-pengiriman-do"
          element={
            <P>
              <LaporanDOPage />
            </P>
          }
        />
        {/* ============== ACCOUNTING ROUTES ============== */}
        <Route
          path="/accounting/list-outstanding"
          element={
            <P>
              <ListOutstandingPage />
            </P>
          }
        />
        <Route
          path="/accounting/list-request-invoice"
          element={
            <P>
              <ListApprovalInvoicePage />
            </P>
          }
        />
        <Route
          path="/accounting/list-approval-invoice"
          element={
            <P>
              <ListInvoiceApprovePage />
            </P>
          }
        />
        <Route
          path="/accounting/list-approval-perubahan"
          element={
            <P>
              <ListApprovalPerubahanPage />
            </P>
          }
        />
        <Route
          path="/accounting/list-invoice"
          element={
            <P>
              <ListAllInvoicePage />
            </P>
          }
        />
        <Route
          path="/accounting/list-retur"
          element={
            <P>
              <ListReturPage />
            </P>
          }
        />
        <Route
          path="/accounting/deposit"
          element={
            <P>
              <DepositPage />
            </P>
          }
        />
        <Route
          path="/accounting/approval/deposit"
          element={
            <P>
              <DepositApprovalPage />
            </P>
          }
        />
        <Route
          path="/accounting/approval/deposit-history"
          element={
            <P>
              <DepositApprovalHistoryPage />
            </P>
          }
        />

        {/* ============== MASTER DATA ROUTES ============== */}
        {/* Maintenance Master */}
        <Route
          path="/master/maintenance/machine"
          element={
            <P>
              <MasterData />
            </P>
          }
        />
        <Route
          path="/master/maintenance/skor-mtc"
          element={
            <P>
              <MasterSkorMTC />
            </P>
          }
        />
        <Route
          path="/master/maintenance/user"
          element={
            <P>
              <MasterUsers />
            </P>
          }
        />
        <Route
          path="/master/maintenance/role"
          element={
            <P>
              <MasterRole />
            </P>
          }
        />
        <Route
          path="/master/maintenance/sparepart"
          element={
            <P>
              <MasterSparepart />
            </P>
          }
        />
        <Route
          path="/master/maintenance/analysis"
          element={
            <P>
              <MasterAnalisis />
            </P>
          }
        />
        <Route
          path="/master/maintenance/monitoring"
          element={
            <P>
              <MasterMonitoring />
            </P>
          }
        />
        <Route
          path="/master/maintenance/pm1"
          element={
            <P>
              <MasterPM1 />
            </P>
          }
        />
        <Route
          path="/master/maintenance/pm1/checklist/:id"
          element={
            <P>
              <MasterPM1Check />
            </P>
          }
        />
        <Route
          path="/master/maintenance/pm1/checklist/add-inspection/:id"
          element={
            <P>
              <MasterPM1TambahInspection />
            </P>
          }
        />
        <Route
          path="/master/maintenance/pm2"
          element={
            <P>
              <MasterPM2 />
            </P>
          }
        />
        <Route
          path="/master/maintenance/pm2/checklist/:id"
          element={
            <P>
              <MasterPM2Check />
            </P>
          }
        />
        <Route
          path="/master/maintenance/pm2/checklist/add-inspection/:id"
          element={
            <P>
              <MasterPM2TambahInspection />
            </P>
          }
        />
        <Route
          path="/master/maintenance/pm3"
          element={
            <P>
              <MasterPM3 />
            </P>
          }
        />
        <Route
          path="/master/maintenance/pm3/checklist/:id"
          element={
            <P>
              <MasterPM3Check />
            </P>
          }
        />
        <Route
          path="/master/maintenance/pm3/checklist/add-inspection/:id"
          element={
            <P>
              <MasterPM3TambahInspection />
            </P>
          }
        />
        <Route
          path="/master/maintenance/kpi"
          element={
            <P>
              <MasterKPI />
            </P>
          }
        />
        <Route
          path="/master/maintenance/kpi/form"
          element={
            <P>
              <MasterKPIForm />
            </P>
          }
        />
        <Route
          path="/master/maintenance/grade"
          element={
            <P>
              <MasterGrade />
            </P>
          }
        />

        {/* QC Master */}
        <Route
          path="/master/qc/defect"
          element={
            <P>
              <MasterDefect />
            </P>
          }
        />
        <Route
          path="/master/qc/document"
          element={
            <P>
              <MasterDoc />
            </P>
          }
        />
        <Route
          path="/master/qc/final-inspection"
          element={
            <P>
              <MasterFinalInspection />
            </P>
          }
        />
        <Route
          path="/master/qc/user"
          element={
            <P>
              <MasterUserPageQC />
            </P>
          }
        />
        <Route
          path="/master/qc/outsourcing-bj"
          element={
            <P>
              <MasterOutsourcingBJ />
            </P>
          }
        />
        <Route
          path="/master/qc/kalibrasi"
          element={
            <P>
              <KalibrasiMaster />
            </P>
          }
        />

        {/* HR Master */}
        <Route
          path="/master/hr/shift"
          element={
            <P>
              <MasterSHiftHR />
            </P>
          }
        />
        <Route
          path="/master/hr/sp-teguran"
          element={
            <P>
              <MasterSPTeguran />
            </P>
          }
        />
        <Route
          path="/master/hr/setting"
          element={
            <P>
              <MasterSettingHR />
            </P>
          }
        />
        <Route
          path="/master/hr/user"
          element={
            <P>
              <MasterUserHR />
            </P>
          }
        />
        <Route
          path="/master/hr/department"
          element={
            <P>
              <MasterDepartment />
            </P>
          }
        />
        <Route
          path="/master/hr/cuti-khusus"
          element={
            <P>
              <MasterCutiKhusus />
            </P>
          }
        />
        <Route
          path="/master/hr/grade"
          element={
            <P>
              <MasterGradeHR />
            </P>
          }
        />
        <Route
          path="/master/hr/kendaraan"
          element={
            <P>
              <MasterKendaraanHR />
            </P>
          }
        />
        <Route
          path="/master/hr/payroll"
          element={
            <P>
              <MasterPayrollHR />
            </P>
          }
        />
        <Route
          path="/master/human-resources/izin-terlambat"
          element={
            <P>
              <MasterTerlambatHPage />
            </P>
          }
        />

        {/* PPIC Master */}
        <Route
          path="/master/ppic/schedule"
          element={
            <P>
              <MasterJadwal />
            </P>
          }
        />
        <Route
          path="/master/ppic/fleet-capacity"
          element={
            <P>
              <MasterKapasitasArmada />
            </P>
          }
        />

        {/* Produksi Master */}
        <Route
          path="/master/produksi/kategori-kendala"
          element={
            <P>
              <MasterKategoriKendala />
            </P>
          }
        />
        <Route
          path="/master/produksi/kriteria-kendala"
          element={
            <P>
              <MasterKriteriaKendala />
            </P>
          }
        />
        <Route
          path="/master/produksi/kode-produksi"
          element={
            <P>
              <MasterKodeProduksi />
            </P>
          }
        />

        {/* Marketing Master */}
        <Route
          path="/master/marketing/marketing"
          element={
            <P>
              <MasterMarketing />
            </P>
          }
        />
        <Route
          path="/master/marketing/customer"
          element={
            <P>
              <MasterCustomer />
            </P>
          }
        />
        <Route
          path="/master/marketing/brand"
          element={
            <P>
              <MarketingBrand />
            </P>
          }
        />
        <Route
          path="/master/marketing/delivery"
          element={
            <P>
              <MasterMarketingPengiriman />
            </P>
          }
        />
        <Route
          path="/master/marketing/product"
          element={
            <P>
              <MasterProduk />
            </P>
          }
        />
        <Route
          path="/master/marketing/unit"
          element={
            <P>
              <MarketingUnit />
            </P>
          }
        />
        <Route
          path="/master/marketing/item"
          element={
            <P>
              <MarketingBarang />
            </P>
          }
        />
        <Route
          path="/master/marketing/machine-stage"
          element={
            <P>
              <MasterMesinTahapan />
            </P>
          }
        />
        <Route
          path="/master/marketing/stage"
          element={
            <P>
              <MasterTahapan />
            </P>
          }
        />
        <Route
          path="/master/marketing/stage-machine"
          element={
            <P>
              <MasterTahapanMesin />
            </P>
          }
        />
        <Route
          path="/master/marketing/vendor"
          element={
            <P>
              <MasterVendor />
            </P>
          }
        />
        {/* General Master */}
        <Route
          path="/master-data/general/access"
          element={
            <P>
              <MasterHakAkses />
            </P>
          }
        />
        <Route
          path="/master-data/general/menu"
          element={
            <P>
              <MasterMenu />
            </P>
          }
        />
        <Route
          path="/master-data/general/user"
          element={
            <P>
              <MasterUserAll />
            </P>
          }
        />

        {/* ============== USER MENU ROUTES ============== */}
        <Route
          path="/management-menu/approval-management"
          element={
            <P>
              <ApprovalManagementPage />
            </P>
          }
        />
        <Route
          path="/user-menu/spl-surat-perintah-lembur"
          element={
            <P>
              <UserMenuPage />
            </P>
          }
        />
        <Route
          path="/user-menu/absensi"
          element={
            <P>
              <UserMenuAbsensi />
            </P>
          }
        />
        <Route
          path="/user-menu/absensi-divisi"
          element={
            <P>
              <AbsensiDivisiPage />
            </P>
          }
        />
        <Route
          path="/user-menu/datang-terlambat-atasan"
          element={
            <P>
              <AtasanIzinTerlambatPage />
            </P>
          }
        />
        <Route
          path="/user-menu/datang-terlambat-bawahan"
          element={
            <P>
              <BawahanIzinTerlambatPage />
            </P>
          }
        />

        {/* ============== MONITORING ROUTES ============== */}
        <Route
          path="/monitoring/so-monitoring"
          element={
            <P>
              <SOMonitoringPage />
            </P>
          }
        />
        <Route
          path="/monitoring/jo-monitoring"
          element={
            <P>
              <JOMonitoringPage />
            </P>
          }
        />
        <Route
          path="/monitoring/laporan-rekap-lkh"
          element={
            <P>
              <LaporanRekapLKHPage />
            </P>
          }
        />
        <Route
          path="/monitoring/monitoring-wip"
          element={
            <P>
              <MonitoringWIPPage />
            </P>
          }
        />

        {/* ============== PENGAJUAN ROUTES ============== */}

        <Route
          path="/pengajuan"
          element={
            <P>
              <PengajuanAllDept />
            </P>
          }
        />
        <Route
          path="/pengajuan/buat-pengajuan"
          element={
            <P>
              <PengajuanAllDept />
            </P>
          }
        />
        <Route
          path="/pengajuan/buat-pengajuan-jabatan"
          element={
            <P>
              <PengajuanJabatanAllDept />
            </P>
          }
        />
        <Route
          path="/pengajuan/history-pengajuan"
          element={
            <P>
              <PengajuanAllDeptHistory />
            </P>
          }
        />
        <Route
          path="/pengajuan/history-pengajuan-jabatan"
          element={
            <P>
              <PengajuanJabatanAllDeptHistory />
            </P>
          }
        />
        {/* ============== Gudang FG ROUTES ============== */}
        <Route
          path="/gudang-fg/penerimaan-barang-jadi"
          element={
            <P>
              <PenerimaanBarangJadiPage />
            </P>
          }
        />
        <Route
          path="/gudang-fg/gudang-fg"
          element={
            <P>
              <GudangFGPage />
            </P>
          }
        />
        <Route
          path="/gudang-fg/mutasi-barang"
          element={
            <P>
              <MutasiBarangPage />
            </P>
          }
        />
        <Route
          path="/gudang-fg/bap"
          element={
            <P>
              <BapPage />
            </P>
          }
        />
        <Route
          path="/gudang-fg/booking-jo"
          element={
            <P>
              <FGBookingJo />
            </P>
          }
        />

        {/* ============== PURCHASING ROUTES ============== */}
        <Route
          path="/purchasing/list-ots"
          element={
            <P>
              <ListOTSPurchasePage />
            </P>
          }
        />
        <Route
          path="/purchasing/pengajuan"
          element={
            <P>
              <PengajuanPurchasePage />
            </P>
          }
        />
        <Route
          path="/purchasing/draft-po"
          element={
            <P>
              <DraftPOPage />
            </P>
          }
        />
        <Route
          path="/purchasing/po-approval"
          element={
            <P>
              <POApprovalPurchasePage />
            </P>
          }
        />

        {/* ============== Finance ROUTES ============== */}
        <Route
          path="/finance/po-approval"
          element={
            <P>
              <POApprovalFinacePage />
            </P>
          }
        />
        {/* ============== Gudang RM ROUTES ============== */}
        <Route
          path="/gudang-rm/tambah-bahan-produksi"
          element={
            <P>
              <TambahBahanRMPage />
            </P>
          }
        />
        {/* ============== PRINT ROUTES ============== */}
        <Route
          path="/print/label"
          element={
            <P>
              <LabelPage />
            </P>
          }
        />
        <Route
          path="/print/label-jo"
          element={
            <P>
              <LabelJOPage />
            </P>
          }
        />
        <Route
          path="/print/qr-scan"
          element={
            <P>
              <QRScanPage />
            </P>
          }
        />
        {/* ============== HISTORY ROUTES ============== */}
        <Route
          path="/history"
          element={
            <P>
              <HistoryMtc />
            </P>
          }
        />

        {/* ============== TEST/MISC ROUTES ============== */}
        <Route
          path="/cobain"
          element={
            <>
              <PageTitle title="PT CBL" />
              <Cobain />
            </>
          }
        />
        <Route
          path="/print/jo-detail"
          element={
            <>
              <PageTitle title="Detail JO - PT CBL" />
              <JODetailStandalone />
            </>
          }
        />
      </Routes>
    </>
  );
}

export default App;
