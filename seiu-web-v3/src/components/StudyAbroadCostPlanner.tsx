import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Building2,
  Calculator,
  Check,
  ChevronRight,
  CircleDollarSign,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  Landmark,
  LockKeyhole,
  MapPin,
  Search,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { seiuUniversities, seiuUniversityRegions, SeiuUniversity } from '../data/seiuUniversityData';
import { saveLead } from '../services/leadService';
import { getStoredSiteConfig, SiteConfig } from '../services/siteConfigService';

interface Props {
  onOpenConsultation: (topic?: string) => void;
}

const ENTRY_FEE_VND = 7_000_000;
const SERVICE_FEE_VND = 75_000_000;

const formatKrw = (value: number): string => `${new Intl.NumberFormat('ko-KR').format(Math.round(value))} KRW`;
const formatVnd = (value: number): string => `${new Intl.NumberFormat('vi-VN').format(Math.round(value))}đ`;

const searchableText = (university: SeiuUniversity): string => [
  university.name,
  university.koreanName,
  university.region,
  university.regionLabel,
  university.majors.join(' '),
].join(' ').toLowerCase();

const feeRows = (university: SeiuUniversity) => [
  { label: 'Invoice học phí trường', value: university.invoiceKrw, raw: university.tuitionRaw },
];

