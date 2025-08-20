import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import authService from '../services/authService';

interface PrivateAccessPageProps {
  section: 'private1' | 'private2';
}

export default function PrivateAccessPage({ section }: PrivateAccessPageProps) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [protectedContent, setProtectedContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [contentLoading, setContentLoading] = useState(false);
  
  const { language, isDark } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  // 检查当前页面的认证状态
  useEffect(() => {
    const checkAuthForCurrentSection = async () => {
      try {
        const result = await authService.verifyToken();
        const currentSection = authService.getCurrentSection();
        
        // 只有当前section匹配时才认为已认证
        const isValidAuth = result.valid && currentSection === section;
        
        console.log('🔍 认证检查:', {
          tokenValid: result.valid,
          currentSection,
          requiredSection: section,
          isValidAuth
        });
        
        setIsAuthenticated(isValidAuth);
        
        if (isValidAuth) {
          await loadProtectedContent();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      }
    };
    
    // 每次进入页面都重新检查认证状态
    checkAuthForCurrentSection();
  }, [section, location.pathname]);

  // 加载受保护内容
  const loadProtectedContent = async () => {
    setContentLoading(true);
    setError('');
    
    try {
      console.log('🔄 加载受保护内容...');
      const content = await authService.getProtectedContent();
      console.log('✅ 内容加载成功:', content);
      setProtectedContent(content);
    } catch (error) {
      console.error('❌ 内容加载失败:', error);
      setError(language === 'zh' ? '加载内容失败，请重试' : 'Failed to load content, please try again');
      // 如果是认证错误，清除认证状态
      if (error.message.includes('授权') || error.message.includes('Unauthorized')) {
        setIsAuthenticated(false);
        authService.clearAuth();
      }
    } finally {
      setContentLoading(false);
    }
  };

  // 处理密码提交
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 尝试登录...', section);
      const result = await authService.login(password, section);
      
      if (result.success) {
        console.log('✅ 登录成功');
        setIsAuthenticated(true);
        setPassword('');
        await loadProtectedContent();
      } else {
        setError(result.error || (language === 'zh' ? '密码错误，请重试' : 'Incorrect password, please try again'));
      }
    } catch (error) {
      setError(language === 'zh' ? '网络错误，请重试' : 'Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  // 获取页面标题
  const getPageTitle = () => {
    if (section === 'private1') {
      return language === 'zh' ? '私有访问1' : 'Private Access 1';
    } else {
      return language === 'zh' ? '私有访问2' : 'Private Access 2';
    }
  };

  // 如果未认证，显示登录表单
  if (!isAuthenticated) {
    return (
      <div>
        <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {getPageTitle()}
        </h1>
        
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className={`text-2xl font-bold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'zh' ? '私有访问区域' : 'Private Access Area'}
          </h2>
          <p className={`text-center mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'zh' ? '此区域需要密码才能访问' : 'This area requires a password to access'}
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {language === 'zh' ? '访问密码' : 'Access Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50`}
                placeholder={language === 'zh' ? '请输入访问密码' : 'Please enter access password'}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              {loading ? (language === 'zh' ? '验证中...' : 'Verifying...') : (language === 'zh' ? '进入' : 'Enter')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 认证成功后显示受保护内容
  const renderProtectedContent = () => {
    if (contentLoading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'zh' ? '加载中...' : 'Loading...'}
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
          <button
            onClick={loadProtectedContent}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {language === 'zh' ? '重试' : 'Retry'}
          </button>
        </div>
      );
    }

    if (!protectedContent || !protectedContent.links || protectedContent.links.length === 0) {
      return (
        <div className="text-center py-8">
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'zh' ? '暂无内容' : 'No content available'}
          </p>
        </div>
      );
    }

    return protectedContent.links.map((link: any, index: number) => {
      const handleCopyLink = () => {
        navigator.clipboard.writeText(link.url);
        alert(language === 'zh' ? '链接已复制到剪贴板' : 'Link copied to clipboard');
      };

      return (
        <div 
          key={index}
          onClick={handleCopyLink}
          className={`block border rounded-lg p-6 transition-all duration-200 hover:shadow-lg cursor-pointer ${
            isDark
              ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
              : 'bg-white bg-opacity-30 backdrop-blur-sm border-gray-200 hover:bg-opacity-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {language === 'zh' ? link.title : link.title_en}
              </h2>
              <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {language === 'zh' ? link.description : link.description_en}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-bold ${
              isDark
                ? 'bg-blue-600 text-white'
                : 'bg-blue-500 text-white'
            }`}>
              {language === 'zh' ? '复制' : 'Copy'}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {getPageTitle()}
        </h1>
        <div className={`px-3 py-1 rounded-full text-sm ${
          isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
        }`}>
          ✅ {language === 'zh' ? '已认证' : 'Authenticated'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {renderProtectedContent()}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
          {language === 'zh' 
            ? '🔒 此页面受安全保护，认证状态将在24小时后自动过期' 
            : '🔒 This page is securely protected, authentication will expire automatically after 24 hours'}
        </p>
      </div>
    </div>
  );
}