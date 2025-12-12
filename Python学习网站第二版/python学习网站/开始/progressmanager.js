// progressManager.js - 完整的进度管理器（包含自动数据迁移）
class ProgressManager {
    constructor() {
        this.totalChapters = 10;
        this.progressData = this.loadProgressData();
        console.log('✅ ProgressManager 初始化完成');
        
        // ✅ 关键：为新用户自动迁移旧数据
        this.autoMigrateForNewUsers();
        
        // 立即显示当前状态（调试用）
        setTimeout(() => {
            const stats = this.getStatsForDisplay();
            console.log('📊 当前进度:', stats);
        }, 100);
    }

    // 加载进度数据
    loadProgressData() {
        try {
            const saved = localStorage.getItem('userProgress_v3');
            if (saved) {
                const data = JSON.parse(saved);
                // 确保数据结构完整
                return {
                    chapters: data.chapters || this.initChapters(),
                    bossDefeated: data.bossDefeated || false,
                    lastUpdated: data.lastUpdated || null
                };
            }
        } catch (e) {
            console.warn('解析进度数据失败:', e);
        }
        
        // 返回全新的数据
        return this.initDefaultData();
    }

    // 初始化默认数据
    initDefaultData() {
        return {
            chapters: this.initChapters(),
            bossDefeated: false,
            lastUpdated: null
        };
    }

    // 初始化章节数据
    initChapters() {
        const chapters = {};
        for (let i = 1; i <= this.totalChapters; i++) {
            chapters[i] = {
                completed: false,
                score: 0,
                accuracy: 0,
                questionsAnswered: 0,
                totalQuestions: 10,
                lastUpdated: null
            };
        }
        return chapters;
    }

    // ✅ 新增：为新用户自动迁移旧数据（关键功能！）
    autoMigrateForNewUsers() {
        console.log('🔍 检查是否需要数据迁移...');
        
        // 检查新数据是否为空
        let hasNewData = false;
        for (const chapterId in this.progressData.chapters) {
            if (this.progressData.chapters[chapterId].score > 0) {
                hasNewData = true;
                break;
            }
        }
        
        // 检查是否有旧的 chapterScores 数据
        let oldScores = {};
        try {
            oldScores = JSON.parse(localStorage.getItem('chapterScores') || '{}');
        } catch (e) {
            console.warn('读取旧数据失败:', e);
        }
        
        const hasOldData = Object.keys(oldScores).length > 0;
        
        console.log('新数据状态:', hasNewData ? '有数据' : '无数据');
        console.log('旧数据状态:', hasOldData ? `有数据 ${JSON.stringify(oldScores)}` : '无数据');
        
        // ✅ 关键逻辑：如果有旧数据但新数据为空，自动迁移
        if (hasOldData && !hasNewData) {
            console.log('🔄 检测到旧数据，开始自动迁移...');
            
            let migratedCount = 0;
            
            for (let i = 1; i <= this.totalChapters; i++) {
                const score = oldScores[i];
                if (score && score > 0) {
                    // 迁移这一章
                    this.progressData.chapters[i] = {
                        completed: score >= 60,
                        score: score,
                        accuracy: score, // 假设正确率=分数
                        questionsAnswered: Math.round((score / 100) * 10), // 估算
                        totalQuestions: 10,
                        lastUpdated: new Date().toISOString()
                    };
                    migratedCount++;
                    console.log(`  迁移章节 ${i}: ${score}%`);
                }
            }
            
            if (migratedCount > 0) {
                // 迁移Boss状态
                try {
                    const bossDefeated = localStorage.getItem('boss_defeated');
                    if (bossDefeated === 'true') {
                        this.progressData.bossDefeated = true;
                        console.log('  迁移Boss状态: 已战胜');
                    }
                } catch (e) {
                    // 忽略错误
                }
                
                // 保存迁移后的数据
                this.saveProgress();
                console.log(`✅ 自动迁移完成！迁移了 ${migratedCount} 个章节`);
                
                // 显示迁移提示
                this.showMigrationNotification(migratedCount);
            }
        } else if (hasNewData) {
            console.log('✅ 新数据已存在，无需迁移');
        } else {
            console.log('📝 全新用户，无历史数据');
        }
    }

