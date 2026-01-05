import React from 'react';
import { useAppContext } from '../context/AppContext';
import PageContainer from '../components/PageContainer';
import FeatureCard from '../components/FeatureCard';

const works = [
  {
    title: 'anti-api',
    title_en: 'anti-api',
    url: 'https://github.com/ink1ing/anti-api',
    description: '一键将antigravity接入claude code等服务',
    description_en: 'One-click integration of antigravity into claude code and other services'
  },
  {
    title: 'ToTheMoon',
    title_en: 'ToTheMoon',
    url: 'https://tothemoon.ink1ing.tech',
    description: '由 DeepSeek 驱动的加密合约量化交易系统',
    description_en: 'DeepSeek-powered quantitative crypto derivatives trading system'
  },
  {
    title: '懒的冲浪手',
    title_en: 'Laziest brow',
    url: 'https://github.com/ink1ing/laziest-brow',
    description: '超级谷歌导航栏（插件）',
    description_en: 'Super Google Navigation Bar (Extension)'
  },
  {
    title: '大模型能力对比',
    title_en: 'Large Model Capability Comparison',
    url: 'https://ink1ing.github.io/ai-model-comparison/',
    description: '详细对比各种大模型的能力和性能',
    description_en: 'Detailed comparison of various large model capabilities and performance'
  },
  {
    title: '节点订阅转换器',
    title_en: 'Node Subscription Converter',
    url: 'https://github.com/ink1ing/hulink',
    description: '开源的节点订阅转换工具',
    description_en: 'Open-source node subscription conversion tool'
  },
  {
    title: '御三家提示词工程指南精粹',
    title_en: 'Top Three Prompt Engineering Guide Essentials',
    url: 'https://jasper-goldenrod-aa1.notion.site/2100a9798195803eab93d38e9b62cee0?pvs=74',
    description: '提示词工程指南精粹',
    description_en: 'Prompt engineering guide essentials'
  }
];

export default function WorksPage() {
  const { language, isDark } = useAppContext();

  return (
    <PageContainer title="Silas' 作品" titleEn="Silas' Works" language={language} isDark={isDark}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {works.map((work, index) => (
          <FeatureCard
            key={index}
            title={work.title}
            titleEn={work.title_en}
            description={work.description}
            descriptionEn={work.description_en}
            url={work.url}
            language={language}
            isDark={isDark}
            className="h-full"
          />
        ))}
      </div>
    </PageContainer>
  );
}
