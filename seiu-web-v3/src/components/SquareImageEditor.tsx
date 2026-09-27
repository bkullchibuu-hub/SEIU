import React, { useEffect, useMemo, useState } from 'react';
import { Check, Crop, ImagePlus, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
}

export const SquareImageEditor: React.FC<Props> = ({ isOpen, file, onClose, onSave }) => {
  const [source, setSource] = useState('');
  const [zoom, setZoom] = useState(1);
  const [positionX, setPositionX] = useState(50);
  const [positionY, setPositionY] = useState(50);

  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSource(String(reader.result || ''));
    reader.readAsDataURL(file);
    setZoom(1);
    setPositionX(50);
    setPositionY(50);
  }, [file]);

  const previewStyle = useMemo<React.CSSProperties>(() => ({
    transform: `scale(${zoom})`,
    transformOrigin: `${positionX}% ${positionY}%`,
    objectPosition: `${positionX}% ${positionY}%`,
  }), [zoom, positionX, positionY]);

  const saveSquare = () => {
    if (!source) return;
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1200;
      const context = canvas.getContext('2d');
      if (!context) return;
      const cropSize = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
      const maxX = Math.max(0, image.naturalWidth - cropSize);
      const maxY = Math.max(0, image.naturalHeight - cropSize);
      const sourceX = maxX * (positionX / 100);
      const sourceY = maxY * (positionY / 100);
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, 1200, 1200);
      onSave(canvas.toDataURL('image/webp', 0.84));
      onClose();
    };
    image.src = source;
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <div><h3 className="flex items-center gap-2 font-black text-stone-900"><Crop className="h-5 w-5 text-red-600" /> Chỉnh ảnh bìa vuông 1:1</h3><p className="mt-0.5 text-xs text-stone-500">Phóng to và chọn vị trí trọng tâm trước khi lưu.</p></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-5 p-5">
          <div className="mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-xl bg-stone-100 ring-1 ring-stone-200">
            {source ? <img src={source} alt="Xem trước vùng cắt" className="h-full w-full object-cover transition-transform duration-200" style={previewStyle} /> : <div className="flex h-full items-center justify-center text-stone-400"><ImagePlus className="h-10 w-10" /></div>}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs font-bold text-stone-700">Phóng ảnh<input type="range" min="1" max="2.5" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="mt-2 w-full accent-red-600" /></label>
            <label className="text-xs font-bold text-stone-700">Căn trái – phải<input type="range" min="0" max="100" value={positionX} onChange={(event) => setPositionX(Number(event.target.value))} className="mt-2 w-full accent-red-600" /></label>
            <label className="text-xs font-bold text-stone-700">Căn trên – dưới<input type="range" min="0" max="100" value={positionY} onChange={(event) => setPositionY(Number(event.target.value))} className="mt-2 w-full accent-red-600" /></label>
          </div>
          <div className="flex justify-end gap-2 border-t border-stone-100 pt-4">
            <button type="button" onClick={onClose} className="rounded-xl bg-stone-100 px-4 py-2.5 text-xs font-bold text-stone-700">Hủy</button>
            <button type="button" onClick={saveSquare} className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-red-700"><Check className="h-4 w-4" /> Cắt vuông và sử dụng</button>
          </div>
        </div>
      </div>
    </div>
  );
};
