import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { FaPlus, FaTrash } from 'react-icons/fa';
import {
  API,
  BTN_GHOST,
  BTN_PRIMARY,
  Field,
  FileUpload,
  INPUT,
  Modal,
  apiError,
  selectStyles,
  uploadImage,
  useDepartments,
  useMe,
} from './qmsShared';

interface Item {
  id?: number;
  text: string;
  file: string;
  newFile?: File | null; // lampiran baru, diupload saat simpan
}
interface DeptRow {
  key: string;
  id?: number;
  id_department: number | null;
  department: string;
  items: Item[];
}

const uid = () => Math.random().toString(36).slice(2);
const emptyItem = (): Item => ({ text: '', file: '' });
const emptyDept = (): DeptRow => ({
  key: uid(),
  id_department: null,
  department: '',
  items: [emptyItem()],
});
const KATEGORI_HINT = ['Man', 'Machine', 'Material', 'Method', 'Environment'];

interface Props {
  mode: 'create' | 'edit';
  initial?: any; // detail NCR (mode edit)
  onClose: () => void;
  onSaved: (msg: string) => void;
  notify: (text: string, type?: 'success' | 'error') => void;
}

export default function NCRFormModal({
  mode,
  initial,
  onClose,
  onSaved,
  notify,
}: Props) {
  const isEdit = mode === 'edit';
  const me = useMe();
  const deptOptions = useDepartments();

  const [joOptions, setJoOptions] = useState<any[]>([]);
  const [kategori, setKategori] = useState(initial?.kategori_laporan ?? '');
  const [noJo, setNoJo] = useState<string>(initial?.no_jo ?? '');
  const [noIo, setNoIo] = useState(initial?.no_io ?? '');
  const [produk, setProduk] = useState(initial?.nama_produk ?? '');
  const [namaPelapor, setNamaPelapor] = useState(initial?.nama_pelapor ?? '');
  const [deptPelapor, setDeptPelapor] = useState(
    initial?.department_pelapor ?? '',
  );
  const [deps, setDeps] = useState<DeptRow[]>(() =>
    isEdit
      ? (initial?.data_department ?? []).map((d: any) => ({
          key: uid(),
          id: d.id,
          id_department: d.id_department,
          department: d.department ?? '',
          items: (d.data_ketidaksesuaian ?? []).map((k: any) => ({
            id: k.id,
            text: k.ketidaksesuaian ?? '',
            file: k.file ?? '',
          })),
        }))
      : [emptyDept()],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // daftar JO realtime (sama seperti modul SPL)
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_LINK_P1}/api/list-jo-realtime`)
      .then((res) =>
        setJoOptions(
          (res.data?.data ?? []).map((j: any) => ({
            value: j.e_no_jo,
            label: j.e_no_jo,
          })),
        ),
      )
      .catch(console.error);
  }, []);

  // prefill pelapor dari /me (hanya create)
  useEffect(() => {
    if (isEdit || !me) return;
    setNamaPelapor((v: string) => v || me.name);
    setDeptPelapor((v: string) => v || me.departmentName);
  }, [me, isEdit]);

  const patchDept = (key: string, patch: Partial<DeptRow>) =>
    setDeps((p) => p.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  const patchItem = (key: string, idx: number, patch: Partial<Item>) =>
    setDeps((p) =>
      p.map((d) =>
        d.key === key
          ? {
              ...d,
              items: d.items.map((it, i) =>
                i === idx ? { ...it, ...patch } : it,
              ),
            }
          : d,
      ),
    );

  function validate(): string {
    if (!kategori.trim()) return 'Kategori laporan wajib diisi';
    if (!isEdit && !namaPelapor.trim()) return 'Nama pelapor wajib diisi';
    if (deps.length === 0) return 'Minimal satu department';
    for (const [i, d] of deps.entries()) {
      if (!d.id_department) return `Department ${i + 1} belum dipilih`;
      const filled = d.items.filter((it) => it.text.trim());
      if (filled.length === 0)
        return `Department ${
          d.department || i + 1
        }: isi minimal satu ketidaksesuaian`;
      if (isEdit && filled.length !== d.items.length)
        return `Department ${d.department}: ketidaksesuaian tidak boleh kosong`;
    }
    return '';
  }

  async function save() {
    const v = validate();
    setError(v);
    if (v) return;
    setSaving(true);
    try {
      if (isEdit) {
        // upload lampiran baru dulu → dapat nama file
        const uploaded = await Promise.all(
          deps.map((d) =>
            Promise.all(
              d.items.map((it) =>
                it.newFile ? uploadImage(it.newFile) : Promise.resolve(it.file),
              ),
            ),
          ),
        );
        await axios.put(
          `${API}/ncr/${initial.id}`,
          {
            kategori_laporan: kategori.trim(),
            no_jo: noJo || null,
            no_io: noIo || null,
            nama_produk: produk,
            // wajib dikirim; tidak boleh mengirim status
            data_department: deps.map((d, di) => ({
              id: d.id,
              id_department: d.id_department,
              department: d.department,
              data_ketidaksesuaian: d.items.map((it, ii) => ({
                id: it.id,
                ketidaksesuaian: it.text.trim(),
                file: uploaded[di][ii] || null,
              })),
            })),
          },
          { withCredentials: true },
        );
        onSaved('NCR berhasil diperbarui');
      } else {
        await axios.post(
          `${API}/ncr`,
          {
            kategori_laporan: kategori.trim(),
            id_pelapor: me?.id,
            nama_pelapor: namaPelapor.trim(),
            department_pelapor: deptPelapor,
            no_jo: noJo || null,
            no_io: noIo || null,
            nama_produk: produk,
            data_department: deps.map((d) => ({
              id_department: d.id_department,
              department: d.department,
              ketidaksesuaian: d.items
                .filter((it) => it.text.trim())
                .map((it) => ({ ketidaksesuaian: it.text.trim() })),
            })),
          },
          { withCredentials: true },
        );
        onSaved('NCR berhasil dibuat');
      }
    } catch (e) {
      notify(apiError(e), 'error');
    } finally {
      setSaving(false);
    }
  }

  const used = new Set(deps.map((d) => d.id_department));

  return (
    <Modal
      title={isEdit ? 'Edit NCR' : 'Buat NCR Manual'}
      subtitle={isEdit ? initial?.no_ncr : 'Tipe: manual'}
      onClose={onClose}
      footer={
        <>
          {error && (
            <p className="flex-1 self-center text-xs text-red-600 font-medium">
              {error}
            </p>
          )}
          <button className={BTN_GHOST} onClick={onClose} disabled={saving}>
            Batal
          </button>
          <button className={BTN_PRIMARY} onClick={save} disabled={saving}>
            {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Buat NCR'}
          </button>
        </>
      }
    >
      <section className="bg-gray-50 rounded-xl p-3 sm:p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Informasi Laporan
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Kategori Laporan" required>
            <input
              list="ncr-kategori"
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              placeholder="Mis. Material"
              className={INPUT}
            />
            <datalist id="ncr-kategori">
              {KATEGORI_HINT.map((k) => (
                <option key={k} value={k} />
              ))}
            </datalist>
          </Field>
          <Field label="Nama Produk">
            <input
              value={produk}
              onChange={(e) => setProduk(e.target.value)}
              className={INPUT}
            />
          </Field>
          <Field label="No JO">
            <Select
              isClearable
              options={joOptions}
              value={noJo ? { value: noJo, label: noJo } : null}
              onChange={(s: any) => setNoJo(s?.value ?? '')}
              placeholder="Pilih JO"
              styles={selectStyles}
              className="text-xs sm:text-sm"
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </Field>
          <Field label="No IO">
            <input
              value={noIo}
              onChange={(e) => setNoIo(e.target.value)}
              className={INPUT}
            />
          </Field>
          {!isEdit && (
            <>
              <Field label="Nama Pelapor" required>
                <input
                  value={namaPelapor}
                  onChange={(e) => setNamaPelapor(e.target.value)}
                  className={INPUT}
                />
              </Field>
              <Field label="Department Pelapor">
                <input
                  value={deptPelapor}
                  onChange={(e) => setDeptPelapor(e.target.value)}
                  className={INPUT}
                />
              </Field>
            </>
          )}
        </div>
        <p className="mt-2 text-[10px] text-gray-400">
          Nomor NCR, tanggal, dan status diisi otomatis. Jika JO / IO tidak
          ditemukan, tersimpan kosong.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700">
            Department & Ketidaksesuaian
          </h4>
          {!isEdit && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800"
              onClick={() => setDeps((p) => [...p, emptyDept()])}
            >
              <FaPlus /> Tambah Department
            </button>
          )}
        </div>
        <p className="text-[11px] text-gray-500 -mt-1">
          Setiap department akan menjadi satu tiket CAPA.
        </p>

        {deps.map((d, di) => (
          <div
            key={d.key}
            className="rounded-xl border border-violet-200 bg-white overflow-hidden"
          >
            <div className="bg-violet-50 px-3 py-2 flex items-center gap-2">
              <span className="text-xs font-bold text-violet-700 flex-shrink-0">
                Dept {di + 1}
              </span>
              <div className="flex-1 min-w-0">
                {isEdit ? (
                  <span className="text-sm font-semibold text-gray-800">
                    {d.department}
                  </span>
                ) : (
                  <Select
                    options={deptOptions.filter(
                      (o) => o.value === d.id_department || !used.has(o.value),
                    )}
                    value={
                      d.id_department
                        ? { value: d.id_department, label: d.department }
                        : null
                    }
                    onChange={(s: any) =>
                      patchDept(d.key, {
                        id_department: s?.value ?? null,
                        department: s?.label ?? '',
                      })
                    }
                    placeholder="Pilih department"
                    styles={selectStyles}
                    className="text-xs sm:text-sm"
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                )}
              </div>
              {!isEdit && deps.length > 1 && (
                <button
                  type="button"
                  aria-label="Hapus department"
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  onClick={() =>
                    setDeps((p) => p.filter((x) => x.key !== d.key))
                  }
                >
                  <FaTrash />
                </button>
              )}
            </div>

            <div className="p-3 space-y-3">
              {d.items.map((it, ii) => (
                <div key={ii} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="mt-2 text-xs font-semibold text-gray-400 w-4">
                      {ii + 1}.
                    </span>
                    <textarea
                      rows={2}
                      value={it.text}
                      onChange={(e) =>
                        patchItem(d.key, ii, { text: e.target.value })
                      }
                      placeholder="Uraian ketidaksesuaian"
                      className={`${INPUT} resize-y`}
                    />
                    {!isEdit && d.items.length > 1 && (
                      <button
                        type="button"
                        aria-label="Hapus poin"
                        className="mt-1 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        onClick={() =>
                          patchDept(d.key, {
                            items: d.items.filter((_, i) => i !== ii),
                          })
                        }
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                  {isEdit && (
                    <div className="pl-6">
                      <FileUpload
                        file={it.newFile ?? null}
                        existingName={it.file}
                        onChange={(f) => patchItem(d.key, ii, { newFile: f })}
                        onError={(m) => notify(m, 'error')}
                      />
                    </div>
                  )}
                </div>
              ))}
              {!isEdit && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800"
                  onClick={() =>
                    patchDept(d.key, { items: [...d.items, emptyItem()] })
                  }
                >
                  <FaPlus /> Tambah poin
                </button>
              )}
            </div>
          </div>
        ))}
        {isEdit && (
          <p className="text-[11px] text-gray-500">
            Pada mode edit, poin dan department tidak bisa ditambah atau
            dihapus.
          </p>
        )}
      </section>
    </Modal>
  );
}
