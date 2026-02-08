import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../utils/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        const result = await authService.getCurrentUser();
        if (result.success) {
          setUser(result.user);
          setIsAuthenticated(true);
        } else {
          authService.removeToken();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (identifier, password) => {
    setLoading(true);
    try {
      const result = await authService.login(identifier, password);

      if (result.success) {
        setUser(result.user);
        setIsAuthenticated(true);
      }

      setLoading(false);
      return result;
    } catch (error) {
      setLoading(false);
      return { success: false, error: 'UNEXPECTED_ERROR', message: error.message };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    const result = await authService.register(userData);

    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }

    setLoading(false);
    return result;
  };

  const refreshUser = async () => {
    if (authService.isAuthenticated()) {
      const result = await authService.getCurrentUser();
      if (result.success) {
        setUser(result.user);
        return true;
      }
    }
    return false;
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      authService.removeToken();
      sessionStorage.clear();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    authService,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
