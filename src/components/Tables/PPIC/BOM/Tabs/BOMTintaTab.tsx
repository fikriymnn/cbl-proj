// components/BOM/tabs/BOMTintaTab.tsx
import React, { useState, useEffect } from 'react';
import { BOMTinta, TintaDetail } from '../Types/bom.types';
import TambahKomponenTintaModal from '../Modals/TambahKomponenTintaModal';
import TambahDetailTintaModal from '../Modals/TambahDetailTintaModal';

interface BOMTintaTabProps {
  data: BOMTinta[];
  onChange: (data: BOMTinta[]) => void;
  poQty?: number; // PO Quantity untuk perhitungan
}

const BOMTintaTab: React.FC<BOMTintaTabProps> = ({
  data,
  onChange,
  poQty = 10000,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingTintaIndex, setEditingTintaIndex] = useState<number | null>(
    null,
  );
  const [editingTintaForDetail, setEditingTintaForDetail] = useState<
    number | null
  >(null);

  const safeData = Array.isArray(data) ? data : [];

  // Hitung qty tinta otomatis berdasarkan formula
  const calculateQtyTinta = (tintaItem: BOMTinta): number => {
    // Formula: QTY = A x B x C x M x T
    // A = Luas area (dari mock atau data)
    // B = Jenis Bahan (dari master)
    // C = Warna tinta (dari master)
    // M = Jenis mesin cetak (dari konstanta)
    // T = Toleransi (dari konstanta berdasarkan qty)

    const A = poQty * (tintaItem.area_cetak / 100) * 0.5 * 0.75; // Mock data untuk ukuran

    // Toleransi berdasarkan jumlah
    let T = 1.05; // default
    if (poQty < 10000) T = 1.2;
    else if (poQty >= 10000 && poQty <= 50000) T = 1.1;
    else T = 1.05;

    // B, C, M akan didapat dari master data (default 1.0 jika tidak ada)
    const B = 1.0; // Jenis Kertas - Art Paper = 1.0
    const C = 1.0; // Warna - akan diambil dari master berdasarkan id_jenis_tinta
    const M = tintaItem.jenis_mesin_cetak === 'offset' ? 1.0 : 1.5;

    const qty = A * B * C * M * T;

    // Konversi ke KG (dua digit di belakang koma)
    return Math.round(qty) / 100; // Konversi gram ke kg
  };

  // Update qty otomatis setiap data berubah
  useEffect(() => {
    const updatedData = safeData.map((item) => ({
      ...item,
      qty_tinta: calculateQtyTinta(item),
    }));

    // Cek apakah ada perubahan sebelum update
    const hasChanges = updatedData.some(
      (item, idx) => item.qty_tinta !== safeData[idx]?.qty_tinta,
    );

    if (hasChanges) {
      onChange(updatedData);
    }
  }, [poQty, safeData.length]);

  const handleAdd = () => {
    setEditingTintaIndex(null);
    setIsModalOpen(true);
  };

  const handleEdit = (index: number) => {
    setEditingTintaIndex(index);
    setIsModalOpen(true);
  };

  const handleDelete = (index: number) => {
    onChange(safeData.filter((_, i) => i !== index));
  };

  const handleSaveFromModal = (newData: BOMTinta) => {
    if (editingTintaIndex !== null) {
      // Update existing
      const updated = safeData.map((item, i) =>
        i === editingTintaIndex
          ? {
              ...newData,
              tinta_detail: item.tinta_detail,
              qty_tinta: calculateQtyTinta(newData),
            }
          : item,
      );
      onChange(updated);
    } else {
      // Add new
      onChange([
        ...safeData,
        { ...newData, qty_tinta: calculateQtyTinta(newData) },
      ]);
    }
    setEditingTintaIndex(null);
  };

  const handleAddDetail = (tintaIndex: number) => {
    setEditingTintaForDetail(tintaIndex);
    setIsDetailModalOpen(true);
  };

  const handleSaveDetail = (newDetail: TintaDetail) => {
    if (editingTintaForDetail === null) return;

    const tintaItem = safeData[editingTintaForDetail];
    const currentDetails = tintaItem.tinta_detail || [];

    // Validasi total persentase tidak boleh > 100%
    const totalPersentase =
      currentDetails.reduce((sum, d) => sum + d.persentase_tinta, 0) +
      newDetail.persentase_tinta;

    if (totalPersentase > 100) {
      alert(
        `Total persentase tidak boleh melebihi 100%! Saat ini: ${totalPersentase}%`,
      );
      return;
    }

    const updated = safeData.map((item, i) =>
      i === editingTintaForDetail
        ? { ...item, tinta_detail: [...currentDetails, newDetail] }
        : item,
    );
    onChange(updated);
    setEditingTintaForDetail(null);
  };

  const handleDeleteDetail = (tintaIndex: number, detailIndex: number) => {
    const updated = safeData.map((item, i) =>
      i === tintaIndex
        ? {
            ...item,
            tinta_detail: (item.tinta_detail || []).filter(
              (_, j) => j !== detailIndex,
            ),
          }
        : item,
    );
    onChange(updated);
  };

  const getJenisWarnaTintaName = (id: number) => {
    const names: { [key: number]: string } = {
      1: 'Separasi',
      2: 'Warna Khusus',
    };
    return names[id] || id.toString();
  };

  // Hitung qty detail berdasarkan persentase
  const calculateDetailQty = (tintaQty: number, persentase: number): number => {
    return (tintaQty * persentase) / 100;
  };

  return (
    <div>
      <button
        onClick={handleAdd}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
      >
        <span>+</span>
        Tambah Data Tinta
      </button>

      <div className="space-y-4">
        {safeData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Belum ada data tinta
          </div>
        ) : (
          safeData.map((item, index) => {
            const totalPersentase = (item.tinta_detail || []).reduce(
              (sum, d) => sum + d.persentase_tinta,
              0,
            );

            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Main Tinta Row */}
                <div className="bg-gray-50 p-4">
                  <div className="grid grid-cols-12 gap-4 items-start">
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        No
                      </label>
                      <div className="text-sm font-semibold">{index + 1}</div>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nama Tinta
                      </label>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {getJenisWarnaTintaName(item.id_jenis_warna_tinta)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {item.warna_tinta}
                        </div>
                        {/* Color preview */}
                        <div
                          className="h-8 rounded border border-gray-300"
                          style={{ backgroundColor: item.warna_tinta }}
                        />
                      </div>
                    </div>

                    <div className="col-span-6">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Detail Tinta
                        {totalPersentase > 0 && (
                          <span
                            className={`ml-2 text-xs ${
                              totalPersentase === 100
                                ? 'text-green-600'
                                : totalPersentase > 100
                                ? 'text-red-600'
                                : 'text-orange-600'
                            }`}
                          >
                            (Total: {totalPersentase.toFixed(2)}%)
                          </span>
                        )}
                      </label>
                      <div className="bg-gray-100 rounded p-2 space-y-1">
                        <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-600">
                          <div>Tinta</div>
                          <div>Persentase</div>
                          <div>Qty (Kg)</div>
                        </div>
                        {!item.tinta_detail ||
                        item.tinta_detail.length === 0 ? (
                          <div className="text-xs text-gray-500 py-2">
                            Belum ada detail tinta
                          </div>
                        ) : (
                          item.tinta_detail.map((detail, detailIndex) => (
                            <div
                              key={detailIndex}
                              className="grid grid-cols-3 gap-2 text-xs items-center bg-white p-1 rounded"
                            >
                              <div className="truncate">
                                {detail.nama_item_tinta || '-'}
                              </div>
                              <div>{detail.persentase_tinta}%</div>
                              <div>
                                {calculateDetailQty(
                                  item.qty_tinta,
                                  detail.persentase_tinta,
                                ).toFixed(2)}{' '}
                                Kg
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Qty (Kg)
                      </label>
                      <div className="px-2 py-1 bg-gray-200 border border-gray-300 rounded text-sm text-gray-700">
                        {item.qty_tinta.toFixed(2)}
                      </div>
                    </div>

                    <div className="col-span-2 flex flex-col gap-2">
                      <button
                        onClick={() => handleAddDetail(index)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs"
                        disabled={totalPersentase >= 100}
                      >
                        + Tambah Detail
                      </button>
                      <button
                        onClick={() => handleEdit(index)}
                        className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors text-xs"
                      >
                        ✎ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                      >
                        🗑 Hapus
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detail Table - Expandable */}
                {item.tinta_detail && item.tinta_detail.length > 0 && (
                  <div className="p-4 bg-white border-t">
                    <h3 className="text-sm font-semibold mb-3">
                      Detail Komponen Tinta
                    </h3>
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                            No
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                            Nama Tinta
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                            Persentase (%)
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                            Qty (Kg)
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.tinta_detail.map((detail, detailIndex) => (
                          <tr key={detailIndex} className="border-b">
                            <td className="px-3 py-2">{detailIndex + 1}</td>
                            <td className="px-3 py-2">
                              {detail.nama_item_tinta}
                            </td>
                            <td className="px-3 py-2">
                              {detail.persentase_tinta}%
                            </td>
                            <td className="px-3 py-2">
                              {calculateDetailQty(
                                item.qty_tinta,
                                detail.persentase_tinta,
                              ).toFixed(2)}{' '}
                              Kg
                            </td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() =>
                                  handleDeleteDetail(index, detailIndex)
                                }
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-gray-50 font-semibold">
                          <td colSpan={2} className="px-3 py-2 text-right">
                            Total:
                          </td>
                          <td className="px-3 py-2">
                            {totalPersentase.toFixed(2)}%
                          </td>
                          <td className="px-3 py-2">
                            {item.qty_tinta.toFixed(2)} Kg
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <TambahKomponenTintaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTintaIndex(null);
        }}
        onSave={handleSaveFromModal}
        editData={
          editingTintaIndex !== null ? safeData[editingTintaIndex] : undefined
        }
      />

      <TambahDetailTintaModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setEditingTintaForDetail(null);
        }}
        onSave={handleSaveDetail}
        currentPersentase={
          editingTintaForDetail !== null
            ? (safeData[editingTintaForDetail]?.tinta_detail || []).reduce(
                (sum, d) => sum + d.persentase_tinta,
                0,
              )
            : 0
        }
      />
    </div>
  );
};

export default BOMTintaTab;
