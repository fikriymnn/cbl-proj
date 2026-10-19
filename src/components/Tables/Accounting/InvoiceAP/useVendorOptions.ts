import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import type { VendorOption } from './types';
import type { SelectOption } from './SearchableSelect';
import { API } from './utils';

/**
 * Vendor list comes from the Master Vendor endpoint
 * (GET /master/marketing/vendor/list). It is fetched once and shared by every
 * Invoice AP screen.
 */
let cache: VendorOption[] | null = null;
let inflight: Promise<VendorOption[]> | null = null;

const loadVendors = async (): Promise<VendorOption[]> => {
  const res = await axios.get(`${API}/master/marketing/vendor/list`, {
    params: { page: 1, limit: 1000 },
    withCredentials: true,
  });
  const rows: any[] = Array.isArray(res.data?.data) ? res.data.data : [];
  return rows
    .filter((v) => v.is_active !== false)
    .map((v) => ({
      id: v.id as number,
      nama: (v.nama_vendor as string) || `Vendor #${v.id}`,
      alamat: (v.alamat as string) || '',
    }))
    .sort((a, b) => a.nama.localeCompare(b.nama));
};

export const useVendorOptions = () => {
  const [vendors, setVendors] = useState<VendorOption[]>(cache ?? []);
  const [loading, setLoading] = useState<boolean>(cache === null);

  useEffect(() => {
    if (cache) return;
    let alive = true;
    if (!inflight) inflight = loadVendors();
    inflight
      .then((list) => {
        cache = list;
        if (alive) setVendors(list);
      })
      .catch((error) => {
        inflight = null; // allow a retry on next mount
        console.error('Error fetching vendors:', error);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const options = useMemo<SelectOption[]>(
    () => vendors.map((v) => ({ value: String(v.id), label: v.nama })),
    [vendors],
  );

  return { vendors, options, loading };
};
