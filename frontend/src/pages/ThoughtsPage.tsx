import React from 'react';
import { useAppContext } from '../context/AppContext';
import PageContainer from '../components/PageContainer';
import FeatureCard from '../components/FeatureCard';

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {thoughts.map((thought, index) => (
          <FeatureCard
            key={index}
            title={thought.title}
            titleEn={thought.title_en}
            description={thought.description}
            descriptionEn={thought.description_en}
            url={thought.url}
            language={language}
            isDark={isDark}
            className="h-full"
          />
        ))}
      </div>
    </PageContainer>
  );
}