import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ModalAddPeriode from '../../../../Modals/Qc/ModalAddPeriode';
import Loading from '../../../../Loading';

function PointFinal() {
  const [isLoading, setIsLoading] = useState(false);

  const [masterPointFinal, setMasterPointFinal] = useState<any>();
  useEffect(() => {
    getPointFinal();
  }, []);

  async function getPointFinal() {
    const url = `${import.meta.env.VITE_API_LINK}/master/qc/cs/pointFinal`;
    try {
      const res = await axios.get(url, {
        params: {
          status: 'active',
        },
        withCredentials: true,
      });

      setMasterPointFinal(res.data);

      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const [Point, setPoint] = useState<any>();
  const [standar, setStandar] = useState<any>();
  const [caraPeriksa, setCaraPeriksa] = useState<any>();

  async function tambahPointFinal() {
    const url = `${import.meta.env.VITE_API_LINK}/master/qc/cs/pointFinal`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          point: Point,
          standar: standar,
          cara_periksa: caraPeriksa,
        },
        {
          withCredentials: true,
        },
      );

      //window.location.reload();
      getPointFinal();
      setIsLoading(false);
      closeModalTambah();
      setPoint(null);
      setStandar(null);
      setCaraPeriksa(null);
    } catch (error: any) {
      setIsLoading(false);
      alert(error.response.data.msg);
      console.log(error);
    }
  }

  async function editPointFinal(id: any) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/qc/cs/pointFinal/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {
          point: Point,
          standar: standar,
          cara_periksa: caraPeriksa,
        },
        {
          withCredentials: true,
        },
      );

      getPointFinal();
      setIsLoading(false);
      setPoint(null);
      setStandar(null);
      setCaraPeriksa(null);
    } catch (error: any) {
      setIsLoading(false);
      alert(error.response.data.msg);
      console.log(error);
    }
  }
  async function deletePointFinal(id: any) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/master/qc/cs/pointFinal/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.delete(
        url,

        {
          withCredentials: true,
        },
      );

      setIsLoading(false);
      getPointFinal();
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
          <div className="col-span-3">Point</div>
          <div className="col-span-3">Standar</div>
          <div className="col-span-4">Cara Periksa</div>
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
                    Point
                  </label>
                  <input
                    onChange={(e) => setPoint(e.target.value)}
                    type="text"
                    className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                  />
                  <label className="text-black text-sm font-bold pt-4">
                    Standar
                  </label>
                  <input
                    onChange={(e) => setStandar(e.target.value)}
                    type="text"
                    className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                  />
                  <label className="text-black text-sm font-bold pt-4">
                    Cara Periksa
                  </label>
                  <input
                    onChange={(e) => setCaraPeriksa(e.target.value)}
                    type="text"
                    className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                  />

                  <div className="pt-4">
                    <button
                      disabled={isLoading}
                      onClick={tambahPointFinal}
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
      {masterPointFinal != null &&
        masterPointFinal?.map((data: any, i: number) => {
          return (
            <>
              <div className=" flex bg-white py-2 w-full mb-1 px-5 text-sm font-medium border-b-3 border-[#D8EAFF]">
                <p className="w-20">{i + 1}</p>
                <div className="grid grid-cols-12 w-full">
                  <div className="col-span-3">{data?.point}</div>
                  <div className="col-span-3">{data?.standar}</div>
                  <div className="col-span-4">{data.cara_periksa}</div>
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
                            Point
                          </label>
                          <input
                            defaultValue={data?.point}
                            onChange={(e) => setPoint(e.target.value)}
                            type="text"
                            className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                          />
                          <label className="text-black text-sm font-bold pt-4">
                            Standar
                          </label>
                          <input
                            defaultValue={data?.standar}
                            onChange={(e) => setStandar(e.target.value)}
                            type="text"
                            className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                          />
                          <label className="text-black text-sm font-bold pt-4">
                            Cara Periksa
                          </label>
                          <input
                            defaultValue={data?.cara_periksa}
                            onChange={(e) => setCaraPeriksa(e.target.value)}
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
                              onClick={() => deletePointFinal(data?.id)}
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

export default PointFinal;
