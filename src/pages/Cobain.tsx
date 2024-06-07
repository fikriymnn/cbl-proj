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
import ModalMtcStockCheck from '../components/Modals/ModalMtcStockCheck';
import ModalMtcStockCheck2 from '../components/Modals/ModalMtcStockCheck2';
import ModalPurchasing from '../components/Modals/ModalPurchasing';
import ModalReplaced from '../components/Modals/ModalReplaced';
import Bars from '../components/Charts/TestChart';
import ModalMtc6type from '../components/Modals/Modal6type';
import ModalMtcLightHeavy from '../components/Modals/ModalMtcLightHeavy';
import ModalNewVendor from '../components/Modals/ModalNewVendor';
import ModalPM2Schedule from '../components/Modals/ModalPM2Schedule';
import ModalResponse from '../components/Modals/ModalResponse';
import ModalStockCheck1 from '../components/Modals/ModalStockCheck1';
import ModalStockCheckRusak from '../components/Modals/ModalStockCheckPilihRusak';
import ModalStockCheckPengganti from '../components/Modals/ModalStockCheckPilihPengganti';
import ModalPM2Eksekutor from '../components/Modals/ModalPM2Eksekutor';
import ModalPM26type from '../components/Modals/ModalPM26Type';
import ModalFilter from '../components/Modals/ModalFilter';
import ModalSPBService from '../components/Modals/ModalNewSPBService';


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
            <div>
                <button type="button"
                    onClick={openModal15}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Modal Check Stock
                </button>
                {showModal15 && (
                    <ModalMtcStockCheck
                        machineName={'CTR03591'}
                        machineCode={'3.2'}
                        isOpen={showModal15}
                        onClose={closeModal15} >
                        <p></p>

                    </ModalMtcStockCheck>
                )}
                <button type="button"
                    onClick={openModal16}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Modal Check Stock 2
                </button>
                {showModal16 && (
                    <ModalMtcStockCheck2
                        machineName={'CTR03591'}
                        machineCode={'3.2'}
                        isOpen={showModal16}
                        onClose={closeModal16} >
                        <p>

                        </p>
                    </ModalMtcStockCheck2>

                )}
                <button type="button"
                    onClick={openModal17}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Modal Purchasing
                </button>
                {showModal17 && (
                    <ModalPurchasing

                        isOpen={showModal17}
                        onClose={closeModal17} />

                )}
                <button type="button"
                    onClick={openModal18}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Modal Replaced
                </button>
                {showModal18 && (
                    <ModalReplaced

                        isOpen={showModal18}
                        onClose={closeModal18}
                    >
                        <p></p>
                    </ModalReplaced>
                )}
                <button type="button"
                    onClick={openModal19}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Modal 6 Type
                </button>
                {showModal19 && (
                    <ModalMtc6type

                        isOpen={showModal19}
                        onClose={closeModal19}
                        ticketCode={'EXC0008'}
                    >
                        <p></p>
                    </ModalMtc6type>
                )}
            </div>
            <div className='pt-4 gap-3' >
                <button type="button"
                    onClick={openModal20}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Modal MTC Light Heavy
                </button>
                {showModal20 && (
                    <ModalMtcLightHeavy

                        isOpen={showModal20}
                        onClose={closeModal20} title={undefined}                                           >
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
                <button type="button"
                    onClick={openModal21}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Modal New Vendro
                </button>
                {showModal21 && (
                    <ModalNewVendor

                        isOpen={showModal21}
                        onClose={closeModal21}

                    >
                        <div className="flex pt-[300PX] w-full h-full justify-end justify-items-end ">
                            <button className=" w-96 h-12 text-center text-white text-xs font-bold bg-blue-700 rounded-md">
                                SEND REQUEST
                            </button>
                        </div>
                    </ModalNewVendor>
                )}
                <button type="button"
                    onClick={openModal22}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Modal PM 2 Inspection
                </button>
                {showModal22 && (
                    <ModalPM2Schedule

                        isOpen={showModal22}
                        onClose={closeModal22}
                        machineName={'R700'}                    >
                        <p></p>
                    </ModalPM2Schedule>
                )}
                <button type="button"
                    onClick={openModal23}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Respon
                </button>
                {showModal23 && (
                    <ModalResponse

                        isOpen={showModal23}
                        onClose={closeModal23}
                        machineName={'R700'}
                        ticketCode={'undefined'}
                        incDate={'undefined'}                    >
                        <p></p>
                    </ModalResponse>
                )}
                <button type="button"
                    onClick={openModal24}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
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
                        namaPemeriksa={'Acep Piere'} no={2} onFinish={undefined} idTiket={undefined} idProses={undefined} kodeLkh={undefined} namaMesin={undefined} skor_mtc={undefined}                    >
                        <p></p>
                    </ModalStockCheck1>
                )}
                <button type="button"
                    onClick={openModal25}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open StockCHeck Rusak
                </button>
                {showModal25 && (
                    <ModalStockCheckRusak

                        isOpen={showModal25}
                        onClose={closeModal25}
                        machineName={'R700'} kendala={'Settingan tidak pas'}
                        tgl={'20 MEI 2024'}
                        jam={'14:00'}
                        namaPemeriksa={'Acep Piere'} no={2}
                    >
                        <p></p>
                    </ModalStockCheckRusak>
                )}

                <button type="button"
                    onClick={openModal26}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open StockCHeck Pengganti
                </button>
                {showModal26 && (
                    <ModalStockCheckPengganti

                        isOpen={showModal26}
                        onClose={closeModal26}
                        machineName={'R700'}

                        kendala={'Settingan tidak pas'}
                        tgl={'20 MEI 2024'}
                        jam={'14:00'}
                        namaPemeriksa={'Acep Piere'} no={2} onFinish={undefined}                    >
                        <p></p>
                    </ModalStockCheckPengganti>
                )}
            </div>
            <div className='pt-4'>
                <button type="button"
                    onClick={openModal27}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
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
                <button type="button"
                    onClick={openModal28}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open
                </button>
                {showModal28 && (
                    <ModalPM26type

                        isOpen={showModal28}
                        onClose={closeModal28}
                        machineName={'R700'}
                    >
                        <p></p>
                    </ModalPM26type>
                )}
                <button type="button"
                    onClick={openModal29}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open Filter
                </button>
                {showModal29 && (
                    <ModalFilter

                        isOpen={showModal29}
                        onClose={closeModal29}

                    >
                        <p></p>
                    </ModalFilter>
                )}
                <button type="button"
                    onClick={openModal30}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Open New SPB Service
                </button>
                {showModal30 && (
                    <ModalSPBService

                        isOpen={showModal30}
                        onClose={closeModal30}
                        noSPB={'MT-0001'} tglSpb={'20 MEI 2024'} data={undefined}
                    >
                        <p></p>
                    </ModalSPBService>
                )}
            </div>
            <div className='pt-20'>

            </div>
        </div >
    );
};

export default App;