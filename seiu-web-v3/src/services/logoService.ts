export interface LogoConfig {
  mode: 'vector' | 'image' | 'text';
  customImageUrl?: string; // Data URL or Image Link
  brandName: string;
  slogan: string;
  primaryColor: string;
  vectorStyle: 'shield_s' | 'graduation_crown' | 'modern_korean';
}

const LOGO_CONFIG_KEY = 'seiu_logo_custom_config_v1';

export const DEFAULT_LOGO_CONFIG: LogoConfig = {
  mode: 'vector',
  customImageUrl: '',
  brandName: 'SEIU',
  slogan: 'Hàn Ngữ & Du Học Hàn',
  primaryColor: '#E5252A',
  vectorStyle: 'shield_s',
};

export const getStoredLogoConfig = (): LogoConfig => {
  try {
    const raw = localStorage.getItem(LOGO_CONFIG_KEY);
    if (raw) {
      return { ...DEFAULT_LOGO_CONFIG, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_LOGO_CONFIG;
};

export const saveLogoConfig = (config: LogoConfig): void => {
  try {
    localStorage.setItem(LOGO_CONFIG_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('seiu_logo_updated'));
  } catch (e) {
    console.error('Error saving logo config:', e);
  }
};

export const resetLogoConfig = (): void => {
  localStorage.removeItem(LOGO_CONFIG_KEY);
  window.dispatchEvent(new Event('seiu_logo_updated'));
};
