import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, onSecondaryAction, confirmText = "Confirm", cancelText = "Cancel", isDanger = false, requireText = null }) => {
    const [inputValue, setInputValue] = useState("");
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-scale-up border border-stone-200">
                <button 
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition"
                >
                    <X size={20} />
                </button>

                <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${
                    isDanger ? "bg-red-100 text-red-600" : "bg-stone-100 text-stone-700"
                }`}>
                    <AlertTriangle size={24} />
                </div>

                <h2 className="text-xl font-bold text-stone-800 mb-2">{title}</h2>
                <p className="text-stone-500 text-sm mb-6 leading-relaxed whitespace-pre-wrap">
                    {message}
                </p>
                {requireText && (
                    <div className="mb-4">
                        <input 
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={`Type "${requireText}" to confirm`}
                            className="w-full p-3 border border-stone-200 rounded-lg outline-none focus:ring-2 focus:ring-red-500 font-bold text-center uppercase tracking-widest text-stone-800"
                        />
                    </div>
                )}

                <div className="flex gap-3 mt-4">
                    <button 
                        onClick={onSecondaryAction || onCancel}
                        className="flex-1 py-2.5 rounded-xl text-stone-600 font-bold hover:bg-stone-100 transition border border-stone-200"
                    >
                        {cancelText}
                    </button>
                    <button 
                        disabled={requireText ? inputValue.trim().toUpperCase() !== requireText.trim().toUpperCase() : false}
                        onClick={() => {
                            onConfirm();
                            setInputValue("");
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-white font-bold transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                            isDanger ? "bg-red-500 hover:bg-red-600" : "bg-stone-800 hover:bg-black"
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
