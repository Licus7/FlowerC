// Boss战游戏逻辑
class BossBattle {
    constructor() {
        this.bossHealth = 1000;
        this.playerHealth = 5; // 玩家初始5颗心
        this.currentSkill = null;
        this.questions = this.initializeQuestions();
        this.isAnimating = false;
        this.isMusicPlaying = true;
        this.hasRoarPlayed = false;
        this.hasHeroSoundPlayed = false;
        this.isShaking = false;
        
        // 音频元素初始化为null
        this.bgMusic = null;
        this.roarSound = null;
        this.heroSound = null;
        this.battleRainSound = null;
        
        this.init();
    }

    init() {
        console.log('初始化BossBattle...'); // 调试信息
        
        // 先绑定事件，再初始化其他内容
        this.bindEvents();
        this.createRainEffect();
        this.setBossBackground();
        this.setupAudio();
        this.initPlayerHearts(); // 初始化玩家血条

        // 确保白色闪屏初始隐藏
        const whiteFlash = document.getElementById('whiteFlash');
        if (whiteFlash) {
            whiteFlash.style.display = 'none';
        }
        
        const slowFlash = document.getElementById('slowFlash');
        if (slowFlash) {
            slowFlash.style.display = 'none';
        }
        
        console.log('BossBattle初始化完成'); // 调试信息
    }

    // 初始化玩家血条
    initPlayerHearts() {
        const heartsContainer = document.getElementById('playerHearts');
        if (!heartsContainer) {
            console.error('找不到玩家血条容器');
            return;
        }
        
        heartsContainer.innerHTML = '';
        
        for (let i = 0; i < this.playerHealth; i++) {
            const heart = document.createElement('div');
            heart.className = 'heart';
            heart.id = `heart-${i}`;
            heartsContainer.appendChild(heart);
        }
        console.log('玩家血条初始化完成'); // 调试信息
    }

    // 设置音频
    setupAudio() {
        this.bgMusic = document.getElementById('bgMusic');
        this.roarSound = document.getElementById('roarSound');
        this.heroSound = document.getElementById('heroSound');
        this.battleRainSound = document.getElementById('battleRainSound');
        
        // 检查音频元素是否存在
        if (!this.roarSound) console.warn('未找到roarSound音频元素');
        if (!this.heroSound) console.warn('未找到heroSound音频元素');
        if (!this.battleRainSound) console.warn('未找到battleRainSound音频元素');
        
        // 设置音量
        if (this.bgMusic) this.bgMusic.volume = 0.5;
        if (this.roarSound) this.roarSound.volume = 0.7;
        if (this.heroSound) this.heroSound.volume = 0.7;
        if (this.battleRainSound) this.battleRainSound.volume = 0.4;
        
        // 开始播放背景音乐
        this.playBackgroundMusic();
    }

    // 播放背景音乐
    playBackgroundMusic() {
        if (this.isMusicPlaying && this.bgMusic) {
            this.bgMusic.play().catch(e => {
                console.log('背景音乐播放失败:', e);
            });
        }
    }

    // 播放战斗雨声
    playBattleRainSound() {
        if (this.isMusicPlaying && this.battleRainSound) {
            this.battleRainSound.currentTime = 0;
            this.battleRainSound.loop = true;
            this.battleRainSound.play().catch(e => {
                console.log('战斗雨声音效播放失败:', e);
            });
        }
    }

    // 停止战斗雨声
    stopBattleRainSound() {
        if (this.battleRainSound) {
            this.battleRainSound.pause();
            this.battleRainSound.currentTime = 0;
        }
    }

    // 切换音乐
    toggleMusic() {
        this.isMusicPlaying = !this.isMusicPlaying;
        const musicBtn = document.getElementById('musicBtn');
        
        if (this.isMusicPlaying) {
            this.playBackgroundMusic();
            if (this.battleRainSound) this.battleRainSound.play();
            musicBtn.textContent = '🎵 关闭声音';
            musicBtn.classList.remove('music-off');
            musicBtn.classList.add('music-on');
        } else {
            if (this.bgMusic) this.bgMusic.pause();
            if (this.battleRainSound) this.battleRainSound.pause();
            musicBtn.textContent = '🔇 开启声音';
            musicBtn.classList.remove('music-on');
            musicBtn.classList.add('music-off');
        }
    }

