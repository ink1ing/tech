import React, { useState, useEffect } from 'react';
import { User, Calendar, Globe, MessageSquare, Sun, Moon, Twitter, Github, Mail, Lock } from 'lucide-react';
import authService from '../services/authService';

export default function PersonalInfoPage() {
  const [isDark, setIsDark] = useState(true);
  const [activeSection, setActiveSection] = useState('Navigation');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [language, setLanguage] = useState<'zh' | 'en'>('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [protectedContent, setProtectedContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 检查是否为手机竖屏
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // 设置默认侧边栏状态
  React.useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  // 监听窗口大小变化
  React.useEffect(() => {
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

  // 组件加载时检查是否已有有效token
  useEffect(() => {
    const checkAuth = async () => {
      const result = await authService.verifyToken();
      if (result.valid) {
        setIsAuthenticated(true);
        const section = authService.getCurrentSection();
        if (section) {
          setActiveSection(section);
        }
      }
    };
    
    checkAuth();
  }, []);

  // 根据语言设置菜单项
  const getMenuItems = () => {
    return language === 'zh' ? [
      '导航站',
      '关于我',
      '我的作品', 
      '我的经验',
      '我的思考',
      '其他东西',
      '私有访问1',
      '私有访问2'
    ] : [
      'Navigation',
      'About Me',
      'My Works', 
      'My Experience',
      'My Thoughts',
      'Other Stuff',
      'Private Access 1',
      'Private Access 2'
    ];
  };

  const menuItems = getMenuItems();

  const personalInfo = {
    name: 'INK',
    birthDate: language === 'zh' ? '2002年2月2日' : 'February 2, 2002',
    country: language === 'zh' ? '美国' : 'United States',
    language: language === 'zh' ? '简体中文 - 中文（简体）' : 'Simplified Chinese - Chinese (Simplified)',
    email: 'huinkling@yahoo.com'
  };

  const socialLinks = language === 'zh' ? [
    { name: 'X', url: 'https://x.com/Ink_thesilent', icon: Twitter },
    { name: 'Github', url: 'https://github.com/ink1ing', icon: Github },
    { name: 'Mail', url: 'mailto:huinkling@yahoo.com', icon: Mail }
  ] : [
    { name: 'X', url: 'https://x.com/Ink_thesilent', icon: Twitter },
    { name: 'Github', url: 'https://github.com/ink1ing', icon: Github },
    { name: 'Mail', url: 'mailto:huinkling@yahoo.com', icon: Mail }
  ];

  const works = language === 'zh' ? [
    { 
      title: '大模型能力对比', 
      url: 'https://ink1ing.github.io/ai-model-comparison/',
      description: '详细对比各种大模型的能力和性能'
    },
    { 
      title: '节点订阅转换器', 
      url: 'https://github.com/ink1ing/hulink',
      description: '开源的节点订阅转换工具'
    },
    { 
      title: '御三家提示词工程指南精粹', 
      url: 'https://jasper-goldenrod-aa1.notion.site/2100a9798195803eab93d38e9b62cee0?pvs=74',
      description: '提示词工程指南精粹'
    },
    { 
      title: '即开即用的LLM', 
      url: 'https://grok-3-fast-with-live-search.onrender.com/',
      description: '功能简单，持续开发'
    }
  ] : [
    { 
      title: 'Large Model Capability Comparison', 
      url: 'https://ink1ing.github.io/ai-model-comparison/',
      description: 'Detailed comparison of various large model capabilities and performance'
    },
    { 
      title: 'Node Subscription Converter', 
      url: 'https://github.com/ink1ing/hulink',
      description: 'Open-source node subscription conversion tool'
    },
    { 
      title: 'Top Three Prompt Engineering Guide Essentials', 
      url: 'https://jasper-goldenrod-aa1.notion.site/2100a9798195803eab93d38e9b62cee0?pvs=74',
      description: 'Prompt engineering guide essentials'
    },
    { 
      title: 'Ready-to-Use LLM', 
      url: 'https://grok-3-fast-with-live-search.onrender.com/',
      description: 'Simple functionality, continuous development'
    }
  ];

  const experiences = language === 'zh' ? [
    { 
      title: '低价订阅ChatGPT', 
      url: 'https://github.com/ink1ing/cheapgpt',
      description: '提供低价ChatGPT订阅方案'
    },
    { 
      title: 'Apple Watch不完全攻略', 
      url: 'https://jasper-goldenrod-aa1.notion.site/1f60a9798195800585bede410d27d932?source=copy_link',
      description: 'Apple Watch使用技巧和攻略'
    },
    { 
      title: 'Claude最强镜像', 
      url: 'https://demo.fuclaude.com',
      description: '需要sessionkey访问'
    }
  ] : [
    { 
      title: 'Low-Cost ChatGPT Subscription', 
      url: 'https://github.com/ink1ing/cheapgpt',
      description: 'Provides low-cost ChatGPT subscription solutions'
    },
    { 
      title: 'Apple Watch Incomplete Guide', 
      url: 'https://jasper-goldenrod-aa1.notion.site/1f60a9798195800585bede410d27d932?source=copy_link',
      description: 'Apple Watch usage tips and guide'
    },
    { 
      title: 'Claude Best Mirror', 
      url: 'https://demo.fuclaude.com',
      description: 'Requires sessionkey access'
    }
  ];

  const affiliateLinks = language === 'zh' ? [
    { 
      title: 'Binance返佣', 
      url: 'https://www.binance.com/zh-CN/futures/ref/863583772',
      description: 'Binance期货返佣链接'
    },
    { 
      title: 'OKX返佣', 
      url: 'https://ouydl.me/ul/YbU25D?channelId=25355853',
      description: 'OKX返佣链接'
    },
    { 
      title: '推荐节点', 
      url: 'https://fbinv02.fbaff.cc/auth/register?code=LAFDdJC7',
      description: '高速稳定网络节点'
    },
    { 
      title: 'clash-verge下载', 
      url: 'https://github.com/clash-verge-rev/clash-verge-rev',
      description: '最先进的桌面端代理'
    }
  ] : [
    { 
      title: 'Binance Referral', 
      url: 'https://www.binance.com/zh-CN/futures/ref/863583772',
      description: 'Binance futures referral link'
    },
    { 
      title: 'OKX Referral', 
      url: 'https://ouydl.me/ul/YbU25D?channelId=25355853',
      description: 'OKX referral link'
    },
    { 
      title: 'Recommended Nodes', 
      url: 'https://fbinv02.fbaff.cc/auth/register?code=LAFDdJC7',
      description: 'High-speed and stable network nodes'
    },
    { 
      title: 'clash-verge Download', 
      url: 'https://github.com/clash-verge-rev/clash-verge-rev',
      description: 'The most advanced desktop proxy'
    }
  ];

  const navigationLinks = language === 'zh' ? [
    { 
      title: 'GPT', 
      url: 'https://chat.com',
      description: '最全能的'
    },
    { 
      title: 'Claude',
      url: 'https://claude.ai',
      description: '最多Dev用'
    },
    { 
      title: 'Gemini',
      url: 'https://ai.google.dev',
      description: '最慷慨的'
    },
    { 
      title: 'Grok',
      url: 'https://grok-ai.app',
      description: '最强大的'
    },
    { 
      title: 'PPLX (Perplexity)',
      url: 'https://perplexity.ai',
      description: '最准确的'
    },
    { 
      title: 'Cursor',
      url: 'https://cursor.com',
      description: '首个AI IDE'
    },
    { 
      title: 'iCloud',
      url: 'https://icloud.com',
      description: '苹果云数据管理'
    },
    { 
      title: 'Crypto Price',
      url: 'https://www.528btc.com/coin/',
      description: '获悉加密货币价格'
    },
    { 
      title: 'Chrome Download',
      url: 'https://www.google.com/chrome/',
      description: '下载最多人用的浏览器'
    },
    { 
      title: 'Z-Library',
      url: 'https://z-library.ec/',
      description: '最大&完全免费的图书馆'
    }
  ] : [
    { 
      title: 'GPT', 
      url: 'https://chat.com',
      description: 'The most versatile'
    },
    { 
      title: 'Claude',
      url: 'https://claude.ai',
      description: 'Most used by Devs'
    },
    { 
      title: 'Gemini',
      url: 'https://ai.google.dev',
      description: 'The most generous'
    },
    { 
      title: 'Grok',
      url: 'https://grok-ai.app',
      description: 'The most powerful'
    },
    { 
      title: 'PPLX (Perplexity)',
      url: 'https://perplexity.ai',
      description: 'The most accurate'
    },
    { 
      title: 'Cursor',
      url: 'https://cursor.com',
      description: 'First AI IDE'
    },
    { 
      title: 'iCloud',
      url: 'https://icloud.com',
      description: 'Apple cloud data management'
    },
    { 
      title: 'Crypto Price',
      url: 'https://www.528btc.com/coin/',
      description: 'Get cryptocurrency prices'
    },
    { 
      title: 'Chrome Download',
      url: 'https://www.google.com/chrome/',
      description: 'Download the most used browser'
    },
    { 
      title: 'Z-Library',
      url: 'https://z-library.ec/',
      description: 'The largest & completely free library'
    }
  ];

  // 安全的密码提交处理 - 使用API验证
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 根据当前区域确定section参数
      let section = activeSection;
      if (activeSection === '私有访问1' || activeSection === 'Private Access 1') {
        section = 'private1';
      } else if (activeSection === '私有访问2' || activeSection === 'Private Access 2') {
        section = 'private2';
      }

      const result = await authService.login(password, section);
      
      if (result.success) {
        setIsAuthenticated(true);
        setPassword('');
        // 获取受保护内容
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

  // 加载受保护内容
  const loadProtectedContent = async () => {
    try {
      const content = await authService.getProtectedContent();
      setProtectedContent(content);
    } catch (error) {
      console.error('Failed to load protected content:', error);
      setError(language === 'zh' ? '加载内容失败' : 'Failed to load content');
    }
  };

  // 切换区域时的处理
  const handleSectionChange = (item: string) => {
    setActiveSection(item);
    
    // 如果切换到非私有页面，重置认证状态
    const protectedPages = ['私有访问1', '私有访问2', 'Private Access 1', 'Private Access 2'];
    if (!protectedPages.includes(item)) {
      setIsAuthenticated(false);
      setPassword('');
      setProtectedContent(null);
      setError('');
    } else {
      // 如果切换到不同的私有区域，也需要重新验证
      const currentSection = authService.getCurrentSection();
      const newSection = item === '私有访问1' || item === 'Private Access 1' ? 'private1' : 'private2';
      
      if (currentSection !== newSection) {
        setIsAuthenticated(false);
        setPassword('');
        setProtectedContent(null);
        setError('');
        authService.clearAuth();
      }
    }
    
    // 在移动端点击菜单项后关闭侧边栏
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const renderContent = () => {
    // 检查是否是受密码保护的页面
    const isProtectedPage = activeSection === '私有访问1' || activeSection === '私有访问2' || 
                           activeSection === 'Private Access 1' || activeSection === 'Private Access 2';
    
    if (isProtectedPage && !isAuthenticated) {
      return (
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
      );
    }

    // 其他页面的渲染逻辑保持不变...
    if (activeSection === '导航站' || activeSection === 'Navigation') {
      return (
        <div>
          <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'zh' ? '导航站' : 'Navigation'}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {navigationLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block border rounded-lg p-6 transition-all duration-200 hover:shadow-lg ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    : 'bg-white bg-opacity-30 backdrop-blur-sm border-gray-200 hover:bg-opacity-50'
                }`}
              >
                <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {link.title}
                </h2>
                <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {link.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      );
    } else if (activeSection === '关于我' || activeSection === 'About Me') {
      return (
        <div>
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'zh' ? '关于我' : 'About Me'}
          </h1>
          <p className={`font-bold mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {language === 'zh' 
              ? '每一个所谓起舞的日子都是对世俗的拥护' 
              : 'Each day we choose to dance deliberately is a day we embrace worldly conformity.'}
          </p>

          <div>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {language === 'zh' ? '联系方式' : 'Contact Information'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center p-4 rounded-lg border transition-colors duration-200 ${
                      isDark
                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                        : 'bg-white bg-opacity-30 backdrop-blur-sm border-gray-200 hover:bg-opacity-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-blue-500 mr-3" />
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {link.name}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      );
    } else if (activeSection === '我的作品' || activeSection === 'My Works') {
      return (
        <div>
          <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'zh' ? '我的作品' : 'My Works'}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {works.map((work, index) => (
              <a
                key={index}
                href={work.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block border rounded-lg p-6 transition-all duration-200 hover:shadow-lg ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    : 'bg-white bg-opacity-30 backdrop-blur-sm border-gray-200 hover:bg-opacity-50'
                }`}
              >
                <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {work.title}
                </h2>
                <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {work.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      );
    } else if (activeSection === '我的经验' || activeSection === 'My Experience') {
      return (
        <div>
          <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'zh' ? '我的经验' : 'My Experience'}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {experiences.map((exp, index) => (
              <a
                key={index}
                href={exp.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block border rounded-lg p-6 transition-all duration-200 hover:shadow-lg ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    : 'bg-white bg-opacity-30 backdrop-blur-sm border-gray-200 hover:bg-opacity-50'
                }`}
              >
                <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {exp.title}
                </h2>
                <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {exp.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      );
    } else if (activeSection === '其他东西' || activeSection === 'Other Stuff') {
      return (
        <div>
          <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {language === 'zh' ? '其他东西' : 'Other Stuff'}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {affiliateLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block border rounded-lg p-6 transition-all duration-200 hover:shadow-lg ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                    : 'bg-white bg-opacity-30 backdrop-blur-sm border-gray-200 hover:bg-opacity-50'
                }`}
              >
                <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {link.title}
                </h2>
                <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {link.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      );
    } else if (isProtectedPage && isAuthenticated) {
      // 安全的受保护内容渲染
      const renderProtectedLinks = () => {
        if (!protectedContent || !protectedContent.links) {
          return (
            <div className="text-center py-8">
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {language === 'zh' ? '加载中...' : 'Loading...'}
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
          <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {activeSection}
          </h1>
          <div className="grid grid-cols-1 gap-6">
            {renderProtectedLinks()}
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-64">
          <p className={`text-xl font-bold ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {activeSection} - {language === 'zh' ? '页面内容待开发' : 'Page content under development'}
          </p>
        </div>
      );
    }
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
      <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm -z-10"></div>
    )}
    
    {/* 汉堡菜单按钮 (仅在移动端显示) */}
    {isMobile && (
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-4 left-4 z-20 p-2 rounded-md ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
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
      ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white bg-opacity-30 backdrop-blur-sm border-gray-200'}
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
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                language === 'zh'
                  ? isDark
                    ? 'bg-blue-900 text-blue-300'
                    : 'bg-blue-50 text-blue-600'
                  : isDark
                    ? 'text-gray-400 hover:bg-gray-700'
                    : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              中文
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-full text-sm font-bold ${
                language === 'en'
                  ? isDark
                    ? 'bg-blue-900 text-blue-300'
                    : 'bg-blue-50 text-blue-600'
                  : isDark
                    ? 'text-gray-400 hover:bg-gray-700'
                    : 'text-gray-500 hover:bg-gray-200'
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
              key={item}
              onClick={() => handleSectionChange(item)}
              className={`px-3 py-2 rounded font-bold cursor-pointer transition-colors ${
                activeSection === item
                  ? isDark 
                    ? 'bg-blue-900 text-blue-300 border border-blue-800' 
                    : 'bg-blue-50 text-blue-600 border border-blue-200'
                  : isDark
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item}
            </div>
          ))}
        </nav>

        {/* 登出按钮 (仅在已认证时显示) */}
        {isAuthenticated && (
          <div className="mt-6 pt-6 border-t border-gray-600">
            <button
              onClick={() => {
                authService.logout();
                setIsAuthenticated(false);
                setProtectedContent(null);
                setPassword('');
                setError('');
                setActiveSection('Navigation');
              }}
              className={`w-full px-3 py-2 rounded font-bold transition-colors ${
                isDark
                  ? 'bg-red-800 text-red-300 hover:bg-red-700'
                  : 'bg-red-100 text-red-600 hover:bg-red-200'
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
        {renderContent()}
      </div>
    </div>
  </div>
  );
}