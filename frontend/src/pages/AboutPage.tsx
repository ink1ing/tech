import React from 'react';
import { Twitter, Github, Mail } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import PageContainer from '../components/PageContainer';
import FeatureCard from '../components/FeatureCard';

const socialLinks = [
  {
    name: 'X',
    url: 'https://x.com/Ink_thesilent',
    icon: Twitter,
    description: '分享想法和观点',
    descriptionEn: 'Share thoughts and ideas'
  },
  {
    name: 'Github',
    url: 'https://github.com/ink1ing',
    icon: Github,
    description: '代码项目和开源贡献',
    descriptionEn: 'Code projects and open source contributions'
  },
  {
    name: 'Mail',
    url: 'mailto:ink@ink1ing.tech',
    icon: Mail,
    description: '商务合作和技术交流',
    descriptionEn: 'Business cooperation and technical exchange'
  }
];

export default function AboutPage() {
  const { language, isDark } = useAppContext();

  return (
    <PageContainer title="关于我" titleEn="About Me" language={language} isDark={isDark}>
      <p className={`font-bold mb-8 ${isDark ? 'text-gray-300' : 'text-black'}`}>
        {language === 'zh' 
          ? '每一个所谓起舞的日子都是对世俗的拥护' 
          : 'Each day we choose to dance deliberately is a day we embrace worldly conformity.'}
      </p>

      <div>
        <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
          {language === 'zh' ? '联系方式' : 'Contact Information'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <FeatureCard
                key={link.name}
                title={link.name}
                description={link.description}
                descriptionEn={link.descriptionEn}
                url={link.url}
                language={language}
                isDark={isDark}
                icon={<Icon className={`w-6 h-6 ${isDark ? 'text-white' : 'text-black'}`} />}
                className="h-full"
              />
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
