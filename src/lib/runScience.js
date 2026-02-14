/**
 * Running Science Library
 * 基于 Jack Daniels 跑力理论的运动科学计算
 * 
 * 参考资料:
 * - Jack Daniels' Running Formula (3rd Edition)
 * - VDOT O2 Running Calculator
 */

// ============================================
// VDOT 跑力计算 (Jack Daniels Formula)
// ============================================

/**
 * 根据比赛成绩计算 VDOT 值
 * @param {number} distanceKm - 比赛距离 (公里)
 * @param {number} timeMinutes - 完成时间 (分钟)
 * @returns {number} VDOT 值
 */
export function calculateVDOT(distanceKm, timeMinutes) {
    // 将距离转换为米
    const distanceMeters = distanceKm * 1000;

    // 计算速度 (米/分钟)
    const velocity = distanceMeters / timeMinutes;

    // Daniels 公式中的 VO2 估算
    // VO2 = -4.60 + 0.182258 * v + 0.000104 * v^2
    const vo2 = -4.60 + 0.182258 * velocity + 0.000104 * Math.pow(velocity, 2);

    // 时间因子 (效率随时间下降)
    // %VO2max = 0.8 + 0.1894393 * e^(-0.012778 * t) + 0.2989558 * e^(-0.1932605 * t)
    const timeFactor = 0.8 + 0.1894393 * Math.exp(-0.012778 * timeMinutes)
        + 0.2989558 * Math.exp(-0.1932605 * timeMinutes);

    // VDOT = VO2 / timeFactor
    const vdot = vo2 / timeFactor;

    return Math.round(vdot * 10) / 10;
}

/**
 * 根据历史跑步数据计算平均 VDOT
 * @param {Array} runs - 跑步记录数组
 * @returns {Object} { vdot, bestVdot, recentVdot, trend }
 */
export function analyzeVDOT(runs) {
    if (!runs || runs.length < 3) {
        return { vdot: null, bestVdot: null, recentVdot: null, trend: 'insufficient_data' };
    }

    // 只使用有效的长距离跑步 (>3km, 排除热身/恢复跑)
    const validRuns = runs.filter(r => {
        const distKm = r.distance / 1000;
        const durationMin = r.moving_time / 60;
        return distKm >= 3 && durationMin >= 15;
    });

    if (validRuns.length === 0) {
        return { vdot: null, bestVdot: null, recentVdot: null, trend: 'no_valid_runs' };
    }

    // 计算每次跑步的 VDOT
    const vdotValues = validRuns.map(r => ({
        date: new Date(r.start_date),
        vdot: calculateVDOT(r.distance / 1000, r.moving_time / 60),
        distance: r.distance / 1000,
        pace: (r.moving_time / 60) / (r.distance / 1000)
    }));

    // 按日期排序
    vdotValues.sort((a, b) => a.date - b.date);

    // 最佳 VDOT (取前 3 名的平均，更稳定)
    const sortedByVdot = [...vdotValues].sort((a, b) => b.vdot - a.vdot);
    const topRuns = sortedByVdot.slice(0, Math.min(3, sortedByVdot.length));
    const bestVdot = topRuns.reduce((sum, r) => sum + r.vdot, 0) / topRuns.length;

    // 近期 VDOT (最近 5 次有效跑步)
    const recentRuns = vdotValues.slice(-5);
    const recentVdot = recentRuns.reduce((sum, r) => sum + r.vdot, 0) / recentRuns.length;

    // 整体平均
    const avgVdot = vdotValues.reduce((sum, r) => sum + r.vdot, 0) / vdotValues.length;

    // 趋势分析 (最近 5 次 vs 之前)
    let trend = 'stable';
    if (vdotValues.length >= 10) {
        const olderRuns = vdotValues.slice(0, -5);
        const olderAvg = olderRuns.reduce((sum, r) => sum + r.vdot, 0) / olderRuns.length;
        const diff = ((recentVdot - olderAvg) / olderAvg) * 100;

        if (diff > 2) trend = 'improving';
        else if (diff < -2) trend = 'declining';
    }

    return {
        vdot: Math.round(avgVdot * 10) / 10,
        bestVdot: Math.round(bestVdot * 10) / 10,
        recentVdot: Math.round(recentVdot * 10) / 10,
        trend,
        history: vdotValues.slice(-12) // 返回最近 12 次用于图表
    };
}

