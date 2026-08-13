import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, register, logout, getProfile, clearError } from '../features/auth/authSlice';
import { clearGuestCart } from '../features/cart/cartSlice';
import { clearWishlistState } from '../features/wishlist/wishlistSlice';
import { useCallback } from 'react';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  const handleLogin = useCallback(
    async (credentials) => {
      const result = await dispatch(login(credentials));
      if (login.fulfilled.match(result)) {
        await dispatch(getProfile());
        navigate('/');
        return true;
      }
      return false;
    },
    [dispatch, navigate]
  );

  const handleRegister = useCallback(
    async (userData) => {
      const result = await dispatch(register(userData));
      if (register.fulfilled.match(result)) {
        navigate('/login');
        return true;
      }
      return false;
    },
    [dispatch, navigate]
  );

  const handleLogout = useCallback(() => {
    dispatch(logout());
    dispatch(clearGuestCart());
    dispatch(clearWishlistState());
    navigate('/login');
  }, [dispatch, navigate]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError: handleClearError,
  };
};

export default useAuth;
