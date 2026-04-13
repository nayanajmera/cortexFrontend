import React from 'react';
import { BrainCircuit } from 'lucide-react';

const CortexLogo = ({ size = "normal" }) => {
    const isLarge = size === "large";
    
    return (
        <div className="flex items-center gap-3 select-none">
            <div className={`flex items-center justify-center bg-black text-white shadow-md ${isLarge ? 'w-12 h-12 rounded-xl' : 'w-9 h-9 rounded-lg'}`}>
                <BrainCircuit size={isLarge ? 28 : 20} className={isLarge ? "animate-pulse" : ""} />
            </div>
            <h1 className={`font-black tracking-tight text-stone-800 uppercase ${isLarge ? 'text-3xl' : 'text-xl'}`}>
                Cortex
            </h1>
        </div>
    );
};

export default CortexLogo;
