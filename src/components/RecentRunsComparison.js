import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaRoad, FaStopwatch } from 'react-icons/fa';

const ComparisonCard = ({ title, icon: Icon, color, data, formatValue, suffix, unit }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));

    // For pace, lower is "taller" conceptually? Usually consistent charts are better. 
    // Let's keep taller = higher value for all, but for pace "higher value" means slower.
    // Maybe we invert pace? Or just show it as is. 
    // Standard: Bar height = value. User understands higher bar = more minutes.

    // Calculate range for dynamic scaling, but keeping 0 as baseline for Distance/HR is better.
    // For Pace, 0 baseline is fine.

    return (
        <div className="bg-white dark:bg-zinc-900/50 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800 flex flex-col h-full shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-full ${color.bg} ${color.text}`}>
                        <Icon className="text-sm" />
                    </div>
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</span>
                </div>
                {unit && <span className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-zinc-800 px-2 py-1 rounded-full">{unit}</span>}
            </div>

            <div className="flex items-end justify-between h-40 gap-2 relative">
                {/* Average Line or Guide lines could go here */}

                {data.map((item, i) => {
                    const heightPercentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                    const isHovered = hoveredIndex === i;

                    return (
                        <div
                            key={i}
                            className="relative flex-1 flex flex-col items-center justify-end group h-full"
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            {/* Value Tooltip */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: isHovered || i === data.length - 1 ? 1 : 0, y: isHovered || i === data.length - 1 ? 0 : 10 }}
                                className={`absolute -top-8 w-max z-10 ${isHovered ? 'opacity-100' : 'opacity-0'} pointer-events-none transition-opacity duration-200`}
                            >
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${color.bg} ${color.text}`}>
                                    {formatValue(item.value)}
                                </span>
                            </motion.div>

                            {/* Bar */}
                            <motion.div
                                className={`w-full max-w-[12px] rounded-full ${color.bar} ${isHovered ? 'ring-2 ring-offset-2 dark:ring-offset-black ' + color.ring : 'opacity-70'}`}
                                style={{ height: `${heightPercentage}%`, minHeight: '4px' }}
                                layoutId={title + i}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />

                            {/* Date Label */}
                            <div className="mt-2 text-[9px] text-gray-400 font-medium">
                                {item.date}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-between mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800/50">
                <div className="text-xs text-gray-400">Avg</div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">
                    {formatValue(data.reduce((a, b) => a + b.value, 0) / data.length)}
                    {suffix && <span className="text-gray-400 font-normal ml-0.5">{suffix}</span>}
                </div>
            </div>
        </div>
    );
};

const RecentRunsComparison = ({ runs }) => {
    if (!runs || runs.length === 0) return null;

    // Take top 10 and reverse for chronological order
    const comparisonData = runs.slice(0, 10).reverse().map(run => {
        const date = new Date(run.start_date);
        const distKm = run.distance / 1000;
        const durationMin = run.moving_time / 60;
        const paceVal = distKm > 0 ? (run.moving_time / 60) / distKm : 0; // min/km

        return {
            id: run.id,
            date: `${date.getMonth() + 1}/${date.getDate()}`,
            distance: distKm,
            pace: paceVal,
            heartRate: run.average_heartrate || 0
        };
    });

    // Formatting helpers
    const formatPace = (val) => {
        const min = Math.floor(val);
        const sec = Math.floor((val - min) * 60);
        return `${min}'${sec < 10 ? '0' : ''}${sec}"`;
    };

    const formatDistance = (val) => val.toFixed(2);
    const formatHR = (val) => Math.round(val);

    return (
        <section className="px-6 py-12 bg-[#F5F5F7] dark:bg-black">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8 px-2">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Analysis</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Comparisons of your last {comparisonData.length} runs</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ComparisonCard
                        title="Pace"
                        icon={FaStopwatch}
                        unit="/km"
                        formatValue={formatPace}
                        data={comparisonData.map(d => ({ value: d.pace, date: d.date }))}
                        color={{
                            bg: "bg-cyan-500/10",
                            text: "text-cyan-500",
                            bar: "bg-cyan-500",
                            ring: "ring-cyan-500"
                        }}
                    />
                    <ComparisonCard
                        title="Heart Rate"
                        icon={FaHeart}
                        unit="bpm"
                        suffix="bpm"
                        formatValue={formatHR}
                        data={comparisonData.map(d => ({ value: d.heartRate, date: d.date }))}
                        color={{
                            bg: "bg-red-500/10",
                            text: "text-red-500",
                            bar: "bg-red-500",
                            ring: "ring-red-500"
                        }}
                    />
                    <ComparisonCard
                        title="Distance"
                        icon={FaRoad}
                        unit="km"
                        suffix="km"
                        formatValue={formatDistance}
                        data={comparisonData.map(d => ({ value: d.distance, date: d.date }))}
                        color={{
                            bg: "bg-green-500/10",
                            text: "text-green-500",
                            bar: "bg-green-500",
                            ring: "ring-green-500"
                        }}
                    />
                </div>
            </div>
        </section>
    );
};

export default RecentRunsComparison;
