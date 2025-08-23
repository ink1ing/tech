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
    email: 'huinkling@yahoo.com'
  };

  // 根据语言设置菜单项
  const menuItems = language === 'zh' ? [
    { path: '/navigation', label: '导航站' },
    { path: '/about', label: '关于我' },
    { path: '/works', label: '我的作品' },
    { path: '/experience', label: '我的经验' },
    { path: '/thoughts', label: '我的思考' },
    { path: '/other', label: '其他东西' },
    { path: '/private1', label: '私有访问1' },
    { path: '/private2', label: '私有访问2' }
  ] : [
    { path: '/navigation', label: 'Navigation' },
    { path: '/about', label: 'About Me' },
    { path: '/works', label: 'My Works' },
    { path: '/experience', label: 'My Experience' },
    { path: '/thoughts', label: 'My Thoughts' },
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
    }`}>
      {!isDark && (
        <>
          {/* 背景图层：全屏覆盖并模糊 */}
          <div
            className="fixed inset-0 -z-20 pointer-events-none"
            style={{
              backgroundImage: 'url(https://persistent.oaistatic.com/burrito-nux/640.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
              filter: 'blur(14px)',
              transform: 'scale(1.06)'
            }}
          />
          {/* 亮度覆盖层：提高可读性 */}
          <div className="fixed inset-0 -z-10 bg-white/55" />
        </>
      )}
      
      {/* 汉堡菜单按钮 (仅在移动端显示) */}
      {isMobile && (
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`fixed top-4 left-4 z-20 p-2 rounded-md ${
            isDark ? 'bg-gray-800 text-white' : 'bg-transparent border border-gray-300 text-gray-800'
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
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{personalInfo.name}</h2>
                <p className={`text-sm font-bold ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>{personalInfo.email}</p>
              </div>
            </div>

            {/* Dark Mode Toggle and Language Selector */}
            <div className="mb-6 flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setLanguage('zh')}
                  className={`px-3 py-1 rounded-full text-sm font-bold border transition-all ${
                    language === 'zh'
                      ? isDark
                        ? 'bg-transparent text-blue-300 border-blue-800'
                        : 'bg-transparent text-blue-600 border-blue-300'
                      : isDark
                        ? 'text-gray-400 border-transparent hover:bg-white/5'
                        : 'text-gray-500 border-transparent hover:bg-black/5'
                  }`}
                >
                  中文
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-full text-sm font-bold border transition-all ${
                    language === 'en'
                      ? isDark
                        ? 'bg-transparent text-blue-300 border-blue-800'
                        : 'bg-transparent text-blue-600 border-blue-300'
                      : isDark
                        ? 'text-gray-400 border-transparent hover:bg-white/5'
                        : 'text-gray-500 border-transparent hover:bg-black/5'
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
                        : 'text-blue-600 border border-blue-300 bg-transparent'
                      : isDark
                        ? 'text-gray-300 hover:bg-white/5'
                        : 'text-gray-700 hover:bg-black/5'
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
                  className={`w-full px-3 py-2 rounded font-bold transition-all border ${
                    isDark
                      ? 'text-red-300 border-red-800 hover:bg-white/5'
                      : 'text-red-600 border-red-300 hover:bg-black/5'
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
