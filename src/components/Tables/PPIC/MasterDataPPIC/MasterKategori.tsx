import { useEffect, useState } from 'react';
import axios from 'axios';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import Select from 'react-select';
import Loading from '../../../Loading';

const MasterKategori = () => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [masterKategori, setmasterKategori] = useState<any>();
  const [masterMesin, setmasterMesin] = useState<any>();
  const [selectedID, setSelectedID] = useState<any>();

  // ── search state ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');

  // ── Tambah modal: track which mesin is selected ──
  const [selectedMesinName, setSelectedMesinName] = useState<string | null>(
    null,
  );

  // ── Edit modal: track which mesin is selected ──
  const [selectedMesinEdit, setSelectedMesinEdit] = useState<string | null>(
    null,
  );
  const [selectedMesinNameEdit, setSelectedMesinNameEdit] = useState<
    string | null
  >(null);

  // Derived filtered list
  const filteredKategori = masterKategori?.data?.filter((item: any) => {
    const q = searchQuery.toLowerCase();
    return (
      item.nama_mesin?.toLowerCase().includes(q) ||
      item.nama_kategori?.toLowerCase().includes(q)
    );
  });

  // ── count how many rows already use the selected mesin (Tambah) ──
  const mesinCount = selectedMesinName
    ? masterKategori?.data?.filter(
        (item: any) => item.nama_mesin === selectedMesinName,
      ).length ?? 0
    : null;

  // ── count how many rows already use the selected mesin (Edit) ──
  const mesinCountEdit = selectedMesinNameEdit
    ? masterKategori?.data?.filter(
        (item: any) => item.nama_mesin === selectedMesinNameEdit,
      ).length ?? 0
    : null;

  // ── machine summary badges ──
  const mesinSummary = (masterKategori?.data ?? []).reduce(
    (acc: Record<string, { name: string; count: number }>, item: any) => {
      const key = item.nama_mesin;
      if (!acc[key]) acc[key] = { name: item.nama_mesin, count: 0 };
      acc[key].count += 1;
      return acc;
    },
    {} as Record<string, { name: string; count: number }>,
  );

  useEffect(() => {
    getMasterMesin();
    getmasterKategori();
  }, []);

  async function getmasterKategori() {
    const url = `${import.meta.env.VITE_API_LINK}/master/ppic/settingKapasitas`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, { withCredentials: true });
      setIsLoading(false);
      setmasterKategori(res.data);
      console.log('kapasitas', res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  // ── Tambah form state ──
  const [namaKategori, setnamaKategori] = useState<any>();
  const [settingA, setsettingA] = useState<any>(0);
  const [settingB, setsettingB] = useState<any>(0);
  const [settingC, setsettingC] = useState<any>(0);
  const [kapasitasA, setkapasitasA] = useState<any>(0);
  const [kapasitasB, setkapasitasB] = useState<any>(0);
  const [kapasitasC, setkapasitasC] = useState<any>(0);

  // ── Edit form state ──
  const [namaKategoriEdit, setnamaKategoriEdit] = useState<any>();
  const [settingAEdit, setsettingAEdit] = useState<any>(0);
  const [settingBEdit, setsettingBEdit] = useState<any>(0);
  const [settingCEdit, setsettingCEdit] = useState<any>(0);
  const [kapasitasAEdit, setkapasitasAEdit] = useState<any>(0);
  const [kapasitasBEdit, setkapasitasBEdit] = useState<any>(0);
  const [kapasitasCEdit, setkapasitasCEdit] = useState<any>(0);

  async function postMasterKategori() {
    const url = `${import.meta.env.VITE_API_LINK}/master/ppic/settingKapasitas`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          mesin: selectedMesinName,
          nama_kategori: namaKategori,
          setting_a: settingA,
          setting_b: settingB,
          setting_c: settingC,
          kapasitas_a: kapasitasA,
          kapasitas_b: kapasitasB,
          kapasitas_c: kapasitasC,
        },
        { withCredentials: true },
      );
      setIsLoading(false);
      setSelectedID(null);
      setSelectedMesinName(null);
      setnamaKategori('');
      setsettingA(0);
      setsettingB(0);
      setsettingC(0);
      setkapasitasA(0);
      setkapasitasB(0);
      setkapasitasC(0);
      getmasterKategori();
      closeModalHistory();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function putMasterKategori(id: any, i: any) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/ppic/settingKapasitas/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {
          mesin: selectedMesinEdit,
          nama_kategori: namaKategoriEdit,
          setting_a: settingAEdit,
          setting_b: settingBEdit,
          setting_c: settingCEdit,
          kapasitas_a: kapasitasAEdit,
          kapasitas_b: kapasitasBEdit,
          kapasitas_c: kapasitasCEdit,
        },
        { withCredentials: true },
      );
      alert('Edit Data Berhasil');
      setIsLoading(false);
      setSelectedID(null);
      setSelectedMesinEdit(null);
      setSelectedMesinNameEdit(null);
      setnamaKategoriEdit('');
      setsettingAEdit(0);
      setsettingBEdit(0);
      setsettingCEdit(0);
      setkapasitasAEdit(0);
      setkapasitasBEdit(0);
      setkapasitasCEdit(0);
      getmasterKategori();
      closeEdit(i);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function hapusKategori(id: any) {
    if (window.confirm('Apakah Anda yakin ingin Menghapus Kategori Ini?')) {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/master/ppic/settingKapasitas/${id}`;
      try {
        setIsLoading(true);
        const res = await axios.delete(url, { withCredentials: true });
        setIsLoading(false);
        getmasterKategori();
      } catch (error: any) {
        setIsLoading(false);
        console.log(error);
      }
    }
  }

  async function getMasterMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/master/mesinTahapan`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {});
      console.log('mesin', res.data.data);
      setIsLoading(false);
      setmasterMesin(res.data.data);
      setOptions(
        res.data?.data?.map((item: any) => ({
          value: item.nama_mesin,
          label: item.nama_mesin,
        })),
      );
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  // ── Tambah modal ──
  const [showHistory, setShowHistory] = useState(false);
  const openModalHistory = () => {
    setSelectedMesinName(null);
    setSelectedID(null);
    setShowHistory(true);
  };
  const closeModalHistory = () => setShowHistory(false);

  // ── Edit modal ──
  const [showEdit, setshowEdit] = useState<any>([]);

  const openEdit = (i: any, data: any) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = true;
    setshowEdit(onchangeVal);
    // Pre-fill all edit state from the row being edited
    setSelectedMesinEdit(data.mesin);
    setSelectedMesinNameEdit(data.nama_mesin);
    setnamaKategoriEdit(data.nama_kategori);
    setsettingAEdit(data.setting_a);
    setsettingBEdit(data.setting_b);
    setsettingCEdit(data.setting_c);
    setkapasitasAEdit(data.kapasitas_a);
    setkapasitasBEdit(data.kapasitas_b);
    setkapasitasCEdit(data.kapasitas_c);
  };

  const closeEdit = (i: any) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = false;
    setshowEdit(onchangeVal);
  };

  // ── Tambah: mesin select handler ──
  const handleChangePointDepatment = (selected: any) => {
    const { value } = selected;
    const filteredData = masterMesin.find((item: any) => item.mesin == value);
    console.log(filteredData?.mesin);
    setSelectedID(filteredData?.mesin);
    setSelectedMesinName(value);
  };

  // ── Edit: mesin select handler ──
  const handleChangeMesinEdit = (selected: any) => {
    setSelectedMesinEdit(selected.value);
    setSelectedMesinNameEdit(selected.value);
  };

  return (
    <main className="overflow-x-scroll ' ">
      {isLoading && <Loading />}
      <div className="min-w-[700px]  bg-white rounded-xl flex flex-col gap-1 py-[1%]">
        {/* Machine summary */}
        {Object.keys(mesinSummary).length > 0 && (
          <div className="flex flex-wrap gap-2 px-[1%] py-2 border-b-8 border-[#D8EAFF]">
            {Object.values(mesinSummary).map((m: any) => (
              <span
                key={m.name}
                className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-700"
              >
                {m.name}
                <span className="bg-blue-100 text-blue-800 text-xs font-medium rounded-full px-2 py-0.5">
                  {m.count}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* ── Header row: TAMBAH button + Search input ── */}
        <div className="flex w-full justify-between items-center pb-2 px-[1%] border-b-8 border-[#D8EAFF] gap-2">
          <button
            onClick={() => openModalHistory()}
            className=" bg-blue-600 rounded-sm text-white text-xs font-bold px-2 py-1"
          >
            TAMBAH KATEGORI
          </button>

          {/* ── Search bar ── */}
          <div className="relative flex items-center">
            <svg
              className="absolute left-2 text-gray-400 w-4 h-4 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Cari mesin / kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs border-2 border-stroke rounded-md focus:outline-none focus:border-blue-400 w-52"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-gray-400 hover:text-gray-600 text-sm leading-none"
              >
                ✕
              </button>
            )}
          </div>

          {/* ── Tambah Modal ── */}
          {showHistory == true && (
            <>
              <ModalKosonganSmall
                isOpen={showHistory}
                onClose={() => closeModalHistory()}
                judul={'Tambah Kategori'}
              >
                <>
                  <div className="flex flex-col gap-1 px-[1%] py-[1%]">
                    <Select
                      placeholder="Cari Mesin"
                      options={options}
                      onChange={(selectedId) => {
                        handleChangePointDepatment(selectedId);
                      }}
                      className={`relative z-30 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white'`}
                    />

                    {/* mesin count info badge */}
                    {selectedMesinName !== null && (
                      <div
                        className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md w-fit ${
                          mesinCount === 0
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        <span>{selectedMesinName}</span>
                        <span className="text-gray-400">·</span>
                        <span>
                          {mesinCount === 0
                            ? 'Belum ada kategori'
                            : `${mesinCount} kategori sudah ditambahkan`}
                        </span>
                      </div>
                    )}

                    <label className="text-black text-xs font-bold">
                      Nama Kategori
                    </label>
                    <input
                      onChange={(e) => setnamaKategori(e.target.value)}
                      type="text"
                      className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-black text-xs font-bold">
                          Setting A
                        </label>
                        <input
                          onChange={(e) => setsettingA(e.target.value)}
                          type="number"
                          className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-black text-xs font-bold">
                          Setting B
                        </label>
                        <input
                          onChange={(e) => setsettingB(e.target.value)}
                          type="number"
                          className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-black text-xs font-bold">
                          Setting C
                        </label>
                        <input
                          onChange={(e) => setsettingC(e.target.value)}
                          type="number"
                          className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-black text-xs font-bold">
                          Kapasitas A
                        </label>
                        <input
                          onChange={(e) => setkapasitasA(e.target.value)}
                          type="number"
                          className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-black text-xs font-bold">
                          Kapasitas B
                        </label>
                        <input
                          onChange={(e) => setkapasitasB(e.target.value)}
                          type="number"
                          className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-black text-xs font-bold">
                          Kapasitas C
                        </label>
                        <input
                          onChange={(e) => setkapasitasC(e.target.value)}
                          type="number"
                          className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                        />
                      </div>
                    </div>
                    <div className="pt-4">
                      <button
                        disabled={isLoading}
                        onClick={() => postMasterKategori()}
                        className="rounded-md justify-center items-center w-full h-10 bg-blue-600 text-white font-semibold text-sm"
                      >
                        {isLoading ? 'Loading...' : 'TAMBAH'}
                      </button>
                    </div>
                  </div>
                </>
              </ModalKosonganSmall>
            </>
          )}
        </div>

        <div className="overflow-y-auto max-h-[600px]">
          {/* ── Table header ── */}
          <div className="grid grid-cols-10 bg-white border-b-8 border-[#D8EAFF] px-[1%] py-[1%] sticky top-0 z-10">
            <p className="text-[#646464] text-xs font-bold">No</p>
            <p className="text-[#646464] text-xs font-bold col-span-2"></p>
            <p className="text-[#646464] text-xs font-bold">Setting A</p>
            <p className="text-[#646464] text-xs font-bold">Setting B</p>
            <p className="text-[#646464] text-xs font-bold">Setting C</p>
            <p className="text-[#646464] text-xs font-bold">Kapasitas A</p>
            <p className="text-[#646464] text-xs font-bold">Kapasitas B</p>
            <p className="text-[#646464] text-xs font-bold">Kapasitas C</p>
          </div>

          {/* ── Table body ── */}
          <div className="flex w-full flex-col bg-white">
            {filteredKategori?.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-4">
                Tidak ada data yang cocok dengan pencarian.
              </p>
            )}
            {filteredKategori?.map((data: any, i: number) => (
              <>
                <div
                  key={i}
                  className="grid grid-cols-10 bg-white border-b-8 border-[#D8EAFF] px-[1%] py-[1%]"
                >
                  <p className="text-[#646464] text-xs font-bold">{i + 1}</p>
                  <p className="text-[#646464] text-xs font-bold">
                    {data.nama_mesin}
                  </p>
                  <p className="text-[#646464] text-xs font-bold">
                    {data.nama_kategori}
                  </p>
                  <p className="text-[#646464] text-xs font-bold">
                    {data.setting_a}
                  </p>
                  <p className="text-[#646464] text-xs font-bold">
                    {data.setting_b}
                  </p>
                  <p className="text-[#646464] text-xs font-bold">
                    {data.setting_c}
                  </p>
                  <p className="text-[#646464] text-xs font-bold">
                    {data.kapasitas_a}
                  </p>
                  <p className="text-[#646464] text-xs font-bold">
                    {data.kapasitas_b}
                  </p>
                  <p className="text-[#646464] text-xs font-bold">
                    {data.kapasitas_c}
                  </p>
                  <div className="flex flex-col gap-1">
                    {/* ── Edit button: now passes data ── */}
                    <button
                      onClick={() => openEdit(i, data)}
                      className="px-2 py-1  text-xs bg-blue-400 items-center justify-center text-white font-semibold rounded-md flex w-full "
                    >
                      Edit
                    </button>

                    {/* ── Edit Modal ── */}
                    {showEdit[i] == true && (
                      <ModalKosonganSmall
                        isOpen={showEdit[i]}
                        onClose={() => closeEdit(i)}
                        judul={'Edit Kategori'}
                      >
                        <>
                          <div className="flex flex-col gap-1 px-[1%] py-[1%]">
                            {/* ── Mesin selector (NEW) ── */}
                            <label className="text-black text-xs font-bold">
                              Mesin
                            </label>
                            <Select
                              placeholder="Pilih Mesin"
                              options={options}
                              defaultValue={{
                                value: data.nama_mesin,
                                label: data.nama_mesin,
                              }}
                              onChange={(selected) =>
                                handleChangeMesinEdit(selected)
                              }
                              className={`relative z-30 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white'`}
                            />

                            {/* ── Mesin count badge (same as Tambah) ── */}
                            {selectedMesinNameEdit !== null && (
                              <div
                                className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md w-fit ${
                                  mesinCountEdit === 0
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}
                              >
                                <span>{selectedMesinNameEdit}</span>
                                <span className="text-gray-400">·</span>
                                <span>
                                  {mesinCountEdit === 0
                                    ? 'Belum ada kategori'
                                    : `${mesinCountEdit} kategori sudah ditambahkan`}
                                </span>
                              </div>
                            )}

                            <label className="text-black text-xs font-bold">
                              Nama Kategori
                            </label>
                            <input
                              onChange={(e) =>
                                setnamaKategoriEdit(e.target.value)
                              }
                              defaultValue={data.nama_kategori}
                              type="text"
                              className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-black text-xs font-bold">
                                  Setting A
                                </label>
                                <input
                                  onChange={(e) =>
                                    setsettingAEdit(e.target.value)
                                  }
                                  type="number"
                                  defaultValue={data.setting_a}
                                  className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-black text-xs font-bold">
                                  Setting B
                                </label>
                                <input
                                  onChange={(e) =>
                                    setsettingBEdit(e.target.value)
                                  }
                                  type="number"
                                  defaultValue={data.setting_b}
                                  className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-black text-xs font-bold">
                                  Setting C
                                </label>
                                <input
                                  onChange={(e) =>
                                    setsettingCEdit(e.target.value)
                                  }
                                  type="number"
                                  defaultValue={data.setting_c}
                                  className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-black text-xs font-bold">
                                  Kapasitas A
                                </label>
                                <input
                                  onChange={(e) =>
                                    setkapasitasAEdit(e.target.value)
                                  }
                                  type="number"
                                  defaultValue={data.kapasitas_a}
                                  className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-black text-xs font-bold">
                                  Kapasitas B
                                </label>
                                <input
                                  onChange={(e) =>
                                    setkapasitasBEdit(e.target.value)
                                  }
                                  type="number"
                                  defaultValue={data.kapasitas_b}
                                  className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-black text-xs font-bold">
                                  Kapasitas C
                                </label>
                                <input
                                  onChange={(e) =>
                                    setkapasitasCEdit(e.target.value)
                                  }
                                  type="number"
                                  defaultValue={data.kapasitas_c}
                                  className="w-full h-10 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                                />
                              </div>
                            </div>
                            <div className="pt-4">
                              <button
                                disabled={isLoading}
                                onClick={() => putMasterKategori(data.id, i)}
                                className="rounded-md justify-center items-center w-full h-10 bg-blue-600 text-white font-semibold text-sm"
                              >
                                {isLoading ? 'Loading...' : 'SIMPAN'}
                              </button>
                            </div>
                          </div>
                        </>
                      </ModalKosonganSmall>
                    )}

                    <button
                      onClick={() => hapusKategori(data.id)}
                      className="px-2 py-1  text-xs bg-red-400 items-center justify-center text-white font-semibold rounded-md flex w-full "
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default MasterKategori;