// ============================================
// 训练区间计算 (E/M/T/I/R 五区)
// ============================================

/**
 * 根据 VDOT 计算五区训练配速
 * @param {number} vdot - VDOT 值
 * @returns {Object} 五区配速 (分钟/公里)
 */
export function calculateTrainingZones(vdot) {
    if (!vdot || vdot < 20 || vdot > 85) {
        return null;
    }

    // 基于 VDOT 表的近似公式
    // 这些系数是从 Jack Daniels 跑力表拟合得出

    // E (Easy) - 轻松跑: ~59-74% VO2max
    const ePace = 7.5 - (vdot - 30) * 0.06;

    // M (Marathon) - 马拉松配速: ~75-84% VO2max
    const mPace = 6.8 - (vdot - 30) * 0.055;

    // T (Threshold) - 乳酸阈值: ~83-88% VO2max
    const tPace = 6.2 - (vdot - 30) * 0.05;

    // I (Interval) - 间歇训练: ~95-100% VO2max
    const iPace = 5.5 - (vdot - 30) * 0.045;

    // R (Repetition) - 重复跑: ~105-110% VO2max
    const rPace = 5.0 - (vdot - 30) * 0.04;

    return {
        easy: {
            name: 'Easy (轻松跑)',
            code: 'E',
            pace: formatPace(Math.max(ePace, 4.5)),
            paceDecimal: Math.max(ePace, 4.5),
            hrZone: '60-70%',
            purpose: '有氧基础、恢复、脂肪代谢',
            weeklyRatio: '70-80%'
        },
        marathon: {
            name: 'Marathon (马拉松配速)',
            code: 'M',
            pace: formatPace(Math.max(mPace, 4.0)),
            paceDecimal: Math.max(mPace, 4.0),
            hrZone: '75-84%',
            purpose: '比赛模拟、耐力测试',
            weeklyRatio: '5-10%'
        },
        threshold: {
            name: 'Threshold (乳酸阈值)',
            code: 'T',
            pace: formatPace(Math.max(tPace, 3.5)),
            paceDecimal: Math.max(tPace, 3.5),
            hrZone: '83-88%',
            purpose: '提升乳酸清除能力',
            weeklyRatio: '10-15%'
        },
        interval: {
            name: 'Interval (间歇)',
            code: 'I',
            pace: formatPace(Math.max(iPace, 3.0)),
            paceDecimal: Math.max(iPace, 3.0),
            hrZone: '95-100%',
            purpose: '提升最大摄氧量',
            weeklyRatio: '5-8%'
        },
        repetition: {
            name: 'Repetition (重复跑)',
            code: 'R',
            pace: formatPace(Math.max(rPace, 2.5)),
            paceDecimal: Math.max(rPace, 2.5),
            hrZone: '105%+',
            purpose: '速度、跑步经济性',
            weeklyRatio: '0-5%'
        }
    };
}

// ============================================
// 周跑量分析
// ============================================

/**
 * 分析周跑量趋势
 * @param {Array} runs - 跑步记录
 * @returns {Object} 周跑量分析结果
 */
