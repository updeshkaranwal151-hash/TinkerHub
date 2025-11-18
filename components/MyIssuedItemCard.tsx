import React from 'react';
import { ReturnIcon } from './Icons.tsx';

interface MyIssuedItemCardProps {
  componentName: string;
  imageUrl: string;
  quantity: number;
  issuedDate: string;
  onReturn: () => void;
}

const MyIssuedItemCard: React.FC<MyIssuedItemCardProps> = ({ componentName, imageUrl, quantity, issuedDate, onReturn }) => {
  return (
    <div className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-4 border border-slate-700">
      <img src={imageUrl} alt={componentName} className="w-16 h-16 object-contain bg-slate-700 rounded-md p-1 flex-shrink-0" />
      <div className="flex-grow">
        <h4 className="font-bold text-white">{componentName}</h4>
        <p className="text-sm text-slate-400">Quantity: {quantity}</p>
        <p className="text-xs text-slate-500">Issued on: {new Date(issuedDate).toLocaleDateString()}</p>
      </div>
      <button
        onClick={onReturn}
        className="flex items-center justify-center gap-1 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg transition duration-200"
      >
        <ReturnIcon /> Return
      </button>
    </div>
  );
};

export default MyIssuedItemCard;