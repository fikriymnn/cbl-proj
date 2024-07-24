import React from 'react';
import CardDataStats from '../../components/CardDataStats';

import DefaultLayout from '../../layout/DefaultLayout';
import Production from '../../images/icon/production.svg';
import Maintenance from '../../images/icon/maintenance.svg';
import TableOne from '../../components/Tables/Maintenance/TableIncomingMaintenance';
import HorizontalBars from '../../components/Charts/HorizontalBars';
import BarChart from '../UiElements/BarChart';
import axios from 'axios';

const ECommerce: React.FC = () => {
  async function submitPointPm1() {
    const url = `${import.meta.env.VITE_API_LINK}/ticket`;

    try {
      const res = await axios.post(url, {
        kode_lkh: '3.1.1',
        id_jo: 75,
        id_kendala: 261,
        no_jo: 'JO-24-00015',
        nama_produk: 'IB JAGO BAR 12X8G P0006178',
        no_io: '4302-2A',
        no_so: 'SO-00019/CBL/0224',
        nama_customer: 'PT.CERES',
        qty: 108000,
        qty_druk: 82620,
        spek: '3.00/0.00 + WB',
        proses: 'Cetak 1',
        bagian: 'Cetak',
        mesin: 'ITOH',
        operator: 'Daffa',
        tgl: '2024-04-17T00:08:16.000Z',
        jenis_kendala: 'mesin',
        nama_kendala: 'perbaikan hisapan angin lemah',
      });

      alert(res.data.msg);
    } catch (error: any) {
      console.log(error);
      //alert(error.data.msg);
    }
  }
  return (
    <DefaultLayout>
      <p className="font-semibold md:text-[28px] text-[20px] text-primary mb-[18px] ">
        Overview Dashboard
      </p>
      {/* <button onClick={submitPointPm1}>Tesssss</button> */}
      <div className="flex gap-3 flex-wrap">
        <CardDataStats title="Total views" total="$3.456K" rate="0.43%" levelUp>
          <div className="flex gap-3">
            <img src={Production} alt="Logo" />

            <p className="text-[14px] text-[#0065DE]">Production</p>
          </div>
        </CardDataStats>
        <CardDataStats title="Total Profit" total="$45,2K" rate="4.35%" levelUp>
          <div className="flex gap-3">
            <img src={Maintenance} alt="Logo" />

            <p className="text-[14px] text-[#0065DE]">Maintenance</p>
          </div>
        </CardDataStats>
      </div>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-7">
        <div className="w-full p-4 bg-white my-[26px] rounded-[10px] flex flex-col">
          <div className="flex items-start gap-3">
            <img src={Production} alt="Logo" className="w-5" />
            <p className="text-primary text-sm">Production Overview</p>
          </div>
          <div className="flex justify-center items-center p-5">
            <BarChart />
          </div>
        </div>
        <div className="w-full p-4 bg-white my-[26px] rounded-[10px] flex flex-col">
          <div className="flex items-start gap-3">
            <img src={Production} alt="Logo" className="w-5" />
            <p className="text-primary text-sm">Production Overview</p>
          </div>
          <div className="w-full h-full p-5">
            <BarChart />
          </div>
        </div>
      </div>

      <TableOne />
    </DefaultLayout>
  );
};

export default ECommerce;
