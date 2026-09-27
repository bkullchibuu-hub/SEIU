import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Users, 
  Building2, 
  Award, 
  Newspaper, 
  Plus, 
  Trash2, 
  Edit3,
  Search,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  X,
  Sparkles,
  MapPin,
  Calendar,
  Phone,
  GraduationCap,
  ShieldCheck,
  Globe
} from 'lucide-react';
import {
  GalleryItem,
  StudentItem,
  PartnerUniItem,
  VisaResultItem,
  NewsEventItem,
  getStoredGallery,
  saveGallery,
  getStoredStudents,
  saveStudents,
  getStoredPartners,
  savePartners,
  getStoredVisas,
  saveVisas,
  getStoredNews,
  saveNews,
  sortNewestFirst
} from '../services/siteDataService';
import { getStoredSiteConfig } from '../services/siteConfigService';
import { compressImage } from '../utils/imageCompressor';

// Helper to convert and auto-compress uploaded image file
async function fileToDataUrl(file: File): Promise<string> {
  return compressImage(file, 1200, 1200, 0.78);
}

// ==========================================
// 1. ADMIN GALLERY PANEL (HÌNH ẢNH & ALBUM)
// ==========================================
export const AdminGalleryPanel: React.FC = () => {
  const [photos, setPhotos] = useState<GalleryItem[]>(getStoredGallery());
  const [filterCat, setFilterCat] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('tiễn bay');
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState('Tháng 03/2026');
  const [location, setLocation] = useState('Sân bay Quốc tế Tân Sơn Nhất');

  useEffect(() => {
    const handleSync = () => setPhotos(getStoredGallery());
    window.addEventListener('seiu_site_data_updated', handleSync);
    return () => window.removeEventListener('seiu_site_data_updated', handleSync);
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('tiễn bay');
    setUrl('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80');
    setCaption('');
    setDate('Tháng 03/2026');
    setLocation('Sân bay Quốc tế Tân Sơn Nhất');
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setUrl(item.url);
    setCaption(item.caption);
    setDate(item.date);
    setLocation(item.location);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setUrl(dataUrl);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      alert('Vui lòng điền tiêu đề và chọn ảnh!');
      return;
    }

    if (editingItem) {
      const updated = photos.map(p => 
        p.id === editingItem.id ? { ...p, title, category, url, caption, date, location } : p
      );
      setPhotos(updated);
      saveGallery(updated);
    } else {
      const newItem: GalleryItem = {
        id: `img-${Date.now()}`,
        createdAt: new Date().toISOString(),
        title,
        category,
        url,
        caption,
        date,
        location
      };
      const updated = [newItem, ...photos];
      setPhotos(updated);
      saveGallery(updated);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hình ảnh này khỏi Album?')) {
      const updated = photos.filter(p => p.id !== id);
      setPhotos(updated);
      saveGallery(updated);
    }
  };

  const filtered = filterCat === 'all' ? photos : photos.filter(p => p.category.toLowerCase().includes(filterCat.toLowerCase()));

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-red-50/50 p-4 rounded-2xl border border-red-100">
        <div>
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-red-600" />
            <span>Quản Lý Album & Hình Ảnh Hoạt Động SEIU</span>
          </h3>
          <p className="text-stone-600 text-xs mt-0.5">
            Thêm, chỉnh sửa hoặc thay thế hình ảnh học viên tiễn bay, không khí lớp học, ký túc xá và đời sống tại Hàn Quốc.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Ảnh Mới</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'Tất cả ảnh' },
          { id: 'tiễn bay', label: 'Tiễn bay sân bay' },
          { id: 'lớp học', label: 'Lớp học SEIU' },
          { id: 'hàn quốc', label: 'Đời sống Hàn Quốc' },
          { id: 'sự kiện', label: 'Lễ trao Visa & Sự kiện' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCat(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
              filterCat === cat.id ? 'bg-red-600 text-white shadow-xs' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            {cat.label} ({cat.id === 'all' ? photos.length : photos.filter(p => p.category.toLowerCase().includes(cat.id.toLowerCase())).length})
          </button>
        ))}
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(photo => (
          <div key={photo.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="relative aspect-video bg-stone-100 overflow-hidden">
              <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] rounded-md font-bold uppercase backdrop-blur-xs">
                {photo.category}
              </span>
            </div>

            <div className="p-3.5 space-y-2 flex-grow flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-stone-900 line-clamp-1 text-sm">{photo.title}</h4>
                <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                  <span className="truncate">{photo.location}</span>
                </p>
                <p className="text-[11px] text-stone-400 font-mono mt-0.5">{photo.date}</p>
                {photo.caption && (
                  <p className="text-[11px] text-stone-600 mt-1.5 line-clamp-2 italic bg-stone-50 p-1.5 rounded-lg border border-stone-100">
                    "{photo.caption}"
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[10px] text-stone-400 font-mono">ID: {photo.id}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(photo)}
                    className="p-1.5 text-stone-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-1 font-bold text-[11px]"
                    title="Chỉnh sửa ảnh"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Xóa ảnh"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Photo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-red-600" />
                <span>{editingItem ? 'Chỉnh Sửa Hình Ảnh' : 'Thêm Hình Ảnh Mới'}</span>
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Preview & Upload */}
              <div>
                <label className="block font-bold text-stone-700 mb-1.5">Hình ảnh (Tải lên từ máy hoặc nhập URL)</label>
                <div className="flex gap-3 items-center">
                  <div className="w-24 h-16 rounded-xl bg-stone-100 border border-stone-300 overflow-hidden shrink-0 flex items-center justify-center">
                    {url ? (
                      <img src={url} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-stone-400" />
                    )}
                  </div>
                  <div className="flex-grow space-y-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs cursor-pointer border border-stone-300 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-red-600" />
                      <span>Chọn file từ máy tính</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      placeholder="Hoặc dán URL ảnh (https://...)"
                      className="w-full p-2 border border-stone-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Tiêu đề ảnh / Sự kiện</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="VD: Tiễn bay 12 học sinh SEIU xuất cảnh kỳ tháng 3/2026..."
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Chuyên mục</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                  >
                    <option value="tiễn bay">Tiễn bay sân bay</option>
                    <option value="lớp học">Lớp học SEIU</option>
                    <option value="hàn quốc">Đời sống Hàn Quốc</option>
                    <option value="sự kiện">Lễ trao Visa & Sự kiện</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Thời gian</label>
                  <input
                    type="text"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    placeholder="VD: Tháng 03/2026"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Địa điểm</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="VD: Sân bay Quốc tế Tân Sơn Nhất / Cơ sở Vị Thanh..."
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Mô tả / Chú thích ảnh</label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  placeholder="Mô tả chi tiết cảm xúc hoặc thành tích của học viên..."
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/20"
                >
                  {editingItem ? 'Cập Nhật Ảnh' : 'Lưu Vào Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


// ==========================================
// 2. ADMIN STUDENTS PANEL (HỌC SINH & HỒ SƠ)
// ==========================================
export const AdminStudentsPanel: React.FC = () => {
  const [students, setStudents] = useState<StudentItem[]>(getStoredStudents());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StudentItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
  const [phone, setPhone] = useState('');
  const [hometown, setHometown] = useState('Vị Thanh, Hậu Giang');
  const [gpa, setGpa] = useState('8.0');
  const [target, setTarget] = useState('ĐH Quốc Gia Pusan (Visa D4-1)');
  const [status, setStatus] = useState('Đang Xử Lý Hồ Sơ');
  const [term, setTerm] = useState('Kỳ Tháng 09/2026');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const handleSync = () => setStudents(getStoredStudents());
    window.addEventListener('seiu_site_data_updated', handleSync);
    return () => window.removeEventListener('seiu_site_data_updated', handleSync);
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
    setPhone('0988***123');
    setHometown('Vị Thanh, Hậu Giang');
    setGpa('8.0');
    setTarget('ĐH Konkuk Seoul (Visa D4-1)');
    setStatus('Đang Xử Lý Hồ Sơ');
    setTerm('Kỳ Tháng 09/2026');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (st: StudentItem) => {
    setEditingItem(st);
    setName(st.name);
    setAvatar(st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
    setPhone(st.phone);
    setHometown(st.hometown);
    setGpa(st.gpa);
    setTarget(st.target);
    setStatus(st.status);
    setTerm(st.term);
    setNotes(st.notes || '');
    setIsModalOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setAvatar(dataUrl);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên học sinh!');
      return;
    }

    if (editingItem) {
      const updated = students.map(s => 
        s.id === editingItem.id ? { ...s, name, avatar, phone, hometown, gpa, target, status, term, notes } : s
      );
      setStudents(updated);
      saveStudents(updated);
    } else {
      const newItem: StudentItem = {
        id: `st-${Date.now()}`,
        name,
        avatar,
        phone,
        hometown,
        gpa,
        target,
        status,
        term,
        notes
      };
      const updated = [newItem, ...students];
      setStudents(updated);
      saveStudents(updated);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa học viên này?')) {
      const updated = students.filter(s => s.id !== id);
      setStudents(updated);
      saveStudents(updated);
    }
  };

  const filtered = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.hometown.toLowerCase().includes(search.toLowerCase()) ||
    s.target.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-red-50/50 p-4 rounded-2xl border border-red-100">
        <div>
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-600" />
            <span>Quản Lý Học Viên & Tiến Độ Hồ Sơ Du Học</span>
          </h3>
          <p className="text-stone-600 text-xs mt-0.5">
            Theo dõi danh sách học viên, avatar ảnh đại diện, GPA, trường mục tiêu và tiến độ xuất cảnh.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Học Viên Mới</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên, quê quán, trường mục tiêu..."
            className="w-full pl-9 pr-4 py-2.5 border border-stone-300 rounded-xl bg-white text-xs"
          />
        </div>
        <span className="text-stone-500 font-bold">{filtered.length} hồ sơ</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Học Viên & Avatar</th>
              <th className="py-3 px-4">Quê Quán</th>
              <th className="py-3 px-4">GPA</th>
              <th className="py-3 px-4">Trường Mục Tiêu</th>
              <th className="py-3 px-4">Kỳ Nhập Học</th>
              <th className="py-3 px-4">Tình Trạng</th>
              <th className="py-3 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map(st => (
              <tr key={st.id} className="hover:bg-stone-50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={st.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'} 
                      alt={st.name} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-stone-200 shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="font-bold text-stone-900 text-sm">{st.name}</div>
                      <div className="text-[11px] text-stone-400">{st.phone}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-medium text-stone-700">{st.hometown}</td>
                <td className="py-3 px-4 font-bold text-red-600">{st.gpa}</td>
                <td className="py-3 px-4 font-semibold text-stone-900">{st.target}</td>
                <td className="py-3 px-4 text-stone-600">{st.term}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    st.status.includes('Bay') || st.status.includes('Visa')
                      ? 'bg-emerald-100 text-emerald-800'
                      : st.status.includes('Code') || st.status.includes('Học Bổng')
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {st.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditModal(st)}
                      className="p-1.5 text-stone-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors font-bold text-[11px] flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa</span>
                    </button>
                    <button
                      onClick={() => handleDelete(st.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Xóa hồ sơ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add / Edit Student */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-red-600" />
                <span>{editingItem ? 'Chỉnh Sửa Hồ Sơ Học Viên' : 'Thêm Học Viên Mới'}</span>
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar Upload */}
              <div>
                <label className="block font-bold text-stone-700 mb-1.5">Ảnh đại diện (Avatar học viên)</label>
                <div className="flex gap-3 items-center">
                  <img 
                    src={avatar} 
                    alt="Avatar preview" 
                    className="w-14 h-14 rounded-full object-cover border-2 border-red-500 shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-grow space-y-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs cursor-pointer border border-stone-300 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-red-600" />
                      <span>Chọn ảnh từ máy tính</span>
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </label>
                    <input
                      type="url"
                      value={avatar}
                      onChange={e => setAvatar(e.target.value)}
                      placeholder="Hoặc dán URL avatar"
                      className="w-full p-2 border border-stone-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Họ tên học viên</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="VD: Nguyễn Văn An"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="0988***123"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Quê quán</label>
                  <input
                    type="text"
                    value={hometown}
                    onChange={e => setHometown(e.target.value)}
                    placeholder="VD: TP. Vị Thanh, Hậu Giang"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Điểm GPA cấp 3</label>
                  <input
                    type="text"
                    value={gpa}
                    onChange={e => setGpa(e.target.value)}
                    placeholder="VD: 8.2"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold text-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Trường mục tiêu & Hệ Visa</label>
                <input
                  type="text"
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  placeholder="VD: Đại Học Konkuk Seoul (Visa D4-1 Top 1%)"
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Kỳ nhập học</label>
                  <input
                    type="text"
                    value={term}
                    onChange={e => setTerm(e.target.value)}
                    placeholder="VD: Kỳ Tháng 09/2026"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tình trạng hồ sơ</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                  >
                    <option value="Đang Học Tiếng & Xử Lý">Đang Học Tiếng & Xử Lý</option>
                    <option value="Đã Có Code Visa">Đã Có Code Visa</option>
                    <option value="Đã Cấp Visa & Đã Bay">Đã Cấp Visa & Đã Bay</option>
                    <option value="Đạt Học Bổng 50%">Đạt Học Bổng 50%</option>
                    <option value="Đã Cấp Visa E-7">Đã Cấp Visa E-7</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Ghi chú thêm</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Học bổng đạt được, thành tích TOPIK..."
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/20"
                >
                  {editingItem ? 'Cập Nhật Hồ Sơ' : 'Lưu Hồ Sơ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


// ==========================================
// 3. ADMIN PARTNERS PANEL (ĐỐI TÁC TRƯỜNG ĐH)
// ==========================================
export const AdminPartnersPanel: React.FC = () => {
  const [partners, setPartners] = useState<PartnerUniItem[]>(getStoredPartners());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PartnerUniItem | null>(null);

  // Form State
  const [nameVi, setNameVi] = useState('');
  const [nameKr, setNameKr] = useState('');
  const [location, setLocation] = useState('Seoul');
  const [type, setType] = useState('Top 1% Visa Thẳng');
  const [scholarship, setScholarship] = useState('30% - 100% học phí');
  const [logo, setLogo] = useState('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=120&q=80');
  const [highlight, setHighlight] = useState('');

  useEffect(() => {
    const handleSync = () => setPartners(getStoredPartners());
    window.addEventListener('seiu_site_data_updated', handleSync);
    return () => window.removeEventListener('seiu_site_data_updated', handleSync);
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setNameVi('');
    setNameKr('');
    setLocation('Seoul');
    setType('Top 1% Visa Thẳng');
    setScholarship('30% - 100% học phí');
    setLogo('https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=120&q=80');
    setHighlight('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: PartnerUniItem) => {
    setEditingItem(p);
    setNameVi(p.nameVi);
    setNameKr(p.nameKr);
    setLocation(p.location);
    setType(p.type);
    setScholarship(p.scholarship);
    setLogo(p.logo);
    setHighlight(p.highlight || '');
    setIsModalOpen(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setLogo(dataUrl);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameVi.trim()) {
      alert('Vui lòng nhập tên trường đại học!');
      return;
    }

    if (editingItem) {
      const updated = partners.map(p => 
        p.id === editingItem.id ? { ...p, nameVi, nameKr, location, type, scholarship, logo, highlight } : p
      );
      setPartners(updated);
      savePartners(updated);
    } else {
      const newItem: PartnerUniItem = {
        id: `p-${Date.now()}`,
        nameVi,
        nameKr,
        location,
        type,
        scholarship,
        logo,
        highlight
      };
      const updated = [newItem, ...partners];
      setPartners(updated);
      savePartners(updated);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa trường đại học này?')) {
      const updated = partners.filter(p => p.id !== id);
      setPartners(updated);
      savePartners(updated);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-red-50/50 p-4 rounded-2xl border border-red-100">
        <div>
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-red-600" />
            <span>Mạng Lưới Trường Đại Học Đối Tác Hàn Quốc</span>
          </h3>
          <p className="text-stone-600 text-xs mt-0.5">
            Quản lý logo trường, phân loại trường Top 1% / Visa Thẳng / Chứng Nhận và gói học bổng liên kết.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Trường Đối Tác</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {partners.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex items-start gap-3.5">
              <div className="w-14 h-14 rounded-xl bg-stone-50 border border-stone-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                <img src={p.logo} alt={p.nameVi} className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-grow space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-extrabold text-stone-900 text-sm line-clamp-1">{p.nameVi}</span>
                </div>
                <p className="text-[11px] text-stone-500">{p.nameKr} · {p.location}</p>
                <span className="inline-block text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-black uppercase">
                  {p.type}
                </span>
                <p className="text-[11px] text-emerald-700 font-bold">🎁 {p.scholarship}</p>
                {p.highlight && (
                  <p className="text-[11px] text-stone-600 italic">{p.highlight}</p>
                )}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
              <span className="text-[10px] text-stone-400 font-mono">ID: {p.id}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(p)}
                  className="p-1.5 text-stone-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors font-bold text-[11px] flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa</span>
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Xóa trường"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Partner */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-red-600" />
                <span>{editingItem ? 'Chỉnh Sửa Trường Đối Tác' : 'Thêm Trường Đối Tác Mới'}</span>
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Logo Upload */}
              <div>
                <label className="block font-bold text-stone-700 mb-1.5">Logo / Huy hiệu trường</label>
                <div className="flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-xl bg-stone-50 border border-stone-300 p-1 flex items-center justify-center shrink-0">
                    <img src={logo} alt="Logo preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-grow space-y-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs cursor-pointer border border-stone-300 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-red-600" />
                      <span>Tải logo từ máy</span>
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    <input
                      type="url"
                      value={logo}
                      onChange={e => setLogo(e.target.value)}
                      placeholder="Hoặc dán URL logo"
                      className="w-full p-2 border border-stone-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Tên trường (Tiếng Việt)</label>
                <input
                  type="text"
                  required
                  value={nameVi}
                  onChange={e => setNameVi(e.target.value)}
                  placeholder="VD: Đại Học Quốc Gia Pusan (PNU)"
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tên tiếng Hàn (Hangeul)</label>
                  <input
                    type="text"
                    value={nameKr}
                    onChange={e => setNameKr(e.target.value)}
                    placeholder="VD: 부산대학교"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Khu vực / Thành phố</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="VD: Busan / Seoul / Daejeon"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Phân loại trường / Visa</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                  >
                    <option value="Top 1% Visa Thẳng">Top 1% Visa Thẳng</option>
                    <option value="Trường Chứng Nhận">Trường Chứng Nhận</option>
                    <option value="Visa E-7 Định Cư">Visa E-7 Định Cư (CĐ Nghề)</option>
                    <option value="Đại Học Quốc Gia">Đại Học Quốc Gia</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Chính sách học bổng</label>
                  <input
                    type="text"
                    value={scholarship}
                    onChange={e => setScholarship(e.target.value)}
                    placeholder="VD: 30% - 100% học phí"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Điểm nổi bật / Thế mạnh trường</label>
                <input
                  type="text"
                  value={highlight}
                  onChange={e => setHighlight(e.target.value)}
                  placeholder="VD: Top 2 Đại học Quốc gia hàng đầu, khuôn viên rộng lớn..."
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/20"
                >
                  {editingItem ? 'Cập Nhật' : 'Thêm Trường'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


// ==========================================
// 4. ADMIN VISAS PANEL (KẾT QUẢ VISA)
// ==========================================
export const AdminVisasPanel: React.FC = () => {
  const [visas, setVisas] = useState<VisaResultItem[]>(getStoredVisas());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VisaResultItem | null>(null);

  // Form State
  const [studentName, setStudentName] = useState('');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
  const [hometown, setHometown] = useState('TP. Vị Thanh, Hậu Giang');
  const [gpa, setGpa] = useState('8.2');
  const [visaCode, setVisaCode] = useState('Visa D4-1 (Visa Thẳng Top 1%)');
  const [visaType, setVisaType] = useState('D4-1');
  const [university, setUniversity] = useState('Đại Học Konkuk (Seoul)');
  const [grantDate, setGrantDate] = useState('Tháng 02/2026');
  const [costPackage, setCostPackage] = useState('Phí Dịch Vụ 75 Triệu (Thu Sau Khi Đậu Visa)');
  const [scholarship, setScholarship] = useState('Học bổng 30% học phí kỳ đầu');
  const [quote, setQuote] = useState('Em đậu Visa thẳng chỉ sau 3 tuần nộp hồ sơ. Thầy Bửu và các thầy cô ở Vị Thanh hướng dẫn rất tận tình!');
  const [branch, setBranch] = useState('Cơ sở Vị Thanh');

  useEffect(() => {
    const handleSync = () => setVisas(getStoredVisas());
    window.addEventListener('seiu_site_data_updated', handleSync);
    return () => window.removeEventListener('seiu_site_data_updated', handleSync);
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setStudentName('');
    setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
    setHometown('TP. Vị Thanh, Hậu Giang');
    setGpa('8.2');
    setVisaCode('Visa D4-1 (Visa Thẳng Top 1%)');
    setVisaType('D4-1');
    setUniversity('Đại Học Konkuk (Seoul)');
    setGrantDate('Tháng 03/2026');
    setCostPackage('Phí Dịch Vụ 75 Triệu (Thu Sau Khi Đậu Visa)');
    setScholarship('Học bổng 30% học phí');
    setQuote('Nhờ sự hướng dẫn sát sao của Thầy Bửu, em đã có visa chỉ sau 3 tuần nộp!');
    setBranch('Cơ sở Vị Thanh');
    setIsModalOpen(true);
  };

  const openEditModal = (v: VisaResultItem) => {
    setEditingItem(v);
    setStudentName(v.studentName);
    setAvatar(v.avatar);
    setHometown(v.hometown);
    setGpa(v.gpa);
    setVisaCode(v.visaCode);
    setVisaType(v.visaType);
    setUniversity(v.university);
    setGrantDate(v.grantDate);
    setCostPackage(v.costPackage);
    setScholarship(v.scholarship || '');
    setQuote(v.quote);
    setBranch(v.branch);
    setIsModalOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setAvatar(dataUrl);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert('Vui lòng nhập tên học viên đạt Visa!');
      return;
    }

    if (editingItem) {
      const updated = visas.map(v => 
        v.id === editingItem.id ? { ...v, studentName, avatar, hometown, gpa, visaCode, visaType, university, grantDate, costPackage, scholarship, quote, branch } : v
      );
      setVisas(updated);
      saveVisas(updated);
    } else {
      const newItem: VisaResultItem = {
        id: `v-${Date.now()}`,
        studentName,
        avatar,
        hometown,
        gpa,
        visaCode,
        visaType,
        university,
        grantDate,
        costPackage,
        scholarship,
        quote,
        branch
      };
      const updated = [newItem, ...visas];
      setVisas(updated);
      saveVisas(updated);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa kết quả Visa này?')) {
      const updated = visas.filter(v => v.id !== id);
      setVisas(updated);
      saveVisas(updated);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-red-50/50 p-4 rounded-2xl border border-red-100">
        <div>
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-red-600" />
            <span>Bảng Vàng Kết Quả Visa Du Học (Thu Phí Dịch Vụ Sau Visa)</span>
          </h3>
          <p className="text-stone-600 text-xs mt-0.5">
            Quản lý danh sách học viên nhận Visa thật từ ĐSQ/TLSQ Hàn Quốc, hình ảnh avatar, chia sẻ cảm nhận và trường trúng tuyển.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Kết Quả Visa</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {visas.map(v => (
          <div key={v.id} className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-red-400">Mã Visa & Loại</span>
                <p className="font-mono font-black text-xs text-white line-clamp-1">{v.visaCode}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30 shrink-0">
                {v.grantDate}
              </span>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <img src={v.avatar} alt={v.studentName} className="w-12 h-12 rounded-full object-cover border-2 border-red-500 shrink-0" referrerPolicy="no-referrer" />
                <div>
                  <h4 className="font-extrabold text-sm text-stone-900">{v.studentName}</h4>
                  <p className="text-stone-500 text-xs">{v.hometown} · GPA {v.gpa}</p>
                </div>
              </div>

              <div className="p-3 bg-red-50/70 rounded-xl border border-red-200 text-[11px] space-y-1">
                <p className="font-bold text-stone-900">🎓 {v.university} ({v.visaType})</p>
                <p className="text-red-700 font-semibold">💰 {v.costPackage}</p>
                {v.scholarship && (
                  <p className="text-emerald-700 font-bold">🎁 {v.scholarship}</p>
                )}
              </div>

              <p className="text-xs text-stone-600 italic bg-stone-50 p-2.5 rounded-xl border border-stone-100">"{v.quote}"</p>
            </div>

            <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span>{v.branch}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(v)}
                  className="p-1.5 text-stone-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors font-bold text-[11px] flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa</span>
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Visa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-red-600" />
                <span>{editingItem ? 'Chỉnh Sửa Kết Quả Visa' : 'Thêm Học Viên Đậu Visa'}</span>
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar Upload */}
              <div>
                <label className="block font-bold text-stone-700 mb-1.5">Ảnh Avatar học viên đạt Visa</label>
                <div className="flex gap-3 items-center">
                  <img 
                    src={avatar} 
                    alt="Avatar preview" 
                    className="w-14 h-14 rounded-full object-cover border-2 border-red-500 shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-grow space-y-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs cursor-pointer border border-stone-300 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-red-600" />
                      <span>Tải ảnh từ máy</span>
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </label>
                    <input
                      type="url"
                      value={avatar}
                      onChange={e => setAvatar(e.target.value)}
                      placeholder="Hoặc dán URL avatar"
                      className="w-full p-2 border border-stone-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Tên học viên</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    placeholder="VD: Nguyễn Hoàng Yến Nhi"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Quê quán</label>
                  <input
                    type="text"
                    value={hometown}
                    onChange={e => setHometown(e.target.value)}
                    placeholder="VD: TP. Vị Thanh, Hậu Giang"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Điểm GPA</label>
                  <input
                    type="text"
                    value={gpa}
                    onChange={e => setGpa(e.target.value)}
                    placeholder="8.4"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-bold text-red-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Loại Visa</label>
                  <select
                    value={visaType}
                    onChange={e => setVisaType(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="D4-1">D4-1 (Du học tiếng)</option>
                    <option value="D2-1">D2-1 (CĐ Nghề E-7)</option>
                    <option value="D2-2">D2-2 (Đại học)</option>
                    <option value="D2-3">D2-3 (Thạc sĩ)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Ngày cấp</label>
                  <input
                    type="text"
                    value={grantDate}
                    onChange={e => setGrantDate(e.target.value)}
                    placeholder="Tháng 03/2026"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Trường trúng tuyển</label>
                <input
                  type="text"
                  value={university}
                  onChange={e => setUniversity(e.target.value)}
                  placeholder="VD: Đại Học Konkuk (Seoul)"
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Gói dịch vụ & Học bổng</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={costPackage}
                    onChange={e => setCostPackage(e.target.value)}
                    placeholder="VD: Phí dịch vụ 75 triệu (thu sau Visa)"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    value={scholarship}
                    onChange={e => setScholarship(e.target.value)}
                    placeholder="VD: Học bổng 30% học phí"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Cảm nhận học viên (Quote)</label>
                <textarea
                  rows={2}
                  value={quote}
                  onChange={e => setQuote(e.target.value)}
                  placeholder="Chia sẻ niềm vui đậu visa và quá trình học tại SEIU..."
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/20"
                >
                  {editingItem ? 'Cập Nhật' : 'Lưu Kết Quả'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


// ==========================================
// 5. ADMIN NEWS PANEL (TIN TỨC & SỰ KIỆN)
// ==========================================
export const AdminNewsPanel: React.FC = () => {
  const [news, setNews] = useState<NewsEventItem[]>(getStoredNews());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsEventItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Lịch thi TOPIK');
  const [date, setDate] = useState('15/03/2026');
  const [summary, setSummary] = useState('');
  const [tag, setTag] = useState('Quan trọng');

  useEffect(() => {
    const handleSync = () => setNews(getStoredNews());
    window.addEventListener('seiu_site_data_updated', handleSync);
    return () => window.removeEventListener('seiu_site_data_updated', handleSync);
  }, []);

  const openAddModal = () => {
    setEditingItem(null);
    setTitle('');
    setCategory('Lịch thi TOPIK');
    setDate(new Date().toLocaleDateString('vi-VN'));
    setSummary('');
    setTag('Thông báo');
    setIsModalOpen(true);
  };

  const openEditModal = (item: NewsEventItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setDate(item.date);
    setSummary(item.summary);
    setTag(item.tag);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề tin tức!');
      return;
    }

    if (editingItem) {
      const updated = news.map(n => 
        n.id === editingItem.id ? { ...n, title, category, date, summary, tag } : n
      );
      setNews(updated);
      saveNews(updated);
    } else {
      const newItem: NewsEventItem = {
        id: `n-${Date.now()}`,
        createdAt: new Date().toISOString(),
        title,
        category,
        date,
        summary,
        tag
      };
      const updated = [newItem, ...news];
      setNews(updated);
      saveNews(updated);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản tin này?')) {
      const updated = news.filter(n => n.id !== id);
      setNews(updated);
      saveNews(updated);
    }
  };

  // Bài mới đăng luôn nằm trên cùng; vượt quá giới hạn thì bài cũ nhất tự ẩn khỏi trang chủ
  const newsLimit = getStoredSiteConfig().newsVisibleCount ?? 6;
  const orderedNews: NewsEventItem[] = sortNewestFirst<NewsEventItem>(news);

  const toggleArchive = (id: string) => {
    const updated = news.map(n => (n.id === id ? { ...n, archived: !n.archived } : n));
    setNews(updated);
    saveNews(updated);
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-red-50/50 p-4 rounded-2xl border border-red-100">
        <div>
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-red-600" />
            <span>Tin Tức Tuyển Sinh, Lịch Thi TOPIK & Hoạt Động</span>
          </h3>
          <p className="text-stone-600 text-xs mt-0.5">
            Cập nhật lịch thi TOPIK I/II, thông báo tuyển sinh các kỳ bay và hội thảo du học.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-red-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Tin Mới</span>
        </button>
      </div>

      <div className="space-y-3">
        {orderedNews.map((item, idx) => (
          <div key={item.id} className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-red-300 transition-all">
            <div className="space-y-1.5 flex-grow">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px] uppercase">
                  {item.category}
                </span>
                <span className="text-stone-400 text-[11px]">{item.date}</span>
                <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md font-bold text-[10px]">
                  {item.tag}
                </span>
                {idx < newsLimit && !item.archived ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase">
                    Đang hiện · vị trí {idx + 1}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-600 font-bold text-[10px] uppercase">
                    Lưu trữ (đã ẩn khỏi trang chủ)
                  </span>
                )}
              </div>
              <h4 className="font-extrabold text-stone-900 text-sm">{item.title}</h4>
              <p className="text-xs text-stone-600 leading-relaxed">{item.summary}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => openEditModal(item)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-700 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sửa</span>
              </button>
              <button
                onClick={() => toggleArchive(item.id)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs transition-colors"
                title={item.archived ? 'Đưa bài này hiện lại trên trang chủ' : 'Ẩn bài này khỏi trang chủ'}
              >
                {item.archived ? 'Hiện lại' : 'Ẩn đi'}
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-stone-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                title="Xóa tin"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit News */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-red-600" />
                <span>{editingItem ? 'Chỉnh Sửa Bản Tin' : 'Thêm Bản Tin Mới'}</span>
              </h4>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Tiêu đề thông báo / Tin tức</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="VD: Thông báo lịch đăng ký và thi TOPIK năm 2026..."
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Chuyên mục</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                  >
                    <option value="Lịch thi TOPIK">Lịch thi TOPIK</option>
                    <option value="Tuyển sinh">Tuyển sinh</option>
                    <option value="Học bổng">Học bổng</option>
                    <option value="Chính sách Visa">Chính sách Visa</option>
                    <option value="Sự kiện">Sự kiện</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Ngày đăng</label>
                  <input
                    type="text"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    placeholder="15/03/2026"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Thẻ Tag</label>
                  <input
                    type="text"
                    value={tag}
                    onChange={e => setTag(e.target.value)}
                    placeholder="VD: Quan trọng / Tuyển sinh"
                    className="w-full p-2.5 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Tóm tắt nội dung thông báo</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="Nội dung chi tiết thông báo..."
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/20"
                >
                  {editingItem ? 'Cập Nhật' : 'Đăng Bản Tin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