    setBossBackground() {
        const background = document.getElementById('bossBackground');
        if (!background) {
            console.error('找不到bossBackground元素');
            return;
        }
        
        // 直接设置背景图片
        background.style.backgroundImage = "url('../背景+音频/暴鲤龙背景.jpg')";
        background.style.backgroundSize = 'cover';
        background.style.backgroundPosition = 'center';
        background.style.backgroundRepeat = 'no-repeat';
        
        console.log('背景图片已设置');
    }

    // 创建雨滴效果
    createRainEffect() {
        const rainContainer = document.getElementById('rainEffect');
        if (!rainContainer) {
            console.error('找不到rainEffect元素');
            return;
        }
        
        rainContainer.innerHTML = '';
        for (let i = 0; i < 80; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = Math.random() * 100 + '%';
            drop.style.animationDelay = Math.random() * 2 + 's';
            drop.style.animationDuration = (0.5 + Math.random() * 1) + 's';
            rainContainer.appendChild(drop);
        }
    }

    bindEvents() {
        console.log('绑定事件...'); // 调试信息
        
        // 开始战斗按钮
        const startBtn = document.getElementById('startBattle');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('开始战斗按钮被点击');
                if (!this.isAnimating) {
                    this.startBattleSequence();
                }
            });
        } else {
            console.error('找不到startBattle按钮');
        }

        // 技能按钮
        const skillButtons = document.querySelectorAll('.skill-btn');
        if (skillButtons.length > 0) {
            skillButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (this.isAnimating) return;
                    const skill = e.target.closest('.skill-btn');
                    this.currentSkill = {
                        name: skill.dataset.skill,
                        damage: parseInt(skill.dataset.damage)
                    };
                    this.showQuestion(this.currentSkill.damage);
                });
            });
        }

        // 控制面板按钮
        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.showMenu();
            });
        }

        const musicBtn = document.getElementById('musicBtn');
        if (musicBtn) {
            musicBtn.addEventListener('click', () => {
                this.toggleMusic();
            });
        }

        // 菜单按钮
        const continueBtn = document.getElementById('continueBtn');
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.hideMenu();
            });
        }

        const quitBtn = document.getElementById('quitBtn');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => {
                window.location.href = '../start.html';
            });
        }

        // 失败视频控制按钮
        document.addEventListener('click', (e) => {
            if (e.target.id === 'skipDefeatVideo') {
                const video = document.getElementById('defeatVideo');
                if (video) video.pause();
            }
            if (e.target.id === 'replayDefeatVideo') {
                const video = document.getElementById('defeatVideo');
                if (video) {
                    video.currentTime = 0;
                    video.play();
                }
            }
        });
        
        console.log('事件绑定完成'); // 调试信息
    }

    // 显示菜单
    showMenu() {
        const menuModal = document.getElementById('menuModal');
        if (menuModal) {
            menuModal.style.display = 'block';
        }
    }

    // 隐藏菜单
    hideMenu() {
        const menuModal = document.getElementById('menuModal');
        if (menuModal) {
            menuModal.style.display = 'none';
        }
    }

    // 战斗开始序列
    async startBattleSequence() {
        if (this.isAnimating) return;
        this.isAnimating = true;
    
        const startBtn = document.getElementById('startBattle');
        if (startBtn) {
            startBtn.disabled = true;
        }

        try {
            console.log('开始战斗序列');
            
            // 在战斗开始时只播放雨声音效（循环）
            this.playBattleRainSound();
            
            // 1. 屏幕变黑
            await this.fadeToBlack();
            
            // 2. 播放吼叫音效（只播放一次）
            if (!this.hasRoarPlayed) {
                this.playRoarSound();
                this.hasRoarPlayed = true;
            }
            
            await this.showStoryText('远处传来震耳欲聋的吼声...');
            await this.delay(2000);
            
            // 3. 显示帮助信息并播放捷拉奥拉音效（只播放一次）
            if (!this.hasHeroSoundPlayed) {
                this.playHeroSound();
                this.hasHeroSoundPlayed = true;
            }
            
            await this.showStoryText('传说中的宝可梦来帮助你了！');
            await this.delay(1500);
            
            // 4. 显示捷拉奥拉
            await this.showHeroPokemon();
            await this.delay(1500);
            
            // 5. 进入战斗界面
            this.enterBattleScene();
            
        } catch (error) {
            console.error('动画序列错误:', error);
        } finally {
            this.isAnimating = false;
        }
    }

    // 播放吼叫音效
    playRoarSound() {
        if (this.roarSound) {
            this.roarSound.currentTime = 0;
            this.roarSound.play().catch(e => {
                console.log('吼叫音效播放失败:', e);
            });
        }
    }

    // 播放捷拉奥拉音效
    playHeroSound() {
        if (this.heroSound) {
            this.heroSound.currentTime = 0;
            this.heroSound.play().catch(e => {
                console.log('捷拉奥拉音效播放失败:', e);
            });
        }
    }

    fadeToBlack() {
        return new Promise(resolve => {
            const overlay = document.getElementById('screenOverlay');
            if (overlay) {
                overlay.classList.add('active');
            }
            setTimeout(resolve, 1000);
        });
    }

    showStoryText(text) {
        return new Promise(resolve => {
            const storyElement = document.getElementById('storyText');
            if (storyElement) {
                const title = storyElement.querySelector('h3');
                if (title) {
                    title.textContent = text;
                }
                storyElement.style.display = 'block';
                
                setTimeout(() => {
                    storyElement.style.display = 'none';
                    resolve();
                }, 1500);
            } else {
                resolve();
            }
        });
    }

    showHeroPokemon() {
        return new Promise(resolve => {
            const hero = document.getElementById('heroPokemon');
            const heroImage = document.getElementById('heroImage');
            
            if (hero && heroImage) {
                // 设置捷拉奥拉图片
                heroImage.style.backgroundImage = "url('../背景+音频/捷拉奥拉.jpg')";
                heroImage.style.backgroundSize = 'contain';
                heroImage.style.backgroundPosition = 'center';
                heroImage.style.backgroundRepeat = 'no-repeat';
                
                hero.style.display = 'block';
                setTimeout(() => {
                    hero.style.display = 'none';
                    resolve();
                }, 1500);
            } else {
                resolve();
            }
        });
    }

    // 屏幕震动效果
    screenShake() {
        if (this.isShaking) return;
        this.isShaking = true;
        
        // 先播放受击音效
        this.playHitSound();
        
        // 音效播放后稍微延迟再开始震动（让音效先出来）
        setTimeout(() => {
            const battleScene = document.getElementById('battleScene');
            if (battleScene) {
                battleScene.classList.add('screen-shake');

                setTimeout(() => {
                    battleScene.classList.remove('screen-shake');
                    this.isShaking = false;
                }, 500);
            } else {
                this.isShaking = false;
            }
        }, 200);
    }

    // 受击音效方法
    playHitSound() {
        if (this.roarSound) {
            this.roarSound.currentTime = 1.6;
            this.roarSound.volume = 0.5;
            this.roarSound.play().catch(e => {
                console.log('受击音效播放失败:', e);
            });
            
            // 1秒后恢复原始音量
            setTimeout(() => {
                this.roarSound.volume = 0.7;
            }, 1000);
        }
    }

    // 缓慢白色闪屏
    slowFlash() {
        return new Promise(resolve => {
            const flash = document.getElementById('slowFlash');
            if (flash) {
                flash.style.display = 'block';
                flash.style.animation = 'none';
                
                // 触发重绘
                void flash.offsetWidth;
                
                flash.style.animation = 'slowFlash 1s ease-in-out';
                
                setTimeout(() => {
                    flash.style.display = 'none';
                    resolve();
                }, 1000);
            } else {
                resolve();
            }
        });
    }

    enterBattleScene() {
        const tutorialScreen = document.getElementById('tutorialScreen');
        const screenOverlay = document.getElementById('screenOverlay');
        const battleScene = document.getElementById('battleScene');
        const controlPanel = document.getElementById('controlPanel');
        
        if (tutorialScreen) tutorialScreen.style.display = 'none';
        if (screenOverlay) screenOverlay.classList.remove('active');
        if (battleScene) battleScene.style.display = 'block';
        if (controlPanel) controlPanel.style.display = 'flex';
    }

    // 显示题目
    showQuestion(damageLevel) {
        const questions = this.getQuestionsByDifficulty(damageLevel);
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        
        const questionText = document.getElementById('questionText');
        const questionTitle = document.getElementById('questionTitle');
        const optionsContainer = document.getElementById('optionsContainer');
        const questionModal = document.getElementById('questionModal');
        
        if (!questionText || !questionTitle || !optionsContainer || !questionModal) {
            console.error('找不到题目相关元素');
            return;
        }
        
        questionText.textContent = randomQuestion.question;
        questionTitle.textContent = this.getDifficultyText(damageLevel);
        
        optionsContainer.innerHTML = '';
        
        if (randomQuestion.type === 'choice') {
            randomQuestion.options.forEach((option, index) => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
                button.onclick = () => this.checkAnswer(index, randomQuestion.answer);
                optionsContainer.appendChild(button);
            });
        } else {
            ['正确', '错误'].forEach((option, index) => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.textContent = option;
                button.onclick = () => this.checkAnswer(index === 0, randomQuestion.answer);
                optionsContainer.appendChild(button);
            });
        }
        
        questionModal.style.display = 'block';
    }

    async checkAnswer(userAnswer, correctAnswer) {
        const isCorrect = userAnswer === correctAnswer;
        const questionModal = document.getElementById('questionModal');
        if (questionModal) {
            questionModal.style.display = 'none';
        }

        if (isCorrect) {
            // 成功特效：攻击动画 + 白色闪屏 + 屏幕震动
            await this.showAttackAnimation();
            await this.slowFlash();
            this.screenShake();
            
            this.attackBoss(this.currentSkill.damage);
            this.showBattleLog(`⚡ 攻击成功！造成 ${this.currentSkill.damage} 点伤害！`, 'success');
        } else {
            // 答错时：Boss攻击玩家
            this.showBattleLog('❌ 攻击失败！暴鲤龙反击了！', 'error');
            this.bossCounterAttack();
        }

        this.checkVictory();
    }

    // Boss反击玩家
    bossCounterAttack() {
        // 播放Boss攻击音效
        this.playRoarSound();
        
        // 延迟一下再扣血，让玩家有时间看战斗信息
        setTimeout(() => {
            this.damagePlayer();
        }, 800);
    }

    // 玩家扣血
    damagePlayer() {
        if (this.playerHealth > 0) {
            this.playerHealth--;
            
            // 更新血条显示
            const heart = document.getElementById(`heart-${this.playerHealth}`);
            if (heart) {
                heart.classList.add('damaged');
                setTimeout(() => {
                    heart.classList.add('lost');
                }, 600);
            }
            
            // 屏幕闪红效果
            this.playerHitFlash();
            
            // 检查是否失败
            this.checkDefeat();
            
            return true;
        }
        return false;
    }

    // 玩家受击闪红效果 - 简单版本
