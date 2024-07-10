import React, { useState } from 'react';
import Modal from '../components/Modals/ModalDetailPopup';

import ModalMtcDate from '../components/Modals/ModalMtcDate';

import ModalMtcStockCheck from '../components/Modals/ModalMtcStockCheck';
import ModalMtcStockCheck2 from '../components/Modals/ModalMtcStockCheck2';

import Bars from '../components/Charts/TestChart';

import ModalMtcLightHeavy from '../components/Modals/ModalMtcLightHeavy';

import ModalPM2Schedule from '../components/Modals/ModalPM3Schedule';

import ModalStockCheck1 from '../components/Modals/ModalStockCheck1';

import ModalPM2Eksekutor from '../components/Modals/ModalPM2Eksekutor';

import ModalFilter from '../components/Modals/ModalFilter';
import ModalSPBService from '../components/Modals/ModalNewSPBService';
import ModalTambahUser from '../components/Modals/Master/User/ModalTambahUser';
import ModalPM3Schedule from '../components/Modals/ModalPM3Schedule';

const App = () => {
  const [showModal1, setShowModal1] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [showModal3, setShowModal3] = useState(false);
  const [showModal4, setShowModal4] = useState(false);
  const [showModal5, setShowModal5] = useState(false);
  const [showModal6, setShowModal6] = useState(false);
  const [showModal7, setShowModal7] = useState(false);
  const [showModal8, setShowModal8] = useState(false);
  const [showModal9, setShowModal9] = useState(false);
  const [showModal10, setShowModal10] = useState(false);
  const [showModal11, setShowModal11] = useState(false);
  const [showModal12, setShowModal12] = useState(false);
  const [showModal13, setShowModal13] = useState(false);
  const [showModal14, setShowModal14] = useState(false);
  const [showModal15, setShowModal15] = useState(false);
  const [showModal16, setShowModal16] = useState(false);
  const [showModal17, setShowModal17] = useState(false);
  const [showModal18, setShowModal18] = useState(false);
  const [showModal19, setShowModal19] = useState(false);

  const [showModal20, setShowModal20] = useState(false);
  const [showModal21, setShowModal21] = useState(false);
  const [showModal22, setShowModal22] = useState(false);
  const [showModal23, setShowModal23] = useState(false);
  const [showModal24, setShowModal24] = useState(false);
  const [showModal25, setShowModal25] = useState(false);
  const [showModal26, setShowModal26] = useState(false);
  const [showModal27, setShowModal27] = useState(false);

  const [showModal28, setShowModal28] = useState(false);
  const [showModal29, setShowModal29] = useState(false);

  const [showModal30, setShowModal30] = useState(false);

  const openModal1 = () => setShowModal1(true);
  const closeModal1 = () => setShowModal1(false);

  const openModal2 = () => setShowModal2(true);
  const closeModal2 = () => setShowModal2(false);

  const openModal3 = () => setShowModal3(true);
  const closeModal3 = () => setShowModal3(false);

  const openModal4 = () => setShowModal4(true);
  const closeModal4 = () => setShowModal4(false);

  const openModal5 = () => setShowModal5(true);
  const closeModal5 = () => setShowModal5(false);

  const openModal6 = () => setShowModal6(true);
  const closeModal6 = () => setShowModal6(false);

  const openModal7 = () => setShowModal7(true);
  const closeModal7 = () => setShowModal7(false);

  const openModal8 = () => setShowModal8(true);
  const closeModal8 = () => setShowModal8(false);

  const openModal9 = () => setShowModal9(true);
  const closeModal9 = () => setShowModal9(false);

  const openModal10 = () => setShowModal10(true);
  const closeModal10 = () => setShowModal10(false);

  const openModal11 = () => setShowModal11(true);
  const closeModal11 = () => setShowModal11(false);

  const openModal12 = () => setShowModal12(true);
  const closeModal12 = () => setShowModal12(false);

  const openModal13 = () => setShowModal13(true);
  const closeModal13 = () => setShowModal13(false);

  const openModal14 = () => setShowModal14(true);
  const closeModal14 = () => setShowModal14(false);

  const openModal15 = () => setShowModal15(true);
  const closeModal15 = () => setShowModal15(false);

  const openModal16 = () => setShowModal16(true);
  const closeModal16 = () => setShowModal16(false);

  const openModal17 = () => setShowModal17(true);
  const closeModal17 = () => setShowModal17(false);

  const openModal18 = () => setShowModal18(true);
  const closeModal18 = () => setShowModal18(false);

  const openModal19 = () => setShowModal19(true);
  const closeModal19 = () => setShowModal19(false);

  const openModal20 = () => setShowModal20(true);
  const closeModal20 = () => setShowModal20(false);

  const openModal21 = () => setShowModal21(true);
  const closeModal21 = () => setShowModal21(false);

  const openModal22 = () => setShowModal22(true);
  const closeModal22 = () => setShowModal22(false);

  const openModal23 = () => setShowModal23(true);
  const closeModal23 = () => setShowModal23(false);

  const openModal24 = () => setShowModal24(true);
  const closeModal24 = () => setShowModal24(false);

  const openModal25 = () => setShowModal25(true);
  const closeModal25 = () => setShowModal25(false);

  const openModal26 = () => setShowModal26(true);
  const closeModal26 = () => setShowModal26(false);

  const openModal27 = () => setShowModal27(true);
  const closeModal27 = () => setShowModal27(false);

  const openModal28 = () => setShowModal28(true);
  const closeModal28 = () => setShowModal28(false);

  const openModal29 = () => setShowModal29(true);
  const closeModal29 = () => setShowModal29(false);

  const openModal30 = () => setShowModal30(true);
  const closeModal30 = () => setShowModal30(false);

  // function detikKeJamMenitDetik(totalDetik: number): { jam: number; menit: number; sisaDetik2: number; formattedString: string } {
  //     // Calculate hours
  //     const jam = Math.floor(totalDetik / 3600);

  //     // Calculate remaining seconds after calculating hours
  //     const sisaDetik = totalDetik % 3600;

  //     const menitAwal = 5;

  //     const detikAwal = menitAwal / 60;

  //     // Calculate minutes
  //     const menit = Math.floor(sisaDetik / 60);

  //     // Calculate remaining seconds after calculating minutes
  //     const sisaDetik2 = sisaDetik % 60;

  //     let outputString = "";
  //     if (jam === 0) {
  //         if (menit === 0) {
  //             outputString = `${sisaDetik2} detik`;
  //         } else {
  //             outputString = `${menit} menit ${sisaDetik2} detik`;
  //         }
  //     } else {
  //         outputString = `${jam} jam ${menit} menit ${sisaDetik2} detik`;
  //     }
  //     return { jam, menit, sisaDetik2: sisaDetik2, formattedString: outputString }; // Add formattedString property
  // }
  // const totalDetik = 60; // Masukkan integer detik yang ingin dikonversi

  // const waktu = detikKeJamMenitDetik(totalDetik);

  // console.log(`Hasil konversi: ${waktu.jam} jam, ${waktu.menit} menit, ${waktu.sisaDetik2} detik`);
  function detikKeJamMenitDetik(totalDetik: number): {
    jam: number;
    menit: number;
    detik: number;
    formattedString: string;
    totalDetik: number;
  } {
    // Calculate hours
    const jam = Math.floor(totalDetik / 3600);

    // Calculate remaining seconds after calculating hours
    const sisaDetik = totalDetik % 3600;

    // Calculate minutes
    const menit = Math.floor(sisaDetik / 60);

    // Calculate remaining seconds after calculating minutes
    const sisaDetik2 = sisaDetik % 60;

    // Format and return the output
    let outputString = '';
    if (jam === 0) {
      if (menit === 0) {
        outputString = `${sisaDetik2} detik`;
      } else {
        outputString = `${menit} menit ${sisaDetik2} detik`;
      }
    } else {
      outputString = `${jam} jam ${menit} menit ${sisaDetik2} detik`;
    }
    return {
      jam,
      menit,
      detik: sisaDetik2,
      formattedString: outputString,
      totalDetik,
    };
  }

  const apiMinutes: number = 30; // Integer minutes from API

  const formattedTime = detikKeJamMenitDetik(apiMinutes * 60); // Convert minutes to seconds first

  if (formattedTime.totalDetik > 0) {
    // Check for non-zero time before displaying

    console.log(`API : ${apiMinutes}`);
    console.log(
      `Formatted time: ${formattedTime.jam} jam ${formattedTime.menit} menit ${formattedTime.detik} detik`,
    );
  }
  return (
    <div>
      <div className="container mx-auto">
        <button
          type="button"
          onClick={openModal1}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Open Modal 1.0
        </button>
        {showModal1 && (
          <Modal
            isOpen={showModal1}
            onClose={closeModal1}
            ticketCode={'CTR03591'}
            incDate={'28 May, 2024 06:37AM'}
            namaMesin={undefined}
            jenisKendala={undefined}
            kendala={undefined}
          >
            <p></p>
          </Modal>
        )}


      </div>
      <div className="flex gap-3 mt-10 px-10">

        <button
          type="button"
          onClick={openModal9}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Open Modal MTC Pick Date
        </button>
        {showModal9 && (
          <ModalMtcDate
            isOpen={showModal9}
            onClose={closeModal9}
            machineName={'GMC Printer 2'}
          >
            <p></p>
          </ModalMtcDate>
        )}





      </div>
      <div>
        <button
          type="button"
          onClick={openModal15}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Open Modal Check Stock
        </button>
        {showModal15 && (
          <ModalMtcStockCheck
            machineName={'CTR03591'}
            machineCode={'3.2'}
            isOpen={showModal15}
            onClose={closeModal15}
          >
            <p></p>
          </ModalMtcStockCheck>
        )}
        <button
          type="button"
          onClick={openModal16}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Open Modal Check Stock 2
        </button>
        {showModal16 && (
          <ModalMtcStockCheck2
            machineName={'CTR03591'}
            machineCode={'3.2'}
            isOpen={showModal16}
            onClose={closeModal16}
          >
            <p></p>
          </ModalMtcStockCheck2>
        )}



      </div>
      <div className="pt-4 gap-3">
        <button
          type="button"
          onClick={openModal20}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Open Modal MTC Light Heavy
        </button>
        {showModal20 && (
          <ModalMtcLightHeavy
            isOpen={showModal20}
            onClose={closeModal20}
            title={undefined}
          >
            <div className="pt-5">
              <button className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                LIGHT MAINTENANCE
              </button>
            </div>
            <div className="pt-2">
              <button className="w-full h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                HEAVY MAINTENANCE
              </button>
            </div>
          </ModalMtcLightHeavy>
        )}

        <button
          type="button"
          onClick={openModal22}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Open Modal PM 2 Inspection
        </button>
        {showModal22 && (
          <ModalPM3Schedule
            isOpen={showModal22}
            onClose={closeModal22}
            machineName={'R700'} children={undefined}          >
            
          </ModalPM3Schedule>
        )}

        <button
          type="button"
          onClick={openModal24}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Open StockCHeck
        </button>
        {showModal24 && (
          <ModalStockCheck1
            isOpen={showModal24}
            onClose={closeModal24}
            machineName={'R700'}
            kendala={'3.X.Y - Settingan tidak pas'}
            tgl={'20 MEI 2024'}
            jam={'14:00'}
            namaPemeriksa={'Acep Piere'}
            no={2}
            onFinish={undefined}
            idTiket={undefined}
            idProses={undefined}
            kodeLkh={undefined}
            namaMesin={undefined}
            skor_mtc={undefined} children={undefined} jenis_perbaikan={undefined}          >
            
          </ModalStockCheck1>
        )}


      </div>
      <div className="pt-4">
        <button
          type="button"
          onClick={openModal27}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Open
        </button>
        {showModal27 && (
          <ModalPM2Eksekutor
            isOpen={showModal27}
            onClose={closeModal27}
            machineName={'R700'}
          >
            <p></p>
          </ModalPM2Eksekutor>
        )}

        <button
          type="button"
          onClick={openModal29}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Open Filter
        </button>
        {showModal29 && (
          <ModalFilter isOpen={showModal29} onClose={closeModal29}>
            <p></p>
          </ModalFilter>
        )}
        <button
          type="button"
          onClick={openModal30}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Open New SPB Service
        </button>
        {showModal30 && (
          <ModalSPBService
            isOpen={showModal30}
            onClose={closeModal30}
            noSPB={'MT-0001'}
            tglSpb={'20 MEI 2024'}
            data={undefined}
            onFinish={undefined}
            idProses={undefined} children={undefined} sumber={undefined}          >
          
          </ModalSPBService>
        )}
      </div>
      <div className="pt-20"></div>
    </div>
  );
};

export default App;
