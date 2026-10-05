import { useMemo, useState } from 'react';
import { api } from '../api';
import { parseExcelPaste } from '../excelImport';
import { birthLabel, formatMoney, formatPhone } from '../types';
import { ErrorBox, Modal } from './ui';

interface ImportResult {
  created: number;
  updated: number;
  feeKept: string[];
  skipped: { row: number; name?: string; reason: string }[];
  classesCreated: string[];
}

// Dán bảng học viên copy từ Excel → xem trước → nhập.
export const ImportDialog = ({ onClose, onImported }: { onClose: () => void; onImported: () => Promise<void> }) => {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [updateExisting, setUpdateExisting] = useState(true);

  const parsed = useMemo(() => (text.trim() ? parseExcelPaste(text) : null), [text]);
  const classNames = [...new Set((parsed?.rows ?? []).map(r => r.className).filter(Boolean))];

  const run = async () => {
    if (!parsed?.rows.length) return;
    setBusy(true);
    setError('');
    try {
      const res = await api<ImportResult>('POST', 'import/students', { rows: parsed.rows, updateExisting });
      setResult(res);
      await onImported();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <Modal title="Đã nhập xong" onClose={onClose} wide>
        <div className="alert alert-success">
          Đã thêm mới <b>{result.created}</b> học viên{result.updated ? <>, cập nhật <b>{result.updated}</b> học viên đã có</> : null}.
        </div>
        {result.feeKept.length > 0 && (
          <p className="small">
            Giữ nguyên học phí trong app (vì đã ghi lần đóng tiền trong app) cho: {result.feeKept.join(', ')}.
          </p>
        )}
        {result.classesCreated.length > 0 && (
          <p>
            Đã tạo {result.classesCreated.length} lớp mới: <b>{result.classesCreated.join(', ')}</b>.
            {' '}Vào tab <b>Lớp học</b> để điền giáo viên, lịch học và trình độ cho các lớp này.
          </p>
        )}
        {result.skipped.length > 0 && (
          <>
            <p className="muted">Bỏ qua {result.skipped.length} dòng:</p>
            <ul className="small">
              {result.skipped.map((s, i) => <li key={i}>{s.name ? `${s.name}: ` : `Dòng ${s.row}: `}{s.reason}</li>)}
            </ul>
          </>
        )}
        <div className="form-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>Xong</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Nhập học viên từ Excel" onClose={onClose} size="xl">
      <ol className="import-steps">
        <li>Trong Excel, bôi đen bảng học viên <b>kể cả dòng tiêu đề</b> (STT, Số báo danh, Họ và tên, SĐT…) rồi bấm Ctrl+C.</li>
        <li>Bấm vào ô bên dưới và dán (Ctrl+V).</li>
        <li>Xem lại bảng xem trước rồi bấm <b>Nhập</b>.</li>
      </ol>
      <textarea
        className="import-box"
        rows={6}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Dán bảng Excel vào đây…"
        aria-label="Dán bảng Excel"
      />
      <label className="check import-update">
        <input type="checkbox" checked={updateExisting} onChange={e => setUpdateExisting(e.target.checked)} />
        <span>
          Cập nhật học viên đã có (cùng số báo danh) theo bảng mới.
          <span className="muted small"> Ô trống trong Excel thì giữ nguyên thông tin trong app. Bỏ chọn để chỉ thêm người mới.</span>
        </span>
      </label>
      <ErrorBox message={error} />

      {parsed && !parsed.headerFound && (
        <div className="alert alert-error">
          Không thấy dòng tiêu đề có cột “Họ và tên”. Hãy copy cả dòng tiêu đề của bảng.
        </div>
      )}

      {parsed?.headerFound && (
        <>
          <div className="import-summary">
            <span><b>{parsed.rows.length}</b> học viên</span>
            <span><b>{classNames.length}</b> lớp: {classNames.slice(0, 12).join(', ')}{classNames.length > 12 ? '…' : ''}</span>
            <span><b>{parsed.warnings.length}</b> cảnh báo</span>
          </div>
          {parsed.warnings.length > 0 && (
            <details className="import-warnings">
              <summary>Xem {parsed.warnings.length} chỗ đã tự sửa hoặc cần xem lại</summary>
              <ul className="small">
                {parsed.warnings.map((w, i) => <li key={i}><b>{w.name}</b>: {w.message}</li>)}
              </ul>
            </details>
          )}
          <div className="table-wrap import-preview">
            <table>
              <thead>
                <tr>
                  <th>SBD</th><th>Họ và tên</th><th>SĐT</th><th>Năm sinh</th><th>Lớp</th><th>Mục tiêu</th>
                  <th className="num">Đã đóng</th><th className="num">Còn nợ</th><th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {parsed.rows.slice(0, 200).map(r => (
                  <tr key={r.line}>
                    <td className="mono">{r.code}</td>
                    <td>{r.fullName}</td>
                    <td className="nowrap">{formatPhone(r.phone)}</td>
                    <td>{birthLabel(r)}</td>
                    <td className="nowrap">{r.className}</td>
                    <td>{r.goal}</td>
                    <td className="num">{r.paid ? formatMoney(r.paid) : ''}</td>
                    <td className="num">{r.owed ? formatMoney(r.owed) : ''}</td>
                    <td className="cell-clip small" title={r.note}>{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Hủy</button>
        <button type="button" className="btn btn-primary" disabled={busy || !parsed?.rows.length} onClick={run}>
          {busy ? 'Đang nhập…' : `Nhập ${parsed?.rows.length ?? 0} học viên`}
        </button>
      </div>
    </Modal>
  );
};
