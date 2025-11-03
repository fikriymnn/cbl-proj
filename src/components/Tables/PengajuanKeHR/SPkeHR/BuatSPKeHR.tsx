import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import Loading from '../../../Loading';
import convertTimeStampToDate from '../../../../utils/convertDate';

interface Employee {
  userid: string;
  name: string;
  biodata_karyawan: Array<{
    nik: string;
    nama_jabatan: string;
    bagian_mesin_karyawan: Array<{
      nama_bagian_mesin: string;
    }>;
  }>;
  sp_karyawan: SPRecord[];
}

interface SPType {
  id: string;
  nama: string;
  masa_berlaku: number;
}

interface SPRecord {
  nama_sp_teguran: string;
  dari: string;
  sampai: string;
  masa_berlaku: number;
}

interface SelectOption {
  value: string;
  label: string;
}

interface FormData {
  selectedEmployee: string;
  selectedSPType: string;
  reason: string;
}

interface FormErrors {
  selectedEmployee?: string;
  selectedSPType?: string;
  reason?: string;
}

function BuatSPKeHR() {
  // State management
  const [employeeOptions, setEmployeeOptions] = useState<SelectOption[]>([]);
  const [spTypeOptions, setSPTypeOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User data
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [employeeList, setEmployeeList] = useState<Employee[]>([]);
  const [spTypes, setSPTypes] = useState<SPType[]>([]);

  // Selected data
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [selectedSPType, setSelectedSPType] = useState<SPType | null>(null);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    selectedEmployee: '',
    selectedSPType: '',
    reason: '',
  });

  // Form validation
  const [errors, setErrors] = useState<FormErrors>({});
  const [labelText, setLabelText] = useState('Alasan SP / Teguran');

  // Initialize data on component mount
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([getCurrentUser(), getSPTypes()]);
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  async function getCurrentUser() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });

      setCurrentUser(res.data);

      // Get role and divisi_bawahan from response
      const role =
        res.data.karyawan?.biodata_karyawan[0]?.jabatan?.nama_jabatan;
      const divisiBawahan = res.data.karyawan?.divisi_bawahan;

      // Pass department, role, and divisi_bawahan to getEmployeeList
      getEmployeeList(
        res?.data.karyawan.biodata_karyawan[0]?.id_department,
        role,
        divisiBawahan,
      );

      console.log('getme', res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const getEmployeeList = async (
    id: any,
    role?: string,
    divisiBawahan?: any,
  ) => {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;

    // Build params object
    const params: any = {
      is_active: true,
      id_department: id,
    };

    // Check if role is supervisor or section head AND divisi_bawahan is not null/empty
    const isSupervisorOrSectionHead =
      role?.toLowerCase().includes('supervisor') ||
      role?.toLowerCase().includes('section head');

    if (isSupervisorOrSectionHead && divisiBawahan && divisiBawahan !== '') {
      // Add divisi_bawahan to params if conditions are met
      params.divisi_bawahan = Array.isArray(divisiBawahan)
        ? JSON.stringify(divisiBawahan)
        : divisiBawahan;
    }

    try {
      const response = await axios.get(url, {
        params: params,
        withCredentials: true,
      });
      const employees = response.data.data;
      setEmployeeList(employees);

      // Format options for select dropdown
      const options = employees.map((employee: Employee) => {
        const biodata = employee.biodata_karyawan[0];
        const latestDepartment =
          biodata?.bagian_mesin_karyawan?.slice(-1)[0]?.nama_bagian_mesin ||
          'N/A';

        return {
          value: employee.userid,
          label: `${biodata?.nik || 'N/A'} - ${employee.name} - ${
            biodata?.nama_jabatan || 'N/A'
          } - ${latestDepartment}`,
        };
      });

      setEmployeeOptions(options);
    } catch (error: any) {
      console.error('Error fetching employee list:', error);
      throw error;
    }
  };

  const getSPTypes = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_LINK}/master/sp`,
        {
          withCredentials: true,
        },
      );

      const spData = response.data.data;
      setSPTypes(spData);

      // Format options for select dropdown
      const options = spData.map((sp: SPType) => ({
        value: sp.id,
        label: `${sp.nama} - ${sp.masa_berlaku} Hari`,
      }));

      setSPTypeOptions(options);
    } catch (error: any) {
      console.error('Error fetching SP types:', error);
      throw error;
    }
  };

  const handleEmployeeChange = (selected: SelectOption | null) => {
    if (!selected) {
      setSelectedEmployee(null);
      setFormData((prev) => ({ ...prev, selectedEmployee: '' }));
      setErrors((prev) => ({ ...prev, selectedEmployee: undefined }));
      return;
    }

    const employee = employeeList.find((emp) => emp.userid === selected.value);
    setSelectedEmployee(employee || null);
    setFormData((prev) => ({ ...prev, selectedEmployee: selected.value }));
    setErrors((prev) => ({ ...prev, selectedEmployee: undefined }));
  };

  const handleSPTypeChange = (selected: SelectOption | null) => {
    if (!selected) {
      setSelectedSPType(null);
      setFormData((prev) => ({ ...prev, selectedSPType: '' }));
      setErrors((prev) => ({ ...prev, selectedSPType: undefined }));
      setLabelText('Alasan SP / Teguran');
      return;
    }

    const spType = spTypes.find((sp) => sp.id === selected.value);
    setSelectedSPType(spType || null);
    setFormData((prev) => ({ ...prev, selectedSPType: selected.value }));
    setErrors((prev) => ({ ...prev, selectedSPType: undefined }));

    // Update label based on SP type
    if (spType) {
      if (spType.nama.toLowerCase().includes('teguran')) {
        setLabelText('Alasan Teguran');
      } else if (spType.nama.toLowerCase().includes('sp')) {
        setLabelText('Alasan SP');
      } else {
        setLabelText('Alasan SP / Teguran');
      }
    }
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, reason: value }));
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, reason: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.selectedEmployee) {
      newErrors.selectedEmployee = 'Pilih karyawan terlebih dahulu';
    }

    if (!formData.selectedSPType) {
      newErrors.selectedSPType = 'Pilih jenis SP/Teguran terlebih dahulu';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Alasan harus diisi';
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Alasan minimal 10 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    // Reset form data
    setFormData({
      selectedEmployee: '',
      selectedSPType: '',
      reason: '',
    });

    // Reset selected states
    setSelectedEmployee(null);
    setSelectedSPType(null);

    // Reset label text
    setLabelText('Alasan SP / Teguran');

    // Clear any errors
    setErrors({});
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    // Prevent default form submission if called from form element
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      return;
    }

    if (!currentUser || !selectedSPType) {
      alert('Data tidak lengkap');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_LINK}/hr/pengajuanSP`,
        {
          id_karyawan: formData.selectedEmployee,
          id_pengaju: currentUser.id_karyawan,
          masa_berlaku: selectedSPType.masa_berlaku,
          alasan: formData.reason,
          nama_sp_teguran: selectedSPType.nama,
        },
        { withCredentials: true },
      );

      // Reset form after successful submission
      resetForm();

      // Show success alert
      alert('Pengajuan SP/Teguran berhasil disubmit');
    } catch (error: any) {
      console.error('Error submitting SP:', error);
      alert('Gagal mengajukan SP/Teguran. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: '44px',
      borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
      boxShadow: state.isFocused ? '0 0 0 1px #3B82F6' : 'none',
      '&:hover': {
        borderColor: '#3B82F6',
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#3B82F6'
        : state.isFocused
        ? '#EBF4FF'
        : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3B82F6' : '#EBF4FF',
      },
    }),
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-w-[700px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h1 className="text-xl font-semibold text-white">
              Form Pengajuan SP / Teguran
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              Lengkapi formulir untuk mengajukan SP atau teguran kepada karyawan
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Form Fields */}
                <div className="space-y-6">
                  {/* Employee Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Karyawan <span className="text-red-500">*</span>
                    </label>
                    <Select
                      placeholder="Cari karyawan..."
                      options={employeeOptions}
                      value={
                        employeeOptions.find(
                          (opt) => opt.value === formData.selectedEmployee,
                        ) || null
                      }
                      onChange={handleEmployeeChange}
                      styles={customSelectStyles}
                      isSearchable
                      isClearable
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                    {errors.selectedEmployee && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.selectedEmployee}
                      </p>
                    )}
                  </div>

                  {/* SP Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Jenis SP / Teguran{' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <Select
                      placeholder="Pilih jenis SP/Teguran..."
                      options={spTypeOptions}
                      value={
                        spTypeOptions.find(
                          (opt) => opt.value === formData.selectedSPType,
                        ) || null
                      }
                      onChange={handleSPTypeChange}
                      styles={customSelectStyles}
                      isSearchable
                      isClearable
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                    {errors.selectedSPType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.selectedSPType}
                      </p>
                    )}
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {labelText} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.reason}
                      onChange={handleReasonChange}
                      placeholder={`Masukkan ${labelText.toLowerCase()} dengan detail...`}
                      rows={5}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                        errors.reason ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.reason && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.reason}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                      Minimal 10 karakter ({formData.reason.length}/10)
                    </p>
                  </div>
                </div>

                {/* Right Column - Active SP Table */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    SP/Teguran Aktif
                  </h3>

                  {selectedEmployee &&
                  selectedEmployee.sp_karyawan &&
                  selectedEmployee.sp_karyawan.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              No
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              SP/Teguran
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Dari
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Sampai
                            </th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Masa Berlaku
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedEmployee.sp_karyawan.map((sp, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-3 py-4 text-sm text-gray-900">
                                {sp.nama_sp_teguran}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                {convertTimeStampToDate(sp.dari)}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                {convertTimeStampToDate(sp.sampai)}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                                {sp.masa_berlaku} hari
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400 text-lg mb-2">📋</div>
                      <p className="text-gray-500">
                        {selectedEmployee
                          ? 'Karyawan ini tidak memiliki SP/Teguran aktif'
                          : 'Pilih karyawan untuk melihat SP/Teguran aktif'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Memproses...
                    </span>
                  ) : (
                    'Ajukan SP/Teguran'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BuatSPKeHR;
