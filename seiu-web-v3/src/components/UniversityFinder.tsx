import React, { useState } from 'react';
import { TOP_UNIVERSITIES } from '../data/mockData';
import { University } from '../types';
import { 
  Building2, 
  Search, 
  MapPin, 
  Award, 
  GraduationCap, 
  CheckCircle2, 
  ExternalLink, 
  X, 
  DollarSign, 
  ChevronRight,
  Sparkles,
  Filter
} from 'lucide-react';

interface UniversityFinderProps {
  onApplyUniversity: (univName: string) => void;
}

export const UniversityFinder: React.FC<UniversityFinderProps> = ({ onApplyUniversity }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedVisa, setSelectedVisa] = useState<string>('all');
  const [activeUnivModal, setActiveUnivModal] = useState<University | null>(null);

  const filteredUniversities = TOP_UNIVERSITIES.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.koreanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.topMajors.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRegion = selectedRegion === 'all' || u.region === selectedRegion;
    const matchesVisa = selectedVisa === 'all' || 
      (selectedVisa === 'top1' && u.visaType.includes('Top 1%')) ||
      (selectedVisa === 'certified' && u.visaType.includes('chứng nhận'));

    return matchesSearch && matchesRegion && matchesVisa;
  });

  const formatKRW = (krw: number) => {
    const vnd = Math.round(krw * 18.5); // Approx exchange rate 1 KRW ~ 18.5 VND
    return `${new Intl.NumberFormat('ko-KR').format(krw)} KRW (~${new Intl.NumberFormat('vi-VN').format(vnd)}đ)`;
  };

  return (
    <section id="universities" className="py-16 sm:py-24 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>Đối Tác Tuyển Sinh Trực Tiếp</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-heading tracking-tight">
            Danh Sách Trường Đại Học Hàn Quốc <span className="text-red-600">Top 1%</span>
          </h2>
          <p className="text-base text-stone-600 mt-3">
            Khám phá thông tin học phí, điều kiện học bạ, ký túc xá và chính sách học bổng của hơn 60+ trường ĐH liên kết uy tín tại Hàn.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-sm mb-10 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên trường, tên tiếng Hàn (서울대...), hoặc ngành học (Kinh tế, IT...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Region Select */}
            <div className="sm:col-span-3">
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full text-xs sm:text-sm py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Tất cả khu vực</option>
                <option value="Seoul">Thủ đô Seoul</option>
                <option value="Busan">Thành phố Busan</option>
                <option value="Incheon">Incheon</option>
                <option value="Gyeonggi">Gyeonggi</option>
              </select>
            </div>

            {/* Visa Select */}
            <div className="sm:col-span-3">
              <select
                value={selectedVisa}
                onChange={(e) => setSelectedVisa(e.target.value)}
                className="w-full text-xs sm:text-sm py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Tất cả loại Visa</option>
                <option value="top1">Trường Top 1% (Visa Thẳng)</option>
                <option value="certified">Trường Chứng Nhận</option>
              </select>
            </div>

          </div>

          {/* Quick tags */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs text-stone-500 pt-1">
            <span className="font-semibold shrink-0">Tìm nhanh:</span>
            {['SKY', 'Seoul', 'Busan', 'Truyền thông', 'Kinh tế', 'Học bổng 100%'].map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchTerm(tag === 'SKY' ? 'SKY' : tag)}
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-red-50 hover:text-red-600 whitespace-nowrap transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Universities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredUniversities.map((univ) => (
            <div
              key={univ.id}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-red-300 transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Image banner */}
              <div className="relative h-44 overflow-hidden bg-stone-100">
                <img
                  src={univ.image}
                  alt={univ.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Badges on image */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white shadow-xs">
                    {univ.visaType}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-900/80 text-white backdrop-blur-xs flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" /> {univ.region}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[11px] text-red-300 font-medium block">{univ.koreanName}</span>
                  <h3 className="text-base font-bold leading-tight font-heading truncate">
                    {univ.name}
                  </h3>
                </div>
              </div>

              {/* Card Info */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                
                <div className="space-y-2 text-xs">
                  <div className="text-stone-500 font-medium line-clamp-1">
                    🏆 {univ.ranking}
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                    <div className="flex justify-between text-stone-600">
                      <span>Học phí:</span>
                      <strong className="text-stone-900">
                        {new Intl.NumberFormat('ko-KR').format(univ.tuitionYear)} KRW/năm
                      </strong>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Yêu cầu GPA:</span>
                      <strong className="text-red-600 font-bold">≥ {univ.admissionRequirements.gpa}</strong>
                    </div>
                  </div>

                  {/* Majors */}
                  <div>
                    <span className="text-[11px] text-stone-400 block mb-1">Ngành đào tạo thế mạnh:</span>
                    <div className="flex flex-wrap gap-1">
                      {univ.topMajors.slice(0, 3).map((m, i) => (
                        <span key={i} className="text-[10px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card CTAs */}
                <div className="pt-3 border-t border-stone-100 grid grid-cols-2 gap-2 mt-auto">
                  <button
                    onClick={() => setActiveUnivModal(univ)}
                    className="py-2 px-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold text-center transition-colors"
                  >
                    Xem Chi Tiết
                  </button>
                  <button
                    onClick={() => onApplyUniversity(univ.name)}
                    className="py-2 px-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold text-center transition-all shadow-xs"
                  >
                    Nộp Hồ Sơ
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        {filteredUniversities.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
            <p className="text-stone-500 text-sm">Không tìm thấy trường đại học phù hợp với từ khóa.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedRegion('all'); setSelectedVisa('all'); }}
              className="mt-3 text-xs font-bold text-red-600 hover:underline"
            >
              Xóa bộ lọc để xem toàn bộ danh sách
            </button>
          </div>
        )}

      </div>

      {/* University Detail Modal */}
      {activeUnivModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Image Header */}
            <div className="relative h-48 bg-stone-900">
              <img
                src={activeUnivModal.image}
                alt={activeUnivModal.name}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent" />
              
              <button
                onClick={() => setActiveUnivModal(null)}
                className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/70 p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-xs text-red-400 font-bold uppercase tracking-wider">
                  {activeUnivModal.koreanName} • {activeUnivModal.region}
                </span>
                <h3 className="text-2xl font-extrabold font-heading mt-0.5">
                  {activeUnivModal.name}
                </h3>
                <p className="text-xs text-stone-300">{activeUnivModal.ranking}</p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              
              {/* Financial Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
                <div>
                  <span className="text-stone-500 block">Học phí trung bình/năm:</span>
                  <strong className="text-stone-900 text-sm font-bold">
                    {formatKRW(activeUnivModal.tuitionYear)}
                  </strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Ký túc xá (6 tháng):</span>
                  <strong className="text-stone-900 text-sm font-bold">
                    {formatKRW(activeUnivModal.dormCostQuarter * 2)}
                  </strong>
                </div>
              </div>

              {/* Admission Criteria */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-red-600" />
                  Điều Kiện Xét Tuyển Nhập Học
                </h4>
                <div className="grid grid-cols-3 gap-2 text-xs bg-red-50/50 p-3.5 rounded-xl border border-red-100">
                  <div>
                    <span className="text-stone-500 block">Điểm GPA:</span>
                    <strong className="text-red-700 text-sm font-bold">≥ {activeUnivModal.admissionRequirements.gpa}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Yêu cầu Tiếng:</span>
                    <strong className="text-stone-800 text-sm font-bold">{activeUnivModal.admissionRequirements.topik}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Khoảng trống tốt nghiệp:</span>
                    <strong className="text-stone-800 text-sm font-bold">{activeUnivModal.admissionRequirements.graduationGap}</strong>
                  </div>
                </div>
              </div>

              {/* Scholarships */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-sm">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Chính Sách Học Bổng Quốc Tế:</span>
                </div>
                <p className="text-stone-700 leading-relaxed">{activeUnivModal.scholarshipInfo}</p>
              </div>

              {/* Highlights Features */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                  Đặc điểm nổi bật & Cơ sở vật chất
                </h4>
                <ul className="space-y-1.5 text-xs text-stone-700">
                  {activeUnivModal.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-stone-50 rounded-b-3xl border-t border-stone-200 flex items-center justify-between gap-3">
              <a
                href={activeUnivModal.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900"
              >
                <span>Website chính thức</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveUnivModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 transition-colors"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    const name = activeUnivModal.name;
                    setActiveUnivModal(null);
                    onApplyUniversity(name);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/30 flex items-center gap-1.5"
                >
                  <span>Nộp Hồ Sơ Trường Này</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
