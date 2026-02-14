import React, { useRef, useEffect } from 'react';

const LUT_OPTIONS = [
    {
        id: 'original',
        name: 'ORIGINAL',
        color: '#D1D1D1',
        filter: 'none'
    },
    {
        id: 'fuji-cc',
        name: 'FUJI CC',
        color: '#2D5A27',
        // Fuji Classic Chrome often has a slight cyan/green shift in shadows and warm highlights with controlled saturation
        filter: 'contrast(1.1) saturate(0.85) sepia(0.1) hue-rotate(-5deg) brightness(0.95)'
    },
    {
        id: 'eterna',
        name: 'ETERNA',
        color: '#8B4513',
        // Eterna is soft, low contrast, cinematic
        filter: 'contrast(0.85) brightness(1.05) saturate(0.8) sepia(0.05)'
    },
    {
        id: 'leica',
        name: 'LEICA',
        color: '#000000',
        // Leica is high contrast, deep blacks, classic. Also adding a slight grain effect via contrast/brightness.
        filter: 'contrast(1.4) brightness(0.85) saturate(1.2) grayscale(0.25) sepia(0.05)'
    }
];

const LutSelector = ({ activeLut, onSelect }) => {
    const scrollRef = useRef(null);

    // Mechanical sound-like interaction (Visual feedback)
    const handleSelect = (lut) => {
        onSelect(lut);
    };

    return (
        <div className="w-full flex justify-center py-10 z-30 relative pointer-events-auto overflow-hidden">
            {/* Container with a subtle "dial" background feel */}
            <div className="relative flex items-center justify-center">
                <div
                    ref={scrollRef}
                    className="flex items-center gap-8 px-20 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory"
                >
                    {LUT_OPTIONS.map((lut, index) => {
                        const isActive = activeLut?.id === lut.id;

                        return (
                            <button
                                key={lut.id}
                                onClick={() => handleSelect(lut)}
                                className="group flex flex-col items-center gap-3 transition-all duration-300 transform outline-none snap-center"
                            >
                                {/* The "Mechanical Lense" container */}
                                <div
                                    className={`
                    relative w-16 h-16 rounded-full border-[3px] flex items-center justify-center transition-all duration-500 overflow-hidden
                    ${isActive
                                            ? 'scale-110 border-white dark:border-white shadow-[0_0_30px_rgba(255,255,255,0.4),inset_0_0_15px_rgba(0,0,0,0.5)] bg-zinc-200 dark:bg-zinc-800'
                                            : 'border-white/10 dark:border-white/5 hover:border-white/30 grayscale group-hover:grayscale-0 hover:scale-105 bg-black/5 dark:bg-white/5'
                                        }
                  `}
                                >
                                    {/* Outer ring texture */}
                                    <div className="absolute inset-0 opacity-10 pointer-events-none bg-[conic-gradient(from_0deg,transparent_0%,white_50%,transparent_100%)]"></div>

                                    {/* Inner "Lens" element */}
                                    <div
                                        className={`
                      w-6 h-6 rounded-full transition-all duration-500 shadow-xl overflow-hidden relative
                      ${isActive ? 'scale-125' : 'scale-100 opacity-30'}
                    `}
                                        style={{
                                            backgroundColor: lut.color,
                                            boxShadow: isActive ? `0 0 15px ${lut.color}88, inset 0 2px 4px rgba(255,255,255,0.3)` : 'none'
                                        }}
                                    >
                                        {/* Glass reflection */}
                                        <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white/20 blur-[1px]"></div>
                                    </div>
                                </div>

                                {/* Label with technical typography */}
                                <span
                                    className={`
                    text-[10px] font-bold tracking-[0.3em] transition-all duration-500 font-mono uppercase
                    ${isActive
                                            ? 'text-black dark:text-white opacity-100 scale-105'
                                            : 'text-black/30 dark:text-white/20 opacity-40'
                                        }
                  `}
                                >
                                    {lut.name}
                                </span>

                                {/* Selection Dot */}
                                <div className={`w-1 h-1 rounded-full transition-all duration-500 mt-1 ${isActive ? 'bg-red-500 scale-100' : 'bg-transparent scale-0'}`}></div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default LutSelector;
