import React, { useState } from 'react';
import Modal from '../components/Modals/ModalDetailPopup';
import ModalPopupReq from '../components/Modals/ModalDetailPopupReq';
import ModalPopupMon from '../components/Modals/ModalDetailPopupMon';
import Modal2 from '../components/Modals/ModalDetailPopup2';
import ModalPopupOut from '../components/Modals/ModalDetailPopupOut';
import ModalPopupOnProg from '../components/Modals/ModalDetailPopupOnprog';
import ModalMtc from '../components/Modals/ModalMtcType';
import ModalMtcDate from '../components/Modals/ModalMtcDate';
import ModalPopupOnProg2 from '../components/Modals/ModalDetailPopupOnprog2';
import ModalPopupBgn from '../components/Modals/ModalPopupBgn';
import ModalPopupReq2 from '../components/Modals/ModalPopupReq';
import ModalPopupRev from '../components/Modals/ModalMtcRev';


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
    return (
        <div>
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
                <button type="button"
                    onClick={openModal5}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Modal 5
                </button>
                {showModal5 && (
                    <Modal2
                        title="Maintenance Detail"
                        isOpen={showModal5}
                        onClose={closeModal5}
                        ticketCode={'CTR03591'}
                        prepName={'GMC Ink 229'}
                        incDate={'28 May, 2024 06:37AM'}>
                        <p></p>
                    </Modal2>
                )}
                <button type="button"
                    onClick={openModal6}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Modal 6
                </button>
                {showModal6 && (
                    <ModalPopupOut
                        title="Incomming Maintenance Ticket"
                        isOpen={showModal6}
                        onClose={closeModal6}
                        ticketCode={'CTR03591'}
                        machineName={'GMC Printer 2'}
                        incDate={'05 May, 2024 06:37AM'}
                        machineCode={'3.2'} children={''}
                        mtcDate={'4 April, 2024 to 12 April, 2024'}
                        outDate={'12 April, 2024'}
                    >

                    </ModalPopupOut>
                )}

                <button type="button"
                    onClick={openModal7}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Modal 7
                </button>
                {showModal7 && (
                    <ModalPopupOnProg
                        title="Maintenance"
                        isOpen={showModal7}
                        onClose={closeModal7}
                        ticketCode={'CTR03591'}
                        machineName={'GMC Printer 2'}
                        incDate={'05 May, 2024 06:37AM'}
                        machineCode={'3.2'} children={''}
                        mtcSchedule={'12 April, 2024 to 24 April, 2024'}
                        status={"Maintenance On Progress"}>

                    </ModalPopupOnProg>
                )}
            </div>
            <div className='flex gap-3 mt-10 px-10'>

                <button type="button"
                    onClick={openModal8}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Modal MTC Type
                </button>
                {showModal8 && (
                    <ModalMtc
                        title="Select Maintenance Type"
                        isOpen={showModal8}
                        onClose={closeModal8}
                        machineName={'GMC Printer 2'}                    >
                        <p></p>
                    </ModalMtc>
                )}
                <button type="button"
                    onClick={openModal9}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Modal MTC Pick Date
                </button>
                {showModal9 && (
                    <ModalMtcDate
                        title="Request Maintenance Schedule"
                        isOpen={showModal9}
                        onClose={closeModal9}
                        machineName={'GMC Printer 2'}                    >
                        <p></p>
                    </ModalMtcDate>
                )}
                <button type="button"
                    onClick={openModal10}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Modal On Prog
                </button>
                {showModal10 && (
                    <ModalPopupOnProg2
                        title="Maintenance"
                        isOpen={showModal10}
                        onClose={closeModal10}
                        ticketCode={'CTR03591'}
                        machineName={'GMC Printer 2'}
                        incDate={'05 May, 2024 06:37AM'}
                        machineCode={'3.2'} children={''}
                        mtcSchedule={'12 April, 2024 to 24 April, 2024'}
                        status={"Maintenance On Progress"}>

                    </ModalPopupOnProg2>
                )}
                <button type="button"
                    onClick={openModal11}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Modal MTC Type 2
                </button>
                {showModal11 && (
                    <ModalMtc
                        title="Select Maintenance Type"
                        isOpen={showModal11}
                        onClose={closeModal11}
                        machineName={'GMC Printer 2'}                    >
                        <p></p>
                    </ModalMtc>
                )}
                <button type="button"
                    onClick={openModal12}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Modal BGN
                </button>
                {showModal12 && (
                    <ModalPopupBgn
                        title="Maintenance"
                        isOpen={showModal12}
                        onClose={closeModal12}
                        ticketCode={'CTR03591'}
                        machineName={'GMC Printer 2'}
                        incDate={'05 May, 2024 06:37AM'}
                        machineCode={'3.2'} children={''}
                        mtcSchedule={'12 April, 2024 to 24 April, 2024'}

                    >
                    </ModalPopupBgn>
                )}
                <button type="button"
                    onClick={openModal13}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Modal Req 2
                </button>
                {showModal13 && (
                    <ModalPopupReq2
                        title="Maintenance Request"
                        isOpen={showModal13}
                        onClose={closeModal13}
                        ticketCode={'CTR03591'}
                        machineName={'GMC Printer 2'}
                        incDate={'05 May, 2024 06:37AM'}
                        machineCode={'3.2'} children={''} reqSchedule={'12 April, 2024 to 24 April, 2024'}
                    >
                    </ModalPopupReq2>
                )}
                <button type="button"
                    onClick={openModal14}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Modal Rev
                </button>
                {showModal14 && (
                    <ModalPopupRev
                        title="Maintenance Review"
                        isOpen={showModal14}
                        onClose={closeModal14}
                        ticketCode={'CTR03591'}
                        machineName={'GMC Printer 2'}
                        incDate={'05 May, 2024 06:37AM'}
                        machineCode={'3.2'} children={''} mtcDate={'12 April, 2024 to 24 April, 2024'}
                    >
                    </ModalPopupRev>
                )}
            </div>
        </div >
    );
};

export default App;