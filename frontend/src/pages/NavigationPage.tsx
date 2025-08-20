import React from 'react';
import { useAppContext } from '../context/AppContext';
import PageContainer from '../components/PageContainer';

const navigationLinks = [
  { 
    title: 'GPT', 
    title_en: 'GPT',
    url: 'https://chat.com',
    description: '最全能的',
    description_en: 'The most versatile'
  },
  { 
    title: 'Claude',
    title_en: 'Claude',
    url: 'https://claude.ai',
    description: '最多Dev用',
    description_en: 'Most used by Devs'
  },
  { 
    title: 'Gemini',
    title_en: 'Gemini',
    url: 'https://ai.google.dev',
    description: '最慷慨的',
    description_en: 'The most generous'
  },
  { 
    title: 'Grok',
    title_en: 'Grok',
    url: 'https://grok-ai.app',
    description: '最强大的',
    description_en: 'The most powerful'
  },
  { 
    title: 'PPLX (Perplexity)',
    title_en: 'PPLX (Perplexity)',
    url: 'https://perplexity.ai',
    description: '最准确的',
    description_en: 'The most accurate'
  },
  { 
    title: 'Cursor',
    title_en: 'Cursor',
    url: 'https://cursor.com',
    description: '首个AI IDE',
    description_en: 'First AI IDE'
  },
  { 
    title: 'iCloud',
    title_en: 'iCloud',
    url: 'https://icloud.com',
    description: '苹果云数据管理',
    description_en: 'Apple cloud data management'
  },
  { 
    title: 'Crypto Price',
    title_en: 'Crypto Price',
    url: 'https://www.528btc.com/coin/',
    description: '获悉加密货币价格',
    description_en: 'Get cryptocurrency prices'
  },
  { 
    title: 'Chrome Download',
    title_en: 'Chrome Download',
    url: 'https://www.google.com/chrome/',
    description: '下载最多人用的浏览器',
    description_en: 'Download the most used browser'
  },
  { 
    title: 'Z-Library',
    title_en: 'Z-Library',
    url: 'https://z-library.ec/',
    description: '最大&完全免费的图书馆',
    description_en: 'The largest & completely free library'
  }
];

export default function NavigationPage() {
  const { language, isDark } = useAppContext();

  return (
    <PageContainer title="导航站" titleEn="Navigation" language={language} isDark={isDark}>
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
              {language === 'zh' ? link.title : link.title_en}
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {language === 'zh' ? link.description : link.description_en}
            </p>
          </a>
        ))}
      </div>
    </PageContainer>
  );
}