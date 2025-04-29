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
import { ExportButton } from './export-button';
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
                  <ExportButton
                    data={data.defectOs2?.jenis_masalah}
                    type="mesinProblem"
                    label="Export"
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
                    <ExportButton
                      data={data.oneMesin?.data_jenis_masalah}
                      type="oneMesin"
                      label="Export"
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
                    <ExportButton
                      data={data.qualityDefect}
                      type="quality"
                      label="Export"
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
                    <ExportButton
                      data={data.produksiDefect}
                      type="produksi"
                      label="Export"
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
                      <ExportButton
                        data={data.responTime}
                        type="responTime"
                        label="Export"
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
                    <ExportButton
                      data={data.responTimeBulan?.data}
                      type="responTimeBulan"
                      label="Export"
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

                <div className="md:grid grid-cols-1 gap-5 px-10 pb-10 pt-5">
                  <div>
                    <div className="flex gap-3 p-3">
                      <img src={Production} alt="Logo" />
                      <p className="text-xl font-semibold text-[#0065DE]">
                        Response Time
                      </p>
                    </div>
                    <BarChartResponMonth value={data.responTimeBulan} />
                  </div>
                  <div className="flex flex-col ">
                    {data.responTimeBulan?.data.map((data: any, i: any) => {
                      return (
                        <>
                          <div className="flex  py-1 px-2   border-black  gap-4 pt-4">
                            <label className="text-sm font-semibold">
                              {i + 1}.
                            </label>
                            <label className="text-sm col-span-2 font-semibold">
                              {data.mesin}
                            </label>
                          </div>
                          <div className="grid grid-cols-12 border-2 border-black px-1 justify-center gap-4 bg-slate-300">
                            {data.responTimeBulan?.listBulan?.map(
                              (bulan: any) => (
                                <label
                                  key={bulan.nama_bulan}
                                  className="text-xs font-semibold"
                                >
                                  {bulan.nama_bulan}
                                </label>
                              ),
                            )}
                          </div>
                          <div className="grid grid-cols-12 border-x-2 py-1 px-2  border-b-2 border-black  justify-center gap-4">
                            {data.data?.map((data2: any, i: any) => {
                              return (
                                <>
                                  {data.data?.map((data2: any) => (
                                    <label
                                      key={data2.jumlah_waktu_jam}
                                      className="text-xs"
                                    >
                                      {parseFloat(
                                        data2.jumlah_waktu_jam,
                                      ).toFixed(2)}
                                    </label>
                                  ))}
                                </>
                              );
                            })}
                          </div>
                        </>
                      );
                    })}
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
                      <ExportButton
                        data={data.breakDown}
                        type="breakDown"
                        label="Export"
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
                    <ExportButton
                      data={data.breakDownMonth?.data}
                      type="breakDownMonth"
                      label="Export"
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

                <div className="md:grid grid-cols-1 gap-5 px-10 pb-10 pt-5">
                  <div>
                    <div className="flex gap-3 p-3">
                      <img src={Production} alt="Logo" />
                      <p className="text-xl font-semibold text-[#0065DE]">
                        Breakdown Time
                      </p>
                    </div>
                    <BarChartResponMonth value={data.breakDownMonth} />
                  </div>

                  <div className="flex flex-col">
                    {data.breakDownMonth?.data.map((item, i) => (
                      <React.Fragment key={i}>
                        <div className="flex py-1 px-2 border-black gap-4 pt-4">
                          <label className="text-sm font-semibold">
                            {i + 1}.
                          </label>
                          <label className="text-sm col-span-2 font-semibold">
                            {item.mesin}
                          </label>
                        </div>

                        <div className="grid grid-cols-12 border-2 border-black px-1 justify-center gap-4 bg-slate-300">
                          {data.breakDownMonth?.listBulan?.map((month, j) => (
                            <label key={j} className="text-xs font-semibold">
                              {month.nama_bulan}
                            </label>
                          ))}
                        </div>

                        <div className="grid grid-cols-12 border-x-2 py-1 px-2 border-b-2 border-black justify-center gap-4">
                          {item.data?.map((monthData, k) => (
                            <div key={`value-${i}-${k}`}>
                              <button
                                className="text-xs text-blue-500 hover:underline"
                                onClick={() => toggleModal(i, k, true)}
                              >
                                {parseFloat(monthData.jumlah_waktu_jam).toFixed(
                                  2,
                                )}
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
                      </React.Fragment>
                    ))}
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
    [key: string]: any;
  }>;
}

const DetailTable: React.FC<DetailTableProps> = ({ mesin, month, details }) => {
  // Sort and process details as before

  return (
    <div className="overflow-x-auto pt-4">
      <label className="text-sm font-semibold">
        {mesin} - {month}
      </label>
      <table className="min-w-full divide-y divide-gray-200 border border-blue-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 border border-blue-200 rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white font-semibold">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                No JO
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Operator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Verifikator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Eksekutor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Kode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Nama Kendala
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Validasi QC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Breakdown Mtc
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Verifikasi QC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Breakdown Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {details
              ?.slice()
              .map((data3: any) => {
                // Calculate breakdown time for sorting
                let breakdownTimeMs = 0;
                if (data3.createdAt && data3.waktu_selesai) {
                  const startTime = new Date(data3.createdAt);
                  const endTime = new Date(data3.waktu_selesai);
                  // Calculate difference in milliseconds
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
                  const verifTimeDiff =
                    endVerif.getTime() - startVerif.getTime();
                  if (!isNaN(verifTimeDiff) && verifTimeDiff > 0) {
                    verifikasiQcMs = verifTimeDiff;
                  }
                }

                // Add the calculated milliseconds to each item for sorting
                return {
                  ...data3,
                  breakdownTimeMs,
                  breakdownMtcMs,
                  validasiQcMs,
                  verifikasiQcMs,
                };
              })
              // Sort by breakdown time (descending)
              .sort((a: any, b: any) => b.breakdownTimeMs - a.breakdownTimeMs)
              .map((data3: any, index: any) => {
                // Format the breakdown time for display
                let breakdownTime = '-';
                if (data3.breakdownTimeMs > 0) {
                  const hours = Math.floor(
                    data3.breakdownTimeMs / (1000 * 60 * 60),
                  );
                  const minutes = Math.floor(
                    (data3.breakdownTimeMs % (1000 * 60 * 60)) / (1000 * 60),
                  );
                  const seconds = Math.floor(
                    (data3.breakdownTimeMs % (1000 * 60)) / 1000,
                  );
                  breakdownTime = `${hours}h ${minutes}m ${seconds}s`;
                }

                // Format the BreakdownMtc time
                let breakdownMtc = '-';
                if (data3.breakdownMtcMs > 0) {
                  const hoursMtc = Math.floor(
                    data3.breakdownMtcMs / (1000 * 60 * 60),
                  );
                  const minutesMtc = Math.floor(
                    (data3.breakdownMtcMs % (1000 * 60 * 60)) / (1000 * 60),
                  );
                  const secondsMtc = Math.floor(
                    (data3.breakdownMtcMs % (1000 * 60)) / 1000,
                  );
                  breakdownMtc = `${hoursMtc}h ${minutesMtc}m ${secondsMtc}s`;
                }

                // Format the Validasi QC time
                let validasiQc = '-';
                if (data3.validasiQcMs > 0) {
                  const hoursQc = Math.floor(
                    data3.validasiQcMs / (1000 * 60 * 60),
                  );
                  const minutesQc = Math.floor(
                    (data3.validasiQcMs % (1000 * 60 * 60)) / (1000 * 60),
                  );
                  const secondsQc = Math.floor(
                    (data3.validasiQcMs % (1000 * 60)) / 1000,
                  );
                  validasiQc = `${hoursQc}h ${minutesQc}m ${secondsQc}s`;
                }

                // Format the Verifikasi QC time
                let verifikasiQc = '-';
                if (data3.verifikasiQcMs > 0) {
                  const hoursVerif = Math.floor(
                    data3.verifikasiQcMs / (1000 * 60 * 60),
                  );
                  const minutesVerif = Math.floor(
                    (data3.verifikasiQcMs % (1000 * 60 * 60)) / (1000 * 60),
                  );
                  const secondsVerif = Math.floor(
                    (data3.verifikasiQcMs % (1000 * 60)) / 1000,
                  );
                  verifikasiQc = `${hoursVerif}h ${minutesVerif}m ${secondsVerif}s`;
                }

                return (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-blue-50' : 'bg-white'}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {data3.no_jo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {data3.operator}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {data3.verifikator}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {data3.eksekutor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {data3.kode_lkh}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {data3.nama_kendala}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {validasiQc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {breakdownMtc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {verifikasiQc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {breakdownTime}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </table>
    </div>
  );
};

export default RekapOs2Mtc;
