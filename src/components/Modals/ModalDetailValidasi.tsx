import React from 'react';

const ModalDetailValidasi = ({
  children,
  isOpen,
  onClose,
  nama_kendala,
  nama_mesin,
  operator,
  note, status
 
}: {
  children: any;
  isOpen: any;
  onClose: any;
  nama_kendala:any,
  nama_mesin:any,
  operator:any,
  note:any,
  status:any
  
}) => {
  if (isOpen == null) return null;

  return (
    <div className="absolute z-50 rounded-md  bg-white shadow-2xl md:w-96 w-11/12 p-2  md:translate-y-10 translate-y-7 right-5  border border-gray">
      <div className="flex justify-end gap-5 px-4 py-2 z-50">
        <label className="mx-auto text-center text-blue-700 text-[28px] font-semibold">
         Detail 
        </label>

        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 focus:outline-none justify-end"
        >
          <svg
            width="22"
            height="22"
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
      <div className="mt-5 gap-y-2 flex flex-col justify-center px-2">
        <div>
          <p className="md:text-sm text-xs font-semibold">Operator</p>
          <p className="md:text-base text-xs">{operator}</p>
        </div>
        <div>
          <p className="md:text-sm text-xs font-semibold">Nama Mesin</p>
          <p className="md:text-base text-xs">{nama_mesin}</p>
        </div>
        <div>
          <p className="md:text-sm text-xs font-semibold">Nama Kendala</p>
          <p className="md:text-base text-xs">{nama_kendala}</p>
        </div>
        <div>
          <p className="md:text-sm text-xs font-semibold">Note Qc</p>
          <p className="md:text-base text-xs">{note}</p>
        </div>
        <div>
          <p className="md:text-sm text-xs font-semibold">Status Qc</p>
          <p className="md:text-base text-xs">{status}</p>
        </div>
        {/* <div>
          <p className="md:text-sm text-xs font-semibold">Kode Part</p>
          <p className="md:text-base text-xs">kode_part</p>
        </div>

        <div>
          <p className="md:text-sm text-xs font-semibold">Nama Barang</p>
          <p className="md:text-base text-xs">nama_barang</p>
        </div>
        <div>
          <p className="md:text-sm text-xs font-semibold">Mesin</p>
          <p className="md:text-base text-xs">mesin</p>
        </div>

        <div>
          <p className="md:text-sm text-xs font-semibold">Qty</p>
          <p className="md:text-base text-xs">qty</p>
        </div>
        <div>
          <p className="md:text-sm text-xs font-semibold">Tanggal Estimasi</p>
          <p className="md:text-base text-xs">tanggal_estimasi</p>
        </div>
        <div>
          <p className="md:text-sm text-xs font-semibold">Catatan</p>
          <p className="md:text-base text-xs">catatan</p>
        </div> */}
        {children}
      </div>
    </div>
  );
};

export default ModalDetailValidasi;
