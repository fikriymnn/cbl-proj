import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Arrow from '../../../../images/icon/arrowDown.svg';
import Burger from '../../../../images/icon/burger.svg';
import Filter from '../../../../images/icon/filter.svg';
import convertTimeStampToDateOnly from '../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../utils/converDateToTime';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import Loading from '../../../Loading';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';

function HistoryHRAllKendala() {
  const [isLoading, setIsLoading] = useState(false);
  const [openButton, setOpenButton] = useState(null);

  const [lkh, setLkh] = useState<any>();

  useEffect(() => {
    getMe();
  }, []);

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });
      getLKH(21);
      console.log('getme', res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function getLKH(id: any) {
    const url = `${import.meta.env.VITE_API_LINK}/kendalaLkhTiket`;
    try {
      const res = await axios.get(
        url,

        {
          params: {
            status_tiket: 'history',
            id_department: 21,
          },
          withCredentials: true,
        },
      );

      setLkh(res.data.data);
      console.log('lkh', res.data.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  const [showModal, setShowModal] = useState<boolean[]>([]);
  const openModalModal = (i: any) => {
    const onchangeVal: any = [...showModal];
    onchangeVal[i] = true;

    setShowModal(onchangeVal);
  };
  const closeModalModal = (i: any) => {
    const onchangeVal: any = [...showModal];
    onchangeVal[i] = false;

    setShowModal(onchangeVal);
  };

  return (
    <>
      <div className=" flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold   border-b-1 border-[#D8EAFF]">
        <p className="w-20">No</p>
        <div className="grid grid-cols-12 w-full">
          <div className="col-span-2">Waktu Masuk</div>
          <div className="col-span-2">Nama Mesin</div>
          <div className="col-span-3">Kendala</div>
          <div className="col-span-2">No. Jo</div>
          <div className="col-span-2">Operator</div>
          <div className="col-span-1 flex w-full justify-end">Action</div>
        </div>
      </div>
      {lkh?.map((data: any, i: number) => {
        const tanggal = convertTimeStampToDateOnly(data?.tanggal);
        const jam = convertDateToTime(data?.tanggal);
        return (
          <>
            <div className=" flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold rounded-md  items-center">
              <p className="w-20">{i + 1}</p>
              <div className="grid grid-cols-12 w-full text-[#6c6b6b] text-sm font-light items-center">
                <div className="col-span-2">
                  {convertTimeStampToDateOnly(data.createdAt)}
                </div>
                <div className="col-span-2">{data.mesin}</div>
                <div className="col-span-3">
                  {' '}
                  {data.kode_kendala +
                    ' - ' +
                    data.nama_kendala +
                    ' - ' +
                    data.jenis_kendala}
                </div>
                <div className="col-span-2">{data.no_jo}</div>
                <div className="col-span-2">{data.operator}</div>
                <div className="col-span-1 w-full flex justify-end">
                  <div className="flex gap-2 items-center justify-center ">
                    <div>
                      <button
                        onClick={() => openModalModal(i)}
                        className={`uppercase px-3 inline-flex rounded-[3px] items-center text-white text-xs font-bold  py-2 my-2   hover:bg-blue-400 border bg-blue-600 border-blue-600  justify-center`} // Dynamic class assignment
                      >
                        Detail
                      </button>
                      {showModal[i] == true && (
                        <>
                          <ModalKosonganSmall
                            isOpen={showModal[i]}
                            onClose={() => closeModalModal(i)}
                            judul={'Respon Tiket All Kendala'}
                          >
                            <>
                              <div className="grid grid-cols-2 px-2 py-1">
                                <div className="flex flex-col ">
                                  <p className="font-semibold text-md text-black">
                                    Jenis Kendala
                                  </p>
                                  <p className="font-semibold text-md">
                                    {data.jenis_kendala}
                                  </p>
                                  <p className="font-semibold text-md text-black">
                                    Kode Kendala
                                  </p>
                                  <p className="font-semibold text-md">
                                    {data.kode_kendala +
                                      ' - ' +
                                      data.nama_kendala}
                                  </p>
                                  <p className="font-semibold text-md text-black">
                                    Kode LKH
                                  </p>
                                  <p className="font-semibold text-md">
                                    {data.kode_lkh}
                                  </p>
                                  <p className="font-semibold text-md text-black">
                                    Operator
                                  </p>
                                  <p className="font-semibold text-md">
                                    {data.operator}
                                  </p>
                                </div>
                                <div className="flex flex-col ">
                                  <p className="font-semibold text-md text-black">
                                    Nama Produk
                                  </p>
                                  <p className="font-semibold text-md">
                                    {data.nama_produk}
                                  </p>
                                  <p className="font-semibold text-md text-black">
                                    Nama Customer
                                  </p>
                                  <p className="font-semibold text-md">
                                    {data.nama_customer}
                                  </p>
                                  <p className="font-semibold text-md text-black">
                                    No. Jo
                                  </p>
                                  <p className="font-semibold text-md">
                                    {data.no_jo}
                                  </p>
                                  <p className="font-semibold text-md text-black">
                                    No. Io
                                  </p>
                                  <p className="font-semibold text-md">
                                    {data.no_io}
                                  </p>
                                  <p className="font-semibold text-md text-black">
                                    No. So
                                  </p>
                                  <p className="font-semibold text-md">
                                    {data.no_so}
                                  </p>
                                </div>
                              </div>
                              <div className="px-2 py-1 flex flex-col gap-2">
                                <p className="font-semibold text-md">
                                  Analisis Penyebab
                                </p>
                                <textarea
                                  value={data.analisa_penyebab}
                                  readOnly
                                  className="w-full border border-neutral-600 h-20 p-2 rounded-sm"
                                  name=""
                                  id=""
                                ></textarea>
                                <p className="font-semibold text-md">
                                  Tindakan
                                </p>
                                <textarea
                                  value={data.tindakan}
                                  readOnly
                                  className="w-full border border-neutral-600 h-20 p-2 rounded-sm"
                                  name=""
                                  id=""
                                ></textarea>
                              </div>
                            </>
                          </ModalKosonganSmall>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })}
    </>
  );
}

export default HistoryHRAllKendala;
