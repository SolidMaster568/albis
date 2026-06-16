import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '../components/LoadingState';
import { fetchProfile } from '../features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '../hooks/redux';

export const ProtectedRoute = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { token, user, profileStatus } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && !user && profileStatus === 'idle') {
      dispatch(fetchProfile());
    }
  }, [dispatch, profileStatus, token, user]);

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!user || profileStatus === 'loading') {
    return <LoadingState label="Opening workspace" />;
  }

  return <Outlet />;
};
