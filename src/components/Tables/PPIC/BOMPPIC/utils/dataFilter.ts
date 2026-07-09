import {
  BOMData,
  BOMPPICKertas,
  BOMPPICTinta,
  BOMPPICCorrugated,
  BOMPPICPoliban,
  BOMPPICCoating,
  BOMPPICLem,
} from '../Types/bompiic.types';

export interface LainLainItem {
  id?: number;
  nama_item: string;
  harga: number;
  qty_beli: number;
  qty_stok: number;
  is_active: boolean;
}

export const initializeCreateMode = (bomData: BOMData) => {
  const kertasData: BOMPPICKertas[] = (bomData.bom_kertas || [])
    .filter((kertas: any) => kertas.is_selected === true)
    .map((kertas: any) => ({
      id_kertas: kertas.id_kertas,
      id_jenis_kertas: kertas.id_jenis_kertas,
      nama_kertas: kertas.nama_kertas || '',
      qty_lembar_plano: parseFloat(kertas.qty_lembar_plano) || 0,
      qty_beli: 0,
      qty_stok: 0,
    }));

  const tintaData: BOMPPICTinta[] = (bomData.bom_tinta || []).map(
    (tinta: any) => ({
      warna_tinta: tinta.warna_tinta || '',
      id_jenis_tinta: tinta.id_jenis_tinta,
      id_jenis_kertas: tinta.id_jenis_kertas || 0,
      id_jenis_warna_tinta: tinta.id_jenis_warna_tinta || 0,
      jenis_mesin_cetak: tinta.jenis_mesin_cetak || '',
      area_cetak: tinta.area_cetak || 0,
      qty_tinta: tinta.qty_tinta || 0,
      tinta_detail: (tinta.tinta_detail || []).map((detail: any) => ({
        id_item_tinta: detail.id_item_tinta,
        nama_item_tinta: detail.nama_item_tinta,
        persentase_tinta: detail.persentase_tinta || 0,
        qty_tinta: detail.qty_tinta_detail || detail.qty_tinta || 0,
        qty_beli: 0,
        qty_stok: 0,
      })),
    }),
  );

  const corrugatedData: BOMPPICCorrugated[] = (bomData.bom_corrugated || [])
    .filter((corrugated: any) => corrugated.is_selected === true)
    .map((corrugated: any) => ({
      id_corrugated: corrugated.id_corrugated,
      nama_corrugated: corrugated.nama_corrugated || '',
      isi_per_pack: corrugated.isi_per_pack || 0,
      qty_corrugated: corrugated.qty_corrugated || 0,
      qty_beli: 0,
      qty_stok: 0,
    }));

  const polibanData: BOMPPICPoliban[] = (bomData.bom_poliban || [])
    .filter((poliban: any) => poliban.is_selected === true)
    .map((poliban: any) => ({
      id_poliban: poliban.id_poliban,
      item_poliban: poliban.item_poliban || '',
      isi_satu_ikat: poliban.isi_satu_ikat || 0,
      lembar_poliban: poliban.lembar_poliban || 0,
      qty_poliban: poliban.qty_poliban || 0,
      qty_beli: 0,
      qty_stok: 0,
    }));

  // Coating: raw bom_coating can contain MULTIPLE rows sharing the same
  // id_coating (e.g. one "depan" row + one "belakang" row for the same
  // physical coating material). The user never needs to see that split —
  // group them right here, at data-init time, into a single line per
  // id_coating. qty_coating is summed across the group; nama_coating /
  // uv_wb / varnish_doff are taken from the first record in the group.
  const coatingGroups = new Map<number, any[]>();
  (bomData.bom_coating || [])
    .filter((coating: any) => coating.is_selected === true)
    .forEach((coating: any) => {
      const group = coatingGroups.get(coating.id_coating) || [];
      group.push(coating);
      coatingGroups.set(coating.id_coating, group);
    });

  const coatingData: BOMPPICCoating[] = Array.from(coatingGroups.values()).map(
    (group) => {
      const first = group[0];
      const totalQtyCoating = group.reduce(
        (sum, c) => sum + (c.qty_coating || 0),
        0,
      );
      return {
        id_coating: first.id_coating,
        nama_coating: first.nama_coating || '',
        qty_coating: totalQtyCoating,
        uv_wb: first.uv_wb || 0,
        varnish_doff: first.varnish_doff || 0,
        qty_beli: 0,
        qty_stok: 0,
      };
    },
  );

  const lemData: BOMPPICLem[] = (bomData.bom_lem || [])
    .filter((lem: any) => lem.is_selected === true)
    .map((lem: any) => ({
      id_lem: lem.id_lem,
      nama_lem: lem.nama_lem || '',
      rumus_lem: lem.rumus_lem || '',
      qty_konstanta: lem.qty_konstanta || 0,
      qty_lem: lem.qty_lem || 0,
      qty_beli: 0,
      qty_stok: 0,
    }));

  const lainLainData: LainLainItem[] = (bomData.lain_lain || []).map(
    (item: any) => ({
      id: item.id,
      nama_item: item.nama_item || '',
      harga: item.harga || 0,
      qty_beli: item.qty_beli || 0,
      qty_stok: item.qty_stok || 0,
      is_active: item.is_active !== false,
    }),
  );

  return {
    kertasItems: kertasData,
    tintaItems: tintaData,
    corrugatedItems: corrugatedData,
    polibanItems: polibanData,
    coatingItems: coatingData,
    lemItems: lemData,
    lainLainItems: lainLainData,
  };
};