export function analyzeWeeklyVolume(runs) {
    if (!runs || runs.length < 7) {
        return { weeks: [], recommendation: null };
    }

    // 按周分组
    const weeklyData = {};
    runs.forEach(run => {
        const date = new Date(run.start_date);
        const weekStart = getWeekStart(date);
        const weekKey = weekStart.toISOString().slice(0, 10);

        if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = {
                weekStart,
                distance: 0,
                runs: 0,
                duration: 0
            };
        }

        weeklyData[weekKey].distance += run.distance / 1000;
        weeklyData[weekKey].runs += 1;
        weeklyData[weekKey].duration += run.moving_time / 60;
    });

    // 转换为数组并排序
    const weeks = Object.values(weeklyData)
        .sort((a, b) => a.weekStart - b.weekStart)
        .slice(-8); // 最近 8 周

    if (weeks.length < 2) {
        return { weeks, recommendation: null };
    }

    // 计算趋势
    const currentWeek = weeks[weeks.length - 1];
    const lastWeek = weeks[weeks.length - 2];
    const avgRecentVolume = weeks.slice(-4).reduce((sum, w) => sum + w.distance, 0) / Math.min(weeks.length, 4);

    // 10% 增量原则分析
    const volumeChange = lastWeek.distance > 0
        ? ((currentWeek.distance - lastWeek.distance) / lastWeek.distance) * 100
        : 0;

    let recommendation = null;
    let status = 'optimal';

    if (volumeChange > 15) {
        status = 'warning';
        recommendation = '本周跑量增加过快 (>' + Math.round(volumeChange) + '%)，建议控制在 10% 以内降低受伤风险';
    } else if (volumeChange < -20) {
        status = 'deload';
        recommendation = '本周跑量大幅减少，如果是计划内的减量周则很好，否则注意保持训练连续性';
    } else if (currentWeek.distance < avgRecentVolume * 0.7) {
        status = 'low';
        recommendation = '本周跑量偏低，建议适当增加以保持有氧基础';
    } else if (currentWeek.runs < 3) {
        status = 'frequency_low';
        recommendation = '本周跑步频率较低，建议每周至少 3-4 次训练';
    }

    return {
        weeks: weeks.map(w => ({
            weekLabel: formatWeekLabel(w.weekStart),
            distance: Math.round(w.distance * 10) / 10,
            runs: w.runs,
            avgPace: w.duration > 0 ? w.duration / w.distance : 0
        })),
        currentVolume: Math.round(currentWeek.distance * 10) / 10,
        avgVolume: Math.round(avgRecentVolume * 10) / 10,
        volumeChange: Math.round(volumeChange),
        status,
        recommendation
    };
}

// ============================================
// 比赛成绩预测
// ============================================

/**
 * 根据 VDOT 预测各距离成绩
 * @param {number} vdot - VDOT 值
 * @returns {Object} 预测成绩
 */
export function predictRaceTimes(vdot) {
    if (!vdot || vdot < 20) return null;

    // 基于 VDOT 的成绩预测公式 (近似值)
    const predictions = {
        '5K': predictTimeFromVDOT(vdot, 5),
        '10K': predictTimeFromVDOT(vdot, 10),
        'Half': predictTimeFromVDOT(vdot, 21.0975),
        'Full': predictTimeFromVDOT(vdot, 42.195)
    };

    return predictions;
}

function predictTimeFromVDOT(vdot, distanceKm) {
    // 反向计算：从 VDOT 推导配速
    // 这是简化的近似公式
    const basePace = 8.5 - (vdot - 25) * 0.08;

    // 距离系数 (越长越慢)
    const distanceFactor = 1 + Math.log10(distanceKm / 5) * 0.08;

    const pace = basePace * distanceFactor;
    const timeMinutes = pace * distanceKm;

    return formatDuration(timeMinutes);
}

// ============================================
// 有氧效率分析
// ============================================

/**
 * 分析配速/心率解耦 (Aerobic Decoupling)
 * @param {Array} runs - 有心率数据的跑步记录
 * @returns {Object} 解耦分析结果
 */
export function analyzeAerobicEfficiency(runs) {
    const runsWithHR = runs.filter(r => r.average_heartrate > 0 && r.moving_time > 1200);

    if (runsWithHR.length < 5) {
        return { trend: 'insufficient_data', efficiency: null };
    }

    // 计算每次跑步的效率 (速度/心率)
    const efficiencyData = runsWithHR.map(r => ({
        date: new Date(r.start_date),
        efficiency: (r.distance / r.moving_time) / r.average_heartrate * 1000,
        pace: (r.moving_time / 60) / (r.distance / 1000),
        hr: r.average_heartrate
    })).sort((a, b) => a.date - b.date);

    // 计算趋势
    const recentEff = efficiencyData.slice(-5);
    const avgRecent = recentEff.reduce((sum, r) => sum + r.efficiency, 0) / recentEff.length;

    const olderEff = efficiencyData.slice(0, -5);
    const avgOlder = olderEff.length > 0
        ? olderEff.reduce((sum, r) => sum + r.efficiency, 0) / olderEff.length
        : avgRecent;

    const change = ((avgRecent - avgOlder) / avgOlder) * 100;

    let trend = 'stable';
    let message = '有氧效率保持稳定';

    if (change > 3) {
        trend = 'improving';
        message = `有氧效率提升 ${Math.round(change)}%，相同心率下配速更快`;
    } else if (change < -3) {
        trend = 'declining';
        message = `有氧效率下降 ${Math.round(Math.abs(change))}%，可能需要更多恢复`;
    }

    return {
        trend,
        change: Math.round(change * 10) / 10,
        currentEfficiency: Math.round(avgRecent * 100) / 100,
        message,
        history: efficiencyData.slice(-12)
    };
}

