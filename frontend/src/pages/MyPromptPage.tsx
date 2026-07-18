import { useAppContext } from '../context/AppContext';
import PageContainer from '../components/PageContainer';
import FeatureCard from '../components/FeatureCard';

interface StoreItem {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  url: string;
}

const storeItems: StoreItem[] = [
  {
    title: 'ChatGPT Plus 年度会员账号',
    titleEn: 'ChatGPT Plus Annual Subscription',
    description: '$14.99',
    descriptionEn: '$14.99',
    url: 'https://store.shangdian.me/gpt'
  },
  {
    title: 'Google AI Pro SheerID 认证',
    titleEn: 'Google AI Pro SheerID Verification',
    description: '$3.99',
    descriptionEn: '$3.99',
    url: 'https://store.shangdian.me/google'
  },
  {
    title: '科技相关咨询',
    titleEn: 'Tech Consulting',
    description: '$19.99/30min',
    descriptionEn: '$19.99/30min',
    url: 'https://store.shangdian.me/tech'
  },
  {
    title: '投资相关咨询',
    titleEn: 'Investment Consulting',
    description: '$29.99/30min',
    descriptionEn: '$29.99/30min',
    url: 'https://store.shangdian.me/invest'
  }
];

export default function MyPromptPage() {
  const { language, isDark } = useAppContext();

  return (
    <PageContainer title="Silas' 商店" titleEn="Silas' Store" language={language} isDark={isDark}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {storeItems.map((item, index) => (
          <FeatureCard
            key={index}
            title={item.title}
            titleEn={item.titleEn}
            description={item.description}
            descriptionEn={item.descriptionEn}
            language={language}
            isDark={isDark}
            url={item.url}
            className="h-full"
          />
        ))}
      </div>
    </PageContainer>
  );
}
