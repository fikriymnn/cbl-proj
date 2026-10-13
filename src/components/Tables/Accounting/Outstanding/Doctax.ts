export type DocTaxType = 'tax' | 'non_tax';

/**
 * Tax     : SD00729/CBL/1026  (ada segmen dipisah "/")
 * Non tax : SD50001-1026      (PREFIX + angka, "-", angka)
 * Return null kalau format tidak dikenali.
 */
export const getDocTaxType = (noDo?: string | null): DocTaxType | null => {
  const v = (noDo || '').trim().toUpperCase();
  if (!v) return null;
  if (/^[A-Z]+\d+(\/[A-Z0-9]+)+$/.test(v)) return 'tax';
  if (/^[A-Z]+\d+-\d+$/.test(v)) return 'non_tax';
  return null;
};
