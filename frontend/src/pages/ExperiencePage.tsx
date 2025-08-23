import React from 'react';
import { useAppContext } from '../context/AppContext';
import PageContainer from '../components/PageContainer';

const experiences = [
  { 
    title: '低价订阅ChatGPT', 
    title_en: 'Low-Cost ChatGPT Subscription',
    url: 'https://github.com/ink1ing/cheapgpt',
    description: '提供低价ChatGPT订阅方案',
    description_en: 'Provides low-cost ChatGPT subscription solutions'
  },
  { 
    title: 'Apple Watch不完全攻略', 
    title_en: 'Apple Watch Incomplete Guide',
    url: 'https://jasper-goldenrod-aa1.notion.site/1f60a9798195800585bede410d27d932?source=copy_link',
    description: 'Apple Watch使用技巧和攻略',
    description_en: 'Apple Watch usage tips and guide'
  }
];

export default function ExperiencePage() {
  const { language, isDark } = useAppContext();

  return (
    <PageContainer title="我的经验" titleEn="My Experience" language={language} isDark={isDark}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {experiences.map((exp, index) => (
          <a
            key={index}
            href={exp.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block rounded-lg p-6 transition-all duration-200 hover:shadow-lg ${
              isDark
                ? 'bg-gray-800 border border-gray-700 hover:bg-gray-750'
                : 'glass-light active:scale-95'
            }`}
          >
            <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
              {language === 'zh' ? exp.title : exp.title_en}
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-black'}`}>
              {language === 'zh' ? exp.description : exp.description_en}
            </p>
          </a>
        ))}
      </div>
    </PageContainer>
  );
}
