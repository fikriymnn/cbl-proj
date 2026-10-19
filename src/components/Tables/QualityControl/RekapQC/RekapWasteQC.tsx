import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Loading from '../../../Loading';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import formatInteger from '../../../../utils/formaterInteger';
import convertTimeStampToDate from '../../../../utils/convertDate';
import {
  PROSES_LIST,
  PROSES_SECTIONS,
  cleanList,
  dash,
  exportKendalaAll,
  exportKendalaByJo,
  exportWasteAll,
  exportWasteByJo,
  formatTanggal,
  formatTemuan,
  getUniqueVerifikator,
} from './exportRekapWaste';

type Mode = 'waste' | 'kendala';
type TabKey = 'component1' | 'component2' | 'component3' | 'component4';
type DetailState = { mode: Mode; jo: any; defect: any } | null;
type ProsesState = { jo: any; proses: string } | null;

const TH = 'border border-gray-300 px-4 py-2 text-left';
const TH_C = 'border border-gray-300 px-4 py-2';
const TD = 'border border-gray-300 px-4 py-2';

const normalize = (v: any) => (v ? v.toString().toLowerCase() : '');

const filterJo = (list: any[] | undefined, query: string) => {
  if (!list) return [];
  if (!query) return list;
  const q = query.toLowerCase();
  return list.filter(
    (d: any) =>
      !d ||
      normalize(d.no_jo).includes(q) ||
      normalize(d.nama_produk).includes(q) ||
      normalize(d.no_io).includes(q) ||
      normalize(d.customer).includes(q),
  );
};

const sortDesc = (arr: any[] | undefined, field: string) =>
  [...(arr || [])].sort((a, b) => (b[field] ?? 0) - (a[field] ?? 0));

/* ------------------------------ Sub components ------------------------------ */

function ProsesDetailContent({ jo, proses }: { jo: any; proses: string }) {
  return (
    <div className="grid grid-cols-4 px-4 py-4">
      {PROSES_SECTIONS.map((section) => (
        <div key={section.key} className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-black">
            {section.label}
          </label>
          {jo.defectsByKategori?.[proses]?.data?.[section.key]?.map(
            (item: any, i: number) => (
              <React.Fragment key={i}>
                <label className="text-sm text-black">
                  Inspector : {item.inspektor}
                </label>
                {item.wastes?.map((w: any, ii: number) => (
                  <label key={ii} className="text-sm text-black">
                    {w.kode_waste} - {w.waste_desc} : {w.total_defect}
                  </label>
                ))}
              </React.Fragment>
            ),
          )}
        </div>
      ))}
    </div>
  );
}

