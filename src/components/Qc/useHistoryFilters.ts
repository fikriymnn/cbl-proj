import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  EMPTY_FILTERS,
  HistoryFilters,
  getErrorMessage,
} from '../../utils/qcHelpers';

export const useMasterMesin = () => {
  const [machines, setMachines] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    axios
      .get(`${import.meta.env.VITE_API_LINK}/master/mesin`, {
        withCredentials: true,
      })
      .then((res) => {
        if (active) setMachines(Array.isArray(res.data) ? res.data : []);
      })
      .catch((error) => console.log(getErrorMessage(error)));
    return () => {
      active = false;
    };
  }, []);

  return machines;
};

/**
 * `filters` = isian form (draft), `applied` = filter yang benar-benar dipakai query.
 * Ganti halaman tidak akan memakai filter yang belum ditekan "Tampilkan".
 */
export const useHistoryFilters = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<HistoryFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<HistoryFilters>(EMPTY_FILTERS);
  const [filterError, setFilterError] = useState('');

  const updateFilters = (patch: Partial<HistoryFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const apply = () => {
    if (
      filters.startDate &&
      filters.endDate &&
      filters.startDate > filters.endDate
    ) {
      setFilterError('Tanggal "Dari" tidak boleh lebih besar dari "Sampai".');
      return;
    }
    setFilterError('');
    setApplied(filters);
    setPage(1);
  };

  const reset = () => {
    setFilterError('');
    setFilters(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  };

  return {
    page,
    setPage,
    filters,
    updateFilters,
    applied,
    apply,
    reset,
    filterError,
  };
};
