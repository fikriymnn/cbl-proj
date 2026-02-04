import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Loading from '../../../Loading';
import Select from 'react-select';

interface ModalUserProps {
  children?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
  // Optional props for edit mode
  id?: number;
  data?: any;
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

interface Role {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

interface FormData {
  email: string;
  nama: string;
  no: string;
  id_role: number | null;
  password: string;
  confPassword: string;
  id_karyawan: number | null;
  divisi_bawahan: number[];
}

const ModalUser = ({
  children,
  isOpen,
  onClose,
  onFinish,
  id,
  data,
}: ModalUserProps) => {
  if (!isOpen) return null;

  // Determine mode based on presence of id
  const isEditMode = !!id && !!data;

  // States
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [divisiOptions, setDivisiOptions] = useState<SelectOption[]>([]);
  const [roleOptions, setRoleOptions] = useState<SelectOption[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<SelectOption | null>(
    null,
  );
  const [selectedDivisi, setSelectedDivisi] = useState<SelectOption[]>([]);
  const [passwordError, setPasswordError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<FormData>({
    email: data?.email || '',
    nama: data?.nama || '',

    no: data?.no || '',
    id_role: data?.id_role || null,
    password: '',
    confPassword: '',
    id_karyawan: data?.karyawan?.biodata_karyawan[0]?.id_karyawan || null,
    divisi_bawahan: (() => {
      if (!data?.divisi_bawahan) return [];
      if (typeof data.divisi_bawahan === 'string') {
        try {
          return JSON.parse(data.divisi_bawahan);
        } catch {
          return [];
        }
      }
      return data.divisi_bawahan || [];
    })(),
  });

  // Check if role requires divisi_bawahan based on role id
  const requiresDivisi = (() => {
    if (!formData.id_role) return false;
    const selectedRole = roles.find((r) => r.id === formData.id_role);
    if (!selectedRole) return false;
    // Check if role name is 'section head' or 'supervisor' (case insensitive)
    const roleName = selectedRole.name.toLowerCase();
    return roleName.includes('section head') || roleName.includes('supervisor');
  })();

  // Handle window resize
  const handleResize = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

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
    } else if (!isEditMode && (formData.password || formData.confPassword)) {
      setPasswordError('Kedua field password harus diisi');
    } else {
      setPasswordError('');
    }
  }, [formData.password, formData.confPassword, isEditMode]);

  // Fetch employees, divisi, and roles on mount
  useEffect(() => {
    getEmployees();
    getDivisi();
    getRoles();
  }, []);

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

      // Auto-select employee if exists in data (edit mode)
      if (data?.karyawan?.biodata_karyawan[0]?.id_karyawan) {
        const defaultSelected = mappedOptions.find(
          (option: SelectOption) =>
            option.value === data.karyawan.biodata_karyawan[0].id_karyawan,
        );
        if (defaultSelected) {
          setSelectedEmployee(defaultSelected);
        }
      }
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

