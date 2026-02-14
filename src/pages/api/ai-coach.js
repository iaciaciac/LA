/**
 * AI Coach API - Gemini Integration
 * 调用 Gemini 1.5 Flash 分析跑步数据并生成个性化建议
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
    analyzeVDOT,
    calculateTrainingZones,
    analyzeWeeklyVolume,
    analyzeAerobicEfficiency,
    predictRaceTimes
} from '../../lib/runScience';

// 构建 Prompt，避免模板字符串嵌套反引号的问题
const JSON_INSTRUCTION = "需要遵循以下 JSON 格式在报告末尾输出结构化建议（务必用 ```json 代码块包裹）：\n" +
    "{\n" +
    "  \"nextRun\": {\n" +
    "    \"type\": \"E\" | \"M\" | \"T\" | \"I\" | \"R\",\n" +
    "    \"distance\": \"string\",\n" +
    "    \"duration\": \"string\",\n" +
    "    \"pace\": \"string\",\n" +
    "    \"reason\": \"string\"\n" +
    "  }\n" +
    "}\n";

const SYSTEM_PROMPT = `你是一位拥有海量跑步数据分析经验的顶尖运动科学家和算法工程师。

你的分析核心基于：
1. **多维训练体系融合**：综合 Jack Daniels (VDOT)、汉森训练法 (Hansons)、MAF 低心率训练、Pfitzinger 等主流训练流派的精髓。
2. **大数据量化评估**：基于跑者的配速、心率、跑量趋势、心率漂移等数据，进行非线性的深度分析。
3. **生理学模型**：结合 VO2 Max、乳酸阈值 (LT)、运动耗氧量 (RE) 等生理指标进行判断。

你的分析风格：
- **客观犀利**：用数据说话，准确指出训练中的短板（如垃圾跑量过多、强度分布不合理）。
- **极具前瞻性**：不仅分析过去，更要基于数百万次跑步模式的深度学习，精准预测未来的训练收益。
- **个性化定制**：拒绝模板化回复，每一条建议都必须针对当前跑者的特定状态（疲劳/巅峰/伤病风险）。

${JSON_INSTRUCTION}

分析框架（按此结构回复）：

## 📊 数据洞察
[基于提供的数据，用2-3句话总结关键发现]

## 💪 当前状态评估
[评估跑者目前的训练状态：巅峰/稳定/疲劳/恢复期]

## 🎯 下一次训练建议
**训练重点**: [分析为什么需要进行此类型训练，例如：'为了建立这周的跑量基础']
**执行策略**: [具体的执行建议，如'保持心率在140以下'，但**不要**输出具体配速数值，配速请参考顶部卡片]

## 📈 中期发展建议
[未来2-4周的训练方向，1-2句话]

## ⚠️ 注意事项
[如有任何风险或需要关注的点，列出]

---
[此处附上 JSON 代码块]

注意：
- **严禁在正文中编造或计算具体的配速/距离数值**。正文只负责定性分析。
- 所有的具体数据（距离、配速）必须仅在最后的 JSON 代码块中输出，且必须基于 VDOT 数据。
- **关键规则**：JSON 中长距离慢跑 (LSD) 必须使用 "轻松跑 (E)" 配速。
- 必须包含最后的 JSON 代码块以便系统生成可视化卡片`;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: 'Gemini API key not configured',
            fallbackAnalysis: generateFallbackAnalysis(req.body.runs)
        });
    }

    try {
        const { runs } = req.body;

        if (!runs || !Array.isArray(runs) || runs.length < 3) {
            return res.status(400).json({ error: 'Insufficient run data (need at least 3 runs)' });
        }

        // 先用本地算法计算科学指标
        const vdotAnalysis = analyzeVDOT(runs);
        const zones = vdotAnalysis.vdot ? calculateTrainingZones(vdotAnalysis.vdot) : null;
        const weeklyVolume = analyzeWeeklyVolume(runs);
        const efficiency = analyzeAerobicEfficiency(runs);
        const predictions = vdotAnalysis.vdot ? predictRaceTimes(vdotAnalysis.vdot) : null;

        // 准备给 Gemini 的数据摘要
        const dataSummary = prepareDataSummary(runs, {
            vdot: vdotAnalysis,
            zones,
            weeklyVolume,
            efficiency,
            predictions
        });

        // 调用 Gemini API
        const genAI = new GoogleGenerativeAI(apiKey);
        // 使用 gemini-1.5-flash 模型
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `${SYSTEM_PROMPT}

请务必严格遵守上述 JSON 输出要求。

以下是跑者的训练数据：

${dataSummary}

请根据以上数据进行专业分析。`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiAnalysis = response.text();

        return res.status(200).json({
            success: true,
            analysis: aiAnalysis,
            metrics: {
                vdot: vdotAnalysis,
                zones,
                weeklyVolume,
                efficiency,
                predictions
            }
        });

    } catch (error) {
        console.error('AI Coach Error:', error);
        return res.status(500).json({
            error: error.message,
            fallbackAnalysis: generateFallbackAnalysis(req.body.runs)
        });
    }
}

/**
 * 准备发送给 Gemini 的数据摘要
 */
