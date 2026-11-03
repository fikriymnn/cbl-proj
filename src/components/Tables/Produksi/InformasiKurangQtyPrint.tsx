import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { fmtDate, fmtQty } from './InformasiKurangQtyShared';

// Preview + cetak form "INFORMASI KURANG QTY ORDER" ukuran A4 portrait.
// Dirender lewat portal ke <body>; saat print, semua elemen lain di body disembunyikan.

const PORTAL_ID = 'kurang-qty-print-portal';

const printCss = `
@media print {
  @page { size: A4 portrait; margin: 0; }
  html, body { background: #fff !important; margin: 0 !important; }
  body > *:not(#${PORTAL_ID}) { display: none !important; }
  #${PORTAL_ID} {
    position: static !important;
    display: block !important;
    overflow: visible !important;
    background: #fff !important;
    padding: 0 !important;
  }
  .kq-no-print { display: none !important; }
  .kq-sheet {
    box-shadow: none !important;
    margin: 0 !important;
    width: 210mm !important;
    height: 296mm !important;
    overflow: hidden;
    page-break-after: avoid;
    break-after: avoid;
  }
}
`;

const labelCls = 'font-semibold uppercase';

function Row({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start" style={{ marginBottom: '4.5mm' }}>
      <div className={labelCls} style={{ width: '46mm', flexShrink: 0 }}>
        {label}
      </div>
      <div className="flex-1 font-semibold uppercase" style={{ minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}

function CheckItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        style={{
          display: 'inline-block',
          width: '5.5mm',
          height: '5.5mm',
          border: '1.2px solid #000',
        }}
      />
      <span className="uppercase">{label}</span>
    </div>
  );
}

const cell: React.CSSProperties = {
  border: '1px solid #000',
  padding: '1.5mm 2mm',
};

export default function InformasiKurangQtyPrint({
  item,
  onClose,
}: {
  item: any;
  onClose: () => void;
}) {
  // kunci scroll halaman selama preview terbuka
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const signers = ['ADM PRODUKSI', 'OPR', 'SPV', 'KEPALA PRODUKSI', 'QC'];
  const known = ['Marketing', 'Produksi', 'PPIC', 'MR', 'QA'];

  return createPortal(
    <div
      id={PORTAL_ID}
      className="fixed inset-0 z-[80] overflow-auto bg-black bg-opacity-75"
    >
      <style>{printCss}</style>

      {/* toolbar (tidak ikut tercetak) */}
      <div className="kq-no-print sticky top-0 z-10 flex items-center justify-between gap-3 bg-gray-900 px-4 py-3 text-white">
        <span className="text-sm font-semibold">
          Preview Cetak · {item.no_jo}
        </span>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-semibold hover:bg-gray-500"
          >
            Tutup
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold hover:bg-violet-700"
          >
            Cetak
          </button>
        </div>
      </div>

      {/* lembar A4 */}
      <div
        className="kq-sheet mx-auto my-4 bg-white text-black shadow-2xl"
        style={{
          width: '210mm',
          height: '296mm',
          padding: '10mm 9mm',
          boxSizing: 'border-box',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: '10.5pt',
          lineHeight: 1.3,
        }}
      >
        <div
          style={{
            border: '1.5px solid #000',
            height: '100%',
            padding: '7mm 7mm 5mm',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h1
            className="text-center font-bold uppercase"
            style={{
              fontSize: '15pt',
              textDecoration: 'underline',
              marginBottom: '8mm',
            }}
          >
            Informasi Kurang Qty Order
          </h1>

          <Row label="Nama Produk">{item.nama_produk || '-'}</Row>
          <Row label="No JO">{item.no_jo || '-'}</Row>
          <Row label="Qty PO / Qty Order">{fmtQty(item.qty_po)}</Row>
          <Row label="Kekurangan Qty">{fmtQty(item.qty_kurang)}</Row>
          <Row label="Mesin Cetak">{item.nama_mesin_cetak || '-'}</Row>
          <Row label="Tanggal Cetak">{fmtDate(item.tgl_cetak)}</Row>
          <Row label="Jenis Kerusakan">{item.jenis_kerusakan || '-'}</Row>
          <Row label="Keterangan">
            <span className="normal-case font-normal">{item.note || ''}</span>
          </Row>

          {/* tempat dan bagian */}
          <div style={{ marginTop: '6mm', marginBottom: '6mm' }}>
            <div className="flex items-end" style={{ marginBottom: '2mm' }}>
              <span style={{ width: '20mm' }}>Bandung,</span>
              <span
                style={{
                  borderBottom: '1px dotted #000',
                  width: '50mm',
                  height: '5mm',
                }}
              />
            </div>
            <div className="flex items-end">
              <span style={{ width: '20mm' }}>Bagian</span>
              <span
                style={{
                  borderBottom: '1px dotted #000',
                  width: '50mm',
                  height: '5mm',
                }}
              />
            </div>
          </div>

          {/* tanda tangan */}
          <div className="grid grid-cols-5 gap-2 text-center">
            {signers.map((s) => (
              <div key={s}>
                <div
                  className="uppercase text-left"
                  style={{ fontSize: '9.5pt' }}
                >
                  {s}
                </div>
                <div style={{ height: '20mm' }} />
                <div className="text-left" style={{ fontSize: '9.5pt' }}>
                  (
                  <span style={{ display: 'inline-block', width: '70%' }} />)
                </div>
              </div>
            ))}
          </div>

          {/* keputusan */}
          <div style={{ marginTop: '5mm' }}>
            <div style={{ marginBottom: '1.5mm' }} className="uppercase">
              Keputusan :
            </div>
            <div
              className="flex items-center justify-between"
              style={{
                borderTop: '1px solid #000',
                borderBottom: '1px solid #000',
                padding: '2.5mm 2mm',
              }}
            >
              {['Diluluskan', 'Ditolak', 'Sortir', 'Cupk', 'Close'].map((k) => (
                <CheckItem key={k} label={k} />
              ))}
            </div>
          </div>

          {/* tabel pengesahan */}
          <div
            className="flex"
            style={{ marginTop: '4mm', alignItems: 'stretch' }}
          >
            <div
              style={{
                width: '42%',
                border: '1px solid #000',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                className="text-center"
                style={{ ...cell, border: 0, borderBottom: '1px solid #000' }}
              >
                Dibuat Oleh
              </div>
              <div style={{ flex: 1 }} />
              <div
                className="text-center"
                style={{ ...cell, border: 0, borderTop: '1px solid #000' }}
              >
                Div. QC
              </div>
            </div>
            <table
              style={{
                width: '58%',
                borderCollapse: 'collapse',
                borderLeft: 0,
              }}
            >
              <thead>
                <tr>
                  <th style={{ ...cell, fontWeight: 400 }}>Diketahui oleh</th>
                  <th style={{ ...cell, fontWeight: 400, width: '28%' }}>
                    Tanda tangan
                  </th>
                  <th style={{ ...cell, fontWeight: 400, width: '22%' }}>
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody>
                {known.map((k) => (
                  <tr key={k}>
                    <td style={{ ...cell, height: '10mm' }}>{k}</td>
                    <td style={cell} />
                    <td style={cell} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* verifikasi */}
          <div
            className="flex justify-between"
            style={{ marginTop: 'auto', paddingTop: '4mm' }}
          >
            <div className="flex" style={{ width: '58%' }}>
              <span style={{ width: '22mm' }}>Verifikasi :</span>
              <div className="flex-1">
                {[0, 1, 2, 3].map((n) => (
                  <div
                    key={n}
                    style={{ borderBottom: '1px solid #000', height: '8mm' }}
                  />
                ))}
              </div>
            </div>
            <div
              style={{
                width: '34%',
                border: '1px solid #000',
                padding: '1.5mm 2mm',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '24mm',
              }}
            >
              <span>Tanggal : ...................</span>
              <span className="text-center">QA</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
