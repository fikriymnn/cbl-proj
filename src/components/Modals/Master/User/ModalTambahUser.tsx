import axios from 'axios';
import { useEffect, useState, useCallback } from 'react';
import Loading from '../../../Loading';
import Select from 'react-select';

interface ModalTambahUserProps {
  children?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
}

interface Employee {
  biodata_karyawan: Array<{
    id_karyawan: number;
    nik: string;
  }>;
  name: string;
}

interface SelectOption {
  value: number;
  label: string;
}

interface FormData {
  email: string;
  nama: string;
  bagian: string;
  no: string;
  role: string;
  password: string;
  confPassword: string;
  id_karyawan: number | null;
  divisi_bawahan: number[];
}

const ModalTambahUser = ({
  children,
  isOpen,
  onClose,
  onFinish,
}: ModalTambahUserProps) => {
  if (!isOpen) return null;

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [divisiOptions, setDivisiOptions] = useState<SelectOption[]>([]);
  const [passwordError, setPasswordError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    email: '',
    nama: '',
    bagian: '',
    no: '',
    role: '',
    password: '',
    confPassword: '',
    id_karyawan: null,
    divisi_bawahan: [],
  });

  // Check if role requires divisi_bawahan
  const requiresDivisi = ['section head', 'supervisor'].includes(
    formData.role.toLowerCase(),
  );

  // Fetch employees and divisi on mount
  useEffect(() => {
    getEmployees();
    getDivisi();
  }, []);

  // Validate passwords
  useEffect(() => {
    if (formData.password && formData.confPassword) {
      if (formData.password !== formData.confPassword) {
        setPasswordError('Password tidak cocok');
      } else if (formData.password.length < 6) {
        setPasswordError('Password minimal 6 karakter');
      } else {
        setPasswordError('');
      }
    } else if (formData.password || formData.confPassword) {
      setPasswordError('Kedua field password harus diisi');
    } else {
      setPasswordError('');
    }
  }, [formData.password, formData.confPassword]);

  // Fetch employees
  const getEmployees = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      setEmployees(res.data.data);

      const mappedOptions = res.data.data.map((item: Employee) => ({
        value: item.biodata_karyawan[0]?.id_karyawan,
        label: `${item.biodata_karyawan[0]?.nik} - ${item.name}`,
      }));

      setOptions(mappedOptions);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Fetch divisi
  const getDivisi = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/divisi`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      const mappedDivisi = res.data.data?.map((data: any) => ({
        value: data.id,
        label: data.nama_divisi,
      }));
      setDivisiOptions(mappedDivisi || []);
    } catch (error) {
      console.error('Error fetching divisi:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle employee selection
  const handleEmployeeChange = (selected: SelectOption | null) => {
    if (selected) {
      const selectedEmployee = employees.find(
        (emp) => emp.biodata_karyawan[0]?.id_karyawan === selected.value,
      );

      if (selectedEmployee) {
        handleInputChange(
          'id_karyawan',
          selectedEmployee.biodata_karyawan[0]?.id_karyawan,
        );
      }
    } else {
      handleInputChange('id_karyawan', null);
    }
  };

  // Handle divisi bawahan selection
  const handleDivisiChange = (selected: readonly SelectOption[]) => {
    const divisiIds = selected ? selected.map((opt) => opt.value) : [];
    handleInputChange('divisi_bawahan', divisiIds);
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email wajib diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format email tidak valid';
    }

    if (!formData.nama) errors.nama = 'Nama wajib diisi';
    if (!formData.bagian) errors.bagian = 'Bagian wajib diisi';
    if (!formData.role) errors.role = 'Role wajib diisi';
    if (!formData.password) errors.password = 'Password wajib diisi';
    if (!formData.confPassword)
      errors.confPassword = 'Konfirmasi password wajib diisi';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const submitTambahUser = async () => {
    // Validate form
    if (!validateForm()) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    if (passwordError) {
      alert(passwordError);
      return;
    }

    const url = `${import.meta.env.VITE_API_LINK}/users`;

    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          email: formData.email,
          nama: formData.nama,
          bagian: formData.bagian,
          no: formData.no,
          role: formData.role,
          password: formData.password,
          confPassword: formData.confPassword,
          id_karyawan: formData.id_karyawan,
          divisi_bawahan: requiresDivisi ? formData.divisi_bawahan : undefined,
        },
        { withCredentials: true },
      );

      alert(res.data.msg || 'User berhasil ditambahkan');
      onFinish();
      onClose();
    } catch (error: any) {
      console.error('Error adding user:', error);
      alert(error.response?.data?.msg || 'Gagal menambahkan user');
    } finally {
      setIsLoading(false);
    }
  };

  // Department options
  const departmentOptions = [
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'quality control', label: 'Quality Control' },
    { value: 'hr', label: 'HR' },
    { value: 'ppic', label: 'PPIC' },
    { value: 'produksi', label: 'Produksi' },
    { value: 'marketing', label: 'Marketing' },
  ];

  // Role options
  const roleOptions = [
    { value: 'section head', label: 'Section Head' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'admin', label: 'Admin' },
    { value: 'senior technician', label: 'Senior Technician' },
    { value: 'shift technician', label: 'Shift Technician' },
    { value: 'junior technician', label: 'Junior Technician' },
    { value: 'pre_press', label: 'Pre-Press' },
    { value: 'payroll', label: 'Payroll' },
    { value: 'inspector', label: 'Inspector' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-white/10 p-4 backdrop-blur-sm md:p-8">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-lg">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-4">
          <svg
            className="h-5 w-5 flex-shrink-0"
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

          <h2 className="flex-1 text-sm font-bold text-blue-700">
            Tambah User Baru
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600 focus:outline-none"
            disabled={isLoading}
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

        {/* Form Content */}
        <div className="space-y-4 px-6 py-6">
          {/* Username/Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-black">
              USERNAME (EMAIL) <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`h-10 w-full rounded-md border-2 px-4 py-2 text-sm focus:outline-none ${
                formErrors.email
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-stroke focus:border-blue-500'
              } bg-white`}
              placeholder="contoh@email.com"
              disabled={isLoading}
            />
            {formErrors.email && (
              <p className="text-xs text-red-600">{formErrors.email}</p>
            )}
          </div>

          {/* Nama */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-black">
              NAMA LENGKAP <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) => handleInputChange('nama', e.target.value)}
              className={`h-10 w-full rounded-md border-2 px-4 py-2 text-sm focus:outline-none ${
                formErrors.nama
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-stroke focus:border-blue-500'
              } bg-white`}
              placeholder="Masukkan nama lengkap"
              disabled={isLoading}
            />
            {formErrors.nama && (
              <p className="text-xs text-red-600">{formErrors.nama}</p>
            )}
          </div>

          {/* Karyawan */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-black">
              KARYAWAN (OPSIONAL)
            </label>
            <Select
              placeholder="Cari karyawan..."
              options={options}
              onChange={handleEmployeeChange}
              className="text-sm"
              isDisabled={isLoading}
              isClearable
              noOptionsMessage={() => 'Tidak ada data'}
            />
            <p className="text-xs text-gray-500">
              Pilih karyawan jika user terhubung dengan data karyawan
            </p>
          </div>

          {/* Nomor Telepon */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-black">
              NOMOR TELEPON
            </label>
            <input
              type="tel"
              value={formData.no}
              onChange={(e) => handleInputChange('no', e.target.value)}
              className="h-10 w-full rounded-md border-2 border-stroke bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="08xxxxxxxxxx"
              disabled={isLoading}
            />
          </div>

          {/* Bagian */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-black">
              BAGIAN <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.bagian}
              onChange={(e) => handleInputChange('bagian', e.target.value)}
              className={`h-10 w-full appearance-none rounded-md border-2 px-4 py-2 text-sm focus:outline-none ${
                formErrors.bagian
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-stroke focus:border-blue-500'
              } bg-white ${formData.bagian ? 'text-black' : 'text-gray-400'}`}
              disabled={isLoading}
            >
              <option value="" disabled>
                Pilih Bagian
              </option>
              {departmentOptions.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="text-black"
                >
                  {opt.label}
                </option>
              ))}
            </select>
            {formErrors.bagian && (
              <p className="text-xs text-red-600">{formErrors.bagian}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-black">
              ROLE <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className={`h-10 w-full appearance-none rounded-md border-2 px-4 py-2 text-sm focus:outline-none ${
                formErrors.role
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-stroke focus:border-blue-500'
              } bg-white ${formData.role ? 'text-black' : 'text-gray-400'}`}
              disabled={isLoading}
            >
              <option value="" disabled>
                Pilih Role
              </option>
              {roleOptions.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="text-black"
                >
                  {opt.label}
                </option>
              ))}
            </select>
            {formErrors.role && (
              <p className="text-xs text-red-600">{formErrors.role}</p>
            )}
          </div>

          {/* Divisi Bawahan - Only show for Section Head and Supervisor */}
          {requiresDivisi && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-black">
                DIVISI BAWAHAN <span className="text-red-500">*</span>
              </label>
              <Select
                isMulti
                placeholder="Pilih divisi bawahan..."
                options={divisiOptions}
                onChange={(selected) => handleDivisiChange(selected)}
                className="text-sm"
                isDisabled={isLoading}
                noOptionsMessage={() => 'Tidak ada data'}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: '40px',
                    borderColor: formErrors.divisi_bawahan
                      ? '#ef4444'
                      : state.isFocused
                      ? '#3b82f6'
                      : '#e5e7eb',
                    borderWidth: '2px',
                    '&:hover': {
                      borderColor: formErrors.divisi_bawahan
                        ? '#ef4444'
                        : '#3b82f6',
                    },
                  }),
                }}
              />
              {formErrors.divisi_bawahan && (
                <p className="text-xs text-red-600">
                  {formErrors.divisi_bawahan}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Pilih divisi yang berada di bawah tanggung jawab user ini
              </p>
            </div>
          )}

          {/* Password Section */}
          <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold text-gray-700">
              Password <span className="text-red-500">*</span>
            </p>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-black">PASSWORD</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`h-10 w-full rounded-md border-2 px-4 py-2 text-sm focus:outline-none ${
                  formErrors.password || passwordError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-stroke focus:border-blue-500'
                } bg-white`}
                placeholder="Minimal 6 karakter"
                disabled={isLoading}
              />
              {formErrors.password && (
                <p className="text-xs text-red-600">{formErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-black">
                  KONFIRMASI PASSWORD
                </label>
                {passwordError && !formErrors.password && (
                  <span className="text-xs font-semibold text-red-600">
                    {passwordError}
                  </span>
                )}
              </div>
              <input
                type="password"
                value={formData.confPassword}
                onChange={(e) =>
                  handleInputChange('confPassword', e.target.value)
                }
                className={`h-10 w-full rounded-md border-2 px-4 py-2 text-sm focus:outline-none ${
                  formErrors.confPassword || passwordError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-stroke focus:border-blue-500'
                } bg-white`}
                placeholder="Ulangi password"
                disabled={isLoading}
              />
              {formErrors.confPassword && (
                <p className="text-xs text-red-600">
                  {formErrors.confPassword}
                </p>
              )}
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  <div
                    className={`h-1 flex-1 rounded ${
                      formData.password.length >= 6
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded ${
                      formData.password.length >= 8
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded ${
                      /[A-Z]/.test(formData.password) &&
                      /[0-9]/.test(formData.password)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                </div>
                <p className="text-xs text-gray-600">
                  {formData.password.length < 6
                    ? 'Password lemah'
                    : formData.password.length < 8
                    ? 'Password sedang'
                    : 'Password kuat'}
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={submitTambahUser}
            disabled={isLoading || !!passwordError}
            className="mt-6 flex h-11 w-full items-center justify-center rounded-md bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isLoading ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Menambahkan...
              </>
            ) : (
              'TAMBAH USER'
            )}
          </button>
        </div>

        {isLoading && <Loading />}
        {children}
      </div>
    </div>
  );
};

export default ModalTambahUser;