function prepareDataSummary(runs, analysis) {
    const { vdot, zones, weeklyVolume, efficiency, predictions } = analysis;

    // 最近 5 次跑步详情
    const recentRuns = runs
        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
        .slice(0, 5)
        .map(r => {
            const distKm = (r.distance / 1000).toFixed(2);
            const durationMin = r.moving_time / 60;
            const pace = (durationMin / (r.distance / 1000)).toFixed(2);
            const date = new Date(r.start_date).toLocaleDateString('zh-CN');
            const hr = r.average_heartrate || '无数据';

            return `- ${date}: ${distKm}km, 配速 ${pace}'/km, 心率 ${hr}`;
        })
        .join('\n');

    let summary = `### 跑步历史概览
- 总跑步次数: ${runs.length} 次
- 数据时间跨度: ${getDateRange(runs)}

### 最近 5 次跑步
${recentRuns}

### VDOT 跑力分析
- 当前 VDOT: ${vdot?.vdot || '计算中'}
- 最佳 VDOT: ${vdot?.bestVdot || '计算中'}
- 近期 VDOT: ${vdot?.recentVdot || '计算中'}
- 趋势: ${translateTrend(vdot?.trend)}
`;

    if (zones) {
        summary += `
### 训练区间配速 (基于 VDOT ${vdot.vdot})
- 轻松跑 (E): ${zones.easy.pace}
- 马拉松配速 (M): ${zones.marathon.pace}
- 乳酸阈值 (T): ${zones.threshold.pace}
- 间歇训练 (I): ${zones.interval.pace}
`;
    }

    if (weeklyVolume?.weeks?.length > 0) {
        summary += `
### 周跑量趋势
- 本周跑量: ${weeklyVolume.currentVolume} km
- 近期平均: ${weeklyVolume.avgVolume} km
- 周跑量变化: ${weeklyVolume.volumeChange}%
- 状态: ${translateVolumeStatus(weeklyVolume.status)}
`;
    }

    if (efficiency?.trend !== 'insufficient_data') {
        summary += `
### 有氧效率
- 趋势: ${translateTrend(efficiency.trend)}
- 变化: ${efficiency.change}%
- 说明: ${efficiency.message}
`;
    }

    if (predictions) {
        summary += `
### 比赛成绩预测 (基于当前 VDOT)
- 5K: ${predictions['5K']}
- 10K: ${predictions['10K']}
- 半马: ${predictions['Half']}
- 全马: ${predictions['Full']}
`;
    }

    return summary;
}

function getDateRange(runs) {
    if (!runs || runs.length === 0) return '无数据';
    const dates = runs.map(r => new Date(r.start_date)).sort((a, b) => a - b);
    const oldest = dates[0].toLocaleDateString('zh-CN');
    const newest = dates[dates.length - 1].toLocaleDateString('zh-CN');
    return `${oldest} 至 ${newest}`;
}

function translateTrend(trend) {
    const map = {
        'improving': '📈 持续提升',
        'stable': '➡️ 保持稳定',
        'declining': '📉 有所下降',
        'insufficient_data': '数据不足'
    };
    return map[trend] || trend;
}

function translateVolumeStatus(status) {
    const map = {
        'optimal': '✅ 适中',
        'warning': '⚠️ 增量过快',
        'deload': '📉 减量中',
        'low': '📊 偏低',
        'frequency_low': '📊 频率偏低'
    };
    return map[status] || status;
}

/**
 * 当 Gemini API 不可用时的备用分析
 */
function generateFallbackAnalysis(runs) {
    if (!runs || runs.length < 3) {
        return '跑步数据不足，请至少完成 3 次跑步后再查看分析。';
    }

    const vdotAnalysis = analyzeVDOT(runs);
    const zones = vdotAnalysis.vdot ? calculateTrainingZones(vdotAnalysis.vdot) : null;
    const weeklyVolume = analyzeWeeklyVolume(runs);

    let analysis = `## 📊 数据洞察
基于您的 ${runs.length} 次跑步记录分析`;

    if (vdotAnalysis.vdot) {
        analysis += `，当前 VDOT 跑力值为 ${vdotAnalysis.vdot}`;
        if (vdotAnalysis.trend === 'improving') {
            analysis += '，且呈上升趋势。';
        } else if (vdotAnalysis.trend === 'declining') {
            analysis += '，近期略有下降，建议关注恢复。';
        } else {
            analysis += '，状态稳定。';
        }
    }

    if (zones) {
        analysis += `

## 🎯 下一次训练建议
**训练类型**: 有氧基础跑
**建议距离**: 6-8 km
**目标配速**: ${zones.easy.pace}
**训练重点**: 保持轻松呼吸，享受跑步`;
    }

    if (weeklyVolume?.recommendation) {
        analysis += `

## ⚠️ 注意事项
${weeklyVolume.recommendation}`;
    }

    return analysis;
}
