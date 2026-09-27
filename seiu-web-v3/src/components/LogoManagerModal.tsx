import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Palette, 
  Link as LinkIcon,
  HelpCircle,
  Eye
} from 'lucide-react';
import { 
  getStoredLogoConfig, 
  saveLogoConfig, 
  resetLogoConfig, 
  LogoConfig, 
  DEFAULT_LOGO_CONFIG 
} from '../services/logoService';
import { SeiuLogo } from './SeiuLogo';

interface LogoManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoManagerModal: React.FC<LogoManagerModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<LogoConfig>(getStoredLogoConfig());
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'customize'>('upload');
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const current = getStoredLogoConfig();
      setConfig(current);
      setImageUrlInput(current.customImageUrl || '');
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Dung lượng ảnh tối đa 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          const updated: LogoConfig = {
            ...config,
            mode: 'image',
            customImageUrl: result,
          };
          setConfig(updated);
          saveLogoConfig(updated);
          setIsSaved(true);
          setTimeout(() => setIsSaved(false), 2000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (!imageUrlInput.trim()) return;
    const updated: LogoConfig = {
      ...config,
      mode: 'image',
      customImageUrl: imageUrlInput.trim(),
    };
    setConfig(updated);
    saveLogoConfig(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSwitchToVector = () => {
    const updated: LogoConfig = {
      ...config,
      mode: 'vector',
      customImageUrl: '',
    };
    setConfig(updated);
    saveLogoConfig(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    resetLogoConfig();
    setConfig(DEFAULT_LOGO_CONFIG);
    setImageUrlInput('');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleSaveTextChanges = () => {
    saveLogoConfig(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-stone-900 text-white rounded-t-3xl flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading">
                Thay Đổi / Cập Nhật Logo SEIU
              </h3>
              <p className="text-xs text-stone-400">Tải lên file ảnh logo chính xác của bạn hoặc đổi màu sắc</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Live Preview Box */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 text-center space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center justify-center gap-1.5">
              <Eye className="w-4 h-4 text-red-600" />
              <span>Xem trước Logo hiển thị thực tế:</span>
            </div>

            <div className="py-4 px-6 bg-white border border-stone-200/80 rounded-xl shadow-xs inline-flex items-center justify-center">
              <SeiuLogo size="lg" variant="horizontal" />
            </div>

            {isSaved && (
              <div className="text-xs font-bold text-emerald-600 bg-emerald-50 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4" />
                <span>Đã cập nhật logo trên toàn bộ website!</span>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-stone-200">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Tải file ảnh lên (Khuyên dùng)</span>
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'url'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>Dán Link Ảnh Logo</span>
            </button>
            <button
              onClick={() => setActiveTab('customize')}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'customize'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Đổi Chữ & Màu</span>
            </button>
          </div>

          {/* Tab 1: Upload File */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png, image/jpeg, image/svg+xml, image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-red-500 bg-stone-50 hover:bg-red-50/20 rounded-2xl p-8 text-center cursor-pointer transition-all space-y-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-stone-800">
                  Bấm vào đây để chọn file ảnh Logo từ máy tính / điện thoại
                </div>
                <p className="text-xs text-stone-400">
                  Hỗ trợ định dạng: PNG (trong suốt), SVG, JPG, WebP (Tối đa 5MB)
                </p>
              </div>

              {config.mode === 'image' && config.customImageUrl && (
                <div className="flex items-center justify-between text-xs text-stone-600 bg-stone-100 p-3 rounded-xl">
                  <span>Đang sử dụng ảnh logo tải lên</span>
                  <button
                    onClick={handleSwitchToVector}
                    className="text-red-600 font-bold hover:underline"
                  >
                    Dùng lại logo Vector mẫu
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: URL Link */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Đường dẫn (URL) file ảnh logo:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://yourwebsite.com/logo.png"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                  <button
                    onClick={handleApplyUrl}
                    className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                  >
                    Áp Dụng
                  </button>
                </div>
              </div>
              <p className="text-xs text-stone-400">
                Mẹo: Bạn có thể tải ảnh lên Imgur, Google Drive, hoặc host website rồi dán link trực tiếp vào đây.
              </p>
            </div>
          )}

          {/* Tab 3: Text & Color */}
          {activeTab === 'customize' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                    Tên thương hiệu:
                  </label>
                  <input
                    type="text"
                    value={config.brandName}
                    onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                    Màu sắc chủ đạo (Hex):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                      className="w-10 h-10 p-0 rounded-lg border border-stone-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.primaryColor}
                      onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                      className="flex-1 text-xs sm:text-sm px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-1">
                  Slogan phụ bên dưới logo:
                </label>
                <input
                  type="text"
                  value={config.slogan}
                  onChange={(e) => setConfig({ ...config, slogan: e.target.value })}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button
                onClick={handleSaveTextChanges}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Lưu Thay Đổi Tên & Màu Sắc
              </button>
            </div>
          )}

          {/* Reset button */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            <button
              onClick={handleReset}
              className="text-xs text-stone-500 hover:text-red-600 flex items-center gap-1.5 transition-colors font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục logo mặc định</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
            >
              Xong
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