    // 显示迁移通知
    showMigrationNotification(migratedCount) {
        setTimeout(() => {
            try {
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #4CAF50, #2E7D32);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 10px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                    z-index: 9999;
                    animation: slideInRight 0.5s ease-out;
                    max-width: 300px;
                    border-left: 5px solid #FFD700;
                `;
                
                notification.innerHTML = `
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                        <i class="fas fa-database" style="font-size: 24px; margin-right: 10px;"></i>
                        <h4 style="margin: 0;">数据升级完成</h4>
                    </div>
                    <div style="font-size: 14px; line-height: 1.5;">
                        ✅ 已自动迁移 ${migratedCount} 个章节的进度<br>
                        ✅ 历史记录已保存<br>
                        ✅ 现在可以正常使用所有功能
                    </div>
                    <div style="text-align: right; margin-top: 10px; font-size: 12px;">
                        <button onclick="this.parentElement.parentElement.remove()" 
                                style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 3px 10px; border-radius: 3px; cursor: pointer;">
                            知道了
                        </button>
                    </div>
                `;
                
                document.body.appendChild(notification);
                
                // 添加动画样式
                if (!document.querySelector('#migration-animations')) {
                    const style = document.createElement('style');
                    style.id = 'migration-animations';
                    style.textContent = `
                        @keyframes slideInRight {
                            from { transform: translateX(100%); opacity: 0; }
                            to { transform: translateX(0); opacity: 1; }
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                // 8秒后自动消失
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.style.animation = 'fadeOut 0.5s ease-out forwards';
                        setTimeout(() => {
                            if (notification.parentNode) {
                                notification.parentNode.removeChild(notification);
                            }
                        }, 500);
                    }
                }, 8000);
            } catch (e) {
                console.log('显示迁移通知失败:', e);
            }
        }, 1000);
    }

    // 保存进度
    saveProgress() {
        this.progressData.lastUpdated = new Date().toISOString();
        
        try {
            localStorage.setItem('userProgress_v3', JSON.stringify(this.progressData));
            console.log('💾 进度已保存到 userProgress_v3');
        } catch (e) {
            console.error('保存进度失败:', e);
            return null;
        }
        
        // 为了向后兼容，也保存到旧格式
        this.saveToLegacyFormat();
        
        // 触发事件
        const event = new CustomEvent('progressUpdated', {
            detail: this.getStatsForDisplay()
        });
        window.dispatchEvent(event);
        
        // 广播更新
        this.broadcastProgressUpdate();
        
        return this.progressData;
    }

    // 保存到旧格式（保持兼容）
    saveToLegacyFormat() {
        try {
            const oldScores = {};
            const oldAttempts = JSON.parse(localStorage.getItem('chapterAttempts') || '{}');
            
            for (let i = 1; i <= this.totalChapters; i++) {
                const chapter = this.progressData.chapters[i];
                if (chapter && chapter.score > 0) {
                    oldScores[i] = chapter.score;
                    // 更新尝试次数（如果不存在则设为1）
                    if (!oldAttempts[i]) {
                        oldAttempts[i] = 1;
                    }
                }
            }
            
            localStorage.setItem('chapterScores', JSON.stringify(oldScores));
            localStorage.setItem('chapterAttempts', JSON.stringify(oldAttempts));
            console.log('💾 同时保存到旧格式 chapterScores');
        } catch (e) {
            console.warn('保存到旧格式失败:', e);
        }
    }

    // 广播进度更新
    broadcastProgressUpdate() {
        try {
            const stats = this.getStatsForDisplay();
            
            window.postMessage({
                type: 'progressUpdate',
                data: stats,
                source: 'progressManager',
                timestamp: Date.now()
            }, '*');
        } catch (e) {
            console.log('广播更新时出错:', e);
        }
    }

    // 更新章节进度
    updateChapterProgress(chapterId, score, correct, total) {
        if (chapterId >= 1 && chapterId <= this.totalChapters) {
            const chapter = this.progressData.chapters[chapterId];
            chapter.score = score;
            chapter.accuracy = Math.round((correct / total) * 100);
            chapter.questionsAnswered = correct;
            chapter.completed = score >= 60;
            chapter.lastUpdated = new Date().toISOString();
            
            const result = this.saveProgress();
            console.log(`✅ 章节 ${chapterId} 更新: ${score}% (${correct}/${total})`);
            return result;
        }
        return null;
    }

    // 标记Boss已战胜
    markBossDefeated() {
        this.progressData.bossDefeated = true;
        this.progressData.bossDefeatedDate = new Date().toISOString();
        
        // 同时保存到旧格式
        localStorage.setItem('boss_defeated', 'true');
        localStorage.setItem('boss_defeated_date', new Date().toISOString());
        
        const result = this.saveProgress();
        console.log('🎉 Boss战胜状态已保存');
        return result;
    }

    // 获取统计数据
    getStatsForDisplay() {
        let completedCount = 0;
        let totalAccuracy = 0;
        let totalScore = 0;
        let chapterCount = 0;

        for (const chapterId in this.progressData.chapters) {
            const chapter = this.progressData.chapters[chapterId];
            if (chapter.completed) completedCount++;
            if (chapter.score > 0) {
                totalAccuracy += chapter.accuracy;
                totalScore += chapter.score;
                chapterCount++;
            }
        }

        const avgAccuracy = chapterCount > 0 ? Math.round(totalAccuracy / chapterCount) : 0;
        const avgScore = chapterCount > 0 ? Math.round(totalScore / chapterCount) : 0;

        return {
            completedChapters: completedCount,
            totalChapters: this.totalChapters,
            accuracy: avgAccuracy,
            averageScore: avgScore,
            bossDefeated: this.progressData.bossDefeated || false,
            completionPercentage: Math.round((completedCount / this.totalChapters) * 100),
            lastUpdated: this.progressData.lastUpdated,
            hasData: chapterCount > 0
        };
    }

    // 获取原始数据
    getRawData() {
        return JSON.parse(JSON.stringify(this.progressData));
    }

    // 计算总经验值
    calculateTotalExperience() {
        const stats = this.getStatsForDisplay();
        let experience = 350; // 基础经验
        
        experience += stats.completedChapters * 50;
        experience += Math.round(stats.accuracy * 1.5);
        
        if (stats.bossDefeated) {
            experience += 300;
        }
        
        return Math.max(350, experience);
    }

    // 获取等级
    getLevel() {
        const exp = this.calculateTotalExperience();
        return Math.floor(exp / 500) + 1;
    }

    // 检查章节是否完成
    isChapterCompleted(chapterId) {
        if (chapterId >= 1 && chapterId <= this.totalChapters) {
            return this.progressData.chapters[chapterId].completed || false;
        }
        return false;
    }

    // 检查章节分数
    getChapterScore(chapterId) {
        if (chapterId >= 1 && chapterId <= this.totalChapters) {
            return this.progressData.chapters[chapterId].score || 0;
        }
        return 0;
    }

    // 重置所有进度
    resetProgress() {
        this.progressData = this.initDefaultData();
        
        // 清除所有相关存储
        localStorage.removeItem('userProgress_v3');
        localStorage.removeItem('chapterScores');
        localStorage.removeItem('chapterAttempts');
        localStorage.removeItem('boss_defeated');
        
        for (let i = 1; i <= 10; i++) {
            localStorage.removeItem(`chapter_${i}_progress`);
        }
        
        this.saveProgress();
        console.log('🔄 所有进度已重置');
        return true;
    }

    // 调试命令
    debug() {
        console.log('=== 进度管理器调试信息 ===');
        console.log('1. 当前数据:', this.getRawData());
        console.log('2. 统计信息:', this.getStatsForDisplay());
        console.log('3. localStorage检查:');
        console.log('   - chapterScores:', JSON.parse(localStorage.getItem('chapterScores') || '{}'));
        console.log('   - userProgress_v3:', JSON.parse(localStorage.getItem('userProgress_v3') || 'null'));
        console.log('4. 经验值:', this.calculateTotalExperience());
        console.log('5. 等级:', this.getLevel());
        console.log('=== 调试结束 ===');
        return this.getStatsForDisplay();
    }
}

// 自动创建全局实例
if (typeof window !== 'undefined') {
    window.ProgressManager = ProgressManager;
    
    // 如果还没有实例，创建一个
    if (!window.progressManager) {
        try {
            window.progressManager = new ProgressManager();
            
            // 添加调试命令
            window.progressManager.debug = function() {
                return this.debug();
            };
            
        } catch (error) {
            console.error('创建ProgressManager实例失败:', error);
            // 创建空实例作为回退
            window.progressManager = {
                getStatsForDisplay: () => ({ completedChapters: 0, totalChapters: 10, accuracy: 0 }),
                calculateTotalExperience: () => 350,
                debug: () => console.log('ProgressManager初始化失败')
            };
        }
    }
}

// 添加CSS动画（如果不存在）
if (typeof window !== 'undefined' && !document.querySelector('#global-animations')) {
    const style = document.createElement('style');
    style.id = 'global-animations';
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
}