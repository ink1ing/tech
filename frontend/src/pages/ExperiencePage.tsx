import React from 'react';
import { useAppContext } from '../context/AppContext';
import PageContainer from '../components/PageContainer';
import FeatureCard from '../components/FeatureCard';

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
  },
  {
    title: '如何让你的GPT变为Claude',
    title_en: 'How to Turn Your GPT into Claude',
    url: 'https://x.com/Ink_thesilent/status/1976636165823570286',
    description: '通过系统提示词实现',
    description_en: 'Achieved through system prompts'
  },
  {
    title: '我在用的AI',
    title_en: 'AI I Use',
    url: 'https://x.com/Ink_thesilent/status/1974185447074222229',
    description: '包含主流AI和套餐情况',
    description_en: 'Includes mainstream AI and package information'
  },
  {
    title: '自己建一个Claude镜像',
    title_en: 'Build Your Own Claude Mirror',
    url: 'https://jasper-goldenrod-aa1.notion.site/claude-2870a979819580169eb6fab313d6a667?source=copy_link',
    description: '基于Fuclaude项目和Cloudflare免费计划',
    description_en: 'Based on Fuclaude project and Cloudflare free plan'
  },
  {
    title: '关于减肥',
    title_en: 'About Weight Loss',
    url: 'https://x.com/Ink_thesilent/status/2007814277906977016?s=20',
    description: '快速、无痛、可持续、不反弹的减肥思路',
    description_en: 'Fast, painless, sustainable, and rebound-free weight loss approach'
  }
];

export default function ExperiencePage() {
  const { language, isDark } = useAppContext();

  return (
    <PageContainer title="Silas' 经验" titleEn="Silas' Experience" language={language} isDark={isDark}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {experiences.map((exp, index) => (
          <FeatureCard
            key={index}
            title={exp.title}
            titleEn={exp.title_en}
            description={exp.description}
            descriptionEn={exp.description_en}
            url={exp.url}
            language={language}
            isDark={isDark}
            className="h-full"
          />
        ))}
      </div>
    </PageContainer>
  );
}
