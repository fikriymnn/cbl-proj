import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import ModalUser from '../../Modals/Master/User/ModalUser';
import ModalConfDelete from '../../Modals/Master/User/ModalConfDelete';

interface User {
  uuid: number;
  nama: string;
  email: string;
  role: string;
  karyawan?: {
    biodata_karyawan: Array<{
      nik: string;
    }>;
  };
}

interface AlertState {
  show: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
}

const TableUserAll = () => {
  // Responsive state
  const [isMobile, setIsMobile] = useState(false);

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modal states
  const [showEdit, setShowEdit] = useState<boolean[]>([]);
  const [showDelete, setShowDelete] = useState<boolean[]>([]);
  const [showModalTambah, setShowModalTambah] = useState(false);

  // Alert state
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: 'info',
    message: '',
  });

  // Handle window resize
  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Fetch users
  const getUsers = useCallback(async () => {
    setLoading(true);
    const url = `${import.meta.env.VITE_API_LINK}/users`;

    try {
      const res = await axios.get(url, {
        params: { status: 'aktif' },
        withCredentials: true,
      });
      console.log('Fetched users:', res.data);
      setUsers(res.data);
      setFilteredUsers(res.data);
      setShowEdit(new Array(res.data.length).fill(false));
      setShowDelete(new Array(res.data.length).fill(false));
    } catch (error: any) {
      showAlert('error', error.response?.data?.msg || 'Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.karyawan?.biodata_karyawan[0]?.nik
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, users]);

  // Get unique roles and bagian for filters
  const uniqueRoles = Array.from(new Set(users.map((user) => user.role)));

  // Alert helper
  const showAlert = (type: 'success' | 'error' | 'info', message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => {
      setAlert({ show: false, type: 'info', message: '' });
    }, 3000);
  };

  // Modal handlers
  const openEdit = (index: number) => {
    const newShowEdit = [...showEdit];
    newShowEdit[index] = true;
    setShowEdit(newShowEdit);
  };

  const closeEdit = (index: number) => {
    const newShowEdit = [...showEdit];
    newShowEdit[index] = false;
    setShowEdit(newShowEdit);
  };

  const openDelete = (index: number) => {
    const newShowDelete = [...showDelete];
    newShowDelete[index] = true;
    setShowDelete(newShowDelete);
  };

  const closeDelete = (index: number) => {
    const newShowDelete = [...showDelete];
    newShowDelete[index] = false;
    setShowDelete(newShowDelete);
  };

  const handleFinishAction = (message: string) => {
    getUsers();
    showAlert('success', message);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
  };

  return (
    <div className="rounded-xl border border-stroke bg-white pt-4 shadow-default dark:border-strokedark dark:bg-boxdark xl:pb-1">
      {/* Alert */}
      {alert.show && (
        <div
          className={`mx-4 mb-4 rounded-lg p-4 ${
            alert.type === 'success'
              ? 'bg-green-100 text-green-800'
              : alert.type === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          <p className="text-sm font-medium">{alert.message}</p>
        </div>
      )}

      {/* Search and Add Button */}
      <div className="mb-4 flex flex-col gap-3 px-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="search"
            placeholder="Search by name, email, or NIK..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-stroke bg-[#E9F3FF] px-4 py-2 text-sm focus:border-blue-500 focus:outline-none sm:w-64"
          />

          {!isMobile && (
            <>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full rounded-md border border-stroke bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none sm:w-40"
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              {(searchTerm || roleFilter !== 'all') && (
                <button
                  onClick={resetFilters}
                  className="rounded-md bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-300"
                >
                  Reset
                </button>
              )}
            </>
          )}
        </div>

        <button
          onClick={() => setShowModalTambah(true)}
          className="rounded-md bg-blue-600 px-6 py-2 text-xs font-bold text-white hover:bg-blue-700"
        >
          TAMBAH USER
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Desktop View */}
          {!isMobile && (
            <div className="flex flex-col">
              {/* Table Header */}
              <div className="border-b border-stroke dark:border-strokedark">
                <div className="grid grid-cols-12 gap-2 px-10">
                  <div className="col-span-1 p-2.5">
                    <p className="text-sm font-semibold text-slate-600 dark:text-white">
                      No
                    </p>
                  </div>
                  <div className="col-span-2 p-2.5">
                    <p className="text-center text-sm font-semibold text-slate-600 dark:text-white">
                      Nama
                    </p>
                  </div>
                  <div className="col-span-2 p-2.5">
                    <p className="text-center text-sm font-semibold text-slate-600 dark:text-white">
                      NIK
                    </p>
                  </div>

                  <div className="col-span-4 p-2.5">
                    <p className="text-center text-sm font-semibold text-slate-600 dark:text-white">
                      Email
                    </p>
                  </div>
                  <div className="col-span-2 p-2.5">
                    <p className="text-center text-sm font-semibold text-slate-600 dark:text-white">
                      Role
                    </p>
                  </div>
                  <div className="col-span-1 p-2.5">
                    <p className="text-center text-sm font-semibold text-slate-600 dark:text-white">
                      Action
                    </p>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              {filteredUsers.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-gray-500">No users found</p>
                </div>
              ) : (
                filteredUsers.map((user, index) => (
                  <div
                    key={user.uuid}
                    className={`${
                      index !== filteredUsers.length - 1
                        ? 'border-b border-stroke dark:border-strokedark'
                        : ''
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-2 px-10">
                      <div className="col-span-1 p-2.5">
                        <p className="text-sm font-light text-neutral-500 dark:text-white">
                          {index + 1}
                        </p>
                      </div>
                      <div className="col-span-2 p-2.5">
                        <p className="text-center text-sm font-light text-neutral-500 dark:text-white">
                          {user.nama}
                        </p>
                      </div>
                      <div className="col-span-2 p-2.5">
                        <p className="text-center text-sm font-light text-neutral-500 dark:text-white">
                          {user.karyawan?.biodata_karyawan[0]?.nik || '-'}
                        </p>
                      </div>

                      <div className="col-span-4 p-2.5">
                        <p className="text-center text-sm font-light text-neutral-500 dark:text-white">
                          {user.email}
                        </p>
                      </div>
                      <div className="col-span-2 p-2.5">
                        <p className="text-center text-sm font-light text-neutral-500">
                          {user.role}
                        </p>
                      </div>
                      <div className="col-span-1 flex flex-col gap-2 py-2">
                        <button
                          onClick={() => openEdit(index)}
                          className="group flex items-center justify-center  rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:shadow-blue-500/40"
                        >
                          <svg
                            className="h-3.5 w-3.5 transition-transform group-hover:scale-110"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          EDIT
                        </button>
                        <button
                          onClick={() => openDelete(index)}
                          className="group flex items-center justify-center  rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-500/30 transition-all hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:shadow-red-500/40"
                        >
                          <svg
                            className="h-3.5 w-3.5 transition-transform group-hover:scale-110"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          DELETE
                        </button>
                      </div>
                    </div>

                    {/* Modals */}
                    {showEdit[index] && (
                      <ModalUser
                        children={undefined}
                        isOpen={showEdit[index]}
                        onClose={() => closeEdit(index)}
                        id={user.uuid}
                        data={user}
                        onFinish={() =>
                          handleFinishAction('User updated successfully')
                        }
                      />
                    )}
                    {showDelete[index] && (
                      <ModalConfDelete
                        children={undefined}
                        isOpen={showDelete[index]}
                        onClose={() => closeDelete(index)}
                        idUser={user.uuid}
                        onFinish={() =>
                          handleFinishAction('User deleted successfully')
                        }
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Mobile View */}
          {isMobile && (
            <div className="flex flex-col">
              {/* Mobile Filters */}
              <div className="mb-4 flex flex-col gap-2 px-4">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full rounded-md border border-stroke bg-white px-4 py-2 text-sm"
                >
                  <option value="all">All Roles</option>
                  {uniqueRoles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>

                {(searchTerm || roleFilter !== 'all') && (
                  <button
                    onClick={resetFilters}
                    className="rounded-md bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-700"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Mobile Header */}
              <div className="border-b border-stroke dark:border-strokedark">
                <div className="grid grid-cols-8 gap-2 px-4">
                  <div className="col-span-2 p-2.5">
                    <p className="text-center text-sm font-semibold text-slate-600 dark:text-white">
                      Nama
                    </p>
                  </div>
                  <div className="col-span-3 p-2.5">
                    <p className="text-center text-sm font-semibold text-slate-600 dark:text-white">
                      Email
                    </p>
                  </div>
                  <div className="col-span-3 p-2.5">
                    <p className="text-center text-sm font-semibold text-slate-600 dark:text-white">
                      Role
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Body */}
              {filteredUsers.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-gray-500">No users found</p>
                </div>
              ) : (
                filteredUsers.map((user, index) => (
                  <div key={user.uuid}>
                    <div className="grid grid-cols-8 gap-2 px-4">
                      <div className="col-span-2 p-2.5">
                        <p className="line-clamp-1 text-center text-sm font-light text-neutral-500 dark:text-white">
                          {user.nama}
                        </p>
                      </div>
                      <div className="col-span-3 p-2.5">
                        <p className="line-clamp-1 text-center text-sm font-light text-neutral-500 dark:text-white">
                          {user.email}
                        </p>
                      </div>
                      <div className="col-span-3 p-2.5">
                        <p className="line-clamp-1 text-center text-sm font-light text-neutral-500">
                          {user.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 border-b border-stroke p-2.5 dark:border-strokedark">
                      <button
                        onClick={() => openEdit(index)}
                        className="group flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-blue-800"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        EDIT
                      </button>
                      <button
                        onClick={() => openDelete(index)}
                        className="group flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-500/30 transition-all hover:from-red-700 hover:to-red-800"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        DELETE
                      </button>
                    </div>

                    {showEdit[index] && (
                      <ModalUser
                        children={undefined}
                        isOpen={showEdit[index]}
                        onClose={() => closeEdit(index)}
                        id={user.uuid}
                        data={user}
                        onFinish={() =>
                          handleFinishAction('User updated successfully')
                        }
                      />
                    )}
                    {showDelete[index] && (
                      <ModalConfDelete
                        children={undefined}
                        isOpen={showDelete[index]}
                        onClose={() => closeDelete(index)}
                        idUser={user.uuid}
                        onFinish={() =>
                          handleFinishAction('User deleted successfully')
                        }
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {showModalTambah && (
        <ModalUser
          children={undefined}
          isOpen={showModalTambah}
          onClose={() => setShowModalTambah(false)}
          onFinish={() => handleFinishAction('User added successfully')}
        />
      )}
    </div>
  );
};

export default TableUserAll;
