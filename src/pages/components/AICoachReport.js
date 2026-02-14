/**
 * AI Coach Report Component - Redesigned
 * 匹配 Apple/Nike 风格的高端 UI
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaSync, FaChartLine, FaRunning, FaTachometerAlt, FaMedal, FaQuoteLeft } from 'react-icons/fa';
import { analyzeVDOT, calculateTrainingZones, predictRaceTimes, analyzeWeeklyVolume, analyzeAerobicEfficiency, generateTrainingSuggestion } from '../../lib/runScience';

const AICoachReport = ({ runs }) => {
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);
    // const [structuredPlan, setStructuredPlan] = useState(null); // Deprecated: AI plan is unreliable
    const [metrics, setMetrics] = useState(null);
    const [error, setError] = useState(null);
    const [showZones, setShowZones] = useState(true);

    // 本地计算科学指标 (Single Source of Truth)
    const localMetrics = useMemo(() => {
        if (!runs || runs.length < 3) return null;

        const vdot = analyzeVDOT(runs);
        const zones = vdot.vdot ? calculateTrainingZones(vdot.vdot) : null;
        const predictions = vdot.vdot ? predictRaceTimes(vdot.vdot) : null;

        // 增加跑量和效率分析
        const weeklyVolume = analyzeWeeklyVolume(runs);
        const efficiency = analyzeAerobicEfficiency(runs);

        // 基于算法直接生成建议，不依赖 AI 幻觉
        const suggestion = generateTrainingSuggestion({
            vdot: vdot.vdot,
            zones,
            weeklyVolume,
            efficiency,
            recentRuns: runs.slice(0, 5)
        });

        return { vdot, zones, predictions, weeklyVolume, efficiency, suggestion };
    }, [runs]);

    // 调用 AI 分析
    const fetchAIAnalysis = async () => {
        if (!runs || runs.length < 3) return;

        setLoading(true);
        setError(null);
        setStructuredPlan(null);

        try {
            const response = await fetch('/api/ai-coach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ runs })
            });

            const data = await response.json();

            if (data.success) {
                // 尝试提取 JSON 代码块（仅用于清理文本，不用于生成建议）
                const jsonMatch = data.analysis.match(/```json\s*(\{[\s\S]*?\})\s*```/);
                if (jsonMatch) {
                    setReport(data.analysis.replace(/```json[\s\S]*?```/, '').trim());
                } else {
                    setReport(data.analysis);
                }
                setMetrics(data.metrics);
            } else if (data.fallbackAnalysis) {
                setReport(data.fallbackAnalysis);
                setMetrics(null);
            } else {
                setError(data.error || '分析失败');
            }
        } catch (err) {
            setError('无法连接 AI 服务');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!runs || runs.length < 3) return null;

    // 训练类型对应的颜色映射
    const typeColors = {
        'E': { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/20', label: '轻松跑' },
        'M': { bg: 'bg-cyan-500', text: 'text-cyan-400', border: 'border-cyan-500/20', label: '马拉松配速' },
        'T': { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/20', label: '乳酸阈值' },
        'I': { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/20', label: '间歇跑' },
        'R': { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/20', label: '冲刺跑' }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左侧：核心指标面板 (8/12) */}
            <div className="lg:col-span-8 flex flex-col gap-6">

                {/* 1. 动态训练建议卡片 (Powered by Local Algorithm) */}
                <AnimatePresence>
                    {localMetrics?.suggestion && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative overflow-hidden bg-gradient-to-br from-[#1c1c1e] to-black rounded-3xl p-1 border border-white/10 shadow-2xl"
                        >
                            {/* 动态边框光效 */}
                            <div className={`absolute inset-0 opacity-40 bg-gradient-to-r ${typeColors[localMetrics.suggestion.type === 'tempo' ? 'T' : 'E']?.bg || 'gray-500'} blur-xl`} />

                            <div className="relative bg-[#0A0A0A]/80 backdrop-blur-md rounded-[22px] p-6 md:p-8 overflow-hidden">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${typeColors[localMetrics.suggestion.type === 'tempo' ? 'T' : 'E']?.bg || 'bg-white'} animate-pulse`} />
                                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">下一次训练建议 (科学算法)</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white bg-white/5`}>
                                                {localMetrics.suggestion.title}
                                            </span>
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tight mb-2">
                                            {localMetrics.suggestion.distance}
                                        </h2>
                                        <p className="text-sm text-zinc-400 mb-2 font-medium max-w-md">
                                            {localMetrics.suggestion.rationale}
                                        </p>
                                        <div className="flex items-center gap-4 text-zinc-400 text-sm">
                                            <span className="flex items-center gap-1"><FaRunning /> 配速 {localMetrics.suggestion.pace}</span>
                                            {localMetrics.suggestion.duration && (
                                                <span className="flex items-center gap-1"><FaSync /> 时长 {localMetrics.suggestion.duration}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={`w-full md:w-auto px-6 py-4 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center justify-center`}>
                                        <span className="text-xs text-zinc-500 uppercase font-bold mb-1">执行配速</span>
                                        <span className={`text-3xl font-black text-white tabular-nums`}>
                                            {localMetrics.suggestion.pace.replace(/\/km|['"]/g, '').split("'")[0]}<span className="text-lg">'{localMetrics.suggestion.pace.split("'")[1]?.replace('"', '') || '00'}</span>
                                        </span>
                                        <span className="text-[10px] text-zinc-600">分钟/公里</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 2. VDOT 跑力卡片 */}
                {localMetrics?.vdot?.vdot && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden bg-zinc-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

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
                                        {localMetrics.vdot.vdot}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-400 mt-2 font-medium">当前跑力值</p>

                                <div className="mt-4 flex gap-2">
                                    {localMetrics.vdot.trend === 'improving' && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs font-bold">
                                            📈 持续提升
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 text-zinc-400 rounded text-xs font-bold border border-white/5">
                                        最佳 {localMetrics.vdot.bestVdot}
                                    </span>
                                </div>
                            </div>

                            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {localMetrics.predictions && Object.entries(localMetrics.predictions).map(([distance, time]) => (
                                    <div key={distance} className="bg-white/5 rounded-2xl p-4 flex flex-col justify-center border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">{distance}</div>
                                        <div className="text-lg font-bold text-white tabular-nums tracking-tight">{time}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* 右侧：AI 教练 Chat 面板 (4/12) */}
            <div className="lg:col-span-4 h-full">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="h-full min-h-[500px] flex flex-col bg-zinc-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <FaRobot className="text-white text-lg" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base">AI 智能教练</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Gemini Powered</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-6 overflow-y-auto bg-[#0A0A0A] custom-scrollbar">
                        {!report && !loading && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                <FaChartLine className="text-5xl text-zinc-700" />
                                <p className="text-sm text-zinc-500 max-w-[200px]">点击下方按钮，基于您的 {runs.length} 次跑步数据生成深度分析</p>
                            </div>
                        )}

                        {loading && (
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0" />
                                    <div className="space-y-2 w-full">
                                        <div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" />
                                        <div className="h-4 bg-zinc-800 rounded w-1/2 animate-pulse" />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex-shrink-0" />
                                    <div className="space-y-2 w-full">
                                        <div className="h-4 bg-zinc-800 rounded w-5/6 animate-pulse" />
                                        <div className="h-4 bg-zinc-800 rounded w-2/3 animate-pulse" />
                                        <div className="h-4 bg-zinc-800 rounded w-4/5 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {report && !loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6"
                            >
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <div
                                        className="text-zinc-300 leading-relaxed font-light space-y-4"
                                        dangerouslySetInnerHTML={{ __html: formatMarkdown(report) }}
                                    />
                                </div>
                                <div className="text-[10px] text-zinc-600 text-center pt-4 border-t border-white/5">
                                    AI 生成内容仅供参考，请结合身体感受训练
                                </div>
                            </motion.div>
                        )}

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                                <span className="text-lg">⚠️</span> {error}
                            </div>
                        )}
                    </div>

                    {/* Footer / Action */}
                    <div className="p-4 border-t border-white/5 bg-zinc-900 z-20">
                        <button
                            onClick={fetchAIAnalysis}
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <FaSync className="animate-spin" /> 正在分析数据...
                                </>
                            ) : (
                                <>
                                    <FaQuoteLeft className="text-xs" /> 生成个性化分析报告
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// 优化后的 Markdown 格式化
function formatMarkdown(text) {
    if (!text) return '';

    // 移除 markdown 标题符号，改为 HTML 结构
    return text
        .replace(/##\s+(.+)/g, (match, p1) => {
            const icons = {
                '数据洞察': '📊',
                '当前状态': '💪',
                '训练建议': '🎯',
                '中期发展': '📈',
                '注意事项': '⚠️'
            };
            let icon = '';
            for (const key in icons) {
                if (p1.includes(key)) icon = icons[key];
            }
            return `<div class="flex items-center gap-2 text-white font-bold text-base mt-6 mb-3"><span class="text-lg">${icon}</span> ${p1}</div>`;
        })
        .replace(/\*\*(.+?)\*\*/g, '<span class="font-bold text-white bg-white/10 px-1 rounded">$1</span>')
        .replace(/\n\n/g, '<div class="h-2"></div>') // 段落间距
        .replace(/\n/g, '<br />');
}

export default AICoachReport;
