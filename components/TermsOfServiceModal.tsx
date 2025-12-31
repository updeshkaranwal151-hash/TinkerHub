import React from 'react';

interface TermsOfServiceModalProps {
  onClose: () => void;
}

const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100] p-4" onClick={onClose}>
      <div className="bg-slate-800/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-3xl max-h-[80vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        <h2 className="text-3xl font-bold mb-6 text-sky-400">Terms of Service</h2>
        <div className="space-y-4 text-slate-300 text-sm md:text-base">
          <p>Welcome to TinkerHub!</p>
          <p>These terms and conditions outline the rules and regulations for the use of TinkerHub's Website, located at tinkerhubapp.pages.dev.</p>
          <p>By accessing this website we assume you accept these terms and conditions. Do not continue to use TinkerHub if you do not agree to take all of the terms and conditions stated on this page.</p>

          <h3 className="text-xl font-bold text-white mt-6">License</h3>
          <p>Unless otherwise stated, TinkerHub and/or its licensors own the intellectual property rights for all material on TinkerHub. All intellectual property rights are reserved. You may access this from TinkerHub for your own personal use subjected to restrictions set in these terms and conditions.</p>
          <p>You must not:</p>
          <ul className="list-disc list-inside ml-4">
            <li>Republish material from TinkerHub</li>
            <li>Sell, rent or sub-license material from TinkerHub</li>
            <li>Reproduce, duplicate or copy material from TinkerHub</li>
            <li>Redistribute content from TinkerHub</li>
          </ul>

          <h3 className="text-xl font-bold text-white mt-6">User Content</h3>
          <p>In these terms and conditions, "Your Content" shall mean any audio, video text, images or other material you choose to display on this Website. By displaying Your Content, you grant TinkerHub a non-exclusive, worldwide irrevocable, sub licensable license to use, reproduce, adapt, publish, translate and distribute it in any and all media.</p>

          <h3 className="text-xl font-bold text-white mt-6">Disclaimer</h3>
          <p>To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will:</p>
          <ul className="list-disc list-inside ml-4">
            <li>limit or exclude our or your liability for death or personal injury;</li>
            <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
            <li>limit any of our or your liabilities in any way that is not permitted under applicable law.</li>
          </ul>
        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-lg">Close</button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServiceModal;