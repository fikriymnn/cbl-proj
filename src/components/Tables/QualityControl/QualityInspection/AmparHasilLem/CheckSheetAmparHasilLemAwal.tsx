import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../../utils/converDateToTime';
import calculateElapsedTime from '../../../../../utils/calculateElapsedTime';
import formatElapsedTime from '../../../../../utils/formatElapsedTime';
import Loading from '../../../../Loading';
import ModalAddPeriode from '../../../../Modals/Qc/ModalAddPeriode';
import Select from 'react-select';
import convertTimeStampToDateTime from '../../../../../utils/converDateTime';

function CheckSheetHasilRabut() {
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [RabutMesin, setRabutMesin] = useState<any>();

  const [Catatan, setCatatan] = useState<any>();
  const [idDefect, setIdDefect] = useState<any>();

  const [showModal2, setShowModal2] = useState(false);
  const [add, setAdd] = useState<any>();

  const [showDetail, setShowDetail] = useState<boolean[]>(
    new Array(add != null && add.length).fill(false),
  );

  useEffect(() => {
    getRabutMesin();
    getMasterDefect();
    fetchMasterWaste();
  }, []);

  async function getRabutMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiAmparLem/${id}`;
    try {
      setIsLoading(true)
      const res = await axios.get(url, {
        withCredentials: true,
      });
      getKendalaByJO(res.data.data.no_jo)
      setIsLoading(false)
      setRabutMesin(res.data);
      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false)
      console.log(error.data.msg);
    }
  }
  const [options, setOptions] = useState<any>([]); // Options for the first dropdown
  const [secondOptions, setSecondOptions] = useState<any>([]); // Filtered options for the second dropdown
  const [defectMaster, setDefectMaster] = useState<any>([]); // Full data for the first dropdown
  const [selectedOption, setSelectedOption] = useState<any>(null); // Selected option from the first dropdown
  const [selectedSecondOption, setSelectedSecondOption] = useState<any>(null);
  const [masterWaste, setMasterWaste] = useState<any>([]);
  const [wasteSelectLkh, setwasteSelectLkh] = useState<any>([]);
  const [wasteSelectCode, setwasteSelectCode] = useState<any>([]);
  const [tujuanDepartment, settujuanDepartment] = useState<any>([]);

  async function getMasterDefect() {
    const url = `${import.meta.env.VITE_API_LINK_P1
      }/api/list-kendala?criteria=true`;

    try {
      const res = await axios.get(url);
      setDefectMaster(res.data); // Save raw data for filtering
      setOptions(
        res.data.map((item: any) => ({
          value: item.e_kode_produksi,
          label: `${item.e_kode_produksi} - ${item.nama_kendala}`,
        }))
      );
      //console.log('master defect', res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function fetchMasterWaste() {
    const url2 = `${import.meta.env.VITE_API_LINK_P1}/api/master-waste`;

    try {
      const res = await axios.get(url2);
      setMasterWaste(res.data.waste); // Save raw data for filtering
      //console.log("Master Waste Data:", res.data.waste);
    } catch (error: any) {
      console.error("Error fetching master waste:", error);
    }
  }

  const [kendalaByJo, setkendalaByJo] = useState<any>([]);
  async function getKendalaByJO(noJO: any) {
    const url = `${import.meta.env.VITE_API_LINK_P1
      }/api/get-kendala-by-jo/${noJO}`;

    try {
      const res = await axios.get(url);
      setkendalaByJo(res.data.data)
      console.log('kendala by jo', res.data.data);
    } catch (error: any) {
      console.log(error);
    }
  }
  const handleChangePointSelect1 = (selected: any) => {
    const { value } = selected;

    const filteredWaste = masterWaste.filter((item: any) => item.kode_waste === value);
    const filteredDefect = defectMaster.filter((item: any) => item.e_kode_produksi === value);

    const firstFilteredItemDefect = filteredDefect[0];
    console.log(firstFilteredItemDefect.i_id)
    setIdDefect(firstFilteredItemDefect);
    console.log(firstFilteredItemDefect.target_department)
    settujuanDepartment(firstFilteredItemDefect.target_department)
    if (filteredWaste.length > 0) {
      const firstFilteredItem = filteredWaste[0]; // Take the first item from filtered data

      // Map waste items to dropdown options, ensuring waste exists
      const allSecondOptions = firstFilteredItem.waste?.map((wasteItem: any) => ({
        value: wasteItem.i_kendala,
        label: `${wasteItem.kode_kendala} - ${wasteItem.kendala_desc}`,
      })) || [];

      console.log("All Second Options:", allSecondOptions);

      // Handle the first waste item safely
      if (firstFilteredItem.waste && firstFilteredItem.waste.length > 0) {
        const firstWasteItem = firstFilteredItem.waste[0]; // Take the first waste item

        const wasteLkh = firstWasteItem?.kendala_desc || ""; // Default to empty string if undefined
        const wasteCode = firstWasteItem?.kode_kendala || ""; // Default to empty string if undefined

        console.log("First Waste LKH:", wasteLkh);
        console.log("First Waste Code:", wasteCode);

        setwasteSelectLkh(wasteLkh);
        setwasteSelectCode(wasteCode);
      } else {
        console.warn("No waste items found in the firstFilteredItem.");
        setwasteSelectLkh("");
        setwasteSelectCode("");
      }

      // Update states
      setSelectedOption(selected);
      setSecondOptions(allSecondOptions); // Set initial options to the first waste item
      setSelectedSecondOption(null); // Reset the second dropdown selection
    } else {
      console.warn("No matching waste found for kode_waste:", value);
      setSelectedOption(selected);
      // Reset states when no data matches
      setSecondOptions([]);
      setSelectedSecondOption(null);
      setwasteSelectLkh("");
      setwasteSelectCode("");
    }
  };

  const handleChangePointSelect2 = (selected: any) => {
    console.log("Selected Second Option:", selected);
    setSelectedSecondOption(selected);

  };

  async function startTaskRabut(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiAmparLemPoint/start/${id}`;
    try {
      setIsLoading(true)
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );
      setIsLoading(false)
      getRabutMesin();
    } catch (error: any) {
      console.log(error);
      setIsLoading(false)
      alert(error.response.data.msg);
    }
  }

  async function stopTaskRabut(
    id: number,
    startTime: any,
    catatan: any,
    qty_pallet: any,
    data_defect: any,

  ) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiAmparLemPoint/stop/${id}`;
    try {
      setIsLoading(true)
      const elapsedSeconds = calculateElapsedTime(startTime, new Date());
      console.log(elapsedSeconds);
      const res = await axios.put(
        url,
        {
          catatan: catatan,
          lama_pengerjaan: elapsedSeconds,
          qty_pallet,
          data_defect,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false)
      getRabutMesin();
    } catch (error: any) {
      setIsLoading(false)
      console.log(error.response.data.msg);
      alert('Parameter Wajib Diisi');
    }
  }

  async function tambahTaskRabut(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiAmparLemPoint/create`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_inspeksi_ampar_lem: id,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getRabutMesin();
    } catch (error: any) {
      alert(error.data.msg);
    }
  }

  async function doneRabut(id: number) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiAmparLem/done/${id}`;
    try {
      setIsLoading(true)
      const res = await axios.put(
        url,
        {
          catatan: Catatan,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false)
      getRabutMesin();
    } catch (error: any) {
      setIsLoading(false)
      console.log(error);
    }
  }

  // async function pendingRabut(id: number) {
  //   const url = `${
  //     import.meta.env.VITE_API_LINK
  //   }/qc/cs/inspeksiAmparLem/pending/${id}`;
  //   try {
  //     const res = await axios.put(
  //       url,
  //       {},
  //       {
  //         withCredentials: true,
  //       },
  //     );

  //     getRabutMesin();
  //   } catch (error: any) {
  //     console.log(error.data.msg);
  //   }
  // }

  async function tambahDefectPeriode(
    id: number,
    idDefect: number,
    idPoint: number,
    index: number,
    kodeLkh: any,
    masalahLkh: any
  ) {
    const url = `${import.meta.env.VITE_API_LINK
      }/qc/cs/inspeksiAmparLemPoint/createDefect`;
    try {
      setIsLoading(true)
      const res = await axios.post(
        url,

        {
          id_inspeksi_ampar_lem: id,
          id_inspeksi_ampar_lem_point: idPoint,
          MasterDefect: idDefect,
          target_department: tujuanDepartment,
          kode_lkh: kodeLkh,
          masalah_lkh: masalahLkh
        },

        {
          withCredentials: true,
        },
      );

      setShowModal2(false);
      handleClickAdd(index);
      setIdDefect(null);
      setIsLoading(false)
      getRabutMesin();
    } catch (error: any) {
      setIsLoading(false)
      console.log(error);
    }
  }
  const handleChangePointDepatment = (selected: any, i: number) => {
    const { value } = selected;
    const filteredData = defectMaster.find(
      (item: any) => item.i_id == value,
      // item.id.includes(parseInt(value));
    );

    console.log(filteredData?.i_id);

    setIdDefect(filteredData);
  };
  const handleClickAdd = (index: number) => {
    setShowDetail((prevState) => {
      const updatedShowDetail = [...prevState]; // Create a copy
      updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
      return updatedShowDetail;
    });
  };

  const handleChangePoint = (e: any, i: number, ii: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = RabutMesin;
    onchangeVal.data.inspeksi_ampar_lem_point[i].inspeksi_ampar_lem_defect[ii][
      name
    ] = value;
    setRabutMesin(onchangeVal);
  };

  const handleChangeRabutPoint = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = RabutMesin;
    onchangeVal.data.inspeksi_ampar_lem_point[i][name] = value;
    setRabutMesin(onchangeVal);
    console.log(onchangeVal);
  };

  const tanggal = convertTimeStampToDateOnly(RabutMesin?.data?.createdAt);
  const jam = convertDateToTime(RabutMesin?.data?.createdAt);

  const jumlahWaktuCheck = formatElapsedTime(RabutMesin?.data?.waktu_check);

  const [openGuide, setOpenGuide] = useState(null);
  const handleClickGuide = (index: any) => {
    setOpenGuide((prevState: any) => {
      return prevState === index ? null : index;
    });
  };
  return (
    <>

      <main className="overflow-x-hidden">
        {isLoading && <Loading />}
        <form action="" onSubmit={(e) => {
          e.preventDefault()
          console.log(RabutMesin);
          doneRabut(RabutMesin?.data.id)
        }}>
          <div className="min-w-[700px] bg-white rounded-xl">
            <p className="text-[14px] font-semibold w-full flex border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12ZM13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8ZM13 17V11H11V17H13Z"
                  fill="#0065DE"
                />
              </svg>{' '}
              Ampar Lem Checksheet
            </p>

            <div className="grid grid-cols-12  border-b-8 border-[#D8EAFF]">
              <div className="grid grid-rows-6 gap-2 col-span-2 pl-6 py-4 ">
                <label className="text-neutral-500 text-sm font-semibold">
                  Tanggal
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  No. JO
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  No. IO
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  Nama Produk
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Customer
                </label>

              </div>
              <div className="grid grid-rows-6 gap-2 col-span-2  py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {tanggal}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {RabutMesin?.data?.no_jo}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {RabutMesin?.data?.no_io}
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  : {RabutMesin?.data?.nama_produk}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {RabutMesin?.data?.customer}
                </label>
              </div>

              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Jam
                </label>
                <label className="text-neutral-500 text-sm font-semibold"></label>
              </div>
              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {jam}
                </label>
                <label className="text-neutral-500 text-sm font-semibold"></label>
              </div>
              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Shift
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  Mesin
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Operator
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Status Jo
                </label>
              </div>
              <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {RabutMesin?.data?.shift}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {RabutMesin?.data?.mesin}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {RabutMesin?.data?.operator}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {RabutMesin?.data?.status_jo}
                </label>
              </div>
            </div>

            {/* =============================chekcsheet========================= */}
            {RabutMesin?.data?.inspeksi_ampar_lem_point?.map(
              (data: any, index: number) => {
                const lamaPengerjaan = formatElapsedTime(data.lama_pengerjaan);
                return (
                  <>
                    <label
                      className="text-blue-400 text-sm font-semibold  w-full flex justify-end px-4 py-2"
                      onClick={() => handleClickGuide(index)}
                    >
                      History Kendala JO
                    </label>
                    {openGuide == index ? (
                      <div className="  rounded-md bg-[#F3F3F3] border-gray flex px-5 mx-5 py-6 justify-between">
                        <div className="grid grid-cols-1">
                          <div className="flex flex-col">
                            <label className="text-blue-600 text-sm font-semibold pb-6">
                              Daftar Kendala : {RabutMesin?.data?.no_jo}
                            </label>
                            <div className='grid grid-cols-12 gap-2'>
                              <label
                                className="text-stone-600 text-sm font-semibold ">
                                No
                              </label>

                              <label
                                className="text-stone-600 text-sm font-semibold col-span-3">
                                Tanggal Produksi
                              </label>
                              <label
                                className="text-stone-600 text-sm font-semibold col-span-2">
                                Durasi
                              </label>
                              <label
                                className="text-stone-600 text-sm font-semibold col-span-4">
                                Kendala
                              </label>

                            </div>
                            {kendalaByJo?.map((data: any, i: any) => (
                              <>
                                <div key={i} className='flex flex-col'>
                                  <div className='grid grid-cols-12 gap-2'>
                                    <label
                                      className="text-stone-600 text-sm  ">
                                      {i + 1}.
                                    </label>

                                    <label
                                      className="text-stone-600 text-sm  col-span-3">
                                      {data.tgl_produksi}
                                    </label>
                                    <label
                                      className="text-stone-600 text-sm  col-span-2">
                                      {data.durasi}
                                    </label>
                                    <label
                                      className="text-stone-600 text-sm  col-span-4">
                                      {data.kode_kendala} - {data.nama_kendala}
                                    </label>

                                  </div>
                                </div>
                              </>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                    <div className="flex flex-col py-6 px-10 ">
                      <div className=" grid grid-cols-6 w-full  gap-2">
                        <div className="w-11/12">
                          <label className="text-neutral-500 text-sm font-semibold w-10/12">
                            QTY PALET KE {index + 1}
                          </label>
                        </div>
                        <div>
                          <label className="text-neutral-500 text-sm font-semibold ">
                            PARAMETER
                          </label>
                          {data.status == 'done' ? (
                            <input
                              name="qty_pallet"
                              defaultValue={data.qty_pallet}
                              disabled
                              onChange={(e) => handleChangeRabutPoint(e, index)}
                              type="text"
                              className="px-1 border rounded border-strokedark w-10/12"
                            />
                          ) : data.status == 'on progress' ? (
                            <input
                              required
                              name="qty_pallet"
                              onChange={(e) => handleChangeRabutPoint(e, index)}
                              type="text"
                              className="px-1 border rounded border-strokedark w-10/12"
                            />
                          ) : null}
                        </div>
                        <div className="flex flex-col">
                          <label className="text-neutral-500 text-sm font-semibold ">
                            INSPEKTOR
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold ">
                            {data.inspektor?.nama}
                          </label>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-neutral-500 text-sm font-semibold ">
                            WAKTU
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold ">
                            {lamaPengerjaan}
                          </label>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-neutral-500 text-sm font-semibold ">
                            Time :
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold ">
                            {convertTimeStampToDateTime(data.waktu_mulai)}
                          </label>
                        </div>
                        <div className="flex flex-col ">
                          <>
                            <div className="flex flex-col ">
                              <p className="md:text-[14px] text-[9px] font-semibold">
                                Upload Foto (Optional):
                              </p>

                              <div className="">
                                <input
                                  disabled
                                  type="file"
                                  name=""
                                  id=""
                                  className="w-40"
                                />
                              </div>
                            </div>
                          </>
                        </div>
                        <div className="flex flex-col ">
                          <>
                            {data.status == 'incoming' ? (
                              <>
                                <p className="font-bold text-[#DE0000]">
                                  Task Belum Dimulai
                                </p>
                                <button
                                  disabled={isLoading}
                                  onClick={() => {
                                    startTaskRabut(data.id);
                                  }}
                                  className="flex w-full  rounded-md bg-[#00B81D] justify-center items-center px-2 py-2 hover:cursor-pointer"
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12.7645 4.95136L3.63887 0.27536C1.96704 -0.581285 0 0.664567 0 2.58008V11.4199C0 13.3354 1.96704 14.5813 3.63887 13.7246L12.7645 9.04864C14.4118 8.20456 14.4118 5.79544 12.7645 4.95136Z"
                                      fill="white"
                                    />
                                  </svg>
                                </button>
                              </>
                            ) : data.status == 'on progress' ? (
                              <>
                                <p className="font-bold text-green-600">
                                  Task Dimulai
                                </p>
                                <p className="font-semibold">
                                  Time :  {convertTimeStampToDateTime(data.waktu_mulai)}
                                </p>
                                <button
                                  disabled={isLoading}
                                  onClick={() => {
                                    console.log(RabutMesin.data);
                                    stopTaskRabut(
                                      data.id,
                                      data.waktu_mulai,
                                      data.catatan,
                                      data.qty_pallet,
                                      data.inspeksi_ampar_lem_defect,
                                    );
                                  }}
                                  className="flex w-full  rounded-md bg-red-600 justify-center items-center px-2 py-2 hover:cursor-pointer"
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 14 14"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M12.7645 4.95136L3.63887 0.27536C1.96704 -0.581285 0 0.664567 0 2.58008V11.4199C0 13.3354 1.96704 14.5813 3.63887 13.7246L12.7645 9.04864C14.4118 8.20456 14.4118 5.79544 12.7645 4.95136Z"
                                      fill="white"
                                    />
                                  </svg>
                                </button>
                              </>
                            ) : null}
                          </>
                        </div>
                      </div>
                    </div>
                    <div className="flex">
                      {data?.inspeksi_ampar_lem_defect?.map(
                        (data2: any, i: number) => {
                          return (
                            <div className="flex flex-col py-4 px-4 justify-between max-w-[15%]">
                              <label className=" text-[#6c6b6b] text-sm font-semibold line-clamp-4">
                                {data2.kode} - {data2.masalah}
                              </label>
                              {(data2.kode_lkh == '' || data2.kode_lkh == null) ? <></> :
                                <>
                                  <label className=" text-[#6c6b6b] text-sm font-semibold">
                                    Dengan : {data2.kode_lkh} - {data2.masalah_lkh}
                                  </label>

                                </>
                              }
                              {data.status == 'done' ? (
                                <input

                                  type="text"
                                  name="hasil"
                                  defaultValue={data2.hasil}
                                  disabled
                                  onChange={(e) =>
                                    handleChangePoint(e, index, i)
                                  }
                                  className="px-1 max-h-7 border rounded border-strokedark w-full"
                                />
                              ) : data.status == 'on progress' ? (
                                <input
                                  required
                                  type="text"
                                  name="hasil"
                                  onChange={(e) =>
                                    handleChangePoint(e, index, i)
                                  }
                                  className="px-1 max-h-7 border rounded border-strokedark w-full"
                                />
                              ) : null}
                            </div>
                          );
                        },
                      )}
                      {data.status == 'on progress' ? (
                        <>
                          <button
                            type='button'
                            disabled={isLoading}
                            onClick={() => handleClickAdd(index)}
                            className=" h-10 rounded-sm bg-blue-600 text-white text-sm font-bold justify-center items-center px-2 py-1 hover:cursor-pointer"
                          >
                            Add
                          </button>
                        </>
                      ) : null}
                    </div>

                    {showDetail[index] == true && (
                      <>
                        <ModalAddPeriode
                          isOpen={showDetail[index]}
                          onClose={() => handleClickAdd(index)}
                          judul={'ADD PROBLEM CODE'}
                        >
                          <div className="flex flex-col gap-2">

                            <label className="text-black text-sm font-bold pt-4">
                              Master Defect
                            </label>
                            <Select
                              options={options}
                              value={selectedOption}
                              onChange={handleChangePointSelect1}
                              placeholder="Select a Defect"
                            />
                            <Select
                              options={secondOptions}
                              value={selectedSecondOption}
                              onChange={handleChangePointSelect2}
                              placeholder="Select an Option"
                              isDisabled={!selectedOption} // Disable until the first dropdown has a selection
                            />
                            <button
                              type='button'
                              disabled={isLoading}
                              onClick={() => {
                                tambahDefectPeriode(
                                  RabutMesin?.data?.id,
                                  idDefect,
                                  data.id,
                                  index,
                                  wasteSelectCode,
                                  wasteSelectLkh
                                ),
                                  console.log(RabutMesin?.data?.id,
                                    idDefect,
                                    data.id,
                                    index,
                                    wasteSelectCode,
                                    wasteSelectLkh);
                              }}
                              className="bg-blue-600 rounded-md w-full h-10 text-white font-semibold text-sm"
                            >
                              TAMBAH MASALAH
                            </button>
                          </div>
                        </ModalAddPeriode>
                      </>
                    )}

                    <div className="grid grid-cols-10 border-b-8 border-[#D8EAFF] px-4 py-4 gap-3">
                      <div className="grid col-span-8">
                        <label className=" text-[#6c6b6b] text-sm font-semibold">
                          Catatan<span className="text-red-500">*</span> :
                        </label>
                        {data.status == 'on progress' ? (
                          <textarea
                            required
                            name="catatan"
                            defaultValue={data.catatan}
                            onChange={(e) => handleChangeRabutPoint(e, index)}
                            className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                          ></textarea>
                        ) : data.status == 'done' ? (
                          <textarea
                            name="catatan"
                            disabled
                            defaultValue={data.catatan}
                            onChange={(e) => handleChangeRabutPoint(e, index)}
                            className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                          ></textarea>
                        ) : null}
                      </div>
                      <div className="grid col-span-2 items-end justify-center"></div>
                    </div>
                  </>
                );
              },
            )}
          </div>
          {RabutMesin?.data?.status == 'incoming' ||
            RabutMesin?.data?.status == 'pending' ? (
            <button
              disabled={isLoading}
              onClick={() => tambahTaskRabut(RabutMesin?.data.id)}
              className=" w-[16%] h-10 rounded-sm bg-blue-600 text-white text-sm font-bold justify-center items-center px-4 py-2 mb-2 hover:cursor-pointer"
            >
              + QTY PALET
            </button>
          ) : null}
          <div className="bg-white ">
            <p className="text-sm font-semibold px-5 pt-5">SUB TOTAL</p>
            <div>
              <div className="px-5 flex flex-col w-[20%]">
                <p className="font-semibold text-sm mt-5 ">
                  Parameter Qty Palet
                </p>
                <input
                  type="text"
                  disabled
                  defaultValue={RabutMesin?.sumQtyPallet}
                  className="bg-[#e8e6e6] border rounded border-strokedark"
                />
              </div>
              <div>
                <div className="flex  gap-4 py-4 p-5">
                  {RabutMesin?.totalPointDefect?.map(
                    (data: any, index: number) => {
                      return (
                        <div className="grid  items-center">
                          <label className=" text-[#6c6b6b]  text-sm font-semibold">
                            {data.kode}
                          </label>
                          <input
                            type="text"
                            defaultValue={data.total_defect}
                            className="bg-[#e8e6e6] px-1 border rounded border-strokedark w-full"
                          />
                        </div>
                      );
                    },
                  )}
                </div>
                <div className=" p-5">
                  <div className="w-4/12">
                    <label className=" text-[#6c6b6b] text-sm font-semibold">
                      JUMLAH DEFECT YANG DITEMUKAN
                    </label>
                    <input
                      type="text"
                      disabled
                      defaultValue={RabutMesin?.totalDefect}
                      className="bg-[#e8e6e6]  px-1 border rounded border-strokedark w-full"
                    />
                  </div>

                  <div className="w-full mt-10">
                    {RabutMesin?.data?.status != 'history' ? (
                      <>
                        <div className="grid grid-cols-1">
                          <label className=" text-[#6c6b6b] text-sm font-semibold">
                            KETERANGAN
                          </label>
                          <textarea
                            required
                            onChange={(e) => setCatatan(e.target.value)}
                            className="border rounded h-44 w-12/12 resize-none"
                          ></textarea>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-1">
                          <label className=" text-[#6c6b6b] text-sm font-semibold">
                            KETERANGAN
                          </label>
                          <textarea
                            defaultValue={RabutMesin?.data.catatan}
                            disabled
                            className="border rounded h-44 w-12/12 resize-none"
                          ></textarea>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-end item w-full p-5">

                  {/* {RabutMesin?.data?.status == 'incoming' ? (
                      <button
                        onClick={() => pendingRabut(RabutMesin?.data.id)}
                        className=" w-full h-10 rounded-sm bg-red-600 text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                      >
                        PENDING
                      </button>
                    ) : null} */}
                  {RabutMesin?.data?.status == 'incoming' ||
                    RabutMesin?.data?.status == 'pending' ? (
                    <button
                      disabled={isLoading}
                      type='submit'
                      value='submit'
                      className=" col-span-2 w-[25%] h-10 rounded-md bg-[#00B81D] text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                    >
                      CHECKSHEET SELESAI
                    </button>
                  ) : null}

                </div>
              </div>
            </div>
          </div>
        </form>
      </main>

    </>
  );
}

export default CheckSheetHasilRabut;
