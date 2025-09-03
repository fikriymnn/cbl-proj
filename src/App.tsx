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
import Preparation from './pages/Maintenance/Preparation';
import MAN from './pages/Maintenance/MAN';

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
import Sparepart from './pages/sparepart/submitOpname';
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
import ProsesPotong from './pages/QualityControl/Prosespotong/Prosespotong';
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
        {/* Marketing */}
        <Route
          path="/marketing/kalkulasi"
          element={
            <>
              <PageTitle title="PT CBL" />

              <KalkulasiPageMarketing />
            </>
          }
        />
        <Route
          path="/marketing/kabagapproval"
          element={
            <>
              <PageTitle title="PT CBL" />

              <KabagApproval />
            </>
          }
        />
        <Route
          path="/master/customer"
          element={
            <>
              <PageTitle title="PT CBL" />

              <MasterCustomer />
            </>
          }
        />
        <Route
          path="/master/marketing"
          element={
            <>
              <PageTitle title="PT CBL" />

              <MasterMarketing />
            </>
          }
        />
        <Route
          path="/master/brand"
          element={
            <>
              <PageTitle title="PT CBL" />

              <MarketingBrand />
            </>
          }
        />
        <Route
          path="/master/pengiriman"
          element={
            <>
              <PageTitle title="PT CBL" />

              <MasterMarketingPengiriman />
            </>
          }
        />
        <Route
          path="/master/produk"
          element={
            <>
              <PageTitle title="PT CBL" />

              <MasterProduk />
            </>
          }
        />
        <Route
          path="/master/unit"
          element={
            <>
              <PageTitle title="PT CBL" />

              <MarketingUnit />
            </>
          }
        />
        <Route
          path="/master/barang"
          element={
            <>
              <PageTitle title="PT CBL" />

              <MarketingBarang />
            </>
          }
        />
        <Route
          path="/master/mesintahapan"
          element={
            <>
              <PageTitle title="PT CBL" />

              <MasterMesinTahapan />
            </>
          }
        />
        <Route
          path="/master/tahapan"
          element={
            <>
              <PageTitle title="PT CBL" />

              <MasterTahapan />
            </>
          }
        />
        <Route
          path="/master/tahapanmesin"
          element={
            <>
              <PageTitle title="PT CBL" />

              <MasterTahapanMesin />
            </>
          }
        />
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
          path="/profil_setting"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProfilSetting />
            </>
          }
        />

        <Route
          path="/maintenance/sparepart/stockmaster_sparepart"
          element={
            <>
              <PageTitle title="PT CBL" />
              <Stockmaster />
            </>
          }
        />
        <Route
          path="/maintenance/sparepart/opname/submitOpname"
          element={
            <>
              <PageTitle title="PT CBL" />
              <SubmitOpname />
            </>
          }
        />
        <Route
          path="/maintenance/sparepart/stockmaster_sparepart/addStock"
          element={
            <>
              <PageTitle title="PT CBL" />
              <AddStock />
            </>
          }
        />
        <Route
          path="/maintenance/sparepart/stockmaster_service/addStock"
          element={
            <>
              <PageTitle title="PT CBL" />
              <AddStockService />
            </>
          }
        />
        <Route
          path="/maintenance/sparepart/monitoringSparepart"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MonitoringSparepart />
            </>
          }
        />
        <Route
          path="/maintenance/sparepart/monitoringService"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MonitoringService />
            </>
          }
        />
        <Route
          path="/maintenance/sparepart/monitoringSparepart/addStockLifetime"
          element={
            <>
              <PageTitle title="PT CBL" />
              <AddStockLifetimes />
            </>
          }
        />
        <Route
          path="/maintenance/inspection/pm_1_form/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <Pm1Form />
            </>
          }
        />
        <Route
          path="/maintenance/inspection/pm_2_form/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <Pm2Form />
            </>
          }
        />
        <Route
          path="/maintenance/Stock_opname"
          element={
            <>
              <PageTitle title="PT CBL" />
              <Sparepart />
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
          path="/maintenance/sparepart/opname/histori"
          element={
            <>
              <PageTitle title="PT CBL" />
              <MainOpname />
            </>
          }
        />
        <Route
          path="/maintenance/inspection/pm_3_form/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <Pm3Form />
            </>
          }
        />
        <Route
          path="/maintenance/KPI/Form/Input"
          element={
            <>
              <PageTitle title="PT CBL" />
              <KPIInput />
            </>
          }
        />
        <Route
          path="/maintenance/machine"
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
          path="/maintenance/projectMtc"
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
          path="/maintenance/inspection/pm_1"
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
          path="/maintenance/inspection/pm_2"
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
          path="/maintenance/inspection/pm_3"
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
          path="/maintenance/inspection/OS_3"
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
          path="/maintenance/inspection/histori"
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
          path="/maintenance/KPI"
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
          path="/maintenance/preparation"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <Preparation />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/maintenance/sparepart"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <Sparepart />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/maintenance/lapor/ncr"
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
          path="/maintenance/lapor/capa"
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
          path="/maintenance/MAN"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MAN />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="maintenance/spb"
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
          path="/qc/validatenverify"
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
          path="/qc/rekap"
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
          path="/qc/qualityinspection"
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
          path="/qc/lapor/ncr"
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
          path="/qc/lapor/capa"
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
          path="/mr/lapor/ncr"
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
          path="/mr/lapor/capa"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <CapaLaporMR />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/qualityinspection/list"
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
          path="/masterdata/kalibrasimaster"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <KalibrasiMaster />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/qualityinspection/list/:id"
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
          path="/qc/qualityinspectionChemical/list/:id"
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
          path="/qc/qualityinspection/history/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <HistoryIns />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/qualityinspection/potong/potongbahan/historyitoh/:id"
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
          path="/qc/qualityinspection/potong/potongbahan/historypolar/:id"
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
          path="/qc/qualityinspection/potong/potongjadi/historypolar/:id"
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
          path="/qc/qualityinspection/potong/potongjadi/historyitoh/:id"
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
          path="/qc/qualityinspection/prosespotong"
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
          path="/qc/qualityinspection/prosespotong/bahan/:id"
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
          path="/qc/qualityinspection/prosespotong/jadi/:id"
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
          path="/qc/qualityinspection/potong"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ProsesPotong />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/qualityinspection/potongbahan"
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
          path="/qc/qualityinspection/potong/listjadiitoh"
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
          path="/qc/qualityinspection/potong/listjadipolar"
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
          path="/qc/qualityinspection/potongbahan/listbahanitoh"
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
          path="/qc/qualityinspection/potongbahan/listbahanpolar"
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
          path="/qc/qualityinspection/potongjadi"
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
          path="/qc/qualityinspection/cetak"
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
          path="/qc/qualityinspection/pond"
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
          path="/qc/qualityinspection/coating"
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
          path="/qc/qualityinspection/praplate"
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
          path="/qc/qualityinspection/praplate/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ChecksheetPralatePage />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/qualityinspection/lipat"
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
          path="/qc/qualityinspection/lipat/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ChecksheetLipatPage />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/qualityinspection/lem"
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
          path="/qc/qualityinspection/incoming_outsourcing"
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
          path="/qc/qualityinspection/incoming_outsourcing/checkAwal/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <IncomingOutsourcingAwal />
              </ProtectedRoute>
            </>
          }
        />

        <Route
          path="/qc/qualityinspection/sampling_hasil_rabut"
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
          path="/qc/qualityinspection/sampling/jenis_sampling/checkAwal/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <RabutAwal />
              </ProtectedRoute>
            </>
          }
        />

        <Route
          path="/qc/qualityinspection/ampar_hasil_lem"
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
          path="/qc/qualityinspection/ampar/checkAwal/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <AmparLemAwal />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/qualityinspection/cetak/jeniscetak/:id"
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
          path="/qc/qualityinspection/pond/jenispond/:id"
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
          path="/qc/qualityinspection/coating/jeniscoating/:id"
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
          path="/qc/qualityinspection/coating/jeniscoating/checkawal/:id"
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
          path="/qc/qualityinspection/coating/jeniscoating/checkperiode/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <CoatingPeriode />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/qualityinspection/lem/jenisLem/:id"
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
          path="/qc/qualityinspection/cetak/jeniscetak/checkawal/:id"
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
          path="/qc/qualityinspection/cetak/jeniscetak/checkperiode/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <CetakPeriode />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/qualityinspection/lem/jenisLem/checkperiode/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <LemPeriode />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/qualityinspection/lem/jenisLem/checkperiode/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <LemPeriode />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/qualityinspection/pond/jenispond/checkawal/:id"
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
          path="/qc/qualityinspection/pond/jenispond/checkperiode/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PondPeriode />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/qualityinspection/coating/jeniscoating/checkawal/:id"
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
          path="/qc/qualityinspection/coating/jeniscoating/checkperiode/:id"
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
          path="/qc/qualityinspection/lem/jenislem/checkawal/:id"
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
          path="/qc/qualityinspection/potong/potongbahan/:id"
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
          path="/qc/qualityinspection/potong/potongjadi/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <PotongJadiPage />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/qualityinspection/final_inspection"
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
          path="qc/qualityinspection/final_inspection/checkAwal/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <FinalAwal />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/qualityinspection/outsourcing_barang_jadi"
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
          path="qc/qualityinspection/outsourcing_barang_jadi/checkAwal/:id"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <OutsourcingBJAwal />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/qc/qualityinspection/barangrs"
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
          path="/qc/qualityinspection/barangrs/:id"
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
        <Route
          path="/masterdata/defect"
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
          path="/masterdata/nodoc"
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
          path="/masterdata/finalinspection"
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
          path="/masterdata/users"
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
          path="/masterdata/outsourcing_bj"
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
          path="/masterdata/machine"
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
          path="/masterdata/machine/add"
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
          path="/masterdata/masterUsers"
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
          path="/masterdata/masterRole"
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
          path="/masterdata/mastersparepart"
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
          path="/masterdata/masteranalisis"
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
          path="/masterdata/mastermonitoring"
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
          path="/pengajuanallkehr"
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
          path="/pengajuanJabatanallkehr"
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
          path="/pengajuanJabatanallkehrhistory"
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
          path="/pengajuanallkehrhistory"
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
          path="/masterdata/masterpm1"
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
          path="/masterdata/masterpm2"
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
          path="/masterdata/masterpm3"
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
          path="/masterdata/masterpm1/pm1checklist/:id"
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
          path="/masterdata/masterpm2/pm2checklist/:id"
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
          path="/masterdata/masterpm3/pm3checklist/:id"
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
          path="/masterdata/masterpm1/pm1checklist/addinspection/:id"
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
          path="/masterdata/masterpm2/pm2checklist/addinspection/:id"
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
          path="/masterdata/masterpm3/pm3checklist/addinspection/:id"
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
          path="/auth/login"
          element={
            <>
              <PageTitle title="PT CBL" />
              <Login />
            </>
          }
        />
        <Route
          path="/masterdata/masterkpi"
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
          path="/masterdata/grade"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterGrade />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/masterdata/masterkpi/form"
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
          path="/maintenance/KPIForm"
          element={
            <>
              <PageTitle title="PT CBL" />
              <KPIForm />
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
          path="/cobain"
          element={
            <>
              <PageTitle title="PT CBL" />
              <Cobain />
            </>
          }
        />
        <Route
          path="/maintenance/DashboardMaintenance"
          element={
            <>
              <PageTitle title="PT CBL" />
              <Dashboard />
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
        <Route
          path="/prepress"
          element={
            <>
              <ProtectedRoute>
                <PrePress />
              </ProtectedRoute>
            </>
          }
        />
        <Route path="/hr" element={<></>} />
        <Route
          path="/hr/pm/masterperusahaan"
          element={
            <>
              <MasterPerusahaan />
            </>
          }
        />
        <Route
          path="/hr/pm/masterkaryawan"
          element={
            <>
              <MasterKaryawan />
            </>
          }
        />
        <Route
          path="/hr/pm/masterkaryawan/add"
          element={
            <>
              <AddMasterKaryawan />
            </>
          }
        />
        <Route
          path="/hr/pm/masterkaryawan/edit/:id"
          element={
            <>
              <EditMasterKaryawan />
            </>
          }
        />
        <Route
          path="/hr/pm/masterkaryawan/lengkapi/:id"
          element={
            <>
              <LengkapiMasterKaryawan />
            </>
          }
        />
        <Route
          path="/hr/pm/masterkaryawan/detail/:id"
          element={
            <>
              <DetailMasterKaryawan />
            </>
          }
        />
        <Route
          path="/hr/pm/kalenderKerja"
          element={
            <>
              <KalenderKerja />
            </>
          }
        />
        <Route
          path="/hr/pm/absensi"
          element={
            <>
              <Absensi />
            </>
          }
        />
        <Route
          path="/qc/absensi"
          element={
            <>
              <AbsenQC />
            </>
          }
        />
        <Route
          path="/maintenance/absensi"
          element={
            <>
              <AbsenMTC />
            </>
          }
        />
        <Route
          path="/hr/payroll"
          element={
            <>
              <PayrollPage />
            </>
          }
        />
        <Route
          path="/hr/payrollbulan"
          element={
            <>
              <PayrollBulanPage />
            </>
          }
        />
        <Route
          path="/hr/accpayroll"
          element={
            <>
              <AccPayroll />
            </>
          }
        />
        <Route
          path="/hr/rp/respon"
          element={
            <>
              <ResponPengajuanHR />
            </>
          }
        />
        <Route
          path="/hr/rp/history"
          element={
            <>
              <HistoryResponPengajuan />
            </>
          }
        />
        <Route
          path="/hr/pengajuan"
          element={
            <>
              <PengajuanKeHR />
            </>
          }
        />
        <Route
          path="/hr/pengajuanJabatan"
          element={
            <>
              <PengajuanJabatanKeHR />
            </>
          }
        />
        <Route
          path="/hr/pengajuanJabatanHistory"
          element={
            <>
              <HistoryPengajuanJabatanKeHR />
            </>
          }
        />
        <Route
          path="/hr/rp/jabatan"
          element={
            <>
              <ResponJabatan />
            </>
          }
        />
        <Route
          path="/hr/rp/jabatanHistory"
          element={
            <>
              <HistoryResponJabatan />
            </>
          }
        />
        <Route
          path="/hr/rekap"
          element={
            <>
              <RekapHRPage />
            </>
          }
        />
        <Route
          path="/hr/pengajuanhistory"
          element={
            <>
              <HistoryPengajuanKeHR />
            </>
          }
        />
        <Route
          path="/hr/master/shift"
          element={
            <>
              <MasterSHiftHR />
            </>
          }
        />
        <Route
          path="/hr/master/spteguran"
          element={
            <>
              <MasterSPTeguran />
            </>
          }
        />
        <Route
          path="/hr/master/setting"
          element={
            <>
              <MasterSettingHR />
            </>
          }
        />
        <Route
          path="/hr/master/users"
          element={
            <>
              <MasterUserHR />
            </>
          }
        />
        <Route
          path="/hr/master/department"
          element={
            <>
              <MasterDepartment />
            </>
          }
        />
        <Route
          path="/hr/master/cutikhusus"
          element={
            <>
              <MasterCutiKhusus />
            </>
          }
        />
        <Route
          path="/hr/master/grade"
          element={
            <>
              <MasterGradeHR />
            </>
          }
        />
        <Route
          path="/hr/master/payroll"
          element={
            <>
              <MasterPayrollHR />
            </>
          }
        />
        <Route
          path="/hr/lapor/ncr"
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
          path="/hr/lapor/capa"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <CapaHR />
              </ProtectedRoute>
            </>
          }
        />

        {/* ===============PPIC=========== */}
        <Route
          path="/ppic/jadwalProduksi"
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
          path="/ppic/joterjadwal"
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
          path="/ppic/jadwalKirim"
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
          path="/ppic/rekap"
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
          path="/ppic/master/jadwal"
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
          path="/ppic/master/kapasitasArmada"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterKapasitasArmada />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/masterHakAkses"
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
          path="/masteruserall"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <MasterUserAll />
              </ProtectedRoute>
            </>
          }
        />
        <Route
          path="/produksi/breakdown"
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
          path="/produksi/waste"
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
          path="/produksi/os2"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <ProduksiOS2 />
              </ProtectedRoute>
            </>
          }
        />
      </Routes>
    </>
  );
}

export default App;
