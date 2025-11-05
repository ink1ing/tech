import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import authService from '../services/authService';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isDark, setIsDark, language, setLanguage, isAuthenticated, setIsAuthenticated } = useAppContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const navigate = useNavigate();
  const location = useLocation();

  // 设置默认侧边栏状态
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const personalInfo = {
    name: 'INK',
    email: 'ink@ink1ing.tech'
  };

  // 根据语言设置菜单项
  const menuItems = language === 'zh' ? [
    { path: '/navigation', label: '导航站' },
    { path: '/about', label: '关于我' },
    { path: '/works', label: '我的作品' },
    { path: '/experience', label: '我的经验' },
    { path: '/thoughts', label: '我的思考' },
    { path: '/myprompt', label: '我的提示词' },
    { path: '/other', label: '其他东西' },
    { path: '/private1', label: '私有访问1' },
    { path: '/private2', label: '私有访问2' }
  ] : [
    { path: '/navigation', label: 'Navigation' },
    { path: '/about', label: 'About Me' },
    { path: '/works', label: 'My Works' },
    { path: '/experience', label: 'My Experience' },
    { path: '/thoughts', label: 'My Thoughts' },
    { path: '/myprompt', label: 'My Prompt' },
    { path: '/other', label: 'Other Stuff' },
    { path: '/private1', label: 'Private Access 1' },
    { path: '/private2', label: 'Private Access 2' }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    
    // 在移动端点击菜单项后关闭侧边栏
    if (isMobile) {
      setIsSidebarOpen(false);
    }
    
    // 如果切换到非私有页面，清除所有认证状态
    if (!path.startsWith('/private')) {
      authService.clearAuth();
      setIsAuthenticated(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    navigate('/navigation');
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-200 relative ${
      isDark ? 'bg-gray-900' : ''
    }`}
    style={isDark ? {} : {
      backgroundImage: 'url(https://persistent.oaistatic.com/burrito-nux/640.webp)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {!isDark && (
        // 覆盖层：对背景图做模糊并加一层浅色以提升可读性
        <div className="fixed inset-0 -z-10 bg-white/55 backdrop-blur-[12px]" />
      )}
      
      {/* 汉堡菜单按钮 (仅在移动端显示) */}
      {isMobile && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed top-4 left-4 z-20 p-2 rounded-md active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 ${
            isDark ? 'bg-gray-800 text-white' : 'glass-light text-black'
          } shadow-md`}
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      )}
      
      {/* Left Sidebar */}
      <div className={`
        ${isMobile ? 'absolute z-10 h-full' : 'relative'}
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'}
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-transparent border-gray-200'}
        border-r p-6
      `}>
        {isSidebarOpen && (
          <>
            {/* Profile Section */}
            <div className="flex items-center mb-8">
              <div>
                <h2 className={`text-xl font-bold ${
                  isDark ? 'text-white' : 'text-black'
                }`}>{personalInfo.name}</h2>
                <p className={`text-sm font-bold ${
                  isDark ? 'text-gray-400' : 'text-black'
                }`}>{personalInfo.email}</p>
              </div>
            </div>

            {/* Dark Mode Toggle and Language Selector */}
            <div className="mb-6 flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setLanguage('zh')}
                  className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                    language === 'zh'
                      ? isDark
                        ? 'bg-transparent text-blue-300 border border-blue-800'
                        : 'glass-light text-black'
                      : isDark
                        ? 'text-gray-400 border border-transparent hover:bg-white/5'
                        : 'glass-light text-black'
                  }`}
                >
                  中文
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                    language === 'en'
                      ? isDark
                        ? 'bg-transparent text-blue-300 border border-blue-800'
                        : 'glass-light text-black'
                      : isDark
                        ? 'text-gray-400 border border-transparent hover:bg-white/5'
                        : 'glass-light text-black'
                  }`}
                >
                  EN
                </button>
              </div>
              <button
                onClick={() => setIsDark(!isDark)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 flex items-center ${
                  isDark ? 'bg-gray-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform duration-200 flex items-center justify-center ${
                  isDark 
                    ? 'bg-gray-700 translate-x-6 text-white' 
                    : 'bg-white translate-x-0 text-gray-600'
                }`}>
                  {isDark ? <Moon className="w-2 h-2" /> : <Sun className="w-2 h-2" />}
                </div>
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              {menuItems.map((item) => (
                <div
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`px-3 py-2 rounded font-bold cursor-pointer transition-all select-none ${
                    location.pathname === item.path
                      ? isDark 
                        ? 'text-blue-300 border border-blue-800 bg-transparent' 
                        : 'glass-light text-black'
                      : isDark
                        ? 'text-gray-300 hover:bg-white/5'
                        : 'text-black hover:bg-white/50'
                  } active:scale-95`}
                >
                  {item.label}
                </div>
              ))}
            </nav>

            {/* 登出按钮 (仅在已认证时显示) */}
            {isAuthenticated && (
              <div className="mt-6 pt-6 border-t border-gray-600">
                <button
                  onClick={handleLogout}
                  className={`w-full px-3 py-2 rounded font-bold transition-all ${
                    isDark
                      ? 'text-red-300 border border-red-800 hover:bg-white/5'
                      : 'glass-light text-black'
                  }`}
                >
                  {language === 'zh' ? '登出' : 'Logout'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 p-8 transition-all duration-300 ${isMobile ? 'pt-16' : ''}`}>
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
