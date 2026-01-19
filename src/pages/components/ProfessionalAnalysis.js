import React, { useState, useMemo } from 'react';
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
    <div className={`bg-zinc-900/50 rounded-[32px] p-8 border border-zinc-800 shadow-sm backdrop-blur-sm flex flex-col transition-transform duration-300 hover:scale-[1.01] active:scale-[0.99] transform-gpu ${className}`}>
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
    const prescription = useMemo(() => {
        if (!data || data.length < 2) return null;

        const lastRun = data[data.length - 1];
        const avgLoad = data.reduce((acc, r) => acc + r.rawLoad, 0) / data.length;
        const recentAvgSpm = data.slice(-3).reduce((acc, r) => acc + r.spm, 0) / 3;
        const recentAvgEf = data.slice(-3).reduce((acc, r) => acc + r.ef, 0) / 3;
        const efTrend = recentAvgEf > baselines.avgEf;

        // 1. FATIGUE CHECK (High Priority)
        if (lastRun.rawLoad > avgLoad * 1.5) {
            return {
                type: "恢复跑 (Recovery)",
                icon: FaHeartbeat,
                color: "text-[#FA114F]",
                bg: "bg-[#FA114F]/10",
                border: "border-[#FA114F]/20",
                dist: "3 - 5 KM",
                pace: "不限配速",
                spm: "自然放松",
                reason: "检测到上一场训练负荷较大，身体需要修复。请务必压低心率，完全放松跑。",
                focus: "Zone 1 心率区间"
            };
        }

        // 2. FORM CHECK (Medium Priority)
        if (recentAvgSpm < 168) {
            return {
                type: "步频专项训练 (Cadence Drill)",
                icon: FaRunning,
                color: "text-[#FDB927]",
                bg: "bg-[#FDB927]/10",
                border: "border-[#FDB927]/20",
                dist: "8 KM",
                pace: "稳态配速",
                spm: "175+",
                reason: "近期步频偏低。低步频会显著增加膝盖压力。本次训练不追求速度，只专注于双腿高频切换。",
                focus: "小步幅，快节奏"
            };
        }

        // 3. FITNESS PROGRESSION (Standard)
        if (efTrend) {
            return {
                type: "有氧耐力 (Long Run)",
                icon: FaTrophy,
                color: "text-[#92E12C]",
                bg: "bg-[#92E12C]/10",
                border: "border-[#92E12C]/20",
                dist: "12 - 15 KM",
                pace: "稳定有氧配速",
                spm: "180",
                reason: "您的有氧效率正在提升，状态极佳。适合进行长距离训练以巩固有氧基础。",
                focus: "后半程维持配速"
            };
        }

        // 4. BASE BUILDING (Default)
        return {
            type: "基础有氧 (Base Building)",
            icon: FaCheckCircle,
            color: "text-[#92E12C]",
            bg: "bg-[#92E12C]/10",
            border: "border-[#92E12C]/20",
            dist: "10 KM",
            pace: "轻松跑",
            spm: "175-180",
            reason: "状态稳定。保持当前的训练节奏，积累跑量是变强的唯一捷径。",
            focus: "轻松，享受跑步"
        };
    }, [data, baselines]);

    if (!prescription) return null;

    return (
        <div className="mb-8">
            <div className={`relative overflow-hidden rounded-[32px] p-8 border ${prescription.bg} ${prescription.border} backdrop-blur-sm transition-transform duration-300 hover:scale-[1.005]`}>
                {/* Background Decor */}
                <div className={`absolute -right-10 -top-10 w-64 h-64 rounded-full ${prescription.bg} blur-3xl opacity-20 pointer-events-none`}></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`p-3 rounded-full bg-white dark:bg-black/30 shadow-sm ${prescription.color}`}>
                            <prescription.icon className="text-xl" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wider uppercase">AI 教练推荐 (Next Workout)</h3>
                            <h2 className={`text-2xl md:text-3xl font-black ${prescription.color} mt-1`}>{prescription.type}</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Target: Distance */}
                        <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-4 border border-white/20 dark:border-white/5 backdrop-blur-md">
                            <span className="text-xs font-bold text-gray-500 uppercase">计划距离</span>
                            <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tabular-nums mt-1">{prescription.dist}</div>
                        </div>
                        {/* Target: Pace */}
                        <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-4 border border-white/20 dark:border-white/5 backdrop-blur-md">
                            <span className="text-xs font-bold text-gray-500 uppercase">建议配速</span>
                            <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tabular-nums mt-1">{prescription.pace}</div>
                        </div>
                        {/* Target: Focus */}
                        <div className="bg-white/60 dark:bg-black/20 rounded-2xl p-4 border border-white/20 dark:border-white/5 backdrop-blur-md">
                            <span className="text-xs font-bold text-gray-500 uppercase">关键指标</span>
                            <div className={`text-2xl md:text-3xl font-black ${prescription.color} tabular-nums mt-1`}>{prescription.spm}</div>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/10">
                        <FaLightbulb className={`${prescription.color} mt-1 shrink-0`} />
                        <div>
                            <h4 className={`text-sm font-bold ${prescription.color} mb-1`}>推荐理由</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium text-balance">
                                {prescription.reason} <span className="opacity-70">本次训练核心关注：{prescription.focus}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RecentActivityRows = ({ runs }) => {
    // State for interactive comparison line
    const [guide, setGuide] = useState(null);

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
    const maxDist = Math.max(...recent.map(r => r.distKm)) * 1.1; // Add buffer
    const maxHR = Math.max(...recent.map(r => r.hr)) * 1.1;
    const maxPace = Math.max(...recent.map(r => r.paceDecimal)) * 1.1;

    // Identify "Best" values
    // Best Pace = Lowest value
    const bestPaceVal = Math.min(...recent.map(r => r.paceDecimal));
    // Best Dist = Highest value
    const bestDistVal = Math.max(...recent.map(r => r.distKm));
    // Best HR = Lowest value (efficiency)
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
        <div className="bg-black py-[250px] px-6 md:px-12 w-full shadow-2xl relative overflow-hidden group/card"
            onClick={() => setGuide(null)}>
            {/* Subtle Grid Background for Pro feel */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay pointer-events-none"></div>

            <div className="max-w-7xl mx-auto">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight mb-10 relative z-10">
                    <FaStream className="text-zinc-500 text-lg" />
                    近期训练流 (Data Stream)
                    {guide && <span className="text-[10px] font-normal text-zinc-500 ml-2 animate-pulse">• 点击背景取消对比</span>}
                </h3>

                <div className="space-y-10 relative z-10">

                    {/* Global Guide Line Overlay */}
                    {guide && (
                        <div
                            className="absolute top-[-20px] bottom-[-20px] pointer-events-none z-10 flex flex-col items-center"
                            style={{
                                left: `calc(4rem + 16px + (100% - 4rem - 16px) * ${guide.leftPercentage / 100})`,
                                transition: 'left 0.3s ease-out'
                            }}
                        >
                            {/* Line */}
                            <div className="h-full border-l-2 border-dashed opacity-80 shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ borderColor: guide.color }}></div>

                            {/* Badge */}
                            <div className="absolute top-0 -translate-y-1/2 bg-black/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg whitespace-nowrap border border-white/10 tabular-nums"
                                style={{ color: guide.color }}>
                                {guide.valueLabel}
                            </div>
                        </div>
                    )}

                    {recent.map((run, i) => {
                        const isBestPace = Math.abs(run.paceDecimal - bestPaceVal) < 0.01;
                        const isBestDist = Math.abs(run.distKm - bestDistVal) < 0.01;
                        const isBestHR = Math.abs(run.hr - bestHRVal) < 0.1;

                        return (
                            <div key={i} className="flex flex-col md:flex-row items-start md:items-center gap-6 group relative">
                                {/* Date */}
                                <div className="w-16 text-xs font-bold text-zinc-500 font-mono tracking-wider shrink-0 transition-colors group-hover:text-zinc-300 tabular-nums text-right">
                                    {run.dateLabel.replace('/', ' – ')}
                                </div>

                                {/* Visualization Track */}
                                <div className="flex-1 w-full relative h-[60px] flex items-center">


                                    {/* Stacked/Parallel Metrics */}
                                    <div className="w-full h-full relative flex flex-col justify-center gap-[8px]">

                                        {/* PACE (Apple Blue #00EDED) */}
                                        <div
                                            className={`relative h-[10px] rounded-full transition-all duration-500 cursor-pointer hover:h-[12px] ${isBestPace ? 'shadow-[0_0_15px_rgba(0,237,237,0.9)] ring-1 ring-[#00EDED]/50' : 'shadow-[0_0_10px_rgba(0,237,237,0.3)]'}`}
                                            style={{
                                                width: `${(run.paceDecimal / maxPace) * 80}%`,
                                                backgroundColor: '#00EDED'
                                            }}
                                            onClick={(e) => handleBarClick(e, 'pace', run.paceDecimal, (run.paceDecimal / maxPace) * 80, '#00EDED', `PACE ${run.paceLabel} /km`)}
                                        >
                                            <div className="absolute -top-5 left-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                <span className="text-[10px] font-bold whitespace-nowrap bg-black/50 backdrop-blur px-1 rounded text-[#00EDED] tabular-nums">
                                                    PACE {run.paceLabel}
                                                </span>
                                                {isBestPace && <FaBolt className="text-[12px] text-[#FDB927] animate-pulse drop-shadow-md" />}
                                            </div>
                                        </div>

                                        {/* HR (Apple Red #FA114F) */}
                                        <div
                                            className={`relative h-[10px] rounded-full transition-all duration-500 delay-75 cursor-pointer hover:h-[12px] ${isBestHR ? 'shadow-[0_0_15px_rgba(250,17,79,0.9)] ring-1 ring-[#FA114F]/50' : 'shadow-[0_0_10px_rgba(250,17,79,0.3)]'}`}
                                            style={{
                                                width: `${(run.hr / maxHR) * 90}%`,
                                                backgroundColor: '#FA114F'
                                            }}
                                            onClick={(e) => handleBarClick(e, 'hr', run.hr, (run.hr / maxHR) * 90, '#FA114F', `HR ${Math.round(run.hr)}`)}
                                        >
                                            <div className="absolute -top-5 left-1/3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                <span className="text-[10px] font-bold whitespace-nowrap bg-black/50 backdrop-blur px-1 rounded text-[#FA114F] tabular-nums">
                                                    HR {Math.round(run.hr)}
                                                </span>
                                                {isBestHR && <FaHeartbeat className="text-[12px] text-[#FA114F] animate-pulse drop-shadow-md" />}
                                            </div>
                                        </div>

                                        {/* DIST (Apple Green #92E12C) */}
                                        <div
                                            className={`relative h-[10px] rounded-full transition-all duration-500 delay-150 cursor-pointer hover:h-[12px] ${isBestDist ? 'shadow-[0_0_15px_rgba(146,225,44,0.9)] ring-1 ring-[#92E12C]/50' : 'shadow-[0_0_10px_rgba(146,225,44,0.3)]'}`}
                                            style={{
                                                width: `${(run.distKm / maxDist) * 100}%`,
                                                backgroundColor: '#92E12C'
                                            }}
                                            onClick={(e) => handleBarClick(e, 'dist', run.distKm, (run.distKm / maxDist) * 100, '#92E12C', `DIST ${run.distKm.toFixed(2)}`)}
                                        >
                                            <div className="absolute -top-5 right-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                <span className="text-[10px] font-bold whitespace-nowrap bg-black/50 backdrop-blur px-1 rounded text-[#92E12C] tabular-nums">
                                                    DIST {run.distKm.toFixed(2)}
                                                </span>
                                                {isBestDist && <FaTrophy className="text-[12px] text-[#FDB927] animate-bounce drop-shadow-md" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* Legend for Best */}
                <div className="mt-6 flex justify-end gap-3 text-[9px] text-gray-400 font-medium opacity-60">
                    <span className="flex items-center gap-1"><FaBolt className="text-[#FDB927]" /> Fastest</span>
                    <span className="flex items-center gap-1"><FaHeartbeat className="text-[#FA114F]" /> Lowest HR</span>
                    <span className="flex items-center gap-1"><FaTrophy className="text-[#00EDED]" /> Longest</span>
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
                            title="有氧效率 (EF)"
                            subtitle={`基准线: ${baselines.avgEf} • 目标: 维持在基准之上`}
                            icon={FaHeartbeat}
                            className="h-full"
                            insightType="ef"
                            insightData={data}
                            insightBaseline={efBaseline}
                            headerColor="text-[#00EDED]"
                        >
                            <div className="absolute inset-0 flex items-end justify-between px-4 pb-2">
                                {/* 1. Pure SVG Line (Ok to Stretch) */}
                                <svg className="absolute inset-0 w-full h-full overflow-visible p-4" viewBox="0 0 1000 200" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#00EDED" />
                                            <stop offset="100%" stopColor="#00EDED" />
                                        </linearGradient>
                                    </defs>

                                    {/* Personal Baseline Line */}
                                    {(() => {
                                        const y = 200 - ((efBaseline - minEf) / (maxEf - minEf)) * 160 - 20;
                                        return (
                                            <line x1="0" y1={y} x2="1000" y2={y} stroke="#00EDED" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" vectorEffect="non-scaling-stroke" />
                                        );
                                    })()}

                                    <polyline
                                        points={data.map((d, i) => {
                                            const x = (i / (data.length - 1)) * 1000;
                                            const y = 200 - ((d.ef - minEf) / (maxEf - minEf)) * 160 - 20;
                                            return `${x},${y}`;
                                        }).join(" ")}
                                        fill="none"
                                        stroke="url(#lineGradient)"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        vectorEffect="non-scaling-stroke"
                                        className="drop-shadow-lg"
                                    />
                                </svg>

                                {/* 2. HTML Overlay Points (Never Distort) */}
                                <div className="absolute inset-0 p-4 pointer-events-none">
                                    {(() => {
                                        // Render Baseline Label separately to avoid SVG text stretch too
                                        const baselineYPercent = 10 + (1 - (efBaseline - minEf) / (maxEf - minEf)) * 80;
                                        return (
                                            <div className="absolute left-2 text-[10px] font-bold text-[#00EDED] tabular-nums -translate-y-1/2" style={{ top: `${baselineYPercent}%` }}>
                                                个人基准 {baselines.avgEf}
                                            </div>
                                        )
                                    })()}

                                    {data.map((d, i) => {
                                        const normalize = (d.ef - minEf) / (maxEf - minEf);
                                        const leftPercent = (i / (data.length - 1)) * 100;
                                        const topPercent = 10 + (1 - normalize) * 80; // Margin 10%, Height 80% (Matches SVG 20/200, 160/200)

                                        const isAboveAvg = d.ef >= efBaseline;

                                        return (
                                            <div
                                                key={i}
                                                className="absolute group pointer-events-auto flex items-center justify-center -translate-x-1/2 -translate-y-1/2 w-8 h-8 cursor-pointer"
                                                style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                                            >
                                                {/* The Dot */}
                                                <div className={`w-2.5 h-2.5 rounded-full shadow-sm transition-all duration-300 group-hover:scale-150 ${isAboveAvg ? 'bg-white ring-2 ring-[#00EDED]' : 'bg-gray-400'}`}></div>

                                                {/* Tooltip */}
                                                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                                    <span className={`${isAboveAvg ? 'bg-[#00EDED]' : 'bg-gray-500'} text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-lg tabular-nums`}>
                                                        {d.ef} ({d.dateLabel})
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </AnalysisCard>
                    </ScrollAnimation>

                    {/* 2. Cadence */}
                    <ScrollAnimation index={1}>
                        <AnalysisCard
                            title="步频 (SPM)"
                            subtitle={`个人基准: ${baselines.avgSpm} • 下阶段目标: ${spmGoal}`}
                            icon={FaRunning}
                            className="h-full"
                            insightType="spm"
                            insightData={data}
                            insightBaseline={baselines.avgSpm}
                            headerColor="text-[#92E12C]"
                        >
                            <div className="flex items-end justify-between h-full gap-2 px-2">
                                {data.map((d, i) => {
                                    const height = (d.spm / 200) * 100;
                                    let colorClass = "bg-[#FDB927]";
                                    if (d.spm >= spmGoal) colorClass = "bg-[#92E12C]"; // Green
                                    else if (d.spm >= baselines.avgSpm) colorClass = "bg-[#92E12C]/70"; // Green Fade

                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                            <Tooltip label="步频" value={`${d.spm}`} color={d.spm >= spmGoal ? "bg-[#92E12C]" : "bg-[#FDB927]"} />
                                            <div
                                                className={`w-full max-w-[16px] rounded-t-lg transition-all duration-500 ${colorClass} opacity-80 group-hover:opacity-100`}
                                                style={{ height: `${height}%` }}
                                            ></div>
                                            <span className="text-[9px] text-gray-400 mt-2 font-medium tabular-nums">{d.dateLabel}</span>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="absolute top-[16%] left-0 right-0 border-t border-dashed border-[#92E12C]/30 pointer-events-none flex items-center">
                                <span className="text-[9px] text-[#92E12C] font-bold bg-[#92E12C]/10 px-1 rounded ml-2 tabular-nums">目标 {spmGoal}</span>
                            </div>
                        </AnalysisCard>
                    </ScrollAnimation>

                    {/* 3. Training Load */}
                    <ScrollAnimation index={2}>
                        <AnalysisCard
                            title="相对负荷 (Load)"
                            subtitle="强度 x 时间 • 个人疲劳监控"
                            icon={FaBolt}
                            className="h-full"
                            insightType="load"
                            insightData={data}
                            insightBaseline={null}
                            headerColor="text-[#FA114F]"
                        >
                            <div className="flex items-end justify-between h-full gap-3 px-2">
                                {data.map((d, i) => {
                                    const height = (d.rawLoad / maxLoad) * 100;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                            <Tooltip label="负荷" value={Math.round(d.rawLoad)} color="bg-[#FA114F]" />
                                            <div
                                                className="w-full max-w-[20px] rounded-md bg-[#FA114F]/20 group-hover:bg-[#FA114F] transition-colors duration-300 relative overflow-hidden"
                                                style={{ height: `${height}%` }}
                                            >
                                                <div className="absolute bottom-0 left-0 right-0 bg-[#FA114F] h-1"></div>
                                            </div>
                                            <span className="text-[9px] text-gray-400 mt-2 font-medium tabular-nums">{d.dateLabel}</span>
                                        </div>
                                    )
                                })}
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
