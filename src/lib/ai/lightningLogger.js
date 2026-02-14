/**
 * ⚡ Agent Lightning Trajectory Logger
 * 负责捕获用户在调色实验室中的“决策轨迹”，为强化学习 (RL) 提供数据支持。
 */

class LightningLogger {
    constructor() {
        this.currentTrajectory = [];
        this.isEnabled = false;
        this.trajectoryId = null;
        this.metadata = {};
    }

    // 开启/关闭进化模式
    setEnable(enabled) {
        this.isEnabled = enabled;
        if (enabled && !this.trajectoryId) {
            this.startNewTrajectory();
        }
        console.log(`[Lightning ⚡] Intelligence Mode: ${enabled ? 'ACTIVE' : 'IDLE'}`);
    }

    // 开启一段新的决策序列
    startNewTrajectory(metadata = {}) {
        this.trajectoryId = `traj_${Date.now()}`;
        this.currentTrajectory = [];
        this.metadata = metadata;
        console.log(`[Lightning ⚡] Started new trajectory: ${this.trajectoryId}`);
    }

    // 记录原子动作 (Atomic Action)
    // 对应 RL 中的 Action
    logAction(type, payload, currentState) {
        if (!this.isEnabled) return;

        const entry = {
            timestamp: Date.now(),
            type, // e.g., 'ADJUST_EXPOSURE', 'SWITCH_LUT'
            payload,
            state: currentState, // RL 中的 State：当前的参数快照
        };

        this.currentTrajectory.push(entry);
        console.debug(`[Lightning ⚡] Action logged:`, entry);

        // 如果轨迹过长，自动保存（模拟轨迹聚合）
        if (this.currentTrajectory.length > 50) {
            this.flush();
        }
    }

    // 记录奖励信号 (Reward Signal)
    // 对应 RLHF 中的用户反馈
    logReward(value, reason = 'user_endorsement') {
        if (!this.isEnabled || !this.trajectoryId) return;

        const rewardEntry = {
            trajectoryId: this.trajectoryId,
            reward: value, // 1.0 (Good), -1.0 (Bad)
            reason,
            timestamp: Date.now()
        };

        // 持久化 Reward
        const rewards = JSON.parse(localStorage.getItem('lightning_rewards') || '[]');
        rewards.push(rewardEntry);
        localStorage.setItem('lightning_rewards', JSON.stringify(rewards));

        console.log(`[Lightning ⚡] Reward received:`, rewardEntry);
    }

    // 持久化当前轨迹
    flush() {
        if (this.currentTrajectory.length === 0) return;

        const fullTrajectory = {
            id: this.trajectoryId,
            metadata: this.metadata,
            steps: this.currentTrajectory,
            endTime: Date.now()
        };

        // 在实战中，这里会发送到后端或 DB
        // 这里我们先存入 localStorage 模拟“轨迹聚合器”
        const database = JSON.parse(localStorage.getItem('lightning_trajectories') || '[]');
        database.push(fullTrajectory);
        localStorage.setItem('lightning_trajectories', JSON.stringify(database));

        console.log(`[Lightning ⚡] Trajectory flushed to local storage. Total: ${database.length}`);

        // 开启新序列但保留基础上下文
        this.startNewTrajectory(this.metadata);
    }
}

// 单例模式，确保全局唯一记录器
export const lightning = new LightningLogger();
export default lightning;
