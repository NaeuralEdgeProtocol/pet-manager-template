import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Doughnut } from 'react-chartjs-2';
import EditFoodZoneModal from './EditFoodZoneModal';
import StackedBarChart from './StackedBarChart';
import '../configs/chartConfig';
import {useNetwork} from './NetworkContext';

const petStateColors = {
    missing: '#FF6384',
    eat: '#36A2EB',
    sleep: '#FFCE56',
    play: '#4BC0C0',
};

const statusMessages =  {
    missing: 'Oh, your beloved pet seems to be missing.',
    eat: 'Bon Appétit, little one!',
    sleep: 'Shh, someone is fast asleep...',
    play: 'Someone is having a lot of fun!',
}

const StreamCard = ({ stream, onClose }) => {
    const client = useNetwork();
    const placeholderImg = 'https://via.placeholder.com/362x220.png?text=Waiting+for+image';
    const { img, imgWidth, imgHeight, petState, petStateCount = { eat: 0, missing: 0, play: 0, sleep: 0 }, timeline = [] } = stream;
    const borderColor = petStateColors[petState] || '#b4b4b4';
    const [isImageModalOpen, setImageModalOpen] = useState(false);
    const [isEditFoodZoneModalOpen, setEditFoodZoneModalOpen] = useState(false);

    const [duration, setDuration] = useState(10);
    const openImageModal = () => {
        setImageModalOpen(true);
    };

    const closeImageModal = () => {
        setImageModalOpen(false);
    };

    const openEditFoodZoneModal = () => {
        setEditFoodZoneModalOpen(true);
        setImageModalOpen(false);
    };

    const closeEditFoodZoneModal = () => {
        setEditFoodZoneModalOpen(false);
    };

    const handleDurationChange = (event) => {
        setDuration(parseInt(event.target.value, 10));
    };

    const handleSaveCoordinates = (coordinates) => {
        const tlbr = [
            parseFloat((coordinates.topLeft.y / imgHeight ).toFixed(2)),
            parseFloat((coordinates.topLeft.x / imgWidth).toFixed(2)),
            parseFloat((coordinates.bottomRight.y / imgHeight).toFixed(2)),
            parseFloat((coordinates.bottomRight.x / imgWidth).toFixed(2)),
        ];

        client.getNodeManager(stream.node).then((manager) => {
            const instance = manager.getPluginInstance(stream.pipeline, stream.instance);

            instance.updateConfig({
                FOOD_ZONE: tlbr,
            });

            manager.commit().then(
                (responses) => { console.log(responses) },
                (errors) => { console.log(errors); },
            );
        });
    };

    const data = {
        labels: ['Eat', 'Missing', 'Play', 'Sleep'],
        datasets: [
            {
                data: [petStateCount.eat, petStateCount.missing, petStateCount.play, petStateCount.sleep],
                backgroundColor: [ '#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56'],
                hoverBackgroundColor: ['#36A2EB', '#FF6384', '#4BC0C0', '#FFCE56'],
                borderWidth: 0,
            }
        ]
    };

    return (
        <div className="stream-card" style={{ borderLeft: `20px solid ${borderColor}` }}>
            <div className="stream-card-header">
                <h3>{`${statusMessages[petState] ?? 'Waiting for news...'}`}</h3>
                <button onClick={() => onClose(stream)}>Close Stream</button>
            </div>
            <div className="stream-card-body">
                <div className="stream-card-column">
                    <img
                        src={img ? `data:image/jpeg;base64,${img}` : placeholderImg}
                        alt="Stream"
                        className="stream-image"
                        onClick={openImageModal}
                    />
                </div>
                <div className="stream-card-column">
                    <Doughnut data={data} width={200} height={200} />
                </div>
                <div className="stream-card-column">
                    <select onChange={handleDurationChange} value={duration}>
                        <option value={5}>5 minutes</option>
                        <option value={10}>10 minutes</option>
                        <option value={15}>15 minutes</option>
                        <option value={20}>20 minutes</option>
                        <option value={60}>1 hour</option>
                    </select>
                    <StackedBarChart timeline={timeline} duration={duration} />
                </div>
            </div>
            <Modal
                isOpen={isImageModalOpen}
                onRequestClose={closeImageModal}
                contentLabel="Stream Image Modal"
                className="image-modal"
                overlayClassName="overlay"
            >
                <div className="modal-header" style={{position: 'relative', top: '-16px'}}>
                    Instant Snapshot
                    <button className="close-button" onClick={closeImageModal}>&times;</button>
                </div>
                <div className="modal-content">
                    {img && <img src={`data:image/jpeg;base64,${img}`} alt="Stream" className="modal-image" />}
                    <button className="edit-food-zone-button full-width-button" onClick={openEditFoodZoneModal}>Edit Food Zone</button>
                </div>
            </Modal>

            {isEditFoodZoneModalOpen && (
                <EditFoodZoneModal
                    isOpen={isEditFoodZoneModalOpen}
                    onRequestClose={closeEditFoodZoneModal}
                    img={img}
                    imgWidth={imgWidth}
                    imgHeight={imgHeight}
                    onSave={handleSaveCoordinates}
                />
            )}
        </div>
    );
};

export default StreamCard;
