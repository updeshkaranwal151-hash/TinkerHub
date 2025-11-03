
import React, { useState, useRef, useEffect } from 'react';

interface CameraCaptureModalProps {
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({ onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access the camera. Please ensure you have given permission and are not using it elsewhere.");
      }
    };

    getCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleUsePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-[60] p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-2xl relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-4 text-slate-400 hover:text-white text-3xl font-bold z-10">&times;</button>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4 text-sky-400">Capture Component Image</h2>
          {error && <p className="text-red-500 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}
          
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {capturedImage ? (
              <img src={capturedImage} alt="Captured preview" className="w-full h-full object-contain" />
            ) : (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain"></video>
            )}
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>

          <div className="mt-4 flex justify-center gap-4">
            {capturedImage ? (
              <>
                <button onClick={handleRetake} className="py-2 px-6 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition duration-300">
                  Retake
                </button>
                <button onClick={handleUsePhoto} className="py-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition duration-300">
                  Use Photo
                </button>
              </>
            ) : (
              <button onClick={handleCapture} disabled={!!error} className="py-3 px-8 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-full transition duration-300 text-lg">
                Capture Photo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraCaptureModal;
