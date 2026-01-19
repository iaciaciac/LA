import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Navbar from './components/Navbar';
import { FaRunning, FaRegCalendarAlt, FaRoad, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import SeasonSummary from './components/SeasonSummary';
import ScrollAnimation from './components/ScrollAnimation';

const RunMap = dynamic(() => import('./components/RunMap'), {
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
                        name: rawRun.title,
                        start_date: rawRun.date, // Full ISO String
                        distance: parseFloat(rawRun.distance_km) * 1000,
                        moving_time: moving_time,
                        type: 'Run',
                        source: 'NRC',
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
                label: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
                runs: []
            };
        }
        acc[monthKey].runs.push(run);
        return acc;
    }, {});

    const sortedmonths = Object.values(runsByMonth).sort((a, b) => b.date - a.date);

    if (loading) return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-black text-black dark:text-white font-sans flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-black text-black dark:text-white font-sans selection:bg-blue-500/30">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 pt-24 pb-20">
                <div className="flex items-center space-x-4 mb-8">
                    <Link href="/cai_run" className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <FaArrowLeft />
                    </Link>
                    <h1 className="text-3xl font-black tracking-tight">{filterYear ? `${filterYear} Archive` : 'All Runs'}</h1>
                </div>

                <div className="space-y-12">
                    {sortedmonths.map((month) => (
                        <section key={month.label}>
                            <div className="sticky top-20 z-10 bg-[#F2F2F7]/95 dark:bg-black/95 backdrop-blur-md py-4 mb-4 border-b border-gray-200 dark:border-zinc-800">
                                <h2 className="text-xl font-bold">{month.label}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {month.runs.map((run, index) => {
                                    const distanceKm = (run.distance / 1000).toFixed(2);
                                    const pace = formatPace(run.distance, run.moving_time);
                                    const date = new Date(run.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

                                    return (
                                        <motion.div
                                            key={run.id}
                                            layoutId={run.id}
                                            onClick={() => setSelectedRun(run)}
                                            className="bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col min-h-[320px]"
                                        >
                                            <div className="p-6 pb-2">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-2 text-[#5CFFA5]">
                                                        <div className="p-2 bg-[#5CFFA5]/10 rounded-full"><FaRunning className="text-xs" /></div>
                                                        <span className="text-[10px] uppercase font-bold text-gray-400">Run</span>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {run.source || 'NRC'}
                                                    </span>
                                                </div>
                                                <div className="flex items-baseline space-x-1">
                                                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{distanceKm}</span>
                                                    <span className="text-xs font-bold text-gray-400 uppercase">km</span>
                                                </div>
                                            </div>

                                            <div className="w-full h-40 relative bg-gray-50 dark:bg-zinc-800/50 mt-2 mb-2">
                                                {run.map?.summary_polyline ? (
                                                    <RunMap summaryPolyline={run.map.summary_polyline} className="w-full h-full" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <FaRoad className="text-2xl opacity-20" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-6 pt-2 mt-auto grid grid-cols-2 gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase text-gray-400 mb-0.5">Time</span>
                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{formatDuration(run.moving_time)}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase text-gray-400 mb-0.5">Pace</span>
                                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{pace} /km</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Selected Run Modal (Premium Style) */}
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
                                            <span className="text-xs font-bold tracking-widest uppercase">Run Details</span>
                                        </div>
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                                            {new Date(selectedRun.start_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                                            {new Date(selectedRun.start_date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}  • {selectedRun.name}
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
                                            <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">Calories</div>
                                            <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {Math.round((selectedRun.distance / 1000) * 65)} <span className="text-lg text-gray-500 font-medium">kcal</span>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Footer / Branding */}
                                    <div className="mt-auto pt-10">
                                        <div className="flex items-center justify-between opacity-50">
                                            <div className="flex items-center space-x-2">
                                                <span className="h-px w-8 bg-gray-300 dark:bg-zinc-700"></span>
                                                <span className="text-xs text-gray-400 uppercase tracking-wider">Fitness+</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
