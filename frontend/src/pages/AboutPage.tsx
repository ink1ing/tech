import React from 'react';
import { Twitter, Github, Mail } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import PageContainer from '../components/PageContainer';

const socialLinks = [
  { name: 'X', url: 'https://x.com/Ink_thesilent', icon: Twitter },
  { name: 'Github', url: 'https://github.com/ink1ing', icon: Github },
  { name: 'Mail', url: 'mailto:huinkling@yahoo.com', icon: Mail }
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center p-4 rounded-lg transition-all duration-200 ${
                  isDark
                    ? 'bg-gray-800 border border-gray-700 hover:bg-gray-750'
                    : 'glass-light active:scale-95'
                }`}
              >
                <Icon className="w-5 h-5 text-blue-500 mr-3" />
                <span className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>
                  {link.name}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
