import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModalKosonganSmall from '../../../Modals/ModalKosonganSmall';
import Loading from '../../../Loading';
import BarChartKaryawan from './BarchartKaryawan';
import Production from '../../../../images/icon/production.svg';

interface StatusCounts {
  active: number;
  cutoff: number;
  resign: number;
  total: number;
}

interface KaryawanRekapData {
  rekap?: {
    department?: any;
    divisi?: any;
    grade?: any;
    jabatan?: any;
    jenis_kelamin?: any;
    status_karyawan?: any;
    tipe_karyawan?: any;
    tipe_penggajian?: any;
    [key: string]: any;
  };
  data?: any[];
}

interface BiodataKaryawan {
  status_active?: string;
}

interface KaryawanDetail {
  biodata_karyawan?: BiodataKaryawan[];
  [key: string]: any;
}

function RekapKaryawan(): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [karyawan, setKaryawan] = useState<KaryawanRekapData | null>(null);
  const [karyawanDetail, setKaryawanDetail] = useState<KaryawanDetail[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    active: 0,
    cutoff: 0,
    resign: 0,
    total: 0,
  });

  // Modified: Change to a Set to track multiple selected sections
  const [selectedSections, setSelectedSections] = useState<Set<string>>(
    new Set(),
  );

  // Field mapping between section IDs and their data fields
  const fieldMap: Record<string, string> = {
    department: 'department',
    divisi: 'divisi',
    grade: 'grade',
    jabatan: 'jabatan',
    jenisKelamin: 'jenis_kelamin',
    statusKaryawan: 'status_karyawan',
    tipeKaryawan: 'tipe_karyawan',
    tipePenggajian: 'tipe_penggajian',
  };

  // Section title mapping
  const sectionTitles: Record<string, string> = {
    statusOverview: 'Employee Status Overview',
    department: 'Department',
    divisi: 'Divisi',
    grade: 'Grade',
    jabatan: 'Jabatan',
    jenisKelamin: 'Jenis Kelamin',
    statusKaryawan: 'Status Karyawan',
    tipeKaryawan: 'Tipe Karyawan',
    tipePenggajian: 'Tipe Penggajian',
  };

  useEffect(() => {
    getKaryawan();
    getKaryawanDetail();
  }, []);

  // Modified: Toggle function for multiple selections
  const toggleSection = (section: string): void => {
    setSelectedSections((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(section)) {
        newSelected.delete(section);
      } else {
        newSelected.add(section);
      }
      return newSelected;
    });
  };

  async function getKaryawan(): Promise<void> {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawanRekap`;
    try {
      setIsLoading(true);
      const res = await axios.get(url, {
        params: {
          is_active: true,
        },
        withCredentials: true,
      });
      setIsLoading(false);
      setKaryawan(res.data);
      console.log(res.data);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function getKaryawanDetail(): Promise<void> {
    const url = `${import.meta.env.VITE_API_LINK}/hr/karyawan`;
    try {
      setIsLoadingDetail(true);
      const res = await axios.get(url, {
        params: {},
        withCredentials: true,
      });
      setKaryawanDetail(res.data.data);
      calculateStatusCounts(res.data.data);
      console.log('Detail data:', res.data.data);
      setIsLoadingDetail(false);
    } catch (error) {
      console.log(error);
      setIsLoadingDetail(false);
    }
  }

  const calculateStatusCounts = (employeeData: KaryawanDetail[]): void => {
    if (!employeeData || !Array.isArray(employeeData)) {
      console.log('Invalid employee data format');
      return;
    }

    const counts: StatusCounts = {
      active: 0,
      cutoff: 0,
      resign: 0,
      total: employeeData.length,
    };

    employeeData.forEach((employee) => {
      const status =
        employee?.biodata_karyawan?.[0]?.status_active?.toLowerCase();
      if (status === 'active') {
        counts.active += 1;
      } else if (status === 'cut off') {
        counts.cutoff += 1;
      } else {
        counts.resign += 1;
      }
    });

    setStatusCounts(counts);
  };

  // Render the status overview content
  const renderStatusOverviewContent = (): JSX.Element => {
    return (
      <div className="p-4 overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b border-r text-left">Status</th>
              <th className="py-2 px-4 border-b border-r text-left">Jumlah</th>
              <th className="py-2 px-4 border-b text-left">Persentase</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2 px-4 border-b border-r">Active</td>
              <td className="py-2 px-4 border-b border-r">
                {statusCounts.active}
              </td>
              <td className="py-2 px-4 border-b">
                {statusCounts.total > 0
                  ? ((statusCounts.active / statusCounts.total) * 100).toFixed(
                      2,
                    )
                  : 0}
                %
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b border-r">Cut Off</td>
              <td className="py-2 px-4 border-b border-r">
                {statusCounts.cutoff}
              </td>
              <td className="py-2 px-4 border-b">
                {statusCounts.total > 0
                  ? ((statusCounts.cutoff / statusCounts.total) * 100).toFixed(
                      2,
                    )
                  : 0}
                %
              </td>
            </tr>
            <tr>
              <td className="py-2 px-4 border-b border-r">Resign</td>
              <td className="py-2 px-4 border-b border-r">
                {statusCounts.resign}
              </td>
              <td className="py-2 px-4 border-b">
                {statusCounts.total > 0
                  ? ((statusCounts.resign / statusCounts.total) * 100).toFixed(
                      2,
                    )
                  : 0}
                %
              </td>
            </tr>
            <tr className="bg-gray-50">
              <td className="py-2 px-4 border-b border-r font-semibold">
                Total
              </td>
              <td className="py-2 px-4 border-b border-r font-semibold">
                {statusCounts.total}
              </td>
              <td className="py-2 px-4 border-b font-semibold">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Render the chart content for a specific section
  const renderChartContent = (sectionId: string): JSX.Element => {
    const dataField = fieldMap[sectionId];
    return (
      <div className="p-4 h-full">
        <BarChartKaryawan
          value={karyawan?.rekap?.[dataField]}
          employeeData={karyawan?.data ?? []}
          groupField={dataField}
        />
      </div>
    );
  };

  // Interface for the card component props
  interface CardProps {
    id: string;
    title: string;
    isSelected: boolean;
  }

  // Card component for collapsed or expanded view
  const Card: React.FC<CardProps> = ({ id, title, isSelected }) => {
    return (
      <div
        className={`bg-white border-2 rounded-md shadow-md cursor-pointer ${
          isSelected ? 'border-blue-500 bg-blue-50' : ''
        }`}
        onClick={() => toggleSection(id)}
      >
        <div className="flex gap-3 items-center p-3">
          <img src={Production} alt="Logo" />
          <p className="text-xl font-semibold text-[#0065DE]">{title}</p>
          {isSelected && (
            <span className="ml-auto bg-blue-500 text-white rounded-full p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          )}
        </div>
      </div>
    );
  };

  // Button to show selected sections
  const ViewSelectedButton: React.FC = () => {
    if (selectedSections.size === 0) return null;

    return (
      <div className="fixed bottom-4 right-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-lg flex items-center"
          onClick={() => setShowSelected(true)}
        >
          <span>Tampilkan Data ({selectedSections.size})</span>
          <svg
            className="ml-2"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    );
  };

  // State to control view mode
  const [showSelected, setShowSelected] = useState<boolean>(false);

  // Render selected cards in expanded view
  const renderSelectedCards = (): JSX.Element => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Data Dipilih</h2>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-3 rounded-md"
            onClick={() => setShowSelected(false)}
          >
            Kembali
          </button>
        </div>

        {Array.from(selectedSections).map((sectionId) => (
          <div
            key={sectionId}
            className="bg-white border-2 rounded-md shadow-md"
          >
            <div className="flex justify-between items-center p-3 border-b">
              <div className="flex gap-3 items-center">
                <img src={Production} alt="Logo" />
                <p className="text-xl font-semibold text-[#0065DE]">
                  {sectionTitles[sectionId]}
                </p>
              </div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => toggleSection(sectionId)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18"></path>
                  <path d="M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {sectionId === 'statusOverview'
              ? renderStatusOverviewContent()
              : renderChartContent(sectionId)}
          </div>
        ))}
      </div>
    );
  };

  // Main card selection grid
  const renderCardSelectionGrid = (): JSX.Element => {
    return (
      <>
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">PILIH DATA</h2>
          <p className="text-gray-600">
            Pilih Beberapa Data Yang Ingin Ditampilkan.
          </p>
        </div>
        <div className="mb-4">
          <Card
            id="statusOverview"
            title="Employee Status Overview"
            isSelected={selectedSections.has('statusOverview')}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            id="department"
            title="Department"
            isSelected={selectedSections.has('department')}
          />
          <Card
            id="divisi"
            title="Divisi"
            isSelected={selectedSections.has('divisi')}
          />
          <Card
            id="grade"
            title="Grade"
            isSelected={selectedSections.has('grade')}
          />
          <Card
            id="jabatan"
            title="Jabatan"
            isSelected={selectedSections.has('jabatan')}
          />
          <Card
            id="jenisKelamin"
            title="Jenis Kelamin"
            isSelected={selectedSections.has('jenisKelamin')}
          />
          <Card
            id="statusKaryawan"
            title="Status Karyawan"
            isSelected={selectedSections.has('statusKaryawan')}
          />
          <Card
            id="tipeKaryawan"
            title="Tipe Karyawan"
            isSelected={selectedSections.has('tipeKaryawan')}
          />
          <Card
            id="tipePenggajian"
            title="Tipe Penggajian"
            isSelected={selectedSections.has('tipePenggajian')}
          />
        </div>
        <ViewSelectedButton />
      </>
    );
  };

  return (
    <div>
      <main className="flex flex-col">
        {(isLoading || isLoadingDetail) && <Loading />}
        {showSelected ? renderSelectedCards() : renderCardSelectionGrid()}
      </main>
    </div>
  );
}

export default RekapKaryawan;
