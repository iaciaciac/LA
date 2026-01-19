import React from 'react';

const StickyHeader = ({ yearTotal = '0.00', runCount = 0 }) => {
    const [currentDateTime, setCurrentDateTime] = React.useState({ date: '', time: '' });

    React.useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentDateTime({
                date: now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
            });
        };

        updateTime();
        // Update every minute to keep clock accurate
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    const { date: dateStr, time: timeStr } = currentDateTime;

    return (
        <div className="sticky top-0 mt-[44px] z-40 w-full border-b border-gray-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-black/70 backdrop-blur-[20px] backdrop-saturate-[180%] transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-6 md:px-12 h-[52px] flex items-center justify-between">
                {/* Left: Branding */}
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                    {dateStr} {timeStr} You have run <span style={{ color: '#AAFB00' }}>{yearTotal}km</span>
                </span>

                {/* Right: CTA or Tagline (optional, mimicking Apple's 'Try it free' or similar) */}
                <div className="hidden md:flex items-center space-x-4">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Total Runs
                    </span>
                    <button className="text-xs font-semibold bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity">
                        {runCount}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StickyHeader;
