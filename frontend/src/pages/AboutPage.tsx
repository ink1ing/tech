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
    url: 'mailto:ink@shangdian.me',
    icon: Mail,
    description: '商务合作和技术交流',
    descriptionEn: 'Business cooperation and technical exchange'
  }
];

export default function AboutPage() {
  const { language, isDark } = useAppContext();

  return (
    <PageContainer title="关于 Silas" titleEn="About Silas" language={language} isDark={isDark}>
      <p className={`font-bold mb-8 ${isDark ? 'text-gray-300' : 'text-black'}`}>
        I should be sober, I can't afford to be boring.
      </p>

      <div>
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
