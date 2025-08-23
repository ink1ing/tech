import React from 'react';

interface PageContainerProps {
  title: string;
  titleEn?: string;
  language?: 'zh' | 'en';
  isDark?: boolean;
  children: React.ReactNode;
}

export default function PageContainer({ 
  title, 
  titleEn, 
  language = 'en', 
  isDark = true, 
  children 
}: PageContainerProps) {
  const displayTitle = language === 'zh' ? title : (titleEn || title);
  
  return (
    <div>
      <h1 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-[#1a1a66] text-shadow-sm text-surface'}`}>
        {displayTitle}
      </h1>
      {children}
    </div>
  );
}
