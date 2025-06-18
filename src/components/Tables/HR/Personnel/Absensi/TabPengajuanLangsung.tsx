import * as React from 'react';
// import SwipeableViews from 'react-swipeable-views';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import convertTimeStampToDate from '../../../../../utils/convertDate';
import Loading from '../../../../Loading';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
      className=""
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export default function TabPengajuanLangsung({ data }: { data: any }) {
  const theme = createTheme({
    palette: {
      primary: {
        light: '#ffffff',
        main: '#ffffff',
        dark: '#002884',
        contrastText: '#fff',
      },
      secondary: {
        light: '#0065DE',
        main: '#f44336',
        dark: '#ba000d',
        contrastText: '#000',
      },
    },
  });
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index);
  };
  const commonStyles = {
    bgcolor: 'background.paper',
    borderColor: 'text.primary',
    width: 'w-full',
    borderTopRightRadius: '12px',
    borderTopLeftRadius: '12px',
  };
  function convertDatetimeToDate(datetime: any) {
    const dateObject = new Date(datetime);
    const day = dateObject.getDate().toString().padStart(2, '0'); // Ensure two-digit day
    const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Adjust for zero-based month
    const year = dateObject.getFullYear();
    const hours = dateObject.getHours().toString().padStart(2, '0');
    const minutes = dateObject.getMinutes().toString().padStart(2, '0');

    return `${year}/${month}/${day} `; // Example format (YYYY-MM-DD)
  }

  const tanggal = convertDatetimeToDate(new Date());
  useEffect(() => {
    getMe();
    getCutiKhusus();
    handleStartDateChange();
  }, []);

  const [idPengaju, setIdPengaju] = useState<any>();

  async function getMe() {
    const url = `${import.meta.env.VITE_API_LINK}/me`;
    try {
      const res = await axios.get(url, {
        withCredentials: true,
      });
      setIdPengaju(res.data.id_karyawan);
    } catch (error: any) {
      console.log(error.data.msg);
    }
  }
  const [alasanIzin, setAlasanIzin] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);
  async function postIzin(tglAbsen: any, id_KKaryawan: any) {
    if (alasanIzin == null) {
      alert('Alasan Izin Belum Diisi');
      return;
    }
    if (
      window.confirm(
        `Apakah Anda yakin akan mengajukan Izin untuk karyawan ${data.name}`,
      )
    ) {
      const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanIzin`;
      try {
        setIsLoading(true);
        const res = await axios.post(
          url,
          {
            id_karyawan: id_KKaryawan,
            id_pengaju: idPengaju,
            dari: tglAbsen,
            sampai: tglAbsen,
            jumlah_hari: 1,
            alasan_izin: alasanIzin,
          },
          {
            withCredentials: true,
          },
        );
        setIsLoading(false);
        window.location.reload();
      } catch (error: any) {
        setIsLoading(false);
        console.log(error);
      }
    }
  }

  async function postMangkir(tglAbsen: any, id_KKaryawan: any) {
    if (
      window.confirm(
        `Apakah Anda yakin akan mengajukan Mangkir untuk karyawan ${data.name}`,
      )
    ) {
      const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanMangkir`;
      try {
        setIsLoading(true);
        const res = await axios.post(
          url,
          {
            id_karyawan: id_KKaryawan,
            id_pengaju: idPengaju,
            tanggal: tglAbsen,
          },
          {
            withCredentials: true,
          },
        );
        setIsLoading(false);
        window.location.reload();
      } catch (error: any) {
        setIsLoading(false);
        console.log(error);
      }
    }
  }
  const [tglDari, setTglDari] = useState<any>(data.tgl_absen);
  const [alasanCuti, setAlasanCuti] = useState<any>();

  const handleStartDateChange = () => {
    setTglDari(new Date(data.tgl_absen));
  };

  const handleChangePointCuti = (selected: any) => {
    const { value } = selected;
    const filteredData = cutiKhusus.find(
      (item: any) => item.id == value,
      // item.id.includes(parseInt(value));
    );
    console.log(filteredData?.id);
    setDaysDifference(filteredData?.jumlah_hari);
    setAlasanCuti(filteredData?.nama_cuti);
  };

  const [daysDifference, setDaysDifference] = useState<any>();
  const [cutiKhusus, setCutiKhusus] = useState<any>();
  const [options2, setOptions2] = useState([]);

  async function getCutiKhusus() {
    const url = `${import.meta.env.VITE_API_LINK}/master/hr/cutiKhusus`;
    try {
      setIsLoading(true);
      const res = await axios.get(
        url,

        {
          withCredentials: true,
        },
      );

      setIsLoading(false);
      setCutiKhusus(res.data.data);
      setOptions2(
        res.data.data.map((item: any) => ({
          value: item.id,
          label: item.nama_cuti + ' - ' + item.jumlah_hari + ' Hari ',
        })),
      );
      console.log(res.data);
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }

  async function postCutiKhusus(tglAbsen: any, id_KKaryawan: any) {
    const calculateEndDate = () => {
      if (tglDari && daysDifference > 0) {
        const newDate = new Date(tglDari.getTime());
        newDate.setDate(newDate.getDate() + daysDifference - 1);
        return newDate.toISOString().substring(0, 10); // Format as YYYY-MM-DD
      }
      return ''; // Return empty string if no date or daysOff are available
    };
    const endDate = calculateEndDate();

    const url = `${import.meta.env.VITE_API_LINK}/hr/pengajuanCuti`;
    try {
      setIsLoading(true);
      //console.log(id_KKaryawan, idPengaju, tglAbsen, endDate, daysDifference, alasanCuti, sisaCuti)
      const res = await axios.post(
        url,
        {
          id_karyawan: id_KKaryawan,
          id_pengaju: idPengaju,
          tipe_cuti: 'khusus',
          dari: tglAbsen,
          sampai: endDate,
          jumlah_hari: daysDifference,
          alasan_cuti: alasanCuti,
          sisa_cuti: '',
        },
        {
          withCredentials: true,
        },
      );
      setIsLoading(false);
      window.location.reload();
    } catch (error: any) {
      setIsLoading(false);
      console.log(error);
    }
  }
  return (
    <>
      <Box
        sx={{
          ...commonStyles,
          '& .MuiPaper-root': {
            borderTopRightRadius: '0px',
            borderTopLeftRadius: '0px',
            background: '#D8EAFF',
            boxShadow: 0,
          },
          '& .MuiBox-root': {
            borderTopRightRadius: '0px',
            borderTopLeftRadius: '0px',
            background: '#D8EAFF',
            boxShadow: 0,
          },
          '& .MuiTabs-root': {
            borderTopRightRadius: '0px',
            borderTopLeftRadius: '0px',
          },
          '& .MuiTabs-flexcontainer': {
            borderTopRightRadius: '0px',
            borderTopLeftRadius: '0px',
          },
          '& fieldset': {
            borderRadius: '0px',
          },
        }}
      >
        <AppBar position="static" className="">
          <ThemeProvider theme={theme}>
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="primary"
              TabIndicatorProps={{
                style: {
                  backgroundColor: '#00499F',
                  height: '4px',
                },
              }}
              textColor="inherit"
              variant="standard"
              aria-label="full width tabs example"
              className="bg-white text-[#00499F] font-semibold mb-2 flex w-full"
            >
              <Tab label="Izin" {...a11yProps(0)} />
              <Tab label="Cuti Khusus" {...a11yProps(1)} />
              <Tab label="Mangkir" {...a11yProps(2)} />
            </Tabs>
          </ThemeProvider>
        </AppBar>
        <TabPanel value={value} index={0} dir={theme.direction}>
          <main className="overflow-x-scroll px-2 py-2">
            {isLoading && <Loading />}
            <div className=" bg-white">
              <div className="grid grid-cols-2 gap-5  px-7 py-4 ">
                <div className="flex flex-col gap-1">
                  <label className=" text-[#6c6b6b] text-sm font-semibold">
                    Nama
                  </label>
                  <label className=" text-[#6c6b6b] text-sm">{data.name}</label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5 px-7 py-4">
                <div className="flex flex-col gap-3">
                  <label className=" text-[#6c6b6b] text-sm font-semibold">
                    Tanggal
                  </label>
                  <label className=" text-[#6c6b6b] text-sm ">
                    {convertTimeStampToDate(data.tgl_absen)}
                  </label>
                </div>

                <div className="flex w-full flex-col">
                  <label className="text-[#6c6b6b] text-sm font-semibold">
                    Alasan Izin
                  </label>
                  <div className="flex w-full h-full">
                    <textarea
                      onChange={(e) => {
                        setAlasanIzin(e.target.value);
                      }}
                      name="alasan_cuti"
                      className=" peer h-full min-h-[100px] w-full resize-none border-2 border-stroke rounded-md px-2"
                    />
                  </div>
                </div>
              </div>
              <div className="flex w-full justify-end items-end px-7 py-4">
                <button
                  onClick={() => postIzin(data.tgl_absen, data.userid)}
                  disabled={isLoading}
                  className="flex px-4 py-1 justify-center items-center bg-blue-600 text-white font-semibold rounded-md"
                >
                  AJUKAN
                </button>
              </div>
            </div>
          </main>
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          <main className="overflow-x-scroll min-h-[400px] px-2 py-2">
            {isLoading && <Loading />}
            <div className=" bg-white">
              <div className="grid grid-cols-2 gap-5  px-7 py-4 ">
                <div className="flex flex-col gap-1">
                  <label className=" text-[#6c6b6b] text-sm font-semibold">
                    Nama
                  </label>
                  <label className=" text-[#6c6b6b] text-sm">{data.name}</label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5 px-7 py-4">
                <div className="flex flex-col gap-3">
                  <label className=" text-[#6c6b6b] text-sm font-semibold">
                    Tanggal
                  </label>
                  <label className=" text-[#6c6b6b] text-sm ">
                    {convertTimeStampToDate(data.tgl_absen)}
                  </label>
                </div>

                <div className="flex w-full flex-col px-7 py-4">
                  <div>
                    <label className=" text-[#6c6b6b] text-sm font-semibold">
                      Pilih Tipe Cuti
                    </label>
                    <Select
                      placeholder="Cari..."
                      options={options2}
                      onChange={(selectedId: any) => {
                        handleChangePointCuti(selectedId);
                      }}
                      className={`relative z-50 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input 'text-black dark:text-white' 
                  }`}
                    ></Select>
                  </div>
                  <button
                    onClick={() => postCutiKhusus(data.tgl_absen, data.userid)}
                    disabled={isLoading}
                    className="flex px-4 py-1 justify-center items-center bg-blue-600 text-white font-semibold rounded-md"
                  >
                    AJUKAN
                  </button>
                </div>
              </div>
            </div>
          </main>
        </TabPanel>
        <TabPanel value={value} index={2} dir={theme.direction}>
          <main className="overflow-x-scroll px-2 py-2">
            {isLoading && <Loading />}
            <div className=" bg-white">
              <div className="grid grid-cols-2 gap-5  px-7 py-4 ">
                <div className="flex flex-col gap-1">
                  <label className=" text-[#6c6b6b] text-sm font-semibold">
                    Nama
                  </label>
                  <label className=" text-[#6c6b6b] text-sm">{data.name}</label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5 px-7 py-4">
                <div className="flex flex-col gap-3">
                  <label className=" text-[#6c6b6b] text-sm font-semibold">
                    Tanggal
                  </label>
                  <label className=" text-[#6c6b6b] text-sm ">
                    {convertTimeStampToDate(data.tgl_absen)}
                  </label>
                </div>
              </div>
              <div className="flex w-full justify-end items-end px-7 py-4">
                <button
                  onClick={() => postMangkir(data.tgl_absen, data.userid)}
                  disabled={isLoading}
                  className="flex px-4 py-1 justify-center items-center bg-blue-600 text-white font-semibold rounded-md"
                >
                  AJUKAN
                </button>
              </div>
            </div>
          </main>
        </TabPanel>
      </Box>
    </>
  );
}
