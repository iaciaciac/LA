import React, { useState, useRef, useEffect } from 'react';

const TimelineScrubber = ({ startDate, endDate, onScrub, className }) => {
    const [hoverDate, setHoverDate] = useState(null);
    const [isHovering, setIsHovering] = useState(false);
    const containerRef = useRef(null);

    // Generate years for visual markers
    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();
    const years = [];
    for (let y = endYear; y >= startYear; y--) {
        years.push(y);
    }

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;

        // Calculate percentage (0% at top -> latest date, 100% at bottom -> oldest date)
        const percentage = Math.max(0, Math.min(1, y / height));

        // Map percentage to date range
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();
        const timeSpan = end - start;
        const targetTime = end - (percentage * timeSpan); // Latest at top

        const date = new Date(targetTime);
        setHoverDate(date);
    };

    const handleClick = () => {
        if (hoverDate) {
            onScrub(hoverDate);
        }
    };

    return (
        <div
            className={`fixed top-24 bottom-24 right-2 z-50 flex flex-col items-end pointer-events-none ${className}`}
        >
            <div
                ref={containerRef}
                className="h-full w-8 flex flex-col items-center pointer-events-auto cursor-pointer group"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => { setIsHovering(false); setHoverDate(null); }}
                onMouseMove={handleMouseMove}
                onClick={handleClick}
            >
                {/* Visual Track */}
                <div className="absolute top-0 bottom-0 w-1 bg-gray-200 dark:bg-zinc-800 rounded-full group-hover:bg-gray-300 dark:group-hover:bg-zinc-700 transition-colors" />

                {/* Year Markers */}
                <div className="flex flex-col justify-between h-full py-2 w-full items-center z-10">
                    {years.map(year => (
                        <div key={year} className="flex flex-col items-center">
                            <div className="w-2 h-0.5 bg-gray-400 dark:bg-zinc-500 mb-1" />
                            {/* Only show years when NOT interacting to avoid clutter */}
                            <span className={`text-[10px] font-medium text-gray-400 dark:text-gray-500 transition-opacity duration-200 ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
                                {year}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Popup Label */}
                {isHovering && hoverDate && (
                    <div
                        className="absolute right-10 bg-black/90 text-white px-3 py-2 rounded-lg shadow-xl text-sm font-bold whitespace-nowrap backdrop-blur-md transform -translate-y-1/2 pointer-events-none"
                        style={{
                            top: `${((new Date(endDate).getTime() - hoverDate.getTime()) / (new Date(endDate).getTime() - new Date(startDate).getTime())) * 100}%`
                        }}
                    >
                        {hoverDate.getFullYear()}年 {hoverDate.getMonth() + 1}月
                        <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-l-[6px] border-l-black/90 border-b-[6px] border-b-transparent" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimelineScrubber;
