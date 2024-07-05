import React, { useState, useEffect, useCallback } from 'react';
import Modal from 'react-modal';

const OFFSET_X = 21;
const OFFSET_Y = 58;

const EditFoodZoneModal = ({ isOpen, onRequestClose, img, imgWidth, imgHeight, onSave }) => {
    const [canvasRef, setCanvasRef] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [rect, setRect] = useState(null);

    const canvasCallbackRef = useCallback(node => {
        if (node) {
            setCanvasRef(node);
        }
    }, []);

    useEffect(() => {
        if (isOpen && img && canvasRef) {
            const ctx = canvasRef.getContext('2d');
            const image = new Image();
            image.src = `data:image/jpeg;base64,${img}`;
            image.onload = () => {
                ctx.drawImage(image, 0, 0, canvasRef.width, canvasRef.height);
            };
        }
    }, [isOpen, img, canvasRef]);

    const getAdjustedCoordinates = (e) => {
        const rect = canvasRef.getBoundingClientRect();
        const offsetX = rect.left - OFFSET_X;
        const offsetY = rect.top - OFFSET_Y;
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;
        return { x, y };
    };

    const handleMouseDown = (e) => {
        const adjustedPos = getAdjustedCoordinates(e);
        setStartPos(adjustedPos);
        setIsDrawing(true);
    };

    const handleMouseMove = (e) => {
        if (!isDrawing) return;
        const adjustedPos = getAdjustedCoordinates(e);
        setRect({
            x: Math.min(startPos.x, adjustedPos.x),
            y: Math.min(startPos.y, adjustedPos.y),
            width: Math.abs(startPos.x - adjustedPos.x),
            height: Math.abs(startPos.y - adjustedPos.y),
        });
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    const handleSave = () => {
        if (rect) {
            const topLeft = { x: rect.x + 2*OFFSET_X, y: rect.y + OFFSET_Y };
            const bottomRight = { x: rect.x + rect.width + 2*OFFSET_X, y: rect.y + rect.height + OFFSET_Y };
            const coordinates = { topLeft, bottomRight };
            onSave(coordinates);
        }
        onRequestClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Edit Food Zone Modal"
            className="edit-food-zone-modal"
            overlayClassName="overlay"
        >
            <div className="modal-header" style={{position: 'relative', top: '-16px'}}>
                Edit Food Zone
                <button className="close-button" onClick={onRequestClose}>&times;</button>
            </div>
            <div className="modal-content">
                <canvas
                    ref={canvasCallbackRef}
                    width={imgWidth || 640}
                    height={imgHeight || 480}
                    className="edit-canvas"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                />
                {rect && (
                    <div
                        className="rectangle"
                        style={{
                            left: `${rect.x}px`,
                            top: `${rect.y}px`,
                            width: `${rect.width}px`,
                            height: `${rect.height}px`,
                        }}
                    />
                )}
                <button className="save-button full-width-button" onClick={handleSave}>Save</button>
            </div>
        </Modal>
    );
};

export default EditFoodZoneModal;
