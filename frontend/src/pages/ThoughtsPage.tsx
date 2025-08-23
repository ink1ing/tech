import React from 'react';
import { useAppContext } from '../context/AppContext';
import PageContainer from '../components/PageContainer';

export default function ThoughtsPage() {
  const { language, isDark } = useAppContext();

  return (
    <PageContainer title="我的思考" titleEn="My Thoughts" language={language} isDark={isDark}>
      <div className="flex items-center justify-center h-64">
        <p className={`text-xl font-bold ${
          isDark ? 'text-gray-400' : 'text-[#333333] text-shadow-xs text-surface'
        }`}>
          {language === 'zh' ? '页面内容待开发' : 'Page content under development'}
        </p>
      </div>
    </PageContainer>
  );
}
