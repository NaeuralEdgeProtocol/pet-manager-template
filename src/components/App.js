import React, { useState } from 'react';
import Modal from 'react-modal';
import { useConnection } from './ConnectionContext';
import {useNetwork} from './NetworkContext';
import './App.css';
import WrappedMainScreen from './MainScreen';

Modal.setAppElement('#root');

const blockchainOptions = {
    debug: false,
    key: null,
    encrypt: false,
    secure: false,
};

const App = () => {
    const client = useNetwork();
    const { isConnected, setConnected } = useConnection();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState("");

    const onFileChange = (event) => {
        handleFileChange(event);
        if (event.target.files.length > 0) {
            setFileName(event.target.files[0].name);
        } else {
            setFileName("");
        }
    };

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleConnect = () => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                blockchainOptions.key = e.target.result;
                client.loadIdentity(blockchainOptions);
                client.connect();
                setConnected(true);

                closeModal();
            }
            reader.readAsText(file);
        } else {
            alert('Please select a .pem certificate');
        }
    };

    return (
        <div>
        {isConnected ? (
            <WrappedMainScreen />
        ) : (
            <div className="app gradient-background">
                <div className="app-header">
                    <img src={`Logo_pet.png`} alt="Pet Monitor" height={180} />
                    <span className="rubik-big gradient-text">Pet Monitor</span>
                </div>
                <button className="connect-button" onClick={openModal}>Connect to Network</button>
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    contentLabel="Certificate Upload Modal"
                    className="modal"
                    overlayClassName="overlay"
                >
                    <div className="modal-header">Upload Identity Certificate</div>
                    <input
                        type="file"
                        accept=".pem"
                        onChange={onFileChange}
                        className="hidden-input"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className="upload-area">
                        {fileName || "Click to select a file."}
                    </label>
                    <button onClick={handleConnect} className="connect-button">
                        Connect
                    </button>
                </Modal>
            </div>

        )}
        </div>
    );
};

export default App;