function VerifikatorTable({ title, rows }: { title: string; rows: any[] }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {[
              'Kode MR',
              'Tanggal Tiket',
              'Teknisi MTC',
              'Verifikator QC',
              'Operator',
              'Kode',
              'Masalah',
            ].map((h) => (
              <th key={h} className={TH_C}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((v: any, i: number) => (
            <tr key={i} className="border-b border-gray-300">
              <td className={TD}>{dash(v.kode_mr)}</td>
              <td className={TD}>{formatTanggal(v.tanggal_tiket)}</td>
              <td className={TD}>{dash(v.inspektor_mtc)}</td>
              <td className={TD}>{dash(v.verifikator_qc)}</td>
              <td className={TD}>{dash(v.operator)}</td>
              <td className={TD}>{dash(v.kode_lkh)}</td>
              <td className={TD}>{dash(v.nama_kendala)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DetailContent({ mode, defect }: { mode: Mode; defect: any }) {
  const isWaste = mode === 'waste';
  const verifikator = getUniqueVerifikator(defect.verifikator_inspektor);
  const operators = cleanList(defect.operator_inspektor);

  const codeLabel = isWaste ? 'Kode LKH' : 'Kode Waste';
  const problemLabel = isWaste ? 'Masalah LKH' : 'Masalah Waste';
  const codeKey = isWaste ? 'kode_lkh' : 'kode_waste';
  const problemKey = isWaste ? 'masalah_lkh' : 'masalah';
  const refName = isWaste ? defect.kode_waste : defect.kendala_desc;

  const headers = [
    ...(isWaste ? ['No'] : []),
    'Inspektor',
    'Operator',
    'Mesin',
    codeLabel,
    problemLabel,
    'Temuan',
    'Defect',
  ];

  return (
    <>
      <p>
        <strong>{isWaste ? 'Kode Waste' : 'Kode Kendala'}:</strong>{' '}
        {isWaste ? defect.kode_waste : defect.kode_kendala}
      </p>
      <p>
        <strong>Deskripsi:</strong>{' '}
        {isWaste ? defect.waste_desc : defect.kendala_desc}
      </p>
      <p>
        <strong>Total Defect:</strong> {defect.total_defect}
      </p>

      {verifikator.length > 0 ? (
        <VerifikatorTable
          title={`Detail Teknisi QC / Verifikator QC Berdasarkan ${
            isWaste ? 'Kode Waste' : 'Kendala'
          }`}
          rows={verifikator}
        />
      ) : (
        <p className="mt-4 text-gray-500">
          Tidak ada data inspektor QC / Teknisi QC yang memiliki{' '}
          {isWaste ? 'waste' : 'Kendala'} {refName}
        </p>
      )}

      {operators.length > 0 ? (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">
            {isWaste ? 'Detail Kendala' : 'Detail Waste'}
          </h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                {headers.map((h) => (
                  <th key={h} className={TH_C}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {operators.map((op: any, index: number) => {
                const nested = cleanList(op.verifikator_inspektor);
                return (
                  <React.Fragment key={index}>
                    <tr className="border-b border-gray-300">
                      {isWaste && <td className={TD}>{index + 1}</td>}
                      <td className={TD}>{dash(op.inspektor)}</td>
                      <td className={TD}>{dash(op.operator)}</td>
                      <td className={TD}>{dash(op.mesin)}</td>
                      <td className={TD}>{dash(op[codeKey])}</td>
                      <td className={TD}>{dash(op[problemKey])}</td>
                      <td className={TD}>{formatTemuan(op.temuan)}</td>
                      <td className={TD}>{dash(op.calculated_defect)}</td>
                    </tr>
                    {(nested.length > 0 || isWaste) && (
                      <tr className="border-b border-gray-300 bg-gray-50">
                        <td
                          colSpan={headers.length}
                          className="border border-gray-300"
                        >
                          {nested.length > 0 ? (
                            <table className="w-full border-collapse border border-gray-200">
                              <thead>
                                <tr className="bg-gray-100">
                                  {[
                                    'Kode MR',
                                    'Tanggal Tiket',
                                    'Inspektor MTC',
                                    'Verifikator QC',
                                    'Kode',
                                    'Masalah',
                                  ].map((h) => (
                                    <th key={h} className={TH_C}>
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {nested.map((v: any, vi: number) => (
                                  <tr
                                    key={vi}
                                    className="border-b border-gray-300"
                                  >
                                    <td className={TD}>{dash(v.kode_mr)}</td>
                                    <td className={TD}>
                                      {formatTanggal(v.tanggal_tiket)}
                                    </td>
                                    <td className={TD}>
                                      {dash(v.inspektor_mtc)}
                                    </td>
                                    <td className={TD}>
                                      {dash(v.verifikator_qc)}
                                    </td>
                                    <td className={TD}>{dash(v.kode_lkh)}</td>
                                    <td className={TD}>
                                      {dash(v.nama_kendala)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <p className="p-3 text-gray-500">
                              Tidak ada data inspektor Qc / Teknisi QC yang
                              memiliki kendala {dash(op.kode_lkh)} -{' '}
                              {dash(op.masalah_lkh)}
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 text-gray-500">Tidak ada data inspektor</p>
      )}
    </>
  );
}

function MesinDetailContent({
  kendala,
  dataKendalaMesin,
}: {
  kendala: any;
  dataKendalaMesin: any[];
}) {
  const mesinList = sortDesc(dataKendalaMesin, 'total_calculated_defect');
  const joList = Array.isArray(kendala.jo) ? kendala.jo : [];

  return (
    <>
      <div className="flex pt-4 font-bold text-black text-md">
        Rekap Mesin :
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 mt-2">
          <thead className="bg-gray-100">
            <tr>
              <th className={TH}>Mesin</th>
              <th className={TH}>Total Defect</th>
            </tr>
          </thead>
          <tbody>
            {mesinList.length > 0 ? (
              mesinList.map((m: any, i: number) => (
                <tr key={i} className="border-b border-gray-300">
                  <td className={TD}>{m.mesin}</td>
                  <td className={TD}>{m.total_calculated_defect}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className={`${TD} text-center`} colSpan={2}>
                  Tidak Ada Data Mesin
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex pt-4 font-bold text-black text-md">
        Rekap Mesin Per JO :
      </div>
      {joList.length > 0 ? (
        <div className="mt-3">
          {joList.map((jo: any, index: number) => (
            <div key={index} className="mb-5">
              <h3 className="font-semibold text-md">
                {index + 1}. {jo.no_jo}
              </h3>
              {Array.isArray(jo.mesin) && jo.mesin.length > 0 && (
                <table className="w-full border-collapse border border-gray-300 mt-2">
                  <thead className="bg-gray-100">
                    <tr>
                      {[
                        'Mesin',
                        'Defect',
                        'Inspector',
                        'Operator',
                        'Temuan',
                      ].map((h) => (
                        <th key={h} className={TH}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortDesc(jo.mesin, 'total_calculated_defect').map(
                      (mesin: any, mi: number) => {
                        const ops = mesin.operator_inspektor;
                        if (!ops || ops.length === 0) {
                          return (
                            <tr key={mi} className="border border-gray-300">
                              <td className={TD}>{mesin.mesin}</td>
                              <td className={TD}>
                                {mesin.total_calculated_defect}
                              </td>
                              <td className={TD} colSpan={3}>
                                No Kendala
                              </td>
                            </tr>
                          );
                        }
                        return ops.map((op: any, oi: number) => (
                          <tr
                            key={`${mi}-${oi}`}
                            className="border border-gray-300"
                          >
                            {oi === 0 && (
                              <>
                                <td rowSpan={ops.length} className={TD}>
                                  {mesin.mesin}
                                </td>
                                <td rowSpan={ops.length} className={TD}>
                                  {mesin.total_calculated_defect}
                                </td>
                              </>
                            )}
                            <td className={TD}>{dash(op.inspektor)}</td>
                            <td className={TD}>{dash(op.operator)}</td>
                            <td className={TD}>{formatTemuan(op.temuan)}</td>
                          </tr>
                        ));
                      },
                    )}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No JO data available.</p>
      )}
    </>
  );
}

function TabHeader({
  title,
  dateFrom,
  dateTo,
  onExport,
  disabled,
  searchValue,
  onSearch,
}: {
  title: string;
  dateFrom: any;
  dateTo: any;
  onExport: () => void;
  disabled: boolean;
  searchValue?: string;
  onSearch?: (v: string) => void;
}) {
  return (
    <div className="flex bg-white py-2 px-2 flex-col gap-2">
      <label className="justify-center text-black flex w-full text-xl font-bold">
        {title}
      </label>
      <label className="text-xl text-blue-400 font-semibold">
        {dateFrom ? convertTimeStampToDate(dateFrom) : ''} ~{' '}
        {dateTo ? convertTimeStampToDate(dateTo) : ''}
      </label>
      <div className="flex items-center justify-between gap-2">
        {onSearch ? (
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className="border-2 border-stroke rounded-md w-[30%] px-2 py-1"
            placeholder="Cari Jo, IO, Customer, Produk"
          />
        ) : (
          <span />
        )}
        <button
          disabled={disabled}
          onClick={onExport}
          className="bg-green-600 text-white px-4 py-1 rounded-md font-semibold disabled:opacity-50"
        >
          Export Excel
        </button>
      </div>
    </div>
  );
}

function JoCard({
  data,
  index,
  mode,
  onOpenProses,
  onOpenDetail,
}: {
  data: any;
  index: number;
  mode: Mode;
  onOpenProses: (jo: any, proses: string) => void;
  onOpenDetail: (jo: any, defect: any) => void;
}) {
  const isWaste = mode === 'waste';

  const defects = sortDesc(
    (data.defects || []).filter((d: any) => isWaste || !!d.kode_kendala),
    'total_defect',
  );

  const keyLabel = (d: any) =>
    isWaste ? (
      `${d.kode_waste} - ${d.waste_desc}`
    ) : (
      <>
        <span className="font-semibold">{d.kategori_kendala}</span> -{' '}
        {d.kode_kendala || 'No Kode'} - {d.kendala_desc || 'No Description'}
      </>
    );

  const subLabel = (k: any) =>
    isWaste
      ? `${k.kategori_kendala} - ${k.kode_kendala} - ${k.kendala_desc}`
      : `${k.kode_waste} - ${k.waste_desc}`;

  const headers = isWaste
    ? ['Kode Waste', 'Total Defect', 'Kendala', 'Defect By Kendala']
    : ['Kode Kendala', 'Total Defect', 'Waste', 'Defect By Waste'];

  return (
    <div className="rounded-md max-w-screen gap-2 flex flex-col overflow-x-auto text-stone-400 bg-white border-2 border-black">
      <div className="grid grid-cols-12 items-center justify-center gap-3 border-b-2 border-stroke pt-2 px-[1%]">
        <label className="text-sm font-semibold text-black col-span-2">
          No JO
        </label>
        <label className="text-sm font-semibold text-black">No IO</label>
        <label className="text-sm font-semibold text-black col-span-2">
          Customer
        </label>
        <label className="text-sm font-semibold text-black col-span-3">
          Produk
        </label>
        <div className="flex justify-center text-sm font-semibold text-black col-span-3">
          DEFECT PERPROSES
        </div>
        <label className="text-sm font-semibold text-black">Total</label>
      </div>

      <div className="grid grid-cols-12 items-center justify-center gap-3 px-[1%]">
        <label className="text-sm text-black col-span-2">
          {index + 1}. {data.no_jo}
        </label>
        <label className="text-sm text-black">{data.no_io}</label>
        <label className="text-sm text-black col-span-2">{data.customer}</label>
        <label className="text-sm text-black col-span-3">
          {data.nama_produk}
        </label>

        <div className="grid grid-cols-3 col-span-3 gap-2">
          {PROSES_LIST.map((proses) => (
            <button
              key={proses}
              onClick={() => onOpenProses(data, proses)}
              className="flex flex-col gap-1 hover:cursor-pointer text-left"
            >
              <label className="text-sm text-black">{proses}</label>
              <label className="text-sm text-blue-500 font-semibold">
                {data.defectsByKategori?.[proses]?.total_defect}
              </label>
            </button>
          ))}
        </div>

        <label className="text-sm text-black">{data.total_defect}</label>
      </div>

      <div className="w-full overflow-x-auto text-black">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              {headers.map((h) => (
                <th key={h} className={TH}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {defects.map((d: any, ii: number) => {
              const subs = sortDesc(d.kendala, 'calculated_defect');
              const keyCell = (rowSpan?: number) => (
                <>
                  <td
                    onClick={() => onOpenDetail(data, d)}
                    rowSpan={rowSpan}
                    className="border border-gray-300 text-blue-500 px-4 py-2 cursor-pointer hover:underline"
                  >
                    {keyLabel(d)}
                  </td>
                  <td rowSpan={rowSpan} className={TD}>
                    {d.total_defect ?? 0}
                  </td>
                </>
              );

              if (subs.length === 0) {
                return (
                  <tr key={ii} className="border-b border-gray-300">
                    {keyCell()}
                    <td className={`${TD} text-center`} colSpan={2}>
                      {isWaste
                        ? 'Tidak ada Data Kendala'
                        : 'Tidak ada data Waste'}
                    </td>
                  </tr>
                );
              }

              return subs.map((k: any, iii: number) => (
                <tr key={`${ii}-${iii}`} className="border-b border-gray-300">
                  {iii === 0 && keyCell(subs.length)}
                  <td className={TD}>✤ {subLabel(k)}</td>
                  <td className={TD}>{k.calculated_defect}</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* --------------------------------- Main --------------------------------- */

function RekapWasteQC() {
  const [isLoading, setIsLoading] = useState(false);
  const [waste, setWaste] = useState<any>();
  const [wasteMaster, setWasteMaster] = useState<any>();
  const [dateFrom, setDateFrom] = useState<any>(null);
  const [dateTo, setDateTo] = useState<any>(null);

  const [activeComponent, setActiveComponent] = useState<TabKey>('component1');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchQuery2, setSearchQuery2] = useState('');

  const [prosesModal, setProsesModal] = useState<ProsesState>(null);
  const [detailModal, setDetailModal] = useState<DetailState>(null);
  const [showDetailMesin, setShowDetailMesin] = useState(false);

  useEffect(() => {
    getWasteMaster();
  }, []);

  async function getWaste(from: any, to: any) {
    const urlP1 = `${import.meta.env.VITE_API_LINK_P1}/api/waste-lkh`;
    const url = `${import.meta.env.VITE_API_LINK}/reportWaste`;
    try {
      setIsLoading(true);
      const resP1 = await axios.get(urlP1, {
        params: { first_date: from, last_date: to },
      });
      const res = await axios.post(
        url,
        {
          data_waste_master: wasteMaster,
          data_waste_p1: resP1.data,
          start_date: from,
          end_date: to,
        },
        { withCredentials: true },
      );
      setWaste(res.data);
    } catch (error: any) {
      console.log('error get waste', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function getWasteMaster() {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/produksi/wasteKendalaFormating`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {});
      setWasteMaster(res.data.waste);
    } catch (error: any) {
      console.log('error get master waste', error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredJo = filterJo(waste?.dataWasteByJo, searchQuery);
  const filteredJo2 = filterJo(waste?.dataWasteByJoReplace, searchQuery2);

  const kendalaList = waste?.dataByKategori?.dataKendala;
  const totalDefects =
    kendalaList?.reduce(
      (sum: number, k: any) => sum + (k.total_calculated_defect || 0),
      0,
    ) || 0;
  const totalJoLength =
    kendalaList?.reduce((sum: number, k: any) => sum + k.jo.length, 0) || 0;

  const handleExport = () => {
    switch (activeComponent) {
      case 'component1':
        return exportWasteByJo(filteredJo, dateFrom, dateTo);
      case 'component2':
        return exportWasteAll(waste?.dataWasteAll, dateFrom, dateTo);
      case 'component3':
        return exportKendalaByJo(filteredJo2, dateFrom, dateTo);
      case 'component4':
        return exportKendalaAll(waste?.dataWasteAllReplace, dateFrom, dateTo);
    }
  };

  const tabButton = (key: TabKey, label: string) => (
    <button
      onClick={() => setActiveComponent(key)}
      className="bg-blue-400 w-[50%] text-md font-semibold text-white border-2 rounded-md px-2 py-1"
    >
      {label}
    </button>
  );

  const renderJoTab = (
    mode: Mode,
    title: string,
    list: any[],
    query: string,
    setQuery: (v: string) => void,
  ) => (
    <div className="border-8 border-[#D8EAFF] flex flex-col gap-2">
      <TabHeader
        title={title}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onExport={handleExport}
        disabled={list.length === 0}
        searchValue={query}
        onSearch={setQuery}
      />
      {list.length === 0 && (
        <div className="text-red-500 text-center font-semibold mt-2">
          Data tidak ditemukan
        </div>
      )}
      {list.map((data: any, i: number) => (
        <JoCard
          key={i}
          data={data}
          index={i}
          mode={mode}
          onOpenProses={(jo, proses) => setProsesModal({ jo, proses })}
          onOpenDetail={(jo, defect) => setDetailModal({ mode, jo, defect })}
        />
      ))}
    </div>
  );

  const renderAllTab = (
    title: string,
    headers: string[],
    body: React.ReactNode,
    disabled: boolean,
  ) => (
    <div className="border-8 border-[#D8EAFF] flex flex-col gap-2 bg-white">
      <TabHeader
        title={title}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onExport={handleExport}
        disabled={disabled}
      />
      <div className="w-full overflow-x-auto text-black">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              {headers.map((h) => (
                <th key={h} className={TH}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{body}</tbody>
        </table>
      </div>
    </div>
  );

  const cellC = `${TD} text-center`;
  const cellCB = `${TD} font-semibold text-center`;

  const wasteAllBody = sortDesc(waste?.dataWasteAll, 'total_defect').map(
    (d: any, i: number) => {
      const subs = sortDesc(d.kendala, 'calculated_defect');
      if (subs.length === 0) {
        return (
          <tr key={i} className="border-b border-gray-300">
            <td className={cellCB}>
              {d.kode_waste} - {d.waste_desc}
            </td>
            <td className={cellCB}>{d.total_defect}</td>
            <td className={cellC} colSpan={4}>
              -
            </td>
          </tr>
        );
      }
      return subs.map((k: any, ii: number) => (
        <tr key={`${i}-${ii}`} className="border-b border-gray-300">
          {ii === 0 && (
            <>
              <td rowSpan={subs.length} className={cellCB}>
                {d.kode_waste} - {d.waste_desc}
              </td>
              <td rowSpan={subs.length} className={cellCB}>
                {d.total_defect}
              </td>
            </>
          )}
          <td className={`${TD} font-bold text-center uppercase`}>
            {k.kategori_kendala}
          </td>
          <td className={cellC}>{k.kode_kendala}</td>
          <td className={cellC}>{k.kendala_desc}</td>
          <td className={cellCB}>{k.calculated_defect}</td>
        </tr>
      ));
    },
  );

  const kendalaAllBody = sortDesc(
    waste?.dataWasteAllReplace,
    'total_defect',
  ).map((d: any, i: number) => {
    const subs = sortDesc(d.kode_waste, 'total_defect');
    if (subs.length === 0) {
      return (
        <tr key={i} className="border-b border-gray-300">
          <td className={cellCB}>{d.kategori_kendala}</td>
          <td className={cellCB}>
            {d.kode_kendala} - {d.kendala_desc}
          </td>
          <td className={cellCB}>{d.total_defect}</td>
          <td className={cellC} colSpan={3}>
            -
          </td>
        </tr>
      );
    }
    return subs.map((w: any, ii: number) => (
      <tr key={`${i}-${ii}`} className="border-b border-gray-300">
        {ii === 0 && (
          <>
            <td rowSpan={subs.length} className={cellCB}>
              {d.kategori_kendala}
            </td>
            <td rowSpan={subs.length} className={cellCB}>
              {d.kode_kendala} - {d.kendala_desc}
            </td>
            <td rowSpan={subs.length} className={cellCB}>
              {d.total_defect}
            </td>
          </>
        )}
        <td className={cellC}>{w.kode_waste}</td>
        <td className={cellC}>{w.waste_desc}</td>
        <td className={cellCB}>{w.total_defect}</td>
      </tr>
    ));
  });

  return (
    <div className="rounded-md">
      {isLoading && <Loading />}

      <div className="rounded-md shadow-md md:w-12/12 mb-5">
        {/* Filter tanggal */}
        <div className="flex md:gap-4 gap-1 md:flex-row flex-col px-4 py-4 md:mt-0 rounded-md bg-white mb-2">
          <p className="my-auto text-sm text-primary font-semibold">
            Pilih Tanggal
          </p>
          <div className="flex md:justify-center items-center gap-2">
            <p className="text-sm text-primary font-semibold md:w-3/12 w-2/12">
              Dari:
            </p>
            <input
              className="rounded-full bg-[#D8EAFF] px-2"
              type="date"
              value={dateFrom ?? ''}
              onChange={(e) => setDateFrom(e.target.value || null)}
            />
          </div>
          <div className="flex md:justify-center items-center gap-2">
            <p className="my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
              Sampai:
            </p>
            <input
              className="rounded-full bg-[#D8EAFF] px-2"
              type="date"
              value={dateTo ?? ''}
              onChange={(e) => setDateTo(e.target.value || null)}
            />
          </div>
          <div className="flex justify-center my-5">
            <button
              disabled={isLoading}
              onClick={() => getWaste(dateFrom, dateTo)}
              className="bg-primary text-white px-5 py-2 rounded-md my-auto"
            >
              Tampilkan
            </button>
          </div>
          <div className="flex justify-center my-5">
            <button
              disabled={isLoading}
              onClick={() => {
                setDateFrom(null);
                setDateTo(null);
                getWaste(null, null);
              }}
              className="bg-primary text-white px-5 py-2 rounded-md my-auto"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Rekap per kategori */}
        <div className="px-4 py-4 md:mt-0 rounded-md bg-white mb-2 flex">
          <table className="w-full border-collapse border-x border-y border-gray-300 bg-white py-4">
            <thead>
              <tr className="bg-blue-100 border-b border-gray-300">
                <th className="px-5 py-2 text-sm font-bold text-blue-500 text-left border-x border-gray-300">
                  Detail By Kategori
                </th>
                {['Qty', '% Qty', 'Frekuensi', '% Frekuensi'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-2 text-sm font-bold text-black text-left border-x border-gray-300"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kendalaList?.map((kendala: any, i: number) => {
                const qty = kendala.total_calculated_defect || 0;
                const percentage =
                  totalDefects > 0
                    ? ((qty / totalDefects) * 100).toFixed(2)
                    : '0';
                const joPercentage =
                  totalJoLength > 0
                    ? ((kendala.jo.length / totalJoLength) * 100).toFixed(2)
                    : '0';
                const isMesin = kendala.kategori_kendala == 'Mesin';
                const kategoriLabel =
                  kendala.kategori_kendala == 0 ||
                  kendala.kategori_kendala == null
                    ? '0'
                    : kendala.kategori_kendala;

                return (
                  <tr key={i} className="border-b border-gray-300">
                    {isMesin ? (
                      <td
                        onClick={() => setShowDetailMesin(true)}
                        className="px-5 py-2 text-sm text-blue-500 font-semibold border-x border-gray-300 hover:cursor-pointer"
                      >
                        {kategoriLabel}
                      </td>
                    ) : (
                      <td className="px-5 py-2 text-sm text-black border-x border-gray-300">
                        {kategoriLabel}
                      </td>
                    )}
                    <td className="px-5 py-2 text-sm text-black border-x border-gray-300">
                      {qty === 0 ? '0' : formatInteger(qty.toFixed(0))}
                    </td>
                    <td className="px-5 py-2 text-sm text-black border-x border-gray-300">
                      {percentage}%
                    </td>
                    <td className="px-5 py-2 text-sm text-black border-x border-gray-300">
                      {kendala.jo.length}
                    </td>
                    <td className="px-5 py-2 text-sm text-black">
                      {joPercentage}%
                    </td>

                    {isMesin && showDetailMesin && (
                      <ModalKosongan
                        isOpen={showDetailMesin}
                        onClose={() => setShowDetailMesin(false)}
                        judul={'Detail Kategori Mesin'}
                      >
                        <MesinDetailContent
                          kendala={kendala}
                          dataKendalaMesin={
                            waste?.dataByKategori?.dataKendalaMesin
                          }
                        />
                      </ModalKosongan>
                    )}
                  </tr>
                );
              })}
            </tbody>
            <thead>
              <tr className="bg-blue-100 border-b border-gray-300 border-x">
                <th
                  colSpan={2}
                  className="px-5 py-2 text-sm font-bold text-black text-left border-x border-gray-300"
                >
                  Total JO Waste: {waste?.dataWasteByJo?.length}
                </th>
                <th
                  colSpan={2}
                  className="px-5 py-2 text-sm font-bold text-black text-left border-x border-gray-300"
                >
                  Total JO Kendala: {waste?.dataWasteByJoReplace?.length}
                </th>
              </tr>
            </thead>
          </table>
        </div>

        {/* Tab */}
        <div className="flex gap-3 w-full justify-center">
          <div className="flex flex-col gap-2 border-2 w-[50%] justify-center border-white rounded-md">
            <label className="text-center justify-center flex text-xl font-bold text-black px-[1%]">
              Waste
            </label>
            <div className="flex gap-2 justify-center">
              {tabButton('component1', 'Waste By JO')}
              {tabButton('component2', 'Waste All')}
            </div>
          </div>
          <div className="flex flex-col gap-2 border-2 w-[50%] justify-center border-white rounded-md">
            <label className="text-center justify-center flex text-xl font-bold text-black px-[1%]">
              Kendala
            </label>
            <div className="flex gap-2 justify-center">
              {tabButton('component3', 'Kendala By JO')}
              {tabButton('component4', 'Kendala All')}
            </div>
          </div>
        </div>

        {activeComponent === 'component1' &&
          renderJoTab(
            'waste',
            'Waste Ke Kendala By JO',
            filteredJo,
            searchQuery,
            setSearchQuery,
          )}

        {activeComponent === 'component2' &&
          renderAllTab(
            'Waste Ke Kendala All',
            [
              'Kode Waste',
              'Total Defect',
              'Kategori Kendala',
              'Kode Kendala',
              'Deskripsi Kendala',
              'Defect By Kendala',
            ],
            wasteAllBody,
            !waste?.dataWasteAll?.length,
          )}

        {activeComponent === 'component3' &&
          renderJoTab(
            'kendala',
            'Kendala Ke Waste By JO',
            filteredJo2,
            searchQuery2,
            setSearchQuery2,
          )}

        {activeComponent === 'component4' &&
          renderAllTab(
            'Kendala Ke Waste All',
            [
              'Kategori Kendala',
              'Kode Kendala',
              'Total Defect',
              'Kode Waste',
              'Deskripsi Waste',
              'Defect By Waste',
            ],
            kendalaAllBody,
            !waste?.dataWasteAllReplace?.length,
          )}
      </div>

      {/* Modal detail proses (POTONG, CETAK, dst) */}
      {prosesModal && (
        <ModalKosongan
          isOpen={true}
          onClose={() => setProsesModal(null)}
          judul={`Detail ${prosesModal.proses} ${prosesModal.jo.no_jo}`}
        >
          <ProsesDetailContent
            jo={prosesModal.jo}
            proses={prosesModal.proses}
          />
        </ModalKosongan>
      )}

      {/* Modal detail waste / kendala */}
      {detailModal && (
        <ModalKosongan
          isOpen={true}
          onClose={() => setDetailModal(null)}
          judul={
            detailModal.mode === 'waste'
              ? `Detail ${detailModal.jo.no_jo} ~ ${detailModal.defect.kode_waste} - ${detailModal.defect.waste_desc}`
              : `Detail ${detailModal.jo.no_jo} ~ ${detailModal.defect.kode_kendala} - ${detailModal.defect.kendala_desc}`
          }
        >
          <DetailContent mode={detailModal.mode} defect={detailModal.defect} />
        </ModalKosongan>
      )}
    </div>
  );
}

export default RekapWasteQC;
