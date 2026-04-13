import React from 'react';
import { BrainCircuit } from 'lucide-react';

const GlobalLoader = ({ fullScreen = true, message = "Loading Cortex..." }) => {
    return (
        <div className={`flex flex-col items-center justify-center bg-[#FDFCF8] text-stone-800 ${fullScreen ? 'fixed inset-0 z-50' : 'h-full w-full py-20'}`}>
            <div className="relative flex items-center justify-center">
                {/* Outer pulsing ring */}
                <div className="absolute w-24 h-24 bg-stone-200 rounded-full animate-ping opacity-75"></div>
                
                {/* Inner solid circle with Icon */}
                <div className="relative w-20 h-20 bg-black text-white rounded-full flex items-center justify-center shadow-2xl">
                    <BrainCircuit size={40} className="animate-pulse" />
                </div>
            </div>
            
            {/* Loading text with pulse */}
            <h2 className="mt-8 text-sm text-stone-800 font-bold tracking-widest uppercase animate-pulse">
                {message}
            </h2>
            
            {/* Minimalist subtle progress bar effect */}
            <div className="w-48 h-[2px] bg-stone-200 rounded-full mt-4 overflow-hidden relative">
                <div className="absolute top-0 bottom-0 w-24 bg-black rounded-full animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            </div>
        </div>
    );
};

export default GlobalLoader;
