import axios from 'axios';

interface Params {
  search?: string;
  kategori?: string;
  subKategori?: string;
}

export interface SubstituteResult<T> {
  items: T[];
  notice: string; // kosong jika tidak ada fallback
}

/**
 * Ambil kandidat item pengganti dari /master/barang.
 *
 * 1) Request terpisah untuk `kategori` dan `sub_kategori`, hasilnya digabung
 *    (dedupe by id) -> item yang cocok di salah satu / keduanya tetap muncul.
 * 2) Kalau gabungan kosong, ambil semua item tanpa filter + kembalikan notice.
 */
export const fetchSubstituteCandidates = async <T extends { id: number }>({
  search,
  kategori,
  subKategori,
}: Params): Promise<SubstituteResult<T>> => {
  const url = `${import.meta.env.VITE_API_LINK}/master/barang`;
  const base = { page: 1, limit: 20, search: search || undefined };

  const request = async (extra: Record<string, string>): Promise<T[]> => {
    const res = await axios.get<{ data: T[] }>(url, {
      params: { ...base, ...extra },
      withCredentials: true,
    });
    return res.data.data || [];
  };

  const filters: Record<string, string>[] = [];
  if (kategori) filters.push({ kategori });
  if (subKategori) filters.push({ sub_kategori: subKategori });

  if (filters.length > 0) {
    const results = await Promise.all(filters.map(request));
    const merged = new Map<number, T>();
    results.flat().forEach((it) => {
      if (!merged.has(it.id)) merged.set(it.id, it);
    });
    if (merged.size > 0) {
      return { items: Array.from(merged.values()), notice: '' };
    }
  }

  // Tidak ada yang cocok -> tampilkan semua + beri tahu user
  const all = await request({});
  let notice = '';
  if (filters.length > 0) {
    const label = [
      kategori ? `kategori "${kategori}"` : '',
      subKategori ? `sub kategori "${subKategori}"` : '',
    ]
      .filter(Boolean)
      .join(' / ');
    notice = `Tidak ada item dengan ${label}${
      search ? ' untuk pencarian ini' : ''
    }. Menampilkan semua item.`;
  }
  return { items: all, notice };
};
