import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ModalAddPeriode from '../../../../Modals/Qc/ModalAddPeriode';
import Loading from '../../../../Loading';

function PointSubFinal() {
  const [isLoading, setIsLoading] = useState(false);

  const [masterPointSubFinal, setMasterPointSubFinal] = useState<any>();
  useEffect(() => {
    getPointSubFinal();
  }, []);

  async function getPointSubFinal() {
    const url = `${import.meta.env.VITE_API_LINK}/master/qc/cs/subFinal`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setMasterPointSubFinal(res.data);

      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const [qty, setQty] = useState<any>();
  const [jumlah, setJumlah] = useState<any>();
  const [kualitasLulus, setKualitasLulus] = useState<any>();
  const [kualitasTolak, setKualitasTolak] = useState<any>();

  async function tambahPointSubFinal() {
    const url = `${import.meta.env.VITE_API_LINK}/master/qc/cs/subFinal`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          quantity: qty,
          jumlah: jumlah,
          kualitas_lulus: kualitasLulus,
          kualitas_tolak: kualitasTolak,
        },
        {
          withCredentials: true,
        },
      );

      //window.location.reload();
      getPointSubFinal();
      setIsLoading(false);
      closeModalTambah();
      setQty(null);
      setJumlah(null);
      setKualitasLulus(null);
      setKualitasTolak(null);
    } catch (error: any) {
      setIsLoading(false);
      alert(error.response.data.msg);
      console.log(error);
    }
  }

  async function editPointFinal(id: any) {
    const url = `${import.meta.env.VITE_API_LINK}/master/qc/cs/subFinal/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {
          quantity: qty,
          jumlah: jumlah,
          kualitas_lulus: kualitasLulus,
          kualitas_tolak: kualitasTolak,
        },
        {
          withCredentials: true,
        },
      );

      getPointSubFinal();
      setIsLoading(false);
      closeModalTambah();
      setQty(null);
      setJumlah(null);
      setKualitasLulus(null);
      setKualitasTolak(null);
    } catch (error: any) {
      setIsLoading(false);
      alert(error.response.data.msg);
      console.log(error);
    }
  }
  async function deletePointSubFinal(id: any) {
    const url = `${import.meta.env.VITE_API_LINK}/master/qc/cs/subFinal/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.delete(
        url,

        {
          withCredentials: true,
        },
      );

      setIsLoading(false);
      getPointSubFinal();
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
          <div className="col-span-3">Qty Pcs/Pallet</div>
          <div className="col-span-3">jumlah Diperiksa</div>
          <div className="col-span-2">Kualitas Lulus</div>
          <div className="col-span-2">Kualitas Tolak</div>
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
                    Qty Pcs/Pallet
                  </label>
                  <input
                    onChange={(e) => setQty(e.target.value)}
                    type="text"
                    className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                  />
                  <label className="text-black text-sm font-bold pt-4">
                    Jumlah Yang Di Periksa
                  </label>
                  <input
                    onChange={(e) => setJumlah(e.target.value)}
                    type="text"
                    className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                  />
                  <label className="text-black text-sm font-bold pt-4">
                    Kualitas Lulus
                  </label>
                  <input
                    onChange={(e) => setKualitasLulus(e.target.value)}
                    type="text"
                    className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                  />
                  <label className="text-black text-sm font-bold pt-4">
                    Kualitas Tolak
                  </label>
                  <input
                    onChange={(e) => setKualitasTolak(e.target.value)}
                    type="text"
                    className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                  />

                  <div className="pt-4">
                    <button
                      disabled={isLoading}
                      onClick={tambahPointSubFinal}
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
      {masterPointSubFinal != null &&
        masterPointSubFinal?.map((data: any, i: number) => {
          return (
            <>
              <div className=" flex bg-white py-2 w-full mb-1 px-5 text-sm font-medium border-b-3 border-[#D8EAFF]">
                <p className="w-20">{i + 1}</p>
                <div className="grid grid-cols-12 w-full">
                  <div className="col-span-3">{data?.quantity}</div>
                  <div className="col-span-3">{data?.jumlah}</div>
                  <div className="col-span-2">{data.kualitas_lulus}</div>
                  <div className="col-span-2">{data.kualitas_tolak}</div>
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
                            Qty Pcs/Pallet
                          </label>
                          <input
                            defaultValue={data?.quantity}
                            onChange={(e) => setQty(e.target.value)}
                            type="text"
                            className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                          />
                          <label className="text-black text-sm font-bold pt-4">
                            Jumlah Yang Diperiksa
                          </label>
                          <input
                            defaultValue={data?.jumlah}
                            onChange={(e) => setJumlah(e.target.value)}
                            type="text"
                            className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                          />
                          <label className="text-black text-sm font-bold pt-4">
                            Kualitas Lulus
                          </label>
                          <input
                            defaultValue={data?.kualitas_lulus}
                            onChange={(e) => setKualitasLulus(e.target.value)}
                            type="text"
                            className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                          />
                          <label className="text-black text-sm font-bold pt-4">
                            Kualitas Tolak
                          </label>
                          <input
                            defaultValue={data?.kualitas_tolak}
                            onChange={(e) => setKualitasTolak(e.target.value)}
                            type="text"
                            className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                          />

                          <div className="pt-4">
                            <button
                              disabled={isLoading}
                              onClick={() => editPointFinal(data?.id)}
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
                              onClick={() => deletePointSubFinal(data?.id)}
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

export default PointSubFinal;
