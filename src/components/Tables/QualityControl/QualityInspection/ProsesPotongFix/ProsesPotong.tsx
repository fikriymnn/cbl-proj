import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import convertTimeStampToDate from '../../../../../utils/converDateTime';

function ProsesPotongMesin() {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [pondMesin, setPondMesin] = useState<any>();

  useEffect(() => {
    getPondMesin();
  }, []);

  async function getPondMesin() {
    const url = `${import.meta.env.VITE_API_LINK}/qc/cs/inspeksiPotong`;
    try {
      const res = await axios.get(url, {
        params: { status: 'incoming' },
        withCredentials: true,
      });
      setPondMesin(res.data);
    } catch (error: any) {
      console.log(error);
    }
  }

  const colStyle = 'text-neutral-500 text-sm font-semibold px-3 py-4';
  const cellStyle = 'text-neutral-700 text-sm px-3 py-4';

  return (
    <main className="overflow-x-auto">
      <div className="min-w-[900px] bg-white rounded-xl shadow-sm ">
        {/* Header */}
        <div
          className="grid border-b-8 border-[#D8EAFF] bg-gray-50 rounded-t-xl"
          style={{
            gridTemplateColumns:
              '80px 110px 60px 80px 160px 170px 200px 130px 90px',
          }}
        >
          <div className={colStyle}>Mesin</div>
          <div className={colStyle}>No. JO</div>
          <div className={colStyle}>Shift</div>
          <div className={colStyle}>Bagian</div>
          <div className={colStyle}>Customer</div>
          <div className={colStyle}>Tanggal</div>
          <div className={colStyle}>Item</div>
          <div className={colStyle + ' uppercase'}>Jenis Potong</div>
          <div className={colStyle}></div>
        </div>

        {/* Rows */}
        {pondMesin?.data?.map((data: any, i: number) => {
          const tglTicket = convertTimeStampToDate(data.createdAt);
          const isPotongBahan = data.jenis_potong === 'potong bahan';

          return (
            <div
              key={i}
              className="grid border-b-8 border-[#D8EAFF] items-center hover:bg-blue-50 transition-colors"
              style={{
                gridTemplateColumns:
                  '80px 110px 60px 80px 160px 170px 200px 130px 90px',
              }}
            >
              {/* Mesin with left color bar */}
              <div className="flex items-center h-full">
                <div
                  className={`w-1.5 self-stretch flex-shrink-0 ${
                    isPotongBahan ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                />
                <span className={cellStyle + ' flex-1'}>{data.mesin}</span>
              </div>

              <div className={cellStyle + ' font-medium'}>{data.no_jo}</div>
              <div className={cellStyle}>{data.shift}</div>
              <div className={cellStyle}>{data.bagian ?? '-'}</div>
              <div className={cellStyle}>{data.customer}</div>
              <div className={cellStyle + ' text-xs'}>{tglTicket}</div>
              <div className={cellStyle + ' text-xs line-clamp-2'}>
                {data.item}
              </div>

              {/* Jenis Potong badge */}
              <div className="px-3 py-4">
                <span
                  className={`inline-block text-xs font-semibold uppercase px-2 py-1 rounded-full ${
                    isPotongBahan
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {data.jenis_potong}
                </span>
              </div>

              {/* Action button */}
              <div className="px-3 py-4 flex justify-end">
                {(isPotongBahan || data.jenis_potong === 'potong jadi') && (
                  <Link
                    to={`/qc/inspection/potong/${
                      isPotongBahan ? 'bahan' : 'jadi'
                    }/${data.id}`}
                  >
                    <button className="uppercase px-4 py-1.5 rounded text-white text-xs font-bold bg-blue-600 hover:bg-blue-500 transition-colors">
                      PILIH
                    </button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}

        {(!pondMesin?.data || pondMesin.data.length === 0) && (
          <div className="text-center text-gray-400 py-10 text-sm">
            Tidak ada data
          </div>
        )}
      </div>
    </main>
  );
}

export default ProsesPotongMesin;
