import { useState } from 'react';
import ModalFull from '../Tables/PPIC/JadwalProduksi/ModalFull';
import { downloadExcel, getErrorMessage } from '../../utils/qcHelpers';

interface Props {
  rows: Record<string, any>[];
  filename: string;
  onClose: () => void;
}

const STEP = 20;

const ExportPreviewModal = ({ rows, filename, onClose }: Props) => {
  const [visibleRows, setVisibleRows] = useState(STEP);
  const headers = rows.length ? Object.keys(rows[0]) : [];

  const handleExport = () => {
    try {
      downloadExcel(rows, filename, 'Process MTC Details');
      onClose();
    } catch (error) {
      alert(getErrorMessage(error, 'Export gagal. Silakan coba lagi.'));
    }
  };

  return (
    <ModalFull isOpen onClose={onClose} judul="Export Preview">
      <div className="flex h-[85vh] flex-col">
        <div className="mb-4 flex justify-between px-2 pt-5">
          <div className="text-sm text-gray-500">Total Data: {rows.length}</div>
          <button
            type="button"
            onClick={handleExport}
            className="rounded bg-blue-500 px-4 py-1 text-white hover:bg-blue-600"
          >
            Export to Excel
          </button>
        </div>

        <div className="relative flex-1 overflow-auto">
          <table className="min-w-full border bg-white">
            <thead className="sticky top-0 z-10 bg-blue-50 shadow-sm">
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    className="whitespace-nowrap border-b px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-blue-700"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, visibleRows).map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  {headers.map((h) => (
                    <td key={h} className="border-b px-4 py-2 text-sm">
                      {row[h]?.toString() || '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-auto flex items-center justify-between border-t bg-gray-50 px-4 py-3">
          <div className="text-sm text-gray-600">
            Showing {Math.min(visibleRows, rows.length)} of {rows.length} rows
          </div>
          {visibleRows < rows.length && (
            <div className="space-x-3">
              <button
                type="button"
                className="rounded bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
                onClick={() =>
                  setVisibleRows((v) => Math.min(v + STEP, rows.length))
                }
              >
                Show 20 More
              </button>
              <button
                type="button"
                className="rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                onClick={() => setVisibleRows(rows.length)}
              >
                Show All ({rows.length} rows)
              </button>
            </div>
          )}
        </div>
      </div>
    </ModalFull>
  );
};

export default ExportPreviewModal;
