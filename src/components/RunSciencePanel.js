/**
 * Run Science Panel - Pure Algorithm Dashboard
 * 纯科学算法驱动的跑步分析面板
 * 基于 Jack Daniels VDOT 理论，无 AI 依赖
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaRunning, FaTachometerAlt, FaChartLine, FaHeartbeat } from 'react-icons/fa';
import { analyzeVDOT, calculateTrainingZones, predictRaceTimes, analyzeWeeklyVolume, analyzeAerobicEfficiency, generateTrainingSuggestion } from '../lib/runScience';

const RunSciencePanel = ({ runs }) => {
    // 本地计算科学指标 (Single Source of Truth)
    const metrics = useMemo(() => {
        if (!runs || runs.length < 3) return null;

        const vdot = analyzeVDOT(runs);
        const zones = vdot.vdot ? calculateTrainingZones(vdot.vdot) : null;
        const predictions = vdot.vdot ? predictRaceTimes(vdot.vdot) : null;
        const weeklyVolume = analyzeWeeklyVolume(runs);
        const efficiency = analyzeAerobicEfficiency(runs);

        const suggestion = generateTrainingSuggestion({
            vdot: vdot.vdot,
            zones,
            weeklyVolume,
            efficiency,
            recentRuns: runs.slice(0, 5)
        });

        return { vdot, zones, predictions, weeklyVolume, efficiency, suggestion };
    }, [runs]);

    if (!runs || runs.length < 3 || !metrics) return null;

    // 训练类型颜色
    const getTypeStyle = (type) => {
        const styles = {
            'easy': { bg: 'bg-emerald-500', text: 'text-emerald-400' },
            'recovery': { bg: 'bg-blue-500', text: 'text-blue-400' },
            'tempo': { bg: 'bg-amber-500', text: 'text-amber-400' },
            'long_easy': { bg: 'bg-cyan-500', text: 'text-cyan-400' },
            'base': { bg: 'bg-emerald-500', text: 'text-emerald-400' }
        };
        return styles[type] || styles.easy;
    };

    const typeStyle = getTypeStyle(metrics.suggestion?.type);

    return (
        <div className="space-y-6">
            {/* 训练建议卡片 */}
            {metrics.suggestion && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative overflow-hidden bg-gradient-to-br from-[#1c1c1e] to-black rounded-3xl p-1 border border-white/10 shadow-2xl"
                >
                    <div className={`absolute inset-0 opacity-30 bg-gradient-to-r ${typeStyle.bg} blur-xl`} />

                    <div className="relative bg-[#0A0A0A]/90 backdrop-blur-md rounded-[22px] p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-2 h-2 rounded-full ${typeStyle.bg} animate-pulse`} />
                                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                        下一次训练建议
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white bg-white/10">
                                        Jack Daniels 算法
                                    </span>
                                </div>

                                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                                    {metrics.suggestion.title}
                                </h2>
                                <p className="text-lg font-semibold text-zinc-300 mb-3">
                                    {metrics.suggestion.distance}
                                </p>
                                <p className="text-sm text-zinc-400 mb-4 max-w-lg leading-relaxed">
                                    {metrics.suggestion.rationale}
                                </p>

                                <div className="flex flex-wrap items-center gap-4 text-zinc-400 text-sm">
                                    <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                                        <FaRunning className={typeStyle.text} />
                                        配速 <span className="font-bold text-white">{metrics.suggestion.pace}</span>
                                    </span>
                                    {metrics.suggestion.hrZone && (
                                        <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                                            <FaHeartbeat className="text-red-400" />
                                            心率 <span className="font-bold text-white">{metrics.suggestion.hrZone}</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="w-full md:w-auto px-8 py-6 rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center">
                                <span className="text-xs text-zinc-500 uppercase font-bold mb-2">执行配速</span>
                                <span className="text-4xl font-black text-white tabular-nums">
                                    {metrics.suggestion.pace?.split("'")[0] || '-'}
                                    <span className="text-xl">&apos;{metrics.suggestion.pace?.split("'")[1]?.replace('"', '') || '00'}</span>
                                </span>
                                <span className="text-xs text-zinc-600 mt-1">分钟/公里</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* VDOT 跑力卡片 */}
            {metrics.vdot?.vdot && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                    className="relative overflow-hidden bg-zinc-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <FaTachometerAlt />
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight">VDOT 跑力指数</h3>
                        </div>
                        <div className="mt-2 md:mt-0 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs font-medium text-zinc-400">
                            基于 Jack Daniels 算法
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                        <div className="md:col-span-1">
                            <div className="flex items-baseline gap-2">
                                <span className="text-8xl font-black text-white tracking-tighter">
                                    {metrics.vdot.vdot}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-400 mt-2 font-medium">当前跑力值</p>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {metrics.vdot.trend === 'improving' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs font-bold">
                                        📈 持续提升
                                    </span>
                                )}
                                {metrics.vdot.trend === 'declining' && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs font-bold">
                                        📉 略有下降
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 text-zinc-400 rounded text-xs font-bold border border-white/5">
                                    最佳 {metrics.vdot.bestVdot}
                                </span>
                            </div>
                        </div>

                        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {metrics.predictions && Object.entries(metrics.predictions).map(([distance, time]) => (
                                <div key={distance} className="bg-white/5 rounded-2xl p-4 flex flex-col justify-center border border-white/5 hover:bg-white/10 transition-colors">
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">{distance}</div>
                                    <div className="text-lg font-bold text-white tabular-nums tracking-tight">{time}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* 周跑量状态提示 */}
            {metrics.weeklyVolume?.recommendation && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                    className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3"
                >
                    <span className="text-xl">⚠️</span>
                    <div>
                        <p className="text-sm font-medium text-amber-300">{metrics.weeklyVolume.recommendation}</p>
                        <p className="text-xs text-zinc-500 mt-1">
                            本周跑量: {metrics.weeklyVolume.currentVolume} km |
                            近期平均: {metrics.weeklyVolume.avgVolume} km
                        </p>
                    </div>
                </motion.div>
            )}

            {/* 有氧效率提示 */}
            {metrics.efficiency?.trend && metrics.efficiency.trend !== 'insufficient_data' && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                    className={`${metrics.efficiency.trend === 'improving' ? 'bg-green-500/10 border-green-500/20' : metrics.efficiency.trend === 'declining' ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/10'} border rounded-2xl p-4 flex items-start gap-3`}
                >
                    <FaChartLine className={metrics.efficiency.trend === 'improving' ? 'text-green-400' : metrics.efficiency.trend === 'declining' ? 'text-red-400' : 'text-zinc-400'} />
                    <div>
                        <p className={`text-sm font-medium ${metrics.efficiency.trend === 'improving' ? 'text-green-300' : metrics.efficiency.trend === 'declining' ? 'text-red-300' : 'text-zinc-300'}`}>
                            {metrics.efficiency.message}
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default RunSciencePanel;
