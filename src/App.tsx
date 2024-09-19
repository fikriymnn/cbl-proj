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
import Material from './pages/Maintenance/Material';
import MaintenanceQC from './pages/QualityControl/validatenverify';
import HistoryMtc from './pages/History/Maintenance';

import MasterData from './pages/MasterData/MTC/Master';

import Dashboard from './pages/Maintenance/dashboard';
import Pm1Form from './pages/inspection/pm1/Pm1Form';
import Pm1 from './pages/inspection/pm1/Pm1';
import Pm2 from './pages/inspection/pm2/Pm2';
import Pm2Form from './pages/inspection/pm2/Pm2Form';
import Pm3Form from './pages/inspection/pm3/Pm3Form';
import Pm3 from './pages/inspection/pm3/Pm3';
import OS3 from './pages/inspection/os3/Os3';

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
import PM2Checklist from './components/Tables/MasterData/PM2/PM2Checklist';
import MasterPM2Check from './pages/MasterData/MTC/MasterPM2Check';
import MasterPM2TambahInspection from './pages/MasterData/MTC/MasterPM2TambahInspection';
import MasterKPI from './pages/MasterData/MTC/MasterKPI';
import MasterKPIForm from './pages/MasterData/MTC/MasterKPIForm';
import Sparepart from './pages/sparepart/submitOpname';
import MasterUsers from './pages/MasterData/MasterUsers';
import MasterRole from './pages/MasterData/MasterRole';
import Adjustment from './pages/sparepart/adjustment';
import HistoriOpname from './pages/sparepart/crumb/historiOpname';
import CrumbSparepart from './pages/sparepart/crumb/header';
import MainOpname from './pages/sparepart/crumb/main';
import MasterMonitoring from './pages/MasterData/MTC/MasterMonitoring';
import SpbService from './pages/Maintenance/SPB/spbService';

import Stockmaster from './pages/sparepart/stockmaster/stockmaster';
import AddStock from './pages/sparepart/stockmaster/addStock';
import MonitoringSparepart from './pages/sparepart/monitoringSparepart/monitoringSparepart';
import AddStockLifetimes from './pages/sparepart/monitoringSparepart/addStock';
import SubmitOpname from './pages/sparepart/submitOpname';
import ProjectMtc from './components/Tables/Maintenance/projectMtc';

import MonitoringService from './pages/sparepart/monitoringService/monitoringService';
import AddStockService from './pages/sparepart/monitoringService/addStock';
import TabsPm from './pages/inspection/pm3/TabsPm';
import Pm3page from './pages/inspection/pm3/Pm3page';
import Qualityinspection from './pages/QualityControl/QualityInspection';
import IncomingInspection from './components/Tables/QualityControl/QualityInspection/Incoming/IncomingInspection';
import IncomingIns from './pages/QualityControl/Incoming/Incomingins';
import ProsesPotong from './pages/QualityControl/Prosespotong/Prosespotong';
import PotongJadi from './components/Tables/QualityControl/QualityInspection/ProsesPotong/Bahan/potongbahan';
import PotongBahan from './components/Tables/QualityControl/QualityInspection/ProsesPotong/Bahan/potongbahan';
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
import HistoryJadiPolar from './components/Tables/QualityControl/QualityInspection/ProsesPotong/Jadi/HistoryJadiPolar';
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
import CheckSheetCoatingPeriode from './components/Tables/QualityControl/QualityInspection/ProsesCoating/CheckSheetCoatingPeriode';
import CoatingPeriode from './pages/QualityControl/ProsesCoating/CoatingPeriode';
import TabSamplingHasilRabut from './components/Tables/QualityControl/QualityInspection/SamplingHasilRabut/TabSamplingHasilRabut';
import SamplingHasilRabut from './pages/QualityControl/SamplingRabut/SamplingHasilRabut';
import AmparHasilLem from './pages/QualityControl/AmparHasilLem/AmparHasilLem';
import CheckSheetHasilRabut from './components/Tables/QualityControl/QualityInspection/SamplingHasilRabut/CheckSheetHAsilRabutAwal';
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
import ChecksheetPraplate from './components/Tables/QualityControl/QualityInspection/ProsesPraplate/ChekcsheetPraplate';
import ChecksheetPralatePage from './pages/QualityControl/ProsesPraplate/ChecksheetPraplate';
import ProsesLipat from './pages/QualityControl/ProsesLipat/ProsesLipat';
import ChecksheetLipatPage from './pages/QualityControl/ProsesLipat/ChecksheetLipat';

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
                <ProjectMtc />
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
          path="/masterdataqc/defect"
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
          path="/masterdataqc/finalinspection"
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
          path="/masterdataqc/outsourcing_bj"
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
      </Routes>
    </>
  );
}

export default App;
