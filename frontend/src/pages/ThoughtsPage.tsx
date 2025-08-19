import React from 'react';
import PageContainer from '../components/PageContainer';

export default function ThoughtsPage() {
  const language: 'zh' | 'en' = 'en';
  const isDark = true;

  return (
    <PageContainer title="我的思考" titleEn="My Thoughts" language={language} isDark={isDark}>
      <div className="flex items-center justify-center h-64">
        <p className={`text-xl font-bold ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {language === 'zh' ? '页面内容待开发' : 'Page content under development'}
        </p>
      </div>
    </PageContainer>
  );
}