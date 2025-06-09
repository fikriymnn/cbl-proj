import React, { useEffect, useState } from 'react';
import Production from '../../../../images/icon/production.svg';
import BarChartVertical from '../../../../pages/UiElements/BarChartVertical';
import axios from 'axios';
import BarChartResponTime from '../../../../pages/UiElements/BarchartResponTime';
import BarChartResponMonth from '../../../../pages/UiElements/BarchartResponMonth';
import convertTimeStampToDate from '../../../../utils/convertDate';
import BarChartProductionQuality from '../../../../pages/UiElements/BarchartProductionQuality';
import BarChartMesinOnly from '../../../../pages/UiElements/BarchartMesinOnly';
import ModalFull from '../../PPIC/JadwalProduksi/ModalFull';
import { EnhancedExportButton } from './export-button';
import Loading from '../../../Loading';

interface DataState {
  defectOs2?: any;
  qualityDefect?: any;
  produksiDefect?: any;
  responTime?: any;
  responTimeBulan?: any;
  oneMesin?: any;
  allMesin?: any;
  breakDown?: any;
  breakDownMonth?: any;
}

function RekapOs2Mtc() {
  const [data2, setData2] = useState<DataState>({});
  // Current date state
  const [currentDate, setCurrentDate] = useState({
    month: 0,
    year: 0,
  });

  interface DefectItem {
    mesin: string;
    count: number;
    jenis_produksi: number;
    jenis_quality: number;
  }

  interface DefectOs2Data {
    jenis_masalah: DefectItem[];
    total_count: number;
    total_produksi: number;
    total_quality: number;
  }

  interface MesinItem {
    mesin: string;
  }

  interface OneMesinData {
    data_jenis_masalah: {
      jenis_masalah: Array<{ mesin: string }>;
      kode_produksi: Array<{
        kode_analisis_mtc: string;
        nama_analisis_mtc: string;
        count: number;
      }>;
      kode_quality: Array<{
        kode_analisis_mtc: string;
        nama_analisis_mtc: string;
        count: number;
      }>;
      total_produksi: number;
      total_quality: number;
    };
  }

  interface QualityDefectData {
    quality_defect: Array<{
      kode_analisis_mtc: string;
      nama_analisis_mtc: string;
      count: number;
    }>;
    total_count: number;
  }

  interface ProductionDefectData {
    produksi_defect: Array<{
      kode_analisis_mtc: string;
      nama_analisis_mtc: string;
      count: number;
    }>;
    total_count: number;
  }

  interface ResponTimeItem {
    mesin: string;
    minggu: Array<{
      jumlah_waktu_jam: string;
    }>;
    jumlah_waktu_jam: string;
    rata_rata_waktu_jam: string;
  }

  interface BreakDownMonthData {
    queryDari: string;
    querySampai: string;
    data: Array<{
      mesin: string;
      data: Array<{
        nama_bulan: string;
        jumlah_waktu_jam: string;
        details: any[];
      }>;
    }>;
    listBulan: Array<{
      nama_bulan: string;
    }>;
  }

  // Data states
  interface BreakDownItem {
    mesin: string;
    minggu: Array<{
      jumlah_waktu_jam: string;
    }>;
    jumlah_waktu_jam: string;
    rata_rata_waktu_jam: string;
  }

  interface ResponTimeBulanData {
    queryDari: string;
    querySampai: string;
    data: any[];
    listBulan: Array<{
      nama_bulan: string;
    }>;
  }

  const [data, setData] = useState({
    defectOs2: null as DefectOs2Data | null,
    produksiDefect: null as ProductionDefectData | null,
    qualityDefect: null as QualityDefectData | null,
    responTime: [] as ResponTimeItem[],
    responTimeBulan: null as ResponTimeBulanData | null,
    oneMesin: null as OneMesinData | null,
    allMesin: [] as MesinItem[],
    breakDown: [] as BreakDownItem[],
    breakDownMonth: null as BreakDownMonthData | null,
  });

  // Filter states consolidated
  const [filters, setFilters] = useState({
    defectMesin: { from: '', to: '' },
    mesinFilter: {
      dateRange: { from: '', to: '' },
      selectedMesin: '',
    },
    qualityDefect: { from: '', to: '' },
    productionDefect: { from: '', to: '' },
    responTime: {
      month: '',
      year: '',
    },
    breakdownTime: {
      month: '',
      year: '',
    },
    responTimeBulan: { from: '', to: '' },
    breakdownMonth: { from: '', to: '' },
  });

  // Modal state
  const [showModal, setShowModal] = useState<boolean[][]>([]);
  const [params, setParams] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  // Combined fetch function
  const fetchData = async (fetchParams: any) => {
    setParams(fetchParams); // Store the params for use in export filenames
    try {
      const apiBaseUrl = import.meta.env.VITE_API_LINK;

      if (fetchParams.mesinProblem) {
        setIsLoading(true);
        try {
          const res = await axios.get(`${apiBaseUrl}/reportMtc/mesinProblem`, {
            params: {
              start_date: fetchParams.mesinProblem.from,
              end_date: fetchParams.mesinProblem.to,
            },
            withCredentials: true,
          });
          setData((prev) => ({
            ...prev,
            defectOs2: res.data.data_jenis_masalah,
          }));
        } catch (error) {
          console.error('Error fetching mesin problem:', error);
        } finally {
          setIsLoading(false);
        }
      }

      if (fetchParams.quality) {
        setIsLoading(true);
        try {
          const res = await axios.get(`${apiBaseUrl}/reportMtc/qualityDefect`, {
            params: {
              start_date: fetchParams.quality.from,
              end_date: fetchParams.quality.to,
            },
            withCredentials: true,
          });
          setData((prev) => ({ ...prev, qualityDefect: res.data.data }));
          console.log('Quality Defect Data:', res.data.data);
        } catch (error) {
          console.error('Error fetching quality defect:', error);
        } finally {
          setIsLoading(false);
        }
      }

      if (fetchParams.produksi) {
        setIsLoading(true);
        try {
          const res = await axios.get(
            `${apiBaseUrl}/reportMtc/produksiDefect`,
            {
              params: {
                start_date: fetchParams.produksi.from,
                end_date: fetchParams.produksi.to,
              },
              withCredentials: true,
            },
          );
          setData((prev) => ({ ...prev, produksiDefect: res.data.data }));
        } catch (error) {
          console.error('Error fetching produksi defect:', error);
        } finally {
          setIsLoading(false);
        }
      }

      if (fetchParams.responTime) {
        setIsLoading(true);
        try {
          const res = await axios.get(
            `${apiBaseUrl}/reportMtc/responTimeMinggu`,
            {
              params: {
                tahun: fetchParams.responTime.year,
                bulan: fetchParams.responTime.month,
              },
              withCredentials: true,
            },
          );
          setData((prev) => ({ ...prev, responTime: res.data.data }));
          console.log('Respon Time Data:', res.data.data);
        } catch (error) {
          console.error('Error fetching respon time minggu:', error);
        } finally {
          setIsLoading(false);
        }
      }

      if (fetchParams.responTimeBulan) {
        setIsLoading(true);
        try {
          const url = `${apiBaseUrl}/reportMtc/responTime`;
          const res = await axios.get(url, {
            params: {
              fromDate: fetchParams.responTimeBulan.from,
              toDate: fetchParams.responTimeBulan.to,
            },
            withCredentials: true,
          });
          setData((prev) => ({ ...prev, responTimeBulan: res.data }));
          console.log(res.data);
        } catch (error) {
          console.error('Error fetching respon time bulan:', error);
        } finally {
          setIsLoading(false);
        }
      }

      if (fetchParams.oneMesin) {
        setIsLoading(true);
        try {
          const res = await axios.get(
            `${apiBaseUrl}/reportMtc/oneMesinProblem`,
            {
              params: {
                start_date: fetchParams.oneMesin.from,
                end_date: fetchParams.oneMesin.to,
                mesin_name: fetchParams.oneMesin.name,
              },
              withCredentials: true,
            },
          );
          setData((prev) => ({ ...prev, oneMesin: res.data }));
        } catch (error) {
          console.error('Error fetching one mesin data:', error);
        } finally {
          setIsLoading(false);
        }
      }

      if (fetchParams.allMesin) {
        setIsLoading(true);
        try {
          const res = await axios.get(`${apiBaseUrl}/reportMtc/mesinTicket`, {
            withCredentials: true,
          });
          setData((prev) => ({ ...prev, allMesin: res.data }));
        } catch (error) {
          console.error('Error fetching all mesin data:', error);
        } finally {
          setIsLoading(false);
        }
      }

      if (fetchParams.breakDown) {
        setIsLoading(true);
        try {
          const res = await axios.get(
            `${apiBaseUrl}/reportMtc/breakdownTimeMinggu`,
            {
              params: {
                tahun: fetchParams.breakDown.year,
                bulan: fetchParams.breakDown.month,
              },
              withCredentials: true,
            },
          );
          setData((prev) => ({ ...prev, breakDown: res.data.data }));
        } catch (error) {
          console.error('Error fetching breakdown time minggu:', error);
        } finally {
          setIsLoading(false);
        }
      }

      if (fetchParams.breakDownMonth) {
        setIsLoading(true);
        try {
          const res = await axios.get(`${apiBaseUrl}/reportMtc/breakdownTime`, {
            params: {
              fromDate: fetchParams.breakDownMonth.from,
              toDate: fetchParams.breakDownMonth.to,
            },
            withCredentials: true,
          });
          console.log(res);
          setData((prev) => ({ ...prev, breakDownMonth: res.data }));
        } catch (error) {
          console.error('Error fetching breakdown month data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error in fetchData:', error);
    }
  };

  // Filter handlers
  type FilterSections = keyof typeof filters;

  const handleFilterChange = (
    section: FilterSections,
    type: string,
    value: string | { from: string; to: string },
  ) => {
    setFilters((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [type]: value,
      },
    }));
  };
  // Modal handlers
  const toggleModal = (i: number, k: number, isOpen: boolean) => {
    const newModalState = [...showModal];
    if (!newModalState[i]) {
      newModalState[i] = [];
    }
    newModalState[i][k] = isOpen;
    setShowModal(newModalState);
  };
  // State for tracking selected sections
  const [selectedSections, setSelectedSections] = useState({
    defectMesin: false,
    singleMachine: false,
    qualityDefect: false,
    productionDefect: false,
    responseTimeWeekly: false,
    responTimeBulan: false,
    breakdownTimeWeekly: false,
    breakdownTimeMonthly: false,
  });

  // State for showing/hiding the data panels
  const [showSelectionPanel, setShowSelectionPanel] = useState(true);
  const [showDataPanels, setShowDataPanels] = useState(false);

  type SectionKey = keyof typeof selectedSections;

  // Handle view button click
  const handleViewClick = () => {
    setShowSelectionPanel(false);
    setShowDataPanels(true);
    fetchData({
      allMesin: true,
    });
  };

  // Handle back button click
  const handleBackClick = () => {
    setShowSelectionPanel(true);
    setShowDataPanels(false);
  };
  const [allSelected, setAllSelected] = useState(false);

  // Modify the handleCheckboxChange function to update allSelected state
  const handleCheckboxChange = (section: SectionKey) => {
    const updatedSections = {
      ...selectedSections,
      [section]: !selectedSections[section],
    };

    setSelectedSections(updatedSections);

    // Check if all checkboxes are now selected
    const areAllSelected = Object.values(updatedSections).every(
      (value) => value === true,
    );
    setAllSelected(areAllSelected);
  };

  // Add a new function to handle the "Select All" button click
  const handleSelectAllClick = () => {
    const newValue = !allSelected;
    setAllSelected(newValue);

    // Create a new object with all values set to the new selection state
    const updatedSections = Object.keys(selectedSections).reduce(
      (acc, key) => {
        acc[key as SectionKey] = newValue;
        return acc;
      },
      {} as Record<SectionKey, boolean>,
    );

    setSelectedSections(updatedSections);
  };
  return (
    <div>
      {isLoading && <Loading />}

      {/* Defect Mesin Section */}
      {showSelectionPanel && (
        <div className="bg-white rounded-md shadow-md p-6 mb-5 border-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">
              Select Data to Display
            </h2>

            <button
              onClick={handleSelectAllClick}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium flex items-center"
            >
              <span className="mr-2">
                {allSelected ? 'Deselect All' : 'Select All'}
              </span>
              {allSelected ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                  <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z" />
                </svg>
              )}
            </button>
          </div>

          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="defectMesin"
                className="mr-2 h-5 w-5"
                checked={selectedSections.defectMesin}
                onChange={() => handleCheckboxChange('defectMesin')}
              />
              <label htmlFor="defectMesin" className="text-primary font-medium">
                Defect Mesin
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="singleMachine"
                className="mr-2 h-5 w-5"
                checked={selectedSections.singleMachine}
                onChange={() => handleCheckboxChange('singleMachine')}
              />
              <label
                htmlFor="singleMachine"
                className="text-primary font-medium"
              >
                Single Machine
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="qualityDefect"
                className="mr-2 h-5 w-5"
                checked={selectedSections.qualityDefect}
                onChange={() => handleCheckboxChange('qualityDefect')}
              />
              <label
                htmlFor="qualityDefect"
                className="text-primary font-medium"
              >
                Quality Defect
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="productionDefect"
                className="mr-2 h-5 w-5"
                checked={selectedSections.productionDefect}
                onChange={() => handleCheckboxChange('productionDefect')}
              />
              <label
                htmlFor="productionDefect"
                className="text-primary font-medium"
              >
                Production Defect
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="responseTimeWeekly"
                className="mr-2 h-5 w-5"
                checked={selectedSections.responseTimeWeekly}
                onChange={() => handleCheckboxChange('responseTimeWeekly')}
              />
              <label
                htmlFor="responseTimeWeekly"
                className="text-primary font-medium"
              >
                Response Time Weekly
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="responTimeBulan"
                className="mr-2 h-5 w-5"
                checked={selectedSections.responTimeBulan}
                onChange={() => handleCheckboxChange('responTimeBulan')}
              />
              <label
                htmlFor="responTimeBulan"
                className="text-primary font-medium"
              >
                Response Time Monthly
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="breakdownTimeWeekly"
                className="mr-2 h-5 w-5"
                checked={selectedSections.breakdownTimeWeekly}
                onChange={() => handleCheckboxChange('breakdownTimeWeekly')}
              />
              <label
                htmlFor="breakdownTimeWeekly"
                className="text-primary font-medium"
              >
                Breakdown Time Weekly
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="breakdownTimeMonthly"
                className="mr-2 h-5 w-5"
                checked={selectedSections.breakdownTimeMonthly}
                onChange={() => handleCheckboxChange('breakdownTimeMonthly')}
              />
              <label
                htmlFor="breakdownTimeMonthly"
                className="text-primary font-medium"
              >
                Breakdown Time Monthly
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleViewClick}
              className="bg-primary text-white px-8 py-2 rounded-md font-medium"
            >
              View Selected Data
            </button>
          </div>
        </div>
      )}
      {showDataPanels && (
        <div>
          <div className="mb-5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-primary">Data Dashboard</h2>
            <button
              onClick={handleBackClick}
              className="bg-gray-200 text-primary px-5 py-2 rounded-md font-medium"
            >
              Back to Selection
            </button>
          </div>
          {selectedSections.defectMesin && (
            <div className="bg-white rounded-md shadow-md md:w-12/12 mb-5 border-2">
              <div className="flex md:gap-4 gap-1 md:flex-row flex-col px-4 py-4 md:mt-0">
                <p className="my-auto text-sm text-primary font-semibold">
                  Pilih Tanggal
                </p>
                <div className="flex md:justify-center items-center gap-2">
                  <p className="text-sm text-primary font-semibold md:w-3/12 w-2/12">
                    Dari:
                  </p>
                  <input
                    className="rounded-full bg-[#D8EAFF] px-2"
                    type="date"
                    onChange={(e) =>
                      handleFilterChange('defectMesin', 'from', e.target.value)
                    }
                  />
                </div>
                <div className="flex md:justify-center items-center gap-2">
                  <p className="my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
                    Sampai:
                  </p>
                  <input
                    className="rounded-full bg-[#D8EAFF] px-2"
                    type="date"
                    onChange={(e) =>
                      handleFilterChange('defectMesin', 'to', e.target.value)
                    }
                  />
                </div>
                <div className="flex justify-center my-5">
                  <button
                    onClick={() =>
                      fetchData({
                        mesinProblem: {
                          from: filters.defectMesin.from,
                          to: filters.defectMesin.to,
                        },
                      })
                    }
                    className="bg-primary text-white px-5 py-2 rounded-md my-auto"
                  >
                    Tampilkan
                  </button>
                </div>
                <div className="flex justify-center my-5">
                  <button
                    onClick={() =>
                      fetchData({ mesinProblem: { from: null, to: null } })
                    }
                    className="bg-primary text-white px-5 py-2 rounded-md my-auto"
                  >
                    Reset
                  </button>
                </div>
                {/* {data2.defectOs2 && ( */}
                <div className="flex justify-center my-5">
                  <EnhancedExportButton
                    data={data.defectOs2?.jenis_masalah}
                    type="mesinProblem"
                    label="Export"
                    includeCharts={true}
                    chartTypes={['bar']}
                    dateRange={{
                      from: params?.mesinProblem?.from,
                      to: params?.mesinProblem?.to,
                    }}
                  />
                </div>
              </div>

              <div className="md:grid grid-cols-1 gap-5 px-10 pb-10 pt-5">
                <div>
                  <div className="flex gap-3 p-3">
                    <img src={Production} alt="Logo" />
                    <p className="text-xl font-semibold text-[#0065DE]">
                      Defect Mesin
                    </p>
                  </div>
                  <BarChartVertical value={data.defectOs2?.jenis_masalah} />
                </div>
                <div className="flex flex-col">
                  <div className="grid grid-cols-11 border-2 border-black px-1 justify-center gap-4 bg-slate-300">
                    <label className="text-sm font-semibold">No</label>
                    <label className="text-sm font-semibold col-span-2">
                      Mesin
                    </label>
                    <label className="text-sm font-semibold col-span-2">
                      Total Case
                    </label>
                    <label className="text-sm font-semibold col-span-2">
                      Production Case
                    </label>
                    <label className="text-sm font-semibold col-span-2">
                      Quality Case
                    </label>
                    <label className="text-sm font-semibold col-span-2">
                      Pending
                    </label>
                  </div>
                  {data.defectOs2?.jenis_masalah?.map((item: any, i: any) => (
                    <div
                      key={i}
                      className="grid grid-cols-11 border-x-2 py-1 px-2 border-b-2 border-black justify-center gap-4"
                    >
                      <label className="text-sm">{i + 1}</label>
                      <label className="text-sm col-span-2">{item.mesin}</label>
                      <label className="text-sm col-span-2">{item.count}</label>
                      <label className="text-sm col-span-2">
                        {item.jenis_produksi}
                      </label>
                      <label className="text-sm col-span-2">
                        {item.jenis_quality}
                      </label>
                      <label className="text-sm col-span-2"></label>
                    </div>
                  ))}
                  <div className="grid grid-cols-11 border-2 border-black px-1 justify-center gap-4 bg-slate-300">
                    <label className="text-sm font-bold col-span-3">
                      TOTAL
                    </label>
                    <label className="text-sm font-semibold col-span-2">
                      {data.defectOs2?.total_count}
                    </label>
                    <label className="text-sm font-semibold col-span-2">
                      {data.defectOs2?.total_produksi}
                    </label>
                    <label className="text-sm font-semibold col-span-2">
                      {data.defectOs2?.total_quality}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          {selectedSections.singleMachine && (
            <>
              {/* Single Machine Section */}
              <div className="bg-white rounded-md shadow-md md:w-12/12 mb-5 border-2">
                <div className="flex md:gap-4 gap-1 md:flex-row flex-col px-4 py-4 md:mt-0">
                  <p className="my-auto text-sm text-primary font-semibold">
                    Pilih Tanggal
                  </p>
                  <div className="flex md:justify-center items-center gap-2">
                    <p className="text-sm text-primary font-semibold md:w-3/12 w-2/12">
                      Dari:
                    </p>
                    <input
                      className="rounded-full bg-[#D8EAFF] px-2"
                      type="date"
                      onChange={(e) =>
                        handleFilterChange('mesinFilter', 'dateRange', {
                          ...filters.mesinFilter.dateRange,
                          from: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex md:justify-center items-center gap-2">
                    <p className="my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
                      Sampai:
                    </p>
                    <input
                      className="rounded-full bg-[#D8EAFF] px-2"
                      type="date"
                      onChange={(e) =>
                        handleFilterChange('mesinFilter', 'dateRange', {
                          ...filters.mesinFilter.dateRange,
                          to: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="relative flex w-full items-center">
                    <select
                      onChange={(e) =>
                        handleFilterChange(
                          'mesinFilter',
                          'selectedMesin',
                          e.target.value,
                        )
                      }
                      className="z-20 w-full rounded-md bg-blue-200 items-center h-8"
                    >
                      <option disabled selected>
                        Pilih Mesin
                      </option>
                      {data.allMesin?.map((item: any, i: any) => (
                        <option
                          key={i}
                          value={item.mesin}
                          className="text-gray-800 text-sm font-light dark:text-bodydark"
                        >
                          {item.mesin}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-center my-5">
                    <button
                      onClick={() =>
                        fetchData({
                          oneMesin: {
                            from: filters.mesinFilter.dateRange.from,
                            to: filters.mesinFilter.dateRange.to,
                            name: filters.mesinFilter.selectedMesin,
                          },
                        })
                      }
                      className="bg-primary text-white px-5 py-2 rounded-md my-auto"
                    >
                      Tampilkan
                    </button>
                  </div>
                  <div className="flex justify-center my-5">
                    <EnhancedExportButton
                      data={data.oneMesin?.data_jenis_masalah}
                      type="oneMesin"
                      label="Export"
                      includeCharts={true}
                      chartTypes={['bar']}
                      dateRange={{
                        from: params?.oneMesin?.from,
                        to: params?.oneMesin?.to,
                      }}
                    />
                  </div>
                </div>
                <div className="md:grid grid-cols-1 gap-5 px-10 pb-10 ">
                  <div className="">
                    <div className="flex gap-3 p-3">
                      <img src={Production} alt="Logo" />

                      <p className="text-xl font-semibold text-[#0065DE]">
                        {' '}
                        Mesin :{' '}
                        {
                          data.oneMesin?.data_jenis_masalah?.jenis_masalah[0]
                            ?.mesin
                        }
                      </p>
                    </div>
                    <BarChartMesinOnly
                      value={data.oneMesin?.data_jenis_masalah}
                    />
                  </div>
                  <div className="flex flex-col ">
                    <p className="text-xl font-semibold text-black">
                      {' '}
                      Mesin :{' '}
                      {
                        data.oneMesin?.data_jenis_masalah?.jenis_masalah[0]
                          ?.mesin
                      }
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="grid grid-cols-12 border-x-2 bg-slate-300 border-2 border-black px-1 justify-center gap-4 ">
                          <label className="text-sm col-span-2 font-semibold">
                            Kode
                          </label>
                          <label className="text-sm col-span-8 font-semibold">
                            Nama Analisis
                          </label>
                          <label className="text-sm col-span-2 font-semibold">
                            Jumlah
                          </label>
                        </div>
                      </div>
                      <div>
                        <div className="grid grid-cols-12 border-x-2  border-2 border-black px-1 justify-center gap-4 bg-slate-300">
                          <label className="text-sm col-span-2 font-semibold">
                            Kode
                          </label>
                          <label className="text-sm col-span-8 font-semibold">
                            Nama Analisis
                          </label>
                          <label className="text-sm col-span-2 font-semibold">
                            Jumlah
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        {data.oneMesin?.data_jenis_masalah?.kode_produksi?.map(
                          (data: any, i: any) => {
                            return (
                              <>
                                <div className="grid grid-cols-12 border-x-2 border-b-2 border-black px-1 justify-center gap-4 bg-white">
                                  <label className="text-sm col-span-2 font-semibold">
                                    {data.kode_analisis_mtc}
                                  </label>
                                  <label className="text-sm col-span-8 font-semibold">
                                    {data.nama_analisis_mtc}
                                  </label>
                                  <label className="text-sm col-span-2 font-semibold">
                                    {data.count}
                                  </label>
                                </div>
                              </>
                            );
                          },
                        )}
                        <div className="grid grid-cols-12 border-2 border-black px-1 justify-center items-center gap-4 bg-slate-300">
                          <label className="text-sm col-span-10 font-semibold">
                            Total Produksi
                          </label>

                          <label className="text-sm col-span-2 font-semibold">
                            {data.oneMesin?.data_jenis_masalah?.total_produksi}
                          </label>
                        </div>
                      </div>
                      <div>
                        {data.oneMesin?.data_jenis_masalah?.kode_quality?.map(
                          (data: any, i: any) => {
                            return (
                              <>
                                <div className="grid grid-cols-12 border-x-2 border-b-2 border-black px-1 justify-center gap-4 bg-white">
                                  <label className="text-sm col-span-2 font-semibold">
                                    {data.kode_analisis_mtc}
                                  </label>
                                  <label className="text-sm col-span-8 font-semibold">
                                    {data.nama_analisis_mtc}
                                  </label>
                                  <label className="text-sm col-span-2 font-semibold">
                                    {data.count}
                                  </label>
                                </div>
                              </>
                            );
                          },
                        )}
                        <div className="grid grid-cols-12 border-2 border-black px-1 justify-center items-center gap-4 bg-slate-300">
                          <label className="text-sm col-span-10 font-semibold">
                            Total Quality
                          </label>

                          <label className="text-sm col-span-2 font-semibold">
                            {data.oneMesin?.data_jenis_masalah?.total_quality}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {selectedSections.qualityDefect && (
            <>
              {/* Quality Defect Section */}
              <div className="bg-white rounded-md shadow-md md:w-12/12 mb-5 border-2">
                <div className="flex md:gap-4 gap-1 md:flex-row flex-col px-4 py-4 md:mt-0">
                  <p className="my-auto text-sm text-primary font-semibold">
                    Pilih Tanggal
                  </p>
                  <div className="flex md:justify-center items-center gap-2">
                    <p className="text-sm text-primary font-semibold md:w-3/12 w-2/12">
                      Dari:
                    </p>
                    <input
                      className="rounded-full bg-[#D8EAFF] px-2"
                      type="date"
                      onChange={(e) =>
                        handleFilterChange(
                          'qualityDefect',
                          'from',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex md:justify-center items-center gap-2">
                    <p className="my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
                      Sampai:
                    </p>
                    <input
                      className="rounded-full bg-[#D8EAFF] px-2"
                      type="date"
                      onChange={(e) =>
                        handleFilterChange(
                          'qualityDefect',
                          'to',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex justify-center my-5">
                    <button
                      onClick={() =>
                        fetchData({
                          quality: {
                            from: filters.qualityDefect.from,
                            to: filters.qualityDefect.to,
                          },
                        })
                      }
                      className="bg-primary text-white px-5 py-2 rounded-md my-auto"
                    >
                      Tampilkan
                    </button>
                  </div>
                  <div className="flex justify-center my-5">
                    <button
                      onClick={() =>
                        fetchData({ quality: { from: null, to: null } })
                      }
                      className="bg-primary text-white px-5 py-2 rounded-md my-auto"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="flex justify-center my-5">
                    <EnhancedExportButton
                      data={data.qualityDefect}
                      type="quality"
                      label="Export"
                      includeCharts={true}
                      chartTypes={['bar']}
                      dateRange={{
                        from: params?.quality?.from,
                        to: params?.quality?.to,
                      }}
                    />
                  </div>
                </div>

                <div className="md:grid grid-cols-1 gap-5 px-10 pb-10 pt-5">
                  <div>
                    <div className="flex gap-3 p-3">
                      <img src={Production} alt="Logo" />
                      <p className="text-xl font-semibold text-[#0065DE]">
                        Quality Defect
                      </p>
                    </div>
                    <BarChartProductionQuality
                      value={data.qualityDefect?.quality_defect}
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="grid grid-cols-11 border-2 border-black px-1 justify-center gap-4 bg-slate-300">
                      <label className="text-sm font-semibold">No</label>
                      <label className="text-sm font-semibold col-span-2">
                        Kode Analisis
                      </label>
                      <label className="text-sm font-semibold col-span-4">
                        Nama Analisis
                      </label>
                      <label className="text-sm font-semibold col-span-2">
                        Total Case
                      </label>
                    </div>
                    {data.qualityDefect?.quality_defect.map((item, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-11 border-x-2 py-1 px-2 border-b-2 border-black justify-center gap-4"
                      >
                        <label className="text-sm">{i + 1}</label>
                        <label className="text-sm col-span-2">
                          {item.kode_analisis_mtc}
                        </label>
                        <label className="text-sm col-span-4">
                          {item.nama_analisis_mtc}
                        </label>
                        <label className="text-sm col-span-2">
                          {item.count}
                        </label>
                      </div>
                    ))}
                    <div className="grid grid-cols-11 border-2 border-black px-1 justify-center gap-4 bg-slate-300">
                      <label className="text-sm font-bold col-span-7">
                        TOTAL
                      </label>
                      <label className="text-sm font-semibold col-span-2">
                        {data.qualityDefect?.total_count}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {selectedSections.productionDefect && (
            <>
              {/* Production Defect Section */}
              <div className="bg-white rounded-md shadow-md md:w-12/12 mb-5 border-2">
                <div className="flex md:gap-4 gap-1 md:flex-row flex-col px-4 py-4 md:mt-0">
                  <p className="my-auto text-sm text-primary font-semibold">
                    Pilih Tanggal
                  </p>
                  <div className="flex md:justify-center items-center gap-2">
                    <p className="text-sm text-primary font-semibold md:w-3/12 w-2/12">
                      Dari:
                    </p>
                    <input
                      className="rounded-full bg-[#D8EAFF] px-2"
                      type="date"
                      onChange={(e) =>
                        handleFilterChange(
                          'productionDefect',
                          'from',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex md:justify-center items-center gap-2">
                    <p className="my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
                      Sampai:
                    </p>
                    <input
                      className="rounded-full bg-[#D8EAFF] px-2"
                      type="date"
                      onChange={(e) =>
                        handleFilterChange(
                          'productionDefect',
                          'to',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex justify-center my-5">
                    <button
                      onClick={() =>
                        fetchData({
                          produksi: {
                            from: filters.productionDefect.from,
                            to: filters.productionDefect.to,
                          },
                        })
                      }
                      className="bg-primary text-white px-5 py-2 rounded-md my-auto"
                    >
                      Tampilkan
                    </button>
                  </div>
                  <div className="flex justify-center my-5">
                    <button
                      onClick={() =>
                        fetchData({ produksi: { from: null, to: null } })
                      }
                      className="bg-primary text-white px-5 py-2 rounded-md my-auto"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="flex justify-center my-5">
                    <EnhancedExportButton
                      data={data.produksiDefect}
                      type="produksi"
                      label="Export"
                      includeCharts={true}
                      chartTypes={['bar']}
                      dateRange={{
                        from: params?.produksi?.from,
                        to: params?.produksi?.to,
                      }}
                    />
                  </div>
                </div>

                <div className="md:grid grid-cols-1 gap-5  pb-10 pt-5">
                  {/* Continue with Production Defect section */}
                  {/* Production Defect Section Display */}
                  <div className="md:grid grid-cols-1 gap-5 px-10 pb-10 pt-5">
                    <div>
                      <div className="flex gap-3 p-3">
                        <img src={Production} alt="Logo" />
                        <p className="text-xl font-semibold text-[#0065DE]">
                          Production Defect
                        </p>
                      </div>
                      <BarChartProductionQuality
                        value={data.produksiDefect?.produksi_defect}
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="grid grid-cols-11 border-2 border-black px-1 justify-center gap-4 bg-slate-300">
                        <label className="text-sm font-semibold">No</label>
                        <label className="text-sm font-semibold col-span-2">
                          Kode Analisis
                        </label>
                        <label className="text-sm font-semibold col-span-4">
                          Nama Analisis
                        </label>
                        <label className="text-sm font-semibold col-span-2">
                          Total Case
                        </label>
                      </div>
                      {data.produksiDefect?.produksi_defect?.map((item, i) => (
                        <div
                          key={i}
                          className="grid grid-cols-11 border-x-2 py-1 px-2 border-b-2 border-black justify-center gap-4"
                        >
                          <label className="text-sm">{i + 1}</label>
                          <label className="text-sm col-span-2">
                            {item.kode_analisis_mtc}
                          </label>
                          <label className="text-sm col-span-4">
                            {item.nama_analisis_mtc}
                          </label>
                          <label className="text-sm col-span-2">
                            {item.count}
                          </label>
                        </div>
                      ))}
                      <div className="grid grid-cols-11 border-2 border-black px-1 justify-center gap-4 bg-slate-300">
                        <label className="text-sm font-bold col-span-7">
                          TOTAL
                        </label>
                        <label className="text-sm font-semibold col-span-2">
                          {data.produksiDefect?.total_count}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {selectedSections.responseTimeWeekly && (
            <>
              {/* Response Time Weekly Section */}
              <div className="bg-white rounded-md shadow-md md:w-12/12 mb-5 border-2">
                <div className="grid md:gap-4 gap-4 md:flex-row grid-cols-10 px-4 py-4 md:mt-0">
                  <p className="my-auto text-sm text-primary font-semibold col-span-2">
                    Pilih Bulan Dan Tahun
                  </p>
                  <div className="flex items-center gap-2 col-span-2">
                    <p className="text-sm text-primary font-semibold">Bulan:</p>
                    <select
                      className="rounded-full w-full bg-[#D8EAFF] px-2"
                      onChange={(e) =>
                        handleFilterChange(
                          'responTime',
                          'month',
                          e.target.value,
                        )
                      }
                    >
                      <option selected disabled>
                        Pilih Bulan
                      </option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2000, i, 1).toLocaleString('default', {
                            month: 'long',
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <p className="my-auto text-sm text-primary font-semibold">
                      Tahun:
                    </p>
                    <input
                      className="rounded-full bg-[#D8EAFF] px-2"
                      placeholder="Isi Dengan Angka Tahun"
                      type="number"
                      onChange={(e) =>
                        handleFilterChange('responTime', 'year', e.target.value)
                      }
                    />
                  </div>
                  <div className="flex col-span-4 gap-3 justify-end">
                    <div className="flex justify-center ">
                      <button
                        onClick={() =>
                          fetchData({
                            responTime: {
                              month: filters.responTime.month,
                              year: filters.responTime.year,
                            },
                          })
                        }
                        className="bg-primary text-white px-5 py-2 rounded-md my-auto"
                      >
                        Tampilkan
                      </button>
                    </div>
                    <div className="flex justify-center ">
                      <button
                        onClick={() =>
                          fetchData({
                            responTime: {
                              month: currentDate.month,
                              year: currentDate.year,
                            },
                          })
                        }
                        className="bg-primary text-white px-5 py-2 rounded-md my-auto"
                      >
                        Bulan Ini
                      </button>
                    </div>
                    <div className="fex justify-center ">
                      <EnhancedExportButton
                        data={data.responTime}
                        type="responTime"
                        label="Export"
                        includeCharts={true}
                        chartTypes={['bar']}
                        dateRange={{
                          year: params?.responTime?.year || '',
                          month: params?.responTime?.month || '',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Response Time Weekly Content */}
                <div className="md:grid grid-cols-1 gap-5 px-10 pb-10 pt-5">
                  <div>
                    <div className="flex gap-3 p-3">
                      <img src={Production} alt="Logo" />
                      <p className="text-xl font-semibold text-[#0065DE]">
                        Response Time Weekly
                      </p>
                    </div>
                    <BarChartResponTime value={data.responTime} />
                  </div>
                  <div className="flex flex-col">
                    <div className="grid grid-cols-12 border-2 border-black px-1 justify-center gap-4 bg-slate-300">
                      <label className="text-sm font-semibold">No</label>
                      <label className="text-sm font-semibold col-span-2">
                        Mesin
                      </label>
                      <label className="text-sm font-semibold">Minggu 1</label>
                      <label className="text-sm font-semibold">Minggu 2</label>
                      <label className="text-sm font-semibold">Minggu 3</label>
                      <label className="text-sm font-semibold">Minggu 4</label>
                      <label className="text-sm font-semibold">Minggu 5</label>
                      <label className="text-sm font-semibold col-span-2">
                        Total Waktu
                      </label>
                      <label className="text-sm font-semibold col-span-2">
                        Rata-Rata Waktu
                      </label>
                    </div>
                    {data.responTime?.map((item, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-12 border-x-2 py-1 px-2 border-b-2 border-black justify-center gap-4"
                      >
                        <label className="text-sm">{i + 1}</label>
                        <label className="text-sm col-span-2">
                          {item.mesin}
                        </label>
                        {item.minggu?.map((week, j) => (
                          <label key={j} className="text-sm">
                            {parseFloat(week.jumlah_waktu_jam).toFixed(2)}
                          </label>
                        ))}
                        <label className="text-sm col-span-2 line-clamp-1">
                          {parseFloat(item.jumlah_waktu_jam).toFixed(2)}
                        </label>
                        <label className="text-sm col-span-2 line-clamp-1">
                          {parseFloat(item.rata_rata_waktu_jam).toFixed(2)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          {selectedSections.responTimeBulan && (
            <>
              {/* Respon Time Bulan Section */}
              <div className="bg-white rounded-md shadow-md md:w-12/12 mb-5 border-2">
                <div className="flex md:gap-4 gap-1 md:flex-row flex-col px-4 py-4 md:mt-0">
                  <p className="my-auto text-sm text-primary font-semibold">
                    Pilih Tanggal
                  </p>
                  <div className="flex md:justify-center items-center gap-2">
                    <p className="text-sm text-primary font-semibold md:w-3/12 w-2/12">
                      Dari:
                    </p>
                    <input
                      className="rounded-full bg-[#D8EAFF] px-2"
                      type="date"
                      onChange={(e) =>
                        handleFilterChange(
                          'responTimeBulan',
                          'from',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex md:justify-center items-center gap-2">
                    <p className="my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
                      Sampai:
                    </p>
                    <input
                      className="rounded-full bg-[#D8EAFF] px-2"
                      type="date"
                      onChange={(e) =>
                        handleFilterChange(
                          'responTimeBulan',
                          'to',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex justify-center my-5">
                    <button
                      onClick={() =>
                        fetchData({
                          responTimeBulan: {
                            from: filters.responTimeBulan.from,
                            to: filters.responTimeBulan.to,
                          },
                        })
                      }
                      className="bg-primary text-white px-5 py-2 rounded-md my-auto"
                    >
                      Tampilkan
                    </button>
                  </div>
                  <div className="flex justify-center my-5">
                    <button
                      onClick={() =>
                        fetchData({ responTimeBulan: { from: null, to: null } })
                      }
                      className="bg-primary text-white px-5 py-2 rounded-md my-auto"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="flex justify-center my-5">
                    <EnhancedExportButton
                      data={data.responTimeBulan?.data}
                      type="responTimeBulan"
                      label="Export"
                      includeCharts={true}
                      chartTypes={['bar']}
                      dateRange={{
                        from: params?.responTimeBulan?.from,
                        to: params?.responTimeBulan?.to,
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-10 w-full justify-center">
                  <label className="text-xl text-blue-400 font-semibold">
                    {convertTimeStampToDate(data.responTimeBulan?.queryDari)} ~{' '}
                    {convertTimeStampToDate(data.responTimeBulan?.querySampai)}
                  </label>
                </div>

                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                  <div className="max-w-7xl mx-auto">
                    {/* Chart Section */}
                    <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <div className="flex gap-3 mb-4">
                        <img src={Production} alt="Logo" />
                        <p className="text-xl font-semibold text-[#0065DE]">
                          Response Time
                        </p>
                      </div>
                      <BarChartResponMonth value={data.responTimeBulan} />
                    </div>

                    {/* Enhanced Data Table */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                      {/* Table Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Response Time Data
                        </h2>
                      </div>

                      {data.responTimeBulan?.data.map((item, i) => (
                        <div
                          key={i}
                          className="border-b border-gray-200 last:border-b-0"
                        >
                          {/* Machine Header */}
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full font-bold text-sm">
                                {i + 1}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                  {item.mesin}
                                </h3>
                              </div>
                            </div>
                          </div>

                          {/* Month Headers */}
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3">
                            <div className="grid grid-cols-12 gap-4 text-center">
                              {data.responTimeBulan?.listBulan?.map(
                                (month: any, j: any) => (
                                  <div key={j} className="text-white">
                                    <div className="font-semibold text-sm">
                                      {month.nama_bulan}
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          {/* Data Row */}
                          <div className="px-6 py-4 bg-green-50">
                            <div className="flex items-center mb-2">
                              <svg
                                className="w-4 h-4 text-green-600 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                              <span className="text-sm font-semibold text-green-800">
                                Response Time (Hours)
                              </span>
                            </div>
                            <div className="grid grid-cols-12 gap-4 text-center">
                              {item.data?.map((monthData: any, k: any) => (
                                <div key={k}>
                                  <span className="text-sm font-medium text-green-600 px-2 py-1 rounded-md bg-green-100">
                                    {parseFloat(
                                      monthData.jumlah_waktu_jam,
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Empty State */}
                      {(!data.responTimeBulan?.data ||
                        data.responTimeBulan.data.length === 0) && (
                        <div className="text-center py-12">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No data available
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            No response time data found for the selected period.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          {selectedSections.breakdownTimeWeekly && (
            <>
              {/* Breakdown Time Weekly Section */}
              <div className="bg-white rounded-md shadow-md md:w-12/12 mb-5 border-2">
                <div className="grid md:gap-4 gap-4 md:flex-row grid-cols-10 px-4 py-4 md:mt-0">
                  <p className="my-auto text-sm text-primary font-semibold col-span-2">
                    Pilih Bulan Dan Tahun
                  </p>
                  <div className="flex items-center gap-2 col-span-2">
                    <p className="text-sm text-primary font-semibold">Bulan:</p>
                    <select
                      className="rounded-full w-full bg-[#D8EAFF] px-2"
                      onChange={(e) =>
                        handleFilterChange(
                          'breakdownTime',
                          'month',
                          e.target.value,
                        )
                      }
                    >
                      <option selected disabled>
                        Pilih Bulan
                      </option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2000, i, 1).toLocaleString('default', {
                            month: 'long',
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <p className="my-auto text-sm text-primary font-semibold">
                      Tahun:
                    </p>
                    <input
                      className="rounded-full bg-[#D8EAFF] px-2"
                      placeholder="Isi Dengan Angka Tahun"
                      type="number"
                      onChange={(e) =>
                        handleFilterChange(
                          'breakdownTime',
                          'year',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex col-span-4 gap-3 justify-end">
                    <div className="flex justify-center col-span-2">
                      <button
                        onClick={() =>
                          fetchData({
                            breakDown: {
                              month: filters.breakdownTime.month,
                              year: filters.breakdownTime.year,
                            },
                          })
                        }
                        className="bg-primary text-white px-5 py-2 rounded-md my-auto"
                      >
                        Tampilkan
                      </button>
                    </div>
                    <div className="flex justify-center col-span-2">
                      <button
                        onClick={() =>
                          fetchData({
                            breakDown: {
                              month: currentDate.month,
                              year: currentDate.year,
                            },
                          })
                        }
                        className="bg-primary text-white px-5 py-2 rounded-md my-auto"
                      >
                        Bulan Ini
                      </button>
                    </div>
                    <div className="fex justify-center ">
                      <EnhancedExportButton
                        data={data.breakDown}
                        type="breakDown"
                        label="Export"
                        includeCharts={true}
                        chartTypes={['bar']}
                        dateRange={{
                          year: params?.breakdownTime?.year || '',
                          month: params?.breakdownTime?.month || '',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Breakdown Time Weekly Content */}
                <div className="md:grid grid-cols-1 gap-5 px-10 pb-10 pt-5">
                  <div>
                    <div className="flex gap-3 p-3">
                      <img src={Production} alt="Logo" />
                      <p className="text-xl font-semibold text-[#0065DE]">
                        Breakdown Time Weekly
                      </p>
                    </div>
                    <BarChartResponTime value={data.breakDown} />
                  </div>
                  <div className="flex flex-col">
                    <div className="grid grid-cols-12 border-2 border-black px-1 justify-center gap-4 bg-slate-300">
                      <label className="text-sm font-semibold">No</label>
                      <label className="text-sm font-semibold col-span-2">
                        Mesin
                      </label>
                      <label className="text-sm font-semibold">Minggu 1</label>
                      <label className="text-sm font-semibold">Minggu 2</label>
                      <label className="text-sm font-semibold">Minggu 3</label>
                      <label className="text-sm font-semibold">Minggu 4</label>
                      <label className="text-sm font-semibold">Minggu 5</label>
                      <label className="text-sm font-semibold col-span-2">
                        Total Waktu
                      </label>
                      <label className="text-sm font-semibold col-span-2">
                        Rata-Rata Waktu
                      </label>
                    </div>
                    {data.breakDown?.map((item: any, i: number) => (
                      <div
                        key={i}
                        className="grid grid-cols-12 border-x-2 py-1 px-2 border-b-2 border-black justify-center gap-4"
                      >
                        <label className="text-sm">{i + 1}</label>
                        <label className="text-sm col-span-2">
                          {item.mesin}
                        </label>
                        {item.minggu?.map((week: any, j: number) => (
                          <label key={j} className="text-sm">
                            {parseFloat(week.jumlah_waktu_jam).toFixed(2)}
                          </label>
                        ))}
                        <label className="text-sm col-span-2 line-clamp-1">
                          {parseFloat(item.jumlah_waktu_jam).toFixed(2)}
                        </label>
                        <label className="text-sm col-span-2 line-clamp-1">
                          {parseFloat(item.rata_rata_waktu_jam).toFixed(2)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
          {selectedSections.breakdownTimeMonthly && (
            <>
              {/* Breakdown Time Monthly Section */}
              <div className="bg-white rounded-md shadow-md md:w-12/12 mb-5 border-2">
                <div className="flex md:gap-4 gap-1 md:flex-row flex-col px-4 py-4 md:mt-0">
                  <p className="my-auto text-sm text-primary font-semibold">
                    Pilih Tanggal
                  </p>
                  <div className="flex md:justify-center items-center gap-2">
                    <p className="text-sm text-primary font-semibold md:w-3/12 w-2/12">
                      Dari:
                    </p>
                    <input
                      className="rounded-full bg-[#D8EAFF] px-2"
                      type="date"
                      onChange={(e) =>
                        handleFilterChange(
                          'breakdownMonth',
                          'from',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex md:justify-center items-center gap-2">
                    <p className="my-auto text-sm text-primary font-semibold md:w-3/12 w-2/12">
                      Sampai:
                    </p>
                    <input
                      className="rounded-full bg-[#D8EAFF] px-2"
                      type="date"
                      onChange={(e) =>
                        handleFilterChange(
                          'breakdownMonth',
                          'to',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="flex justify-center my-5">
                    <button
                      onClick={() =>
                        fetchData({
                          breakDownMonth: {
                            from: filters.breakdownMonth.from,
                            to: filters.breakdownMonth.to,
                          },
                        })
                      }
                      className="bg-primary text-white px-5 py-2 rounded-md my-auto"
                    >
                      Tampilkan
                    </button>
                  </div>
                  <div className="flex justify-center my-5">
                    <button
                      onClick={() =>
                        fetchData({ breakDownMonth: { from: null, to: null } })
                      }
                      className="bg-primary text-white px-5 py-2 rounded-md my-auto"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="flex justify-center my-5">
                    <EnhancedExportButton
                      data={data.breakDownMonth?.data}
                      type="breakDownMonth"
                      label="Export"
                      includeCharts={true}
                      chartTypes={['bar']}
                      dateRange={{
                        from: params?.breakDownMonth?.from,
                        to: params?.breakDownMonth?.to,
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-10 w-full justify-center">
                  <label className="text-xl text-blue-400 font-semibold">
                    {convertTimeStampToDate(data.breakDownMonth?.queryDari)} ~{' '}
                    {convertTimeStampToDate(data.breakDownMonth?.querySampai)}
                  </label>
                </div>

                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
                  <div className="max-w-7xl mx-auto">
                    {/* Chart Section */}
                    <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <BarChartResponMonth value={data.breakDownMonth} />
                    </div>

                    {/* Enhanced Data Table */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                      {/* Table Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          Machine Breakdown Data
                        </h2>
                      </div>

                      {data.breakDownMonth?.data.map((item, i) => (
                        <div
                          key={i}
                          className="border-b border-gray-200 last:border-b-0"
                        >
                          {/* Machine Header */}
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full font-bold text-sm">
                                {i + 1}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                  {item.mesin}
                                </h3>
                              </div>
                            </div>
                          </div>

                          {/* Month Headers */}
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3">
                            <div className="grid grid-cols-12 gap-4 text-center">
                              {data.breakDownMonth?.listBulan?.map(
                                (month, j) => (
                                  <div key={j} className="text-white">
                                    <div className="font-semibold text-sm">
                                      {month.nama_bulan}
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>

                          {/* Data Rows */}
                          <div className="divide-y divide-gray-100">
                            {/* Total QC Time Row */}
                            <div className="px-6 py-4 bg-purple-50">
                              <div className="flex items-center mb-2">
                                <svg
                                  className="w-4 h-4 text-purple-600 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span className="text-sm font-semibold text-purple-800">
                                  QC Breakdown Time (Hours)
                                </span>
                              </div>
                              <div className="grid grid-cols-12 gap-4 text-center">
                                {item.data?.map((monthData, k) => {
                                  // Calculate total QC time from details
                                  const totalQcTime =
                                    monthData.details?.reduce((acc, detail) => {
                                      let validasiQcMs = 0;
                                      let verifikasiQcMs = 0;

                                      if (
                                        detail.createdAt &&
                                        detail.waktu_respon_qc
                                      ) {
                                        const startQc = new Date(
                                          detail.createdAt,
                                        );
                                        const endQc = new Date(
                                          detail.waktu_respon_qc,
                                        );
                                        const qcTimeDiff =
                                          endQc.getTime() - startQc.getTime();
                                        if (
                                          !isNaN(qcTimeDiff) &&
                                          qcTimeDiff > 0
                                        ) {
                                          validasiQcMs = qcTimeDiff;
                                        }
                                      }

                                      if (
                                        detail.waktu_selesai_mtc &&
                                        detail.waktu_selesai
                                      ) {
                                        const startVerif = new Date(
                                          detail.waktu_selesai_mtc,
                                        );
                                        const endVerif = new Date(
                                          detail.waktu_selesai,
                                        );
                                        const verifTimeDiff =
                                          endVerif.getTime() -
                                          startVerif.getTime();
                                        if (
                                          !isNaN(verifTimeDiff) &&
                                          verifTimeDiff > 0
                                        ) {
                                          verifikasiQcMs = verifTimeDiff;
                                        }
                                      }

                                      return (
                                        acc + (validasiQcMs + verifikasiQcMs)
                                      );
                                    }, 0) || 0;

                                  const totalQcHours =
                                    totalQcTime / (1000 * 60 * 60);

                                  return (
                                    <div key={`qc-${i}-${k}`}>
                                      <button
                                        className="text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline px-2 py-1 rounded-md hover:bg-purple-100 transition-colors"
                                        onClick={() => toggleModal(i, k, true)}
                                      >
                                        {totalQcHours.toFixed(2)}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* MTC Breakdown Time Row */}
                            <div className="px-6 py-4 bg-orange-50">
                              <div className="flex items-center mb-2">
                                <svg
                                  className="w-4 h-4 text-orange-600 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span className="text-sm font-semibold text-orange-800">
                                  MTC Breakdown Time (Hours)
                                </span>
                              </div>
                              <div className="grid grid-cols-12 gap-4 text-center">
                                {item.data?.map((monthData, k) => {
                                  // Calculate total MTC time from details
                                  const totalMtcTime =
                                    monthData.details?.reduce((acc, detail) => {
                                      let breakdownMtcMs = 0;

                                      if (
                                        detail.waktu_respon_mtc &&
                                        detail.waktu_selesai_mtc
                                      ) {
                                        const startMtc = new Date(
                                          detail.waktu_respon_mtc,
                                        );
                                        const endMtc = new Date(
                                          detail.waktu_selesai_mtc,
                                        );
                                        const mtcTimeDiff =
                                          endMtc.getTime() - startMtc.getTime();
                                        if (
                                          !isNaN(mtcTimeDiff) &&
                                          mtcTimeDiff > 0
                                        ) {
                                          breakdownMtcMs = mtcTimeDiff;
                                        }
                                      }

                                      return acc + breakdownMtcMs;
                                    }, 0) || 0;

                                  const totalMtcHours =
                                    totalMtcTime / (1000 * 60 * 60);

                                  return (
                                    <div key={`mtc-${i}-${k}`}>
                                      <button
                                        className="text-sm font-medium text-orange-600 hover:text-orange-800 hover:underline px-2 py-1 rounded-md hover:bg-orange-100 transition-colors"
                                        onClick={() => toggleModal(i, k, true)}
                                      >
                                        {totalMtcHours.toFixed(2)}
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Total Breakdown Time Row */}
                            <div className="px-6 py-4 bg-red-50">
                              <div className="flex items-center mb-2">
                                <svg
                                  className="w-4 h-4 text-red-600 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span className="text-sm font-semibold text-red-800">
                                  Total Breakdown Time (Hours)
                                </span>
                              </div>
                              <div className="grid grid-cols-12 gap-4 text-center">
                                {item.data?.map((monthData, k) => (
                                  <div key={`breakdown-${i}-${k}`}>
                                    <button
                                      className="text-sm font-bold text-red-600 hover:text-red-800 hover:underline px-2 py-1 rounded-md hover:bg-red-100 transition-colors"
                                      onClick={() => toggleModal(i, k, true)}
                                    >
                                      {parseFloat(
                                        monthData.jumlah_waktu_jam,
                                      ).toFixed(2)}
                                    </button>

                                    {showModal[i] && showModal[i][k] && (
                                      <ModalFull
                                        isOpen={true}
                                        onClose={() => toggleModal(i, k, false)}
                                        judul="Detail Data"
                                      >
                                        <DetailTable
                                          mesin={item.mesin}
                                          month={monthData.nama_bulan}
                                          details={monthData.details}
                                        />
                                      </ModalFull>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Empty State */}
                      {(!data.breakDownMonth?.data ||
                        data.breakDownMonth.data.length === 0) && (
                        <div className="text-center py-12">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No data available
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            No breakdown data found for the selected period.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
{
  /* DetailTable Component - Can be moved to a separate file */
}
interface DetailTableProps {
  mesin: string;
  month: string;
  details: Array<{
    createdAt: string;
    waktu_selesai: string;
    waktu_respon_mtc: string;
    waktu_selesai_mtc: string;
    waktu_respon_qc: string;
    no_jo?: string;
    operator?: string;
    verifikator?: string;
    eksekutor?: string;
    kode_lkh?: string;
    nama_kendala?: string;
    [key: string]: any;
  }>;
}

const DetailTable: React.FC<DetailTableProps> = ({ mesin, month, details }) => {
  const formatTime = (milliseconds: number): string => {
    if (milliseconds <= 0) return '-';

    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const processedDetails = details
    ?.slice()
    .map((data3: any) => {
      // Calculate breakdown time
      let breakdownTimeMs = 0;
      if (data3.createdAt && data3.waktu_selesai) {
        const startTime = new Date(data3.createdAt);
        const endTime = new Date(data3.waktu_selesai);
        const timeDiff = endTime.getTime() - startTime.getTime();
        if (!isNaN(timeDiff) && timeDiff > 0) {
          breakdownTimeMs = timeDiff;
        }
      }

      // Calculate BreakdownMtc time
      let breakdownMtcMs = 0;
      if (data3.waktu_respon_mtc && data3.waktu_selesai_mtc) {
        const startMtc = new Date(data3.waktu_respon_mtc);
        const endMtc = new Date(data3.waktu_selesai_mtc);
        const mtcTimeDiff = endMtc.getTime() - startMtc.getTime();
        if (!isNaN(mtcTimeDiff) && mtcTimeDiff > 0) {
          breakdownMtcMs = mtcTimeDiff;
        }
      }

      // Calculate Validasi QC time
      let validasiQcMs = 0;
      if (data3.createdAt && data3.waktu_respon_qc) {
        const startQc = new Date(data3.createdAt);
        const endQc = new Date(data3.waktu_respon_qc);
        const qcTimeDiff = endQc.getTime() - startQc.getTime();
        if (!isNaN(qcTimeDiff) && qcTimeDiff > 0) {
          validasiQcMs = qcTimeDiff;
        }
      }

      // Calculate Verifikasi QC time
      let verifikasiQcMs = 0;
      if (data3.waktu_selesai_mtc && data3.waktu_selesai) {
        const startVerif = new Date(data3.waktu_selesai_mtc);
        const endVerif = new Date(data3.waktu_selesai);
        const verifTimeDiff = endVerif.getTime() - startVerif.getTime();
        if (!isNaN(verifTimeDiff) && verifTimeDiff > 0) {
          verifikasiQcMs = verifTimeDiff;
        }
      }

      // Calculate sum of QC times
      const totalQcMs = validasiQcMs + verifikasiQcMs;

      return {
        ...data3,
        breakdownTimeMs,
        breakdownMtcMs,
        validasiQcMs,
        verifikasiQcMs,
        totalQcMs,
      };
    })
    .sort((a: any, b: any) => b.breakdownTimeMs - a.breakdownTimeMs);

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-lg border border-blue-200">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
            <h2 className="text-xl font-bold text-gray-800">
              Detail Breakdown - {mesin}
            </h2>
          </div>
          <p className="text-gray-600 mt-2 text-lg font-medium">{month}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Records
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {details?.length || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Breakdown
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(
                    processedDetails?.reduce(
                      (acc, item) => acc + item.breakdownTimeMs,
                      0,
                    ) / (processedDetails?.length || 1),
                  )}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Breakdowntime MTC
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(
                    processedDetails?.reduce(
                      (acc, item) => acc + item.breakdownMtcMs,
                      0,
                    ) / (processedDetails?.length || 1),
                  )}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg Breakdowntime QC
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatTime(
                    processedDetails?.reduce(
                      (acc, item) => acc + item.totalQcMs,
                      0,
                    ) / (processedDetails?.length || 1),
                  )}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-blue-500">
                    <div className="flex items-center space-x-2">
                      <span>#</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-blue-500">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>Job Order</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-blue-500">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>Operator</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider border-r border-blue-500">
                    Problem Details
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider border-r border-blue-500">
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Breakdowntime MTC</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider">
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Breakdowntime QC</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-wider border border-blue-500">
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Breakdown Time</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {processedDetails?.map((data3: any, index: number) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-blue-50 transition-colors duration-200`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                      <div className="font-medium text-blue-600">
                        {data3.no_jo || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                      <div>
                        <div className="font-medium">
                          {data3.operator || '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Verifikator: {data3.verifikator || '-'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Eksekutor: {data3.eksekutor || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 border-r border-gray-200">
                      <div>
                        <div className="font-medium text-gray-800">
                          {data3.nama_kendala || '-'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Kode: {data3.kode_lkh || '-'}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center border-r border-gray-200">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          data3.breakdownMtcMs > 2 * 60 * 60 * 1000 // > 2 hours
                            ? 'bg-red-100 text-red-800'
                            : data3.breakdownMtcMs > 1 * 60 * 60 * 1000 // > 1 hour
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {formatTime(data3.breakdownMtcMs)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          data3.totalQcMs > 1 * 60 * 60 * 1000 // > 1 hour
                            ? 'bg-red-100 text-red-800'
                            : data3.totalQcMs > 30 * 60 * 1000 // > 30 minutes
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {formatTime(data3.totalQcMs)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Validasi : {formatTime(data3.validasiQcMs)} |
                        Verifikasi: {formatTime(data3.verifikasiQcMs)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center border border-gray-200">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          data3.breakdownTimeMs > 4 * 60 * 60 * 1000 // > 4 hours
                            ? 'bg-red-100 text-red-800'
                            : data3.breakdownTimeMs > 2 * 60 * 60 * 1000 // > 2 hours
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {formatTime(data3.breakdownTimeMs)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {(!details || details.length === 0) && (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No data available
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  No breakdown records found for this period.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RekapOs2Mtc;
