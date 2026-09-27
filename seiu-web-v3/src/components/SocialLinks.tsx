import React from 'react';
import { SiteConfig } from '../services/siteConfigService';

export const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
  </svg>
);

export const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .59.04.86.13V9.4a6.34 6.34 0 0 0-.86-.06 6.34 6.34 0 1 0 6.34 6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07Z" />
  </svg>
);

/** Danh sách mạng xã hội đã cấu hình; link trống sẽ bị bỏ qua. */
export const getSocialLinks = (config: SiteConfig) =>
  [
    { key: 'facebook', label: 'Facebook', url: config.facebookUrl?.trim(), Icon: FacebookIcon, color: 'bg-[#1877F2] hover:bg-[#166FE5]' },
    { key: 'tiktok', label: 'TikTok', url: config.tiktokUrl?.trim(), Icon: TikTokIcon, color: 'bg-stone-900 hover:bg-black' },
  ].filter((item): item is typeof item & { url: string } => Boolean(item.url));

export const SocialLinks: React.FC<{ config: SiteConfig }> = ({ config }) => {
  const links = getSocialLinks(config);
  if (!links.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map(({ key, label, url, Icon, color }) => (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[11px] font-bold transition-colors ${color}`}
          aria-label={`SEIU trên ${label}`}
        >
          <Icon className="w-3.5 h-3.5" />
          <span>{label}</span>
        </a>
      ))}
    </div>
  );
};
