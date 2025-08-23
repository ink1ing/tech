import React from 'react';
import { useAppContext } from '../context/AppContext';
import PageContainer from '../components/PageContainer';

const works = [
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
  },
  { 
    title: '即开即用的LLM', 
    title_en: 'Ready-to-Use LLM',
    url: 'https://grok-3-fast-with-live-search.onrender.com/',
    description: '功能简单，持续开发',
    description_en: 'Simple functionality, continuous development'
  }
];

export default function WorksPage() {
  const { language, isDark } = useAppContext();

  return (
    <PageContainer title="我的作品" titleEn="My Works" language={language} isDark={isDark}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {works.map((work, index) => (
          <a
            key={index}
            href={work.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block rounded-lg p-6 transition-all duration-200 hover:shadow-lg ${
              isDark
                ? 'bg-gray-800 border border-gray-700 hover:bg-gray-750'
                : 'glass-light active:scale-95'
            }`}
          >
            <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
              {language === 'zh' ? work.title : work.title_en}
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-black'}`}>
              {language === 'zh' ? work.description : work.description_en}
            </p>
          </a>
        ))}
      </div>
    </PageContainer>
  );
}
