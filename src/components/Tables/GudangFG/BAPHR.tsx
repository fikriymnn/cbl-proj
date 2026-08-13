// BAPHR.tsx
// HR view: plain list (no harga anywhere — HR has no business seeing item
// values), with a single action: attach/update the before/after files via
// PUT /fg/bap/updateFile/:id.
//
// Files are uploaded to POST /images (multipart/form-data, field name
// "file") which returns the stored filename. That filename is what gets
// sent to the BAP update endpoint. Accepts images and videos.

import React, { useCallback, useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import Loading from '../../Loading';
import { Pagination, Stack } from '@mui/material';
import { BapListItem, BapListResponse } from './types/BapTypes';
import { bapStatusBadgeClass, fmtDateTime } from './bapHelpers';

// ─── helpers ────────────────────────────────────────────────────────────────

function isVideoFile(nameOrType: string): boolean {
  return /video|\.(mp4|webm|mov|mkv|avi)$/i.test(nameOrType);
}

function fileUrl(name: string): string {
  return `${import.meta.env.VITE_API_LINK}/images/${name}`;
}

// ─── File Slot (one before/after picker + preview) ─────────────────────────

function FileSlot({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (newFileName: string) => void;
  disabled: boolean;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  function handleSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      setError('Pilih file gambar atau video');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('Ukuran file maksimal 25MB');
      return;
    }

    setError('');
    setSelectedFile(file);
    setLocalPreview(URL.createObjectURL(file));
  }

  function clearSelection() {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setSelectedFile(null);
    setLocalPreview('');
    setError('');
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await axios.post(
        `${import.meta.env.VITE_API_LINK}/images`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      const fileName = res.data.fileName || res.data.filename || res.data.file;
      onChange(fileName);
      clearSelection();
    } catch (err) {
      console.error(err);
      setError('Gagal mengunggah file');
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveExisting() {
    if (!value) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_LINK}/images/${value}`, {
        withCredentials: true,
      });
    } catch (err) {
      console.error(err);
      // still clear locally even if delete on server fails
    } finally {
      onChange('');
    }
  }

  return (
    <div>
      <label className="text-xs font-semibold text-gray-600">{label}</label>

      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleSelect}
        disabled={disabled || uploading}
        className="mt-1 w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-50 file:text-cyan-700 file:text-xs file:font-semibold hover:file:bg-cyan-100 disabled:opacity-50"
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* New selection preview + confirm upload */}
      {localPreview && (
        <div className="mt-2 border border-blue-200 bg-blue-50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-600">
              Preview baru
            </span>
            <button
              type="button"
              onClick={clearSelection}
              className="text-red-500 hover:text-red-700 text-xs font-semibold"
            >
              Batal
            </button>
          </div>

          {selectedFile && isVideoFile(selectedFile.type) ? (
            <video
              src={localPreview}
              controls
              className="max-w-full h-40 rounded border border-gray-200"
            />
          ) : (
            <img
              src={localPreview}
              alt="Preview"
              className="max-w-full h-40 object-contain rounded border border-gray-200"
            />
          )}

          {selectedFile && (
            <p className="text-xs text-gray-500 mt-1">
              {selectedFile.name} (
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="mt-2 w-full px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            {uploading ? 'Mengunggah...' : 'Unggah & Gunakan File Ini'}
          </button>
        </div>
      )}

      {/* Existing file preview (only when no new selection pending) */}
      {value && !localPreview && (
        <div className="mt-2 border border-gray-200 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-600">
              File saat ini
            </span>
            <button
              type="button"
              onClick={handleRemoveExisting}
              disabled={disabled}
              className="text-red-500 hover:text-red-700 text-xs font-semibold disabled:opacity-50"
            >
              Hapus
            </button>
          </div>

          {isVideoFile(value) ? (
            <video
              src={fileUrl(value)}
              controls
              className="max-w-full h-40 rounded border border-gray-200"
            />
          ) : (
            <img
              src={fileUrl(value)}
              alt={label}
              className="max-w-full h-40 object-contain rounded border border-gray-200"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <p className="text-xs text-gray-500 mt-1 break-all">{value}</p>
        </div>
      )}

      {!value && !localPreview && (
        <p className="text-xs text-gray-400 mt-1">Belum ada file</p>
      )}
    </div>
  );
}

// ─── Update File Modal ──────────────────────────────────────────────────────

function UpdateFileModal({
  bap,
  onClose,
  onSaved,
}: {
  bap: BapListItem;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [fileBefore, setFileBefore] = useState(bap.file_before ?? '');
  const [fileAfter, setFileAfter] = useState(bap.file_after ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    try {
      setSaving(true);
      await axios.put(
        `${import.meta.env.VITE_API_LINK}/fg/bap/updateFile/${bap.id}`,
        { file_before: fileBefore, file_after: fileAfter },
        { withCredentials: true },
      );
      onSaved();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      const error = err as { response?: { data?: { msg?: string } } };
      alert(error?.response?.data?.msg ?? 'Gagal menyimpan file BAP');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-4 text-white rounded-t-2xl flex justify-between items-start flex-shrink-0">
          <div>
            <h3 className="text-base font-bold">{bap.no_bap}</h3>
            <p className="text-cyan-100 text-xs mt-0.5">
              Update file sebelum / sesudah
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-cyan-100 text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <FileSlot
            label="File Sebelum (Before)"
            value={fileBefore}
            onChange={setFileBefore}
            disabled={saving}
          />
          <FileSlot
            label="File Sesudah (After)"
            value={fileAfter}
            onChange={setFileAfter}
            disabled={saving}
          />
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex gap-3 justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg text-sm transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

const BAPHR: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<BapListItem[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [editing, setEditing] = useState<BapListItem | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res: AxiosResponse<BapListResponse> = await axios.get(
        `${import.meta.env.VITE_API_LINK}/fg/bap`,
        { params: { page, limit }, withCredentials: true },
      );
      setData(Array.isArray(res.data?.data) ? res.data.data : []);
      setTotalPages(res.data?.total_page ?? 1);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleLimitChange(newLimit: number) {
    setLimit(newLimit);
    setPage(1);
  }

  return (
    <main>
      {isLoading && <Loading />}

      {editing && (
        <UpdateFileModal
          bap={editing}
          onClose={() => setEditing(null)}
          onSaved={fetchData}
        />
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-4">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 sm:p-4">
          <h2 className="text-white text-base sm:text-lg md:text-xl font-bold">
            BAP — HR
          </h2>
          <p className="text-cyan-100 text-xs mt-1">
            Daftar BAP dan lampiran file sebelum / sesudah.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 sm:p-4 flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-white text-base sm:text-lg font-bold">
            Daftar BAP
          </h3>
          <span className="text-sm text-white bg-white bg-opacity-20 px-3 py-0.5 rounded-full font-semibold">
            {data.length} Record
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm min-w-[760px]">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {[
                  'No',
                  'No BAP',
                  'Tanggal Dibuat',
                  'Status',
                  'File Before',
                  'File After',
                  'Aksi',
                ].map((h) => (
                  <th
                    key={h}
                    className="p-2 sm:p-3 text-left text-xs font-semibold text-gray-600 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-gray-500 text-sm"
                  >
                    Tidak ada data BAP
                  </td>
                </tr>
              ) : (
                data.map((bap, idx) => (
                  <tr
                    key={bap.id}
                    className="border-b hover:bg-blue-50 transition-colors"
                  >
                    <td className="p-2 sm:p-3 text-xs text-gray-400">
                      {(page - 1) * limit + idx + 1}
                    </td>
                    <td className="p-2 sm:p-3 text-xs font-bold text-cyan-700 whitespace-nowrap">
                      {bap.no_bap}
                    </td>
                    <td className="p-2 sm:p-3 text-xs whitespace-nowrap">
                      {fmtDateTime(bap.tgl_create)}
                    </td>
                    <td className="p-2 sm:p-3 text-xs">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${bapStatusBadgeClass(
                          bap.status,
                        )}`}
                      >
                        {bap.status || '-'}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-gray-600">
                      {bap.file_before ? (
                        <a
                          href={fileUrl(bap.file_before)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-700 underline"
                        >
                          Lihat
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-2 sm:p-3 text-xs text-gray-600">
                      {bap.file_after ? (
                        <a
                          href={fileUrl(bap.file_after)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-700 underline"
                        >
                          Lihat
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-2 sm:p-3 text-xs">
                      <button
                        onClick={() => setEditing(bap)}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                      >
                        Update File
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mt-4 pb-4 px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Rows per page:</span>
          <div className="flex gap-2">
            {[10, 25, 50, 100].map((pageSize) => (
              <button
                key={pageSize}
                onClick={() => handleLimitChange(pageSize)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  limit === pageSize
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pageSize}
              </button>
            ))}
          </div>
        </div>
        <Stack spacing={2}>
          <Pagination
            count={totalPages}
            color="primary"
            page={page}
            onChange={(_e, i) => setPage(i)}
            size="small"
          />
        </Stack>
      </div>
    </main>
  );
};

export default BAPHR;
