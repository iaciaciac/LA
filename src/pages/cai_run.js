import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from './components/Navbar';
import StickyHeader from './components/StickyHeader';
import ScrollAnimation from './components/ScrollAnimation';
import useScrollRestoration from '../hooks/useScrollRestoration';
import { FaRunning, FaRegCalendarAlt, FaRoad, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import runData from '../data/nike_runs_transformed.json';
import SeasonSummary from './components/SeasonSummary';
import ProfessionalAnalysis from './components/ProfessionalAnalysis';
import GlobalHeatmap from './components/GlobalHeatmap';
import { animate } from "framer-motion";

const AnimatedNumber = ({ value }) => {
    const ref = useRef(null);

    useEffect(() => {
        const controls = animate(0, value, {
            duration: 2,
            ease: "easeOut",
            onUpdate: (latest) => {
                if (ref.current) {
                    ref.current.textContent = latest.toFixed(2);
                }
            },
        });
        return () => controls.stop();
    }, [value]);

    return <span ref={ref} className="tabular-nums">0.00</span>;
};

const RunMap = dynamic(() => import('./components/RunMap'), {
    loading: () => <div className="w-full h-32 bg-gray-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />,
    ssr: false
});

function CaiRun() {
    const [latestRun, setLatestRun] = useState(null);
    const [selectedRun, setSelectedRun] = useState(null); // State for popup modal
    const [runs, setRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [animateRing, setAnimateRing] = useState(false);
    // Initialize calendar with the month of the latest run, or current date if no runs
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        setLoading(true);

        const fetchData = async () => {
            try {
                // 1. Fetch Dynamic Data (Real-time source)
                const response = await fetch('/data/nike_runs_final.json');
                const dynamicData = await response.json();

                // 2. Fetch Strava Data (API)
                let stravaData = [];
                try {
                    const stravaRes = await fetch('/api/running');
                    if (stravaRes.ok) {
                        stravaData = await stravaRes.json();
                    }
                } catch (e) {
                    console.log("Strava API fetch failed, skipping...");
                }

                // 3. Process & Merge Data
                // Map of combined runs using ID or Time as key
                const runMap = new Map();
                const TIME_WINDOW_MS = 60 * 1000; // 1 minute window for fuzzy matching

                // A. Process Dynamic NRC Data first
                dynamicData.forEach(rawRun => {
                    // Adapt fields from final.json structure to app structure
                    // rawRun: { id, date, distance_km, duration_str, pace, title ... }

                    // Parse duration "MM:SS" or "HH:MM:SS" to seconds
                    let moving_time = 0;
                    if (rawRun.duration_str) {
                        const parts = rawRun.duration_str.split(':').map(Number);
                        if (parts.length === 3) moving_time = parts[0] * 3600 + parts[1] * 60 + parts[2];
                        else if (parts.length === 2) moving_time = parts[0] * 60 + parts[1];
                    }

                    // Extract Heart Rate from summaries
                    let heart_rate = 0;
                    let steps = 0;
                    if (rawRun.summaries) {
                        const hrSummary = rawRun.summaries.find(s => s.metric === 'heart_rate' && s.summary === 'mean');
                        if (hrSummary) heart_rate = hrSummary.value;

                        const stepsSummary = rawRun.summaries.find(s => s.metric === 'steps' && s.summary === 'total');
                        if (stepsSummary) steps = stepsSummary.value;
                    }

                    // Look up static map data
                    // We try to find a run in static `runData` with same ID
                    const staticMatch = runData.find(r => r.id === rawRun.id);

                    const run = {
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
                        start_date: new Date(rawRun.date).toISOString(), // Append time? rawRun.date is YYYY-MM-DD
                        distance: parseFloat(rawRun.distance_km) * 1000,
                        moving_time: moving_time,
                        average_heartrate: heart_rate,
                        steps: steps,
                        type: 'Run',
                        source: 'NRC',
                        map: rawRun.map || staticMatch?.map || null // Use dynamic map if available, otherwise hydrate from static
                    };

                    // Fix start_date time component if available in static match (otherwise it defaults to 00:00:00)
                    if (staticMatch) {
                        run.start_date = staticMatch.start_date;
                    }

                    const time = new Date(run.start_date).getTime();
                    run.sortByTime = time;
                    runMap.set(time, run);
                });

                // B. Merge Strava Data
                const apiRuns = Array.isArray(stravaData) ? stravaData : [];
                apiRuns.forEach(run => {
                    const apiTime = new Date(run.start_date).getTime();

                    // Fuzzy match existing NRC run
                    let matchKey = null;
                    for (const [key, val] of runMap.entries()) {
                        if (Math.abs(key - apiTime) < TIME_WINDOW_MS) {
                            matchKey = key;
                            break;
                        }
                    }

                    if (matchKey) {
                        const existing = runMap.get(matchKey);
                        // Update stats from Strava but keep Map if it exists (Strava usually has map too)
                        runMap.set(matchKey, {
                            ...run,
                            source: 'NRC',
                            map: (run.map && run.map.summary_polyline) ? run.map : existing.map
                        });
                    } else {
                        // New run from Strava
                        run.sortByTime = apiTime;
                        run.source = 'Strava';
                        runMap.set(apiTime, run);
                    }
                });

                const combinedRuns = Array.from(runMap.values()).sort((a, b) =>
                    b.sortByTime - a.sortByTime
                );

                if (combinedRuns.length > 0) {
                    setLatestRun(combinedRuns[0]);
                    setRuns(combinedRuns);
                    setCalendarDate(new Date(combinedRuns[0].start_date));
                    // Check query params for selected run ID after data load
                    const urlParams = new URLSearchParams(window.location.search);
                    const runId = urlParams.get('runId');
                    if (runId) {
                        const runToSelect = combinedRuns.find(r => r.id === runId);
                        if (runToSelect) setSelectedRun(runToSelect);
                    }
                }
                setLoading(false);

            } catch (err) {
                console.error("Error loading hybrid run data:", err);
                // Fallback to purely static data if fetch completely fails
                if (runData && runData.length > 0) {
                    setLatestRun(runData[0]);
                    setRuns(runData);
                    setCalendarDate(new Date(runData[0].start_date));
                }
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Trigger ring animation after data is loaded with a small delay
    useEffect(() => {
        if (latestRun) {
            const timer = setTimeout(() => {
                setAnimateRing(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [latestRun]);

    // Manual scroll restoration
    useScrollRestoration(loading);

    // Initialize data loading
    // Calculate derived values with safety checks for null latestRun
    const distanceKm = latestRun ? (latestRun.distance / 1000).toFixed(2) : '0.00';
    const paceSeconds = latestRun && latestRun.distance > 0 ? latestRun.moving_time / (latestRun.distance / 1000) : 0;
    const paceMin = Math.floor(paceSeconds / 60);
    const paceSec = Math.floor(paceSeconds % 60);
    const pace = `${paceMin}'${paceSec < 10 ? '0' : ''}${paceSec}"`;
    const durationMin = latestRun ? Math.floor(latestRun.moving_time / 60) : 0;

    // Filter runs for the latest week
    const recentRuns = runs.length > 0 ? (() => {
        const sorted = [...runs].sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
        const latest = new Date(sorted[0].start_date);
        const oneWeekAgo = new Date(latest);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return sorted.filter(r => new Date(r.start_date) >= oneWeekAgo);
    })() : [];

    // Calculate total distance and count for 2026
    const runs2026 = runs.filter(r => new Date(r.start_date).getFullYear() === 2026);
    const totalDistance2026 = runs2026
        .reduce((sum, r) => sum + (r.distance / 1000), 0)
        .toFixed(2);
    const totalRuns2026 = runs2026.length;

    // TabNavigation Logic
    const tabNavRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const checkScroll = () => {
        if (tabNavRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tabNavRef.current;
            setShowLeftArrow(scrollLeft > 0);
            // Allow a small buffer (5px) for floating point precision issues
            setShowRightArrow(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 5);
        }
    };

    useEffect(() => {
        checkScroll();
        const ref = tabNavRef.current;
        if (ref) {
            ref.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
            return () => {
                ref.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, [runs]);

    const scrollNav = (direction) => {
        if (tabNavRef.current) {
            const scrollAmount = 200;
            tabNavRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative bg-black text-white min-h-screen md:h-screen md:overflow-y-scroll md:snap-y md:snap-mandatory scroll-smooth no-scrollbar font-sans selection:bg-gray-800 selection:text-white overflow-x-hidden">
            <Navbar />
            <StickyHeader yearTotal={totalDistance2026} runCount={totalRuns2026} />

            {/* Hero Section */}
            <section className="relative h-screen min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black snap-start mt-[-96px]">
                <div className="absolute inset-0 z-0">
                    <GlobalHeatmap runs={runs} className="w-full h-full" />

                </div>


            </section>

            {/* Progress Ring Section */}
            <section className="relative py-24 md:py-32 bg-white dark:bg-black min-h-screen snap-start flex flex-col justify-center">
                <div className="max-w-7xl mx-auto px-6">


                    {/* Progress Ring */}

                    {latestRun ? (
                        <ScrollAnimation className="flex items-center justify-center mb-20">
                            <div className="relative w-[85vw] md:w-[70vh] lg:w-[80vh] max-w-[1200px] aspect-square transition-all duration-500">
                                <svg
                                    className="w-full h-full transform -rotate-90"
                                    width="1800"
                                    height="1800"
                                    viewBox="0 0 1800 1800"
                                    xmlns="http://www.w3.org/2000/svg"
                                    preserveAspectRatio="xMidYMid meet"
                                >
                                    <circle
                                        cx="900"
                                        cy="900"
                                        r="720"
                                        stroke="#E5EDE9"
                                        strokeWidth="105"
                                        fill="transparent"
                                        strokeLinecap="round"
                                        className=""
                                    />
                                    <circle
                                        cx="900"
                                        cy="900"
                                        r="720"
                                        stroke="#04DE71"
                                        strokeWidth="105"
                                        fill="transparent"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 720}`}
                                        strokeDashoffset={animateRing
                                            ? `${2 * Math.PI * 720 * (1 - Math.min(parseFloat(distanceKm) / 10, 1))}`
                                            : `${2 * Math.PI * 720}`
                                        }
                                        className="transition-all duration-[2000ms] ease-out"
                                    />
                                </svg>

                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-[14vw] md:text-9xl lg:text-[13rem] font-black text-gray-900 dark:text-white mb-4 leading-none tracking-tighter transition-all duration-500">
                                        {animateRing ? (
                                            <AnimatedNumber value={parseFloat(distanceKm)} />
                                        ) : (
                                            <span className="tabular-nums">0.00</span>
                                        )}
                                    </div>
                                    <div className="text-3xl md:text-4xl lg:text-5xl text-gray-500 dark:text-gray-400 font-medium">
                                        km
                                    </div>
                                </div>
                            </div>
                        </ScrollAnimation>
                    ) : (
                        <div className="flex items-center justify-center mb-20">
                            <div className="relative w-full max-w-[85vw] md:max-w-2xl lg:max-w-[800px] aspect-square animate-pulse">
                                {/* Ring Skeleton */}
                                <div className="w-full h-full rounded-full border-[24px] border-gray-100 dark:border-zinc-800" />
                                {/* Text Skeleton center */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="h-32 w-64 bg-gray-200 dark:bg-zinc-800 rounded-2xl mb-6" />
                                    <div className="h-8 w-16 bg-gray-200 dark:bg-zinc-800 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Basic Stats */}
                    {latestRun ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
                            <div className="text-center">
                                <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Pace</div>
                                <div className="text-4xl font-bold text-gray-900 dark:text-white">{pace}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">/km</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Time</div>
                                <div className="text-4xl font-bold text-gray-900 dark:text-white">{durationMin}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">minutes</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Heart Rate</div>
                                <div className="text-4xl font-bold text-gray-900 dark:text-white">142</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">avg bpm</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Calories</div>
                                <div className="text-4xl font-bold text-gray-900 dark:text-white">{Math.round(distanceKm * 65)}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">kcal</div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto animate-pulse">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="text-center flex flex-col items-center">
                                    <div className="h-4 w-12 bg-gray-200 dark:bg-zinc-800 rounded mb-2" />
                                    <div className="h-10 w-24 bg-gray-200 dark:bg-zinc-800 rounded mb-1" />
                                    <div className="h-4 w-8 bg-gray-200 dark:bg-zinc-800 rounded" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section >

            {/* Professional Analysis Dashboard */}
            <section className="min-h-screen snap-start flex flex-col justify-center bg-black">
                <ProfessionalAnalysis runs={runs} />
            </section>

            {/* Unified Views: All Seasons */}
            {
                (() => {
                    // Group runs by year
                    const runsByYear = runs.reduce((acc, run) => {
                        const year = new Date(run.start_date).getFullYear();
                        if (!acc[year]) acc[year] = [];
                        acc[year].push(run);
                        return acc;
                    }, {});

                    // Sort years descending
                    const sortedYears = Object.keys(runsByYear).sort((a, b) => b - a);
                    // Handle Loading State
                    if (loading && runs.length === 0) {
                        return (
                            <section className="px-6 py-32 bg-[#F5F5F7] dark:bg-black">
                                <div className="max-w-7xl mx-auto">
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-12 px-2">Recent Runs</h3>
                                    <div className="flex gap-6 overflow-hidden">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="w-[calc(100vw-48px)] md:w-[400px] flex-shrink-0 flex flex-col p-6 bg-white dark:bg-zinc-900/50 rounded-3xl border border-gray-100 dark:border-zinc-800 min-h-[390px] animate-pulse">
                                                <div className="flex justify-between mb-6">
                                                    <div className="w-16 h-6 bg-gray-200 dark:bg-zinc-800 rounded-full"></div>
                                                    <div className="w-10 h-6 bg-gray-200 dark:bg-zinc-800 rounded-full"></div>
                                                </div>
                                                <div className="w-32 h-10 bg-gray-200 dark:bg-zinc-800 rounded-md mb-6"></div>
                                                <div className="w-full h-32 bg-gray-200 dark:bg-zinc-800 rounded-xl mb-6"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        );
                    }

                    return sortedYears.filter(year => year === '2026').map(year => {
                        // Calculate Yearly Statistics
                        const yearRuns = runsByYear[year];
                        const totalDistance = yearRuns.reduce((sum, r) => sum + (r.distance / 1000), 0).toFixed(2);
                        const totalRuns = yearRuns.length;
                        const totalSeconds = yearRuns.reduce((sum, r) => sum + r.moving_time, 0);
                        const totalHours = Math.floor(totalSeconds / 3600);
                        const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
                        const totalDuration = `${totalHours}h ${totalMinutes}m`;

                        // Avg Pace: Weighted by distance or simple arithmetic mean of speeds isn't accurate. 
                        // Best way: Total Time / Total Distance
                        const avgPaceSeconds = totalSeconds / (totalDistance > 0 ? totalDistance : 1);
                        const avgPaceMin = Math.floor(avgPaceSeconds / 60);
                        const avgPaceSec = Math.floor(avgPaceSeconds % 60);
                        const avgPace = `${avgPaceMin}'${avgPaceSec < 10 ? '0' : ''}${avgPaceSec}"`;

                        const longestRunVal = Math.max(...yearRuns.map(r => r.distance / 1000)).toFixed(2);
                        const totalCalories = Math.round(totalDistance * 65);

                        const seasonStats = {
                            totalDistance,
                            totalRuns,
                            avgPace,
                            totalDuration,
                            longestRun: longestRunVal,
                            totalCalories
                        };

                        return (
                            <section key={year} id={`year-${year}`} className="px-6 py-16 bg-[#F5F5F7] dark:bg-black min-h-screen snap-start flex flex-col justify-center">
                                <div className="max-w-7xl mx-auto w-full">
                                    {/* Detailed Season Summary - Removed as per request (moved to archive) */}
                                    {/* <SeasonSummary year={year} stats={seasonStats} /> */}

                                    {year === '2026' && (
                                        <>
                                            <div className="flex items-baseline space-x-4 mb-8 px-2">
                                                <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
                                                    Recent Activity
                                                </span>
                                            </div>

                                            <div className="relative w-full">
                                                <div className="flex flex-nowrap overflow-x-auto gap-6 pb-8 snap-x snap-mandatory no-scrollbar -mx-6 px-6 cursor-grab active:cursor-grabbing">
                                                    {runsByYear[year].map((run, index) => {
                                                        const distanceKm = (run.distance / 1000).toFixed(2);
                                                        const paceSeconds = run.moving_time / (run.distance / 1000);
                                                        const pace = `${Math.floor(paceSeconds / 60)}'${Math.floor(paceSeconds % 60) < 10 ? '0' : ''}${Math.floor(paceSeconds % 60)}"`;
                                                        const date = new Date(run.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                                                        return (
                                                            <ScrollAnimation key={run.id || index} index={index} className="snap-center flex-shrink-0">
                                                                <div onClick={() => setSelectedRun(run)} className="cursor-pointer w-[calc(100vw-48px)] md:w-[400px] min-h-[390px] flex flex-col p-6 bg-white dark:bg-zinc-900/50 rounded-3xl shadow-sm transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99]">
                                                                    <div className="flex items-center justify-between mb-6">
                                                                        <div className="flex items-center space-x-2 text-[#5CFFA5]">
                                                                            <div className="p-2 bg-[#5CFFA5]/10 rounded-full"><FaRunning className="text-sm" /></div>
                                                                            <span className="text-[10px] uppercase font-bold text-gray-400">Run</span>
                                                                        </div>
                                                                        <div className="text-[10px] font-medium text-gray-400 bg-gray-50 dark:bg-zinc-800 px-2 py-1 rounded-full">{run.source || 'NRC'}</div>
                                                                    </div>
                                                                    <div className="flex items-baseline space-x-1 mb-6">
                                                                        <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{distanceKm}</span>
                                                                        <span className="text-sm font-medium text-gray-400">km</span>
                                                                    </div>
                                                                    <div className="w-full h-32 mb-6 pointer-events-none">
                                                                        <div className="w-full h-full bg-gray-50 dark:bg-zinc-800/50 rounded-xl overflow-hidden relative">
                                                                            {run.map?.summary_polyline ? (
                                                                                <RunMap summaryPolyline={run.map.summary_polyline} className="w-full h-full" />
                                                                            ) : (
                                                                                <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-zinc-700"><FaRoad className="text-2xl opacity-20" /></div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4 pt-6 mt-auto">
                                                                        <div className="flex items-center space-x-3">
                                                                            <FaRegCalendarAlt className="text-gray-300" />
                                                                            <div className="flex flex-col"><span className="text-[10px] uppercase text-gray-400">Date</span><span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{date}</span></div>
                                                                        </div>
                                                                        <div className="flex items-center space-x-3">
                                                                            <FaRoad className="text-gray-300" />
                                                                            <div className="flex flex-col"><span className="text-[10px] uppercase text-gray-400">Pace</span><span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{pace} /km</span></div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </ScrollAnimation>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </section>
                        );
                    });
                })()
            }

            {/* Run Detail Modal */}
            {/* Run Detail Modal */}
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
                                        <Link
                                            href={`/cai_run_archive?year=${new Date(selectedRun.start_date).getFullYear()}`}
                                            className="hover:opacity-70 transition-opacity cursor-pointer"
                                            title="View Year Archive"
                                        >
                                            {new Date(selectedRun.start_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </Link>
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
                                            {(() => {
                                                const paceSeconds = selectedRun.moving_time / (selectedRun.distance / 1000);
                                                const paceMin = Math.floor(paceSeconds / 60);
                                                const paceSec = Math.floor(paceSeconds % 60);
                                                return `${paceMin}'${paceSec < 10 ? '0' : ''}${paceSec}"`;
                                            })()} <span className="text-lg text-gray-500 font-medium">/km</span>
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
                                            <span className="text-xs text-gray-400 uppercase tracking-wider">Fitness+</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Minimalist Calendar Section */}
            <section className="px-6 pt-16 pb-32 bg-[#F5F5F7] dark:bg-black min-h-screen snap-start flex flex-col justify-center">
                <ScrollAnimation className="max-w-7xl mx-auto w-full">
                    <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                {calendarDate.toLocaleString('en-US', { month: 'long' })} {calendarDate.getFullYear()}
                                <FaChevronRight className="ml-2 w-3 h-3 text-gray-400" />
                            </h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    <FaChevronLeft className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    <FaChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {/* Weekday Labels */}
                        <div className="grid grid-cols-7 mb-4">
                            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                                <div key={day} className="text-center text-[10px] md:text-xs font-bold text-gray-200 tracking-wider">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-y-6">
                            {(() => {
                                const year = calendarDate.getFullYear();
                                const month = calendarDate.getMonth();
                                const firstDayOfMonth = new Date(year, month, 1);
                                const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
                                const daysInMonth = new Date(year, month + 1, 0).getDate();

                                // Calculate start date of the grid (previous month's trailing days)
                                // We strictly want 6 rows or just enough to fill? 
                                // Standard 35 or 42 cells logic.
                                // But keeping it simple: just list days, maybe empty slots for start.

                                const totalSlots = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

                                return Array.from({ length: totalSlots }).map((_, i) => {
                                    if (i < startingDayOfWeek) {
                                        return <div key={`empty-${i}`} />;
                                    }

                                    const dayNumber = i - startingDayOfWeek + 1;
                                    if (dayNumber > daysInMonth) {
                                        return <div key={`empty-end-${i}`} />;
                                    }

                                    const currentDate = new Date(year, month, dayNumber);
                                    const isToday = new Date().toDateString() === currentDate.toDateString();

                                    // Check if this date is selected
                                    const isSelected = selectedDate &&
                                        selectedDate.getDate() === dayNumber &&
                                        selectedDate.getMonth() === month &&
                                        selectedDate.getFullYear() === year;

                                    // Find runs
                                    const hasRun = runs.some(r => {
                                        const rDate = new Date(r.start_date);
                                        return rDate.getDate() === dayNumber &&
                                            rDate.getMonth() === month &&
                                            rDate.getFullYear() === year;
                                    });

                                    return (
                                        <button
                                            key={dayNumber}
                                            onClick={() => {
                                                setSelectedDate(currentDate);
                                                // If there's a run, open the modal for the first run of the day
                                                const run = runs.find(r => {
                                                    const rDate = new Date(r.start_date);
                                                    return rDate.getDate() === dayNumber &&
                                                        rDate.getMonth() === month &&
                                                        rDate.getFullYear() === year;
                                                });
                                                if (run) {
                                                    setSelectedRun(run);
                                                }
                                            }}
                                            className="relative flex flex-col items-center justify-start h-10 group"
                                        >
                                            <span
                                                className={`
                                                    w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all
                                                    ${isSelected
                                                        ? 'bg-black text-white dark:bg-white dark:text-black shadow-md scale-110'
                                                        : isToday
                                                            ? 'text-red-500 font-bold'
                                                            : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-zinc-800'
                                                    }
                                                `}
                                            >
                                                {dayNumber}
                                            </span>

                                            {hasRun && (
                                                <span className={`mt-1 w-1 h-1 rounded-full ${isSelected ? 'bg-transparent' : 'bg-black dark:bg-white'}`} />
                                            )}
                                        </button>
                                    );
                                });
                            })()}
                        </div>
                    </div>


                    {/* History Links - Grouped List Style */}
                    {/* History Links - Apple Tab Style */}

                </ScrollAnimation>
            </section>

            {/* Final CTA */}
            <section className="px-6 py-32 bg-gray-50 dark:bg-zinc-950 min-h-screen snap-start flex items-center justify-center">
                <div className="max-w-4xl mx-auto text-center">

                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#2997FF] via-[#985BD5] to-[#FF2964] bg-[length:200%_auto] animate-gradient-flow py-2">
                        Trust the process.
                    </h2>
                </div>
            </section>
        </div >
    );
}

export default CaiRun;

