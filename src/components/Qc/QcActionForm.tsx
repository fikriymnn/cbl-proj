import { useState } from 'react';

export type QcAction = 'approve' | 'reject';

interface Props {
  approveLabel: string;
  rejectLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onSubmit: (action: QcAction, note: string) => void;
}

/**
 * Form catatan + tombol aksi dengan konfirmasi 2 langkah.
 * Note disimpan di dalam form, jadi otomatis kosong saat modal dibuka untuk tiket lain.
 */
const QcActionForm = ({
  approveLabel,
  rejectLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
}: Props) => {
  const [note, setNote] = useState('');
  const [pending, setPending] = useState<QcAction | null>(null);
  const [localError, setLocalError] = useState('');

  const requestAction = (action: QcAction) => {
    if (action === 'reject' && !note.trim()) {
      setLocalError('Catatan wajib diisi untuk menolak tiket.');
      return;
    }
    setLocalError('');
    setPending(action);
  };

  const confirm = () => {
    if (!pending) return;
    onSubmit(pending, note.trim());
    setPending(null);
  };

  const error = localError || errorMessage;
  const isReject = pending === 'reject';

  return (
    <div className="mt-4">
      <label
        htmlFor="note_qc"
        className="mb-1 block text-xs font-extrabold text-black"
      >
        CATATAN
      </label>
      <textarea
        id="note_qc"
        name="note_qc"
        value={note}
        disabled={isSubmitting}
        onChange={(e) => {
          setNote(e.target.value);
          setLocalError('');
        }}
        className="h-32 w-full rounded-sm border border-neutral-600 p-2 md:h-40"
        placeholder="Tulis catatan QC..."
      />

      {error && (
        <div
          role="alert"
          className="mt-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {error}
        </div>
      )}

      {pending ? (
        <div
          className={`mt-3 rounded-md border p-3 ${
            isReject ? 'border-red-300 bg-red-50' : 'border-blue-300 bg-blue-50'
          }`}
        >
          <p className="mb-3 text-xs font-semibold text-gray-800">
            Yakin ingin {isReject ? rejectLabel : approveLabel} tiket ini?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPending(null)}
              className="flex-1 rounded-md border border-gray-300 bg-white py-2 text-xs font-bold text-gray-700"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={confirm}
              className={`flex-1 rounded-md py-2 text-xs font-bold text-white ${
                isReject ? 'bg-red-600' : 'bg-blue-700'
              }`}
            >
              Ya, {isReject ? rejectLabel : approveLabel}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => requestAction('approve')}
            className="rounded-md bg-blue-700 px-5 py-3 text-xs font-bold text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Memproses...' : approveLabel}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => requestAction('reject')}
            className="rounded-md bg-red-600 px-5 py-3 text-xs font-bold text-white disabled:opacity-60"
          >
            {rejectLabel}
          </button>
        </div>
      )}
    </div>
  );
};

export default QcActionForm;
