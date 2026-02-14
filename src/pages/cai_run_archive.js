import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { FaRunning, FaRegCalendarAlt, FaRoad, FaArrowLeft } from 'react-icons/fa';
// import runData from '../data/nike_runs_transformed.json'; // REMOVED
import Link from 'next/link';
import SeasonSummary from '../components/SeasonSummary';
import ScrollAnimation from '../components/ScrollAnimation';
const RunMap = dynamic(() => import('../components/RunMap'), {
    loading: () => <div className="w-full h-full bg-gray-100 dark:bg-zinc-800 animate-pulse" />,
    ssr: false
});

export default function CaiRunArchive() {
    const router = useRouter();
    const { year } = router.query;
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterYear, setFilterYear] = useState(null);
    const [selectedRun, setSelectedRun] = useState(null);

    useEffect(() => {
        if (router.isReady && year) {
            setFilterYear(parseInt(year));
        }
    }, [router.isReady, year]);

    useEffect(() => {
        setLoading(true);

        const fetchData = async () => {
            try {
                // 1. Fetch Dynamic Data ONLY
                const response = await fetch('/data/nike_runs_final.json');
                const dynamicData = await response.json();

                const processedRuns = dynamicData.map(rawRun => {
                    let moving_time = 0;
                    if (rawRun.duration_str) {
                        const parts = rawRun.duration_str.split(':').map(Number);
                        if (parts.length === 3) moving_time = parts[0] * 3600 + parts[1] * 60 + parts[2];
                        else if (parts.length === 2) moving_time = parts[0] * 60 + parts[1];
                    }

                    return {
                        id: rawRun.id,
                        name: (() => {
                            const dateObj = new Date(rawRun.date);
                            const hours = dateObj.getHours();
                            let timeOfDay = 'Morning';
                            if (hours >= 12 && hours < 17) timeOfDay = 'Afternoon';
                            else if (hours >= 17 && hours < 21) timeOfDay = 'Evening';
                            else if (hours >= 21 || hours < 4) timeOfDay = 'Night';
                            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
                            return `${dayName} ${timeOfDay} Run`;
                        })(),
                        start_date: rawRun.date, // Full ISO String
                        distance: parseFloat(rawRun.distance_km) * 1000,
                        moving_time: moving_time,
                        moving_time: moving_time,
                        type: 'Run',
                        source: 'NRC',
                        average_heartrate: (() => {
                            // Try top level first
                            if (rawRun.average_heartrate) return rawRun.average_heartrate;
                            // Try summaries
                            if (rawRun.summaries) {
                                const hr = rawRun.summaries.find(s => s.metric === 'heart_rate' && s.summary === 'mean');
                                if (hr) return hr.value;
                            }
                            return null;
                        })(),
                        average_cadence: (() => {
                            if (rawRun.summaries) {
                                const steps = rawRun.summaries.find(s => s.metric === 'steps' && s.summary === 'total');
                                if (steps && moving_time > 0) {
                                    return Math.round(steps.value / (moving_time / 60));
                                }
                            }
                            return null;
                        })(),
                        map: rawRun.map || null
                    };
                });

                // Sort by date descending
                processedRuns.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

                setRuns(processedRuns);
                setLoading(false);

            } catch (err) {
                console.error("Error loading archive data:", err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatPace = (dist, time) => {
        if (!dist || dist === 0) return "0'00\"";
        const distKm = dist / 1000;
        const paceSeconds = time / distKm;
        const m = Math.floor(paceSeconds / 60);
        const s = Math.floor(paceSeconds % 60);
        return `${m}'${s.toString().padStart(2, '0')}"`;
    };

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const filteredRuns = filterYear
        ? runs.filter(r => new Date(r.start_date).getFullYear() === filterYear)
        : runs;

    // Group by Month for archive view
    const runsByMonth = filteredRuns.reduce((acc, run) => {
        const d = new Date(run.start_date);
        const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
        if (!acc[monthKey]) {
            acc[monthKey] = {
                date: d,
                label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
                runs: []
            };
        }
        acc[monthKey].runs.push(run);
        return acc;
    }, {});

    const sortedmonths = Object.values(runsByMonth).sort((a, b) => b.date - a.date);

    // Calculate unique years from data
    const availableYears = [...new Set(runs.map(r => new Date(r.start_date).getFullYear()))].sort((a, b) => b - a);

    if (loading) return null;

    return (
        <div className="min-h-screen bg-[#F5F5F7] dark:bg-black transition-colors duration-500 font-sans">
            <Navbar />

            {/* Apple Store Style Header */}
            <div className="pt-24 pb-8 sticky top-0 z-10 bg-[#F5F5F7]/90 dark:bg-black/90 backdrop-blur-xl transition-colors duration-500">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
                    <div className="flex flex-col md:flex-row md:items-baseline md:gap-4">
                        <h1 className="text-4xl md:text-[48px] font-bold text-gray-500 dark:text-gray-400 tracking-tight">
                            Runs.
                        </h1>
                        <h1 className="text-4xl md:text-[48px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
                            {filterYear ? `${filterYear} Archive.` : 'All Runs.'}
                        </h1>
                    </div>
                </div>

                {/* Year Navigation Pill - Apple Store Style */}
                {availableYears.length > 0 && (
                    <div className="mt-6 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20">
                        <div className="relative group max-w-max">
                            <div className="overflow-hidden rounded-full ring-1 ring-black/5 dark:ring-white/10">
                                <div className="flex items-center overflow-x-auto no-scrollbar scroll-smooth" role="tablist">
                                    <div className="flex space-x-1 p-1 bg-gray-100 dark:bg-zinc-900/50 backdrop-blur-xl">
                                        {availableYears.map((y) => (
                                            <div key={y} className="flex-shrink-0" role="presentation">
                                                <Link
                                                    href={`/cai_run_archive?year=${y}`}
                                                    className={`inline-block px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${filterYear === y
                                                        ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm'
                                                        : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white hover:shadow-sm'
                                                        }`}
                                                    role="tab"
                                                >
                                                    {y}
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <main className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-20 pb-20">

                <div className="space-y-8">
                    {/* Season Summary Card */}
                    {filterYear && runs.length > 0 && (
                        <div className="hover:scale-[1.01] transition-transform duration-300 ease-out">
                            <SeasonSummary
                                year={filterYear}
                                stats={(() => {
                                    const totalDistance = filteredRuns.reduce((sum, r) => sum + (r.distance / 1000), 0).toFixed(2);
                                    const totalRuns = filteredRuns.length;
                                    const totalSeconds = filteredRuns.reduce((sum, r) => sum + r.moving_time, 0);
                                    const totalHours = Math.floor(totalSeconds / 3600);
                                    const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
                                    const totalDuration = `${totalHours}h ${totalMinutes}m`;

                                    const avgPaceSeconds = totalSeconds / (totalDistance > 0 ? parseFloat(totalDistance) : 1);
                                    const avgPaceMin = Math.floor(avgPaceSeconds / 60);
                                    const avgPaceSec = Math.floor(avgPaceSeconds % 60);
                                    const avgPace = `${avgPaceMin}'${avgPaceSec < 10 ? '0' : ''}${avgPaceSec}"`;

                                    const longestRunVal = filteredRuns.length > 0 ? Math.max(...filteredRuns.map(r => r.distance / 1000)).toFixed(2) : '0.00';
                                    const totalCalories = Math.round(totalDistance * 65);

                                    return {
                                        totalDistance,
                                        totalRuns,
                                        avgPace,
                                        totalDuration,
                                        longestRun: longestRunVal,
                                        totalCalories
                                    };
                                })()}
                            />
                        </div>
                    )}

                    <div className="space-y-12">
                        {sortedmonths.map((month) => {
                            const monthDate = month.date;
                            const monthKey = `month-${monthDate.getFullYear()}-${monthDate.getMonth()}`;
                            return (
                                <section key={month.label} id={monthKey}>
                                    {/* Month header removed per user request */}

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:gap-8 gap-6">
                                        {month.runs.map(run => (
                                            <motion.div
                                                key={run.id}
                                                layoutId={run.id}
                                                onClick={() => setSelectedRun(run)}
                                                className="bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ease-out cursor-pointer group"
                                            >
                                                <div className="h-40 relative bg-gray-100 dark:bg-zinc-800">
                                                    {run.map?.summary_polyline ? (
                                                        <RunMap summaryPolyline={run.map.summary_polyline} className="w-full h-full" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <FaRoad className="text-2xl opacity-20" />
                                                        </div>
                                                    )}


                                                </div>

                                                <div className="p-5">
                                                    <div className="flex justify-between items-start mb-4">
                                                        {/* Top Left: Distance */}
                                                        <div>
                                                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">距离</div>
                                                            <div className="flex items-baseline space-x-1">
                                                                <h3 className="font-medium text-sm" style={{ fontFamily: 'Minecart LCD' }}>{(run.distance / 1000).toFixed(2)}</h3>
                                                                <span className="text-[10px] text-gray-700 dark:text-gray-300" style={{ fontFamily: 'Minecart LCD' }}>km</span>
                                                            </div>
                                                        </div>

                                                        {/* Top Right: Avg Pace */}
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">平均配速</div>
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300" style={{ fontFamily: 'Minecart LCD' }}>
                                                                {formatPace(run.distance, run.moving_time)}<span className="text-[10px] ml-1" style={{ fontFamily: 'Minecart LCD' }}>/km</span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-end justify-between">
                                                        {/* Bottom Left: Duration (Time) */}
                                                        <div>
                                                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">用时</div>
                                                            <span className="text-sm font-medium tabular-nums text-gray-900 dark:text-white" style={{ fontFamily: 'Minecart LCD' }}>
                                                                {formatDuration(run.moving_time)}
                                                            </span>
                                                        </div>

                                                        {/* Bottom Right: Avg Heart Rate */}
                                                        <div className="text-right mb-1">
                                                            <div className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">平均心率</div>
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300" style={{ fontFamily: 'Minecart LCD' }}>
                                                                {run.average_heartrate ? Math.round(run.average_heartrate) : '--'}<span className="text-[10px] ml-1" style={{ fontFamily: 'Minecart LCD' }}>bpm</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>

                    {/* Selected Run Modal - Apple Fitness+ Style */}
                    <AnimatePresence>
                        {selectedRun && (
                            <motion.div
                                key="modal-container"
                                className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {/* Backdrop */}
                                <div
                                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                                    onClick={() => setSelectedRun(null)}
                                />

                                {/* Modal Content */}
                                <motion.div
                                    key="modal-content"
                                    initial="hidden"
                                    animate="visible"
                                    exit="hidden"
                                    variants={{
                                        hidden: { y: 100, opacity: 0 },
                                        visible: {
                                            y: 0,
                                            opacity: 1,
                                            transition: {
                                                ease: 'easeOut',
                                                duration: 0.5,
                                                staggerChildren: 0.1,
                                                delayChildren: 0.2
                                            }
                                        }
                                    }}
                                    className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
                                >
                                    {/* Map Section - Half width on desktop */}
                                    <motion.div
                                        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                        className="w-full md:w-3/5 h-[40vh] md:h-auto bg-gray-100 dark:bg-zinc-800 relative"
                                    >
                                        <RunMap
                                            key={selectedRun.id} // Force re-render for map resize
                                            summaryPolyline={selectedRun.map?.summary_polyline}
                                            className="w-full h-full"
                                        />
                                        {/* Close button for mobile overlay */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedRun(null); }}
                                            className="md:hidden absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md z-10"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </motion.div>

                                    {/* Details Section */}
                                    <div className="w-full md:w-2/5 p-8 flex flex-col overflow-y-auto bg-white dark:bg-zinc-900">
                                        {/* Desktop Close Button */}
                                        <div className="hidden md:flex justify-end mb-4">
                                            <button
                                                onClick={() => setSelectedRun(null)}
                                                className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </div>

                                        {/* Header Info */}
                                        <motion.div
                                            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                                            className="mb-8"
                                        >
                                            <div className="flex items-center space-x-2 text-[#5CFFA5] mb-2">
                                                <FaRunning className="text-lg" />
                                                <span className="text-xs font-bold tracking-widest uppercase">Recent Activity</span>
                                            </div>
                                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {new Date(selectedRun.start_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                                {new Date(selectedRun.start_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}  • {selectedRun.name}
                                            </p>
                                        </motion.div>

                                        {/* Stat Grid */}
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-10">
                                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                                <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Distance</div>
                                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                                    {(selectedRun.distance / 1000).toFixed(2)} <span className="text-lg text-gray-500 font-medium">km</span>
                                                </div>
                                            </motion.div>
                                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col justify-center pl-8 border-l border-gray-100 dark:border-zinc-800">
                                                <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Pace</div>
                                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                                    {formatPace(selectedRun.distance, selectedRun.moving_time)} <span className="text-lg text-gray-500 font-medium">/km</span>
                                                </div>
                                            </motion.div>
                                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                                <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Time</div>
                                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                                    {Math.floor(selectedRun.moving_time / 60)} <span className="text-lg text-gray-500 font-medium">min</span>
                                                </div>
                                            </motion.div>
                                            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col justify-center pl-8 border-l border-gray-100 dark:border-zinc-800">
                                                <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Cadence</div>
                                                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                                    {selectedRun.average_cadence ? selectedRun.average_cadence : '--'} <span className="text-lg text-gray-500 font-medium">spm</span>
                                                </div>
                                            </motion.div>
                                            {selectedRun.average_heartrate && (
                                                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="col-span-2 pt-6 border-t border-gray-100 dark:border-zinc-800">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="p-2 bg-red-500/10 rounded-full text-red-500">
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs text-gray-400 uppercase tracking-wider">Avg Heart Rate</div>
                                                            <div className="text-xl font-bold text-gray-900 dark:text-white">{Math.round(selectedRun.average_heartrate)} <span className="text-sm font-normal text-gray-500">bpm</span></div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Footer / Branding */}
                                        <div className="mt-auto pt-10">
                                            <div className="flex items-center justify-between opacity-50">
                                                <div className="flex items-center space-x-2">
                                                    <span className="h-px w-8 bg-gray-300 dark:bg-zinc-700"></span>
                                                    <span className="text-xs text-gray-400 uppercase tracking-wider">CAICAI</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main >
        </div >
    );
}
