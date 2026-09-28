import { useEffect, useId, type ReactNode } from 'react';

// Các modal đang mở, để phím Esc chỉ đóng modal trên cùng.
const openModals: string[] = [];

export const Modal = ({ title, onClose, children, wide = false }: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) => {
  const id = useId();
  useEffect(() => {
    openModals.push(id);
    return () => {
      openModals.splice(openModals.indexOf(id), 1);
    };
  }, [id]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openModals[openModals.length - 1] === id) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id, onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Đóng">×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export const Field = ({ label, required, hint, children, full }: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  full?: boolean;
}) => (
  <label className={`field ${full ? 'field-full' : ''}`}>
    <span className="field-label">{label}{required && <b className="req"> *</b>}</span>
    {children}
    {hint && <span className="field-hint">{hint}</span>}
  </label>
);

export const Badge = ({ tone, children }: { tone: 'green' | 'amber' | 'gray' | 'blue' | 'red'; children: ReactNode }) => (
  <span className={`badge badge-${tone}`}>{children}</span>
);

export const Empty = ({ children }: { children: ReactNode }) => <div className="empty">{children}</div>;

export const ErrorBox = ({ message, children }: { message: string; children?: ReactNode }) =>
  message ? <div className="alert alert-error" role="alert">{message}{children}</div> : null;