      // Auto-select existing divisi_bawahan (edit mode)
      if (data?.divisi_bawahan) {
        let parsedDivisi = [];
        if (typeof data.divisi_bawahan === 'string') {
          try {
            parsedDivisi = JSON.parse(data.divisi_bawahan);
          } catch (e) {
            console.error('Error parsing divisi_bawahan:', e);
            parsedDivisi = [];
          }
        } else if (Array.isArray(data.divisi_bawahan)) {
          parsedDivisi = data.divisi_bawahan;
        }

        if (parsedDivisi.length > 0) {
          const defaultSelected = mappedDivisi.filter((option: SelectOption) =>
            parsedDivisi.includes(option.value),
          );
          setSelectedDivisi(defaultSelected);
        }
      }
    } catch (error) {
      console.error('Error fetching divisi:', error);
    }
  };

  // Fetch roles from new API
  const getRoles = async () => {
    const url = `${import.meta.env.VITE_API_LINK}/master/roles`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      const rolesData = res.data.data || [];
      setRoles(rolesData);

      // Map to options for select dropdown
      const mappedRoles = rolesData.map((role: Role) => ({
        value: role.id,
        label: role.name,
      }));
      setRoleOptions(mappedRoles);
    } catch (error) {
      console.error('Error fetching roles:', error);
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
    setSelectedEmployee(selected);
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
    setSelectedDivisi([...selected]);
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
    if (!formData.id_role) errors.id_role = 'Role wajib diisi';

    // Password validation only required for create mode
    if (!isEditMode) {
      if (!formData.password) errors.password = 'Password wajib diisi';
      if (!formData.confPassword)
        errors.confPassword = 'Konfirmasi password wajib diisi';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const submitForm = async () => {
    // Validate form
    if (!validateForm()) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    if (passwordError) {
      alert(passwordError);
      return;
    }

    const url = isEditMode
      ? `${import.meta.env.VITE_API_LINK}/users/${id}`
      : `${import.meta.env.VITE_API_LINK}/users`;

    const method = isEditMode ? 'put' : 'post';

    try {
      setIsLoading(true);
      const res = await axios[method](
        url,
        {
          email: formData.email,
          nama: formData.nama,
          no: formData.no,
          id_role: formData.id_role,
          password: formData.password || undefined,
          confPassword: formData.confPassword || undefined,
          id_karyawan: formData.id_karyawan,
          divisi_bawahan: requiresDivisi ? formData.divisi_bawahan : undefined,
        },
        { withCredentials: true },
      );

      alert(
        res.data.msg ||
          (isEditMode ? 'User berhasil diupdate' : 'User berhasil ditambahkan'),
      );
      onFinish();
      onClose();
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} user:`, error);
      alert(
        error.response?.data?.msg ||
          `Gagal ${isEditMode ? 'mengupdate' : 'menambahkan'} user`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30 p-4 backdrop-blur-sm md:p-8">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-xl">
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

          <h2 className="flex-1 text-base font-bold text-blue-700">
            {isEditMode ? 'Edit Data User' : 'Tambah User Baru'}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
            disabled={isLoading}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="space-y-4 px-6 py-6">
          {/* Username/Email */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">
              USERNAME / EMAIL <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`h-11 w-full rounded-lg border-2 px-4 py-2 text-sm transition-colors focus:outline-none ${
                formErrors.email
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
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
            <label className="text-xs font-semibold text-gray-700">
              NAMA LENGKAP <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) => handleInputChange('nama', e.target.value)}
              className={`h-11 w-full rounded-lg border-2 px-4 py-2 text-sm transition-colors focus:outline-none ${
                formErrors.nama
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
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
            <label className="text-xs font-semibold text-gray-700">
              KARYAWAN {!isEditMode && '(OPSIONAL)'}
            </label>
            <Select
              placeholder="Cari karyawan..."
              options={options}
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              className="text-sm"
              isDisabled={isLoading}
              isClearable
              noOptionsMessage={() => 'Tidak ada data'}
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: '44px',
                  borderWidth: '2px',
                  borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
                  boxShadow: state.isFocused
                    ? '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    : 'none',
                  '&:hover': {
                    borderColor: '#3B82F6',
                  },
                }),
              }}
            />
            <p className="text-xs text-gray-500">
              Pilih karyawan jika user terhubung dengan data karyawan
            </p>
          </div>

          {/* Nomor Telepon */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">
              NOMOR TELEPON
            </label>
            <input
              type="tel"
              value={formData.no}
              onChange={(e) => handleInputChange('no', e.target.value)}
              className="h-11 w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="08xxxxxxxxxx"
              disabled={isLoading}
            />
          </div>

          {/* Role */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-700">
              ROLE <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.id_role || ''}
              onChange={(e) =>
                handleInputChange('id_role', Number(e.target.value))
              }
              className={`h-11 w-full appearance-none rounded-lg border-2 px-4 py-2 text-sm transition-colors focus:outline-none ${
                formErrors.id_role
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
              } bg-white ${formData.id_role ? 'text-black' : 'text-gray-400'}`}
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
            {formErrors.id_role && (
              <p className="text-xs text-red-600">{formErrors.id_role}</p>
            )}
          </div>

          {/* Divisi Bawahan - Only show for Section Head and Supervisor */}
          {requiresDivisi && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">
                DIVISI BAWAHAN <span className="text-red-500">*</span>
              </label>
              <Select
                isMulti
                placeholder="Pilih divisi bawahan..."
                options={divisiOptions}
                value={selectedDivisi}
                onChange={(selected) => handleDivisiChange(selected)}
                className="text-sm"
                isDisabled={isLoading}
                noOptionsMessage={() => 'Tidak ada data'}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: '44px',
                    borderWidth: '2px',
                    borderColor: formErrors.divisi_bawahan
                      ? '#ef4444'
                      : state.isFocused
                      ? '#3B82F6'
                      : '#D1D5DB',
                    boxShadow: state.isFocused
                      ? '0 0 0 3px rgba(59, 130, 246, 0.1)'
                      : 'none',
                    '&:hover': {
                      borderColor: formErrors.divisi_bawahan
                        ? '#ef4444'
                        : '#3B82F6',
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
          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-5">
            <div className="mb-4 flex items-center gap-2">
              <svg
                className="h-5 w-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <p className="text-sm font-semibold text-gray-700">
                {isEditMode ? 'Ubah Password (Opsional)' : 'Password'}{' '}
                {!isEditMode && <span className="text-red-500">*</span>}
              </p>
            </div>

            {/* Password */}
            <div className="mb-4 space-y-2">
              <label className="text-xs font-semibold text-gray-700">
                PASSWORD {!isEditMode && 'BARU'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`h-11 w-full rounded-lg border-2 px-4 py-2 text-sm transition-colors focus:outline-none ${
                  formErrors.password || passwordError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
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
                <label className="text-xs font-semibold text-gray-700">
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
                className={`h-11 w-full rounded-lg border-2 px-4 py-2 text-sm transition-colors focus:outline-none ${
                  formErrors.confPassword || passwordError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                } bg-white`}
                placeholder={
                  isEditMode ? 'Konfirmasi password baru' : 'Ulangi password'
                }
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
              <div className="mt-3 space-y-1">
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
            {isEditMode && (
              <p className="mt-3 text-xs text-gray-600">
                💡 Kosongkan jika tidak ingin mengubah password
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              BATAL
            </button>
            <button
              onClick={submitForm}
              disabled={isLoading || !!passwordError}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:cursor-not-allowed disabled:from-blue-400 disabled:to-blue-400 disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
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
                  {isEditMode ? 'MENYIMPAN...' : 'MENAMBAHKAN...'}
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {isEditMode ? 'SIMPAN PERUBAHAN' : 'TAMBAH USER'}
                </>
              )}
            </button>
          </div>
        </div>

        {isLoading && <Loading />}
        {children}
      </div>
    </div>
  );
};
export default ModalUser;
