import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDateOnly from '../../../../../utils/convertDateOnly';
import convertDateToTime from '../../../../../utils/converDateToTime';
import calculateElapsedTime from '../../../../../utils/calculateElapsedTime';
import formatElapsedTime from '../../../../../utils/formatElapsedTime';
import Loading from '../../../../Loading';
import ModalAddPeriode from '../../../../Modals/Qc/ModalAddPeriode';
import formatInteger from '../../../../../utils/formaterInteger';
import Select from 'react-select';
import convertTimeStampToDateTime from '../../../../../utils/converDateTime';
import ptcbl from '../../../../../images/ptcbl.png';

function CheckSheetHasilRabut() {
  const [selectedECs, setSelectedECs] = useState<string[]>([]);
  const [usedEyeCs, setUsedEyeCs] = useState<string[]>([]);
  const { id } = useParams();
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [RabutMesin, setRabutMesin] = useState<any>();
  const [Catatan, setCatatan] = useState<any>();
  const [idDefect, setIdDefect] = useState<any>();

  const [sample1Value, setSample1Value] = useState<any>();
  const [result1, setResult1] = useState<any>();

  const [sample2Value, setSample2Value] = useState<any>();
  const [result2, setResult2] = useState<any>();

  const [sample3Value, setSample3Value] = useState<any>();
  const [result3, setResult3] = useState<any>();

  const [details, setDetails] = useState<any>(null);

  const [showModal2, setShowModal2] = useState(false);
  const [add, setAdd] = useState<any>();
  const [showDetail, setShowDetail] = useState<boolean[]>(
    new Array(add != null && add.length).fill(false),
  );
  const [eyeC, setEyeC] = useState<any>();
  useEffect(() => {
    getRabutMesin();
    getMasterDefect();
    fetchMasterWaste();
    if (RabutMesin?.data?.inspeksi_rabut_point) {
      const extractedEyeCs =
        RabutMesin?.data?.inspeksi_rabut_point.map(
          (point: any) => point.eye_c,
        ) || [];
      setUsedEyeCs(
        extractedEyeCs.filter((v: any, i: any, a: any) => a.indexOf(v) === i),
      );
    }
  }, []);

  async function getRabutMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiRabut/${id}`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });
      getKendalaByJO(res.data.data.no_jo);
      getmesinByJo(res.data.data.no_jo);
      setRabutMesin(res.data);
      console.log(res.data);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }

  const [options, setOptions] = useState<any>([]); // Options for the first dropdown
  const [secondOptions, setSecondOptions] = useState<any>([]); // Filtered options for the second dropdown
  const [defectMaster, setDefectMaster] = useState<any>([]); // Full data for the first dropdown
  const [selectedOption, setSelectedOption] = useState<any>(null); // Selected option from the first dropdown
  const [selectedSecondOption, setSelectedSecondOption] = useState<any>(null);
  const [masterWaste, setMasterWaste] = useState<any>([]);
  const [wasteSelectLkh, setwasteSelectLkh] = useState<any>([]);
  const [wasteSelectCode, setwasteSelectCode] = useState<any>([]);
  const [tujuanDepartment, settujuanDepartment] = useState<any>([]);

  async function getMasterDefect() {
    const url = `${
      import.meta.env.VITE_API_LINK_P1
    }/api/list-kendala?criteria=true`;

    try {
      setIsLoading(true);
      const res = await axios.get(url);
      setIsLoading(false);
      setDefectMaster(res.data); // Save raw data for filtering
      setOptions(
        res.data.map((item: any) => ({
          value: item.e_kode_produksi,
          label: `${item.e_kode_produksi} - ${item.nama_kendala}`,
        })),
      );
      console.log('master defect', res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error.data.msg);
    }
  }
  async function fetchMasterWaste() {
    const url2 = `${import.meta.env.VITE_API_LINK_P1}/api/master-waste`;

    try {
      setIsLoading(true);
      const res = await axios.get(url2);
      setIsLoading(false);
      setMasterWaste(res.data.waste); // Save raw data for filtering
      console.log('Master Waste Data:', res.data.waste);
    } catch (error: any) {
      setIsLoading(false);
      console.error('Error fetching master waste:', error);
    }
  }
  const [kendalaByJo, setkendalaByJo] = useState<any>([]);
  const [selectedMesinJO, setselectedMesinJO] = useState<any>(null);
  const [selectedOperatorJO, setselectedOperatorJO] = useState<any>(null);
  const [mesinByJo, setmesinByJo] = useState<any>([]);
  async function getKendalaByJO(noJO: any) {
    const url = `${
      import.meta.env.VITE_API_LINK_P1
    }/api/get-kendala-by-jo/${noJO}`;

    try {
      setIsLoading(true);
      const res = await axios.get(url);
      setIsLoading(false);
      setkendalaByJo(res.data.data);
      console.log('kendala by jo', res.data.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }
  async function getmesinByJo(noJO: any) {
    const url = `${
      import.meta.env.VITE_API_LINK_P1
    }/api/get-mesin-by-jo/${noJO}`;

    try {
      setIsLoading(true);
      const res = await axios.get(url);
      setIsLoading(false);
      setmesinByJo(res.data.data);
      console.log('Mesin by jo', res.data.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }
  // First dropdown handler
  const handleChangePointSelect1 = (selected: any) => {
    if (!selected) {
      console.warn('No selection provided to handleChangePointSelect1');
      return;
    }

    const { value } = selected;
    console.log(`Processing selection: ${value}`);

    // Log data availability
    console.log('Data available for processing:', {
      masterWasteAvailable:
        Array.isArray(masterWaste) && masterWaste.length > 0,
      defectMasterAvailable:
        Array.isArray(defectMaster) && defectMaster.length > 0,
      kendalaByJoAvailable:
        Array.isArray(kendalaByJo) && kendalaByJo.length > 0,
    });

    // Check if masterWaste is defined before filtering
    const filteredWaste = Array.isArray(masterWaste)
      ? masterWaste.filter((item: any) => item.kode_waste === value)
      : [];

    // Check if defectMaster is defined before filtering
    const filteredDefect = Array.isArray(defectMaster)
      ? defectMaster.filter((item: any) => item.e_kode_produksi === value)
      : [];

    // Only proceed if filteredDefect has items
    if (filteredDefect.length > 0) {
      const firstFilteredItemDefect = filteredDefect[0];
      console.log(firstFilteredItemDefect.i_id);
      setIdDefect(firstFilteredItemDefect);
      console.log(firstFilteredItemDefect.target_department);
      settujuanDepartment(firstFilteredItemDefect.target_department);
    }

    // Check if kendalaByJo is defined before using find
    if (Array.isArray(kendalaByJo)) {
      // Priority 1: Always check kendalaByJo first
      const matchingKendala = kendalaByJo.find(
        (kendala: any) => kendala.kode_kendala === value,
      );

      // If a match is found in kendalaByJo, always use that machine
      if (matchingKendala) {
        setselectedMesinJO(matchingKendala.mesin);
        setselectedOperatorJO(matchingKendala.operator);
        console.log(
          `Using machine from kendalaByJo: ${matchingKendala.mesin} for kode_kendala: ${value}`,
        );
      }
      // Fallback to process-based logic only if not found in kendalaByJo
      else {
        let targetProcess = '';

        if (value.startsWith('CO')) {
          targetProcess = 'coating';
        } else if (value.startsWith('PT')) {
          targetProcess = 'potong';
        } else if (value.startsWith('C')) {
          targetProcess = 'cetak';
        } else if (value.startsWith('P')) {
          targetProcess = 'pond';
        } else if (value.startsWith('LP')) {
          targetProcess = 'lipat';
        } else if (value.startsWith('L')) {
          targetProcess = 'lem';
        }

        // Check if mesinByJo is defined and has items before using find
        if (targetProcess && Array.isArray(mesinByJo) && mesinByJo.length > 0) {
          const matchingMachine = mesinByJo.find((mesin: any) =>
            mesin.proses.toLowerCase().includes(targetProcess.toLowerCase()),
          );

          if (matchingMachine) {
            setselectedMesinJO(matchingMachine.mesin);
            setselectedOperatorJO(matchingMachine.operator);
            console.log(
              `Selected machine: ${matchingMachine.mesin} for process: ${targetProcess}`,
            );
          } else {
            console.warn(`No machine found for process: ${targetProcess}`);
            setselectedMesinJO(null);
            setselectedOperatorJO(null);
          }
        } else {
          console.warn(
            `No valid process identified for kode_waste: ${value} or mesinByJo is empty`,
          );
          setselectedMesinJO(null);
          setselectedOperatorJO(null);
        }
      }
    } else {
      console.warn('kendalaByJo is undefined or not an array');
      // Use null instead of empty array
      setselectedMesinJO(null);
      setselectedOperatorJO(null);
    }

    if (filteredWaste.length > 0) {
      const firstFilteredItem = filteredWaste[0];
      const allSecondOptions =
        firstFilteredItem.waste?.map((wasteItem: any) => ({
          value: wasteItem.i_kendala,
          label: `${wasteItem.kode_kendala} - ${wasteItem.kendala_desc}`,
        })) || [];

      console.log('All Second Options:', allSecondOptions);
      setSelectedOption(selected);
      setSecondOptions(allSecondOptions);
      setSelectedSecondOption(null);
    } else {
      console.warn('No matching waste found for kode_waste:', value);
      setSelectedOption(selected);
      setSecondOptions([]);
      setSelectedSecondOption(null);
      setwasteSelectLkh('');
      setwasteSelectCode('');
    }
  };

  // Second dropdown handler
  const handleChangePointSelect2 = (selected: any) => {
    console.log('Selected Second Option:', selected);
    setSelectedSecondOption(selected);

    if (selected?.label) {
      const [code, description] = selected.label.split(' - ');
      const selectedCode = code?.trim() || '';
      const selectedDescription = description?.trim() || '';

      setwasteSelectCode(selectedCode);
      setwasteSelectLkh(selectedDescription);

      // Check if kendalaByJo is defined before using find
      if (Array.isArray(kendalaByJo)) {
        // Priority 1: Always check kendalaByJo first for the second dropdown as well
        const matchingKendala = kendalaByJo.find(
          (kendala: any) => kendala.kode_kendala === selectedCode,
        );

        // If found in kendalaByJo, always use that machine (overriding any previous selection)
        if (matchingKendala) {
          setselectedMesinJO(matchingKendala.mesin);
          setselectedOperatorJO(matchingKendala.operator);
          console.log(
            `Updated machine from second selection: ${matchingKendala.mesin} for kode_kendala: ${selectedCode}`,
          );
        }
        // Otherwise keep the machine that was set in the first dropdown
      } else {
        console.warn(
          'kendalaByJo is undefined or not an array in second dropdown handler',
        );
        // No need to set anything here as we want to keep the previous selection
      }
    } else {
      console.warn('Invalid selection for handleChangePointSelect2:', selected);
      setwasteSelectCode('');
      setwasteSelectLkh('');
    }
  };
  async function startTaskRabut(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiRabutPoint/start/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {},
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getRabutMesin();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
      alert(error.response.data.msg);
    }
  }

  async function stopTaskRabut(
    id: number,
    startTime: any,
    catatan: any,
    qty_pallet: any,
    data_defect: any,
  ) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiRabutPoint/stop/${id}`;
    try {
      setIsLoading(true);
      const elapsedSeconds = calculateElapsedTime(startTime, new Date());
      console.log(elapsedSeconds);
      const res = await axios.put(
        url,
        {
          eye_c: eyeC,
          catatan: catatan,
          lama_pengerjaan: elapsedSeconds,
          qty_pallet,
          data_defect,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getRabutMesin();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error.response.data.msg);
      alert(error.response.data.msg);
    }
  }
  const handleECChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    index: number,
  ) => {
    const selectedEC = event.target.value;
    setSelectedECs((prevSelectedECs) => {
      const updatedSelectedECs = [...prevSelectedECs];
      updatedSelectedECs[index] = selectedEC;
      return updatedSelectedECs;
    });
  };

  const getAvailableECs = (): string[] => {
    const allECs: string[] = [
      'EF1',
      'EF2',
      'EF3',
      'EF4',
      'EF5',
      'EF6',
      'EF7',
      'EF8',
      'EF9',
      'EF10',
    ];
    const usedEyeCs: string[] = [];

    RabutMesin.data?.inspeksi_rabut_point?.forEach((point: any) => {
      if (point.eye_c) {
        usedEyeCs.push(point.eye_c);
      }
    });

    const availableECs = allECs.filter((ec) => !usedEyeCs.includes(ec));

    return availableECs;
  };

  async function tambahTaskRabut(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiRabutPoint/create`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,
        {
          id_inspeksi_rabut: id,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getRabutMesin();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error.data.msg);
    }
  }

  async function doneRabut(id: number) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiRabut/done/${id}`;
    try {
      setIsLoading(true);
      const res = await axios.put(
        url,
        {
          sample_1: sample1Value,
          sample_2: sample2Value,
          sample_3: sample3Value,
          catatan: Catatan,
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      getRabutMesin();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error.data.msg);
    }
  }
  async function tambahDefectPeriode(
    id: number,
    idDefect: number,
    idPoint: number,
    index: number,
    kodeLkh: any,
    masalahLkh: any,
    mesin: any,
    operator: any,
  ) {
    const url = `${
      import.meta.env.VITE_API_LINK
    }/qc/cs/inspeksiRabutPoint/createDefect`;
    try {
      setIsLoading(true);
      const res = await axios.post(
        url,

        {
          id_inspeksi_rabut: id,
          id_inspeksi_rabut_point: idPoint,
          MasterDefect: idDefect,
          target_department: tujuanDepartment,
          kode_lkh: kodeLkh,
          masalah_lkh: masalahLkh,
          mesin: mesin,
          operator: operator,
        },

        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      setShowModal2(false);
      handleClickAdd(index);
      setIdDefect(null);
      getRabutMesin();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  const handleClickAdd = (index: number) => {
    setShowDetail((prevState) => {
      const updatedShowDetail = [...prevState]; // Create a copy
      updatedShowDetail[index] = !updatedShowDetail[index]; // Toggle value
      return updatedShowDetail;
    });
    setSelectedOption(null);
    setSelectedSecondOption(null);
  };

  const handleChangePoint = (e: any, i: number, ii: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = RabutMesin;
    onchangeVal.data.inspeksi_rabut_point[i].inspeksi_rabut_defect[ii][name] =
      value;
    setRabutMesin(onchangeVal);
  };

  const handleChangeRabutPoint = (e: any, i: number) => {
    const { name, value } = e.target;
    const onchangeVal: any = RabutMesin;
    onchangeVal.data.inspeksi_rabut_point[i][name] = value;
    setRabutMesin(onchangeVal);
    console.log(onchangeVal);
  };

  const tanggal = convertTimeStampToDateOnly(RabutMesin?.data?.createdAt);
  const jam = convertDateToTime(RabutMesin?.data?.createdAt);

  const jumlahWaktuCheck = formatElapsedTime(RabutMesin?.data?.waktu_check);
  const [openGuide, setOpenGuide] = useState(null);
  const handleClickGuide = (index: any) => {
    setOpenGuide((prevState: any) => {
      return prevState === index ? null : index;
    });
  };
  const [isOpen, setIsOpen] = useState(false);

  const openPreview = () => {
    setIsOpen(true);
  };

  const closePreview = () => {
    setIsOpen(false);
  };

  const printChecksheet = () => {
    const printArea = document.getElementById('print-area');

    if (!printArea) return;

    // Store the current page
    const currentPage = window.location.href;

    // Create a new window for printing with your domain still in URL
    const printWindow = window.open(
      currentPage,
      '_blank',
      'toolbar=0,location=1,menubar=0',
    );

    if (!printWindow) {
      alert('Please allow pop-ups for printing functionality');
      return;
    }

    // Get all styles from the current document
    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join('');
        } catch (e) {
          // Likely a CORS issue with external stylesheet
          if (styleSheet.href) {
            return `<link rel="stylesheet" href="${styleSheet.href}">`;
          }
          return '';
        }
      })
      .filter(Boolean);

    // Clear the new window and insert content with styles
    printWindow.document.open();
    printWindow.document.write(`
      <html>
        <head>
          <style>
            ${styles.join('')}
            
            /* A4 page setup with consistent scale */
            @page {
              size: A4;
              margin: 10mm;
            }
            
            body {
              margin: 0;
              padding: 0;
            }
            
            .print-container {
              width: 100%;
              max-width: 100%;
              box-sizing: border-box;
              transform: scale(0.95);
              transform-origin: top left;
            }
            
            /* Adjust font sizes for print */
            .print-container * {
              font-size: 10px !important;
            }
            
            .print-container h3, 
            .print-container .text-lg, 
            .print-container .font-semibold {
              font-size: 12px !important;
            }
            
            /* Adjust row heights */
            .print-container table td {
              padding: 2px !important;
            }
            
            /* Ensure table fits width */
            .print-container table {
              width: 100% !important;
              table-layout: fixed;
            }
            
            /* Print settings - allow multiple pages */
            @media print {
              html, body {
                width: 210mm;
              }
              
              .print-container {
                page-break-inside: auto; /* Allow page breaks within container */
              }
              
              /* Keep table rows together where possible */
              tr {
                page-break-inside: avoid;
              }
              
              /* Keep table headers with their tables */
              thead {
                display: table-header-group;
              }
              
              /* Better page break handling */
              h1, h2, h3, h4, h5 {
                page-break-after: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${printArea.innerHTML}
          </div>
          <script>
            window.onload = function() {
              // Small delay to ensure styles are applied
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                }
              }, 500);
            }
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-y-auto pt-10">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-7xl">
            {/* Modal header */}
            <div className="border-b px-4 py-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Print Preview
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={printChecksheet}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print Checksheet
                </button>
                <button
                  onClick={closePreview}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Print area content */}
            <div
              id="print-area"
              className="p-6 overflow-auto max-h-[calc(100vh-150px)]"
            >
              <table className="border-collapse border w-full text-sm">
                <thead>
                  <tr>
                    <td colSpan={2} className="border border-black p-2">
                      <div className="flex items-center">
                        <div className="w-24 flex justify-center">
                          <img src={ptcbl} alt="logo" />
                        </div>
                        <div className="flex-grow text-center font-bold text-lg">
                          QUALITY ASSURANCE DEPARTMENT
                        </div>
                        <div className="w-24 flex justify-center">{'  '}</div>
                      </div>
                    </td>
                    <td
                      rowSpan={2}
                      className="border border-black p-2 text-left font-bold"
                    >
                      No. Dok : {RabutMesin?.data?.no_doc}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={2}
                      className="border border-black p-2 text-center font-bold"
                    >
                      HASIL RABUT CHECKSHEET
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {/* Job Order Information */}
                  <tr>
                    <td colSpan={3} className="border border-black p-2">
                      <div className="grid grid-cols-2 gap-4">
                        <table className="w-full">
                          <tbody>
                            <tr>
                              <td className="font-semibold w-32">No. JO</td>
                              <td>: {RabutMesin?.data?.no_jo}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold w-32">No. IO</td>
                              <td>: {RabutMesin?.data?.no_io}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold w-32">
                                Nama Barang
                              </td>
                              <td>: {RabutMesin?.data?.nama_produk}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold w-32">Customer</td>
                              <td>: {RabutMesin?.data?.customer}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold w-32">Status JO</td>
                              <td>: {RabutMesin?.data?.status_jo}</td>
                            </tr>
                          </tbody>
                        </table>

                        <table className="w-full">
                          <tbody>
                            <tr>
                              <td className="font-semibold w-32">Tanggal</td>
                              <td>: {tanggal}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold w-32">Jam</td>
                              <td>: {jam}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold w-32">Shift</td>
                              <td>: {RabutMesin?.data?.shift}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold w-32">Mesin</td>
                              <td>: {RabutMesin?.data?.mesin}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold w-32">Operator</td>
                              <td>: {RabutMesin?.data?.operator}</td>
                            </tr>
                            <tr></tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>

                  {/* Inspection Points */}
                  {RabutMesin?.data?.inspeksi_rabut_point?.map(
                    (data: any, index: any) => (
                      <React.Fragment key={index}>
                        <tr>
                          <td
                            colSpan={3}
                            className="border border-black p-2 bg-gray-100"
                          >
                            <div className="grid grid-cols-6 w-full gap-2">
                              <div className="col-span-2">
                                <span className="font-semibold">
                                  QTY PALLET Ke {index + 1}
                                </span>
                                <span className="">: {data.qty_pallet}</span>
                              </div>

                              <div>
                                <span className="font-semibold">
                                  INSPEKTOR{' '}
                                </span>
                                <span>:{data.inspektor?.nama}</span>
                              </div>
                              <div>
                                <span className="font-semibold">WAKTU </span>
                                <span>
                                  :{formatElapsedTime(data.lama_pengerjaan)}
                                </span>
                              </div>
                              <div>
                                <span className="font-semibold">TIME </span>
                                <span>
                                  :
                                  {convertTimeStampToDateTime(data.waktu_mulai)}
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Defects */}
                        <tr>
                          <td colSpan={3} className="border border-black p-2">
                            <div className="flex flex-wrap">
                              {data?.inspeksi_rabut_defect?.map(
                                (defect: any, i: any) => (
                                  <div key={i} className="w-1/6 p-2">
                                    <div className="border p-2 h-full flex flex-col">
                                      <div className="font-semibold mb-1">
                                        {defect.kode} - {defect.masalah}
                                      </div>
                                      {defect.kode_lkh &&
                                        defect.kode_lkh !== '' && (
                                          <div className="text-xs mb-1">
                                            Dengan: {defect.kode_lkh} -{' '}
                                            {defect.masalah_lkh}
                                          </div>
                                        )}
                                      <div className="mt-auto text-center border-t pt-1 font-semibold">
                                        {defect.jumlah_defect}
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Notes */}
                        <tr>
                          <td colSpan={3} className="border border-black p-2">
                            <div className="font-semibold">Catatan:</div>
                            <div className="p-2 min-h-[60px] border border-gray-300 rounded mt-1">
                              {data.catatan}
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    ),
                  )}

                  {/* Totals Section */}
                  <tr>
                    <td colSpan={3} className="border border-black p-2">
                      <div className="bg-white">
                        <p className="text-sm font-semibold px-5 pt-5">
                          SUB TOTAL
                        </p>
                        <div>
                          <div className="px-5">
                            <p className="font-semibold text-sm mt-5">
                              Parameter Qty Palet
                            </p>
                            <input
                              type="text"
                              readOnly
                              value={formatInteger(
                                parseInt(RabutMesin?.sumQtyPallet),
                              )}
                              className="bg-[#e8e6e6] border rounded border-strokedark"
                            />
                          </div>

                          <div className="grid grid-cols-8 gap-4 py-4 p-5">
                            {RabutMesin?.totalPointDefect.map(
                              (data: any, index: number) => {
                                return (
                                  <div
                                    key={index}
                                    className="grid items-center"
                                  >
                                    <label className="text-[#6c6b6b] text-sm font-semibold">
                                      {data.kode}
                                    </label>
                                    <input
                                      type="text"
                                      defaultValue={formatInteger(
                                        parseInt(data.total_defect),
                                      )}
                                      className="bg-[#e8e6e6] px-1 border rounded border-strokedark w-full"
                                    />
                                  </div>
                                );
                              },
                            )}
                          </div>

                          <div className="gap-10 p-5">
                            <div className="w-4/12">
                              <label className="text-[#6c6b6b] text-sm font-semibold">
                                JUMLAH DEFECT YANG DITEMUKAN
                              </label>
                              <input
                                type="text"
                                readOnly
                                value={formatInteger(
                                  parseInt(RabutMesin?.totalDefect),
                                )}
                                className="bg-[#e8e6e6] px-1 border rounded border-strokedark w-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Catatan Section */}
                  <tr>
                    <td colSpan={3} className="border border-black p-2">
                      <div className="w-full flex gap-10">
                        <div className="grid w-[80%]">
                          {RabutMesin?.data?.status != 'history' ? (
                            <>
                              <label className="text-[#6c6b6b] text-sm font-semibold">
                                KETERANGAN
                              </label>
                              <textarea
                                onChange={(e) => setCatatan(e.target.value)}
                                className="border rounded h-44 w-12/12 resize-none"
                              ></textarea>
                            </>
                          ) : (
                            <>
                              <label className="text-[#6c6b6b] text-sm font-semibold">
                                KETERANGAN
                              </label>
                              <textarea
                                defaultValue={RabutMesin?.data.catatan}
                                disabled
                                className="border rounded h-44 w-12/12 resize-none"
                              ></textarea>
                            </>
                          )}
                        </div>

                        {/* Sample Section */}
                        <div className="text-neutral-500 gap-2 items-start justify-start flex flex-col text-sm font-semibold">
                          <>
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <label className="text-neutral-500 flex flex-col text-sm font-semibold">
                                  Sample 1
                                </label>
                                <input
                                  readOnly
                                  value={RabutMesin?.data?.sample_1}
                                  type="text"
                                  className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                                />
                                <div>gr</div>
                              </div>
                              <div>
                                ={' '}
                                <input
                                  name="hasilsample1"
                                  disabled
                                  value={RabutMesin?.data?.hasil_sample_1}
                                  type="text"
                                  className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                                />{' '}
                                g/m<sup className="">2</sup>
                              </div>
                            </div>

                            <div className="flex gap-2 flex-col">
                              <div className="flex gap-2">
                                <label className="text-neutral-500 flex flex-col text-sm font-semibold">
                                  Sample 2
                                </label>
                                <input
                                  readOnly
                                  value={RabutMesin?.data?.sample_2}
                                  type="text"
                                  className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                                />
                                <div>gr</div>
                              </div>
                              <div>
                                ={' '}
                                <input
                                  name="hasilsample2"
                                  disabled
                                  value={RabutMesin?.data?.hasil_sample_2}
                                  type="text"
                                  className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                                />{' '}
                                g/m<sup className="">2</sup>
                              </div>
                            </div>

                            <div className="flex gap-2 flex-col">
                              <div className="flex gap-2">
                                <label className="text-neutral-500 flex flex-col text-sm font-semibold">
                                  Sample 3
                                </label>
                                <input
                                  readOnly
                                  value={RabutMesin?.data?.sample_3}
                                  type="text"
                                  className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                                />
                                <div>gr</div>
                              </div>
                              <div>
                                ={' '}
                                <input
                                  name="hasilsample3"
                                  disabled
                                  value={RabutMesin?.data?.hasil_sample_3}
                                  type="text"
                                  className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                                />{' '}
                                g/m<sup className="">2</sup>
                              </div>
                            </div>
                          </>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <main className="overflow-x-hidden">
        <div className="z-50">{isLoading && <Loading />}</div>

        <div className="min-w-[700px] bg-white rounded-xl">
          <p className="text-[14px] font-semibold w-full flex justify-between border-b-8 border-[#D8EAFF] py-4 px-9 md:ps-9 ps-12">
            <div className="flex gap-1">
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
              Sampling Hasil Rabut Checksheet
            </div>
            <button
              onClick={openPreview}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Preview Checksheet
            </button>
          </p>

          <div className="grid grid-cols-12  border-b-8 border-[#D8EAFF]">
            <div className="grid grid-rows-6 gap-2 col-span-2 pl-6 py-4 ">
              <label className="text-neutral-500 text-sm font-semibold">
                Tanggal
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                No. JO
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                No. IO
              </label>

              <label className="text-neutral-500 text-sm font-semibold">
                Nama Produk
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                Customer
              </label>
            </div>
            <div className="grid grid-rows-6 gap-2 col-span-2  py-4">
              <label className="text-neutral-500 text-sm font-semibold">
                : {tanggal}
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                : {RabutMesin?.data?.no_jo}
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                : {RabutMesin?.data?.no_io}
              </label>

              <label className="text-neutral-500 text-sm font-semibold">
                : {RabutMesin?.data?.nama_produk}
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                : {RabutMesin?.data?.customer}
              </label>
            </div>

            <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4">
              <label className="text-neutral-500 text-sm font-semibold">
                Jam
              </label>
              <label className="text-neutral-500 text-sm font-semibold"></label>
            </div>
            <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
              <label className="text-neutral-500 text-sm font-semibold">
                : {jam}
              </label>
              <label className="text-neutral-500 text-sm font-semibold"></label>
            </div>
            <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-10 py-4">
              <label className="text-neutral-500 text-sm font-semibold">
                Shift
              </label>

              <label className="text-neutral-500 text-sm font-semibold">
                Mesin
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                Operator
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                Status Jo
              </label>
            </div>
            <div className="grid grid-rows-6  gap-2 col-span-2 justify-between px-2 py-4">
              <label className="text-neutral-500 text-sm font-semibold">
                : {RabutMesin?.data?.shift}
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                : {RabutMesin?.data?.mesin}
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                : {RabutMesin?.data?.operator}
              </label>
              <label className="text-neutral-500 text-sm font-semibold">
                : {RabutMesin?.data?.status_jo}
              </label>
            </div>
          </div>

          {/* =============================chekcsheet========================= */}
          {RabutMesin?.data?.inspeksi_rabut_point.map(
            (data: any, index: number) => {
              const lamaPengerjaan = formatElapsedTime(data.lama_pengerjaan);
              return (
                <>
                  <label
                    className="text-blue-400 text-sm font-semibold  w-full flex justify-end px-4 py-2"
                    onClick={() => handleClickGuide(index)}
                  >
                    History Kendala JO
                  </label>
                  {openGuide == index ? (
                    <div className="  rounded-md bg-[#F3F3F3] border-gray flex px-5 mx-5 py-6 justify-between">
                      <div className="grid grid-cols-1">
                        <div className="flex flex-col">
                          <label className="text-blue-600 text-sm font-semibold pb-6">
                            Daftar Kendala : {RabutMesin?.data?.no_jo}
                          </label>
                          <div className="grid grid-cols-12 gap-2">
                            <label className="text-stone-600 text-sm font-semibold ">
                              No
                            </label>

                            <label className="text-stone-600 text-sm font-semibold col-span-3">
                              Tanggal Produksi
                            </label>
                            <label className="text-stone-600 text-sm font-semibold col-span-2">
                              Durasi
                            </label>
                            <label className="text-stone-600 text-sm font-semibold col-span-2">
                              Mesin
                            </label>
                            <label className="text-stone-600 text-sm font-semibold col-span-4">
                              Kendala
                            </label>
                          </div>
                          {kendalaByJo?.map((data: any, i: any) => (
                            <>
                              <div key={i} className="flex flex-col">
                                <div className="grid grid-cols-12 gap-2">
                                  <label className="text-stone-600 text-sm  ">
                                    {i + 1}.
                                  </label>

                                  <label className="text-stone-600 text-sm  col-span-3">
                                    {data.tgl_produksi}
                                  </label>
                                  <label className="text-stone-600 text-sm  col-span-2">
                                    {data.durasi}
                                  </label>
                                  <label className="text-stone-600 text-sm  col-span-2">
                                    {data.mesin}
                                  </label>
                                  <label className="text-stone-600 text-sm  col-span-4">
                                    {data.kode_kendala} - {data.nama_kendala}
                                  </label>
                                </div>
                              </div>
                            </>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                  <div className="flex flex-col py-6 px-10 ">
                    <div className=" grid grid-cols-6 w-full  gap-2">
                      <div className="w-11/12">
                        <label className="text-neutral-500 text-sm font-semibold w-10/12">
                          QTY PALET KE {index + 1}
                        </label>
                        {data.status == 'done' ? (
                          <input
                            name="qty_pallet"
                            defaultValue={formatInteger(
                              parseInt(data.qty_pallet),
                            )}
                            disabled
                            onChange={(e) => handleChangeRabutPoint(e, index)}
                            type="text"
                            className="px-1 border rounded border-strokedark w-10/12"
                          />
                        ) : data.status == 'on progress' ? (
                          <input
                            name="qty_pallet"
                            defaultValue={data.qty_pallet}
                            onChange={(e) => handleChangeRabutPoint(e, index)}
                            type="text"
                            className="px-1 border rounded border-strokedark w-10/12"
                          />
                        ) : null}
                      </div>
                      <div className="flex flex-col">
                        {data.status == 'on progress' ? (
                          <>
                            <select
                              value={selectedECs[index]}
                              onChange={(e) => {
                                setEyeC(e.target.value);
                                handleECChange(e, index);
                              }}
                            >
                              {getAvailableECs().map((ec) => (
                                <option key={ec} value={ec}>
                                  {ec}
                                </option>
                              ))}
                            </select>
                          </>
                        ) : (
                          <label className="pl-2">{data.eye_c}</label>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <label className="text-neutral-500 text-sm font-semibold ">
                          INSPEKTOR
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold ">
                          {data.inspektor?.nama}
                        </label>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-neutral-500 text-sm font-semibold ">
                          WAKTU
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold ">
                          {lamaPengerjaan}
                        </label>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-neutral-500 text-sm font-semibold ">
                          Time :
                        </label>
                        <label className="text-neutral-500 text-sm font-semibold ">
                          {convertTimeStampToDateTime(data.waktu_mulai)}
                        </label>
                      </div>
                      <div className="flex flex-col ">
                        <>
                          <div className="flex flex-col ">
                            <p className="md:text-[14px] text-[9px] font-semibold">
                              Upload Foto (Optional):
                            </p>

                            <div className="">
                              <input
                                disabled
                                type="file"
                                name=""
                                id=""
                                className="w-40"
                              />
                            </div>
                          </div>
                        </>
                      </div>
                      <div className="flex flex-col ">
                        <>
                          {data.status == 'incoming' ? (
                            <>
                              <p className="font-bold text-[#DE0000]">
                                Task Belum Dimulai
                              </p>
                              <button
                                disabled={isLoading}
                                type="button"
                                onClick={() => {
                                  startTaskRabut(data.id);
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
                          ) : data.status == 'on progress' ? (
                            <>
                              <p className="font-bold text-green-600">
                                Task Dimulai
                              </p>
                              <p className="font-semibold">
                                Time :{' '}
                                {convertTimeStampToDateTime(data.waktu_mulai)}
                              </p>
                              <button
                                disabled={isLoading}
                                type="button"
                                onClick={() => {
                                  console.log(RabutMesin.data);
                                  stopTaskRabut(
                                    data.id,
                                    data.waktu_mulai,
                                    data.catatan,
                                    data.qty_pallet,
                                    data.inspeksi_rabut_defect,
                                  );
                                }}
                                className="flex w-full  rounded-md bg-red-600 justify-center items-center px-2 py-2 hover:cursor-pointer"
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
                          ) : null}
                        </>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-8">
                    {data.inspeksi_rabut_defect.map((data2: any, i: number) => {
                      return (
                        <>
                          <div className="grid py-4 px-4 items-center">
                            <label className=" text-[#6c6b6b] text-sm font-semibold">
                              {data2.kode} - {data2.masalah}
                            </label>
                            {data2.kode_lkh == '' || data2.kode_lkh == null ? (
                              <></>
                            ) : (
                              <>
                                <label className=" text-[#6c6b6b] text-sm font-semibold">
                                  Dengan : {data2.kode_lkh} -{' '}
                                  {data2.masalah_lkh}
                                </label>
                              </>
                            )}
                            {data.status == 'done' ? (
                              <input
                                type="text"
                                name="hasil"
                                defaultValue={data2.hasil}
                                disabled
                                onChange={(e) => handleChangePoint(e, index, i)}
                                className="px-1 border rounded border-strokedark w-full"
                              />
                            ) : data.status == 'on progress' ? (
                              <input
                                type="text"
                                name="hasil"
                                onChange={(e) => handleChangePoint(e, index, i)}
                                className="px-1 border rounded border-strokedark w-full "
                              />
                            ) : null}
                          </div>
                        </>
                      );
                    })}
                    {data.status == 'on progress' ? (
                      <>
                        <button
                          onClick={() => handleClickAdd(index)}
                          className=" h-10 rounded-sm bg-blue-600 text-white text-sm font-bold justify-center items-center px-2 py-1 hover:cursor-pointer"
                        >
                          Add
                        </button>
                      </>
                    ) : null}
                  </div>

                  {showDetail[index] == true && (
                    <>
                      <ModalAddPeriode
                        isOpen={showDetail[index]}
                        onClose={() => handleClickAdd(index)}
                        judul={'ADD PROBLEM CODE'}
                      >
                        <div className="flex flex-col gap-2">
                          <label className="text-black text-sm font-bold pt-4">
                            Master Defect
                          </label>
                          <Select
                            options={options}
                            value={selectedOption}
                            onChange={handleChangePointSelect1}
                            placeholder="Select a Defect"
                          />
                          <Select
                            options={secondOptions}
                            value={selectedSecondOption}
                            onChange={handleChangePointSelect2}
                            placeholder="Select an Option"
                            isDisabled={!selectedOption} // Disable until the first dropdown has a selection
                          />
                          {selectedOption && selectedSecondOption && (
                            <button
                              type="button"
                              disabled={isLoading}
                              onClick={() => {
                                tambahDefectPeriode(
                                  RabutMesin?.data?.id,
                                  idDefect,
                                  data.id,
                                  index,
                                  wasteSelectCode,
                                  wasteSelectLkh,
                                  selectedMesinJO,
                                  selectedOperatorJO,
                                ),
                                  console.log(
                                    RabutMesin?.data?.id,
                                    idDefect,
                                    data.id,
                                    index,
                                    wasteSelectCode,
                                    wasteSelectLkh,
                                    selectedMesinJO,
                                    selectedOperatorJO,
                                  );
                              }}
                              className="bg-blue-600 rounded-md w-full h-10 text-white font-semibold text-sm"
                            >
                              TAMBAH MASALAH
                            </button>
                          )}
                        </div>
                      </ModalAddPeriode>
                    </>
                  )}

                  <div className="grid grid-cols-10 border-b-8 border-[#D8EAFF] px-4 py-4 gap-3">
                    <div className="grid col-span-8">
                      <label className=" text-[#6c6b6b] text-sm font-semibold">
                        Catatan<span className="text-red-500">*</span> :
                      </label>
                      {data.status == 'on progress' ? (
                        <textarea
                          name="catatan"
                          defaultValue={data.catatan}
                          onChange={(e) => handleChangeRabutPoint(e, index)}
                          className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                        ></textarea>
                      ) : data.status == 'done' ? (
                        <textarea
                          name="catatan"
                          disabled
                          defaultValue={data.catatan}
                          onChange={(e) => handleChangeRabutPoint(e, index)}
                          className="peer h-full min-h-[100px] w-full resize-none rounded-[7px] border border-stroke bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 focus:border-2 focus:border-gray-900 focus:outline-0 disabled:resize-none disabled:border-0 disabled:bg-blue-gray-50"
                        ></textarea>
                      ) : null}
                    </div>
                    <div className="grid col-span-2 items-end justify-center"></div>
                  </div>
                </>
              );
            },
          )}
        </div>
        {RabutMesin?.data?.status == 'incoming' ||
        RabutMesin?.data?.status == 'pending' ? (
          <button
            disabled={isLoading}
            onClick={() => tambahTaskRabut(RabutMesin?.data.id)}
            className=" w-[16%] h-10 rounded-sm bg-blue-600 text-white text-sm font-bold justify-center items-center px-4 py-2 mb-2 hover:cursor-pointer"
          >
            + QTY PALET
          </button>
        ) : null}
        <div className="bg-white ">
          <p className="text-sm font-semibold px-5 pt-5">SUB TOTAL</p>
          <div>
            <div className="px-5">
              <p className="font-semibold text-sm mt-5 ">Parameter Qty Palet</p>
              <input
                type="text"
                readOnly
                value={formatInteger(parseInt(RabutMesin?.sumQtyPallet))}
                className="bg-[#e8e6e6] border rounded border-strokedark"
              />
            </div>
            <div>
              <div className="grid grid-cols-8 gap-4 py-4 p-5">
                {RabutMesin?.totalPointDefect.map(
                  (data: any, index: number) => {
                    return (
                      <div className="grid  items-center">
                        <label className=" text-[#6c6b6b]  text-sm font-semibold">
                          {data.kode}
                        </label>
                        <input
                          type="text"
                          defaultValue={formatInteger(
                            parseInt(data.total_defect),
                          )}
                          className="bg-[#e8e6e6] px-1 border rounded border-strokedark w-full"
                        />
                      </div>
                    );
                  },
                )}
              </div>

              <div className=" gap-10 p-5">
                <div className="w-4/12">
                  <label className=" text-[#6c6b6b] text-sm font-semibold">
                    JUMLAH DEFECT YANG DITEMUKAN
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formatInteger(parseInt(RabutMesin?.totalDefect))}
                    className="bg-[#e8e6e6]  px-1 border rounded border-strokedark w-full"
                  />
                </div>

                <div className="w-full  flex gap-10">
                  <div className="grid w-[80%]">
                    {RabutMesin?.data?.status != 'history' ? (
                      <>
                        <label className=" text-[#6c6b6b] text-sm font-semibold">
                          KETERANGAN
                        </label>
                        <textarea
                          onChange={(e) => setCatatan(e.target.value)}
                          className="border rounded h-44 w-12/12 resize-none"
                        ></textarea>
                      </>
                    ) : (
                      <>
                        <label className=" text-[#6c6b6b] text-sm font-semibold">
                          KETERANGAN
                        </label>
                        <textarea
                          defaultValue={RabutMesin?.data.catatan}
                          disabled
                          className="border rounded h-44 w-12/12 resize-none"
                        ></textarea>
                      </>
                    )}
                  </div>

                  {RabutMesin?.data?.status == 'incoming' ||
                  RabutMesin?.data?.status == 'pending' ? (
                    <div className="text-neutral-500 gap-2 items-start justify-start flex flex-col text-sm font-semibold ">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <label className="text-neutral-500 flex flex-col text-sm font-semibold">
                            Sample 1
                          </label>
                          <input
                            required
                            onChange={(e) => {
                              const newValue = parseFloat(e.target.value);
                              setSample1Value(newValue);
                              const result = (newValue / 16) * 10000;
                              setResult1(result);
                            }}
                            type="text"
                            className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                          />
                          <div>gr</div>
                        </div>
                        <div>
                          ={' '}
                          <input
                            name="hasilsample1"
                            disabled
                            value={result1}
                            type="text"
                            className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                          />{' '}
                          g/m<sup className="">2</sup>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-col">
                        <div className="flex gap-2">
                          <label className="text-neutral-500 flex flex-col text-sm font-semibold">
                            Sample 2
                          </label>
                          <input
                            required
                            onChange={(e) => {
                              const newValue = parseFloat(e.target.value);
                              setSample2Value(newValue);
                              const result = (newValue / 16) * 10000;
                              setResult2(result);
                            }}
                            type="text"
                            className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                          />
                          <div>gr</div>
                        </div>
                        <div>
                          ={' '}
                          <input
                            name="hasilsample2"
                            disabled
                            value={result2}
                            type="text"
                            className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                          />{' '}
                          g/m<sup className="">2</sup>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-col">
                        <div className="flex gap-2">
                          <label className="text-neutral-500 flex flex-col text-sm font-semibold">
                            Sample 3
                          </label>
                          <input
                            required
                            onChange={(e) => {
                              const newValue = parseFloat(e.target.value);
                              setSample3Value(newValue);

                              const result = (newValue / 16) * 10000;
                              setResult3(result);
                            }}
                            type="text"
                            className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                          />
                          <div>gr</div>
                        </div>
                        <div>
                          ={' '}
                          <input
                            name="hasilsample3"
                            disabled
                            value={result3}
                            type="text"
                            className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                          />{' '}
                          g/m<sup className="">2</sup>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-neutral-500 gap-2 items-start justify-start flex flex-col text-sm font-semibold col-span-2">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <label className="text-neutral-500 flex flex-col text-sm font-semibold">
                            Sample 1
                          </label>
                          <input
                            readOnly
                            value={RabutMesin?.data?.sample_1}
                            type="text"
                            className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                          />
                          <div>gr</div>
                        </div>
                        <div>
                          ={' '}
                          <input
                            name="hasilsample1"
                            disabled
                            value={RabutMesin?.data?.hasil_sample_1}
                            type="text"
                            className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                          />{' '}
                          g/m<sup className="">2</sup>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-col">
                        <div className="flex gap-2">
                          <label className="text-neutral-500 flex flex-col text-sm font-semibold">
                            Sample 2
                          </label>
                          <input
                            readOnly
                            value={RabutMesin?.data?.sample_2}
                            type="text"
                            className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                          />
                          <div>gr</div>
                        </div>
                        <div>
                          ={' '}
                          <input
                            name="hasilsample2"
                            disabled
                            value={RabutMesin?.data?.hasil_sample_2}
                            type="text"
                            className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                          />{' '}
                          g/m<sup className="">2</sup>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-col">
                        <div className="flex gap-2">
                          <label className="text-neutral-500 flex flex-col text-sm font-semibold">
                            Sample 3
                          </label>
                          <input
                            readOnly
                            value={RabutMesin?.data?.sample_3}
                            type="text"
                            className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                          />
                          <div>gr</div>
                        </div>
                        <div>
                          ={' '}
                          <input
                            name="hasilsample3"
                            disabled
                            value={RabutMesin?.data?.hasil_sample_3}
                            type="text"
                            className="border-2 border-stroke w-[40%] rounded-sm col-span-2"
                          />{' '}
                          g/m<sup className="">2</sup>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end p-5">
                <div className="grid grid-cols-3 gap-2 items-end justify-end">
                  {/* {RabutMesin?.data?.status == 'incoming' ? (
                      <button
                        onClick={() => pendingRabut(RabutMesin?.data.id)}
                        className=" w-full h-10 rounded-sm bg-red-600 text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                      >
                        PENDING
                      </button>
                    ) : null} */}
                  {RabutMesin?.data?.status == 'incoming' ||
                  RabutMesin?.data?.status == 'pending' ? (
                    <button
                      disabled={isLoading}
                      onClick={() => doneRabut(RabutMesin?.data.id)}
                      className=" col-span-2 w-full h-10 rounded-sm bg-[#00B81D] text-white text-xs font-bold justify-center items-center px-10 py-2 hover:cursor-pointer"
                    >
                      CHECKSHEET SELESAI
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default CheckSheetHasilRabut;
