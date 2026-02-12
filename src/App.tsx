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
import ListInvoicePage from './pages/Accounting/ListInvoicePage';
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
        <Route
          index
          element={
            <>
              <PageTitle title="PT CBL" />
              <Login />
            </>
          }
        />

        {/* Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ECommerce />
            </>
          }
        />
        <Route
          path="/dashboard/maintenance"
          element={
            <>
              <PageTitle title="PT CBL" />
              <Dashboard />
            </>
          }
        />

        {/* Profile */}
        <Route
          path="/profile/setting"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProfilSetting />
            </>
          }
        />
        {/* ============== Security ROUTES ============== */}
        <Route
          path="/security/monitoring"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <SecurityMonitoringPage />
              </ProtectedRoute>
            </>
          }
        />
        {/* ============== MAINTENANCE ROUTES ============== */}
        <Route
          path="/maintenance/corrective"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <Machine />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/maintenance/preventive/pm1"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <Pm1 />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/maintenance/preventive/pm1/form/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <Pm1Form />
            </>
          }
        />
        <Route
          path="/maintenance/preventive/pm2"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <Pm2 />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/maintenance/preventive/pm2/form/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <Pm2Form />
            </>
          }
        />
        <Route
          path="/maintenance/preventive/pm3"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <Pm3page />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/maintenance/preventive/pm3/form/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <Pm3Form />
            </>
          }
        />
        <Route
          path="/maintenance/preventive/os3"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <Preventive />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/maintenance/preventive/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <HistoriPage />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/maintenance/outstanding"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <OsMTC />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/maintenance/absensi"
          element={
            <>
              <PageTitle title="PT CBL" />
              <AbsenMTC />
            </>
          }
        />
        <Route
          path="/maintenance/sparepart/opname/adjustment"
          element={
            <>
              <PageTitle title="PT CBL" />
              <Adjustment />
            </>
          }
        />
        <Route
          path="/maintenance/sparepart/opname/submit"
          element={
            <>
              <PageTitle title="PT CBL" />
              <SubmitOpname />
            </>
          }
        />
        <Route
          path="/maintenance/sparepart/opname/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MainOpname />
            </>
          }
        />
        <Route
          path="/maintenance/sparepart/stock-master"
          element={
            <>
              <PageTitle title="PT CBL" />
              <Stockmaster />
            </>
          }
        />
        <Route
          path="/maintenance/sparepart/stock-master/add"
          element={
            <>
              <PageTitle title="PT CBL" />
              <AddStock />
            </>
          }
        />
        <Route
          path="/maintenance/sparepart/stock-master-service/add"
          element={
            <>
              <PageTitle title="PT CBL" />
              <AddStockService />
            </>
          }
        />
        <Route
          path="/maintenance/sparepart/monitoring"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MonitoringSparepart />
            </>
          }
        />
        <Route
          path="/maintenance/sparepart/monitoring-service"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MonitoringService />
            </>
          }
        />
        <Route
          path="/maintenance/sparepart/monitoring/add-lifetime"
          element={
            <>
              <PageTitle title="PT CBL" />
              <AddStockLifetimes />
            </>
          }
        />
        <Route
          path="/maintenance/project"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <Project />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/maintenance/recap"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <RekapMtcPage />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/maintenance/kpi"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <KPI />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/maintenance/kpi/form"
          element={
            <>
              <PageTitle title="PT CBL" />
              <KPIForm />
            </>
          }
        />
        <Route
          path="/maintenance/kpi/input"
          element={
            <>
              <PageTitle title="PT CBL" />
              <KPIInput />
            </>
          }
        />
        <Route
          path="/maintenance/report/ncr"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <NcrMtc />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/maintenance/report/capa"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <CapaMtc />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/maintenance/spb"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <SpbService />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/maintenance/submission"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PengajuanAllDept />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/maintenance/submission/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PengajuanAllDeptHistory />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/maintenance/submission/position"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PengajuanJabatanAllDept />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/maintenance/submission/position/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PengajuanJabatanAllDeptHistory />
              </ProtectedRoute>
            </>
          }
        />

        {/* ============== QUALITY CONTROL ROUTES ============== */}
        <Route
          path="/qc/validate-verify"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MaintenanceQC />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <Qualityinspection />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/list"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <IncomingList />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/list/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <IncomingIns />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/chemical/list/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <IncomingChem />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/history/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <HistoryIns />
              </ProtectedRoute>
            </>
          }
        />

        {/* Potong Routes */}
        <Route
          path="/qc/inspection/potong"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ProsesPotongFIX />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/potong/bahan/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PotongBahanCheck />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/potong/jadi/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PotongJadiCheck />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/potong-bahan"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PotongBahan1 />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/potong-bahan/list-itoh"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ListBahan1 />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/potong-bahan/list-polar"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ListBahan2 />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/potong-bahan/history-itoh/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <HistoryBahanItoh />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/potong-bahan/history-polar/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <HistoryBahanPolar />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/potong-bahan/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PotongBahanPage />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/potong-jadi"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PotongJadi1 />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/potong-jadi/list-itoh"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ListJadiItoh />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/potong-jadi/list-polar"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ListJadiPolar />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/potong-jadi/history-polar/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <HistoryJadiPolarPage />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/potong-jadi/history-itoh/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <HistoryJadiItohPage />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/potong-jadi/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PotongJadiPage />
              </ProtectedRoute>
            </>
          }
        />

        {/* Cetak Routes */}
        <Route
          path="/qc/inspection/cetak"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ProsesCetak />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/cetak/jenis/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <JenisCetak />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/cetak/jenis/check-awal/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <CetakAwal />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/cetak/jenis/check-periode/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <CetakPeriode />
              </ProtectedRoute>
            </>
          }
        />

        {/* Pond Routes */}
        <Route
          path="/qc/inspection/pond"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ProsesPond />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/pond/jenis/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <JenisPond />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/pond/jenis/check-awal/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PondAwal />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/pond/jenis/check-periode/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PondPeriode />
              </ProtectedRoute>
            </>
          }
        />

        {/* Coating Routes */}
        <Route
          path="/qc/inspection/coating"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ProsesCoating />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/coating/jenis/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <JenisCoating />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/coating/jenis/check-awal/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <CoatingAwal />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/coating/jenis/check-periode/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <CoatingPeriode />
              </ProtectedRoute>
            </>
          }
        />

        {/* Praplate Routes */}
        <Route
          path="/qc/inspection/praplate"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ProsesPraplate />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/praplate/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ChecksheetPralatePage />
              </ProtectedRoute>
            </>
          }
        />

        {/* Lipat Routes */}
        <Route
          path="/qc/inspection/lipat"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ProsesLipat />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/lipat/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ChecksheetLipatPage />
              </ProtectedRoute>
            </>
          }
        />

        {/* Lem Routes */}
        <Route
          path="/qc/inspection/lem"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ProsesLem />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/lem/jenis/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <JenisLem />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/lem/jenis/check-awal/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <LemAwal />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/lem/jenis/check-periode/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <LemPeriode />
              </ProtectedRoute>
            </>
          }
        />

        {/* Incoming Outsourcing Routes */}
        <Route
          path="/qc/inspection/incoming-outsourcing"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <IncomingOutsourcing />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/incoming-outsourcing/check-awal/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <IncomingOutsourcingAwal />
              </ProtectedRoute>
            </>
          }
        />

        {/* Sampling Hasil Rabut Routes */}
        <Route
          path="/qc/inspection/sampling-hasil-rabut"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <SamplingHasilRabut />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/sampling/jenis/check-awal/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <RabutAwal />
              </ProtectedRoute>
            </>
          }
        />

        {/* Ampar Hasil Lem Routes */}
        <Route
          path="/qc/inspection/ampar-hasil-lem"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <AmparHasilLem />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/ampar/check-awal/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <AmparLemAwal />
              </ProtectedRoute>
            </>
          }
        />

        {/* Final Inspection Routes */}
        <Route
          path="/qc/inspection/final"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <FinalInspection />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/final/check-awal/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <FinalAwal />
              </ProtectedRoute>
            </>
          }
        />

        {/* Outsourcing Barang Jadi Routes */}
        <Route
          path="/qc/inspection/outsourcing-barang-jadi"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <OutsourcingBJ />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/outsourcing-barang-jadi/check-awal/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <OutsourcingBJAwal />
              </ProtectedRoute>
            </>
          }
        />

        {/* Barang Rusak Routes */}
        <Route
          path="/qc/inspection/barang-rusak"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <BarangRusak />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/inspection/barang-rusak/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <BarangRSChecksheet />
              </ProtectedRoute>
            </>
          }
        />

        <Route
          path="/qc/kalibrasi"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <KalibrasiAlatUkur />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/kabag-approval"
          element={
            <>
              <PageTitle title="PT CBL" />
              <KabagApprovalQC />
            </>
          }
        />
        <Route
          path="/qc/outstanding"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <OsQC />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/recap"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <RekapQC />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/qms/ncr"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <IncomingNCRQA />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/qms/capa"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <QcCapa />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/report/ncr"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <NcrLaporQC />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/report/capa"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <CapaLaporQC />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/absensi"
          element={
            <>
              <PageTitle title="PT CBL" />
              <AbsenQC />
            </>
          }
        />
        <Route
          path="/qc/submission"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PengajuanAllDept />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/submission/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PengajuanAllDeptHistory />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/submission/position"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PengajuanJabatanAllDept />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/submission/position/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PengajuanJabatanAllDeptHistory />
              </ProtectedRoute>
            </>
          }
        />

        {/* ============== MR ROUTES ============== */}
        <Route
          path="/mr/qms/ncr"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <IncomingNCRMR />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/mr/qms/capa"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MrCapa />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/mr/report/ncr"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <NcrLaporMR />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/mr/report/capa"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <CapaLaporMR />
              </ProtectedRoute>
            </>
          }
        />

        {/* ============== HR ROUTES ============== */}
        <Route
          path="/hr/personnel/company"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterPerusahaan />
            </>
          }
        />
        <Route
          path="/hr/personnel/employee"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterKaryawan />
            </>
          }
        />
        <Route
          path="/hr/personnel/employee/add"
          element={
            <>
              <PageTitle title="PT CBL" />
              <AddMasterKaryawan />
            </>
          }
        />
        <Route
          path="/hr/personnel/employee/edit/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <EditMasterKaryawan />
            </>
          }
        />
        <Route
          path="/hr/personnel/employee/complete/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <LengkapiMasterKaryawan />
            </>
          }
        />
        <Route
          path="/hr/personnel/employee/detail/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <DetailMasterKaryawan />
            </>
          }
        />
        <Route
          path="/hr/personnel/work-calendar"
          element={
            <>
              <PageTitle title="PT CBL" />
              <KalenderKerja />
            </>
          }
        />
        <Route
          path="/hr/personnel/absensi"
          element={
            <>
              <PageTitle title="PT CBL" />
              <Absensi />
            </>
          }
        />
        <Route
          path="/hr/payroll"
          element={
            <>
              <PageTitle title="PT CBL" />
              <PayrollPage />
            </>
          }
        />
        <Route
          path="/hr/payroll/monthly"
          element={
            <>
              <PageTitle title="PT CBL" />
              <PayrollBulanPage />
            </>
          }
        />
        <Route
          path="/hr/payroll/approval"
          element={
            <>
              <PageTitle title="PT CBL" />
              <AccPayroll />
            </>
          }
        />
        <Route
          path="/hr/submission"
          element={
            <>
              <PageTitle title="PT CBL" />
              <PengajuanKeHR />
            </>
          }
        />
        <Route
          path="/hr/submission/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <HistoryPengajuanKeHR />
            </>
          }
        />
        <Route
          path="/hr/submission/position"
          element={
            <>
              <PageTitle title="PT CBL" />
              <PengajuanJabatanKeHR />
            </>
          }
        />
        <Route
          path="/hr/submission/position/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <HistoryPengajuanJabatanKeHR />
            </>
          }
        />
        <Route
          path="/hr/response"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ResponPengajuanHR />
            </>
          }
        />
        <Route
          path="/hr/response/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <HistoryResponPengajuan />
            </>
          }
        />
        <Route
          path="/hr/response/position"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ResponJabatan />
            </>
          }
        />
        <Route
          path="/hr/response/position/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <HistoryResponJabatan />
            </>
          }
        />
        <Route
          path="/hr/recap"
          element={
            <>
              <PageTitle title="PT CBL" />
              <RekapHRPage />
            </>
          }
        />
        <Route
          path="/hr/outstanding"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <OsHR />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/hr/report/ncr"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <NcrHr />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/hr/report/capa"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <CapaHR />
              </ProtectedRoute>
            </>
          }
        />

        {/* ============== PPIC ROUTES ============== */}
        <Route
          path="/ppic/production-schedule"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <JadwalPPIC />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/ppic/scheduled-jo"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <JoTerjadwal />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/ppic/delivery-schedule"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <JadwalKirimPPIC />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/ppic/outstanding"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <OsPPIC />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/ppic/recap"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <RekapPPIC />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/ppic/perubahan-tanggal-kirim"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PerubahanTglKirimPage />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/ppic/submission"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PengajuanAllDept />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/ppic/absensi"
          element={
            <>
              <PageTitle title="PT CBL" />
              <AbsenPPICPage />
            </>
          }
        />
        <Route
          path="/ppic/submission/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PengajuanAllDeptHistory />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/ppic/submission/position"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PengajuanJabatanAllDept />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/ppic/submission/position/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PengajuanJabatanAllDeptHistory />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/ppic/bom/create"
          element={
            <>
              <PageTitle title="PT CBL" />
              <BOMMarketing />
            </>
          }
        />
        <Route
          path="/ppic/bom/approval"
          element={
            <>
              <PageTitle title="PT CBL" />
              <BOMApprovalPage />
            </>
          }
        />
        <Route
          path="/ppic/bom-ppic/create"
          element={
            <>
              <PageTitle title="PT CBL" />
              <BOMPPIC />
            </>
          }
        />
        <Route
          path="/ppic/jo/create"
          element={
            <>
              <PageTitle title="PT CBL" />
              <JOPPIC />
            </>
          }
        />
        <Route
          path="/ppic/jo/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <JOHistoryPage />
            </>
          }
        />
        <Route
          path="/ppic/jo/approval"
          element={
            <>
              <PageTitle title="PT CBL" />
              <JOApprovalPage />
            </>
          }
        />

        {/* ============== PRODUCTION ROUTES ============== */}
        <Route
          path="/production/breakdown-recap"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ProduksiBreakdownTtime />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/production/input-lkh"
          element={
            <>
              <PageTitle title="PT CBL" />
              <InputLKHPage />
            </>
          }
        />
        <Route
          path="/production/monitoring-lkh"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MonitoringLKHPage />
            </>
          }
        />
        <Route
          path="/production/buka-lkh"
          element={
            <>
              <PageTitle title="PT CBL" />
              <BukaLKHPage />
            </>
          }
        />
        <Route
          path="/production/approve-lkh"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ApproveSPVPage />
            </>
          }
        />
        <Route
          path="/production/alldata-lkh"
          element={
            <>
              <PageTitle title="PT CBL" />
              <LKHAllDataPage />
            </>
          }
        />
        <Route
          path="/production/list-jo-selesai"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ListJOSelesaiPage />
            </>
          }
        />
        <Route
          path="/production/absensi"
          element={
            <>
              <PageTitle title="PT CBL" />
              <AbsenProduction />
            </>
          }
        />
        <Route
          path="/production/submission"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PengajuanAllDept />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/production/submission/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PengajuanAllDeptHistory />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/production/submission/position"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PengajuanJabatanAllDept />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/production/submission/position/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PengajuanJabatanAllDeptHistory />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/production/waste-report"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ProduksiWaste />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/production/os2"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ProduksiOS2 />
              </ProtectedRoute>
            </>
          }
        />

        {/* ============== MARKETING ROUTES ============== */}
        <Route
          path="/marketing/calculation/create"
          element={
            <>
              <PageTitle title="PT CBL" />
              <KalkulasiPageMarketing />
            </>
          }
        />
        <Route
          path="/marketing/calculation/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <KalkulasiHistoryPage />
            </>
          }
        />
        <Route
          path="/marketing/kabag-approval/list"
          element={
            <>
              <PageTitle title="PT CBL" />
              <KabagApproval />
            </>
          }
        />
        <Route
          path="/marketing/kabag-approval/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <KabagApprovalHistory />
            </>
          }
        />
        <Route
          path="/marketing/okp/create"
          element={
            <>
              <PageTitle title="PT CBL" />
              <OKPPage />
            </>
          }
        />
        <Route
          path="/marketing/okp/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <HistoryOKPPage />
            </>
          }
        />
        <Route
          path="/marketing/io/npd"
          element={
            <>
              <PageTitle title="PT CBL" />
              <IONPDPage />
            </>
          }
        />
        <Route
          path="/marketing/io/create"
          element={
            <>
              <PageTitle title="PT CBL" />
              <IOMarketingPage />
            </>
          }
        />
        <Route
          path="/marketing/io/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <IOMarketingHistoryPage />
            </>
          }
        />
        <Route
          path="/marketing/so/create"
          element={
            <>
              <PageTitle title="PT CBL" />
              <SOPage />
            </>
          }
        />
        <Route
          path="/marketing/so/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <HistorySOPage />
            </>
          }
        />
        <Route
          path="/marketing/perubahan/create-perubahan"
          element={
            <>
              <PageTitle title="PT CBL" />
              <CreatePerubahanPage />
            </>
          }
        />
        <Route
          path="/marketing/perubahan/list-perubahan"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ListPerubahanPage />
            </>
          }
        />
        <Route
          path="/marketing/perubahan/history-perubahan"
          element={
            <>
              <PageTitle title="PT CBL" />
              <CreatePerubahanPage />
            </>
          }
        />
        {/* ============== PRE-PRESS ROUTES ============== */}
        <Route
          path="/prepress"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PrePress />
              </ProtectedRoute>
            </>
          }
        />

        {/* ============== DESAIN ROUTES ============== */}
        <Route
          path="/desain"
          element={
            <>
              <PageTitle title="PT CBL" />
              <KabagApprovalDesain />
            </>
          }
        />
        {/* ============== DO ROUTES ============== */}
        <Route
          path="/do/list-do"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ListDOPage />
            </>
          }
        />
        <Route
          path="/do/konfirmasi-do"
          element={
            <>
              <PageTitle title="PT CBL" />
              <KonfirmasiDOPage />
            </>
          }
        />
        {/* ============== Accounting ROUTES ============== */}
        <Route
          path="/accounting/list-outstanding"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ListOutstandingPage />
            </>
          }
        />
        <Route
          path="/accounting/list-request-invoice"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ListApprovalInvoicePage />
            </>
          }
        />
        <Route
          path="/accounting/list-approval-invoice"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ListInvoiceApprovePage />
            </>
          }
        />
        <Route
          path="/accounting/list-approval-perubahan"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ListApprovalPerubahanPage />
            </>
          }
        />
        <Route
          path="/accounting/list-invoice"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ListAllInvoicePage />
            </>
          }
        />
        <Route
          path="/accounting/list-retur"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ListReturPage />
            </>
          }
        />
        <Route
          path="/accounting/deposit"
          element={
            <>
              <PageTitle title="PT CBL" />
              <DepositPage />
            </>
          }
        />
        <Route
          path="/accounting/approval/deposit"
          element={
            <>
              <PageTitle title="PT CBL" />
              <DepositApprovalPage />
            </>
          }
        />
        <Route
          path="/accounting/approval/deposit"
          element={
            <>
              <PageTitle title="PT CBL" />
              <DepositApprovalPage />
            </>
          }
        />
        <Route
          path="/accounting/approval/deposit-history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <DepositApprovalHistoryPage />
            </>
          }
        />
        {/* ============== MASTER DATA ROUTES ============== */}
        {/* Maintenance Master */}
        <Route
          path="/master/maintenance/machine"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterData />
              </ProtectedRoute>
            </>
          }
        />

        <Route
          path="/master/maintenance/skor-mtc"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterSkorMTC />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/maintenance/user"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterUsers />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/maintenance/role"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterRole />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/maintenance/sparepart"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterSparepart />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/maintenance/analysis"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterAnalisis />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/maintenance/monitoring"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterMonitoring />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/maintenance/pm1"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterPM1 />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/maintenance/pm1/checklist/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterPM1Check />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/maintenance/pm1/checklist/add-inspection/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterPM1TambahInspection />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/maintenance/pm2"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterPM2 />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/maintenance/pm2/checklist/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterPM2Check />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/maintenance/pm2/checklist/add-inspection/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterPM2TambahInspection />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/maintenance/pm3"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterPM3 />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/maintenance/pm3/checklist/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterPM3Check />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/maintenance/pm3/checklist/add-inspection/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterPM3TambahInspection />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/maintenance/kpi"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterKPI />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/maintenance/kpi/form"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterKPIForm />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/maintenance/grade"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterGrade />
              </ProtectedRoute>
            </>
          }
        />

        {/* QC Master */}
        <Route
          path="/master/qc/defect"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterDefect />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/qc/document"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterDoc />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/qc/final-inspection"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterFinalInspection />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/qc/user"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterUserPageQC />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/qc/outsourcing-bj"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterOutsourcingBJ />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/qc/kalibrasi"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <KalibrasiMaster />
              </ProtectedRoute>
            </>
          }
        />

        {/* HR Master */}
        <Route
          path="/master/hr/shift"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterSHiftHR />
            </>
          }
        />
        <Route
          path="/master/hr/sp-teguran"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterSPTeguran />
            </>
          }
        />
        <Route
          path="/master/hr/setting"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterSettingHR />
            </>
          }
        />
        <Route
          path="/master/hr/user"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterUserHR />
            </>
          }
        />
        <Route
          path="/master/hr/department"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterDepartment />
            </>
          }
        />
        <Route
          path="/master/hr/cuti-khusus"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterCutiKhusus />
            </>
          }
        />
        <Route
          path="/master/hr/grade"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterGradeHR />
            </>
          }
        />
        <Route
          path="/master/hr/kendaraan"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterKendaraanHR />
            </>
          }
        />
        <Route
          path="/master/hr/payroll"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterPayrollHR />
            </>
          }
        />
        <Route
          path="/master/human-resources/izin-terlambat"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterTerlambatHPage />
            </>
          }
        />
        {/* PPIC Master */}
        <Route
          path="/master/ppic/schedule"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterJadwal />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/ppic/fleet-capacity"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterKapasitasArmada />
              </ProtectedRoute>
            </>
          }
        />
        {/* Produksi Master */}
        <Route
          path="/master/produksi/kategori-kendala"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterKategoriKendala />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/produksi/kriteria-kendala"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterKriteriaKendala />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master/produksi/kode-produksi"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterKodeProduksi />
              </ProtectedRoute>
            </>
          }
        />
        {/* Marketing Master */}
        <Route
          path="/master/marketing/marketing"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterMarketing />
            </>
          }
        />
        <Route
          path="/master/marketing/customer"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterCustomer />
            </>
          }
        />
        <Route
          path="/master/marketing/brand"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MarketingBrand />
            </>
          }
        />
        <Route
          path="/master/marketing/delivery"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterMarketingPengiriman />
            </>
          }
        />
        <Route
          path="/master/marketing/product"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterProduk />
            </>
          }
        />
        <Route
          path="/master/marketing/unit"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MarketingUnit />
            </>
          }
        />
        <Route
          path="/master/marketing/item"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MarketingBarang />
            </>
          }
        />
        <Route
          path="/master/marketing/machine-stage"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterMesinTahapan />
            </>
          }
        />
        <Route
          path="/master/marketing/stage"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterTahapan />
            </>
          }
        />
        <Route
          path="/master/marketing/stage-machine"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MasterTahapanMesin />
            </>
          }
        />

        {/* General Master */}
        <Route
          path="/master-data/general/access"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterHakAkses />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master-data/general/menu"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterMenu />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/master-data/general/user"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterUserAll />
              </ProtectedRoute>
            </>
          }
        />

        {/* ============== AUTH ROUTES ============== */}
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
        {/* ============== User Menu ROUTES ============== */}
        <Route
          path="/management-menu/approval-management"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ApprovalManagementPage />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/user-menu/submission"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <UserMenuPage />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/user-menu/absensi"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <UserMenuAbsensi />
              </ProtectedRoute>
            </>
          }
        />

        <Route
          path="/user-menu/izin-terlambat-atasan"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <AtasanIzinTerlambatPage />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/user-menu/izin-terlambat-bawahan"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <BawahanIzinTerlambatPage />
              </ProtectedRoute>
            </>
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
          path="/history"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <HistoryMtc />
              </ProtectedRoute>
            </>
          }
        />
      </Routes>
    </>
  );
}
export default App;
