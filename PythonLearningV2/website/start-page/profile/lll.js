// progressManager.js
class ProgressManager {
    constructor() {
        this.questionsData = window.practiceQuestions || {}; // 从全局获取题库数据
        this.loadProgressData();
    }

    // 加载进度数据
    loadProgressData() {
        const saved = localStorage.getItem('quizProgress_v2');
        if (saved) {
            this.progressData = JSON.parse(saved);
        } else {
            this.initProgressData();
        }
    }

    // 初始化进度数据
    initProgressData() {
        this.progressData = {};
        for (let chapterId in this.questionsData) {
            this.progressData[chapterId] = {
                totalQuestions: this.questionsData[chapterId].length,
                answeredCorrectly: 0,
                isCompleted: false,
                lastAttempt: null,
                bestScore: 0
            };
        }
        this.saveToLocalStorage();
    }

    // 保存到localStorage
    saveToLocalStorage() {
        localStorage.setItem('quizProgress_v2', JSON.stringify(this.progressData));
        
        // 同时更新用户总经验值
        const totalExp = this.calculateTotalExperience();
        localStorage.setItem('userProfile_experience', totalExp.toString());
        
        // 更新完成课程数
        const completed = this.getCompletedChaptersCount();
        localStorage.setItem('userProfile_lessonsCompleted', completed.toString());
    }

    // 更新章节答题情况
    updateChapterProgress(chapterId, correctCount, totalQuestions) {
        if (!this.progressData[chapterId]) return;
        
        const chapter = this.progressData[chapterId];
        chapter.answeredCorrectly = correctCount;
        chapter.isCompleted = correctCount >= totalQuestions;
        chapter.lastAttempt = new Date().toISOString();
        
        // 计算得分
        const score = Math.round((correctCount / totalQuestions) * 100);
        if (score > chapter.bestScore) {
            chapter.bestScore = score;
            // 如果达到高分，奖励额外经验
            if (score >= 80) {
                this.addExperience(30); // 额外30经验值
            }
        }
        
        this.saveToLocalStorage();
        return score;
    }

    // 添加经验值（每次答题都有基础经验）
    addExperience(points) {
        const currentExp = parseInt(localStorage.getItem('userProfile_experience')) || 350;
        localStorage.setItem('userProfile_experience', (currentExp + points).toString());
        
        // 触发更新事件，让profile页面刷新进度条
        window.dispatchEvent(new CustomEvent('experienceUpdated', {
            detail: { newExperience: currentExp + points }
        }));
        
        return currentExp + points;
    }

    // 计算总经验值
    calculateTotalExperience() {
        let totalExp = 350; // 基础经验
        
        for (let chapterId in this.progressData) {
            const chapter = this.progressData[chapterId];
            
            // 每个答对的题目给5经验值
            totalExp += chapter.answeredCorrectly * 5;
            
            // 完成的章节额外给50经验值
            if (chapter.isCompleted) {
                totalExp += 50;
            }
            
            // 高分奖励
            if (chapter.bestScore >= 90) {
                totalExp += 30;
            } else if (chapter.bestScore >= 80) {
                totalExp += 20;
            }
        }
        
        return totalExp;
    }

    // 获取完成章节数
    getCompletedChaptersCount() {
        let count = 0;
        for (let chapterId in this.progressData) {
            if (this.progressData[chapterId].isCompleted) count++;
        }
        
        // 转换为0-100的课程完成度（假设有8个章节）
        const totalChapters = Object.keys(this.progressData).length;
        const completionPercentage = Math.round((count / totalChapters) * userData.totalLessons);
        
        return Math.min(completionPercentage, userData.totalLessons);
    }

    // 获取统计数据用于显示
    getStatsForDisplay() {
        let totalCorrect = 0, totalQuestions = 0, completedChapters = 0;
        
        for (let chapterId in this.progressData) {
            const chapter = this.progressData[chapterId];
            totalCorrect += chapter.answeredCorrectly;
            totalQuestions += chapter.totalQuestions;
            if (chapter.isCompleted) completedChapters++;
        }
        
        const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
        
        return {
            completedChapters,
            totalChapters: Object.keys(this.progressData).length,
            accuracy,
            totalCorrect,
            totalQuestions,
            overallProgress: Math.round((completedChapters / Object.keys(this.progressData).length) * 100)
        };
    }

    // 重置所有进度（谨慎使用！）
    resetAllProgress() {
        if (confirm('确定要重置所有答题进度吗？此操作不可撤销！')) {
            localStorage.removeItem('quizProgress_v2');
            
            for (let i = 1; i <= 8; i++) {
                localStorage.removeItem(`quiz_chapter_${i}_score`);
                localStorage.removeItem(`quiz_chapter_${i}_completed`);
                localStorage.removeItem(`quiz_chapter_${i}_date`);
            }
            
            localStorage.setItem('userProfile_experience', '350');
            
            this.initProgressData();
            
            alert('进度已重置！页面将刷新...');
            setTimeout(() => location.reload(), 1500);
            
            return true;
        }
        
        return false;
    }
}