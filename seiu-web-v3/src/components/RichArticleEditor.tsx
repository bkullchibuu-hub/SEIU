import React, { useEffect, useRef } from 'react';
import { Bold, Heading2, ImagePlus, Italic, Link2, List, ListOrdered, Quote, RotateCcw } from 'lucide-react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  onUploadImage: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RichArticleEditor: React.FC<Props> = ({ value, onChange, onUploadImage }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && document.activeElement !== editor && editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, [value]);

  const run = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    onChange(editorRef.current?.innerHTML || '');
  };

  const addLink = () => {
    const url = window.prompt('Dán đường dẫn cần liên kết:');
    if (url) run('createLink', url);
  };

  const toolbarButton = 'inline-flex h-8 items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 text-[11px] font-bold text-stone-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700';

  return (
    <div className="overflow-hidden rounded-xl border border-stone-300 bg-white">
      <div className="flex flex-wrap gap-1.5 border-b border-stone-200 bg-stone-50 p-2.5" aria-label="Thanh công cụ soạn bài">
        <button type="button" className={toolbarButton} onClick={() => run('formatBlock', 'h2')}><Heading2 className="h-3.5 w-3.5" /> Tiêu đề mục</button>
        <button type="button" className={toolbarButton} onClick={() => run('bold')}><Bold className="h-3.5 w-3.5" /> Đậm</button>
        <button type="button" className={toolbarButton} onClick={() => run('italic')}><Italic className="h-3.5 w-3.5" /> Nghiêng</button>
        <button type="button" className={toolbarButton} onClick={() => run('insertUnorderedList')}><List className="h-3.5 w-3.5" /> Danh sách</button>
        <button type="button" className={toolbarButton} onClick={() => run('insertOrderedList')}><ListOrdered className="h-3.5 w-3.5" /> Đánh số</button>
        <button type="button" className={toolbarButton} onClick={() => run('formatBlock', 'blockquote')}><Quote className="h-3.5 w-3.5" /> Trích dẫn</button>
        <button type="button" className={toolbarButton} onClick={addLink}><Link2 className="h-3.5 w-3.5" /> Gắn link</button>
        <label className={`${toolbarButton} cursor-pointer border-red-200 text-red-700`}>
          <ImagePlus className="h-3.5 w-3.5" /> Thêm ảnh từ máy
          <input type="file" accept="image/*" className="hidden" onChange={onUploadImage} />
        </label>
        <button type="button" className={toolbarButton} onClick={() => run('removeFormat')}><RotateCcw className="h-3.5 w-3.5" /> Xóa định dạng</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current?.innerHTML || '')}
        className="article-composer min-h-[360px] p-5 text-sm leading-7 text-stone-800 outline-none sm:p-7"
        data-placeholder="Bắt đầu viết bài tại đây. Dùng nút ‘Tiêu đề mục’ để chia nội dung và ‘Thêm ảnh từ máy’ để chèn ảnh..."
      />
    </div>
  );
};
