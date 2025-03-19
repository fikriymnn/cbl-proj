import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Arrow from '../../../../images/icon/arrowDown.svg';
import Burger from '../../../../images/icon/burger.svg';
import Filter from '../../../../images/icon/filter.svg';
import ModalKosongan from '../../../Modals/Qc/NCR/NCRResponQC';
import convertTimeStampToDateOnly from '../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../utils/converDateToTime';
import Loading from '../../../Loading';

function OngoingNCRQA() {
  const [isLoading, setIsLoading] = useState(false);
  const [ncrQC, setNcrQC] = useState<any>();
  const [ctt, setCtt] = useState<any>();
  const [status, setStatus] = useState<any>();
  const [department, setDepartment] = useState<any>();

  // State for editing NCR data
  const [editedData, setEditedData] = useState<any>(null);

  useEffect(() => {
    getNcrQC();
    getDepartment();
  }, []);

  async function getDepartment() {
    const url = `${import.meta.env.VITE_API_LINK_P1}/api/list-departmen`;
    try {
      const res = await axios.get(url, {});
      console.log(res.data);
      setDepartment(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  async function getNcrQC() {
    const url = `${import.meta.env.VITE_API_LINK}/ncr?bagian_tiket=incoming`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setNcrQC(res.data.data);
      console.log(res.data.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  // Initialize edited data when modal opens
  const initializeEditedData = (data: any) => {
    setEditedData({
      id: data.id,
      no_jo: data.no_jo,
      no_io: data.no_io,
      nama_produk: data.nama_produk,
      data_department: JSON.parse(JSON.stringify(data.data_department)), // Deep copy
    });
  };

  // Handle department change
  const handleDepartmentChange = (
    departmentIndex: number,
    field: string,
    value: any,
  ) => {
    const updatedData = { ...editedData };
    updatedData.data_department[departmentIndex][field] = value;

    // If the field being changed is id_department, also update the department name
    if (field === 'id_department') {
      // Find the corresponding department name from the department list
      const selectedDept = department?.find(
        (dep: any) => dep.id.toString() === value.toString(),
      );
      if (selectedDept) {
        updatedData.data_department[departmentIndex]['department'] =
          selectedDept.name;
      }
    }

    setEditedData(updatedData);
  };

  // Handle ketidaksesuaian change
  const handleKetidaksesuaianChange = (
    departmentIndex: number,
    ketidaksesuaianIndex: number,
    value: string,
  ) => {
    const updatedData = { ...editedData };
    updatedData.data_department[departmentIndex].data_ketidaksesuaian[
      ketidaksesuaianIndex
    ].ketidaksesuaian = value;
    setEditedData(updatedData);
  };

  // Handle basic field changes
  const handleFieldChange = (field: string, value: any) => {
    setEditedData({
      ...editedData,
      [field]: value,
    });
  };

  async function submitNcr(id: any, index: any) {
    const url = `${import.meta.env.VITE_API_LINK}/ncr/validasiQa/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {
          status: status,
          catatan_qa: ctt,
        },
        {
          withCredentials: true,
        },
      );
      closeModal1(index);
      getNcrQC();
      setIsLoading(false);
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
    }
  }

  async function editNcr(id: any) {
    const url = `${import.meta.env.VITE_API_LINK}/ncr/${id}`;
    try {
      setIsLoading(true);

      // Prepare data for submission
      const submitData = {
        no_jo: editedData.no_jo,
        no_io: editedData.no_io,
        nama_produk: editedData.nama_produk,
        data_department: editedData.data_department.map((dept: any) => ({
          id: dept.id,
          id_department: dept.id_department,
          department: dept.department,
          data_ketidaksesuaian: dept.data_ketidaksesuaian.map(
            (ketidaksesuaian: any) => ({
              id: ketidaksesuaian.id,
              ketidaksesuaian: ketidaksesuaian.ketidaksesuaian,
            }),
          ),
        })),
      };
      console.log(submitData);
      const res = await axios.put(url, submitData, {
        withCredentials: true,
      });
      setIsLoading(false);
      //return res.data;
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
      throw error;
    }
  }

  // Submit both edit and validation
  async function handleSubmit(id: any, index: any) {
    try {
      setIsLoading(true);
      // First edit the NCR
      await editNcr(id);
      // Then submit the validation
      await submitNcr(id, index);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }

  const [openButton, setOpenButton] = useState(null);
  const handleClick = (i: any) => {
    setOpenButton((prevState: any) => {
      return prevState === i ? null : i;
    });
  };

  const [showModal1, setShowModal1] = useState<any>([]);
  const openModal1 = (i: any, data: any) => {
    const onchangeVal: any = [...showModal1];
    onchangeVal[i] = true;
    setShowModal1(onchangeVal);
    initializeEditedData(data);
  };

  const closeModal1 = (i: any) => {
    const onchangeVal: any = [...showModal1];
    onchangeVal[i] = false;
    setShowModal1(onchangeVal);
    setEditedData(null);
  };

  return (
    <>
      <div className="flex bg-white py-2 w-full px-5 text-sm font-semibold jus border-b-1 border-[#D8EAFF]">
        <div className="flex justify-between w-full">
          <img src={Filter} alt="" className="mx-3 my-auto" />
          <input
            type="search"
            placeholder="Search"
            name=""
            id=""
            className="md:w-96 w-40 py-1 mx-3 px-3 bg-[#E9F3FF]"
          />
        </div>
      </div>
      <div className="flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold border-b-1 border-[#D8EAFF]">
        <p className="w-20">No</p>
        <div className="grid grid-cols-12 w-full">
          <div className="col-span-3">No. NCR</div>
          <div className="col-span-2">No. JO</div>
          <div className="col-span-3">Sumber</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 flex w-full justify-end">Action</div>
        </div>
      </div>
      {ncrQC?.map((data: any, i: number) => {
        const tanggal = convertTimeStampToDateOnly(data?.tanggal);
        const jam = convertDateToTime(data?.tanggal);

        return (
          <>
            <div className="flex bg-white py-2 w-full mt-2 mb-2 px-5 text-sm font-semibold rounded-md items-center">
              <p className="w-20">{i + 1}</p>
              <div className="grid grid-cols-12 w-full text-[#6c6b6b] text-sm font-light items-center">
                <div className="col-span-3">{data?.no_ncr}</div>
                <div className="col-span-2">{data?.no_jo}</div>
                <div className="col-span-3 uppercase">
                  {data?.pelapor?.bagian}
                </div>
                <div className="col-span-2 text-red-700 bg-yellow-300 rounded-full flex w-full items-center justify-center uppercase text-center">
                  {data?.status}
                </div>
                <div className="col-span-2 w-full flex justify-end">
                  <div className="flex gap-2 items-center justify-center">
                    <div>
                      {data.status == 'menunggu validasi qa' ? (
                        <button
                          title="button"
                          className="text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                          onClick={() => handleClick(i)}
                        >
                          <img src={Burger} alt="" className="mx-3" />
                        </button>
                      ) : (
                        <></>
                      )}

                      {openButton == i ? (
                        <div className="absolute bg-white p-3 shadow-5 rounded-md">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => {
                                openModal1(i, data);
                              }}
                              className="w-25 text-xs font-bold bg-blue-700 py-2 text-white rounded-md"
                            >
                              PROSES
                            </button>
                          </div>
                          {showModal1[i] == true && editedData && (
                            <>
                              <ModalKosongan
                                isOpen={showModal1[i]}
                                onClose={() => closeModal1(i)}
                                judul={'Form Respon NCR'}
                              >
                                <>
                                  <div className="grid grid-cols-2 w-full px-4 py-4">
                                    <div className="flex flex-col gap-1">
                                      <p className="text-sm font-semibold text-black">
                                        NO NCR
                                      </p>
                                      <p className="text-xl font-normal ">
                                        {data.no_ncr == null
                                          ? '-'
                                          : data?.no_ncr}
                                      </p>
                                      <p className="text-sm font-semibold text-black pt-2">
                                        NO JO/IO
                                      </p>
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={editedData.no_jo}
                                          onChange={(e) =>
                                            handleFieldChange(
                                              'no_jo',
                                              e.target.value,
                                            )
                                          }
                                          className="border border-gray-300 rounded px-2 py-1 w-1/2"
                                        />
                                        <input
                                          type="text"
                                          value={editedData.no_io}
                                          onChange={(e) =>
                                            handleFieldChange(
                                              'no_io',
                                              e.target.value,
                                            )
                                          }
                                          className="border border-gray-300 rounded px-2 py-1 w-1/2"
                                        />
                                      </div>
                                      <p className="text-sm font-semibold text-black pt-2">
                                        PRODUK
                                      </p>
                                      <input
                                        type="text"
                                        value={editedData.nama_produk || ''}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            'nama_produk',
                                            e.target.value,
                                          )
                                        }
                                        className="border border-gray-300 rounded px-2 py-1"
                                      />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <p className="text-sm font-semibold text-black">
                                        WAKTU LAPOR
                                      </p>
                                      <p className="text-xl font-normal ">
                                        {tanggal}, {jam}
                                      </p>
                                      <p className="text-sm font-semibold text-black pt-2">
                                        NAMA PELAPOR
                                      </p>
                                      <p className="text-xl font-normal uppercase">
                                        {data?.pelapor?.nama}
                                      </p>
                                    </div>
                                  </div>

                                  {editedData.data_department.map(
                                    (dept: any, deptIndex: number) => {
                                      return (
                                        <>
                                          <div
                                            className="flex w-full px-4 py-4"
                                            key={`dept-${deptIndex}`}
                                          >
                                            <div className="flex flex-col w-full">
                                              <p className="text-sm font-semibold text-black pt-2">
                                                LAPORAN
                                              </p>
                                              <div className="flex justify-between w-full">
                                                <div className="flex flex-col">
                                                  <p className="text-sm font-semibold text-black pt-2">
                                                    DEPARTEMEN TUJUAN
                                                  </p>
                                                  <select
                                                    value={dept.id_department}
                                                    onChange={(e) =>
                                                      handleDepartmentChange(
                                                        deptIndex,
                                                        'id_department',
                                                        e.target.value,
                                                      )
                                                    }
                                                    className="border border-gray-300 rounded px-2 py-1"
                                                  >
                                                    {department?.map(
                                                      (dep: any) => (
                                                        <option
                                                          key={dep.id}
                                                          value={dep.id}
                                                        >
                                                          {dep.name}
                                                        </option>
                                                      ),
                                                    )}
                                                  </select>
                                                </div>
                                              </div>
                                              {dept.data_ketidaksesuaian.map(
                                                (
                                                  ketidaksesuaian: any,
                                                  ketidaksesuaianIndex: number,
                                                ) => {
                                                  return (
                                                    <>
                                                      <div
                                                        className="flex"
                                                        key={`ket-${ketidaksesuaianIndex}`}
                                                      >
                                                        <div className="flex flex-col gap-1 w-[60%]">
                                                          <p className="text-sm font-semibold text-black pt-2">
                                                            KETIDAKSESUAIAN{' '}
                                                            {ketidaksesuaianIndex +
                                                              1}
                                                          </p>
                                                          <textarea
                                                            value={
                                                              ketidaksesuaian.ketidaksesuaian ||
                                                              ''
                                                            }
                                                            onChange={(e) =>
                                                              handleKetidaksesuaianChange(
                                                                deptIndex,
                                                                ketidaksesuaianIndex,
                                                                e.target.value,
                                                              )
                                                            }
                                                            className="border border-gray-300 rounded px-2 py-1 min-h-[80px]"
                                                          ></textarea>
                                                        </div>
                                                        <div className="flex flex-col gap-1 w-[40%] items-end">
                                                          <p className="text-sm font-semibold text-black pt-2">
                                                            GAMBAR
                                                          </p>
                                                          <p className="text-sm font-normal text-blue-500">
                                                            LIHAT GAMBAR
                                                          </p>
                                                        </div>
                                                      </div>
                                                    </>
                                                  );
                                                },
                                              )}
                                            </div>
                                          </div>
                                        </>
                                      );
                                    },
                                  )}

                                  <div className="flex flex-col w-full px-4">
                                    <p className="text-sm font-semibold text-black pt-2">
                                      CATATAN
                                    </p>
                                    <textarea
                                      onChange={(e) => setCtt(e.target.value)}
                                      className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                                    ></textarea>
                                    <div className="pt-4">
                                      <input
                                        onChange={(e) => {
                                          setStatus(e.target.value);
                                        }}
                                        type="radio"
                                        id="sspoint1"
                                        name="sspoint1"
                                        value="sesuai"
                                      />
                                      <label className="pl-2 text-xl text-black">
                                        Sesuai
                                      </label>
                                    </div>
                                    <div>
                                      <input
                                        onChange={(e) => {
                                          setStatus(e.target.value);
                                        }}
                                        type="radio"
                                        id="ssspoint1"
                                        name="sspoint1"
                                        value="tidak sesuai"
                                      />
                                      <label className="pl-2 text-xl text-black">
                                        Tidak Sesuai
                                      </label>
                                    </div>
                                    <div className="pt-5">
                                      <button
                                        disabled={isLoading}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          //editNcr(data?.id);
                                          handleSubmit(data?.id, i);
                                        }}
                                        className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md"
                                      >
                                        {isLoading ? 'Loading...' : 'SUBMIT'}
                                      </button>
                                    </div>
                                    {isLoading && <Loading />}
                                  </div>
                                </>
                              </ModalKosongan>
                            </>
                          )}
                        </div>
                      ) : (
                        ''
                      )}
                    </div>

                    <button
                      title="button"
                      className="text-xs w-7 h-7 font-bold text-blue-700 bg-blue-700 border-blue-700 border rounded-md"
                    >
                      <img src={Arrow} alt="" className="mx-auto" />
                    </button>
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

export default OngoingNCRQA;
