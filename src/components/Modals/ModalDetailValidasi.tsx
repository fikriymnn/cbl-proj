import React from 'react';
import convertTimeStampToDateTime from '../../utils/converDateTime';

const ModalDetailValidasi = ({
  children,
  isOpen,
  onClose,
  nama_kendala,
  nama_mesin,
  operator,
  note,
  status,
  unit,
  bagian,
  nojo,
  customer,
  masalah,
  validator,
  waktuMasuk,
  waktuSelesai,
  WaktuBreakdown,
  waktuBreakdownMTC,
  waktuVerifikasiQC,
  data,
}: {
  children: any;
  isOpen: any;
  onClose: any;
  nama_kendala: any;
  nama_mesin: any;
  operator: any;
  note: any;
  status: any;
  unit: any;
  bagian: any;
  nojo: any;
  customer: any;
  masalah: any;
  validator: any;
  waktuMasuk: any;
  waktuSelesai: any;
  WaktuBreakdown: any;
  waktuBreakdownMTC: any;
  waktuVerifikasiQC: any;
  data: any;
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />

      {/* Centered Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="rounded-lg bg-white shadow-2xl w-80 sm:w-96 p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-blue-700">
              Detail Validasi
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="11" cy="11" r="11" fill="#0065DE" />
                <rect
                  x="6.03955"
                  y="4.23242"
                  width="17"
                  height="3"
                  rx="1.5"
                  transform="rotate(42.8321 6.03955 4.23242)"
                  fill="white"
                />
                <rect
                  x="4.18213"
                  y="16.0609"
                  width="17"
                  height="3"
                  rx="1.5"
                  transform="rotate(-45 4.18213 16.0609)"
                  fill="white"
                />
              </svg>
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-3">
              <div className="border-b border-gray-100 pb-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  Operator
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {operator || '-'}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  Nama Mesin
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {nama_mesin || '-'}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  Nama Kendala
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {nama_kendala || '-'}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  Note QC
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {note || '-'}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  Waktu Tiket Dibuat
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {waktuMasuk || '-'}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  Waktu Selesai MTC
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {waktuSelesai || '-'}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  Status QC
                </p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    status === 'di validasi'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {status || '-'}
                </span>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  Unit
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {unit || '-'}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  Bagian
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {bagian || '-'}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  Validator/Verifikator
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {validator || '-'}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  No. JO
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {nojo || '-'}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  Customer
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {customer || '-'}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  Masalah Dari Kendala
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {masalah || '-'}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  Breakdown Time
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {WaktuBreakdown || '-'}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  Waktu Breakdown MTC
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {waktuBreakdownMTC || '-'}
                </p>
              </div>

              <div className="border-b border-gray-100 pb-2">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  Waktu Verifikasi QC
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {waktuVerifikasiQC || '-'}
                </p>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-semibold text-gray-700">
                  Jam Verifikasi QC
                </p>
                <p className="text-sm sm:text-base text-gray-900">
                  {data?.waktu_selesai
                    ? convertTimeStampToDateTime(data.waktu_selesai)
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {children}
        </div>
      </div>
    </>
  );
};

export default ModalDetailValidasi;