playerHitFlash() {
    const redOverlay = document.getElementById('screenRedOverlay');
    if (redOverlay) {
        redOverlay.classList.add('active');
        setTimeout(() => {
            redOverlay.classList.remove('active');
        }, 800);
    }
}

    // 检查失败条件
    checkDefeat() {
        if (this.playerHealth <= 0) {
            setTimeout(() => {
                this.showDefeatScreen();
            }, 1000);
        }
    }

    // 显示失败界面
    showDefeatScreen() {
        const defeatScreen = document.getElementById('defeatScreen');
        if (defeatScreen) {
            defeatScreen.style.display = 'flex';
            this.lazyLoadDefeatVideo();
        }
    }

    // 加载失败视频
    lazyLoadDefeatVideo() {
        console.log('显示失败界面');
        
        const defeatScreen = document.getElementById('defeatScreen');
        if (!defeatScreen) return;
        
        const videoContainer = defeatScreen.querySelector('.victory-video-container');
        if (!videoContainer) return;
        
        videoContainer.innerHTML = `
            <div style="text-align: center; max-width: 800px; margin: 0 auto;">
                <!-- 鼓励标题 -->
                <div style="color: #ff6b6b; padding: 20px; background: linear-gradient(135deg, #1a237e, #0d47a1); border: 3px solid #ff6b6b; border-radius: 10px; margin-bottom: 15px;">
                    <h2 style="font-size: 32px; margin: 10px 0; text-shadow: 0 0 10px #ff6b6b;">💪 勇气可嘉！ 💪</h2>
                    <p style="font-size: 18px; margin: 5px 0;">虽然这次失败了，但你的努力值得肯定！</p>
                    <p style="font-size: 18px; margin: 5px 0;">继续学习，下次一定能成功！</p>
                </div>
                
                <!-- 视频播放器 -->
                <div style="border: 3px solid #ff6b6b; border-radius: 10px; overflow: hidden; background: #000; margin-bottom: 15px;">
                    <video id="defeatVideo" controls 
                           style="width: 100%; height: auto; max-height: 300px; display: block;">
                        <source src="../背景+音频/失败视频.mp4" type="video/mp4">
                    </video>
                </div>
                
                <!-- 视频提示 -->
                <div style="color: #ff6b6b; margin-bottom: 15px; padding: 10px; background: rgba(255,107,107,0.1); border-radius: 5px;">
                    <i class="fas fa-play-circle"></i> 观看失败视频
                </div>
            </div>
        `;
        
        this.setupDefeatVideoEvents();
    }

    // 设置失败视频事件
    setupDefeatVideoEvents() {
        const video = document.getElementById('defeatVideo');
        if (video) {
            video.addEventListener('loadeddata', () => {
                console.log('✅ 失败视频加载成功');
            });
            
            video.addEventListener('error', (e) => {
                console.log('失败视频加载错误:', e);
            });
        }
    }

    // 重新开始战斗
    restartBattle() {
        // 重置游戏状态
        this.bossHealth = 1000;
        this.playerHealth = 5;
        
        // 重置Boss血条
        const healthFill = document.getElementById('healthFill');
        const currentHealth = document.getElementById('currentHealth');
        if (healthFill) healthFill.style.width = '100%';
        if (currentHealth) currentHealth.textContent = '1000';
        
        // 重置玩家血条
        this.initPlayerHearts();
        
        // 隐藏失败界面，显示战斗界面
        const defeatScreen = document.getElementById('defeatScreen');
        const battleScene = document.getElementById('battleScene');
        if (defeatScreen) defeatScreen.style.display = 'none';
        if (battleScene) battleScene.style.display = 'block';
        
        // 重置音效播放状态
        this.hasRoarPlayed = false;
        this.hasHeroSoundPlayed = false;
        
        this.showBattleLog('战斗重新开始！加油！', 'success');
    }

    // 添加攻击动画方法
    async showAttackAnimation() {
        return new Promise(resolve => {
            const attackContainer = document.getElementById('heroAttack');
            const attackImage = document.getElementById('attackImage');
            
            if (!attackContainer || !attackImage) {
                resolve();
                return;
            }
            
            // 重置样式 - 真正横跨屏幕
            attackContainer.style.cssText = `
                position: fixed;
                top: 50%;
                left: 0;
                width: 100vw;
                height: 250px;
                transform: translateY(-50%);
                z-index: 1200;
                display: block;
                background: transparent;
                border: none;
                overflow: hidden;
            `;
            
            attackImage.style.cssText = `
                width: 100vw;
                height: 500px;
                background-image: url('../背景+音频/捷拉奥拉攻击.png');
                background-size: auto 500px;
                background-position: top center;
                background-repeat: no-repeat;
                background-color: transparent;
                position: absolute;
                top: 0;
                left: 0;
                border-radius: 0;
                border: none;
                animation: fullWidthExpand 0.6s ease-out forwards, electricBar 0.15s ease-in-out infinite;
            `;
            
            setTimeout(() => {
                attackContainer.style.display = 'none';
                resolve();
            }, 800);
        });
    }

    // 攻击Boss
    attackBoss(damage) {
        this.bossHealth -= damage;
        if (this.bossHealth < 0) this.bossHealth = 0;
        
        const healthPercent = (this.bossHealth / 1000) * 100;
        const healthFill = document.getElementById('healthFill');
        const currentHealth = document.getElementById('currentHealth');
        
        if (healthFill) healthFill.style.width = healthPercent + '%';
        if (currentHealth) currentHealth.textContent = this.bossHealth;
    }

    // 显示战斗信息
    showBattleLog(message, type) {
        const log = document.getElementById('battleLog');
        if (!log) return;
        
        log.textContent = message;
        log.style.display = 'block';
        log.style.background = type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)';
        log.style.borderColor = type === 'success' ? '#4CAF50' : '#F44336';
        
        setTimeout(() => {
            log.style.display = 'none';
        }, 2000);
    }

    // 检查胜利条件
