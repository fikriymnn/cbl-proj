import { KalkulasiItem } from '../types';

interface ProductInfoSectionProps {
  selectedKalkulasi: KalkulasiItem | null;
}

const ProductInfoSection: React.FC<ProductInfoSectionProps> = ({
  selectedKalkulasi,
}) => {
  if (!selectedKalkulasi) return null;

  // Function to determine coating display format
  const getCoatingDisplay = () => {
    const hasDepan =
      selectedKalkulasi.nama_coating_depan &&
      selectedKalkulasi.nama_coating_depan.trim() !== '';
    const hasBelakang =
      selectedKalkulasi.nama_coating_belakang &&
      selectedKalkulasi.nama_coating_belakang.trim() !== '';

    if (hasDepan && hasBelakang) {
      return '1/1';
    } else if (hasDepan && !hasBelakang) {
      return '1/0';
    } else if (!hasDepan && hasBelakang) {
      return '0/1';
    } else {
      return '0/0';
    }
  };

  return (
    <div className="mt-6 border border-gray-300 rounded-md">
      <table className="w-full">
        <tbody>
          <tr className="border-b border-gray-300">
            <td className="w-8 p-3 text-center border-r border-gray-300">1.</td>
            <td className="p-3 border-r border-gray-300">Nama Pelanggan</td>
            <td className="w-8 p-3 text-center border-r border-gray-300">:</td>
            <td className="p-3 border-r border-gray-300">
              {selectedKalkulasi.nama_customer}
            </td>
          </tr>

          <tr className="border-b border-gray-300">
            <td className="p-3 text-center border-r border-gray-300">2.</td>
            <td className="p-3 border-r border-gray-300">
              Nama Produk (No Kode)
            </td>
            <td className="p-3 text-center border-r border-gray-300">:</td>
            <td className="p-3 border-r border-gray-300">
              {selectedKalkulasi.nama_produk}
            </td>
          </tr>

          <tr className="border-b border-gray-300">
            <td className="p-3 text-center border-r border-gray-300">3.</td>
            <td className="p-3 border-r border-gray-300">Ukuran (p x l x t)</td>
            <td className="w-8 p-3 text-center border-r border-gray-300 bg-blue-50">
              <span className="text-blue-600 font-medium">a</span>
            </td>
            <td className="p-3 border-r border-gray-300">
              {selectedKalkulasi.ukuran_jadi_panjang} x{' '}
              {selectedKalkulasi.ukuran_jadi_lebar} x{' '}
              {selectedKalkulasi.ukuran_jadi_tinggi} mm
            </td>

            <td className="w-8 p-3 text-center border-r border-gray-300"></td>
            <td className="p-3 border-r border-gray-300">Coating</td>
            <td className="w-8 p-3 text-center border-r border-gray-300">:</td>
            <td className="p-3">{getCoatingDisplay()}</td>
          </tr>

          <tr className="border-b border-gray-300">
            <td className="p-3 text-center border-r border-gray-300">4.</td>
            <td className="p-3 border-r border-gray-300">Warna</td>
            <td className="w-8 p-3 text-center border-r border-gray-300 bg-blue-50">
              <span className="text-blue-600 font-medium">a</span>
            </td>
            <td className="p-3 border-r border-gray-300">
              {selectedKalkulasi.warna_depan} +{' '}
              {selectedKalkulasi.warna_belakang}
            </td>
            <td className="p-3 text-center border-r border-gray-300"></td>
            <td className="p-3 border-r border-gray-300">Coating Depan</td>
            <td className="p-3 text-center border-r border-gray-300">:</td>
            <td className="p-3">
              {selectedKalkulasi.nama_coating_depan || '-'}
            </td>
          </tr>

          <tr>
            <td className="p-3 text-center border-r border-gray-300">5.</td>
            <td className="p-3 border-r border-gray-300">Bahan</td>
            <td className="w-8 p-3 text-center border-r border-gray-300 bg-blue-50">
              <span className="text-blue-600 font-medium">a</span>
            </td>
            <td className="p-3 border-r border-gray-300">
              {selectedKalkulasi.nama_kertas}
              <br />
              {selectedKalkulasi.gramature_kertas} gsm
            </td>
            <td className="p-3 text-center border-r border-gray-300"></td>
            <td className="p-3 border-r border-gray-300">Coating Belakang</td>
            <td className="p-3 text-center border-r border-gray-300">:</td>
            <td className="p-3">
              {selectedKalkulasi.nama_coating_belakang || '-'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ProductInfoSection;
