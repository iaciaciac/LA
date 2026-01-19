import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Navbar from './components/Navbar';
import { FaRunning, FaRegCalendarAlt, FaRoad, FaArrowLeft } from 'react-icons/fa';
// import runData from '../data/nike_runs_transformed.json'; // REMOVED
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

    if (loading) return null;

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

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {month.runs.map(run => (
                                    <motion.div
                                        key={run.id}
                                        layoutId={run.id}
                                        onClick={() => setSelectedRun(run)}
                                        className="bg-white dark:bg-[#1C1C1E] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div className="h-40 relative bg-gray-100 dark:bg-zinc-800">
                                            {run.map?.summary_polyline ? (
                                                <RunMap summaryPolyline={run.map.summary_polyline} className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <FaRoad className="text-2xl opacity-20" />
                                                </div>
                                            )}

                                            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold">
                                                {formatDuration(run.moving_time)}
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-sm line-clamp-1">{run.name}</h3>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(run.start_date).getDate()}日
                                                </span>
                                            </div>

                                            <div className="flex items-baseline space-x-1">
                                                <span className="text-2xl font-black tabular-nums">{(run.distance / 1000).toFixed(2)}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">km</span>
                                            </div>

                                            <div className="mt-2 text-xs font-medium text-gray-500">
                                                {formatPace(run.distance, run.moving_time)} /km
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* Selected Run Modal */}
                <AnimatePresence>
                    {selectedRun && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
                            onClick={() => setSelectedRun(null)}
                        >
                            <motion.div
                                layoutId={selectedRun.id}
                                className="bg-white dark:bg-[#1C1C1E] w-full max-w-lg rounded-[2.5rem] overflow-hidden"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="h-80 relative bg-gray-100 dark:bg-zinc-800">
                                    {selectedRun.map?.summary_polyline && (
                                        <RunMap summaryPolyline={selectedRun.map.summary_polyline} className="w-full h-full" />
                                    )}
                                    <button
                                        onClick={() => setSelectedRun(null)}
                                        className="absolute top-6 right-6 w-10 h-10 bg-black/50 backdrop-blur text-white rounded-full flex items-center justify-center font-bold"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="p-8">
                                    <h2 className="text-2xl font-black mb-1">{selectedRun.name}</h2>
                                    <p className="text-gray-500 font-medium mb-8">
                                        {new Date(selectedRun.start_date).toLocaleString('default', {
                                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>

                                    <div className="grid grid-cols-3 gap-8">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Distance</span>
                                            <span className="text-3xl font-black tabular-nums">
                                                {(selectedRun.distance / 1000).toFixed(2)}
                                                <span className="text-lg text-gray-400 font-bold ml-1">km</span>
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pace</span>
                                            <span className="text-3xl font-black tabular-nums">
                                                {formatPace(selectedRun.distance, selectedRun.moving_time)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Time</span>
                                            <span className="text-3xl font-black tabular-nums">
                                                {formatDuration(selectedRun.moving_time)}
                                            </span>
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
