import axios from 'axios';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import ModalTambahUser from '../../Modals/Master/User/ModalTambahUser';
import ModalConfDelete from '../../Modals/Master/User/ModalConfDelete';

const TableUser = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [user, setuser] = useState<any>();
  const [currentUserBagian, setCurrentUserBagian] = useState<string>('');

  // Edit modal states
  const [showEdit, setShowEdit] = useState<any>([]);
  const [editData, setEditData] = useState<any>(null);
  const [editId, setEditId] = useState<number | null>(null);

  // Edit form states
  const [email, setEmail] = useState('');
  const [bagian, setBagian] = useState('');
  const [nama, setNama] = useState('');
  const [no, setNo] = useState('');
  const [role, setRole] = useState('');
  const [password1, setPassword1] = useState<any>('');
  const [mainRole, setmainRole] = useState<any>('');
  const [confpassword1, setConfPassword1] = useState<any>('');
  const [options, setOptions] = useState([]);
  const [id_karyawan1, setId_karyawan] = useState<any>();
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
  const [defectMaster, setDefectMaster] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    getMe();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (currentUserBagian) {
      getuser();
    }
  }, [currentUserBagian]);

  // Get current user data
  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setCurrentUserBagian(res.data.bagian);
      setmainRole(res.data.role);
    } catch (error: any) {
      console.log(error);
    }
  }

  async function getuser() {
    const url = `${import.meta.env.VITE_API_LINK}/users`;
    try {
      const res = await axios.get(url, {
        params: {
          status: 'aktif',
          bagian: currentUserBagian,
        },
        withCredentials: true,
      });

      setuser(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data?.msg);
    }
  }

  async function getKaryawan() {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setDefectMaster(res.data.data);
      setOptions(
        res.data?.data?.map((item: any) => ({
          value: item.biodata_karyawan[0]?.id_karyawan,
          label: item.biodata_karyawan[0]?.nik + ' - ' + item.name,
        })),
      );
    } catch (error: any) {
      console.log(error);
    }
  }

  const openEdit = (i: any, data: any) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = true;
    setShowEdit(onchangeVal);

    // Set edit form data
    setEditData(data);
    setEditId(data.uuid);
    setEmail(data.email);
    setNama(data.nama);
    setBagian(data.bagian);
    setNo(data.no);
    setRole(data.role);
    setPassword1('');
    setConfPassword1('');

    // Load karyawan data
    getKaryawan();
  };

  const closeEdit = (i: any) => {
    const onchangeVal: any = [...showEdit];
    onchangeVal[i] = false;
    setShowEdit(onchangeVal);

    // Reset form data
    setEditData(null);
    setEditId(null);
    setEmail('');
    setNama('');
    setBagian('');
    setNo('');
    setRole('');
    setPassword1('');
    setConfPassword1('');
  };

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

  const handleChangePointDepatment = (selected: any) => {
    const { value } = selected;
    const filteredData = defectMaster.find(
      (item: any) => item.biodata_karyawan[0]?.id_karyawan == value,
    );
    setId_karyawan(filteredData?.biodata_karyawan[0]?.id_karyawan);
  };

  async function submitEditUser(id: number) {
    const url = `${import.meta.env.VITE_API_LINK}/users/${id}`;

    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {
          email: email,
          nama: nama,
          bagian: bagian,
          no: no,
          role: role,
          password: password1,
          confPassword: confpassword1,
          id_karyawan: id_karyawan1,
        },
        {
          withCredentials: true,
        },
      );
      console.log(res.data);
      setIsLoading(false);
      alert(res.data.msg);
      getuser();
      // Close modal
      const editIndex = user.findIndex((u: any) => u.uuid === id);
      if (editIndex !== -1) {
        closeEdit(editIndex);
      }
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
    }
  }

  // Get available bagian options based on current user's bagian
  const getBagianOptions = () => {
    const bagianLower = currentUserBagian.toLowerCase();
    if (bagianLower === 'maintenance') {
      return [{ value: 'maintenance', label: 'Maintenance' }];
    } else if (bagianLower === 'hr') {
      return [{ value: 'hr', label: 'HR' }];
    } else if (bagianLower === 'quality control') {
      return [{ value: 'quality control', label: 'Quality Control' }];
    } else if (bagianLower === 'ppic') {
      return [{ value: 'ppic', label: 'PPIC' }];
    }
    return [];
  };

  // Get available role options based on bagian
  const getRoleOptions = () => {
    const bagianLower = bagian.toLowerCase();
    const commonRoles = [
      { value: 'section head', label: 'Section Head' },
      { value: 'supervisor', label: 'Supervisor' },
      { value: 'admin', label: 'Admin' },
    ];

    if (bagianLower === 'maintenance') {
      return [
        ...commonRoles,
        { value: 'senior technician', label: 'Senior Technician' },
        { value: 'shift technician', label: 'Shift Technician' },
        { value: 'junior technician', label: 'Junior Technician' },
      ];
    } else if (bagianLower === 'hr') {
      return [...commonRoles, { value: 'payroll', label: 'Payroll' }];
    } else if (bagianLower === 'quality control') {
      return [
        ...commonRoles,
        { value: 'inspector', label: 'Inspector' },
        { value: 'prepress', label: 'Prepress' },
      ];
    } else if (bagianLower === 'ppic') {
      return commonRoles;
    }
    return commonRoles;
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

  const [showModalTambah, setShowModalTambah] = useState(false);
  const openModalTambah = () => setShowModalTambah(true);
  const closeModalTambah = () => setShowModalTambah(false);

  return (
    <div className="rounded-xl border border-stroke bg-white pt-4 shadow-default dark:border-strokedark dark:bg-boxdark xl:pb-1">
      {/* Edit Modal */}
      {editData && (
        <div className="fixed z-50 inset-0 h-full backdrop-blur-sm bg-white/10 p-4 md:p-8 flex justify-center items-center">
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-md max-h-screen overflow-y-auto">
            <div className="flex w-full items-center pt-4 px-3">
              <svg
                className="flex w-12"
                width="20"
                height="19"
                viewBox="0 0 20 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.55799 4.51474L8.56073 8.46883M4.55799 4.51474H1.8895L1 1.87869L1.8895 1L4.55799 1.87869V4.51474ZM16.3518 1.65111L14.0146 3.95997C13.6623 4.30794 13.4861 4.48192 13.4202 4.68255C13.3621 4.85904 13.3621 5.04913 13.4202 5.22562C13.4861 5.42625 13.6623 5.60023 14.0146 5.94821L14.2256 6.15668C14.5778 6.50466 14.754 6.67864 14.9571 6.74383C15.1357 6.80117 15.3282 6.80117 15.5068 6.74383C15.7099 6.67864 15.8861 6.50466 16.2383 6.15668L18.4246 3.99695C18.6601 4.56297 18.7899 5.18289 18.7899 5.83277C18.7899 8.50187 16.5996 10.6655 13.8977 10.6655C13.572 10.6655 13.2536 10.6341 12.9458 10.5741C12.5133 10.4899 12.2971 10.4477 12.166 10.4606C12.0267 10.4743 11.958 10.495 11.8345 10.5603C11.7184 10.6217 11.6019 10.7367 11.3689 10.9669L5.00274 17.2557C4.26585 17.9836 3.07113 17.9836 2.33425 17.2557C1.59736 16.5278 1.59736 15.3475 2.33425 14.6196L8.70038 8.33088C8.93343 8.10066 9.04986 7.9856 9.11204 7.87088C9.17813 7.7489 9.19903 7.68106 9.21291 7.54341C9.22598 7.41392 9.18329 7.20034 9.09807 6.77318C9.03732 6.46899 9.00548 6.15456 9.00548 5.83277C9.00548 3.1637 11.1958 1 13.8977 1C14.7921 1 15.6305 1.23709 16.3518 1.65111ZM9.89506 12.4228L14.7872 17.2556C15.5241 17.9835 16.7188 17.9835 17.4557 17.2556C18.1926 16.5277 18.1926 15.3474 17.4557 14.6195L13.431 10.6438C13.1461 10.6172 12.8683 10.5664 12.5998 10.4936C12.2537 10.3997 11.874 10.4679 11.6203 10.7185L9.89506 12.4228Z"
                  stroke="#0065DE"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <label className="flex w-11/12 text-blue-700 text-sm font-bold">
                Form Edit Master User
              </label>
              <button
                type="button"
                onClick={() => {
                  const editIndex = user.findIndex(
                    (u: any) => u.uuid === editId,
                  );
                  if (editIndex !== -1) {
                    closeEdit(editIndex);
                  }
                }}
                className="text-gray-400 focus:outline-none"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="11" cy="11" r="11" fill="#0065DE" />
                  <rect
                    x="6.03955"
                    y="4.23242"
                    width="17"
                    height="3"
                    rx="1.5"
                    transform="rotate(42.8321 6.03955 4.23242)"
                    fill="white"
                  />
                  <rect
                    x="4.18213"
                    y="16.0609"
                    width="17"
                    height="3"
                    rx="1.5"
                    transform="rotate(-45 4.18213 16.0609)"
                    fill="white"
                  />
                </svg>
              </button>
            </div>
            <div className="flex w-full flex-col pt-7 px-4">
              <div className="flex flex-col pt-4">
                <label className="text-black text-xs font-bold">USERNAME</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="text"
                  className="w-full h-10 self-stretch p-4 bg-white rounded-md border-2 border-stroke justify-start items-center gap-4 inline-flex"
                />
                <label className="text-black text-xs font-bold pt-4">
                  NAMA
                </label>
                <input
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  type="text"
                  className="w-full h-10 self-stretch p-4 bg-white rounded-md border-2 border-stroke justify-start items-center gap-4 inline-flex"
                />

                <label className="text-black text-sm font-bold pt-4">
                  Karyawan
                </label>
                <Select
                  placeholder="Cari..."
                  options={options}
                  onChange={(selectedId) => {
                    handleChangePointDepatment(selectedId);
                  }}
                  className="relative z-30 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input text-black dark:text-white"
                />

                <label className="text-black text-xs font-bold pt-4">
                  NOMOR TELEPON
                </label>
                <input
                  value={no}
                  onChange={(e) => setNo(e.target.value)}
                  type="text"
                  className="w-full h-10 self-stretch p-4 bg-white rounded-md border-2 border-stroke justify-start items-center gap-4 inline-flex"
                />

                <label className="text-black text-xs font-bold pt-4">
                  BAGIAN
                </label>
                <select
                  onChange={(e) => {
                    setBagian(e.target.value);
                    setRole(''); // Reset role when bagian changes
                    changeTextColor();
                  }}
                  value={bagian}
                  className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${
                    isOptionSelected ? 'text-black dark:text-white' : ''
                  }`}
                >
                  <option
                    value=""
                    disabled
                    className="text-body dark:text-bodydark"
                  >
                    Pilih Bagian
                  </option>
                  {getBagianOptions().map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="text-body dark:text-bodydark"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>

                <label className="text-black text-xs font-bold pt-4">
                  ROLE
                </label>
                <select
                  onChange={(e) => {
                    setRole(e.target.value);
                    changeTextColor();
                  }}
                  value={role}
                  className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${
                    isOptionSelected ? 'text-black dark:text-white' : ''
                  }`}
                >
                  <option
                    value=""
                    disabled
                    className="text-body dark:text-bodydark"
                  >
                    Pilih Role
                  </option>
                  {getRoleOptions().map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="text-body dark:text-bodydark"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>

                <label className="text-black text-xs font-bold pt-4">
                  PASSWORD
                </label>
                <input
                  placeholder="Masukkan Password"
                  type="password"
                  onChange={(e) => setPassword1(e.target.value)}
                  className="w-full h-10 self-stretch p-4 bg-white rounded-md border-2 border-stroke justify-start items-center gap-4 inline-flex"
                />

                <label className="text-black text-xs font-bold pt-4">
                  KONFIRMASI PASSWORD
                </label>
                <input
                  placeholder="Masukkan Password Konfirmasi"
                  type="password"
                  onChange={(e) => setConfPassword1(e.target.value)}
                  className="w-full h-10 self-stretch p-4 bg-white rounded-md border-2 border-stroke justify-start items-center gap-4 inline-flex"
                />

                <div className="py-4">
                  <button
                    disabled={isLoading}
                    onClick={() => editId && submitEditUser(editId)}
                    className="rounded-md justify-center items-center w-full h-10 bg-blue-600 text-white font-semibold text-sm"
                  >
                    {isLoading ? 'Loading...' : 'SIMPAN'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isMobile && (
        <>
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
              TAMBAH USER
            </button>
            {showModalTambah && (
              <ModalTambahUser
                children={undefined}
                isOpen={showModalTambah}
                onClose={closeModalTambah}
                onFinish={getuser}
              />
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex border-b border-stroke dark:border-strokedark">
              <div className="grid grid-cols-12 w-full px-10">
                <div className="justify-start gap-4 p-2.5 grid col-span-1">
                  <p className="hidden text-[14px] text-slate-600 font-semibold dark:text-white sm:block">
                    No
                  </p>
                </div>
                <div className="justify-start p-2.5 grid col-span-2">
                  <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">
                    Nama
                  </p>
                </div>
                <div className="justify-start p-2.5 grid col-span-2">
                  <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">
                    NIK
                  </p>
                </div>
                <div className="justify-start p-2.5 grid col-span-2">
                  <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">
                    Bagian
                  </p>
                </div>
                <div className="justify-start p-2.5 grid col-span-2">
                  <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">
                    Email
                  </p>
                </div>
                <div className="justify-center p-2.5 grid col-span-2 pl-10">
                  <p className="text-[14px] text-slate-600 font-semibold text-center">
                    Role
                  </p>
                </div>
              </div>
            </div>
            {user != null &&
              user.map((data: any, i: number) => {
                return (
                  <div
                    className={`flex ${
                      i === user.length - 1
                        ? ''
                        : 'border-b border-stroke dark:border-strokedark'
                    }`}
                    key={i}
                  >
                    <div className="grid grid-cols-12 w-full px-10">
                      <div className="justify-start gap-4 p-2.5 grid">
                        <p className="hidden text-neutral-500 text-sm font-light dark:text-white sm:block">
                          {i + 1}
                        </p>
                      </div>
                      <div className="justify-start p-2.5 grid col-span-2">
                        <p className="text-neutral-500 text-sm font-light text-center dark:text-white">
                          {data.nama}
                        </p>
                      </div>
                      <div className="justify-start p-2.5 grid col-span-2">
                        <p className="text-neutral-500 text-sm font-light text-center dark:text-white">
                          {data.karyawan?.biodata_karyawan[0]?.nik}
                        </p>
                      </div>
                      <div className="justify-start p-2.5 grid col-span-2">
                        <p className="text-slate-600 text-[14px] font-light text-center dark:text-white">
                          {data.bagian}
                        </p>
                      </div>
                      <div className="justify-start p-2.5 grid col-span-2">
                        <p className="text-neutral-500 text-sm font-light text-center dark:text-white">
                          {data.email}
                        </p>
                      </div>

                      <div className="text-[14px]justify-start p-2.5 col-span-2">
                        <p className="text-neutral-500 text-sm font-light text-center">
                          {data.role}
                        </p>
                      </div>

                      {data.role == 'super admin' ? (
                        <></>
                      ) : (
                        <>
                          <div className="grid justify-end p-2.5 gap-2">
                            <button
                              onClick={() => openEdit(i, data)}
                              className="bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1"
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => openDelete(i)}
                              className="bg-red-600 rounded-sm text-white text-xs font-bold px-4 py-1"
                            >
                              DELETE
                            </button>
                            {showDelete[i] == true && (
                              <ModalConfDelete
                                children={undefined}
                                isOpen={showDelete[i]}
                                onClose={() => closeDelete(i)}
                                idUser={data.uuid}
                                onFinish={getuser}
                              />
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}
      {isMobile && (
        <>
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
              TAMBAH USER
            </button>
          </div>

          <div className="flex flex-col w-full">
            <div className="flex border-b border-stroke dark:border-strokedark">
              <div className="grid grid-cols-8 w-full pl-8">
                <div className="justify-start p-2.5 grid col-span-2">
                  <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">
                    Nama
                  </p>
                </div>
                <div className="justify-start p-2.5 grid col-span-3">
                  <p className="text-slate-600 text-[14px] font-semibold text-center dark:text-white">
                    Email
                  </p>
                </div>

                <div className="justify-center p-2.5 grid col-span-2 pl-10">
                  <p className="text-[14px] text-slate-600 font-semibold text-center">
                    Role
                  </p>
                </div>
              </div>
            </div>
            {user != null &&
              user.map((data: any, i: number) => {
                return (
                  <>
                    <div
                      className={`flex ${
                        i === user.length - 1 ? 'w-full' : ' px-3 w-full'
                      }`}
                      key={i}
                    >
                      <div className="grid grid-cols-8 w-full gap-5">
                        <div className="justify-c p-2.5 grid col-span-2">
                          <p className="text-neutral-500 text-sm font-light text-center dark:text-white line-clamp-1">
                            {data.nama}
                          </p>
                        </div>

                        <div className="justify-start p-2.5 grid col-span-3">
                          <p className="text-neutral-500 text-sm font-light text-center dark:text-white line-clamp-1">
                            {data.email}
                          </p>
                        </div>

                        <div className="text-[14px] justify-start p-2.5 col-span-3">
                          <p className="text-neutral-500 text-sm font-light text-center line-clamp-1">
                            {data.role}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start w-full justify-start p-2.5 gap-2 border-b border-stroke dark:border-strokedark">
                      <button
                        onClick={() => openEdit(i, data)}
                        className="bg-blue-600 rounded-sm text-white text-xs font-bold px-4 py-1"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => openDelete(i)}
                        className="bg-red-600 rounded-sm text-white text-xs font-bold px-4 py-1"
                      >
                        DELETE
                      </button>
                    </div>
                  </>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
};

export default TableUser;
