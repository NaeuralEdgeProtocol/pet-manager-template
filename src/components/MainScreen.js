import React, {useEffect, useState} from 'react';
import { DCT_TYPE_VIDEO_STREAM } from '@naeural/js-web-client';
import { useNetwork } from './NetworkContext';
import ScreenHeader from './ScreenHeader';
import StreamCard from './StreamCard';
import { FleetProvider, useFleet } from './FleetContext';
import Modal from 'react-modal';
import {PET_DETECTOR_SIGNATURE} from '../schemas/plugins/pet.detector.01';

const MainScreen = () => {
    const client = useNetwork();
    const { fleetArray } = useFleet();
    const [heartbeatStatus, setHeartbeatStatus] = useState({});
    const [nodeModalIsOpen, setNodeModalIsOpen] = useState(false);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isOverlayVisible, setIsOverlayVisible] = useState(false);
    const [overlayText, setOverlayText] = useState('');
    const [streams, setStreams] = useState(() => {
        const savedStreams = localStorage.getItem('streams');
        return savedStreams ? JSON.parse(savedStreams) : [];
    });

    const subscribeToHeartbeats = () => {
        client.getStream('heartbeats').subscribe((heartbeat) => {
            const nodeName = heartbeat.EE_PAYLOAD_PATH[0];

            setHeartbeatStatus((prevStatus) => ({
                ...prevStatus,
                [nodeName]: { active: true, timestamp: Date.now() }
            }));

            setTimeout(() => {
                setHeartbeatStatus((prevStatus) => ({
                    ...prevStatus,
                    [nodeName]: { ...prevStatus[nodeName], active: false }
                }));
            }, 1000);

        });
    };

    const subscribeToPayloads = () => {
        client.on(PET_DETECTOR_SIGNATURE, (error, data, context) => {
            console.log(data, context);
            if (context.pipeline === null) { return; }

            const pipelineId = context.pipeline.name;
            const instanceId = context.instance.name;
            const nodeName = context.metadata.EE_PAYLOAD_PATH[0];

            if (!data.IMG && !data.TIMELINE) { return; }

            const img = data.IMG;
            let imgWidth = null;
            let imgHeight = null;
            let petState = null;
            let petStateCount  = { eat: 0, missing: 0, play: 0, sleep: 0 };

            let timeline = [];
            if (!img) {
                timeline = data.TIMELINE.map((observation) => {
                    const sum = observation.eat + observation.sleep + observation.missing + observation.play;

                    return {
                        eat: Math.round(100 * observation.eat / sum),
                        sleep:  Math.round(100 * observation.eat / sum),
                        play:  Math.round(100 * observation.play / sum),
                        missing:  Math.round(100 * observation.missing / sum),
                    }
                });
            } else {
                petState = data.PET_STATE;
                imgWidth = data.IMG_WIDTH;
                imgHeight = data.IMG_HEIGHT;

                const sum = data.PET_STATE_COUNT.eat + data.PET_STATE_COUNT.play + data.PET_STATE_COUNT.missing + data.PET_STATE_COUNT.sleep;
                petStateCount = {
                    eat: Math.round(100 * data.PET_STATE_COUNT.eat / sum),
                    sleep:  Math.round(100 * data.PET_STATE_COUNT.eat / sum),
                    play:  Math.round(100 * data.PET_STATE_COUNT.play / sum),
                    missing:  Math.round(100 * data.PET_STATE_COUNT.missing / sum),
                }
            }

            setStreams((prevStreams) =>
                prevStreams.map((stream) => {
                    if (stream.node === nodeName && stream.pipeline === pipelineId && stream.instance === instanceId) {
                        if (img) {
                            return {
                                ...stream,
                                img,
                                petState,
                                petStateCount,
                                imgWidth,
                                imgHeight,
                            };
                        }
                        return {
                            ...stream,
                            timeline: [...timeline]
                        };
                    }

                    return stream;
                })
            );
        });
    };

    useEffect(() => {
        subscribeToHeartbeats();
        subscribeToPayloads();
    }, []);

    const getNodeStatusColor = (node) => {
        const currentTime = Date.now();
        const nodeStatus = heartbeatStatus[node];
        if (nodeStatus) {
            const timeDifference = (currentTime - nodeStatus.timestamp) / 1000;
            if (timeDifference <= 30) {
                return 'green';
            }
        }
        return 'red';
    };

    const openNodeModal = (node) => {
        setSelectedNode(node);
        setNodeModalIsOpen(true);
    };

    const closeNodeModal = () => {
        setNodeModalIsOpen(false);
        setSelectedNode(null);
    };

    const handleStart = () => {
        const streamUrl = document.getElementById('stream-url').value;
        if (streamUrl === null || streamUrl === '') {
            closeNodeModal();

            return;
        }

        const pipelineId = generateRandomId();
        const instanceId = generateRandomId();

        setOverlayText(`Starting stream for ${selectedNode} with URL: ${streamUrl}`);
        setIsOverlayVisible(true);

        client.getNodeManager(selectedNode).then((manager) => {
            const newPipeline = manager.createPipeline({
                    type: DCT_TYPE_VIDEO_STREAM,
                    config: {
                        URL: streamUrl
                    },
                },
                pipelineId,
            );

            const newInstance = manager.createPluginInstance(
                PET_DETECTOR_SIGNATURE,
                {
                    REPORT_PERIOD: 3
                },
                instanceId,
            );

            manager.attachPluginInstance(newPipeline, newInstance);

            manager.commit().then(
                (responses) => {
                    console.log(responses);

                    const newEntry = {
                        node: selectedNode,
                        url: streamUrl,
                        pipeline: pipelineId,
                        instance: instanceId
                    };

                    let savedStreams = localStorage.getItem('streams');
                    savedStreams = savedStreams ? JSON.parse(savedStreams) : [];
                    savedStreams.push(newEntry);
                    setStreams(savedStreams);

                    localStorage.setItem('streams', JSON.stringify(savedStreams));
                    setIsOverlayVisible(false);
                },
                (errors) => { console.log(errors); setIsOverlayVisible(false); },
            );
        });

        closeNodeModal();
    };

    const handleCloseStream = (streamToClose) => {
        setOverlayText(`Closing stream ${streamToClose.node} : ${streamToClose.pipeline} : ${streamToClose.instance}`);
        setIsOverlayVisible(true);
        const updatedStreams = streams.filter(
            stream => stream.node !== streamToClose.node || stream.pipeline !== streamToClose.pipeline || stream.instance !== streamToClose.instance
        );

        client.getNodeManager(streamToClose.node).then((manager) => {
            manager.closePipeline(streamToClose.pipeline);
            manager.commit().then(
                (responses) => {
                    console.log(responses);
                    setStreams(updatedStreams);
                    localStorage.setItem('streams', JSON.stringify(updatedStreams));
                    setIsOverlayVisible(false);
                },
                (errors) => {
                    console.log(errors);
                    setIsOverlayVisible(false);
                },
            );
        });
    };

    const generateRandomId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        result += '-';

        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return result;
    }

    return (
        <div>
            <div className={`overlay ${isOverlayVisible ? 'visible' : 'hidden'}`}>
                <div className="overlay-text">{overlayText}</div>
            </div>
            <ScreenHeader />
            <div className="main-content">
                <div className="fleet-list">
                    <div className="fleet-nodes">
                        <span className={'connected-nodes-label'}>Connected Nodes: </span>
                        {fleetArray.map((node) => (
                            <div key={node} className="node-item" onClick={() => openNodeModal(node)}>
                                <strong>{node}</strong>
                                <span className={`status-dot ${heartbeatStatus[node]?.active ? 'blink' : ''}`} style={{ backgroundColor: getNodeStatusColor(node) }}></span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="streams-list">
                    <h2>Active Streams</h2>
                    <div className="streams-cards">
                        {streams.map(stream => (
                            <StreamCard key={`${stream.node}-${stream.pipeline}-${stream.instance}`} stream={stream} onClose={handleCloseStream} />
                        ))}
                    </div>
                </div>
                {/* Add more main screen content here */}
            </div>
            <Modal
                isOpen={nodeModalIsOpen}
                onRequestClose={closeNodeModal}
                contentLabel="Node Interaction Modal"
                className="modal"
                overlayClassName="overlay"
            >
                <div className="modal-header" style={{position: 'relative', top: '-16px'}}>
                    Connect another feed
                    <button className="close-button" onClick={closeNodeModal}>&times;</button>
                </div>
                <div className="modal-content">
                    <span style={{ marginBottom: '15px' }}>Connecting stream to: {selectedNode}</span>
                    <div>
                        <input type="text" id="stream-url" placeholder="Stream URL" className="full-width-input" />
                    </div>
                    <button onClick={handleStart} className="connect-button full-width-button">Start</button>
                </div>
            </Modal>
        </div>
    );
};

const WrappedMainScreen = () => (
    <FleetProvider>
        <MainScreen />
    </FleetProvider>
);

export default WrappedMainScreen;

