import React from 'react';
import { FaFire, FaTrophy, FaStopwatch, FaRunning, FaHeart, FaBolt } from 'react-icons/fa';

const SeasonSummary = ({ stats, year }) => {
    if (!stats) return null;

    const items = [
        {
            label: "Total Distance",
            value: stats.totalDistance,
            unit: "km",
            icon: FaRunning,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            bg: "bg-blue-500/10"
        },
        {
            label: "Total Runs",
            value: stats.totalRuns,
            unit: "runs",
            icon: FaBolt,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10",
            bg: "bg-yellow-500/10"
        },
        {
            label: "Avg Pace",
            value: stats.avgPace,
            unit: "/km",
            icon: FaStopwatch,
            color: "text-cyan-500", // Neon cyan
            bg: "bg-cyan-500/10",
            bg: "bg-cyan-500/10"
        },
        {
            label: "Longest Run",
            value: stats.longestRun,
            unit: "km",
            icon: FaTrophy,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            bg: "bg-purple-500/10"
        },
        {
            label: "Total Time",
            value: stats.totalDuration,
            unit: "hrs",
            icon: FaStopwatch, // Reusing stopwatch or different icon like FaClock? FaStopwatch is fine.
            color: "text-green-500",
            bg: "bg-green-500/10",
            bg: "bg-green-500/10"
        },
        {
            label: "Calories",
            value: stats.totalCalories,
            unit: "kcal",
            icon: FaFire,
            color: "text-red-500",
            bg: "bg-red-500/10",
            bg: "bg-red-500/10"
        }
    ];

    return (
        <div className="py-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl bg-white dark:bg-zinc-900 flex items-center space-x-4`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.bg} ${item.color}`}>
                            <item.icon className="text-lg" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{item.label}</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {item.value} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">{item.unit}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SeasonSummary;
