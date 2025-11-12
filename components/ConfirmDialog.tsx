
import React from 'react';

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  message,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700',
  cancelButtonClass = 'bg-slate-600 hover:bg-slate-700',
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[100] p-4" onClick={onCancel}>
      <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-xl p-6 md:p-8 w-full max-w-md relative" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-sky-400">{title}</h2>
        <p className="text-slate-300 mb-6">{message}</p>
        <div className="flex justify-end gap-4 pt-4">
          <button type="button" onClick={onCancel} className={`py-2 px-4 text-white font-semibold rounded-lg transition duration-300 ${cancelButtonClass}`}>
            {cancelButtonText}
          </button>
          <button type="button" onClick={onConfirm} className={`py-2 px-4 text-white font-semibold rounded-lg shadow-lg transition duration-300 ${confirmButtonClass}`}>
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