// 修改 checkVictory() 函数：
checkVictory() {
    if (this.bossHealth <= 0) {
        setTimeout(() => {
            const victoryScreen = document.getElementById('victoryScreen');
            if (victoryScreen) {
                victoryScreen.style.display = 'flex';
                this.lazyLoadVictoryVideo();
                
                // ✅ 新增：标记Boss已战胜
                this.markBossVictoryInProgress();
            }
        }, 1000);
    }
}

// 新增：标记Boss战胜
markBossVictoryInProgress() {
    // 方法1：使用进度管理器
    if (window.progressManager) {
        window.progressManager.markBossDefeated();
    }
    
    // 方法2：直接存储到localStorage
    const progress = JSON.parse(localStorage.getItem('userProgress_v2')) || {
        chapters: {},
        bossDefeated: false
    };
    progress.bossDefeated = true;
    progress.bossDefeatDate = new Date().toISOString();
    localStorage.setItem('userProgress_v2', JSON.stringify(progress));
    
    // 方法3：发送消息通知其他页面
    window.postMessage({
        type: 'bossVictory',
        data: { victory: true, timestamp: new Date().toISOString() }
    }, '*');
    
    // 发送给父窗口（如果是从其他页面打开的）
    if (window.opener) {
        window.opener.postMessage({
            type: 'bossVictory',
            data: { victory: true }
        }, '*');
    }
    
    console.log('🎉 Boss战胜状态已保存！');
}

