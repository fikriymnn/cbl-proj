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
import Pm1 from './pages/inspection/Pm1';

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

              <ECommerce />
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
          path="/inspection/pm_1"
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
          path="/maintenance/material"
          element={
            <>
              <PageTitle title="PT CBL" />
              <ProtectedRoute>
                <Material />
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
          path="/quality_control/maintenance"
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
          path="/cobain"
          element={
            <>
              <PageTitle title="PT CBL" />
              <Cobain />
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
