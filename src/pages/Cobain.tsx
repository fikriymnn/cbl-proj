import React, { useState } from 'react';
import Modal from '../components/Modal';
import Gambar from '../images/BACKGROUND.png';
import Logo from '../images/logo/logo-cbl 1.svg';

const App = () => {
    const [showModal1, setShowModal1] = useState(false);
    const [showModal2, setShowModal2] = useState(false);

    const openModal1 = () => setShowModal1(true);
    const closeModal1 = () => setShowModal1(false);

    const openModal2 = () => {
        setShowModal2(true);
        setShowModal1(false); // Close Modal 1 here
    };

    const closeModal2 = () => setShowModal2(false);

    return (
        <div className="container mx-auto">
            <button type="button" onClick={openModal1} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Open Modal 1
            </button>
            {showModal1 && (
                <Modal title="Modal 1" isOpen={showModal1} onClose={closeModal1} imageUrl={Logo}>
                    <p>This is the content of Modal 1.</p>
                    <button type="button" onClick={openModal2} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Next Step - Open Modal 2
                    </button>
                </Modal>
            )}
            {showModal2 && (
                <Modal title="Modal 2" isOpen={showModal2} onClose={closeModal2} imageUrl={Gambar}>
                    <p>This is the content of Modal 2.</p>
                </Modal>
            )}
        </div>

    );
};

export default App;