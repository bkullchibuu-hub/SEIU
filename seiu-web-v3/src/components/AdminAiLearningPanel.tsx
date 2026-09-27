import React, { useState } from 'react';
import { Mic, Plus, Save, Sparkles, Trash2 } from 'lucide-react';
import { AiLearningConfig, getStoredAiLearning, saveAiLearning } from '../services/aiLearningService';

const newId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const AdminAiLearningPanel: React.FC = () => {
  const [config, setConfig] = useState<AiLearningConfig>(getStoredAiLearning());
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const save = async () => {
    setState('saving');
    try { await saveAiLearning(config); setState('saved'); setTimeout(() => setState('idle'), 2200); }
    catch { setState('error'); }
  };

  return <div className="space-y-8">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div><h3 className="flex items-center gap-2 text-base font-black"><Sparkles className="h-5 w-5 text-red-600" /> Nội dung Học cùng AI</h3><p className="mt-1 text-xs text-stone-500">Tạo câu dịch Việt → Hàn và đoạn đọc luyện phát âm cho học viên.</p></div>
      <button onClick={save} disabled={state === 'saving'} className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Save className="h-4 w-4" /> {state === 'saving' ? 'Đang lưu…' : state === 'saved' ? 'Đã lưu' : 'Lưu thay đổi'}</button>
    </div>
    {state === 'error' && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">Không lưu được lên máy chủ. Vui lòng đăng nhập lại rồi thử lại.</p>}

    <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between"><div><h4 className="font-black">Câu dịch Việt → Hàn</h4><p className="text-xs text-stone-500">AI dùng câu tham khảo để sửa và chấm bài.</p></div><button onClick={() => setConfig(c => ({ ...c, translations: [...c.translations, { id: newId('tr'), vietnamese: '', referenceKorean: '', hint: '' }] }))} className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700"><Plus className="h-3.5 w-3.5" /> Thêm câu</button></div>
      <div className="space-y-3">{config.translations.map((item, index) => <div key={item.id} className="grid gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3 sm:grid-cols-2">
        <input value={item.vietnamese} onChange={e => setConfig(c => ({ ...c, translations: c.translations.map((x, i) => i === index ? { ...x, vietnamese: e.target.value } : x) }))} placeholder="Câu tiếng Việt" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" />
        <input value={item.referenceKorean} onChange={e => setConfig(c => ({ ...c, translations: c.translations.map((x, i) => i === index ? { ...x, referenceKorean: e.target.value } : x) }))} placeholder="Bản dịch tiếng Hàn tham khảo" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" />
        <input value={item.hint || ''} onChange={e => setConfig(c => ({ ...c, translations: c.translations.map((x, i) => i === index ? { ...x, hint: e.target.value } : x) }))} placeholder="Gợi ý ngữ pháp (không bắt buộc)" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm sm:col-span-1" />
        <button onClick={() => setConfig(c => ({ ...c, translations: c.translations.filter((_, i) => i !== index) }))} className="flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /> Xóa</button>
      </div>)}</div>
    </section>

    <section className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between"><div><h4 className="flex items-center gap-1.5 font-black"><Mic className="h-4 w-4 text-red-600" /> Đoạn đọc luyện phát âm</h4><p className="text-xs text-stone-500">Học viên đọc bằng micro điện thoại và nhận đánh giá.</p></div><button onClick={() => setConfig(c => ({ ...c, pronunciation: [...c.pronunciation, { id: newId('pr'), title: '', korean: '', vietnamese: '' }] }))} className="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700"><Plus className="h-3.5 w-3.5" /> Thêm đoạn</button></div>
      <div className="space-y-3">{config.pronunciation.map((item, index) => <div key={item.id} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto]"><input value={item.title} onChange={e => setConfig(c => ({ ...c, pronunciation: c.pronunciation.map((x, i) => i === index ? { ...x, title: e.target.value } : x) }))} placeholder="Tên đoạn đọc" className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" /><button onClick={() => setConfig(c => ({ ...c, pronunciation: c.pronunciation.filter((_, i) => i !== index) }))} className="flex items-center justify-center gap-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-500 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /> Xóa</button></div>
        <textarea value={item.korean} onChange={e => setConfig(c => ({ ...c, pronunciation: c.pronunciation.map((x, i) => i === index ? { ...x, korean: e.target.value } : x) }))} placeholder="Đoạn văn tiếng Hàn" rows={3} className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" />
        <input value={item.vietnamese || ''} onChange={e => setConfig(c => ({ ...c, pronunciation: c.pronunciation.map((x, i) => i === index ? { ...x, vietnamese: e.target.value } : x) }))} placeholder="Nghĩa tiếng Việt (không bắt buộc)" className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm" />
      </div>)}</div>
    </section>
  </div>;
};
