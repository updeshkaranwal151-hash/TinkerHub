import React, { useState, useEffect } from 'react';
import { WhatsAppIcon, FacebookIcon, TwitterIcon, TelegramIcon } from './Icons.tsx';

interface ShareModalProps {
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ onClose }) => {
  const [appUrl, setAppUrl] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copy Link');

  useEffect(() => {
    // Ensure this runs only on the client-side where window is available
    setAppUrl(window.location.href);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl).then(() => {
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Link'), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy link.');
    });
  };
  
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(appUrl)}&bgcolor=f1f5f9`;

  const shareText = "Check out this awesome ATL Lab Inventory Manager!";
  const encodedUrl = encodeURIComponent(appUrl);
  const encodedText = encodeURIComponent(shareText);

  const shareLinks = [
    {
      name: 'WhatsApp',
      icon: <WhatsAppIcon />,
      url: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
      color: 'hover:bg-green-500'
    },
    {
      name: 'Facebook',
      icon: <FacebookIcon />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-blue-600'
    },
    {
      name: 'Twitter',
      icon: <TwitterIcon />,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      color: 'hover:bg-sky-500'
    },
    {
      name: 'Telegram',
      icon: <TelegramIcon />,
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      color: 'hover:bg-blue-400'
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-sm relative text-center" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-sky-400">Share TinkerHub</h2>
        <p className="text-slate-400 mb-6">Show your project to anyone by sharing the link or QR code.</p>

        {appUrl && (
          <div className="bg-slate-100 rounded-lg p-4 inline-block">
             <img src={qrCodeUrl} alt="QR Code for App URL" width="250" height="250" />
          </div>
        )}
        
        <div className="my-6">
            <p className="text-sm text-slate-400 mb-3">Share via:</p>
            <div className="flex justify-center items-center gap-4">
              {shareLinks.map(link => (
                <a 
                  key={link.name} 
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Share on ${link.name}`}
                  className={`p-3 bg-slate-700 rounded-full text-white ${link.color} transition-colors duration-300 transform hover:scale-110`}
                >
                  {link.icon}
                </a>
              ))}
            </div>
        </div>

        <div>
            <input 
                type="text"
                value={appUrl}
                readOnly
                className="w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-300 text-sm text-center"
            />
             <button 
                onClick={handleCopyLink} 
                className="mt-4 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition duration-300"
            >
                {copyButtonText}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