export const StudyAbroadCostPlanner: React.FC<Props> = ({ onOpenConsultation }) => {
  const [config, setConfig] = useState<SiteConfig>(getStoredSiteConfig());
  const [region, setRegion] = useState('Tất cả');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [unlockedSchoolId, setUnlockedSchoolId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const update = () => setConfig(getStoredSiteConfig());
    window.addEventListener('seiu_site_config_updated', update);
    return () => window.removeEventListener('seiu_site_config_updated', update);
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return seiuUniversities.filter((university) => (
      (region === 'Tất cả' || university.region === region)
      && (!needle || searchableText(university).includes(needle))
    ));
  }, [query, region]);

  const selected = seiuUniversities.find((item) => item.id === selectedId) || null;
  const unlocked = Boolean(selected && unlockedSchoolId === selected.id);
  const rate = Math.max(1, Number(config.studyAbroadKrwRate) || 19);
  const invoiceVnd = selected ? selected.invoiceKrw * rate : 0;
  const totalVnd = ENTRY_FEE_VND + invoiceVnd + SERVICE_FEE_VND;
  const hasInvoice = Boolean(selected?.invoiceKrw);

  const selectSchool = (university: SeiuUniversity) => {
    setSelectedId(university.id);
    if (unlockedSchoolId !== university.id) setFormError('');
    window.requestAnimationFrame(() => {
      document.getElementById('study-cost-result')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  };

  const unlockEstimate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    const phoneDigits = phone.replace(/\D/g, '');
    if (fullName.trim().length < 2) {
      setFormError('Vui lòng nhập họ tên học viên.');
      return;
    }
    if (phoneDigits.length < 9 || phoneDigits.length > 12) {
      setFormError('Số điện thoại chưa hợp lệ.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await saveLead({
        fullName: fullName.trim(),
        phone: phoneDigits,
        interestedProgram: `Dự toán du học: ${selected.name}`,
        city: selected.regionLabel,
        notes: `Trường đã chọn: ${selected.name} (${selected.koreanName}) · Invoice học phí dữ liệu: ${selected.invoiceKrw ? formatKrw(selected.invoiceKrw) : 'Chưa có số liệu'} · Tỷ giá dự toán: ${rate} VND/KRW · Tổng dự toán: ${hasInvoice ? formatVnd(totalVnd) : 'Chưa đủ dữ liệu Invoice'} · Công cụ không cộng KTX, bảo hiểm hoặc khoản khác.`,
        source: 'Công cụ dự toán du học SEIU',
        goal: 'du-hoc',
      });
      setUnlockedSchoolId(selected.id);
    } catch {
      setFormError('Chưa gửi được thông tin. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-8">
      <div className="rounded-[30px] bg-[#153a70] px-6 py-8 text-white sm:px-9 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">
              <Calculator className="h-4 w-4" /> SEIU Study Cost Planner
            </div>
            <h1 className="k1-display mt-4 text-3xl font-black leading-tight sm:text-5xl">
              Chọn trường Hàn Quốc và dự toán chi phí
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-blue-100 sm:text-base">
              Lọc theo khu vực, chọn trường phù hợp rồi để lại thông tin để xem Invoice quy đổi và tổng ngân sách dự kiến.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-white/10 px-5 py-4"><strong className="block text-2xl font-black">80+</strong><span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Trường</span></div>
            <div className="rounded-2xl bg-white/10 px-5 py-4"><strong className="block text-2xl font-black">{seiuUniversityRegions.length}</strong><span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">Khu vực</span></div>
          </div>
        </div>
      </div>

      <div className="grid gap-7 xl:grid-cols-[1.08fr_0.92fr] xl:items-start">
        <div className="space-y-5">
          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-42px_rgba(15,39,75,.55)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e23b43]">Bước 1</span>
                <h2 className="mt-1 text-xl font-black text-[#14213d]">Chọn khu vực hoặc tìm trường mong muốn</h2>
              </div>
              <span className="rounded-full bg-[#f4f8ff] px-3 py-1.5 text-xs font-black text-[#153a70]">{filtered.length} kết quả</span>
            </div>

            <div className="relative mt-5">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo tên trường, tiếng Hàn hoặc ngành học..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium outline-none transition focus:border-[#153a70] focus:bg-white"
              />
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {['Tất cả', ...seiuUniversityRegions].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRegion(item)}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${region === item ? 'bg-[#153a70] text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-[#153a70] hover:text-[#153a70]'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {filtered.map((university) => {
              const active = selectedId === university.id;
              return (
                <button
                  key={university.id}
                  type="button"
                  onClick={() => selectSchool(university)}
                  data-motion-card
                  className={`group relative min-h-[190px] rounded-[24px] border p-5 text-left transition ${active ? 'border-[#e23b43] bg-red-50/50 shadow-[0_18px_40px_-30px_rgba(226,59,67,.75)]' : 'border-slate-200 bg-white hover:border-[#153a70]'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white text-[#153a70] shadow-sm">
                      {university.logoUrl ? <img src={university.logoUrl} alt={`Logo ${university.name}`} className="h-9 w-9 object-contain" loading="lazy" /> : <Building2 className="h-5 w-5" />}
                    </span>
                    {active ? <span className="inline-flex items-center gap-1 rounded-full bg-[#e23b43] px-2.5 py-1 text-[10px] font-black text-white"><Check className="h-3 w-3" /> Đã chọn</span> : <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#153a70]" />}
                  </div>
                  <h3 className="mt-5 text-base font-black text-[#14213d]">{university.name}</h3>
                  <p className="mt-1 font-semibold text-slate-500">{university.koreanName}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-bold">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{university.ranking}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[#153a70]"><MapPin className="h-3 w-3" /> {university.regionLabel}</span>
                    {university.gpa && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-amber-800">{university.gpa}</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm font-medium text-slate-500">
              Chưa tìm thấy trường phù hợp. Hãy thử tên khác hoặc chọn “Tất cả”.
            </div>
          )}
        </div>

        <aside id="study-cost-result" className="xl:sticky xl:top-28">
          {!selected ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center sm:p-12">
              <Landmark className="mx-auto h-11 w-11 text-slate-300" />
              <h2 className="mt-5 text-xl font-black text-[#14213d]">Chưa chọn trường</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Chọn một trường ở danh sách để xem điều kiện và mở bảng dự toán.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_30px_80px_-50px_rgba(15,39,75,.55)]">
              <div className="border-b border-slate-200 bg-[#f4f8ff] p-6 sm:p-7">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#e23b43]">Bước 2 · Trường đã chọn</span>
                <div className="mt-3 flex items-center gap-4">
                  <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {selected.logoUrl ? <img src={selected.logoUrl} alt={`Logo ${selected.name}`} className="h-12 w-12 object-contain" /> : <Building2 className="h-7 w-7 text-[#153a70]" />}
                  </span>
                  <div><h2 className="text-2xl font-black text-[#14213d]">{selected.name}</h2><p className="mt-1 font-bold text-[#153a70]">{selected.koreanName}</p></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-white p-3"><span className="block text-[10px] font-bold uppercase text-slate-400">Khu vực</span><strong className="mt-1 block text-slate-700">{selected.regionLabel}</strong></div>
                  <div className="rounded-xl bg-white p-3"><span className="block text-[10px] font-bold uppercase text-slate-400">Điều kiện</span><strong className="mt-1 block text-slate-700">{selected.gpa || selected.topik || 'Liên hệ SEIU'}</strong></div>
                </div>
                {selected.website && (
                  <a href={selected.website} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-black text-[#153a70] hover:text-[#e23b43]">
                    Website trường <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>

              {!unlocked ? (
                <form onSubmit={unlockEstimate} className="p-6 sm:p-7">
                  <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-amber-950">
                    <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                    <div><strong className="text-sm">Mở bảng chi phí dự kiến</strong><p className="mt-1 text-xs leading-5 text-amber-800">Nhập họ tên và số điện thoại để xem Invoice KRW, quy đổi tiền Việt và tổng ngân sách.</p></div>
                  </div>
                  <label className="mt-5 block text-xs font-black text-slate-700">Họ và tên học viên</label>
                  <input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#153a70]" placeholder="Nguyễn Văn A" />
                  <label className="mt-4 block text-xs font-black text-slate-700">Số điện thoại</label>
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="tel" autoComplete="tel" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#153a70]" placeholder="09xx xxx xxx" />
                  {formError && <p className="mt-3 text-xs font-bold text-red-600">{formError}</p>}
                  <button disabled={submitting} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e23b43] px-5 py-3.5 text-sm font-black text-white hover:bg-[#c52833] disabled:opacity-60">
                    {submitting ? 'Đang lưu thông tin…' : 'Xem dự toán chi phí'} <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="mt-3 text-center text-[10px] leading-4 text-slate-400">SEIU dùng thông tin để tư vấn đúng trường đã chọn và không hiển thị số điện thoại công khai.</p>
                </form>
              ) : (
                <div className="p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <div><span className="text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700">Đã mở dự toán</span><h3 className="mt-1 text-lg font-black text-[#14213d]">Invoice theo dữ liệu trường</h3></div>
                    <ShieldCheck className="h-8 w-8 text-emerald-600" />
                  </div>

                  <div className="mt-5 space-y-2.5">
                    {feeRows(selected).map((item) => (
                      <div key={item.label} className="flex items-start justify-between gap-5 rounded-xl bg-slate-50 px-4 py-3 text-xs">
                        <span className="font-bold text-slate-600">{item.label}</span>
                        <span className="text-right"><strong className="block text-[#14213d]">{item.value ? formatKrw(item.value) : 'Chưa có số liệu'}</strong>{item.raw && item.raw !== String(item.value) && <small className="mt-1 block max-w-[230px] whitespace-pre-line text-[9px] leading-4 text-slate-400">{item.raw}</small>}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#153a70] px-4 py-4 text-white">
                      <span className="text-xs font-black">TỔNG INVOICE DỰ KIẾN</span>
                      <strong className="text-lg font-black text-amber-300">{hasInvoice ? formatKrw(selected.invoiceKrw) : 'Liên hệ SEIU'}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-4 px-2 py-2 text-xs text-slate-500"><span>Quy đổi tạm tính · {rate} VND/KRW</span><strong className="text-[#153a70]">{hasInvoice ? `≈ ${formatVnd(invoiceVnd)}` : 'Chưa có dữ liệu'}</strong></div>
                  </div>

                  <div className="mt-6 rounded-[22px] border-2 border-red-200 bg-red-50 p-5">
                    <h3 className="flex items-center gap-2 text-sm font-black text-[#14213d]"><WalletCards className="h-5 w-5 text-[#e23b43]" /> Tổng ngân sách dự kiến</h3>
                    <div className="mt-4 space-y-3 text-xs">
                      <div className="flex justify-between gap-4"><span>Học phí tại Việt Nam</span><strong>{formatVnd(ENTRY_FEE_VND)}</strong></div>
                      <div className="flex justify-between gap-4"><span>Invoice trường quy đổi</span><strong>{formatVnd(invoiceVnd)}</strong></div>
                      <div className="flex justify-between gap-4"><span>Phí dịch vụ SEIU · đóng khi đậu Visa</span><strong>{formatVnd(SERVICE_FEE_VND)}</strong></div>
                      <div className="border-t border-red-200 pt-3"><div className="flex items-end justify-between gap-4"><span className="font-black uppercase text-red-700">Tổng dự kiến</span><strong className="text-2xl font-black text-[#e23b43]">{hasInvoice ? formatVnd(totalVnd) : 'Liên hệ SEIU'}</strong></div></div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-950">
                    <strong>Phạm vi bảng tính:</strong> Chỉ cộng 7 triệu phí học tại Việt Nam + Invoice học phí trường + 75 triệu phí dịch vụ SEIU sau khi đậu Visa. Công cụ không cộng KTX, bảo hiểm hoặc khoản khác. Invoice và tỷ giá thực tế có thể thay đổi theo kỳ nhập học.
                  </div>

                  <button onClick={() => onOpenConsultation(`Tư vấn hồ sơ ${selected.name} · dự toán ${hasInvoice ? formatVnd(totalVnd) : 'cần cập nhật Invoice'}`)} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#153a70] px-5 py-3.5 text-sm font-black text-white hover:bg-[#0f2d59]">
                    Nhận tư vấn hồ sơ trường này <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      {unlocked && selected && (
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 sm:p-9">
          <div className="max-w-2xl"><span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e23b43]">Bước 3</span><h2 className="k1-display mt-2 text-3xl font-black text-[#14213d]">Quy trình dự kiến cùng SEIU</h2></div>
          <div className="mt-7 grid gap-3 md:grid-cols-5">
            {[
              { icon: GraduationCap, title: 'Nhập học SEIU', desc: 'Học tiếng Hàn và chuẩn bị nền tảng hồ sơ · phí 7 triệu.' },
              { icon: FileCheck2, title: 'Chọn & apply trường', desc: `Hoàn thiện hồ sơ vào ${selected.name}.` },
              { icon: CircleDollarSign, title: 'Đóng Invoice', desc: 'Thanh toán trực tiếp theo thông báo chính thức của trường.' },
              { icon: Landmark, title: 'Tài chính & Visa', desc: 'Chuẩn bị sổ/đóng băng riêng theo yêu cầu từng hồ sơ.' },
              { icon: ShieldCheck, title: 'Đậu Visa', desc: 'Thanh toán phí dịch vụ SEIU 75 triệu sau khi đậu Visa.' },
            ].map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between"><span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#153a70]"><step.icon className="h-4 w-4" /></span><span className="text-xs font-black text-[#e23b43]">0{index + 1}</span></div>
                <h3 className="mt-4 text-sm font-black text-[#14213d]">{step.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
