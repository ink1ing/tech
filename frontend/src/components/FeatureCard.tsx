import React, { useRef, useState } from 'react';

interface FeatureCardProps {
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  url?: string;
  language: 'zh' | 'en';
  isDark: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function FeatureCard({
  title,
  titleEn,
  description,
  descriptionEn,
  url,
  language,
  isDark,
  icon,
  onClick,
  className = ''
}: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 计算相对于卡片中心的偏移量
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;

    // 阻尼系数控制倾斜幅度 - 减小数值增大倾斜幅度
    const dampingFactor = 8;
    const rotateX = -deltaY / dampingFactor;
    const rotateY = deltaX / dampingFactor;

    // 应用3D变换
    card.style.transform = `
      perspective(1000px)
      rotate3d(1, 0, 0, ${rotateX}deg)
      rotate3d(0, 1, 0, ${rotateY}deg)
      scale(1.05)
    `;
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    const card = cardRef.current;
    if (card) {
      card.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s ease-out';
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    const card = cardRef.current;
    if (card) {
      card.style.transition = 'transform 0.6s cubic-bezier(0.03, 0.98, 0.52, 0.99), box-shadow 0.3s ease-out';
      card.style.transform = 'perspective(1000px) rotate3d(1, 0, 0, 0deg) rotate3d(0, 1, 0, 0deg) scale(1)';
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const baseClasses = `
    relative cursor-pointer overflow-hidden rounded-xl p-6
    transform-gpu will-change-transform select-none
    transition-all duration-300 ease-out group
    ${isHovered ? 'z-10' : 'z-0'}
    ${className}
  `;

  const dynamicClasses = isDark
    ? `bg-black border border-gray-700/50 backdrop-blur-sm
       hover:border-gray-500/70 transition-all duration-500 ease-in-out
       ${isHovered ? 'shadow-[0_20px_50px_rgba(0,0,0,0.8)] shadow-2xl shadow-cyan-500/60' : 'shadow-none'}`
    : `bg-white/20 border border-gray-200/30 backdrop-blur-md
       hover:border-gray-300/50 transition-all duration-500 ease-in-out
       ${isHovered ? 'shadow-[0_20px_50px_rgba(0,0,0,0.15)] shadow-2xl shadow-purple-500/60' : 'shadow-none'}`;

  return (
    <>

      <div
        ref={cardRef}
        className={`${baseClasses} ${dynamicClasses}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        role={onClick || url ? "button" : undefined}
        tabIndex={onClick || url ? 0 : undefined}
        onKeyPress={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && (onClick || url)) {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {/* 霓虹边缘光晕效果 - 平滑过渡 */}
        <div className={`absolute -inset-1 rounded-xl transition-opacity duration-700 ease-in-out pointer-events-none ${
          isHovered ? 'opacity-100 animate-pulse' : 'opacity-0'
        }`}>
          <div className={`absolute inset-0 rounded-xl ${
            isDark
              ? 'bg-gradient-to-br from-cyan-500 to-blue-600'
              : 'bg-gradient-to-br from-purple-500 to-pink-600'
          } opacity-30 blur-xl`}></div>
        </div>

        {/* 科技感背景网格 */}
        <div className={`absolute inset-0 opacity-20 ${isHovered ? 'opacity-30' : ''} transition-opacity duration-300`}>
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px),
              linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }} />
        </div>

      {/* 悬浮光晕效果 */}
      {isHovered && (
        <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-gray-800/20 via-transparent to-gray-700/20'
            : 'bg-gradient-to-br from-gray-100/40 via-transparent to-gray-200/40'
        }`} />
      )}

      {/* 内容区域 */}
      <div className="relative z-10">
        {icon && (
          <div
            className={`mb-4 text-2xl transition-all duration-500 ease-in-out ${
              isHovered ? 'scale-110 rotate-3' : ''
            }`}
            style={{
              filter: isHovered
                ? 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5)) drop-shadow(0 0 20px rgba(255, 0, 255, 0.5)) drop-shadow(0 0 30px rgba(255, 255, 0, 0.5))'
                : 'drop-shadow(0 0 0px rgba(0, 255, 255, 0)) drop-shadow(0 0 0px rgba(255, 0, 255, 0)) drop-shadow(0 0 0px rgba(255, 255, 0, 0))',
              transition: 'filter 0.5s ease-in-out'
            }}
          >
            {icon}
          </div>
        )}

        <h3
          className={`text-xl font-bold mb-3 transition-colors duration-300 ${
            isDark ? 'text-white' : 'text-black'
          } ${isHovered ? (isDark ? 'text-gray-100' : 'text-gray-900') : ''}`}
          style={{
            filter: isHovered
              ? 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.4)) drop-shadow(0 0 10px rgba(255, 0, 255, 0.4))'
              : 'drop-shadow(0 0 0px rgba(0, 255, 255, 0)) drop-shadow(0 0 0px rgba(255, 0, 255, 0))',
            transition: 'filter 0.5s ease-in-out'
          }}
        >
          {language === 'zh' ? title : (titleEn || title)}
        </h3>

        <p className={`leading-relaxed transition-colors duration-300 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        } ${isHovered ? (isDark ? 'text-gray-200' : 'text-gray-800') : ''}`}>
          {language === 'zh' ? description : (descriptionEn || description)}
        </p>

        {/* 科技感指示器 */}
        {(onClick || url) && (
          <div className={`mt-4 flex items-center text-sm font-medium transition-all duration-300 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          } ${isHovered ? (isDark ? 'text-gray-300' : 'text-gray-700') : ''}`}>
            <span className="mr-2">
              {language === 'zh' ? '点击探索' : 'Click to explore'}
            </span>
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isDark ? 'bg-gray-500' : 'bg-gray-400'
            } ${isHovered ? 'bg-white animate-pulse scale-125' : ''}`} />
          </div>
        )}
      </div>

      {/* 边缘光效 */}
      <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none ${
        isHovered ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className={`absolute inset-0 rounded-xl ${
          isDark
            ? 'shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
            : 'shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]'
        }`} />
      </div>
      </div>
    </>
  );
}
