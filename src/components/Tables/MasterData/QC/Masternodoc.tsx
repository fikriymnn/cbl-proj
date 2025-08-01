import axios from 'axios';
import React, { useEffect, useState } from 'react';
import ModalAddPeriode from '../../../Modals/Qc/ModalAddPeriode';
import Loading from '../../../Loading';

function MasterNoDoc() {
  const [isLoading, setIsLoading] = useState(false);

  const [masterPointFinal, setMasterPointFinal] = useState<any>();
  useEffect(() => {
    getPointFinal();
  }, []);

  async function getPointFinal() {
    const url = `${import.meta.env.VITE_API_LINK}/master/qc/cs/kodeDoc`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setMasterPointFinal(res.data);

      console.log(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  const [Point, setPoint] = useState<any>();

  async function editPointFinal(id: any, i: any) {
    const url = `${import.meta.env.VITE_API_LINK}/master/qc/cs/kodeDoc/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {
          kode: Point,
        },
        {
          withCredentials: true,
        },
      );
      closeEdit(i);
      getPointFinal();
      setIsLoading(false);
      setPoint(null);
    } catch (error: any) {
      setIsLoading(false);
      alert(error.response.data.msg);
      console.log(error);
    }
  }

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

  return (
    <>
      <div className=" flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold rounded-m">
        <p className="w-20">No</p>
        <div className="grid grid-cols-12 w-full">
          <div className="col-span-3">Checksheet</div>
          <div className="col-span-3">Kode</div>
        </div>
      </div>
      {masterPointFinal != null &&
        masterPointFinal?.data.map((data: any, i: number) => {
          return (
            <>
              <div className=" flex bg-white py-2 w-full mb-1 px-5 text-sm font-medium border-b-3 border-[#D8EAFF]">
                <p className="w-20">{i + 1}</p>
                <div className="grid grid-cols-12 w-full">
                  <div className="col-span-3">{data?.inspeksi_name}</div>
                  <div className="col-span-3">{data?.kode}</div>

                  <div className="col-span-6 flex gap-3 justify-end">
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
                            KODE
                          </label>
                          <input
                            defaultValue={data?.kode}
                            onChange={(e) => setPoint(e.target.value)}
                            type="text"
                            className="w-full h-7 self-stretch p-4 bg-white rounded-md  border-2 border-stroke justify-start items-center gap-4 inline-flex"
                          />

                          <div className="pt-4">
                            <button
                              disabled={isLoading}
                              onClick={() => editPointFinal(data?.id, i)}
                              className="rounded-md justify-center items-center w-full h-10 bg-blue-600 text-white font-semibold text-sm"
                            >
                              {isLoading ? 'Loading...' : 'SIMPAN'}
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

export default MasterNoDoc;
