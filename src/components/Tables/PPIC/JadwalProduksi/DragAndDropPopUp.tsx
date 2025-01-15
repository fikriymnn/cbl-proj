import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const DragDropPopup: React.FC<{ mapData: any[], onSave: (updatedData: any[]) => void, onClose: () => void }> = ({ mapData, onSave, onClose }) => {
    const [data, setData] = useState<any[]>(mapData); // Local state to track changes in drag-and-drop

    const moveItem = (draggedItem: any, targetIndex: number) => {
        const updatedData = [...data];
        const draggedIndex = updatedData.findIndex(item => item.no_jo === draggedItem.no_jo && item.jam === draggedItem.jam);

        if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
            // Swap positions
            const temp = updatedData[draggedIndex];
            updatedData[draggedIndex] = updatedData[targetIndex];
            updatedData[targetIndex] = temp;

            // Update state
            setData(updatedData);
        }
    };

    const handleSave = () => {
        onSave(data); // Send updated data back to parent
        onClose(); // Close the popup after saving
    };

    const handleClose = () => {
        onClose(); // Close without saving
    };

    return (
        <div className="popup-container">
            <div className="popup-header">
                <h2 className="text-center text-xl">Drag and Drop Job Order</h2>
                <button onClick={handleClose} className="close-button">Close</button>
            </div>

            <div className="popup-body">
                <div className="row">
                    {data.map((item, index) => (
                        <div key={item.no_jo + item.jam} className="column">
                            <div className="drag-item">
                                <DraggableItem
                                    item={item}
                                    index={index}
                                    moveItem={moveItem}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="popup-footer">
                <button onClick={handleSave} className="save-button">Save</button>
            </div>
        </div>
    );
};

// Draggable item component
const DraggableItem: React.FC<{ item: any, index: number, moveItem: (draggedItem: any, targetIndex: number) => void }> = ({ item, index, moveItem }) => {
    const [, drag] = useDrag(() => ({
        type: 'ITEM',
        item: { ...item, index },
    }), [item]);

    const [, drop] = useDrop(() => ({
        accept: 'ITEM',
        hover: (draggedItem: any) => {
            if (draggedItem.index !== index) {
                moveItem(draggedItem, index);
            }
        },
    }), [moveItem]);

    return (
        <div ref={(node) => drag(drop(node))} className="draggable-item">
            <p>{item.no_jo} - {item.jam}</p>
        </div>
    );
};

export default DragDropPopup;
