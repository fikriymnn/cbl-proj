import React, { useEffect, useState } from 'react'
import axios from 'axios';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import Loading from '../../../Loading';
import BarChartKaryawan from './BarchartKaryawan';
import Production from '../../../../images/icon/production.svg';

function RekapKaryawan() {
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        getKaryawan();

    }, []);

    const [karyawan, setKaryawan] = useState<any>();

    async function getKaryawan() {
        const url = `${import.meta.env.VITE_API_LINK
            }/hr/karyawanRekap`;
        try {
            setIsLoading(true)
            const res = await axios.get(
                url,

                {
                    withCredentials: true,
                },
            );
            setIsLoading(false)
            setKaryawan(res.data)
            console.log(res.data)
        } catch (error: any) {
            setIsLoading(false)
            console.log(error);
        }
    }
    const [showTable, setShowTable] = useState(false);
    const [showTable1, setShowTable1] = useState(false);
    const [showTable2, setShowTable2] = useState(false);
    const [showTable3, setShowTable3] = useState(false);
    const [showTable4, setShowTable4] = useState(false);
    const [showTable5, setShowTable5] = useState(false);
    const [showTable6, setShowTable6] = useState(false);
    const [showTable7, setShowTable7] = useState(false);

    return (
        <div>
            <>
                <main className="overflow-x-scroll flex flex-col gap-4">
                    {isLoading && <Loading />}
                    <div className="min-w-[700px] bg-white border-2">
                        <div className="">
                            <div className="bg-white rounded-md shadow-md md:w-12/12 overflow-x-scroll">
                                <div className="flex gap-3 p-3">
                                    <img src={Production} alt="Logo" />
                                    <p className="text-xl font-semibold text-[#0065DE]">Department</p>
                                </div>
                                <BarChartKaryawan value={karyawan?.rekap?.department} />
                                <div className="flex justify-start my-3 px-4">
                                    <button
                                        onClick={() => setShowTable(!showTable)}
                                        className="px-4 py-2 bg-[#0065DE] text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        {showTable ? 'Hide Details' : 'Show Details'}
                                    </button>
                                </div>
                            </div>
                            {showTable && (
                                <div className="overflow-x-auto mt-4">
                                    <table className="min-w-full border-collapse border border-gray-300">
                                        <tbody>
                                            {karyawan?.rekap?.department?.map((dept: any, deptIndex: any, index: any) => {
                                                // Get the department name from rekap
                                                const departmentName = dept.nama;

                                                // Filter employees that belong to this department
                                                const departmentEmployees = karyawan?.data?.filter((employee: any) =>
                                                    employee.biodata_karyawan[0]?.department?.nama_department === departmentName
                                                );

                                                return departmentEmployees && departmentEmployees.length > 0 ? (
                                                    <div key={`dept-${index}-${deptIndex}`} className="mb-6">
                                                        <h3 className="text-lg font-semibold mb-2">Department : {departmentName}</h3>
                                                        <table className="min-w-full border-collapse border border-gray-300">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="border border-gray-300 px-4 py-2">NIK</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Nama</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Status Karyawan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Tipe Penggajian</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Tipe Karyawan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Bagian</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Department</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Divisi</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Jabatan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Grade</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {departmentEmployees.map((employee: any, empIndex: any) => (
                                                                    <tr key={`emp-${index}-${deptIndex}-${empIndex}`} className="text-center">
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.nik || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.name || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.status?.nama_status || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.tipe_penggajian || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.tipe_karyawan || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.bagian?.nama_bagian || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.department?.nama_department || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.divisi?.nama_divisi || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.jabatan?.nama_jabatan || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.grade?.kategori || '-'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : null;
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>


                    <div className="min-w-[700px] bg-white border-2">
                        <div className="">
                            <div className="bg-white rounded-md shadow-md md:w-12/12 overflow-x-scroll ">
                                <div className="flex gap-3 p-3">
                                    <img src={Production} alt="Logo" />

                                    <p className="text-xl font-semibold text-[#0065DE]">Divisi</p>
                                </div>
                                <BarChartKaryawan value={karyawan?.rekap?.divisi} />
                                <div className="flex justify-start my-3 px-4">
                                    <button
                                        onClick={() => setShowTable1(!showTable1)}
                                        className="px-4 py-2 bg-[#0065DE] text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        {showTable1 ? 'Hide Details' : 'Show Details'}
                                    </button>
                                </div>
                            </div>
                            {showTable1 && (
                                <div className="overflow-x-auto mt-4">
                                    <table className="min-w-full border-collapse border border-gray-300">
                                        <tbody>
                                            {karyawan?.rekap?.divisi?.map((dept: any, deptIndex: any, index: any) => {
                                                // Get the department name from rekap
                                                const departmentName = dept.nama;

                                                // Filter employees that belong to this department
                                                const departmentEmployees = karyawan?.data?.filter((employee: any) =>
                                                    employee.biodata_karyawan[0]?.divisi?.nama_divisi === departmentName
                                                );

                                                return departmentEmployees && departmentEmployees.length > 0 ? (
                                                    <div key={`dept-${index}-${deptIndex}`} className="mb-6">
                                                        <h3 className="text-lg font-semibold mb-2">Divisi : {departmentName}</h3>
                                                        <table className="min-w-full border-collapse border border-gray-300">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="border border-gray-300 px-4 py-2">NIK</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Nama</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Status Karyawan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Tipe Penggajian</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Tipe Karyawan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Bagian</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Department</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Divisi</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Jabatan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Grade</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {departmentEmployees.map((employee: any, empIndex: any) => (
                                                                    <tr key={`emp-${index}-${deptIndex}-${empIndex}`} className="text-center">
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.nik || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.name || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.status?.nama_status || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.tipe_penggajian || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.tipe_karyawan || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.bagian?.nama_bagian || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.department?.nama_department || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.divisi?.nama_divisi || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.jabatan?.nama_jabatan || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.grade?.kategori || '-'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : null;
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="min-w-[700px] bg-white border-2 ">

                        <div className="bg-white rounded-md shadow-md md:w-12/12 overflow-x-scroll">
                            <div className="flex gap-3 p-3">
                                <img src={Production} alt="Logo" />

                                <p className="text-xl font-semibold text-[#0065DE]">Grade</p>
                            </div>
                            <BarChartKaryawan value={karyawan?.rekap?.grade} />
                            <div className="flex justify-start my-3 px-4">
                                <button
                                    onClick={() => setShowTable2(!showTable2)}
                                    className="px-4 py-2 bg-[#0065DE] text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    {showTable2 ? 'Hide Details' : 'Show Details'}
                                </button>
                            </div>
                        </div>
                        {showTable2 && (
                            <div className="overflow-x-auto mt-4">
                                <table className="min-w-full border-collapse border border-gray-300">
                                    <tbody>
                                        {karyawan?.rekap?.grade?.map((dept: any, deptIndex: any, index: any) => {
                                            // Get the department name from rekap
                                            const departmentName = dept.nama;

                                            // Filter employees that belong to this department
                                            const departmentEmployees = karyawan?.data?.filter((employee: any) =>
                                                employee.biodata_karyawan[0]?.grade?.kategori === departmentName
                                            );

                                            return departmentEmployees && departmentEmployees.length > 0 ? (
                                                <div key={`dept-${index}-${deptIndex}`} className="mb-6">
                                                    <h3 className="text-lg font-semibold mb-2">Grade : {departmentName}</h3>
                                                    <table className="min-w-full border-collapse border border-gray-300">
                                                        <thead>
                                                            <tr className="bg-gray-100">
                                                                <th className="border border-gray-300 px-4 py-2">NIK</th>
                                                                <th className="border border-gray-300 px-4 py-2">Nama</th>
                                                                <th className="border border-gray-300 px-4 py-2">Status Karyawan</th>
                                                                <th className="border border-gray-300 px-4 py-2">Tipe Penggajian</th>
                                                                <th className="border border-gray-300 px-4 py-2">Tipe Karyawan</th>
                                                                <th className="border border-gray-300 px-4 py-2">Bagian</th>
                                                                <th className="border border-gray-300 px-4 py-2">Department</th>
                                                                <th className="border border-gray-300 px-4 py-2">Divisi</th>
                                                                <th className="border border-gray-300 px-4 py-2">Jabatan</th>
                                                                <th className="border border-gray-300 px-4 py-2">Grade</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {departmentEmployees.map((employee: any, empIndex: any) => (
                                                                <tr key={`emp-${index}-${deptIndex}-${empIndex}`} className="text-center">
                                                                    <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.nik || '-'}</td>
                                                                    <td className="border border-gray-300 px-4 py-2">{employee.name || '-'}</td>
                                                                    <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.status?.nama_status || '-'}</td>
                                                                    <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.tipe_penggajian || '-'}</td>
                                                                    <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.tipe_karyawan || '-'}</td>
                                                                    <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.bagian?.nama_bagian || '-'}</td>
                                                                    <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.department?.nama_department || '-'}</td>
                                                                    <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.divisi?.nama_divisi || '-'}</td>
                                                                    <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.jabatan?.nama_jabatan || '-'}</td>
                                                                    <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.grade?.kategori || '-'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : null;
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <div className="min-w-[700px] bg-white border-2">
                        <div className="">
                            <div className="bg-white rounded-md shadow-md md:w-12/12 overflow-x-scroll ">
                                <div className="flex gap-3 p-3">
                                    <img src={Production} alt="Logo" />

                                    <p className="text-xl font-semibold text-[#0065DE]">Jabatan</p>
                                </div>
                                <BarChartKaryawan value={karyawan?.rekap?.jabatan} />
                                <div className="flex justify-start my-3 px-4">
                                    <button
                                        onClick={() => setShowTable3(!showTable3)}
                                        className="px-4 py-2 bg-[#0065DE] text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        {showTable3 ? 'Hide Details' : 'Show Details'}
                                    </button>
                                </div>
                            </div>
                            {showTable3 && (
                                <div className="overflow-x-auto mt-4">
                                    <table className="min-w-full border-collapse border border-gray-300">
                                        <tbody>
                                            {karyawan?.rekap?.jabatan?.map((dept: any, deptIndex: any, index: any) => {
                                                // Get the department name from rekap
                                                const departmentName = dept.nama;

                                                // Filter employees that belong to this department
                                                const departmentEmployees = karyawan?.data?.filter((employee: any) =>
                                                    employee.biodata_karyawan[0]?.jabatan?.nama_jabatan === departmentName
                                                );

                                                return departmentEmployees && departmentEmployees.length > 0 ? (
                                                    <div key={`dept-${index}-${deptIndex}`} className="mb-6">
                                                        <h3 className="text-lg font-semibold mb-2">Jabatan : {departmentName}</h3>
                                                        <table className="min-w-full border-collapse border border-gray-300">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="border border-gray-300 px-4 py-2">NIK</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Nama</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Status Karyawan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Tipe Penggajian</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Tipe Karyawan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Bagian</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Department</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Divisi</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Jabatan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Grade</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {departmentEmployees.map((employee: any, empIndex: any) => (
                                                                    <tr key={`emp-${index}-${deptIndex}-${empIndex}`} className="text-center">
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.nik || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.name || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.status?.nama_status || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.tipe_penggajian || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.tipe_karyawan || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.bagian?.nama_bagian || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.department?.nama_department || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.divisi?.nama_divisi || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.jabatan?.nama_jabatan || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.grade?.kategori || '-'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : null;
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="min-w-[700px] bg-white border-2">
                        <div className="">
                            <div className="bg-white rounded-md shadow-md md:w-12/12 overflow-x-scroll ">
                                <div className="flex gap-3 p-3">
                                    <img src={Production} alt="Logo" />

                                    <p className="text-xl font-semibold text-[#0065DE]">Jenis Kelamin</p>
                                </div>
                                <BarChartKaryawan value={karyawan?.rekap?.jenis_kelamin} />
                                <div className="flex justify-start my-3 px-4">
                                    <button
                                        onClick={() => setShowTable4(!showTable4)}
                                        className="px-4 py-2 bg-[#0065DE] text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        {showTable4 ? 'Hide Details' : 'Show Details'}
                                    </button>
                                </div>
                            </div>
                            {showTable4 && (
                                <div className="overflow-x-auto mt-4">
                                    <table className="min-w-full border-collapse border border-gray-300">
                                        <tbody>
                                            {karyawan?.rekap?.jenis_kelamin?.map((dept: any, deptIndex: any) => {
                                                // Get the jenis kelamin name from rekap
                                                const kelaminName = dept.nama;

                                                // Normalize the strings for comparison by removing spaces and converting to lowercase
                                                const normalizedKelaminName = kelaminName.replace(/\s+/g, '').toLowerCase();

                                                // Filter employees that belong to this jenis kelamin with normalized comparison
                                                const filteredEmployees = karyawan?.data?.filter((employee: any) => {
                                                    const employeeKelamin = employee.biodata_karyawan[0]?.jenis_kelamin;
                                                    // Normalize employee jenis kelamin
                                                    const normalizedEmployeeKelamin = employeeKelamin ?
                                                        employeeKelamin.replace(/\s+/g, '').toLowerCase() : '';

                                                    return normalizedEmployeeKelamin === normalizedKelaminName;
                                                });

                                                return filteredEmployees && filteredEmployees.length > 0 ? (
                                                    <div key={`jk-${deptIndex}`} className="mb-6">
                                                        <h3 className="text-lg font-semibold mb-2">Jenis Kelamin: {kelaminName}</h3>
                                                        <table className="min-w-full border-collapse border border-gray-300">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="border border-gray-300 px-4 py-2">NIK</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Nama</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Status Karyawan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Tipe Penggajian</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Tipe Karyawan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Bagian</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Department</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Divisi</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Jabatan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Grade</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {filteredEmployees.map((employee: any, empIndex: number) => (
                                                                    <tr key={`emp-jk-${deptIndex}-${empIndex}`} className="text-center">
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.nik || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.name || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.status?.nama_status || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.tipe_penggajian || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.tipe_karyawan || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.bagian?.nama_bagian || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.department?.nama_department || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.divisi?.nama_divisi || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.jabatan?.nama_jabatan || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.grade?.kategori || '-'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : null;
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="min-w-[700px] bg-white border-2">
                        <div className="">
                            <div className="bg-white rounded-md shadow-md md:w-12/12 overflow-x-scroll ">
                                <div className="flex gap-3 p-3">
                                    <img src={Production} alt="Logo" />

                                    <p className="text-xl font-semibold text-[#0065DE]">Status Karyawan</p>
                                </div>
                                <BarChartKaryawan value={karyawan?.rekap?.status_karyawan} />
                                <div className="flex justify-start my-3 px-4">
                                    <button
                                        onClick={() => setShowTable5(!showTable5)}
                                        className="px-4 py-2 bg-[#0065DE] text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        {showTable5 ? 'Hide Details' : 'Show Details'}
                                    </button>
                                </div>
                            </div>
                            {showTable5 && (
                                <div className="overflow-x-auto mt-4">
                                    <table className="min-w-full border-collapse border border-gray-300">
                                        <tbody>
                                            {karyawan?.rekap?.status_karyawan?.map((dept: any, deptIndex: any, index: any) => {
                                                // Get the department name from rekap
                                                const departmentName = dept.nama;

                                                // Filter employees that belong to this department
                                                const departmentEmployees = karyawan?.data?.filter((employee: any) =>
                                                    employee.biodata_karyawan[0]?.status?.nama_status === departmentName
                                                );

                                                return departmentEmployees && departmentEmployees.length > 0 ? (
                                                    <div key={`dept-${index}-${deptIndex}`} className="mb-6">
                                                        <h3 className="text-lg font-semibold mb-2">Status Karyawan : {departmentName}</h3>
                                                        <table className="min-w-full border-collapse border border-gray-300">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="border border-gray-300 px-4 py-2">NIK</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Nama</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Status Karyawan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Tipe Penggajian</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Tipe Karyawan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Bagian</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Department</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Divisi</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Jabatan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Grade</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {departmentEmployees.map((employee: any, empIndex: any) => (
                                                                    <tr key={`emp-${index}-${deptIndex}-${empIndex}`} className="text-center">
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.nik || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.name || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.status?.nama_status || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.tipe_penggajian || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.tipe_karyawan || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.bagian?.nama_bagian || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.department?.nama_department || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.divisi?.nama_divisi || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.jabatan?.nama_jabatan || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.grade?.kategori || '-'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : null;
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="min-w-[700px] bg-white border-2">
                        <div className="">
                            <div className="bg-white rounded-md shadow-md md:w-12/12 overflow-x-scroll ">
                                <div className="flex gap-3 p-3">
                                    <img src={Production} alt="Logo" />

                                    <p className="text-xl font-semibold text-[#0065DE]">Tipe Karyawan</p>
                                </div>
                                <BarChartKaryawan value={karyawan?.rekap?.tipe_karyawan} />
                                <div className="flex justify-start my-3 px-4">
                                    <button
                                        onClick={() => setShowTable6(!showTable6)}
                                        className="px-4 py-2 bg-[#0065DE] text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        {showTable6 ? 'Hide Details' : 'Show Details'}
                                    </button>
                                </div>
                            </div>
                            {showTable6 && (
                                <div className="overflow-x-auto mt-4">
                                    <table className="min-w-full border-collapse border border-gray-300">
                                        <tbody>
                                            {karyawan?.rekap?.tipe_karyawan?.map((dept: any, deptIndex: any, index: any) => {
                                                // Get the department name from rekap
                                                const departmentName = dept.nama;

                                                // Filter employees that belong to this department with case-insensitive comparison
                                                const departmentEmployees = karyawan?.data?.filter((employee: any) => {
                                                    // Get employee tipe_karyawan
                                                    const employeeType = employee.biodata_karyawan[0]?.tipe_karyawan;

                                                    // If either value is null/undefined, return false
                                                    if (!employeeType || !departmentName) return false;

                                                    // Compare case-insensitive
                                                    return employeeType.toLowerCase() === departmentName.toLowerCase();
                                                });

                                                return departmentEmployees && departmentEmployees.length > 0 ? (
                                                    <div key={`dept-${index}-${deptIndex}`} className="mb-6">
                                                        <h3 className="text-lg font-semibold mb-2">Tipe Karyawan : {departmentName}</h3>
                                                        <table className="min-w-full border-collapse border border-gray-300">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="border border-gray-300 px-4 py-2">NIK</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Nama</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Status Karyawan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Tipe Penggajian</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Tipe Karyawan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Bagian</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Department</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Divisi</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Jabatan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Grade</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {departmentEmployees.map((employee: any, empIndex: any) => (
                                                                    <tr key={`emp-${index}-${deptIndex}-${empIndex}`} className="text-center">
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.nik || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.name || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.status?.nama_status || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.tipe_penggajian || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.tipe_karyawan || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.bagian?.nama_bagian || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.department?.nama_department || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.divisi?.nama_divisi || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.jabatan?.nama_jabatan || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.grade?.kategori || '-'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : null;
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="min-w-[700px] bg-white border-2">
                        <div className="">
                            <div className="bg-white rounded-md shadow-md md:w-12/12 overflow-x-scroll ">
                                <div className="flex gap-3 p-3">
                                    <img src={Production} alt="Logo" />

                                    <p className="text-xl font-semibold text-[#0065DE]">Tipe Penggajian</p>
                                </div>
                                <BarChartKaryawan value={karyawan?.rekap?.tipe_penggajian} />
                                <div className="flex justify-start my-3 px-4">
                                    <button
                                        onClick={() => setShowTable7(!showTable7)}
                                        className="px-4 py-2 bg-[#0065DE] text-white rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        {showTable7 ? 'Hide Details' : 'Show Details'}
                                    </button>
                                </div>
                            </div>
                            {showTable7 && (
                                <div className="overflow-x-auto mt-4">
                                    <table className="min-w-full border-collapse border border-gray-300">
                                        <tbody>
                                            {karyawan?.rekap?.tipe_penggajian?.map((dept: any, deptIndex: any, index: any) => {
                                                // Get the department name from rekap
                                                const departmentName = dept.nama;

                                                // Filter employees that belong to this department with case-insensitive comparison
                                                const departmentEmployees = karyawan?.data?.filter((employee: any) => {
                                                    // Get employee tipe_karyawan
                                                    const employeeType = employee.biodata_karyawan[0]?.tipe_penggajian;

                                                    // If either value is null/undefined, return false
                                                    if (!employeeType || !departmentName) return false;

                                                    // Compare case-insensitive
                                                    return employeeType.toLowerCase() === departmentName.toLowerCase();
                                                });

                                                return departmentEmployees && departmentEmployees.length > 0 ? (
                                                    <div key={`dept-${index}-${deptIndex}`} className="mb-6">
                                                        <h3 className="text-lg font-semibold mb-2">Tipe Penggajian : {departmentName}</h3>
                                                        <table className="min-w-full border-collapse border border-gray-300">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="border border-gray-300 px-4 py-2">NIK</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Nama</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Status Karyawan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Tipe Penggajian</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Tipe Karyawan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Bagian</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Department</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Divisi</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Jabatan</th>
                                                                    <th className="border border-gray-300 px-4 py-2">Grade</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {departmentEmployees.map((employee: any, empIndex: any) => (
                                                                    <tr key={`emp-${index}-${deptIndex}-${empIndex}`} className="text-center">
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.nik || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.name || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.status?.nama_status || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.tipe_penggajian || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.tipe_karyawan || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.bagian?.nama_bagian || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.department?.nama_department || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.divisi?.nama_divisi || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.jabatan?.nama_jabatan || '-'}</td>
                                                                        <td className="border border-gray-300 px-4 py-2">{employee.biodata_karyawan[0]?.grade?.kategori || '-'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : null;
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </main>

            </>

        </div >
    )
}

export default RekapKaryawan
