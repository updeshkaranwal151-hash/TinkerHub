
import React, { useRef } from 'react';
import { Component } from '../types.ts';

interface QRCodeModalProps {
  component: Component | null;
  onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ component, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!component) return null;

  const componentUrl = `${window.location.origin}${window.location.pathname}#/component/${component.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(componentUrl)}&bgcolor=ffffff`;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (printContent) {
      const windowUrl = 'about:blank';
      const uniqueName = new Date().getTime();
      const windowName = 'Print' + uniqueName;
      const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print QR Code</title>
              <style>
                @media print {
                  body {
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                  }
                  .print-area {
                    text-align: center;
                    font-family: sans-serif;
                  }
                  h3 {
                    font-size: 1.2rem;
                    margin-bottom: 10px;
                  }
                  img {
                    max-width: 80%;
                    height: auto;
                  }
                  @page {
                    size: 3in 3in;
                    margin: 0.25in;
                  }
                }
              </style>
            </head>
            <body>
              <div class="print-area">
                ${printContent.innerHTML}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-sm relative text-center" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-sky-400">QR Code</h2>
        <p className="text-slate-300 mb-6">Scan to view and issue <span className="font-semibold text-white">{component.name}</span>.</p>

        <div ref={printRef} className="bg-white rounded-lg p-4 inline-block">
           <h3 className="text-lg font-bold text-slate-800 mb-2">${component.name}</h3>
           <img src={qrCodeUrl} alt={`QR Code for ${component.name}`} width="250" height="250" />
        </div>
        
        <p className="text-xs text-slate-500 mt-4 break-all">{componentUrl}</p>

        <div className="mt-6 flex gap-4">
            <button 
                onClick={handlePrint} 
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition duration-300"
            >
                Print
            </button>
            <button 
                onClick={onClose} 
                className="w-full py-3 px-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition duration-300"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