// ============================================
// 训练建议生成
// ============================================

/**
 * 综合分析生成下一次训练建议
 * @param {Object} analysis - 包含 vdot, zones, volume, efficiency 的分析结果
 * @returns {Object} 训练建议
 */
export function generateTrainingSuggestion(analysis) {
    const { vdot, zones, weeklyVolume, efficiency, recentRuns } = analysis;

    if (!vdot || !zones) {
        return {
            type: 'base',
            title: '有氧基础跑',
            distance: '5-8 KM',
            pace: '轻松配速',
            rationale: '数据不足，建议进行基础有氧训练'
        };
    }

    // 决策逻辑

    // 1. 如果周跑量增加过快，建议恢复跑
    if (weeklyVolume?.status === 'warning') {
        return {
            type: 'recovery',
            title: '主动恢复跑',
            distance: '3-5 KM',
            pace: zones.easy.pace,
            hrZone: '< 65% 最大心率',
            rationale: weeklyVolume.recommendation
        };
    }

    // 2. 如果效率下降，建议轻松跑
    if (efficiency?.trend === 'declining') {
        return {
            type: 'easy',
            title: '轻松有氧跑',
            distance: '5-7 KM',
            pace: zones.easy.pace,
            hrZone: zones.easy.hrZone,
            rationale: efficiency.message + '。建议降低强度让身体恢复。'
        };
    }

    // 3. 如果状态良好且效率提升，可以进行质量训练
    if (efficiency?.trend === 'improving' && weeklyVolume?.status === 'optimal') {
        // 根据最近训练类型决定
        const daysSinceLastRun = recentRuns?.[0]
            ? (Date.now() - new Date(recentRuns[0].start_date).getTime()) / (1000 * 60 * 60 * 24)
            : 2;

        if (daysSinceLastRun >= 2) {
            return {
                type: 'tempo',
                title: '节奏跑训练',
                distance: '6-8 KM',
                structure: `2km 热身 (${zones.easy.pace}) → 3-4km 节奏跑 (${zones.threshold.pace}) → 1-2km 冷却`,
                pace: zones.threshold.pace,
                hrZone: zones.threshold.hrZone,
                rationale: '状态良好，适合进行乳酸阈值训练提升耐力'
            };
        }
    }

    // 4. 如果周跑量偏低，建议稍长的有氧跑
    if (weeklyVolume?.status === 'low') {
        return {
            type: 'long_easy',
            title: '长距离慢跑',
            distance: '10-12 KM',
            pace: zones.easy.pace,
            hrZone: zones.easy.hrZone,
            rationale: weeklyVolume.recommendation
        };
    }

    // 5. 默认：标准有氧跑
    return {
        type: 'easy',
        title: '有氧基础跑',
        distance: '6-8 KM',
        pace: zones.easy.pace,
        hrZone: zones.easy.hrZone,
        rationale: '保持规律训练，在舒适区间积累跑量'
    };
}

// ============================================
// 工具函数
// ============================================

function formatPace(paceDecimal) {
    const mins = Math.floor(paceDecimal);
    const secs = Math.round((paceDecimal - mins) * 60);
    return `${mins}'${secs < 10 ? '0' : ''}${secs}"`;
}

function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const secs = Math.round((minutes % 1) * 60);

    if (hours > 0) {
        return `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 周一为一周开始
    return new Date(d.setDate(diff));
}

function formatWeekLabel(date) {
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default {
    calculateVDOT,
    analyzeVDOT,
    calculateTrainingZones,
    analyzeWeeklyVolume,
    predictRaceTimes,
    analyzeAerobicEfficiency,
    generateTrainingSuggestion
};
