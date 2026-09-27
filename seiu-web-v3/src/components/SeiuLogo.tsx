import React, { useState, useEffect } from 'react';
import { getStoredLogoConfig, LogoConfig } from '../services/logoService';

interface SeiuLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'horizontal';
  showSubtitle?: boolean;
  theme?: 'light' | 'dark' | 'white';
  onClick?: () => void;
}

export const SeiuLogo: React.FC<SeiuLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showSubtitle = true,
  theme = 'light',
  onClick,
}) => {
  const [config, setConfig] = useState<LogoConfig>(getStoredLogoConfig());

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getStoredLogoConfig());
    };
    window.addEventListener('seiu_logo_updated', handleUpdate);
    return () => window.removeEventListener('seiu_logo_updated', handleUpdate);
  }, []);

  const isDark = theme === 'dark' || theme === 'white';
  const primaryRed = isDark && theme === 'white' ? '#FFFFFF' : (config.primaryColor || '#E5252A');
  const subtitleColor = isDark ? '#D6D3D1' : '#78716C';

  // Dimension scaling
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-24 h-24',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  // If user uploaded a custom image file via the logo manager
  if (config.mode === 'image' && config.customImageUrl) {
    const ImgIcon = (
      <img
        src={config.customImageUrl}
        alt={config.brandName || 'SEIU Logo'}
        className={`${iconSizes[size]} object-contain rounded-lg transition-transform duration-300 group-hover:scale-105`}
      />
    );

    if (variant === 'icon') {
      return (
        <div onClick={onClick} className={`inline-flex items-center justify-center ${className}`}>
          {ImgIcon}
        </div>
      );
    }

    if (variant === 'horizontal') {
      return (
        <div onClick={onClick} className={`inline-flex items-center gap-2.5 group cursor-pointer ${className}`}>
          {ImgIcon}
          <div className="flex flex-col text-left">
            <span
              className={`font-black tracking-wider uppercase font-heading ${titleSizes[size]} leading-none`}
              style={{ color: primaryRed }}
            >
              {config.brandName || 'SEIU'}
            </span>
            {showSubtitle && (
              <span
                className={`font-semibold uppercase tracking-wider ${subtitleSizes[size]} leading-tight mt-0.5`}
                style={{ color: subtitleColor }}
              >
                {config.slogan || 'Hàn Ngữ & Du Học Hàn'}
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div onClick={onClick} className={`inline-flex flex-col items-center group cursor-pointer text-center ${className}`}>
        {ImgIcon}
        <span
          className={`font-black tracking-wider uppercase font-heading ${titleSizes[size]} leading-tight mt-1`}
          style={{ color: primaryRed }}
        >
          {config.brandName || 'SEIU'}
        </span>
        {showSubtitle && (
          <span
            className={`font-medium text-xs tracking-wider uppercase ${subtitleSizes[size]} mt-0.5`}
            style={{ color: subtitleColor }}
          >
            {config.slogan || 'Hàn Ngữ & Du Học Hàn Quốc'}
          </span>
        )}
      </div>
    );
  }

  // Official Vector Logo Icon matching exact branding from Artboard (Mortarboard + Hexagon Shield + Dynamic S)
  const LogoIcon = (
    <svg
      viewBox="0 0 200 200"
      className={`${iconSizes[size]} transition-transform duration-300 group-hover:scale-105 shrink-0`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      id="seiu-official-logo-svg"
    >
      {/* Graduation Cap / Mortarboard */}
      <g fill={primaryRed}>
        {/* Cap Diamond Top */}
        <polygon points="100,16 168,44 100,72 32,44" />
        
        {/* Cap Skull Under-Base */}
        <path d="M58,52 L58,74 C58,74 76,92 100,92 C124,92 142,74 142,74 L142,52 C128,66 114,72 100,72 C86,72 72,66 58,52 Z" />
        
        {/* Tassel Button and Swagging Cord */}
        <circle cx="100" cy="44" r="5" fill="#FFFFFF" />
        <path
          d="M100,44 C120,44 158,50 162,74"
          stroke={primaryRed}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Tassel Brush Hang */}
        <rect x="159" y="72" width="6.5" height="18" rx="2" fill={primaryRed} />
      </g>

      {/* Hexagonal Shield Outline with bold rounded contours */}
      <path
        d="M100,64 L164,98 L164,152 L100,188 L36,152 L36,98 Z"
        stroke={primaryRed}
        strokeWidth="14"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />

      {/* Stylized Modern "S" Inside Badge */}
      <path
        d="M 60 102 
           L 140 102 
           L 140 118 
           L 84 118 
           L 140 144 
           L 140 162 
           L 58 162 
           L 58 146 
           L 116 146 
           L 60 120 
           Z"
        fill={primaryRed}
      />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div onClick={onClick} className={`inline-flex items-center justify-center ${className}`}>
        {LogoIcon}
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div onClick={onClick} className={`inline-flex items-center gap-2.5 group cursor-pointer select-none ${className}`}>
        {LogoIcon}
        <div className="flex flex-col text-left">
          <span
            className={`font-black tracking-wider uppercase font-heading ${titleSizes[size]} leading-none`}
            style={{ color: primaryRed }}
          >
            {config.brandName || 'SEIU'}
          </span>
          {showSubtitle && (
            <span
              className={`font-semibold uppercase tracking-wider ${subtitleSizes[size]} leading-tight mt-0.5`}
              style={{ color: subtitleColor }}
            >
              {config.slogan || 'Hàn Ngữ & Du Học Hàn'}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Full stacked logo matching exact Artboard layout
  return (
    <div onClick={onClick} className={`inline-flex flex-col items-center group cursor-pointer text-center select-none ${className}`}>
      {LogoIcon}
      <span
        className={`font-black tracking-widest uppercase font-heading ${titleSizes[size]} leading-tight mt-1`}
        style={{ color: primaryRed }}
      >
        {config.brandName || 'SEIU'}
      </span>
      {showSubtitle && (
        <span
          className={`font-semibold text-xs tracking-wider uppercase ${subtitleSizes[size]} mt-0.5`}
          style={{ color: subtitleColor }}
        >
          {config.slogan || 'Hàn Ngữ & Du Học Hàn Quốc'}
        </span>
      )}
    </div>
  );
};

export default SeiuLogo;
