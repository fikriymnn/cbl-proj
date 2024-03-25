import React, { useState } from 'react';
import Modal from '../components/Modals/ModalDetailPopup';
import ModalPopupReq from '../components/Modals/ModalDetailPopupReq';
import ModalPopupMon from '../components/Modals/ModalDetailPopupMon';


const App = () => {
    const [showModal1, setShowModal1] = useState(false);
    const [showModal2, setShowModal2] = useState(false);
    const [showModal3, setShowModal3] = useState(false);
    const [showModal4, setShowModal4] = useState(false);

    const openModal1 = () => setShowModal1(true);
    const closeModal1 = () => setShowModal1(false);

    const openModal2 = () => setShowModal2(true);
    const closeModal2 = () => setShowModal2(false);

    const openModal3 = () => setShowModal3(true);
    const closeModal3 = () => setShowModal3(false);

    const openModal4 = () => setShowModal4(true);
    const closeModal4 = () => setShowModal4(false);
    return (
        <div className="container mx-auto">
            <button type="button"
                onClick={openModal1}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Open Modal 1
            </button>
            {showModal1 && (
                <Modal
                    title="Incoming Maintenance Ticket"
                    isOpen={showModal1}
                    onClose={closeModal1}
                    ticketCode={'CTR03591'}
                    prepName={'GMC Ink 229'}
                    incDate={'28 May, 2024 06:37AM'}
                    prepCode={'3.2'}>
                    <p></p>
                </Modal>
            )}
            <button type="button"
                onClick={openModal2}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Open Modal 2
            </button>
            {showModal2 && (
                <ModalPopupReq
                    title="Maintenance"
                    isOpen={showModal2}
                    onClose={closeModal2}
                    ticketCode={'CTR03591'}
                    machineName={'GMC Printer 2'}
                    incDate={'05 May, 2024 06:37AM'}
                    machineCode={'3.2'} children={''}
                    mtcSchedule={'12 April, 2024 to 24 April, 2024'}
                    status={"Maintenance Schedule Requested "}>

                </ModalPopupReq>
            )}
            <button type="button"
                onClick={openModal3}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Open Modal 3
            </button>
            {showModal3 && (
                <ModalPopupReq
                    title="Maintenance"
                    isOpen={showModal3}
                    onClose={closeModal3}
                    ticketCode={'CTR03591'}
                    machineName={'GMC Printer 2'}
                    incDate={'05 May, 2024 06:37AM'}
                    machineCode={'3.2'} children={''}
                    mtcSchedule={'12 April, 2024 to 24 April, 2024'}
                    status={"Waiting to be verified by QC "}>

                </ModalPopupReq>
            )}
            <button type="button"
                onClick={openModal4}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Open Modal 4
            </button>
            {showModal4 && (
                <ModalPopupMon
                    title="Maintenance"
                    isOpen={showModal4}
                    onClose={closeModal4}
                    ticketCode={'CTR03591'}
                    machineName={'GMC Printer 2'}
                    incDate={'05 May, 2024 06:37AM'}
                    machineCode={'3.2'} children={''}
                    mtcSchedule={'12 April, 2024 to 24 April, 2024'}
                    status={"Maintenance verified, Monitoring after maintenance for 3 months."}>

                </ModalPopupMon>
            )}
        </div>

    );
};

export default App;