// 新增：在BossBattle类的init方法中检查Boss状态
init() {
    console.log('初始化BossBattle...');
    
    // ✅ 新增：加载进度管理器
    this.loadProgressManager();
    
    this.bindEvents();
    this.createRainEffect();
    this.setBossBackground();
    this.setupAudio();
    this.initPlayerHearts();
}

// ✅ 新增：加载进度管理器的方法
loadProgressManager() {
    if (typeof ProgressManager !== 'undefined') {
        console.log('✅ ProgressManager 已加载');
        return;
    }
    
    // boss.js 和 progressManager.js 在同一目录，直接引用
    const script = document.createElement('script');
    script.src = 'progressManager.js';  // 同目录
    
    script.onload = () => {
        console.log('✅ Boss界面：进度管理器加载成功');
        if (typeof ProgressManager === 'function') {
            window.progressManager = new ProgressManager();
        }
    };
    
    script.onerror = () => {
        console.warn('❌ Boss界面：进度管理器加载失败');
    };
    
    document.head.appendChild(script);
}
// 新增：检查现有Boss状态
checkExistingBossStatus() {
    const progress = JSON.parse(localStorage.getItem('userProgress_v2'));
    if (progress && progress.bossDefeated) {
        console.log('⚠️ 玩家已战胜过Boss');
        // 可以在这里添加一些视觉提示
        const title = document.querySelector('h1');
        if (title) {
            title.innerHTML += ' <span style="color:gold;font-size:0.8em;">(已通关)</span>';
        }
    }
}

    // 终极稳定的视频加载方案
    lazyLoadVictoryVideo() {
        console.log('显示胜利界面');
        
        const videoContainer = document.querySelector('.victory-video-container');
        if (!videoContainer) return;
        
        videoContainer.innerHTML = `
            <div style="text-align: center; max-width: 800px; margin: 0 auto;">
                <!-- 胜利庆祝标题 -->
                <div style="color: gold; padding: 20px; background: linear-gradient(135deg, #1a237e, #0d47a1); border: 3px solid gold; border-radius: 10px; margin-bottom: 15px;">
                    <h2 style="font-size: 32px; margin: 10px 0; text-shadow: 0 0 10px #ffd700;">🎉 传说级胜利！ 🎉</h2>
                    <p style="font-size: 18px; margin: 5px 0;">恭喜击败红色暴鲤龙！</p>
                    <p style="font-size: 18px; margin: 5px 0;">你的python技能获得了不少提升！</p>
                </div>
                
                <!-- 视频播放器 - 调整尺寸 -->
                <div style="border: 3px solid #ffd700; border-radius: 10px; overflow: hidden; background: #000; margin-bottom: 15px;">
                    <video id="victoryVideo" controls 
                           style="width: 100%; height: auto; max-height: 300px; display: block;">
                        <source src="../背景+音频/胜利视频.mp4" type="video/mp4">
                    </video>
                </div>
                
                <!-- 视频提示 -->
                <div style="color: #ffd700; margin-bottom: 15px; padding: 10px; background: rgba(255,215,0,0.1); border-radius: 5px;">
                    <i class="fas fa-play-circle"></i> 观看胜利时刻
                </div>
            </div>
        `;
        
        // 设置视频事件
        this.setupVideoEvents();
    }

    setupVideoEvents() {
        const video = document.getElementById('victoryVideo');
        if (video) {
            video.addEventListener('loadeddata', () => {
                console.log('✅ 胜利视频加载成功');
            });
            
            video.addEventListener('error', (e) => {
                console.log('视频加载错误:', e);
            });
        }
    }

    // 工具函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getDifficultyText(damage) {
        const texts = {
            100: '⚡ 难题 ⚡',
            80: '💥 中等题 💥', 
            75: '🌩️ 简单题 🌩️',
            40: '🚀 判断题 🚀'
        };
        return texts[damage] || '题目';
    }

    getQuestionsByDifficulty(damage) {
        const difficultyMap = {
            100: 'hard',
            80: 'medium',
            75: 'easy', 
            40: 'judge'
        };
        return this.questions[difficultyMap[damage]] || this.questions.easy;
    }

    // 初始化题目库（保持不变）
    // 简化测试题目库
