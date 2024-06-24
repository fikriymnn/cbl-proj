import { useEffect, useState } from 'react';
import axios from 'axios';

import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: any }) => {
  let location = useLocation();

  const [auth, setAuth] = useState(true);
  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const data = await axios.get(`${import.meta.env.VITE_API_LINK}/me`, {
        withCredentials: true,
      });
      console.log(data);
      setAuth(true);
    } catch (error: any) {
      console.log(error.message);
      setAuth(false);
    }
  };

  if (auth === false) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
};

export default ProtectedRoute;
