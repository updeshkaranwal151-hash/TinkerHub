import React, { useState, useEffect } from 'react';
import CameraCaptureModal from './CameraCaptureModal.tsx';

interface SmartScannerModalProps {
    onClose: () => void;
    onImageScanned: (imageDataUrl: string) => void;
}

const SmartScannerModal: React.FC<SmartScannerModalProps> = ({ onClose, onImageScanned }) => {
    const [isCapturing, setIsCapturing] = useState(true);

    const handleCapture = (imageDataUrl: string) => {
        setIsCapturing(false); // Stop capturing view
        onImageScanned(imageDataUrl); // Pass image to parent, parent will close this modal
    };

    const handleCloseCapture = () => {
        setIsCapturing(false);
        onClose(); // User cancelled capture
    };

    // This component's view is entirely handled by the CameraCaptureModal.
    // If capture is active, show the camera. Otherwise, this modal's job is done,
    // and it can render null while the parent component takes over the UI flow.
    if (isCapturing) {
        return (
            <CameraCaptureModal
                onClose={handleCloseCapture}
                onCapture={handleCapture}
            />
        );
    }

    return null;
};

export default SmartScannerModal;
