import React, { useState } from 'react';
import Modal from '../components/Modals/ModalDetailPopup';

import ModalMtcDate from '../components/Modals/ModalMtcDate';

import ModalMtcStockCheck from '../components/Modals/ModalMtcStockCheck';
import ModalMtcStockCheck2 from '../components/Modals/ModalMtcStockCheck2';

const App = () => {
  const [showModal1, setShowModal1] = useState(false);

  const [showModal9, setShowModal9] = useState(false);

  const [showModal15, setShowModal15] = useState(false);
  const [showModal16, setShowModal16] = useState(false);


  const [showModal20, setShowModal20] = useState(false);

  const [showModal22, setShowModal22] = useState(false);

  const [showModal27, setShowModal27] = useState(false);



  const openModal1 = () => setShowModal1(true);
  const closeModal1 = () => setShowModal1(false);



  const openModal9 = () => setShowModal9(true);
  const closeModal9 = () => setShowModal9(false);



  const openModal15 = () => setShowModal15(true);
  const closeModal15 = () => setShowModal15(false);

  const openModal16 = () => setShowModal16(true);
  const closeModal16 = () => setShowModal16(false);



  const openModal22 = () => setShowModal22(true);
  const closeModal22 = () => setShowModal22(false);



  const openModal27 = () => setShowModal27(true);
  const closeModal27 = () => setShowModal27(false);

  async function getData() {
    const res = await fetch('https://fakestoreapi.com/products')


    if (!res.ok) {

      throw new Error('Failed to fetch data')
    }

    return res.json()
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
      <div className="pt-4">
        <button
          type="button"
          onClick={openModal27}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Open
        </button>

      </div>
      <div className="pt-20"></div>
    </div>
  );
};

export default App;
