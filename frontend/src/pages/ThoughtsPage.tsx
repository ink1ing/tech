import React from 'react';
import { useAppContext } from '../context/AppContext';
import PageContainer from '../components/PageContainer';

const thoughts = [
  {
    title: '1011事件复盘',
    title_en: '1011 Event Retrospective',
    url: 'https://x.com/Ink_thesilent/status/1976941333643419751',
    description: '我熬过了币圈最大规模清算',
    description_en: 'I survived the largest liquidation in crypto history'
  }
];

export default function ThoughtsPage() {
  const { language, isDark } = useAppContext();

  return (
    <PageContainer title="我的思考" titleEn="My Thoughts" language={language} isDark={isDark}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {thoughts.map((thought, index) => (
          <a
            key={index}
            href={thought.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block rounded-lg p-6 transition-all duration-200 hover:shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 active:scale-95 ${
              isDark
                ? 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
                : 'glass-light'
            }`}
          >
            <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>
              {language === 'zh' ? thought.title : thought.title_en}
            </h2>
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-black'}`}>
              {language === 'zh' ? thought.description : thought.description_en}
            </p>
          </a>
        ))}
      </div>
    </PageContainer>
  );
}