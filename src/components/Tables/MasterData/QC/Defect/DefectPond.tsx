import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ModalAddPeriode from '../../../../Modals/Qc/ModalAddPeriode';
import Loading from '../../../../Loading';

function DefectPond() {
  const [isLoading, setIsLoading] = useState(false);

  const [addDefect, setDefect] = useState<any>();
  useEffect(() => {
    getDefect();
  }, []);

  async function getDefect() {
    const url = `${import.meta.env.VITE_API_LINK}/master/qc/cs/masalahPond`;
    try {
      const res = await axios.get(url, {
        params: {
          status: 'active',
        },
        withCredentials: true,
      });

      setDefect(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const [kode, setKode] = useState<any>();
  const [masalah, setMasalah] = useState<any>();
  const [kriteria, setKriteria] = useState<any>();
  const [persenKriteria, setPersenKriteria] = useState<any>();
  const [sumberMasalah, setSumberMasalah] = useState<any>();

  async function tambahDefect() {
    const url = `${import.meta.env.VITE_API_LINK}/master/qc/cs/masalahPond`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          kode: kode,
          masalah: masalah,
          kriteria: kriteria,
          persen_kriteria: persenKriteria,
          sumber_masalah: sumberMasalah,
        },
        {
          withCredentials: true,
        },
      );

      getDefect();
      setIsLoading(false);
      closeModalTambah();
      setKode(null);
      setMasalah(null);
      setPersenKriteria(null);
      setSumberMasalah(null);
      setKriteria(null);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function editDefect(id: any) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/qc/cs/masalahPond/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {
          kode: kode,
          masalah: masalah,
          kriteria: kriteria,
          persen_kriteria: persenKriteria,
          sumber_masalah: sumberMasalah,
        },
        {
          withCredentials: true,
        },
      );

      getDefect();
      setIsLoading(false);
      setKode(null);
      setMasalah(null);
      setPersenKriteria(null);
      setSumberMasalah(null);
      setKriteria(null);
    } catch (error: any) {
      console.log(error);
    }
  }
  async function deleteDefect(id: any) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/qc/cs/masalahPond/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.delete(
        url,

        {
          withCredentials: true,
        },
      );
      getDefect();
      setIsLoading(false);
    } catch (error: any) {
      console.log(error);
    }
  }

  const [showModalTambah, setShowModalTambah] = useState(false);

  const openModalTambah = () => setShowModalTambah(true);
  const closeModalTambah = () => setShowModalTambah(false);

  const [showEdit, setShowEdit] = useState<any>([]);

  const openEdit = (i: any) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = true;

    setShowEdit(onchangeVal);
  };
  const closeEdit = (i: any) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = false;

    setShowEdit(onchangeVal);
  };

  const [showDelete, setShowDelete] = useState<any>([]);

  const openDelete = (i: any) => {
    const onchangeVal: any = [...showDelete];
    onchangeVal[i] = true;

    setShowDelete(onchangeVal);
  };
  const closeDelete = (i: any) => {
    const onchangeVal: any = [...showDelete];
    onchangeVal[i] = false;

    setShowDelete(onchangeVal);
  };
  return (
    <>
      <div className=" flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold rounded-m">
        <p className="w-20">No</p>
        <div className="grid grid-cols-12 w-full">
          <div className="col-span-2">Kode</div>
          <div className="col-span-3">Masalah</div>
          <div className="col-span-2">Criteria</div>
          <div className="col-span-1">% Criteria</div>
          <div className="col-span-2">Sumber Masalah</div>
          <div className="col-span-2 flex gap-3 justify-end">
            <button
              onClick={openModalTambah}
              className=" bg-blue-600 rounded-sm text-white text-xs font-bold px-2 py-1"
            >
              TAMBAH
            </button>
            {showModalTambah && (
              <ModalAddPeriode
                isOpen={showModalTambah}
                onClose={closeModalTambah}
                judul={'Tambah Defect'}
              >
                <div className="px-2 flex flex-col">
                  <label className="text-black text-sm font-bold pt-4">
                    Kode
                  </label>
                  <input
                    onChange={(e) => setKode(e.target.value)}
                    type="text"
                    className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                  />
                  <label className="text-black text-sm font-bold pt-4">
                    Masalah
                  </label>
                  <input
                    onChange={(e) => setMasalah(e.target.value)}
                    type="text"
                    className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                  />
                  <label className="text-black text-sm font-bold pt-4">
                    Kriteria
                  </label>
                  <select
                    onChange={(e) => {
                      setKriteria(e.target.value);
                    }}
                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
                  >
                    <option
                      value=""
                      disabled
                      selected
                      className="text-body dark:text-bodydark"
                    >
                      Pilih kriteria
                    </option>

                    <option
                      value="critical"
                      className="text-body dark:text-bodydark"
                    >
                      Critical
                    </option>
                    <option
                      value="major"
                      className="text-body dark:text-bodydark"
                    >
                      Major
                    </option>
                    <option
                      value="minor"
                      className="text-body dark:text-bodydark"
                    >
                      Minor
                    </option>
                  </select>
                  <label className="text-black text-sm font-bold pt-4">
                    % Kriteria
                  </label>
                  <input
                    onChange={(e) => setPersenKriteria(e.target.value)}
                    type="text"
                    className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                  />
                  <label className="text-black text-sm font-bold pt-4">
                    Sumber Masalah
                  </label>
                  <select
                    onChange={(e) => {
                      setSumberMasalah(e.target.value);
                    }}
                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
                  >
                    <option
                      value=""
                      disabled
                      selected
                      className="text-body dark:text-bodydark"
                    >
                      Pilih Sumber Masalah
                    </option>

                    <option
                      value="mesin"
                      className="text-body dark:text-bodydark"
                    >
                      Mesin
                    </option>
                    <option
                      value="man"
                      className="text-body dark:text-bodydark"
                    >
                      Man
                    </option>
                    <option
                      value="material"
                      className="text-body dark:text-bodydark"
                    >
                      Material
                    </option>
                    <option
                      value="persiapan"
                      className="text-body dark:text-bodydark"
                    >
                      Persiapan
                    </option>
                    <option
                      value="design"
                      className="text-body dark:text-bodydark"
                    >
                      Design
                    </option>
                  </select>

                  <div className="pt-4">
                    <button
                      disabled={isLoading}
                      onClick={tambahDefect}
                      className="rounded-md justify-center items-center w-full h-10 bg-blue-600 text-white font-semibold text-sm"
                    >
                      {isLoading ? 'Loading...' : 'TAMBAH DEFECT'}
                    </button>
                    {isLoading && <Loading />}
                  </div>
                </div>
              </ModalAddPeriode>
            )}
          </div>
        </div>
      </div>
      {addDefect != null &&
        addDefect?.map((data: any, i: number) => {
          return (
            <>
              <div className=" flex bg-white py-2 w-full mb-1 px-5 text-sm font-medium border-b-3 border-[#D8EAFF]">
                <p className="w-20">{i + 1}</p>
                <div className="grid grid-cols-12 w-full">
                  <div className="col-span-2">{data?.kode}</div>
                  <div className="col-span-3">{data?.masalah}</div>
                  <div className="col-span-2">{data.kriteria}</div>
                  <div className="col-span-1">{data.persen_kriteria + '%'}</div>
                  <div className="col-span-2">{data.sumber_masalah}</div>
                  <div className="col-span-2 flex gap-3 justify-end">
                    <button
                      onClick={() => openEdit(i)}
                      className="bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1"
                    >
                      EDIT
                    </button>
                    {showEdit && (
                      <ModalAddPeriode
                        isOpen={showEdit[i]}
                        onClose={() => closeEdit(i)}
                        judul={'Edit Defect'}
                      >
                        <div className="px-2 flex flex-col">
                          <label className="text-black text-sm font-bold pt-4">
                            Kode
                          </label>
                          <input
                            defaultValue={data?.kode}
                            onChange={(e) => setKode(e.target.value)}
                            type="text"
                            className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                          />
                          <label className="text-black text-sm font-bold pt-4">
                            Masalah
                          </label>
                          <input
                            defaultValue={data?.masalah}
                            onChange={(e) => setMasalah(e.target.value)}
                            type="text"
                            className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                          />
                          <label className="text-black text-sm font-bold pt-4">
                            Kriteria
                          </label>
                          <select
                            onChange={(e) => {
                              setKriteria(e.target.value);
                            }}
                            defaultValue={data.kriteria}
                            className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
                          >
                            {data.kriteria == null ? (
                              <option
                                value=""
                                disabled
                                selected
                                className="text-body dark:text-bodydark"
                              >
                                Pilih kriteria
                              </option>
                            ) : null}

                            <option
                              value="critical"
                              className="text-body dark:text-bodydark"
                            >
                              Critical
                            </option>
                            <option
                              value="major"
                              className="text-body dark:text-bodydark"
                            >
                              Major
                            </option>
                            <option
                              value="minor"
                              className="text-body dark:text-bodydark"
                            >
                              Minor
                            </option>
                          </select>
                          <label className="text-black text-sm font-bold pt-4">
                            % Kriteria
                          </label>
                          <input
                            onChange={(e) => setPersenKriteria(e.target.value)}
                            defaultValue={data.persen_kriteria}
                            type="text"
                            className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                          />
                          <label className="text-black text-sm font-bold pt-4">
                            Sumber Masalah
                          </label>
                          <select
                            onChange={(e) => {
                              setSumberMasalah(e.target.value);
                            }}
                            defaultValue={data.sumber_masalah}
                            className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
                          >
                            {data.sumber_masalah == null ? (
                              <option
                                value=""
                                disabled
                                selected
                                className="text-body dark:text-bodydark"
                              >
                                Pilih Sumber Masalah
                              </option>
                            ) : null}

                            <option
                              value="mesin"
                              className="text-body dark:text-bodydark"
                            >
                              Mesin
                            </option>
                            <option
                              value="man"
                              className="text-body dark:text-bodydark"
                            >
                              Man
                            </option>
                            <option
                              value="material"
                              className="text-body dark:text-bodydark"
                            >
                              Material
                            </option>
                            <option
                              value="persiapan"
                              className="text-body dark:text-bodydark"
                            >
                              Persiapan
                            </option>
                            <option
                              value="design"
                              className="text-body dark:text-bodydark"
                            >
                              Design
                            </option>
                          </select>

                          <div className="pt-4">
                            <button
                              disabled={isLoading}
                              onClick={() => editDefect(data?.id)}
                              className="rounded-md justify-center items-center w-full h-10 bg-blue-600 text-white font-semibold text-sm"
                            >
                              {isLoading ? 'Loading...' : 'EDIT DEFECT'}
                            </button>
                            {isLoading && <Loading />}
                          </div>
                        </div>
                      </ModalAddPeriode>
                    )}
                    <button
                      onClick={() => openDelete(i)}
                      className="bg-red-600 rounded-sm text-white text-xs font-bold px-4 py-1"
                    >
                      DELETE
                    </button>
                    {showDelete[i] == true && (
                      <ModalAddPeriode
                        isOpen={showDelete[i]}
                        onClose={() => closeDelete(i)}
                        judul={'Hapus Defect'}
                      >
                        <div>
                          <div className="pt-4">
                            {/* {data?.id} */}
                            <button
                              disabled={isLoading}
                              onClick={() => deleteDefect(data?.id)}
                              className="rounded-md justify-center items-center w-full h-10 bg-red-600 text-white font-semibold text-sm"
                            >
                              {isLoading ? 'Loading...' : 'DELETE DEFECT'}
                            </button>
                            {isLoading && <Loading />}
                          </div>
                        </div>
                      </ModalAddPeriode>
                    )}
                  </div>
                </div>
              </div>
            </>
          );
        })}
    </>
  );
}

export default DefectPond;
