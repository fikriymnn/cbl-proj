import axios from 'axios';
import { MasterAnalisis, MasterMachine } from '../../../types/master';
import { useEffect, useState } from 'react';
import Filter from '../../../images/icon/filter.svg';
import ModalEditAnalisisMaster from '../../Modals/ModalEditAnalisisMaster';
import ModalKosongan from '../../Modals/Qc/NCR/NCRResponQC';
import Select from 'react-select';

const TableGrupAnalisis = () => {
  const [options, setOptions] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [defectMaster, setDefectMaster] = useState<any>([]);
  const [masterAnalisisGrup, setmasterAnalisisGrup] = useState<any>([]);
  const [masterAnalisis, setmasterAnalisis] = useState<any>([]);
  const [selectedDefect, setSelectedDefect] = useState<any>(null);
  const [selectedAnalisis, setSelectedAnalisis] = useState<any>(null);
  const [selectedMainId, setSelectedMainId] = useState<number | null>(null);
  const [analisisOptions, setAnalisisOptions] = useState<any>([]);

  useEffect(() => {
    getmasterAnalisisGrup();
    getMasterDefect();
    getmasterAnalisis();
  }, []);

  async function getmasterAnalisisGrup() {
    const url = `${import.meta.env.VITE_API_LINK}/master/kodeAnalisisGrup`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setmasterAnalisisGrup(res.data.data);
      console.log(' Analisis Grup', res.data);
    } catch (error: any) {
      console.log(error.data?.msg || error.message);
    }
  }

  async function getmasterAnalisis() {
    const url = `${import.meta.env.VITE_API_LINK}/master/kodeAnalisis`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setmasterAnalisis(res.data);
      // Create options for the select dropdown
      if (res.data) {
        setAnalisisOptions(
          res.data.map((item: any) => ({
            value: item.id,
            label: `${item.kode_analisis} - ${item.nama_analisis} - ${item.bagian_analisis}`,
          })),
        );
      }
      console.log('Analisis MTC', res.data);
    } catch (error: any) {
      console.log(error.data?.msg || error.message);
    }
  }

  async function getMasterDefect() {
    const url = `${import.meta.env.VITE_API_LINK_P1}/api/list-all-kendala`;

    try {
      setIsLoading(true);
      const res = await axios.get(url);
      setIsLoading(false);
      setDefectMaster(res.data); // Save raw data for filtering
      setOptions(
        res.data.map((item: any) => ({
          value: item.kode,
          label: `${item.kode} - ${item.kendala}`,
        })),
      );
      console.log('master defect', res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error.data?.msg || error.message);
    }
  }

  async function postMain(kode: any, nama: any) {
    const url = `${import.meta.env.VITE_API_LINK}/master/kodeAnalisisGrup/main`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          kode_kendala: kode,
          nama_kendala: nama,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getmasterAnalisisGrup(); // Refresh the data
      closeModalTambah();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function postChild(mainId: number, analisisId: number, i: any) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/kodeAnalisisGrup/child`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_main_grup: mainId,
          id_kode_analisis: analisisId,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getmasterAnalisisGrup(); // Refresh the data
      closeEdit(i);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const [showModalTambah, setShowModalTambah] = useState(false);

  const openModalTambah = () => setShowModalTambah(true);
  const closeModalTambah = () => {
    setShowModalTambah(false);
    setSelectedDefect(null);
  };

  const [showEdit, setShowEdit] = useState<any>([]);

  const openEdit = (i: any, mainId: number) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = true;
    setShowEdit(onchangeVal);
    setSelectedMainId(mainId);
    console.log('Main ID', mainId);
  };

  const closeEdit = (i: any) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = false;
    setShowEdit(onchangeVal);
    setSelectedAnalisis(null);
    setSelectedMainId(null);
  };

  const handleChangePoint = (selected: any) => {
    const { value } = selected;
    const filteredData = defectMaster.find((item: any) => item.kode == value);

    setSelectedDefect({
      kode: filteredData?.kode,
      nama: filteredData?.kendala,
    });

    console.log(filteredData?.kode);
    console.log(filteredData?.kendala);
  };

  const handleChangeAnalisis = (selected: any) => {
    setSelectedAnalisis(selected.value);
  };
  async function deleteMain(id: number, kode_kendala: any) {
    if (
      window.confirm(
        `Apakah Anda yakin ingin Menghapus Kode Kendala :  ${kode_kendala}`,
      )
    ) {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/master/kodeAnalisisGrup/main/${id}
`;
      try {
        setIsLoading(true);
        const res = await axios.delete(url, {
          withCredentials: true,
        });
        setIsLoading(false);
        getmasterAnalisisGrup();
        console.log(res.data);
      } catch (error: any) {
        setIsLoading(false);
        console.log(error);
      }
    }
  }
  async function deleteChild(id: number, kode_kendala: any, analisis_mtc: any) {
    if (
      window.confirm(
        `Apakah Anda yakin ingin Menghapus Analisis MTC :  ${analisis_mtc} Pada Kode Kendala : ${kode_kendala}`,
      )
    ) {
      const url = `${
        import.meta.env.VITE_API_LINK
      }/master/kodeAnalisisGrup/child/${id}
`;
      try {
        setIsLoading(true);
        const res = await axios.delete(url, {
          withCredentials: true,
        });
        setIsLoading(false);
        getmasterAnalisisGrup();
        console.log(res.data);
      } catch (error: any) {
        setIsLoading(false);
        console.log(error);
      }
    }
  }
  return (
    <div className="rounded-xl border border-stroke bg-white pt-4 shadow-default dark:border-strokedark dark:bg-boxdark  xl:pb-1">
      <>
        <div className="flex justify-between bg-white p-2"></div>
        <div className="flex w-full justify-between pr-8 border-b border-stroke pb-2">
          <input
            type="search"
            placeholder="search"
            name=""
            id=""
            className="md:w-96 w-40 py-1 mx-3 px-3 bg-[#E9F3FF]"
          />
          <button
            onClick={openModalTambah}
            className=" bg-blue-600 rounded-sm text-white text-xs font-bold px-7 py-1"
          >
            TAMBAH KODE KENDALA
          </button>
          {showModalTambah && (
            <ModalKosongan
              isOpen={showModalTambah}
              onClose={closeModalTambah}
              judul={'Tambah Kode Kendala'}
            >
              <>
                <div className="flex flex-col gap-4 h-[400px] py-5">
                  <div className="flex flex-col gap-1">
                    <Select
                      placeholder="Cari..."
                      options={options}
                      onChange={(selectedId) => {
                        handleChangePoint(selectedId);
                      }}
                      className={`relative z-50 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white'}`}
                    />
                  </div>

                  {selectedDefect && (
                    <div className="mt-2 px-2">
                      <p className="text-sm">
                        Selected: {selectedDefect.kode} - {selectedDefect.nama}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => {
                        if (selectedDefect) {
                          postMain(selectedDefect.kode, selectedDefect.nama);
                        }
                      }}
                      disabled={!selectedDefect || isLoading}
                      className={`bg-blue-600 rounded-sm text-white text-xs font-bold px-7 py-2 ${
                        !selectedDefect || isLoading
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      {isLoading ? 'Loading...' : 'SIMPAN'}
                    </button>
                  </div>
                </div>
              </>
            </ModalKosongan>
          )}
        </div>

        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr className="border-b border-stroke dark:border-strokedark">
              <th className="p-2.5 text-[14px] text-slate-600 font-semibold dark:text-white hidden sm:table-cell">
                No
              </th>
              <th className="p-2.5 text-[14px] text-slate-600 font-semibold dark:text-white">
                Kode Kendala
              </th>
              <th className="p-2.5 text-[14px] text-slate-600 font-semibold dark:text-white">
                Analisis MTC
              </th>
              <th className="p-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {masterAnalisisGrup != null &&
              masterAnalisisGrup.map((data: any, i: number) => (
                <tr
                  key={i}
                  className={`border-b border-stroke dark:border-strokedark ${
                    i === masterAnalisisGrup.length - 1 ? 'border-0' : ''
                  }`}
                >
                  <td className="p-2.5 text-[14px] text-black dark:text-white hidden sm:table-cell ">
                    {i + 1}
                  </td>
                  <td className="p-2.5 text-[14px] text-slate-600  uppercase dark:text-white">
                    {data.kode_kendala} - {data.nama_kendala}
                  </td>
                  <td className="p-2.5 text-[14px] text-slate-600 dark:text-white">
                    <div className="flex flex-col gap-1">
                      {data.child_grup?.map((data2: any, ii: number) => (
                        <div className="flex  gap-1" key={ii}>
                          <p>
                            {ii + 1}. {data2.kode_analisis?.kode_analisis} -{' '}
                            {data2.kode_analisis?.nama_analisis} -{' '}
                            {data2.kode_analisis?.bagian_analisis}
                          </p>
                          <button
                            onClick={() =>
                              deleteChild(
                                data2.id,
                                data.kode_kendala,
                                data2.kode_analisis?.kode_analisis,
                              )
                            }
                            className="bg-red-600 rounded-sm  text-white text-xs font-bold px-2 py-1"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-2.5 justify-end items-end flex-col gap-2 flex pr-10">
                    <button
                      onClick={() => openEdit(i, data.id)}
                      className="bg-blue-600 rounded-sm w-30 text-white text-xs font-bold px-4 py-1"
                    >
                      + Analisis MTC
                    </button>

                    {showEdit[i] === true && (
                      <ModalKosongan
                        isOpen={showEdit[i]}
                        onClose={() => closeEdit(i)}
                        judul={'Tambah Analisis MTC'}
                      >
                        <div className="flex flex-col gap-4 h-[400px] py-5">
                          <div className="flex flex-col gap-1">
                            <Select
                              placeholder="Pilih Analisis MTC..."
                              options={analisisOptions}
                              onChange={(selected) => {
                                handleChangeAnalisis(selected);
                              }}
                              className="relative z-50 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input text-black dark:text-white"
                            />
                          </div>

                          <div className="flex justify-end mt-4">
                            <button
                              onClick={() => {
                                if (selectedAnalisis && selectedMainId) {
                                  postChild(
                                    selectedMainId,
                                    selectedAnalisis,
                                    i,
                                  );
                                }
                              }}
                              disabled={!selectedAnalisis || isLoading}
                              className={`bg-blue-600 rounded-sm text-white text-xs font-bold px-7 py-2 ${
                                !selectedAnalisis || isLoading
                                  ? 'opacity-50 cursor-not-allowed'
                                  : ''
                              }`}
                            >
                              {isLoading ? 'Loading...' : 'TAMBAH'}
                            </button>
                          </div>
                        </div>
                      </ModalKosongan>
                    )}
                    <button
                      onClick={() => deleteMain(data.id, data.kode_kendala)}
                      className="bg-red-600 rounded-sm w-30 text-white text-xs font-bold px-4 py-1"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </>
    </div>
  );
};

export default TableGrupAnalisis;
