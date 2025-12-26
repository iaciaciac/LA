import React, { useState, useEffect } from 'react';
import { FaRunning, FaRegCalendarAlt, FaRoad } from 'react-icons/fa';

const RunStats = () => {
    const [latestRun, setLatestRun] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/running')
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then((data) => {
                if (data && Array.isArray(data) && data.length > 0) {
                    setLatestRun(data[0]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error loading run data:", err);
                setError("Failed to load data");
                setLoading(false);
            });
    }, []);

    // Helper for loading/error/empty states
    const StatusMessage = ({ icon: Icon, text, subtext }) => (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl max-w-sm mx-auto my-12 backdrop-blur-sm border border-gray-100 dark:border-zinc-800 transition-all duration-300 hover:shadow-lg">
            <Icon className="text-3xl mb-3 opacity-50" />
            <div className="font-medium">{text}</div>
            {subtext && <div className="text-xs mt-1 opacity-75">{subtext}</div>}
        </div>
    );

    if (loading) return <StatusMessage icon={FaRunning} text="Loading runs..." className="animate-pulse" />;
    if (error) return <StatusMessage icon={FaRunning} text="Unable to load runs" subtext="Please check connection" />;

    // Empty state
    if (!latestRun) {
        return <StatusMessage icon={FaRunning} text="No recent runs" subtext="Time to hit the road!" />;
    }

    const distanceKm = (latestRun.distance / 1000).toFixed(2);
    // Calculate pace (min/km)
    const paceSeconds = latestRun.moving_time / (latestRun.distance / 1000);
    const paceMin = Math.floor(paceSeconds / 60);
    const paceSec = Math.floor(paceSeconds % 60);
    const pace = `${paceMin}'${paceSec < 10 ? '0' : ''}${paceSec}"`;

    const date = new Date(latestRun.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    return (
        <div className="flex items-center justify-center w-full px-6 md:px-16 lg:px-40 2xl:px-48 my-12">
            <div className="group relative flex flex-col w-full p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-all duration-500">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2 text-[#5CFFA5]">
                        <div className="p-2 bg-[#5CFFA5]/10 dark:bg-[#5CFFA5]/10 rounded-full">
                            <FaRunning className="text-lg" />
                        </div>
                        <span className="text-xs font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500">Latest Run</span>
                    </div>
                    <div className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-zinc-800 px-3 py-1 rounded-full">
                        Nike Run Club
                    </div>
                </div>

                {/* Main Stats */}
                <div className="flex items-baseline space-x-1 mb-6">
                    <span className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white group-hover:text-[#5CFFA5] transition-colors duration-300">
                        {distanceKm}
                    </span>
                    <span className="text-lg font-medium text-gray-400">km</span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center space-x-3">
                        <FaRegCalendarAlt className="text-gray-300" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400">Date</span>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{date}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <FaRoad className="text-gray-300" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider text-gray-400">Pace</span>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{pace} /km</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RunStats;
