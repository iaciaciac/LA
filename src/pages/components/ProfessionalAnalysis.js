import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeartbeat, FaRunning, FaBolt, FaStream, FaTrophy, FaLightbulb, FaArrowUp, FaArrowDown, FaCheckCircle } from 'react-icons/fa';
import ScrollAnimation from './ScrollAnimation';

/**
 * Professional Analysis Dashboard (Personalized)
 * Optimized to match Apple/Nike aesthetics from cai_run.js
 */

const Tooltip = ({ label, value, color }) => {
    // Handle both standard utility classes (bg-rose-500) and arbitrary values (bg-[#FA114F])
    const borderClass = color.replace('bg-', 'border-t-');

    return (
        <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg shadow-lg text-xs font-bold text-white whitespace-nowrap z-20 ${color} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none tabular-nums`}>
            {label}: {value}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${borderClass}`}></div>
        </div>
    );
};

const AnalysisInsight = ({ type, data, baseline }) => {
    // Logic to generate insight text & Prescription
    const insight = useMemo(() => {
        if (!data || data.length === 0) return null;

        // Calculate recent average (last 3 runs)
        const recentRuns = data.slice(-3);

        if (type === 'ef') {
            const recentAvg = recentRuns.reduce((acc, r) => acc + r.ef, 0) / recentRuns.length;
            const diff = ((recentAvg - baseline) / baseline) * 100;

            if (diff > 5) return {
                icon: FaArrowUp, color: "text-[#92E12C]", bg: "bg-[#92E12C]/10", border: "border-[#92E12C]/20",
                title: "有氧能力提升",
                text: "同心率下配速提升，有氧引擎正在变强。",
                advice: "建议：保持当前节奏，可尝试增加 10% 跑量或进行一次长距离慢跑 (LSD)。"
            };
            if (diff < -5) return {
                icon: FaArrowDown, color: "text-[#FA114F]", bg: "bg-[#FA114F]/10", border: "border-[#FA114F]/20",
                title: "效率下降 (疲劳预警)",
                text: "同配速下心率升高，可能是疲劳累积或环境因素。",
                advice: "建议：下一次训练强制降低强度。进行 30 分钟极轻松的恢复跑 (Zone 1-2)，不要看配速，只看心率。"
            };
            return {
                icon: FaCheckCircle, color: "text-[#00EDED]", bg: "bg-[#00EDED]/10", border: "border-[#00EDED]/20",
                title: "状态稳固",
                text: "有氧效率非常稳定，是堆积跑量的最佳时期。",
                advice: "建议：按计划进行。状态良好，可以尝试在下次长跑的后半程稍微提速。"
            };
        }

        if (type === 'spm') {
            const recentAvg = recentRuns.reduce((acc, r) => acc + r.spm, 0) / recentRuns.length;

            if (recentAvg < 168) return {
                icon: FaLightbulb, color: "text-[#FDB927]", bg: "bg-[#FDB927]/10", border: "border-[#FDB927]/20",
                title: "步频偏低风险",
                text: `近期平均步频 ${Math.round(recentAvg)}，较低的步频通常意味着步幅过大，膝盖冲击力增加。`,
                advice: "建议：下一次跑步专注于“快步频”。不要管速度，试着跟着 175 bpm 的音乐跑，或者心中默念 '1-2-1-2' 加快节奏。"
            };
            if (recentAvg > 185) return {
                icon: FaLightbulb, color: "text-[#00EDED]", bg: "bg-[#00EDED]/10", border: "border-[#00EDED]/20",
                title: "高步频",
                text: "步频保持在该水平通常效率很高。",
                advice: "建议：注意放松小腿，避免为了维持高步频而导致肌肉紧张。"
            };
            return {
                icon: FaCheckCircle, color: "text-[#92E12C]", bg: "bg-[#92E12C]/10", border: "border-[#92E12C]/20",
                title: "黄金步频",
                text: "维持在 170-180 的黄金区间，经济性最佳。",
                advice: "建议：非常棒！保持这种轻快的节奏感，这是避免受伤的关键。"
            };
        }

        if (type === 'load') {
            // Check for spikes
            const lastRunLoad = data[data.length - 1].rawLoad;
            const avgLoad = data.reduce((acc, r) => acc + r.rawLoad, 0) / data.length;

            if (lastRunLoad > avgLoad * 1.5) {
                return {
                    icon: FaBolt, color: "text-[#FA114F]", bg: "bg-[#FA114F]/10", border: "border-[#FA114F]/20",
                    title: "高负荷警示",
                    text: "最近一次训练负荷远超平均水平。",
                    advice: "建议：⚠️ 明天完全休息，或仅进行交叉训练（游泳/骑车）。严禁连续两天进行高负荷训练。"
                }
            }
            return {
                icon: FaCheckCircle, color: "text-[#92E12C]", bg: "bg-[#92E12C]/10", border: "border-[#92E12C]/20",
                title: "负荷适中",
                text: "当前的训练压力在安全范围内。",
                advice: "建议：可以继续保持。如果感觉状态好，下周可尝试增加 5-10% 的总负荷。"
            }
        }

        return null;
    }, [data, type, baseline]);

    if (!insight) return null;

    return (
        <div className={`mt-6 rounded-2xl border ${insight.bg} ${insight.border} overflow-hidden`}>
            {/* Header / Diagnosis */}
            <div className="p-4 flex items-start gap-3">
                <div className={`mt-0.5 p-1.5 rounded-full bg-white dark:bg-black/20 ${insight.color} shrink-0`}>
                    <insight.icon className="text-xs" />
                </div>
                <div>
                    <h4 className={`text-sm font-bold ${insight.color} mb-1`}>{insight.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium text-pretty">
                        {insight.text}
                    </p>
                </div>
            </div>

            {/* Prescription / Action */}
            <div className="bg-white/50 dark:bg-black/20 px-4 py-3 border-t border-gray-100 dark:border-white/5 flex gap-3">
                <div className="shrink-0 mt-0.5">
                    <span className="flex h-2 w-2 relative">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${insight.color.replace('text-', 'bg-')} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${insight.color.replace('text-', 'bg-')}`}></span>
                    </span>
                </div>
                <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-relaxed">
                    {insight.advice}
                </p>
            </div>
        </div>
    );
};


const AnalysisCard = ({ title, subtitle, icon: Icon, children, className = "", insightType, insightData, insightBaseline, headerColor = "text-white" }) => (
    <div className={`bg-zinc-900/50 rounded-2xl md:rounded-[32px] p-5 md:p-8 border border-zinc-800 shadow-sm backdrop-blur-sm flex flex-col transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99] transform-gpu overflow-hidden w-full max-w-full ${className}`}>
        <div className="flex items-start justify-between mb-8">
            <div>
                <h3 className={`text-lg font-bold ${headerColor} flex items-center gap-2`}>
                    <Icon className="currentColor text-sm" />
                    {title}
                </h3>
                <p className="text-xs text-gray-400 mt-1 font-medium tracking-wide uppercase tabular-nums">{subtitle}</p>
            </div>
        </div>
        <div className="flex-1 w-full min-h-[160px] relative">
            {children}
        </div>

        {/* Smart Insight Footer */}
        {insightType && (
            <AnalysisInsight type={insightType} data={insightData} baseline={insightBaseline} />
        )}
    </div>
);

const CoachPrescription = ({ data, baselines }) => {
    // Helper to format decimal pace to mm'ss"
    const formatPace = (decimalPace) => {
        if (!decimalPace || decimalPace === Infinity) return "-";
        const mins = Math.floor(decimalPace);
        const secs = Math.round((decimalPace - mins) * 60);
        return `${mins}'${secs < 10 ? '0' : ''}${secs}"`;
    };

    const prescription = useMemo(() => {
        if (!data || data.length < 5) return null; // Need slightly more data for robust calc

        const lastRun = data[data.length - 1];
        const recentRuns = data.slice(-5); // Look at last 5 runs for context

        // 1. Calculate Statistics
        const avgLoad = data.reduce((acc, r) => acc + r.rawLoad, 0) / data.length;
        const avgDist = recentRuns.reduce((acc, r) => acc + r.distKm, 0) / recentRuns.length;
        const maxDistRecent = Math.max(...recentRuns.map(r => r.distKm));

        const recentAvgSpm = recentRuns.reduce((acc, r) => acc + r.spm, 0) / recentRuns.length;
        const recentAvgEf = data.slice(-3).reduce((acc, r) => acc + r.ef, 0) / 3;
        const efTrend = recentAvgEf > baselines.avgEf * 1.02; // Significant improvement (>2%)

        // Smart Pace Calculation (Avg pace of runs with Good EF)
        const goodRuns = data.filter(r => r.ef > baselines.avgEf);
        const smartAerobicPace = goodRuns.length > 0
            ? goodRuns.reduce((acc, r) => acc + r.paceAvg, 0) / goodRuns.length
            : (lastRun.paceAvg || 6.0) * 1.05;

        // --- PRESCRIPTION LOGIC (LOCALIZED) ---

        // A. FATIGUE IS HIGH (Load Management)
        if (lastRun.rawLoad > avgLoad * 1.5) {
            const recoveryDist = Math.max(3, Math.round(avgDist * 0.4)); // 40% of average distance
            return {
                type: "Recovery Run",
                typeCN: "主动恢复跑",
                icon: FaHeartbeat,
                color: "text-[#ff2d55]",
                bg: "bg-[#ff2d55]",
                dist: `${recoveryDist} KM`,
                pace: "轻松慢跑",
                spm: "Relaxed",
                reason: `检测到上一场训练负荷较高（Load ${Math.round(lastRun.rawLoad)}），身体处于疲劳期。建议进行极轻松的恢复跑，促进血液循环。`,
                focus: "心率 < 135 bpm"
            };
        }

        // B. FORM & CADENCE (Technical Correction)
        if (recentAvgSpm < 168) {
            return {
                type: "Cadence Drill",
                typeCN: "步频专项训练",
                icon: FaRunning,
                color: "text-[#ffd60a]",
                bg: "bg-[#ffd60a]",
                dist: `${Math.round(avgDist)} KM`,
                pace: formatPace(smartAerobicPace),
                spm: "175 - 180",
                reason: "近期平均步频偏低，在此配速下可能增加膝盖压力。本课表不追求速度，请专注于加快双腿交替节奏。",
                focus: "小步幅，快节奏"
            };
        }

        // C. PROGRESSIVE OVERLOAD (Long Run) - If EF is good, we build volume
        if (efTrend) {
            // Progressive Overload: 10% more than recent max, capped reasonably
            const targetLongRun = Math.min(Math.round(maxDistRecent * 1.1), 35);
            return {
                type: "Long Run",
                typeCN: "长距离耐力 (LSD)",
                icon: FaTrophy,
                color: "text-[#32d74b]",
                bg: "bg-[#32d74b]",
                dist: `${targetLongRun} KM`,
                pace: formatPace(smartAerobicPace),
                spm: "180+",
                reason: `有氧效率持续提升 (+${((recentAvgEf / baselines.avgEf - 1) * 100).toFixed(1)}%)，心肺能力已准备好迎接更大挑战。建议增加跑量以巩固耐力基础。`,
                focus: "后半程维持配速"
            };
        }

        // D. BASE BUILDING (Maintenance)
        return {
            type: "Base Run",
            typeCN: "有氧基础跑",
            icon: FaCheckCircle,
            color: "text-[#32d74b]",
            bg: "bg-[#32d74b]",
            dist: `${Math.round(avgDist * 1.1)} KM`, // Slight bump from average
            pace: formatPace(smartAerobicPace * 1.02), // Strictly aerobic (slightly slower)
            spm: "175+",
            reason: "当前状态稳定。请保持规律训练，在舒适的有氧区间积累跑量，稳步扩大有氧底座。",
            focus: "轻松，享受节奏"
        };
    }, [data, baselines]);

    if (!prescription) return null;

    return (
        <div className="mb-8 group">
            <div className="relative overflow-hidden rounded-[32px] p-8 md:p-10 bg-[#1c1c1e] border border-white/5 transition-transform duration-500 hover:scale-[1.01]">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10 relative z-10">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">AI 智能教练推荐</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-semibold text-white tracking-tight">{prescription.type}</h2>
                        <p className="text-lg text-zinc-400 mt-2 font-medium">{prescription.typeCN}</p>
                    </div>

                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${prescription.color.replace('text-', 'bg-')}/10 border border-white/5`}>
                        <prescription.icon className={`text-xl ${prescription.color}`} />
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10 border-t border-white/5 pt-8">
                    {/* Target: Distance */}
                    <div>
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">计划距离 (Distance)</span>
                        <div className="text-3xl md:text-4xl font-semibold text-white tabular-nums tracking-tight">{prescription.dist}</div>
                    </div>
                    {/* Target: Pace */}
                    <div>
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">建议配速 (Pace)</span>
                        <div className="flex items-baseline gap-1">
                            <div className="text-3xl md:text-4xl font-semibold text-white tabular-nums tracking-tight">{prescription.pace}</div>
                            {prescription.pace.includes("'") && <span className="text-sm text-zinc-500 font-medium">/km</span>}
                        </div>
                    </div>
                    {/* Target: Focus */}
                    <div>
                        <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">训练重点 (Focus)</span>
                        <div className={`text-3xl md:text-4xl font-semibold tracking-tight ${prescription.color}`}>{prescription.focus}</div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 pt-8 border-t border-white/5 flex items-start gap-3">
                    <FaLightbulb className="text-zinc-600 mt-1 shrink-0 text-xs" />
                    <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-2xl">
                        {prescription.reason}
                    </p>
                </div>
            </div>
        </div>
    );
};

const RecentActivityRows = ({ runs }) => {
    // State for interactive comparison line
    const [guide, setGuide] = useState(null);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const check = () => setIsDesktop(window.innerWidth >= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Top 5 most recent runs
    const recent = useMemo(() => {
        if (!runs) return [];
        return [...runs]
            .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
            .slice(0, 5)
            .map(r => {
                const durationMin = r.moving_time / 60;
                const distKm = r.distance / 1000;
                const paceDecimal = durationMin / distKm;
                const hr = r.average_heartrate || 0;

                const paceMin = Math.floor(paceDecimal);
                const paceSec = Math.round((paceDecimal - paceMin) * 60);
                const paceLabel = `${paceMin}'${paceSec < 10 ? '0' : ''}${paceSec}"`;

                return {
                    id: r.id,
                    dateLabel: new Date(r.start_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }), // 01-07
                    distKm,
                    paceDecimal,
                    paceLabel,
                    hr
                };
            });
    }, [runs]);

    if (recent.length === 0) return null;

    // Normalization Maximums
    const maxDist = Math.max(...recent.map(r => r.distKm)) * 1.15; // More buffer for label space
    const maxHR = Math.max(...recent.map(r => r.hr)) * 1.15;
    const maxPace = Math.max(...recent.map(r => r.paceDecimal)) * 1.15;

    // Identify "Best" values
    const bestPaceVal = Math.min(...recent.map(r => r.paceDecimal));
    const bestDistVal = Math.max(...recent.map(r => r.distKm));
    const bestHRVal = Math.min(...recent.filter(r => r.hr > 0).map(r => r.hr));

    const handleBarClick = (e, type, value, percentage, color, label) => {
        e.stopPropagation(); // prevent card click if any
        if (guide && guide.type === type && guide.valueLabel === label) {
            setGuide(null); // Toggle off
        } else {
            setGuide({ type, leftPercentage: percentage, color, valueLabel: label });
        }
    };

    return (
        <div className="bg-[#1c1c1e] py-16 md:py-24 px-6 md:px-12 w-full rounded-[32px] border border-white/5 relative overflow-hidden mt-8"
            onClick={() => setGuide(null)}>

            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <h3 className="text-3xl font-semibold text-white tracking-tight">
                        Recent Activity
                        <span className="block text-sm text-zinc-500 font-normal mt-1 tracking-normal">Visualize your latest runs</span>
                    </h3>
                    <div className="text-xs font-medium text-zinc-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                        Interactive Data Stream
                    </div>
                </div>

                <div className="space-y-12 relative z-10">

                    {/* Global Guide Line Overlay */}
                    {guide && (
                        <div
                            className="absolute top-[-20px] bottom-[-20px] pointer-events-none z-10 flex flex-col items-center"
                            style={{
                                // Desktop: 4rem (w-16) + 1.5rem (gap-6) = 5.5rem offset
                                // Mobile: 0 offset
                                left: isDesktop
                                    ? `calc(5.5rem + (100% - 5.5rem) * ${guide.leftPercentage / 100})`
                                    : `${guide.leftPercentage}%`,
                                transition: 'left 0.3s ease-out'
                            }}
                        >
                            {/* Line */}
                            <div className="h-full border-l-[1.5px] border-dashed shadow-[0_0_10px_rgba(255,255,255,0.2)]" style={{ borderColor: guide.color }}></div>

                            {/* Badge */}
                            <div className="absolute top-0 -translate-y-1/2 bg-[#1c1c1e] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xl whitespace-nowrap border border-white/10 tabular-nums z-20"
                                style={{ color: guide.color, borderColor: guide.color }}>
                                {guide.valueLabel}
                            </div>
                        </div>
                    )}

                    {recent.map((run, i) => {
                        const isBestPace = Math.abs(run.paceDecimal - bestPaceVal) < 0.01;
                        const isBestDist = Math.abs(run.distKm - bestDistVal) < 0.01;
                        const isBestHR = Math.abs(run.hr - bestHRVal) < 0.1;

                        return (
                            <div key={i} className="flex flex-col md:flex-row items-center gap-6 group relative">
                                {/* Date */}
                                <div className="w-16 text-xs font-semibold text-zinc-500 shrink-0 tabular-nums text-right group-hover:text-white transition-colors">
                                    {run.dateLabel}
                                </div>

                                {/* Visualization Track */}
                                <div className="flex-1 w-full relative h-[72px] flex items-center">

                                    {/* Stacked Bars */}
                                    <div className="w-full h-full relative flex flex-col justify-center gap-[10px]">

                                        {/* PACE (Apple Cyan #32ADE6) */}
                                        <div className="relative h-[8px] w-full flex items-center">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 cursor-pointer ${isBestPace ? 'opacity-100 shadow-[0_0_12px_rgba(50,173,230,0.6)]' : 'opacity-60 hover:opacity-100'}`}
                                                style={{
                                                    width: `${(run.paceDecimal / maxPace) * 85}%`,
                                                    backgroundColor: '#32ADE6'
                                                }}
                                                onClick={(e) => handleBarClick(e, 'pace', run.paceDecimal, (run.paceDecimal / maxPace) * 85, '#32ADE6', `${run.paceLabel}/km`)}
                                            ></div>
                                            {/* Label displays on hover or active */}
                                            <span className="ml-3 text-[10px] font-bold text-[#32ADE6] opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                                                {run.paceLabel}
                                            </span>
                                        </div>

                                        {/* HR (Apple Red #ff2d55) */}
                                        <div className="relative h-[8px] w-full flex items-center">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 delay-75 cursor-pointer ${isBestHR ? 'opacity-100 shadow-[0_0_12px_rgba(255,45,85,0.6)]' : 'opacity-60 hover:opacity-100'}`}
                                                style={{
                                                    width: `${(run.hr / maxHR) * 90}%`,
                                                    backgroundColor: '#ff2d55'
                                                }}
                                                onClick={(e) => handleBarClick(e, 'hr', run.hr, (run.hr / maxHR) * 90, '#ff2d55', `${Math.round(run.hr)} bpm`)}
                                            ></div>
                                            <span className="ml-3 text-[10px] font-bold text-[#ff2d55] opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                                                {Math.round(run.hr)}
                                            </span>
                                        </div>

                                        {/* DIST (Apple Green #32d74b) */}
                                        <div className="relative h-[8px] w-full flex items-center">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 delay-150 cursor-pointer ${isBestDist ? 'opacity-100 shadow-[0_0_12px_rgba(50,215,75,0.6)]' : 'opacity-60 hover:opacity-100'}`}
                                                style={{
                                                    width: `${(run.distKm / maxDist) * 100}%`,
                                                    backgroundColor: '#32d74b'
                                                }}
                                                onClick={(e) => handleBarClick(e, 'dist', run.distKm, (run.distKm / maxDist) * 100, '#32d74b', `${run.distKm.toFixed(2)} km`)}
                                            ></div>
                                            <span className="ml-3 text-[10px] font-bold text-[#32d74b] opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                                                {run.distKm.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="mt-8 flex justify-end gap-6 text-[10px] text-zinc-500 font-medium tracking-wide">
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#32ADE6]"></div> Pace</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ff2d55]"></div> Heart Rate</span>
                    <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#32d74b]"></div> Distance</span>
                </div>
            </div>
        </div>
    );
};

const ProfessionalAnalysis = ({ runs }) => {
    // 1. Calculate Baselines from ALL available history (or large window)
    const baselines = useMemo(() => {
        if (!runs || runs.length < 5) return null;

        // Filter valid runs
        const validRuns = runs.filter(r => r.moving_time > 600 && r.average_heartrate > 0 && r.steps > 0);
        if (validRuns.length === 0) return null;

        const totalSpm = validRuns.reduce((acc, r) => acc + (r.steps / (r.moving_time / 60)), 0);
        const totalEf = validRuns.reduce((acc, r) => {
            const speed = r.distance / (r.moving_time / 60);
            return acc + (speed / r.average_heartrate);
        }, 0);

        return {
            avgSpm: Math.round(totalSpm / validRuns.length),
            avgEf: (totalEf / validRuns.length).toFixed(2)
        };
    }, [runs]);

    // 2. Process Recent Data (Trend)
    const data = useMemo(() => {
        if (!runs || runs.length < 2) return [];
        // Sort by date ascending
        const sorted = [...runs].sort((a, b) => new Date(a.start_date) - new Date(b.start_date)).slice(-12);

        return sorted.map(run => {
            const durationMin = run.moving_time / 60;
            const distanceMeters = run.distance;
            const speedMetersPerMin = durationMin > 0 ? distanceMeters / durationMin : 0;
            const hr = run.average_heartrate || 0;
            const steps = run.steps || 0;

            const ef = hr > 0 ? (speedMetersPerMin / hr).toFixed(2) : 0;
            const spm = durationMin > 0 && steps > 0 ? Math.round(steps / durationMin) : 0;
            const rawLoad = durationMin * hr; // Simplified TRIMP

            const date = new Date(run.start_date);

            return {
                id: run.id,
                dateLabel: `${date.getMonth() + 1}/${date.getDate()}`,
                distKm: (distanceMeters / 1000),
                paceAvg: speedMetersPerMin > 0 ? 1000 / speedMetersPerMin : 0,
                ef: parseFloat(ef),
                spm,
                hr,
                rawLoad
            };
        }).filter(d => d.hr > 0);
    }, [runs]);

    if (!baselines || data.length === 0) return null;

    // Goals based on Baseline
    const spmGoal = Math.round(baselines.avgSpm * 1.03); // Target: 3% improvement
    const efBaseline = parseFloat(baselines.avgEf);

    const maxEf = Math.max(...data.map(d => d.ef), efBaseline) * 1.1;
    const minEf = Math.min(...data.map(d => d.ef), efBaseline) * 0.9;
    const maxLoad = Math.max(...data.map(d => d.rawLoad));

    return (
        <section className="bg-black pt-16 pb-0">
            {/* Constrained Container for Top Section */}
            <div className="max-w-7xl mx-auto px-6 mb-16">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <ScrollAnimation>
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">训练量化分析</h2>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[#00EDED] text-xs font-bold px-2 py-1 rounded-full border border-[#00EDED]/20 bg-[#00EDED]/10">
                                    基于个人专属数据库
                                </span>
                            </div>
                            <p className="max-w-2xl text-base text-gray-400 leading-relaxed text-pretty">
                                已根据您的历史数据建立基准。相比通用标准，关注<strong className="text-white">个人基准线的突破</strong>更有意义。
                            </p>
                        </div>
                    </ScrollAnimation>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* AI Coach Prescription */}
                    <ScrollAnimation index={0} className="col-span-1 lg:col-span-2">
                        <CoachPrescription data={data} baselines={baselines} />
                    </ScrollAnimation>

                    {/* 1. Aerobic Efficiency Trend */}
                    <ScrollAnimation index={1} className="col-span-1 lg:col-span-2">
                        <AnalysisCard
                            title="有氧效率"
                            subtitle="Aerobic Efficiency (EF)"
                            icon={FaHeartbeat}
                            className="h-full min-h-[360px] bg-[#1c1c1e] border-white/5"
                            insightType="ef"
                            insightData={data}
                            insightBaseline={efBaseline}
                            headerColor="text-white"
                        >
                            <div className="flex flex-col h-full justify-between pb-2">
                                {/* 1. Hero Metric Section - Apple Style */}
                                <div className="mt-4 mb-8 px-1">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-6xl md:text-7xl font-semibold text-white tracking-tight tabular-nums letter-spacing-tighter">
                                            {data.length > 0 ? data[data.length - 1].ef : '-'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 mt-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[13px] font-medium text-white/50">Baseline {baselines.avgEf}</span>
                                        </div>
                                        {(() => {
                                            const currentEf = data.length > 0 ? data[data.length - 1].ef : 0;
                                            const diff = ((currentEf - efBaseline) / efBaseline) * 100;
                                            const isPositive = diff > 0;
                                            const isSignificant = Math.abs(diff) > 1; // Only show color if diff is significant (>1%)

                                            // Apple style: Subtle pill, color only on text/icon usually, or very soft bg
                                            return (
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {isPositive ? <FaArrowUp className="text-[10px]" /> : <FaArrowDown className="text-[10px]" />}
                                                    <span className="text-[11px] font-semibold tabular-nums">
                                                        {Math.abs(diff).toFixed(1)}%
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* 2. Minimalist Area Chart */}
                                <div className="relative w-full flex-1 min-h-[140px]">
                                    <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="efGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#00EDED" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="#00EDED" stopOpacity="0.0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Minimal Baseline - Single clean line */}
                                        {(() => {
                                            const y = 200 - ((efBaseline - minEf) / (maxEf - minEf)) * 160 - 20;
                                            return (
                                                <line x1="0" y1={y} x2="1000" y2={y} stroke="white" strokeWidth="1" strokeDasharray="4 4" opacity="0.15" vectorEffect="non-scaling-stroke" />
                                            );
                                        })()}

                                        {/* Smooth Area Path */}
                                        <path
                                            d={`
                                                M 0,200
                                                ${data.map((d, i) => {
                                                const x = (i / (data.length - 1)) * 1000;
                                                const y = 200 - ((d.ef - minEf) / (maxEf - minEf)) * 160 - 20;
                                                return `L ${x},${y}`;
                                            }).join(" ")}
                                                L 1000,200 Z
                                            `}
                                            fill="url(#efGradient)"
                                        />

                                        {/* Sharp Line Path */}
                                        <polyline
                                            points={data.map((d, i) => {
                                                const x = (i / (data.length - 1)) * 1000;
                                                const y = 200 - ((d.ef - minEf) / (maxEf - minEf)) * 160 - 20;
                                                return `${x},${y}`;
                                            }).join(" ")}
                                            fill="none"
                                            stroke="#00EDED"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            vectorEffect="non-scaling-stroke"
                                        />

                                        {/* Interactive Points (Only visible on hover ideally, but kept subtle here) */}
                                        {data.map((d, i) => {
                                            const x = (i / (data.length - 1)) * 1000;
                                            const y = 200 - ((d.ef - minEf) / (maxEf - minEf)) * 160 - 20;
                                            return (
                                                <circle key={i} cx={x} cy={y} r={3} fill="#1c1c1e" stroke="#00EDED" strokeWidth="2" className="opacity-0 hover:opacity-100 transition-opacity duration-200" />
                                            );
                                        })}
                                    </svg>

                                    {/* X-Axis Labels (First and Last only) */}
                                    <div className="absolute top-full left-0 right-0 mt-2 flex justify-between text-[10px] font-medium text-white/30 uppercase tracking-widest">
                                        <span>{data[0]?.dateLabel}</span>
                                        <span>{data[data.length - 1]?.dateLabel}</span>
                                    </div>
                                </div>
                            </div>
                        </AnalysisCard>
                    </ScrollAnimation>

                    {/* 2. Cadence - Apple Style */}
                    <ScrollAnimation index={1}>
                        <AnalysisCard
                            title="步频"
                            subtitle="Avg Cadence (SPM)"
                            icon={FaRunning}
                            className="h-full min-h-[360px] bg-[#1c1c1e] border-white/5"
                            insightType="spm"
                            insightData={data}
                            insightBaseline={baselines.avgSpm}
                            headerColor="text-white"
                        >
                            <div className="flex flex-col h-full justify-between pb-2">
                                {/* Hero Metric */}
                                <div className="mt-4 mb-8 px-1">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-6xl md:text-7xl font-semibold text-white tracking-tight tabular-nums letter-spacing-tighter">
                                            {data.length > 0 ? data[data.length - 1].spm : '-'}
                                        </span>
                                        <span className="text-xl text-zinc-500 font-medium tracking-normal">spm</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-800/50 border border-white/5">
                                            <span className="text-[11px] font-medium text-zinc-400">Goal {spmGoal}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Minimalist Bar Chart */}
                                <div className="flex items-end justify-between h-full gap-1.5 w-full min-h-[140px] px-1">
                                    {data.map((d, i) => {
                                        // Scale 150-200 range mostly to emphasize differences
                                        const minDisplay = 150;
                                        const maxDisplay = 200;
                                        const normalized = Math.max(0, Math.min(1, (d.spm - minDisplay) / (maxDisplay - minDisplay)));
                                        const height = 10 + (normalized * 90); // Min 10% height

                                        // Apple Fitness Green for good, Yellow/Orange for low
                                        // Apple Green: #32d74b, Yellow: #ffd60a
                                        const isGood = d.spm >= 170;
                                        const barColor = isGood ? '#32d74b' : '#ffd60a';

                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end group">
                                                <Tooltip label="SPM" value={`${d.spm}`} color={isGood ? "bg-[#32d74b]" : "bg-[#ffd60a]"} />

                                                <div
                                                    className="w-full max-w-[12px] rounded-t-[2px] opacity-80 group-hover:opacity-100 transition-all duration-300"
                                                    style={{
                                                        height: `${height}%`,
                                                        backgroundColor: barColor
                                                    }}
                                                ></div>

                                                {/* X-Axis Date (Every 3rd or specific logic to not crowd) */}
                                                <span className={`text-[9px] text-zinc-600 mt-2 font-medium tabular-nums ${i % 3 === 0 || i === data.length - 1 ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity`}>
                                                    {d.dateLabel.split('/')[1]}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </AnalysisCard>
                    </ScrollAnimation>

                    {/* 3. Training Load - Apple Style */}
                    <ScrollAnimation index={2}>
                        <AnalysisCard
                            title="相对负荷"
                            subtitle="Training Load"
                            icon={FaBolt}
                            className="h-full min-h-[360px] bg-[#1c1c1e] border-white/5 hover:scale-[1.01]"
                            insightType="load"
                            insightData={data}
                            insightBaseline={null}
                            headerColor="text-white"
                        >
                            <div className="flex flex-col h-full justify-between pb-2">
                                {/* Hero Metric */}
                                <div className="mt-4 mb-8 px-1">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-6xl md:text-7xl font-semibold text-white tracking-tight tabular-nums letter-spacing-tighter">
                                            {data.length > 0 ? Math.round(data[data.length - 1].rawLoad) : '-'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-3">
                                        {(() => {
                                            const lastLoad = data.length > 0 ? data[data.length - 1].rawLoad : 0;
                                            const avgLoad = data.reduce((a, b) => a + b.rawLoad, 0) / (data.length || 1);
                                            const ratio = lastLoad / avgLoad;
                                            let label = "Optimal";
                                            let colorClass = "text-zinc-400";

                                            if (ratio > 1.5) { label = "High Load"; colorClass = "text-[#ff2d55]"; } // Apple Red
                                            else if (ratio < 0.6) { label = "Recovery"; colorClass = "text-[#32d74b]"; } // Apple Green

                                            return (
                                                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-800/50 border border-white/5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${ratio > 1.5 ? 'bg-[#ff2d55]' : ratio < 0.6 ? 'bg-[#32d74b]' : 'bg-gray-400'}`}></div>
                                                    <span className={`text-[11px] font-medium ${colorClass}`}>{label}</span>
                                                </div>
                                            )
                                        })()}
                                    </div>
                                </div>

                                {/* Minimalist Bar Chart */}
                                <div className="flex items-end justify-between h-full gap-1.5 w-full min-h-[140px] px-1">
                                    {data.map((d, i) => {
                                        const height = (d.rawLoad / maxLoad) * 100;
                                        // Apple Activity Red: #ff2d55
                                        // Use opacity for visual hierarchy of load
                                        const opacity = 0.5 + ((d.rawLoad / maxLoad) * 0.5);

                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                                <Tooltip label="Load" value={Math.round(d.rawLoad)} color="bg-[#ff2d55]" />
                                                <div
                                                    className="w-full max-w-[12px] rounded-t-[2px] bg-[#ff2d55] group-hover:brightness-110 transition-all duration-300"
                                                    style={{
                                                        height: `${height}%`,
                                                        opacity: opacity
                                                    }}
                                                ></div>
                                                {/* X-Axis Date */}
                                                <span className={`text-[9px] text-zinc-600 mt-2 font-medium tabular-nums ${i % 3 === 0 || i === data.length - 1 ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity`}>
                                                    {d.dateLabel.split('/')[1]}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </AnalysisCard>
                    </ScrollAnimation>
                </div>
            </div>

            {/* Visual Data Stream for Recent Runs (Full Bleed) */}
            <div className="w-full">
                <ScrollAnimation index={3}>
                    <RecentActivityRows runs={runs} />
                </ScrollAnimation>
            </div>
        </section>
    );
};

export default ProfessionalAnalysis;
