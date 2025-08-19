import React from 'react';
import PageContainer from '../components/PageContainer';

const affiliateLinks = [
  { 
    title: 'Binance返佣', 
    title_en: 'Binance Referral',
    url: 'https://www.binance.com/zh-CN/futures/ref/863583772',
    description: 'Binance期货返佣链接',
    description_en: 'Binance futures referral link'
  },
  { 
    title: 'OKX返佣', 
    title_en: 'OKX Referral',
    url: 'https://ouydl.me/ul/YbU25D?channelId=25355853',
    description: 'OKX返佣链接',
    description_en: 'OKX referral link'
  },
  { 
    title: '推荐节点', 
    title_en: 'Recommended Nodes',
    url: 'https://fbinv02.fbaff.cc/auth/register?code=LAFDdJC7',
    description: '高速稳定网络节点',
    description_en: 'High-speed and stable network nodes'
  },
  { 
    title: 'clash-verge下载', 
    title_en: 'clash-verge Download',
    url: 'https://github.com/clash-verge-rev/clash-verge-rev',
    description: '最先进的桌面端代理',
    description_en: 'The most advanced desktop proxy'
  }
];

export default function OtherStuffPage() {
  const language: 'zh' | 'en' = 'en';
  const isDark = true;

  return (
    <PageContainer title="其他东西" titleEn="Other Stuff" language={language} isDark={isDark}>
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