import React, {useEffect, useRef, useState} from 'react';
import Modal from 'react-modal';
import {useNetwork} from './NetworkContext';
import {useConnection} from './ConnectionContext';
import {useFleet} from './FleetContext';

Modal.setAppElement('#root');

const ScreenHeader = () => {
    const client = useNetwork();
    const { setConnected } = useConnection();
    const { fleetArray, setFleetArray } = useFleet();
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [nodes, setNodes] = useState({});
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!modalIsOpen) {
            clearInterval(intervalRef.current);
        }
    }, [modalIsOpen]);

    useEffect(() => {
        const fetchNodes = () => {
            const universe = client.getUniverse();
            setNodes({ ...universe });
        };

        fetchNodes();

        const interval = setInterval(fetchNodes, 3000);
        intervalRef.current = interval;

        return () => clearInterval(interval);

    }, [client]);

    const handleLogout = () => {
        setConnected(false);
    };

    const openModal = () => {
        setModalIsOpen(true);
        intervalRef.current = setInterval(() => {
            const universe = client.getUniverse();
            setNodes({ ...universe });
        }, 3000);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        clearInterval(intervalRef.current);
    };

    const handleConnect = (node) => {
        const newFleet = [...fleetArray, node];
        client.setFleet(newFleet);
        setFleetArray(newFleet);
    };

    const handleDisconnect = (node) => {
        const newFleet = fleetArray.filter(f => f !== node);
        client.setFleet(newFleet);
        setFleetArray(newFleet);
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };


    return (
        <div className="screen-header">
            <div>
                <img src={`Logo_pet.png`} alt="Pet Monitor" height={50} />
                <span className="header-branding gradient-text">Pet Monitor</span>
            </div>
            <span> </span>
            {/*<button onClick={openModal}>View Network</button>*/}
            <button onClick={handleLogout} className="disconnect-button">Logout</button>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Node Management Modal"
                className="modal"
                overlayClassName="overlay"
            >
                <h2>Available Nodes</h2>
                <ul className="node-list">
                    {Object.keys(nodes).map((node) => (
                        <li key={node} className="node-item">
                            <div className="node-info">
                                <strong>{node}</strong>
                                <small>{formatDate(nodes[node])}</small>
                            </div>
                            {fleetArray.includes(node) ? (
                                <button className="disconnect-button" onClick={() => handleDisconnect(node)}>Disconnect</button>
                            ) : (
                                <button className="connect-button" onClick={() => handleConnect(node)}>Connect</button>
                            )}
                        </li>
                    ))}
                </ul>
                <button onClick={closeModal}>Close</button>
            </Modal>
        </div>
    );
};

export default ScreenHeader;
