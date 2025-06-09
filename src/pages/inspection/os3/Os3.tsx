import { useEffect, useState } from 'react';
import Burger from '../../../images/icon/burger.svg';
import Arrow from '../../../images/icon/arrowDown.svg';
import Polygon6 from '../../../images/icon/Polygon6.svg';
import X from '../../../images/icon/x.svg';
import axios from 'axios';
import ModalMtcDate from '../../../components/Modals/ModalMtcDate';
import ModalDetailOS3 from '../../../components/Modals/ModalDetailOS3';
import ModalStockCheckOs3 from '../../../components/Modals/ModalStockCheckOs3';
import React from 'react';

function TableOS3() {
  const [tiket, setTiket] = useState<any>(null);
  const [showTwoButtons, setShowTwoButtons] = useState<any>([]);
  const [showModal1, setShowModal1] = useState<any>([]);
  const [showModal2, setShowModal2] = useState(false);
  const [showModalDetail, setShowModalDetail] = useState<any>([]);
  const [showDetail, setShowDetail] = useState<boolean[]>([]);
  const [user, setUser] = useState<any>(null);

  const calculateResponTime = (startDate: any, endDate: any) => {
    const createdAtDate = new Date(startDate);
    const waktuResponDate = new Date(endDate);
    const millisecondsDiff =
      waktuResponDate.getTime() - createdAtDate.getTime();

    const secondsDiff = millisecondsDiff / 1000;
    const minutesDiff = Math.floor(secondsDiff / 60);
    const hoursDiff = Math.floor(minutesDiff / 60);

    return `${hoursDiff ? hoursDiff + ' hours ' : ''}${
      hoursDiff >= 1 ? '' : minutesDiff + ' minutes '
    }`;
  };

  const convertDatetimeToDate = (datetime: any) => {
    const dateObject = new Date(datetime);
    const day = dateObject.getDate().toString().padStart(2, '0');
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObject.getFullYear();
    const hours = dateObject.getHours().toString().padStart(2, '0');
    const minutes = dateObject.getMinutes().toString().padStart(2, '0');

    return `${year}/${month}/${day}  ${hours}:${minutes}`;
  };

  const getStatusStyle = (status: string) => {
    const baseClasses =
      'text-xs px-2 font-light rounded-xl flex justify-center';

    switch (status) {
      case 'pending':
        return `${baseClasses} text-[#DE0000] bg-[#FFB1B1]`;
      case 'open':
        return `${baseClasses} text-[#FCBF11] bg-[#FFF2B1]`;
      case 'monitoring':
        return `${baseClasses} text-[#004CDE] bg-[#B1ECFF]`;
      case 'temporary':
        return `${baseClasses} text-[#FC4911] bg-[#de85002a]`;
      default:
        return baseClasses;
    }
  };

  const getProgressStyle = (skor: number) => {
    const baseClasses =
      'text-xs px-2 font-light rounded-xl flex justify-center';

    if (skor === 100) {
      return `${baseClasses} text-[#0057FF] bg-[#B1ECFF]`;
    } else if (skor >= 60) {
      return `${baseClasses} text-green-600 bg-[#00de3f2f]`;
    } else if (skor >= 40) {
      return `${baseClasses} text-[#DE0000] bg-[#FFDBB1]`;
    } else if (skor >= 0) {
      return `${baseClasses} text-[#DE0000] bg-[#FFB1B1]`;
    }
    return baseClasses;
  };

  const getSourceData = (data: any, field: string) => {
    const sourceMap = {
      pm1: data.point_pm1,
      pm2: data.point_pm2,
      pm3: data.point_pm3,
    };

    const source = sourceMap[data.sumber as keyof typeof sourceMap];
    if (!source) return '';

    switch (field) {
      case 'hasil':
        return source.hasil;
      case 'catatan':
        return source.catatan;
      case 'inspection_point':
        return source.inspection_point;
      case 'acceptance_criteria':
        return (
          source[`inspection_task_${data.sumber}s`]?.[0]?.acceptance_criteria ||
          ''
        );
      case 'method':
        return source[`inspection_task_${data.sumber}s`]?.[0]?.method || '';
      case 'tools':
        return source[`inspection_task_${data.sumber}s`]?.[0]?.tools || '';
      case 'task':
        return source[`inspection_task_${data.sumber}s`]?.[0]?.task || '';
      default:
        return '';
    }
  };

  const handleClick = (i: number) => {
    setShowTwoButtons((prev: any) =>
      prev.map((item: boolean, index: number) => (index === i ? !item : false)),
    );
  };

  const handleClickDetail = (index: number) => {
    setShowDetail((prevState) => {
      const updatedShowDetail = [...prevState];
      updatedShowDetail[index] = !updatedShowDetail[index];
      return updatedShowDetail;
    });
  };

  const openModal1 = (i: number) => {
    const onchangeVal = [...showModal1];
    onchangeVal[i] = true;
    setShowModal1(onchangeVal);
  };

  const closeModal1 = (i: number) => {
    const onchangeVal = [...showModal1];
    onchangeVal[i] = false;
    setShowModal1(onchangeVal);
  };

  const openModal2 = () => setShowModal2(true);
  const closeModal2 = () => setShowModal2(false);

  const openModalDetail = (i: number) => {
    const onchangeVal = [...showModalDetail];
    onchangeVal[i] = true;
    setShowModalDetail(onchangeVal);
  };

  const closeModalDetail = (i: number) => {
    const onchangeVal = [...showModalDetail];
    onchangeVal[i] = false;
    setShowModalDetail(onchangeVal);
  };

  const getUser = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_LINK}/me`, {
        withCredentials: true,
      });
      setUser(res.data);
    } catch (error: any) {
      console.log(error.response);
    }
  };

  const getTiket = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/ticketOs3?bagian_tiket=os3`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setTiket(res.data);

      const initialState = new Array(res.data.length).fill(false);
      setShowModal1(initialState);
      setShowModalDetail(initialState);
      setShowTwoButtons(initialState);
      setShowDetail(initialState);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.response);
    }
  };

  const responMTC = async (id: number) => {
    const url = `${import.meta.env.VITE_API_LINK}/ticketOs3/respon/${id}`;
    try {
      await axios.get(url, {
        withCredentials: true,
      });
      alert('proses berhasil');
      getTiket();
    } catch (error: any) {
      console.log(error.response);
      alert('error');
    }
  };

  const reworkTiket = async (idTiket: number) => {
    const url = `${import.meta.env.VITE_API_LINK}/ticketOs3/rework/${idTiket}`;
    try {
      const res = await axios.put(
        url,
        { id_eksekutor: user.id },
        { withCredentials: true },
      );
      alert(res.data.msg);
      getTiket();
    } catch (error: any) {
      alert(error.data.msg);
    }
  };

  useEffect(() => {
    getTiket();
    getUser();
  }, []);

  if (!tiket) return null;

  return (
    <main>
      <div className="bg-white mt-2">
        <table className="w-full border-collapse">
          <thead>
            <tr className="py-2">
              <th className="px-5 text-xs font-bold text-left py-2">No</th>
              <th className="px-2 text-xs font-bold text-left py-2">
                <div className="flex gap-2 items-center">
                  <span>Kode Tiket</span>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">
                <div className="flex gap-2 items-center">
                  <span>Sumber</span>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">
                <div className="flex gap-2 items-center">
                  <span>Mesin</span>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">
                <div className="flex gap-2 items-center">
                  <span>Kendala</span>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">
                <div className="flex gap-2 items-center">
                  <span>Indikator</span>
                  <img className="w-2" src={Polygon6} alt="" />
                </div>
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">Status</th>
              <th className="px-2 text-xs font-bold text-left py-2">
                Persentase
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">
                Inspektor PM
              </th>
              <th className="px-2 text-xs font-bold text-left py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {tiket.map((data: any, i: number) => {
              const lengthProses = data.proses_mtc_os3s.length - 1;
              const dateMtc = convertDatetimeToDate(data.createdAt);
              const waktuRespon = calculateResponTime(
                data.createdAt,
                data.waktu_respon,
              );

              // Function to get inspector name based on PM type in sumber
              const getInspectorName = (data: any) => {
                const sumber = data.sumber?.toLowerCase() || '';

                if (sumber.includes('pm1') || sumber.includes('pm 1')) {
                  return data.point_pm1?.ticket_pm1?.inspector?.nama || '-';
                } else if (sumber.includes('pm2') || sumber.includes('pm 2')) {
                  return data.point_pm2?.ticket_pm2?.inspector?.nama || '-';
                } else if (sumber.includes('pm3') || sumber.includes('pm 3')) {
                  return data.point_pm3?.ticket_pm3?.inspector?.nama || '-';
                } else {
                  // Fallback: check which PM data exists
                  if (data.point_pm1?.ticket_pm1?.inspector?.nama) {
                    return data.point_pm1.ticket_pm1.inspector.nama;
                  } else if (data.point_pm2?.ticket_pm2?.inspector?.nama) {
                    return data.point_pm2.ticket_pm2.inspector.nama;
                  } else if (data.point_pm3?.ticket_pm3?.inspector?.nama) {
                    return data.point_pm3.ticket_pm3.inspector.nama;
                  }
                  return '-';
                }
              };

              return (
                <React.Fragment key={i}>
                  <tr className="bg-white border-b-5 border-blue">
                    <td className="py-3 px-6 text-center">{i + 1}</td>

                    <td className="px-2 py-3">
                      <p className="text-xs font-light">{data.kode_tiket}</p>
                    </td>

                    <td className="px-2 py-3">
                      <p className="text-xs font-light">{data.sumber}</p>
                    </td>

                    <td className="px-2 py-3">
                      <p className="text-xs font-light">{data.nama_mesin}</p>
                    </td>

                    <td className="px-2 py-3">
                      <p className="text-xs font-light"></p>
                    </td>

                    <td className="px-2 py-3">
                      <div className="flex items-center">
                        <div className="w-4 flex justify-center items-center">
                          <img src={X} alt="" />
                        </div>
                        <p className="text-xs px-1 font-light rounded-xl flex justify-center items-center">
                          {getSourceData(data, 'hasil')}
                        </p>
                      </div>
                    </td>

                    <td className="px-2 py-3">
                      <p className={getStatusStyle(data.status_tiket)}>
                        {data.status_tiket}
                      </p>
                    </td>

                    <td className="px-2 py-3">
                      <p className={getStatusStyle(data.status_tiket)}>
                        {data.skor_mtc}%
                      </p>
                    </td>

                    <td className="px-2 py-3">
                      <p className="text-xs font-light">
                        {getInspectorName(data)}
                      </p>
                    </td>

                    <td className="px-2 py-3">
                      <div className="flex gap-2 items-center relative">
                        <div>
                          <button
                            title="button"
                            className="text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                            onClick={() => handleClick(i)}
                          >
                            <img src={Burger} alt="" className="mx-3" />
                          </button>

                          {showTwoButtons[i] && (
                            <div className="absolute bg-white p-3 shadow-5 rounded-md z-10 top-full left-0 mt-1">
                              <div className="flex flex-col gap-1">
                                {data.status_tiket !== 'monitoring' && (
                                  <button
                                    onClick={() => {
                                      if (!data.waktu_mulai_mtc) {
                                        responMTC(data.id);
                                      } else if (
                                        data.status_tiket === 'open' ||
                                        data.status_tiket === 'pending'
                                      ) {
                                        openModal1(i);
                                      } else {
                                        reworkTiket(data.id);
                                      }
                                    }}
                                    className="w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                  >
                                    PROSES
                                  </button>
                                )}

                                <button
                                  onClick={openModal2}
                                  className="w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                                >
                                  JADWALKAN
                                </button>
                              </div>

                              {showModal1[i] && (
                                <ModalStockCheckOs3
                                  children={undefined}
                                  isOpen={showModal1[i]}
                                  onClose={() => closeModal1(i)}
                                  onFinish={getTiket}
                                  kendala="data.nama_kendala"
                                  kodeLkh="data.kode_lkh"
                                  machineName={data.nama_mesin}
                                  tgl={data.waktu_respon}
                                  jam="19.09"
                                  namaPemeriksa={
                                    data.proses_mtc_os3s[lengthProses]
                                      ?.user_eksekutor.nama
                                  }
                                  no="109299"
                                  idTiket={data.id}
                                  idProses={
                                    data.proses_mtc_os3s[lengthProses]?.id
                                  }
                                  namaMesin={data.nama_mesin}
                                />
                              )}

                              {showModal2 && (
                                <ModalMtcDate
                                  isOpen={showModal2}
                                  onClose={closeModal2}
                                  machineName="GMC Printer 2"
                                >
                                  <p></p>
                                </ModalMtcDate>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <button
                            title="button"
                            onClick={() => handleClickDetail(i)}
                            className="text-xs font-bold text-blue-700 bg-blue-700 py-2 border-blue-700 border rounded-md"
                          >
                            <img src={Arrow} alt="" className="mx-3" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {data.proses_mtc_os3s.length > 0 && showDetail[i] && (
                    <tr>
                      <td colSpan={10} className="px-0 py-0">
                        <div className="w-full flex flex-col bg-[#E9F3FF] rounded-lg">
                          <div className="flex px-5 py-2">
                            <div className="flex flex-col gap-2 w-2/12">
                              <p className="text-xs font-bold">Waktu Temuan</p>
                            </div>
                            <div className="grid grid-cols-6 gap-3 w-10/12">
                              {[
                                'Pengerjaan Ke',
                                'Waktu',
                                'Eksekutor',
                                'Progress Perbaikan',
                                'Jenis Perbaikan',
                                '',
                              ].map((header) => (
                                <div
                                  key={header}
                                  className="flex flex-col gap-2"
                                >
                                  <p className="text-xs font-bold">{header}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex px-5 pb-4">
                            <div className="flex flex-col gap-2 w-2/12">
                              <div>
                                <p className="text-xs font-medium">{dateMtc}</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold">
                                  Waktu Respon
                                </p>
                                <p className="text-xs font-medium">
                                  {waktuRespon}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-6 gap-3 w-10/12">
                              {data.proses_mtc_os3s.map(
                                (proses: any, ii: number) => {
                                  const tglMulaiMtc = convertDatetimeToDate(
                                    proses.waktu_mulai_mtc,
                                  );

                                  return (
                                    <div key={ii} className="contents">
                                      <div className="flex flex-col gap-2">
                                        <h5 className="text-xs font-medium">
                                          {ii + 1}
                                        </h5>
                                      </div>

                                      <div className="flex flex-col gap-2">
                                        <p className="text-xs font-medium">
                                          {tglMulaiMtc}
                                        </p>
                                      </div>

                                      <div className="flex flex-col gap-2">
                                        <p className="text-xs font-medium">
                                          {proses.user_eksekutor.nama}
                                        </p>
                                      </div>

                                      <div className="flex flex-col gap-2">
                                        <div className="flex">
                                          <p
                                            className={getProgressStyle(
                                              proses.skor_mtc,
                                            )}
                                          >
                                            {proses.skor_mtc}%
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex flex-col gap-2">
                                        <p className="text-xs font-medium">
                                          {proses.cara_perbaikan}
                                        </p>
                                      </div>

                                      <div>
                                        <button
                                          onClick={() => openModalDetail(ii)}
                                          className="text-xs font-bold bg-blue-700 py-1 px-5 text-white rounded-md"
                                        >
                                          Detail
                                        </button>
                                      </div>

                                      {showModalDetail[ii] && (
                                        <ModalDetailOS3
                                          children={undefined}
                                          isOpen={showModalDetail[ii]}
                                          onClose={() => closeModalDetail(ii)}
                                          kendala={getSourceData(
                                            data,
                                            'inspection_point',
                                          )}
                                          machineName={data.nama_mesin}
                                          tgl={dateMtc}
                                          namaPemeriksa={
                                            proses.user_eksekutor.nama
                                          }
                                          no="1"
                                          idTiket={data.id}
                                          kodeLkh={data.kode_lkh}
                                          analisisPenyebab={`${proses.kode_analisis_mtc} - ${proses.nama_analisis_mtc}`}
                                          kebutuhanSparepart="undefined"
                                          tipeMaintenance={
                                            proses.cara_perbaikan
                                          }
                                          catatan={getSourceData(
                                            data,
                                            'catatan',
                                          )}
                                          inspection_point={getSourceData(
                                            data,
                                            'inspection_point',
                                          )}
                                          acceptance_criteria={getSourceData(
                                            data,
                                            'acceptance_criteria',
                                          )}
                                          inspection_method={getSourceData(
                                            data,
                                            'method',
                                          )}
                                          tools={getSourceData(data, 'tools')}
                                          sumber={data.sumber}
                                          indikator={getSourceData(
                                            data,
                                            'hasil',
                                          )}
                                          task_list={getSourceData(
                                            data,
                                            'task',
                                          )}
                                        />
                                      )}
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default TableOS3;
