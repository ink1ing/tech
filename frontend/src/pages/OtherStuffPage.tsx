import React from 'react';
import { useAppContext } from '../context/AppContext';
import PageContainer from '../components/PageContainer';

const affiliateLinks = [
  {
    title: 'PPLX PRO 一个月试用',
    title_en: 'PPLX Pro 1-Month Trial',
    url: 'https://perplexity.ai/pro?referral_code=BD8D23V3',
    description: '免费获得 1 个月试用资格（$20 额度）',
    description_en: 'Get 1 month free ($20 credit)'
  },
  {
    title: 'Gemini Pro 一个月试用',
    title_en: 'Gemini Pro 1-Month Trial',
    url: 'https://g.co/g1referral/M18L9AFX',
    description: '免费获得 1 个月试用资格（$80 额度）',
    description_en: 'Get 1 month free ($80 credit)'
  },
  {
    title: '500万 Tokens 旗舰 LLM 访问',
    title_en: '5,000,000 Tokens Multi‑LLM Access',
    url: 'https://wisdom-gate.juheapi.com?i=4n2K',
    description: '免费获得各家旗舰 LLM 访问权（合计 500 万 Tokens）',
    description_en: 'Free access to flagship LLMs (total 5M tokens)'
  },
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
  const { language, isDark } = useAppContext();

  return (
    <PageContainer title="其他东西" titleEn="Other Stuff" language={language} isDark={isDark}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {affiliateLinks.map((link, index) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block rounded-lg p-6 transition-all duration-200 hover:shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 active:scale-95 ${
              isDark
                ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
                : 'glass-light'
            }`}
          >
            <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
              {language === 'zh' ? link.title : link.title_en}
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-black'}`}>
              {language === 'zh' ? link.description : link.description_en}
            </p>
          </a>
        ))}
      </div>
    </PageContainer>
  );
}
