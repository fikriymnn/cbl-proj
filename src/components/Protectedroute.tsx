import { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Checks if the current path is allowed based on the user's menu from localStorage.
 * If useCustomMenu is false, all routes pass (role-based via rbacConfig).
 * If useCustomMenu is true, the current path must match one of the stored menu paths.
 */
function isRouteAllowed(pathname: string): boolean {
  const useCustomMenu = localStorage.getItem('useCustomMenu');

  // No custom menu restriction — allow all (rbacConfig handles it)
  if (useCustomMenu !== 'true') return true;

  const rawMenu = localStorage.getItem('userMenu');
  if (!rawMenu) return false;

  try {
    const menu: Array<{ path?: string; route?: string; children?: any[] }> =
      JSON.parse(rawMenu);

    // Flatten all paths from menu (including nested children)
    const allPaths: string[] = [];

    function extractPaths(items: any[]) {
      for (const item of items) {
        if (item.path) allPaths.push(item.path);
        if (item.route) allPaths.push(item.route);
        if (item.children && Array.isArray(item.children)) {
          extractPaths(item.children);
        }
      }
    }

    extractPaths(menu);

    // Allow if exact match or pathname starts with an allowed path
    return allPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
  } catch {
    return false;
  }
}

const ProtectedRoute = ({ children }: { children: any }) => {
  const location = useLocation();
  const [authState, setAuthState] = useState<
    'loading' | 'authenticated' | 'unauthenticated'
  >('loading');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      await axios.get(`${import.meta.env.VITE_API_LINK}/me`, {
        withCredentials: true,
      });
      setAuthState('authenticated');
    } catch (error: any) {
      // Clear stale localStorage on auth failure
      localStorage.removeItem('userMenu');
      localStorage.removeItem('useCustomMenu');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userBagian');
      setAuthState('unauthenticated');
    }
  };

  // Still checking auth
  if (authState === 'loading') {
    return null; // Or a spinner: <div className="flex justify-center items-center h-screen"><Loader /></div>
  }

  // Not logged in at all → back to login
  if (authState === 'unauthenticated') {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Logged in but route not in their menu → back to login (or /dashboard)
  if (!isRouteAllowed(location.pathname)) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
