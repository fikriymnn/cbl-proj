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
import MaintenanceQC from './pages/QualityControl/maintenanceQC';
import HistoryMtc from './pages/History/Maintenance';

import MasterData from './pages/MasterData/Master';

import Dashboard from './pages/Maintenance/dashboard';
import Pm1Form from './pages/inspection/pm1/Pm1Form';
import Pm1 from './pages/inspection/pm1/Pm1';
import Pm2 from './pages/inspection/pm2/Pm2';
import Pm2Form from './pages/inspection/pm2/Pm2Form';
import Pm3Form from './pages/inspection/pm3/Pm3Form';
import Pm3 from './pages/inspection/pm3/Pm3';
import OS3 from './pages/inspection/os3/Os3';

import KPI from './pages/Maintenance/KPI/KPI';
import MasterSparepart from './pages/MasterData/MasterSparepart';
import MasterAnalisis from './pages/MasterData/MasterAnalisis';
import MasterPM1 from './pages/MasterData/MasterPM1';
import MasterPM1Check from './pages/MasterData/MasterPM1Check';
import MasterPM1TambahInspection from './pages/MasterData/MasterPM1TambahInspection';
import Preventive from './pages/inspection/os3/Preventive';
import HistoriPage from './pages/inspection/histori/HistoriPage';
import KPIForm from './pages/Maintenance/KPI/KPIForm';
import KPIInput from './pages/Maintenance/KPI/KPIInput';
import MasterPM2 from './pages/MasterData/MasterPM2';
import PM2Checklist from './components/Tables/MasterData/PM2/PM2Checklist';
import MasterPM2Check from './pages/MasterData/MasterPM2Check';
import MasterPM2TambahInspection from './pages/MasterData/MasterPM2TambahInspection';
import MasterKPI from './pages/MasterData/MasterKPI';
import MasterKPIForm from './pages/MasterData/MasterKPIForm';
import Sparepart from './pages/sparepart/submitOpname';
import MasterUsers from './pages/MasterData/MasterUsers';
import MasterRole from './pages/MasterData/MasterRole';
import Adjustment from './pages/sparepart/adjustment';
import HistoriOpname from './pages/sparepart/crumb/historiOpname';
import CrumbSparepart from './pages/sparepart/crumb/header';
import MainOpname from './pages/sparepart/crumb/main';
import MasterMonitoring from './pages/MasterData/MasterMonitoring';
import SpbService from './pages/Maintenance/SPB/spbService';

import Stockmaster from './pages/sparepart/stockmaster/stockmaster';
import AddStock from './pages/sparepart/stockmaster/addStock';
import MonitoringSparepart from './pages/sparepart/monitoringSparepart/monitoringSparepart';
import AddStockLifetimes from './pages/sparepart/monitoringSparepart/addStock';
import SubmitOpname from './pages/sparepart/submitOpname';
import ProjectMtc from './components/Tables/Maintenance/projectMtc';

import MonitoringService from './pages/sparepart/monitoringService/monitoringService';
import AddStockService from './pages/sparepart/monitoringService/addStock';

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
          path="/maintenance/inspection/pm_2_form"
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
          path="/maintenance/inspection/pm_3_form"
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
                <Pm3 />
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
          path="/quality_control/mtc"
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
