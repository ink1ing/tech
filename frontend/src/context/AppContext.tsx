import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// 全局应用状态接口
interface AppContextType {
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  language: 'zh' | 'en';
  setLanguage: (lang: 'zh' | 'en') => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  checkAuth: () => Promise<void>;
}

// 创建Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider组件
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const [language, setLanguage] = useState<'zh' | 'en'>('en');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 检查认证状态
  const checkAuth = async () => {
    try {
      const result = await authService.verifyToken();
      setIsAuthenticated(result.valid);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  // 初始化检查认证状态
  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    isDark,
    setIsDark,
    language,
    setLanguage,
    isAuthenticated,
    setIsAuthenticated,
    checkAuth,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// 自定义Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}