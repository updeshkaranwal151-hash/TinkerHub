import React, { useState, useEffect } from 'react';
import CameraCaptureModal from './CameraCaptureModal.tsx';
import { identifyComponentFromImage } from '../services/geminiService.ts';
import { AISuggestions } from '../types.ts';
import { ScanIcon } from './Icons.tsx';

// Helper to convert dataURL to blob for file info
const dataURLtoMimeType = (dataurl: string): string => {
    const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/);
    return mime ? mime[1] : 'image/jpeg';
};

interface SmartScannerModalProps {
    onClose: () => void;
    onComponentIdentified: (suggestions: AISuggestions, imageDataUrl: string) => void;
}

type ScanStep = 'idle' | 'capturing' | 'analyzing' | 'error';

const SmartScannerModal: React.FC<SmartScannerModalProps> = ({ onClose, onComponentIdentified }) => {
    const [step, setStep] = useState<ScanStep>('idle');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Automatically start capturing when the modal opens
    useEffect(() => {
        setStep('capturing');
    }, []);

    const handleCapture = async (imageDataUrl: string) => {
        setCapturedImage(imageDataUrl);
        setStep('analyzing');
        setError(null); // Clear previous errors

        try {
            const imageMimeType = dataURLtoMimeType(imageDataUrl);
            const imageBase64 = imageDataUrl.split(',')[1];
            
            const suggestions = await identifyComponentFromImage(imageBase64, imageMimeType);
            
            // Success, pass data to parent and close
            onComponentIdentified(suggestions, imageDataUrl);

        } catch (err: any) {
            setError(err.message || "An unknown error occurred during analysis.");
            setStep('error');
        }
    };
    
    const handleClose = () => {
        // If the user closes during capture, just close the main modal too.
        if (step === 'capturing') {
            onClose();
        }
        setStep('idle');
    };
    
    const handleRetry = () => {
        setCapturedImage(null);
        setError(null);
        setStep('capturing');
    };

    if (step === 'capturing') {
        return (
            <CameraCaptureModal
                onClose={handleClose}
                onCapture={handleCapture}
            />
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-md relative text-center" 
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
                <div className="flex justify-center items-center gap-3 mb-4">
                    <ScanIcon className="h-6 w-6 text-sky-400" />
                    <h2 className="text-2xl font-bold text-sky-400">Smart Scanner</h2>
                </div>
                
                {step === 'analyzing' && (
                    <>
                        <p className="text-slate-300 mb-6">Analyzing component with AI...</p>
                        <div className="relative">
                            <img src={capturedImage ?? ''} alt="Captured component" className="rounded-lg max-h-64 mx-auto opacity-50" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 border-4 border-t-sky-400 border-slate-600 rounded-full animate-spin"></div>
                                <p className="mt-4 font-semibold text-white animate-pulse">Identifying...</p>
                            </div>
                        </div>
                    </>
                )}

                {step === 'error' && (
                    <>
                        <p className="text-red-400 mb-4">Analysis Failed</p>
                        <div className="bg-red-900/50 text-red-300 text-sm p-3 rounded-md mb-6">
                            {error}
                        </div>
                         <img src={capturedImage ?? ''} alt="Component that failed analysis" className="rounded-lg max-h-48 mx-auto opacity-50 mb-6" />
                        <div className="flex justify-center gap-4">
                            <button onClick={onClose} className="py-2 px-6 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg">
                                Cancel
                            </button>
                             <button onClick={handleRetry} className="py-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg">
                                Try Again
                            </button>
                        </div>
                    </>
                )}

            </div>
        </div>
    );
};

export default SmartScannerModal;