initializeQuestions() {
    return {
        hard: [
            {
                id: 'hard-test', type: 'choice',
                question: '测试难题：Python中如何实现单例模式？',
                options: ['A. 使用__new__方法', 'B. 使用装饰器', 'C. 使用模块导入', 'D. 所有以上方法'],
                answer: 0
            }
        ],
        medium: [
            {
                id: 'medium-test', type: 'choice',
                question: '测试中等题：Python中列表和元组的主要区别？',
                options: ['A. 列表可变，元组不可变', 'B. 列表有序，元组无序', 'C. 列表可以哈希，元组不能', 'D. 没有区别'],
                answer: 0
            }
        ],
        easy: [
            {
                id: 'easy-test', type: 'choice',
                question: '测试简单题：Python中使用什么关键字定义函数？',
                options: ['A. def', 'B. function', 'C. define', 'D. func'],
                answer: 0
            }
        ],
        judge: [
            {
                id: 'judge-test', type: 'choice',
                question: '测试判断题：Python是编译型语言？',
                options: ['A. 正确', 'B. 错误'],
                answer: 1  // 注意：这里选B，因为Python是解释型语言
            }
        ]
    };
}
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，初始化BossBattle...');
    try {
        window.bossBattle = new BossBattle();
        console.log('BossBattle初始化成功');
    } catch (error) {
        console.error('BossBattle初始化失败:', error);
    }
});