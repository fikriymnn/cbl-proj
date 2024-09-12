import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function IncomingInspection() {
  const [isMobile, setIsMobile] = useState(false);
  const kosong: any = [];
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const date = today.getDate();
  const currentDate = month + '/' + date + '/' + year;
  const navigate = useNavigate();

  const { id } = useParams();
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768); // Adjust the breakpoint as needed
  };
  useEffect(() => {
    handleResize();

    // Event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [incoming, setIncoming] = useState<any>();

  useEffect(() => {
    getInspection();
  }, []);

  async function getInspection() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiBahan/${id}`;

    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });
      console.log(res.data.data);
      setIncoming(res.data.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  async function startTask(id: any) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiBahan/start/${id}`;

    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      getInspection();
    } catch (error: any) {
      console.log(error);
    }
  }

  async function stopTask(id: any, start: any) {
    if (!start) {
      // Check if start time is available
      alert('Task tidak bisa diberhentikan: Belum Start.');
      return; // Exit function if no start time
    }
    if (
      incoming?.inspeksi_bahan_result[0].send == false ||
      incoming?.inspeksi_bahan_result[1].send == false ||
      incoming?.inspeksi_bahan_result[2].send == false ||
      incoming?.inspeksi_bahan_result[3].send == false ||
      incoming?.inspeksi_bahan_result[4].send == false ||
      incoming?.inspeksi_bahan_result[5].send == false ||
      incoming?.inspeksi_bahan_result[6].send == false ||
      incoming?.inspeksi_bahan_result[7].send == false ||
      incoming?.inspeksi_bahan_result[8].send == false
    ) {
      alert('Checksheet belum terisi semua');
      return;
    }
    const stopTime = new Date();
    const timestamp = convertDatetimeToDate(new Date());
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiBahan/stop/${id}`;

    try {
      const elapsedSeconds = await calculateElapsedTime(start, stopTime);

      // **Save total seconds elsewhere**
      const totalSecondsToSave = elapsedSeconds;
      // Use totalSecondsToSave for your saving logic (e.g., local storage, separate API)

      // Formatted time can be used for logging if needed
      const formattedTime = formatElapsedTime(elapsedSeconds);

      console.log(formattedTime);

      const res = await axios.put(
        url,
        {
          lama_pengerjaan: totalSecondsToSave,
        },
        {
          withCredentials: true,
        },
      );

      console.log('Succes', timestamp);

      getInspection();
    } catch (error: any) {
      console.log(error);
      alert(error.response.data.msg);
    }
  }
  async function sumbitPoint(objek: any) {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiBahanResult/${
      objek.id
    }`;
    try {
      const res = await axios.put(
        url,
        {
          ...objek,
        },
        {
          withCredentials: true,
        },
      );

      console.log(objek);
      getInspection();
    } catch (error: any) {
      console.log(error);
    }
  }

  const [hasil1, sethasil1] = useState<any>();
  const [kh1, setkh1] = useState<any>();
  async function submitPoint1(id: any) {
    if (hasil1 == null || kh1 == null) {
      alert('Point 1 Belum Terisi Semua');
      return;
    }
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiBahanResult/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          hasil: hasil1,
          keterangan_hasil: kh1,
        },
        {
          withCredentials: true,
        },
      );

      console.log(res.data);
      getInspection();
    } catch (error: any) {
      console.log(error);
    }
  }
  const [hasilkiri, sethhasilkiri] = useState<any>();
  const [hasiltengah, sethhasiltengah] = useState<any>();
  const [hasilkanan, sethhasilkanan] = useState<any>();
  const [kh2, setkh2] = useState<any>();
  async function submitPoint2(id: any) {
    if (
      hasilkiri == null ||
      hasiltengah == null ||
      hasilkanan == null ||
      kh2 == null
    ) {
      alert('Point 2 Belum Terisi Semua');
      return;
    }
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiBahanResult/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          hasil_kiri: hasilkiri,
          hasil_tengah: hasiltengah,
          hasil_kanan: hasilkanan,
          hasil_rata_rata: hasilRata,
          keterangan_hasil: kh2,
        },
        {
          withCredentials: true,
        },
      );

      console.log(res.data);
      getInspection();
    } catch (error: any) {
      console.log(error);
    }
  }
  const [hasilkiri3, sethhasilkiri3] = useState<any>();
  const [hasiltengah3, sethhasiltengah3] = useState<any>();
  const [hasilkanan3, sethhasilkanan3] = useState<any>();
  const [kh3, setkh3] = useState<any>();
  async function submitPoint3(id: any) {
    if (
      hasilkiri3 == null ||
      hasiltengah3 == null ||
      hasilkanan3 == null ||
      kh3 == null
    ) {
      alert('Point 3 Belum Terisi Semua');
      return;
    }
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiBahanResult/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          hasil_kiri: hasilkiri3,
          hasil_tengah: hasiltengah3,
          hasil_kanan: hasilkanan3,

          keterangan_hasil: kh3,
        },
        {
          withCredentials: true,
        },
      );

      console.log(res.data);
      getInspection();
    } catch (error: any) {
      console.log(error);
    }
  }

  const [hasil4, sethHasil4] = useState<any>();
  const [kh4, setkh4] = useState<any>();
  async function submitPoint4(id: any) {
    if (hasil4 == null || kh4 == null) {
      alert('Point 4 Belum Terisi Semua');
      return;
    }
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiBahanResult/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          hasil: hasil4,
          keterangan_hasil: kh4,
        },
        {
          withCredentials: true,
        },
      );

      console.log(res.data);
      getInspection();
    } catch (error: any) {
      console.log(error);
    }
  }

  const [hasil5, sethHasil5] = useState<any>();
  const [kh5, setkh5] = useState<any>();
  const [coating5, setCoating5] = useState<any>();
  async function submitPoint5(id: any) {
    if (hasil5 == null || kh5 == null || coating5 == null) {
      alert('Point 5 Belum Terisi Semua');
      return;
    }
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiBahanResult/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          hasil: hasil5,
          coating: coating5,
          keterangan_hasil: kh5,
        },
        {
          withCredentials: true,
        },
      );

      console.log(res.data);
      getInspection();
    } catch (error: any) {
      console.log(error);
    }
  }
  const [hasilPanjang6, sethhasilPanjang6] = useState<any>();
  const [hasilLebar6, sethasilLebar6] = useState<any>();
  const [kh6, setkh6] = useState<any>();

  async function submitPoint6(id: any) {
    if (hasilPanjang6 == null || hasilLebar6 == null || kh6 == null) {
      alert('Point 6 Belum Terisi Semua');
      return;
    }
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiBahanResult/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          hasil_panjang: hasilPanjang6,
          hasil_lebar: hasilLebar6,
          keterangan_hasil: kh6,
        },
        {
          withCredentials: true,
        },
      );

      console.log(res.data);
      getInspection();
    } catch (error: any) {
      console.log(error);
    }
  }
  const [hasil7, sethHasil7] = useState<any>();
  const [kh7, setkh7] = useState<any>();
  async function submitPoint7(id: any) {
    if (hasil7 == null || kh7 == null) {
      alert('Point 7 Belum Terisi Semua');
      return;
    }
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiBahanResult/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          hasil: hasil7,
          keterangan_hasil: kh7,
        },
        {
          withCredentials: true,
        },
      );

      console.log(res.data);
      getInspection();
    } catch (error: any) {
      console.log(error);
    }
  }
  const [hasil8, sethHasil8] = useState<any>();
  const [kh8, setkh8] = useState<any>();
  async function submitPoint8(id: any) {
    if (hasil8 == null || kh8 == null) {
      alert('Point 8 Belum Terisi Semua');
      return;
    }
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiBahanResult/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          hasil: hasil8,
          keterangan_hasil: kh8,
        },
        {
          withCredentials: true,
        },
      );

      console.log(res.data);
      getInspection();
    } catch (error: any) {
      console.log(error);
    }
  }
  const [hasil9, sethHasil9] = useState<any>();
  const [kh9, setkh9] = useState<any>();
  async function submitPoint9(id: any) {
    if (hasil9 == null || kh9 == null) {
      alert('Point 9 Belum Terisi Semua');
      return;
    }
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiBahanResult/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          hasil: hasil9,
          keterangan_hasil: kh9,
        },
        {
          withCredentials: true,
        },
      );

      console.log(res.data);
      getInspection();
    } catch (error: any) {
      console.log(error);
    }
  }

  const [no_lot, setNo_lot] = useState<any>();
  const [hasil_rumus, setHasil_rumus] = useState<any>();
  const [verifikasi, setVerifikasi] = useState<any>();
  const [ctt, setCtt] = useState<any>();

  async function sumbitChecksheet(id: number) {
    if (
      no_lot == null ||
      hasil_rumus == null ||
      verifikasi == null ||
      ctt == null
    ) {
      // Check if start time is available
      alert('Data Tidak Lengkap');
      return; // Exit function if no start time
    }

    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiBahan/update/${id}`;
    try {
      const res = await axios.put(
        url,
        {
          catatan: ctt,
          no_lot: no_lot,
          hasil_rumus: hasil_rumus,
          verifikasi: verifikasi,
        },
        {
          withCredentials: true,
        },
      );
      if (verifikasi == 'Diterima') {
        const respon = await axios.post(
          `https://erp.cbloffset.com/api/approve-incoming-bahan/${incoming?.no_surat_jalan}`,
          {},
        );
        console.log(respon);
      }
      alert('Data Berhasil Di-Update');
      console.log('succes');
      getInspection();
    } catch (error: any) {
      console.log(error);
    }
  }

  function formatElapsedTime(seconds: number): string {
    // Ensure seconds is non-negative
    seconds = Math.max(0, seconds);

    const hours = Math.floor(seconds / 3600);
    const remainingSeconds = seconds % 3600;

    const minutes = Math.floor(remainingSeconds / 60);
    const remainingSecondsAfterMinutes = remainingSeconds % 60;

    // Use template literals and conditional operators for formatting
    let formattedTime = '';
    if (hours > 0) {
      formattedTime += `${hours} Jam :`; // Add hours if present
    }
    if (hours > 0 || minutes > 0) {
      // Only add minutes if hours are present or minutes are non-zero
      formattedTime += `${minutes.toString().padStart(2, '0')} Menit : `;
    }
    formattedTime += remainingSecondsAfterMinutes.toString().padStart(2, '0');

    return formattedTime;
  }

  function convertDatetimeToDate(datetime: any) {
    const dateObject = new Date(datetime);
    const day = dateObject.getDate().toString().padStart(2, '0'); // Ensure two-digit day
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Adjust for zero-based month
    const year = dateObject.getFullYear();
    const hours = dateObject.getHours().toString().padStart(2, '0');
    const minutes = dateObject.getMinutes().toString().padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}`; // Example format (YYYY-MM-DD)
  }
  function calculateElapsedTime(startTime: any, stopTime: Date) {
    const start = new Date(startTime);
    const diffInMs = stopTime.getTime() - start.getTime();
    // Convert milliseconds to your desired unit (minutes, hours)
    const elapsedTime = Math.round(diffInMs / 1000);
    console.log(elapsedTime); // Example: minutes
    return elapsedTime;
  }

  const waktuMulaiincoming = convertDatetimeToDate(
    incoming != null && incoming?.waktu_mulai,
  );

  const waktuSelesaiincoming =
    incoming != null && incoming?.waktu_selesai != null
      ? convertDatetimeToDate(incoming?.waktu_selesai)
      : '-';

  // const tanggal = convertDatetimeToDate(new Date());

  const [kiri, setKiri] = useState<number>(0);
  const [kanan, setKanan] = useState<number>(0);
  const [tengah, setTengah] = useState<number>(0);
  const [rataRata, setRataRata] = useState<number>(0);

  const ratarata = (kiri + kanan + tengah) / 3;

  const hasilRata = ratarata.toFixed(2);

  return (
    <>
      {!isMobile && (
        <main className="overflow-x-scroll">
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
              Incoming Inspection Checksheet
            </p>

            <div className="grid grid-cols-12  border-b-8 border-[#D8EAFF]">
              <div className="flex flex-col gap-4 col-span-2 px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Tanggal
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  No. LOT
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Jumlah Pallet
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  No. Surat Jalan
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Supplier
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Jenis Kertas
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Ukuran
                </label>
              </div>
              <div className="flex flex-col gap-4 col-span-3 px-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.tanggal}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  {incoming?.status == 'incoming' ? (
                    <>
                      :{' '}
                      <input
                        type="text"
                        onChange={(e) => {
                          setNo_lot(e.target.value);
                        }}
                        className="rounded-[3px]  border border-zinc-300"
                      />
                    </>
                  ) : (
                    <>: {incoming?.no_lot}</>
                  )}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.jumlah_pallet}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.no_surat_jalan}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.supplier}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.jenis_kertas}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.ukuran}
                </label>
              </div>

              <div className="flex flex-col  gap-4 col-span-3 justify-between pl-10 py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  Jam
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Inspector
                </label>
                <label className="text-neutral-500 text-sm font-semibold"></label>

                <label className="text-black text-lg font-bold">
                  STANDAR PEMERIKSAAN
                </label>

                <label className="text-neutral-500 text-sm font-semibold">
                  Jumlah
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  √N + 1
                </label>
              </div>
              <div className="flex flex-col  gap-4 col-span-2 justify-between py-4">
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.jam}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.inspector}
                </label>
                <label className="text-neutral-500 text-sm font-semibold"></label>

                <label className="text-black text-lg font-bold mt-12"> </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  : {incoming?.jumlah}
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  {incoming?.status == 'incoming' ? (
                    <>
                      :{' '}
                      <input
                        onChange={(e) => {
                          setHasil_rumus(e.target.value);
                        }}
                        type="text"
                        className="rounded-[3px] w-[50%] border border-zinc-300"
                      />
                    </>
                  ) : (
                    <>:{incoming?.hasil_rumus}</>
                  )}
                </label>
              </div>
              <div className="flex flex-col h-full w-full items-center justify-end gap-2  py-4 col-span-2  bg-[#F6FAFF]">
                {incoming?.waktu_mulai == null &&
                  incoming?.waktu_selesai == null && (
                    <>
                      <div>
                        <p className="md:text-[14px] text-[9px] font-semibold">
                          Time : -
                        </p>
                        <>
                          <p className="font-bold text-[#DE0000]">
                            Task Belum Dimulai
                          </p>
                          <button
                            onClick={() => {
                              startTask(incoming?.id);
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
                      </div>
                    </>
                  )}
                {incoming?.waktu_mulai != null &&
                  incoming?.waktu_selesai == null && (
                    <>
                      <div>
                        <p className="md:text-[14px] text-[9px] font-semibold">
                          Waktu Mulai : {waktuMulaiincoming}
                        </p>
                        <p className="md:text-[14px] text-[9px] font-semibold">
                          Waktu Selesai : {waktuSelesaiincoming}
                        </p>
                        <p className="md:text-[14px] text-[9px] font-semibold">
                          Time : -
                        </p>
                        <>
                          <p className="font-bold text-[#00B81D]">
                            Task Sudah Dimulai
                          </p>
                          <button
                            onClick={() => {
                              if (incoming?.waktu_selesai != null) {
                                alert('sudah di kerjakan');
                              } else if (incoming?.waktu_mulai == null) {
                                alert('belum mulai');
                              } else {
                                stopTask(incoming?.id, incoming?.waktu_mulai);
                              }
                            }}
                            className="flex w-full  rounded-md bg-[#DE0000] justify-center items-center px-2 py-2 hover:cursor-pointer"
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
                      </div>
                    </>
                  )}
                {incoming?.waktu_mulai != null &&
                  incoming?.waktu_selesai != null && (
                    <>
                      <div className="gap-1 flex flex-col">
                        <p className="md:text-[14px] text-[9px] font-semibold">
                          Waktu Mulai :
                        </p>
                        <p className="md:text-[14px] text-[9px] font-semibold text-stone-400">
                          {waktuMulaiincoming}
                        </p>
                        <p className="md:text-[14px] text-[9px] font-semibold">
                          Waktu Selesai :
                        </p>
                        <p className="md:text-[14px] text-[9px] font-semibold text-stone-400">
                          {waktuSelesaiincoming}
                        </p>
                        <p className="md:text-[14px] text-[9px] font-semibold">
                          Time :
                        </p>
                        <p className="md:text-[14px] text-[9px] font-semibold text-stone-400">
                          {incoming?.lama_pengerjaan != null
                            ? formatElapsedTime(incoming?.lama_pengerjaan)
                            : ''}{' '}
                          Detik
                        </p>
                      </div>
                    </>
                  )}
              </div>
            </div>
            <div className="grid grid-cols-12 px-3 py-4 border-b-8 border-[#D8EAFF] gap-2">
              <div className="flex gap-4 col-span-2">
                <label className="text-neutral-500 text-sm font-semibold">
                  No
                </label>
                <label className="text-neutral-500 text-sm font-semibold">
                  Keterangan
                </label>
              </div>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Alat Ukur
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Metode
              </label>
              <label className="text-neutral-500 text-sm font-semibold col-span-2">
                Target
              </label>
              <div className="flex justify-between  col-span-3">
                <label className="text-neutral-500 text-sm font-semibold">
                  Hasil
                </label>
                <label className="text-neutral-500 text-sm font-semibold pr-[20%]">
                  Keterangan
                </label>
              </div>

              <label className="text-neutral-500 text-sm font-semibold flex justify-end">
                Bobot (%)
              </label>
            </div>

            <>
              {/* =============================================Checksheet Not Start==========================================================*/}
              {incoming?.waktu_mulai == null &&
                incoming?.waktu_selesai == null && (
                  <>
                    <div className="flex px-4 py-5">
                      <p className="font-bold text-[#00B81D]">
                        Mulai Task Untuk Memunculkan Checksheet
                      </p>
                    </div>
                  </>
                )}

              {/* =============================================Checksheet Start==========================================================*/}
              {incoming?.waktu_mulai != null &&
                incoming?.waktu_selesai == null && (
                  <>
                    <>
                      <form>
                        <div className="grid grid-cols-12 px-3 py-4 gap-2">
                          <div className="flex gap-4 col-span-2">
                            <label className="text-neutral-500 text-sm font-semibold">
                              1
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold">
                              Jenis Kertas
                            </label>
                          </div>
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            -
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Visual
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Sesuai Surat Jalan
                          </label>
                          <div className="flex justify-between  col-span-3">
                            <label className="text-neutral-500 text-sm font-semibold">
                              {!incoming?.inspeksi_bahan_result[0]?.send ? (
                                <>
                                  <select
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[0].hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })
                                      sethasil1(e.target.value);
                                    }}
                                  >
                                    <option disabled selected>
                                      {' '}
                                      Select Result
                                    </option>
                                    <option value={'DUPLEX'}>DUPLEX</option>
                                    <option value={'IVORY'}>IVORY</option>
                                    <option value={'ART PAPER'}>
                                      ART PAPER
                                    </option>
                                    <option value={'HVS'}>HVS</option>
                                  </select>
                                </>
                              ) : (
                                <>{incoming?.inspeksi_bahan_result[0]?.hasil}</>
                              )}
                            </label>
                            <div className="flex flex-col gap-1  w-[50%]">
                              {!incoming?.inspeksi_bahan_result[0]?.send ? (
                                <>
                                  <div>
                                    <input
                                      onChange={(e) => {
                                        // let array = [...incoming?.inspeksi_bahan_result]
                                        // array[0].keterangan_hasil = e.target.value
                                        // setIncoming({ ...incoming, inspeksi_bahan_result: array })
                                        setkh1(e.target.value);
                                      }}
                                      type="radio"
                                      id="sspoint1"
                                      name="sspoint1"
                                      value="sesuai"
                                    />
                                    <label className="pl-2">Sesuai</label>
                                  </div>
                                  <div>
                                    <input
                                      onChange={(e) => {
                                        // let array = [...incoming?.inspeksi_bahan_result]
                                        // array[0].keterangan_hasil = e.target.value
                                        // setIncoming({ ...incoming, inspeksi_bahan_result: array })
                                        setkh1(e.target.value);
                                      }}
                                      type="radio"
                                      id="ssspoint1"
                                      name="sspoint1"
                                      value="tidak sesuai"
                                    />
                                    <label className="pl-2">Tidak Sesuai</label>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="text-neutral-500 text-sm font-semibold">
                                    {
                                      incoming?.inspeksi_bahan_result[0]
                                        .keterangan_hasil
                                    }
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                            {incoming?.inspeksi_bahan_result[0].bobot}
                          </label>
                        </div>
                        <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                          <div className="col-span-4">
                            {!incoming?.inspeksi_bahan_result[0]?.send ? (
                              <>
                                <div className="flex flex-col ">
                                  <p className="md:text-[14px] text-[9px] font-semibold">
                                    Upload Foto (Optional):
                                  </p>

                                  <br />
                                  <div className="">
                                    <input
                                      type="file"
                                      name=""
                                      id=""
                                      className="w-60"
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex flex-col ">
                                  <p className="md:text-[14px] text-[9px] font-semibold">
                                    Upload Foto (Optional):
                                  </p>

                                  <br />
                                  <div className="">
                                    <input
                                      disabled
                                      type="file"
                                      name=""
                                      id=""
                                      className="w-60"
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="col-span-6 justify-end  w-full h-full flex items-center">
                            {!incoming?.inspeksi_bahan_result[0]?.send ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();

                                    submitPoint1(
                                      incoming?.inspeksi_bahan_result[0].id,
                                    );
                                    // sumbitPoint(incoming?.inspeksi_bahan_result[0]);
                                  }}
                                  className="flex w-[30%] h-[50%] text-white font-semibold rounded-md bg-blue-600 justify-center items-center px-2 py-2 hover:cursor-pointer"
                                >
                                  Simpan
                                </button>
                              </>
                            ) : (
                              <></>
                            )}
                          </div>
                        </div>
                      </form>
                    </>
                    {/* =============================Point 2========================== */}
                    <>
                      <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                        <div className="flex gap-4 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold">
                            2
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold">
                            Gramatur
                          </label>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Timbangan Digital
                        </label>
                        <div className="flex flex-col gap-2 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Potong Kertas Ukuran 10x10cm di area KIRI, TENGAH,
                            KANAN
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Timbang Masing-Masing beratnya
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Jumlahkan dan hitung nilai rata-ratanya (KIRI &lt;
                            TENGAH &lt; KANAN : 3)
                          </label>
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Gramatur Sesuai Surat Jalan
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Toleransi &#xb1; 4%
                          </label>
                        </div>

                        <div className="flex justify-between  col-span-3">
                          <div className="flex flex-col  w-[60%]">
                            {!incoming?.inspeksi_bahan_result[1]?.send ? (
                              <>
                                <label className="text-neutral-500 text-sm font-semibold ">
                                  Kiri
                                </label>
                                <input
                                  onChange={(e) => {
                                    // let array = [...incoming?.inspeksi_bahan_result]
                                    // array[1].hasil_kiri = e.target.value
                                    // array[1].hasil_rata_rata = hasilRata
                                    sethhasilkiri(e.target.value);
                                    setKiri(parseInt(e.target.value));
                                    // setIncoming({ ...incoming, inspeksi_bahan_result: array })
                                  }}
                                  type="number"
                                  className="border-2 border-stroke w-[80%] rounded-sm"
                                />
                                <label className="text-neutral-500 text-sm font-semibold pt-1">
                                  Tengah
                                </label>
                                <input
                                  type="number"
                                  onChange={(e) => {
                                    // let array = [...incoming?.inspeksi_bahan_result]
                                    // array[1].hasil_tengah = e.target.value
                                    // array[1].hasil_rata_rata = hasilRata
                                    sethhasiltengah(e.target.value);
                                    setTengah(parseInt(e.target.value));
                                    // setIncoming({ ...incoming, inspeksi_bahan_result: array })
                                  }}
                                  className="border-2 border-stroke w-[80%] rounded-sm"
                                />
                                <label className="text-neutral-500 text-sm font-semibold pt-1">
                                  Kanan
                                </label>
                                <input
                                  type="number"
                                  onChange={(e) => {
                                    // let array = [...incoming?.inspeksi_bahan_result]
                                    // array[1].hasil_kanan = e.target.value
                                    // array[1].hasil_rata_rata = hasilRata
                                    sethhasilkanan(e.target.value);
                                    setKanan(parseInt(e.target.value));
                                    // setIncoming({ ...incoming, inspeksi_bahan_result: array })
                                  }}
                                  className="border-2 border-stroke w-[80%] rounded-sm"
                                />
                                <label className="text-neutral-500 text-sm font-semibold pt-1">
                                  Rata-Rata
                                </label>
                                <input
                                  type="number"
                                  value={hasilRata}
                                  onChange={() => {
                                    let array = [
                                      ...incoming?.inspeksi_bahan_result,
                                    ];
                                    array[1].hasil_rata_rata = hasilRata;

                                    setIncoming({
                                      ...incoming,
                                      inspeksi_bahan_result: array,
                                    });
                                  }}
                                  disabled
                                  className="border-2 border-stroke w-[80%] rounded-sm"
                                />
                              </>
                            ) : (
                              <>
                                <div className="flex flex-col gap-1">
                                  <label className="text-neutral-500 text-sm font-semibold ">
                                    Kiri
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold ">
                                    {
                                      incoming?.inspeksi_bahan_result[1]
                                        .hasil_kiri
                                    }{' '}
                                    gr
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold pt-1">
                                    Tengah
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold ">
                                    {
                                      incoming?.inspeksi_bahan_result[1]
                                        .hasil_tengah
                                    }{' '}
                                    gr
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold pt-1">
                                    Kanan
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold ">
                                    {
                                      incoming?.inspeksi_bahan_result[1]
                                        .hasil_kanan
                                    }{' '}
                                    gr
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold pt-1">
                                    Rata-Rata
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold ">
                                    {
                                      incoming?.inspeksi_bahan_result[1]
                                        .hasil_rata_rata
                                    }{' '}
                                    gr
                                  </label>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex flex-col gap-1  w-[50%]">
                            {!incoming?.inspeksi_bahan_result[1]?.send ? (
                              <>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[1].keterangan_hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })
                                      setkh2(e.target.value);
                                    }}
                                    type="radio"
                                    id="sspoint2"
                                    name="sspoint2"
                                    value="sesuai"
                                  />
                                  <label className="pl-2">Sesuai</label>
                                </div>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[1].keterangan_hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array }

                                      // )
                                      setkh2(e.target.value);
                                    }}
                                    type="radio"
                                    id="ssspoint2"
                                    name="sspoint2"
                                    value="tidak sesuai"
                                  />
                                  <label className="pl-2">Tidak Sesuai</label>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-neutral-500 text-sm font-semibold">
                                  {
                                    incoming?.inspeksi_bahan_result[1]
                                      .keterangan_hasil
                                  }
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                          {incoming?.inspeksi_bahan_result[1].bobot}
                        </label>
                      </div>
                      <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                        <div className="col-span-4">
                          {!incoming?.inspeksi_bahan_result[1]?.send ? (
                            <>
                              <div className="flex flex-col ">
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  Upload Foto (Optional):
                                </p>

                                <br />
                                <div className="">
                                  <input
                                    type="file"
                                    name=""
                                    id=""
                                    className="w-60"
                                  />
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex flex-col ">
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  Upload Foto (Optional):
                                </p>

                                <br />
                                <div className="">
                                  <input
                                    disabled
                                    type="file"
                                    name=""
                                    id=""
                                    className="w-60"
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="col-span-6 justify-end  w-full h-full flex items-center">
                          {!incoming?.inspeksi_bahan_result[1]?.send ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();

                                  submitPoint2(
                                    incoming?.inspeksi_bahan_result[1].id,
                                  );
                                  // sumbitPoint(incoming?.inspeksi_bahan_result[1]);
                                }}
                                className="flex w-[30%] h-[50%] text-white font-semibold rounded-md bg-blue-600 justify-center items-center px-2 py-2 hover:cursor-pointer"
                              >
                                Simpan
                              </button>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    </>

                    {/* =============================Point 3========================== */}
                    <>
                      <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                        <div className="flex gap-4 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold">
                            3
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold">
                            Thickness
                          </label>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Thickness Gauge
                        </label>
                        <div className="flex flex-col gap-2 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Ukuran ketebalan Masing-Masing kertas yang sudah
                            dipotong di point-2
                          </label>
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            -
                          </label>
                        </div>

                        <div className="flex justify-between  col-span-3">
                          <div className="flex flex-col  w-[60%]">
                            {!incoming?.inspeksi_bahan_result[2]?.send ? (
                              <>
                                <label className="text-neutral-500 text-sm font-semibold ">
                                  Kiri
                                </label>
                                <input
                                  onChange={(e) => {
                                    // let array = [...incoming?.inspeksi_bahan_result]
                                    // array[2].hasil_kiri = e.target.value

                                    // setIncoming({ ...incoming, inspeksi_bahan_result: array })
                                    sethhasilkiri3(e.target.value);
                                  }}
                                  type="number"
                                  className="border-2 border-stroke w-[80%] rounded-sm"
                                />
                                <label className="text-neutral-500 text-sm font-semibold pt-1">
                                  Tengah
                                </label>
                                <input
                                  type="number"
                                  onChange={(e) => {
                                    // let array = [...incoming?.inspeksi_bahan_result]
                                    // array[2].hasil_tengah = e.target.value

                                    // setIncoming({ ...incoming, inspeksi_bahan_result: array })
                                    sethhasiltengah3(e.target.value);
                                  }}
                                  className="border-2 border-stroke w-[80%] rounded-sm"
                                />
                                <label className="text-neutral-500 text-sm font-semibold pt-1">
                                  Kanan
                                </label>
                                <input
                                  type="number"
                                  onChange={(e) => {
                                    // let array = [...incoming?.inspeksi_bahan_result]
                                    // array[2].hasil_kanan = e.target.value

                                    // setIncoming({ ...incoming, inspeksi_bahan_result: array })
                                    sethhasilkanan3(e.target.value);
                                  }}
                                  className="border-2 border-stroke w-[80%] rounded-sm"
                                />
                              </>
                            ) : (
                              <>
                                <div className="flex flex-col gap-1">
                                  <label className="text-neutral-500 text-sm font-semibold ">
                                    Kiri
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold ">
                                    {
                                      incoming?.inspeksi_bahan_result[2]
                                        .hasil_kiri
                                    }{' '}
                                    MM
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold pt-1">
                                    Tengah
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold ">
                                    {
                                      incoming?.inspeksi_bahan_result[2]
                                        .hasil_tengah
                                    }{' '}
                                    MM
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold pt-1">
                                    Kanan
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold ">
                                    {
                                      incoming?.inspeksi_bahan_result[2]
                                        .hasil_kanan
                                    }{' '}
                                    MM
                                  </label>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex flex-col gap-1  w-[50%]">
                            {!incoming?.inspeksi_bahan_result[2]?.send ? (
                              <>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[2].keterangan_hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      setkh3(e.target.value);
                                    }}
                                    type="radio"
                                    id="sesuai1"
                                    name="sesuai1"
                                    value="sesuai"
                                  />
                                  <label className="pl-2">Sesuai</label>
                                </div>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[2].keterangan_hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      setkh3(e.target.value);
                                    }}
                                    type="radio"
                                    id="sesuai2"
                                    name="sesuai1"
                                    value="tidak sesuai"
                                  />
                                  <label className="pl-2">Tidak Sesuai</label>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-neutral-500 text-sm font-semibold">
                                  {
                                    incoming?.inspeksi_bahan_result[2]
                                      .keterangan_hasil
                                  }
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                          {incoming?.inspeksi_bahan_result[2].bobot}
                        </label>
                      </div>
                      <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                        <div className="col-span-4">
                          {!incoming?.inspeksi_bahan_result[2]?.send ? (
                            <>
                              <div className="flex flex-col ">
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  Upload Foto (Optional):
                                </p>

                                <br />
                                <div className="">
                                  <input
                                    type="file"
                                    name=""
                                    id=""
                                    className="w-60"
                                  />
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex flex-col ">
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  Upload Foto (Optional):
                                </p>

                                <br />
                                <div className="">
                                  <input
                                    disabled
                                    type="file"
                                    name=""
                                    id=""
                                    className="w-60"
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="col-span-6 justify-end  w-full h-full flex items-center">
                          {!incoming?.inspeksi_bahan_result[2]?.send ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  submitPoint3(
                                    incoming?.inspeksi_bahan_result[2].id,
                                  );
                                  // sumbitPoint(incoming?.inspeksi_bahan_result[2]);
                                }}
                                className="flex w-[30%] h-[50%] text-white font-semibold rounded-md bg-blue-600 justify-center items-center px-2 py-2 hover:cursor-pointer"
                              >
                                Simpan
                              </button>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    </>
                    {/* =============================Point 4========================== */}
                    <>
                      <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                        <div className="flex gap-4 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold">
                            4
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold">
                            Arah Serat
                          </label>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Label Tercantum
                        </label>
                        <div className="flex flex-col gap-2 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Lihat Ukuran
                          </label>
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Sesuai arah serat di surat jalan
                          </label>
                        </div>

                        <div className="flex justify-between  col-span-3">
                          <div className="flex flex-col  w-[60%]">
                            {!incoming?.inspeksi_bahan_result[3]?.send ? (
                              <>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[3].hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })
                                      sethHasil4(e.target.value);
                                    }}
                                    type="radio"
                                    id="panjang1"
                                    name="pp1"
                                    value="Panjang"
                                  />
                                  <label className="pl-2">Panjang</label>
                                </div>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[3].hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })
                                      sethHasil4(e.target.value);
                                    }}
                                    type="radio"
                                    id="panjang2"
                                    name="pp1"
                                    value="Pendek"
                                  />
                                  <label className="pl-2">Pendek</label>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-neutral-500 text-sm font-semibold">
                                  {incoming?.inspeksi_bahan_result[3].hasil}
                                </p>
                              </>
                            )}
                          </div>
                          <div className="flex flex-col gap-1  w-[50%]">
                            {!incoming?.inspeksi_bahan_result[3]?.send ? (
                              <>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[3].keterangan_hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      setkh4(e.target.value);
                                    }}
                                    type="radio"
                                    id="sspoint33"
                                    name="sspoint33"
                                    value="sesuai"
                                  />
                                  <label className="pl-2">Sesuai</label>
                                </div>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[3].keterangan_hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      setkh4(e.target.value);
                                    }}
                                    type="radio"
                                    id="ssspoint3"
                                    name="sspoint33"
                                    value="tidak sesuai"
                                  />
                                  <label className="pl-2">Tidak Sesuai</label>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-neutral-500 text-sm font-semibold">
                                  {
                                    incoming?.inspeksi_bahan_result[3]
                                      .keterangan_hasil
                                  }
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                          {incoming?.inspeksi_bahan_result[3].bobot}
                        </label>
                      </div>
                      <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                        <div className="col-span-4">
                          {!incoming?.inspeksi_bahan_result[3]?.send ? (
                            <>
                              <div className="flex flex-col ">
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  Upload Foto (Optional):
                                </p>

                                <br />
                                <div className="">
                                  <input
                                    type="file"
                                    name=""
                                    id=""
                                    className="w-60"
                                  />
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex flex-col ">
                                <p className="md:text-[14px] text-[9px] font-semibold">
                                  Upload Foto (Optional):
                                </p>

                                <br />
                                <div className="">
                                  <input
                                    disabled
                                    type="file"
                                    name=""
                                    id=""
                                    className="w-60"
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="col-span-6 justify-end  w-full h-full flex items-center">
                          {!incoming?.inspeksi_bahan_result[3]?.send ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  submitPoint4(
                                    incoming?.inspeksi_bahan_result[3].id,
                                  );
                                }}
                                className="flex w-[30%] h-[50%] text-white font-semibold rounded-md bg-blue-600 justify-center items-center px-2 py-2 hover:cursor-pointer"
                              >
                                Simpan
                              </button>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    </>
                    {/* =============================Point 5========================== */}
                    <>
                      <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                        <div className="flex gap-4 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold">
                            5
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold">
                            Coating Depan
                          </label>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Kaca Pembesar
                        </label>
                        <div className="flex flex-col gap-2 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Lihat Ukuran
                          </label>
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Visual
                          </label>
                        </div>

                        <div className="flex justify-between  col-span-3">
                          <div className="flex flex-col  w-[60%]">
                            {!incoming?.inspeksi_bahan_result[4]?.send ? (
                              <>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[4].hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      sethHasil5(e.target.value);
                                    }}
                                    type="radio"
                                    id="ok1"
                                    name="ok1"
                                    value="Ok"
                                  />
                                  <label className="pl-2">Ok</label>
                                </div>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[4].hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })
                                      sethHasil5(e.target.value);
                                    }}
                                    type="radio"
                                    id="ok12"
                                    name="ok1"
                                    value="Not Ok"
                                  />
                                  <label className="pl-2">Not Ok</label>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-neutral-500 text-sm font-semibold">
                                  {incoming?.inspeksi_bahan_result[4].hasil}
                                </p>
                              </>
                            )}
                          </div>
                          <div className="flex flex-col gap-1  w-[50%]">
                            <label className="text-neutral-500 text-sm font-semibold">
                              {!incoming?.inspeksi_bahan_result[4]?.send ? (
                                <>
                                  <select
                                    id="coatingSelect"
                                    onChange={(e) => {
                                      let array = [
                                        ...incoming?.inspeksi_bahan_result,
                                      ];
                                      if (e.target.value === 'Hapus') {
                                        e.target.value = ''; // Reset select
                                        const inputText =
                                          document.getElementById(
                                            'inputText',
                                          ) as HTMLInputElement;
                                        inputText.value = '';
                                        inputText.hidden = false; // Enable input
                                      } else {
                                        // Update coating for other selections
                                        // array[4].coating = e.target.value;
                                        // setIncoming({ ...incoming, inspeksi_bahan_result: array });
                                        setCoating5(e.target.value);
                                        // Disable input if a non-"IVORY" value is selected
                                        const inputText =
                                          document.getElementById(
                                            'inputText',
                                          ) as HTMLInputElement;
                                        inputText.hidden = true;
                                      }
                                      console.log(
                                        ...incoming?.inspeksi_bahan_result[4]
                                          .coating,
                                      );
                                    }}
                                  >
                                    <option disabled selected>
                                      Select Result
                                    </option>
                                    <option value="BERGARIS">BERGARIS</option>
                                    <option value="JAMUR">JAMUR</option>
                                    <option value="TITIK-TITIK">
                                      TITIK-TITIK
                                    </option>
                                    <option value="Hapus">Hapus</option>
                                  </select>

                                  <input
                                    type="text"
                                    id="inputText"
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result];
                                      // array[4].coating = e.target.value;
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array });

                                      setCoating5(e.target.value);
                                    }}
                                    className="border-2 border-stroke w-full rounded-sm"
                                  />

                                  {/* <select onChange={(e) => {
                                                                        let array = [...incoming?.inspeksi_bahan_result]
                                                                        array[4].coating = e.target.value
                                                                        setIncoming({ ...incoming, inspeksi_bahan_result: array })
                                                                    }}>
                                                                        <option disabled selected> Select Result</option>
                                                                        <option value={'BERGARIS'}>
                                                                            BERGARIS
                                                                        </option>
                                                                        <option value={'JAMUR'}>
                                                                            JAMUR
                                                                        </option>
                                                                        <option value={'TITIK-TITIK'}>
                                                                            TITIK-TITIK
                                                                        </option>

                                                                    </select> */}
                                </>
                              ) : (
                                <>
                                  <div className="flex flex-col gap-1">
                                    <p>
                                      {
                                        incoming?.inspeksi_bahan_result[4]
                                          ?.coating
                                      }
                                    </p>
                                  </div>
                                </>
                              )}
                            </label>
                            {!incoming?.inspeksi_bahan_result[4]?.send ? (
                              <>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[4].keterangan_hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      setkh5(e.target.value);
                                    }}
                                    type="radio"
                                    id="sspoint5"
                                    name="sspoint5"
                                    value="sesuai"
                                  />
                                  <label className="pl-2">Sesuai</label>
                                </div>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[4].keterangan_hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      setkh5(e.target.value);
                                    }}
                                    type="radio"
                                    id="ssspoint5"
                                    name="sspoint5"
                                    value="tidak sesuai"
                                  />
                                  <label className="pl-2">Tidak Sesuai</label>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-neutral-500 text-sm font-semibold">
                                  {
                                    incoming?.inspeksi_bahan_result[4]
                                      .keterangan_hasil
                                  }
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                          {incoming?.inspeksi_bahan_result[4].bobot}
                        </label>
                      </div>
                      <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                        <div className="col-span-4">
                          <div className="flex flex-col ">
                            {!incoming?.inspeksi_bahan_result[4]?.send ? (
                              <>
                                <div className="flex flex-col ">
                                  <p className="md:text-[14px] text-[9px] font-semibold">
                                    Upload Foto (Optional):
                                  </p>

                                  <br />
                                  <div className="">
                                    <input
                                      type="file"
                                      name=""
                                      id=""
                                      className="w-60"
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex flex-col ">
                                  <p className="md:text-[14px] text-[9px] font-semibold">
                                    Upload Foto (Optional):
                                  </p>

                                  <br />
                                  <div className="">
                                    <input
                                      disabled
                                      type="file"
                                      name=""
                                      id=""
                                      className="w-60"
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="col-span-6 justify-end  w-full h-full flex items-center">
                          {!incoming?.inspeksi_bahan_result[4]?.send ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  submitPoint5(
                                    incoming?.inspeksi_bahan_result[4].id,
                                  );
                                  // sumbitPoint(incoming?.inspeksi_bahan_result[4]);
                                }}
                                className="flex w-[30%] h-[50%] text-white font-semibold rounded-md bg-blue-600 justify-center items-center px-2 py-2 hover:cursor-pointer"
                              >
                                Simpan
                              </button>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    </>

                    {/* =============================Point 6========================== */}
                    <>
                      <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                        <div className="flex gap-4 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold">
                            6
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold">
                            Ukuran
                          </label>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Mistar/Penggaris
                        </label>
                        <div className="flex flex-col gap-2 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Diukur panjang dan lebar
                          </label>
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Sesuai size di surat jalan, toleransi tidak boleh
                            &lt;= 2mm
                          </label>
                        </div>

                        <div className="flex justify-between  col-span-3">
                          <div className="flex flex-col  w-[60%]">
                            {!incoming?.inspeksi_bahan_result[5]?.send ? (
                              <>
                                <label className="text-neutral-500 text-sm font-semibold ">
                                  Panjang
                                </label>
                                <input
                                  onChange={(e) => {
                                    // let array = [...incoming?.inspeksi_bahan_result]
                                    // array[5].hasil_panjang = e.target.value

                                    // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                    sethhasilPanjang6(e.target.value);
                                  }}
                                  type="number"
                                  className="border-2 border-stroke w-[80%] rounded-sm"
                                />
                                <label className="text-neutral-500 text-sm font-semibold pt-1">
                                  Lebar
                                </label>
                                <input
                                  type="number"
                                  onChange={(e) => {
                                    // let array = [...incoming?.inspeksi_bahan_result]
                                    // array[5].hasil_lebar = e.target.value

                                    // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                    sethasilLebar6(e.target.value);
                                  }}
                                  className="border-2 border-stroke w-[80%] rounded-sm"
                                />
                              </>
                            ) : (
                              <>
                                <div className="flex flex-col gap-1">
                                  <label className="text-neutral-500 text-sm font-semibold ">
                                    Panjang
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold ">
                                    {
                                      incoming?.inspeksi_bahan_result[5]
                                        .hasil_panjang
                                    }{' '}
                                    MM
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold pt-1">
                                    Lebar
                                  </label>
                                  <label className="text-neutral-500 text-sm font-semibold ">
                                    {
                                      incoming?.inspeksi_bahan_result[5]
                                        .hasil_lebar
                                    }{' '}
                                    MM
                                  </label>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex flex-col gap-1  w-[50%]">
                            {!incoming?.inspeksi_bahan_result[5]?.send ? (
                              <>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[5].keterangan_hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      setkh6(e.target.value);
                                    }}
                                    type="radio"
                                    id="sspoint6"
                                    name="sspoint6"
                                    value="sesuai"
                                  />
                                  <label className="pl-2">Sesuai</label>
                                </div>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[5].keterangan_hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      setkh6(e.target.value);
                                    }}
                                    type="radio"
                                    id="ssspoint6"
                                    name="sspoint6"
                                    value="tidak sesuai"
                                  />
                                  <label className="pl-2">Tidak Sesuai</label>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-neutral-500 text-sm font-semibold">
                                  {
                                    incoming?.inspeksi_bahan_result[5]
                                      .keterangan_hasil
                                  }
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                          {incoming?.inspeksi_bahan_result[5].bobot}
                        </label>
                      </div>
                      <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                        <div className="col-span-4">
                          <div className="flex flex-col ">
                            {!incoming?.inspeksi_bahan_result[5]?.send ? (
                              <>
                                <div className="flex flex-col ">
                                  <p className="md:text-[14px] text-[9px] font-semibold">
                                    Upload Foto (Optional):
                                  </p>

                                  <br />
                                  <div className="">
                                    <input
                                      type="file"
                                      name=""
                                      id=""
                                      className="w-60"
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex flex-col ">
                                  <p className="md:text-[14px] text-[9px] font-semibold">
                                    Upload Foto (Optional):
                                  </p>

                                  <br />
                                  <div className="">
                                    <input
                                      disabled
                                      type="file"
                                      name=""
                                      id=""
                                      className="w-60"
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="col-span-6 justify-end  w-full h-full flex items-center">
                          {!incoming?.inspeksi_bahan_result[5]?.send ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();

                                  submitPoint6(
                                    incoming?.inspeksi_bahan_result[5].id,
                                  );
                                }}
                                className="flex w-[30%] h-[50%] text-white font-semibold rounded-md bg-blue-600 justify-center items-center px-2 py-2 hover:cursor-pointer"
                              >
                                Simpan
                              </button>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    </>
                    {/* =============================Point 7========================== */}
                    <>
                      <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                        <div className="flex gap-4 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold">
                            7
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold">
                            Gelombang
                          </label>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Penggaris
                        </label>
                        <div className="flex flex-col gap-2 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Toleransi melengkung / gelombanng = &#xb1; 8mm
                          </label>
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            -
                          </label>
                        </div>

                        <div className="flex justify-between  col-span-3">
                          <div className="flex flex-col  w-[60%]">
                            {!incoming?.inspeksi_bahan_result[6]?.send ? (
                              <>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[6].hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      sethHasil7(e.target.value);
                                    }}
                                    type="radio"
                                    id="toleransi1"
                                    name="toleransi1"
                                    value="Toleransi"
                                  />
                                  <label className="pl-2">Toleransi</label>
                                </div>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[6].hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      sethHasil7(e.target.value);
                                    }}
                                    type="radio"
                                    id="toleransi2"
                                    name="toleransi1"
                                    value="Not Toleransi"
                                  />
                                  <label className="pl-2">Not Toleransi</label>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-neutral-500 text-sm font-semibold">
                                  {incoming?.inspeksi_bahan_result[6].hasil}
                                </p>
                              </>
                            )}
                          </div>
                          <div className="flex flex-col gap-1  w-[50%]">
                            {!incoming?.inspeksi_bahan_result[6]?.send ? (
                              <>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[6].keterangan_hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      setkh7(e.target.value);
                                    }}
                                    type="radio"
                                    id="sspoint7"
                                    name="sspoint7"
                                    value="sesuai"
                                  />
                                  <label className="pl-2">Sesuai</label>
                                </div>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[6].keterangan_hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      setkh7(e.target.value);
                                    }}
                                    type="radio"
                                    id="ssspoint7"
                                    name="sspoint7"
                                    value="tidak sesuai"
                                  />
                                  <label className="pl-2">Tidak Sesuai</label>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-neutral-500 text-sm font-semibold">
                                  {
                                    incoming?.inspeksi_bahan_result[6]
                                      .keterangan_hasil
                                  }
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                          {incoming?.inspeksi_bahan_result[6].bobot}
                        </label>
                      </div>
                      <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                        <div className="col-span-4">
                          <div className="flex flex-col ">
                            {!incoming?.inspeksi_bahan_result[6]?.send ? (
                              <>
                                <div className="flex flex-col ">
                                  <p className="md:text-[14px] text-[9px] font-semibold">
                                    Upload Foto (Optional):
                                  </p>

                                  <br />
                                  <div className="">
                                    <input
                                      type="file"
                                      name=""
                                      id=""
                                      className="w-60"
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex flex-col ">
                                  <p className="md:text-[14px] text-[9px] font-semibold">
                                    Upload Foto (Optional):
                                  </p>

                                  <br />
                                  <div className="">
                                    <input
                                      disabled
                                      type="file"
                                      name=""
                                      id=""
                                      className="w-60"
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="col-span-6 justify-end  w-full h-full flex items-center">
                          {!incoming?.inspeksi_bahan_result[6]?.send ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  submitPoint7(
                                    incoming?.inspeksi_bahan_result[6].id,
                                  );
                                  // sumbitPoint(incoming?.inspeksi_bahan_result[6]);
                                }}
                                className="flex w-[30%] h-[50%] text-white font-semibold rounded-md bg-blue-600 justify-center items-center px-2 py-2 hover:cursor-pointer"
                              >
                                Simpan
                              </button>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    </>
                    {/* =============================Point 8========================== */}
                    <>
                      <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                        <div className="flex gap-4 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold">
                            8
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold">
                            Warna
                          </label>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Color Tolerance / Sample
                        </label>
                        <div className="flex flex-col gap-2 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Visual
                          </label>
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Warna Dasar Sesuai
                          </label>
                        </div>

                        <div className="flex justify-between  col-span-3">
                          <div className="flex flex-col  w-[60%]">
                            {!incoming?.inspeksi_bahan_result[7]?.send ? (
                              <>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[7].hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      sethHasil8(e.target.value);
                                    }}
                                    type="radio"
                                    id="okpoint8"
                                    name="okpoint8"
                                    value="ok"
                                  />
                                  <label className="pl-2">Ok</label>
                                </div>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[7].hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      sethHasil8(e.target.value);
                                    }}
                                    type="radio"
                                    id="sokpoint8"
                                    name="okpoint8"
                                    value="not ok"
                                  />
                                  <label className="pl-2">Not OK</label>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-neutral-500 text-sm font-semibold">
                                  {incoming?.inspeksi_bahan_result[7].hasil}
                                </p>
                              </>
                            )}
                          </div>
                          <div className="flex flex-col gap-1  w-[50%]">
                            {!incoming?.inspeksi_bahan_result[7]?.send ? (
                              <>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      let array = [
                                        ...incoming?.inspeksi_bahan_result,
                                      ];
                                      array[7].keterangan_hasil =
                                        e.target.value;
                                      setIncoming({
                                        ...incoming,
                                        inspeksi_bahan_result: array,
                                      });

                                      setkh8(e.target.value);
                                    }}
                                    type="radio"
                                    id="sspoint8"
                                    name="sspoint8"
                                    value="sesuai"
                                  />
                                  <label className="pl-2">Sesuai</label>
                                </div>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[7].keterangan_hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      setkh8(e.target.value);
                                    }}
                                    type="radio"
                                    id="ssspoint8"
                                    name="sspoint8"
                                    value="tidak sesuai"
                                  />
                                  <label className="pl-2">Tidak Sesuai</label>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-neutral-500 text-sm font-semibold">
                                  {
                                    incoming?.inspeksi_bahan_result[7]
                                      .keterangan_hasil
                                  }
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                          {incoming?.inspeksi_bahan_result[7].bobot}
                        </label>
                      </div>
                      <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                        <div className="col-span-4">
                          <div className="flex flex-col ">
                            {!incoming?.inspeksi_bahan_result[7]?.send ? (
                              <>
                                <div className="flex flex-col ">
                                  <p className="md:text-[14px] text-[9px] font-semibold">
                                    Upload Foto (Optional):
                                  </p>

                                  <br />
                                  <div className="">
                                    <input
                                      type="file"
                                      name=""
                                      id=""
                                      className="w-60"
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex flex-col ">
                                  <p className="md:text-[14px] text-[9px] font-semibold">
                                    Upload Foto (Optional):
                                  </p>

                                  <br />
                                  <div className="">
                                    <input
                                      disabled
                                      type="file"
                                      name=""
                                      id=""
                                      className="w-60"
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="col-span-6 justify-end  w-full h-full flex items-center">
                          {!incoming?.inspeksi_bahan_result[7]?.send ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();

                                  submitPoint8(
                                    incoming?.inspeksi_bahan_result[7].id,
                                  );
                                  // sumbitPoint(incoming?.inspeksi_bahan_result[7]);
                                }}
                                className="flex w-[30%] h-[50%] text-white font-semibold rounded-md bg-blue-600 justify-center items-center px-2 py-2 hover:cursor-pointer"
                              >
                                Simpan
                              </button>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    </>
                    {/* =============================Point 9========================== */}
                    <>
                      <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                        <div className="flex gap-4 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold">
                            9
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold">
                            Quantity
                          </label>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Hitung Manual
                        </label>
                        <div className="flex flex-col gap-2 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Sampling sesuai standard AQL
                          </label>
                        </div>
                        <div className="flex flex-col gap-2 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold col-span-2">
                            Sesuai per pack
                          </label>
                        </div>

                        <div className="flex justify-between  col-span-3">
                          <div className="flex flex-col  w-[60%]">
                            {!incoming?.inspeksi_bahan_result[8]?.send ? (
                              <>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[8].hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      sethHasil9(e.target.value);
                                    }}
                                    type="radio"
                                    id="okpoint9"
                                    name="okpoint9"
                                    value="ok"
                                  />
                                  <label className="pl-2">OK</label>
                                </div>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[8].hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      sethHasil9(e.target.value);
                                    }}
                                    type="radio"
                                    id="sokpoint9"
                                    name="okpoint9"
                                    value="not ok"
                                  />
                                  <label className="pl-2">Not Ok</label>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-neutral-500 text-sm font-semibold">
                                  {incoming?.inspeksi_bahan_result[8].hasil}
                                </p>
                              </>
                            )}
                          </div>
                          <div className="flex flex-col gap-1  w-[50%]">
                            {!incoming?.inspeksi_bahan_result[8]?.send ? (
                              <>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[8].keterangan_hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      setkh9(e.target.value);
                                    }}
                                    type="radio"
                                    id="sspoint9"
                                    name="sspoint9"
                                    value="sesuai"
                                  />
                                  <label className="pl-2">Sesuai</label>
                                </div>
                                <div>
                                  <input
                                    onChange={(e) => {
                                      // let array = [...incoming?.inspeksi_bahan_result]
                                      // array[8].keterangan_hasil = e.target.value
                                      // setIncoming({ ...incoming, inspeksi_bahan_result: array })

                                      setkh9(e.target.value);
                                    }}
                                    type="radio"
                                    id="ssspoint9"
                                    name="sspoint9"
                                    value="tidak sesuai"
                                  />
                                  <label className="pl-2">Tidak Sesuai</label>
                                </div>
                              </>
                            ) : (
                              <>
                                <p className="text-neutral-500 text-sm font-semibold">
                                  {
                                    incoming?.inspeksi_bahan_result[8]
                                      .keterangan_hasil
                                  }
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                          {incoming?.inspeksi_bahan_result[8].bobot}
                        </label>
                      </div>
                      <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                        <div className="col-span-4">
                          <div className="flex flex-col ">
                            {!incoming?.inspeksi_bahan_result[8]?.send ? (
                              <>
                                <div className="flex flex-col ">
                                  <p className="md:text-[14px] text-[9px] font-semibold">
                                    Upload Foto (Optional):
                                  </p>

                                  <br />
                                  <div className="">
                                    <input
                                      type="file"
                                      name=""
                                      id=""
                                      className="w-60"
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex flex-col ">
                                  <p className="md:text-[14px] text-[9px] font-semibold">
                                    Upload Foto (Optional):
                                  </p>

                                  <br />
                                  <div className="">
                                    <input
                                      disabled
                                      type="file"
                                      name=""
                                      id=""
                                      className="w-60"
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="col-span-6 justify-end  w-full h-full flex items-center">
                          {!incoming?.inspeksi_bahan_result[8]?.send ? (
                            <>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  submitPoint9(
                                    incoming?.inspeksi_bahan_result[8].id,
                                  );
                                  // sumbitPoint(incoming?.inspeksi_bahan_result[8]);
                                }}
                                className="flex w-[30%] h-[50%] text-white font-semibold rounded-md bg-blue-600 justify-center items-center px-2 py-2 hover:cursor-pointer"
                              >
                                Simpan
                              </button>
                            </>
                          ) : (
                            <></>
                          )}
                        </div>
                      </div>
                    </>
                  </>
                )}
            </>
            {/* =============================================Checksheet Stop==========================================================*/}
            {incoming?.waktu_mulai != null &&
              incoming?.waktu_selesai != null && (
                <>
                  <>
                    <form>
                      <div className="grid grid-cols-12 px-3 py-4 gap-2">
                        <div className="flex gap-4 col-span-2">
                          <label className="text-neutral-500 text-sm font-semibold">
                            1
                          </label>
                          <label className="text-neutral-500 text-sm font-semibold">
                            Jenis Kertas
                          </label>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          -
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Visual
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Sesuai Surat Jalan
                        </label>
                        <div className="flex justify-between  col-span-3">
                          <label className="text-neutral-500 text-sm font-semibold">
                            {incoming?.inspeksi_bahan_result[0]?.hasil}
                          </label>
                          <div className="flex flex-col gap-1  w-[50%]">
                            <div className="text-neutral-500 text-sm font-semibold">
                              {
                                incoming?.inspeksi_bahan_result[0]
                                  .keterangan_hasil
                              }
                            </div>
                          </div>
                        </div>
                        <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                          25
                        </label>
                      </div>
                      <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                        <div className="col-span-4">
                          <div className="flex flex-col ">
                            <p className="md:text-[14px] text-[9px] font-semibold">
                              Upload Foto (Optional):
                            </p>

                            <br />
                            <div className="">
                              <input
                                disabled
                                type="file"
                                name=""
                                id=""
                                className="w-60"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </form>
                  </>
                  {/* =============================Point 2========================== */}
                  <>
                    <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                      <div className="flex gap-4 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold">
                          2
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold">
                          Gramatur
                        </label>
                      </div>
                      <label className="text-neutral-500 text-sm font-semibold col-span-2">
                        Timbangan Digital
                      </label>
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Potong Kertas Ukuran 10x10cm di area KIRI, TENGAH,
                          KANAN
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Timbang Masing-Masing beratnya
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Jumlahkan dan hitung nilai rata-ratanya (KIRI &lt;
                          TENGAH &lt; KANAN : 3)
                        </label>
                      </div>
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Gramatur Sesuai Surat Jalan
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Toleransi &#xb1; 4%
                        </label>
                      </div>

                      <div className="flex justify-between  col-span-3">
                        <div className="flex flex-col  w-[60%]">
                          <div className="flex flex-col gap-1">
                            <label className="text-neutral-500 text-sm font-semibold ">
                              Kiri
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold ">
                              {incoming?.inspeksi_bahan_result[1].hasil_kiri} gr
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold pt-1">
                              Tengah
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold ">
                              {incoming?.inspeksi_bahan_result[1].hasil_tengah}{' '}
                              gr
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold pt-1">
                              Kanan
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold ">
                              {incoming?.inspeksi_bahan_result[1].hasil_kanan}{' '}
                              gr
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold pt-1">
                              Rata-Rata
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold ">
                              {
                                incoming?.inspeksi_bahan_result[1]
                                  .hasil_rata_rata
                              }{' '}
                              gr
                            </label>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1  w-[50%]">
                          <p className="text-neutral-500 text-sm font-semibold">
                            {
                              incoming?.inspeksi_bahan_result[1]
                                .keterangan_hasil
                            }
                          </p>
                        </div>
                      </div>
                      <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                        20
                      </label>
                    </div>
                    <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                      <div className="col-span-4">
                        <div className="flex flex-col ">
                          <p className="md:text-[14px] text-[9px] font-semibold">
                            Upload Foto (Optional):
                          </p>

                          <br />
                          <div className="">
                            <input
                              disabled
                              type="file"
                              name=""
                              id=""
                              className="w-60"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>

                  {/* =============================Point 3========================== */}
                  <>
                    <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                      <div className="flex gap-4 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold">
                          3
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold">
                          Thickness
                        </label>
                      </div>
                      <label className="text-neutral-500 text-sm font-semibold col-span-2">
                        Thickness Gauge
                      </label>
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Ukuran ketebalan Masing-Masing kertas yang sudah
                          dipotong di point-2
                        </label>
                      </div>
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          -
                        </label>
                      </div>

                      <div className="flex justify-between  col-span-3">
                        <div className="flex flex-col  w-[60%]">
                          <div className="flex flex-col gap-1">
                            <label className="text-neutral-500 text-sm font-semibold ">
                              Kiri
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold ">
                              {incoming?.inspeksi_bahan_result[2].hasil_kiri} MM
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold pt-1">
                              Tengah
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold ">
                              {incoming?.inspeksi_bahan_result[2].hasil_tengah}{' '}
                              MM
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold pt-1">
                              Kanan
                            </label>
                            <label className="text-neutral-500 text-sm font-semibold ">
                              {incoming?.inspeksi_bahan_result[2].hasil_kanan}{' '}
                              MM
                            </label>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1  w-[50%]">
                          <p className="text-neutral-500 text-sm font-semibold">
                            {
                              incoming?.inspeksi_bahan_result[2]
                                .keterangan_hasil
                            }
                          </p>
                        </div>
                      </div>
                      <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                        15
                      </label>
                    </div>
                    <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                      <div className="col-span-4">
                        <div className="flex flex-col ">
                          <p className="md:text-[14px] text-[9px] font-semibold">
                            Upload Foto (Optional):
                          </p>

                          <br />
                          <div className="">
                            <input
                              disabled
                              type="file"
                              name=""
                              id=""
                              className="w-60"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                  {/* =============================Point 4========================== */}
                  <>
                    <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                      <div className="flex gap-4 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold">
                          4
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold">
                          Arah Serat
                        </label>
                      </div>
                      <label className="text-neutral-500 text-sm font-semibold col-span-2">
                        Label Tercantum
                      </label>
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Lihat Ukuran
                        </label>
                      </div>
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Sesuai arah serat di surat jalan
                        </label>
                      </div>

                      <div className="flex justify-between  col-span-3">
                        <div className="flex flex-col  w-[60%]">
                          <p className="text-neutral-500 text-sm font-semibold">
                            {incoming?.inspeksi_bahan_result[3].hasil}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1  w-[50%]">
                          <p className="text-neutral-500 text-sm font-semibold">
                            {
                              incoming?.inspeksi_bahan_result[3]
                                .keterangan_hasil
                            }
                          </p>
                        </div>
                      </div>
                      <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                        10
                      </label>
                    </div>
                    <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                      <div className="col-span-4">
                        <div className="flex flex-col ">
                          <p className="md:text-[14px] text-[9px] font-semibold">
                            Upload Foto (Optional):
                          </p>

                          <br />
                          <div className="">
                            <input
                              disabled
                              type="file"
                              name=""
                              id=""
                              className="w-60"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                  {/* =============================Point 5========================== */}
                  <>
                    <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                      <div className="flex gap-4 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold">
                          5
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold">
                          Coating Depan
                        </label>
                      </div>
                      <label className="text-neutral-500 text-sm font-semibold col-span-2">
                        Kaca Pembesar
                      </label>
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Lihat Ukuran
                        </label>
                      </div>
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Visual
                        </label>
                      </div>

                      <div className="flex justify-between  col-span-3">
                        <div className="flex flex-col  w-[60%]">
                          <p className="text-neutral-500 text-sm font-semibold">
                            {incoming?.inspeksi_bahan_result[4].hasil}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1  w-[50%]">
                          <label className="text-neutral-500 text-sm font-semibold">
                            <div className="flex flex-col gap-1">
                              <p>
                                {incoming?.inspeksi_bahan_result[4]?.coating}
                              </p>
                            </div>
                          </label>

                          <p className="text-neutral-500 text-sm font-semibold">
                            {
                              incoming?.inspeksi_bahan_result[4]
                                .keterangan_hasil
                            }
                          </p>
                        </div>
                      </div>
                      <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                        10
                      </label>
                    </div>
                    <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                      <div className="col-span-4">
                        <div className="flex flex-col ">
                          <div className="flex flex-col ">
                            <p className="md:text-[14px] text-[9px] font-semibold">
                              Upload Foto (Optional):
                            </p>

                            <br />
                            <div className="">
                              <input
                                disabled
                                type="file"
                                name=""
                                id=""
                                className="w-60"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>

                  {/* =============================Point 6========================== */}
                  <>
                    <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                      <div className="flex gap-4 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold">
                          6
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold">
                          Ukuran
                        </label>
                      </div>
                      <label className="text-neutral-500 text-sm font-semibold col-span-2">
                        Mistar/Penggaris
                      </label>
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Diukur panjang dan lebar
                        </label>
                      </div>
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Sesuai size di surat jalan, toleransi tidak boleh
                          &lt;= 2mm
                        </label>
                      </div>

                      <div className="flex justify-between  col-span-3">
                        <div className="flex flex-col  w-[60%]">
                          <div className="flex flex-col gap-1 font-semibold  text-sm">
                            <p>
                              {incoming?.inspeksi_bahan_result[5]?.hasil} MM
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1  w-[50%]">
                          <p className="text-neutral-500 text-sm font-semibold">
                            {
                              incoming?.inspeksi_bahan_result[5]
                                .keterangan_hasil
                            }
                          </p>
                        </div>
                      </div>
                      <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                        5
                      </label>
                    </div>
                    <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                      <div className="col-span-4">
                        <div className="flex flex-col ">
                          <div className="flex flex-col ">
                            <p className="md:text-[14px] text-[9px] font-semibold">
                              Upload Foto (Optional):
                            </p>

                            <br />
                            <div className="">
                              <input
                                disabled
                                type="file"
                                name=""
                                id=""
                                className="w-60"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                  {/* =============================Point 7========================== */}
                  <>
                    <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                      <div className="flex gap-4 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold">
                          7
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold">
                          Gelombang
                        </label>
                      </div>
                      <label className="text-neutral-500 text-sm font-semibold col-span-2">
                        Penggaris
                      </label>
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Toleransi melengkung / gelombanng = &#xb1; 8mm
                        </label>
                      </div>
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          -
                        </label>
                      </div>

                      <div className="flex justify-between  col-span-3">
                        <div className="flex flex-col  w-[60%]">
                          <p className="text-neutral-500 text-sm font-semibold">
                            {incoming?.inspeksi_bahan_result[6].hasil}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1  w-[50%]">
                          <p className="text-neutral-500 text-sm font-semibold">
                            {
                              incoming?.inspeksi_bahan_result[6]
                                .keterangan_hasil
                            }
                          </p>
                        </div>
                      </div>
                      <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                        5
                      </label>
                    </div>
                    <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                      <div className="col-span-4">
                        <div className="flex flex-col ">
                          <div className="flex flex-col ">
                            <p className="md:text-[14px] text-[9px] font-semibold">
                              Upload Foto (Optional):
                            </p>

                            <br />
                            <div className="">
                              <input
                                disabled
                                type="file"
                                name=""
                                id=""
                                className="w-60"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                  {/* =============================Point 8========================== */}
                  <>
                    <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                      <div className="flex gap-4 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold">
                          8
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold">
                          Warna
                        </label>
                      </div>
                      <label className="text-neutral-500 text-sm font-semibold col-span-2">
                        Color Tolerance / Sample
                      </label>
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Visual
                        </label>
                      </div>
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Warna Dasar Sesuai
                        </label>
                      </div>

                      <div className="flex justify-between  col-span-3">
                        <div className="flex flex-col  w-[60%]">
                          <p className="text-neutral-500 text-sm font-semibold">
                            {incoming?.inspeksi_bahan_result[7].hasil}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1  w-[50%]">
                          <p className="text-neutral-500 text-sm font-semibold">
                            {
                              incoming?.inspeksi_bahan_result[7]
                                .keterangan_hasil
                            }
                          </p>
                        </div>
                      </div>
                      <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                        5
                      </label>
                    </div>
                    <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                      <div className="col-span-4">
                        <div className="flex flex-col ">
                          <div className="flex flex-col ">
                            <p className="md:text-[14px] text-[9px] font-semibold">
                              Upload Foto (Optional):
                            </p>

                            <br />
                            <div className="">
                              <input
                                disabled
                                type="file"
                                name=""
                                id=""
                                className="w-60"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                  {/* =============================Point 9========================== */}
                  <>
                    <div className="grid grid-cols-12 px-3 py-4 gap-2 ">
                      <div className="flex gap-4 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold">
                          9
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold">
                          Quantity
                        </label>
                      </div>
                      <label className="text-neutral-500 text-sm font-semibold col-span-2">
                        Hitung Manual
                      </label>
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Sampling sesuai standard AQL
                        </label>
                      </div>
                      <div className="flex flex-col gap-2 col-span-2">
                        <label className="text-neutral-500 text-sm font-semibold col-span-2">
                          Sesuai per pack
                        </label>
                      </div>

                      <div className="flex justify-between  col-span-3">
                        <div className="flex flex-col  w-[60%]">
                          <p className="text-neutral-500 text-sm font-semibold">
                            {incoming?.inspeksi_bahan_result[8].hasil}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1  w-[50%]">
                          <p className="text-neutral-500 text-sm font-semibold">
                            {
                              incoming?.inspeksi_bahan_result[8]
                                .keterangan_hasil
                            }
                          </p>
                        </div>
                      </div>
                      <label className="text-neutral-500 text-sm font-semibold flex justify-center">
                        5
                      </label>
                    </div>
                    <div className="grid grid-cols-10 bg-[#F5F5F5] px-10 py-4 border-b-8 border-[#D8EAFF]">
                      <div className="col-span-4">
                        <div className="flex flex-col ">
                          <div className="flex flex-col ">
                            <p className="md:text-[14px] text-[9px] font-semibold">
                              Upload Foto (Optional):
                            </p>

                            <br />
                            <div className="">
                              <input
                                disabled
                                type="file"
                                name=""
                                id=""
                                className="w-60"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                </>
              )}
          </div>
          {incoming?.waktu_mulai != null && incoming?.waktu_selesai != null && (
            <>
              <div className="bg-white flex w-full justify-between px-4 py-4">
                <div className="flex flex-col">
                  {incoming?.verifikasi == null ? (
                    <>
                      <div>
                        <input
                          onChange={(e) => {
                            setVerifikasi(e.target.value);
                          }}
                          type="radio"
                          id="ssVerifikasi"
                          name="ssVerifikasi"
                          value="Diterima"
                        />
                        <label className="pl-2">Diterima</label>
                      </div>
                      <div>
                        <input
                          onChange={(e) => {
                            setVerifikasi(e.target.value);
                          }}
                          type="radio"
                          id="sssVerifikasi"
                          name="ssVerifikasi"
                          value=" Ditolak"
                        />
                        <label className="pl-2">Ditolak</label>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-neutral-500 text-sm font-semibold">
                        {incoming?.verifikasi}
                      </p>
                    </>
                  )}
                </div>
                <div className="flex w-[50%] flex-col">
                  <label className="text-neutral-500 text-sm font-semibold flex flex-col w-full">
                    Catatan
                    {incoming?.catatan == null ? (
                      <>
                        <textarea
                          onChange={(e) => {
                            setCtt(e.target.value);
                          }}
                          className="peer  resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                        ></textarea>
                      </>
                    ) : (
                      <>: {incoming?.catatan}</>
                    )}
                  </label>
                </div>
                <div>
                  {incoming.status == 'incoming' ? (
                    <>
                      <label className="text-neutral-500 text-sm font-semibold flex flex-col w-full">
                        Total Skor : {incoming?.total_skor}
                      </label>
                    </>
                  ) : (
                    <>
                      <label className="text-neutral-500 text-sm font-semibold flex flex-col w-full">
                        Total Skor : {incoming?.total_skor}
                      </label>
                    </>
                  )}
                </div>
                <div>
                  {incoming.status == 'incoming' ? (
                    <>
                      <button
                        onClick={() => {
                          sumbitChecksheet(incoming?.id);
                        }}
                        className="bg-[#0065DE] px-4 py-2 rounded-sm text-center text-white text-xs font-bold"
                      >
                        SUBMIT CHECKSHEET
                      </button>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      )}
    </>
  );
}

export default IncomingInspection;
