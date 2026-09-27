import React from 'react';
import { ArrowLeft, MapPin, Sparkles } from 'lucide-react';
import { BranchLocations } from './BranchLocations';

interface Props {
  onBackToHome: () => void;
  onOpenConsultation: (topic?: string) => void;
}

export const BranchesSubPageView: React.FC<Props> = ({
  onBackToHome,
  onOpenConsultation
}) => {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-20">
      {/* Header Breadcrumb */}
      <div className="bg-white border-b border-stone-200 py-4 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-all border border-stone-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Trang Chủ</span>
            </button>
            <span className="text-stone-300">/</span>
            <span className="font-extrabold text-sm sm:text-base text-stone-900">
              Hệ Thống Cơ Sở SEIU (Vị Thanh - Hậu Giang & TP.HCM)
            </span>
          </div>

          <button
            onClick={() => onOpenConsultation('Đặt lịch hẹn trực tiếp tại văn phòng SEIU')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Đặt Lịch Hẹn Trực Tiếp</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <BranchLocations onOpenConsultation={onOpenConsultation} />
      </div>
    </div>
  );
};
