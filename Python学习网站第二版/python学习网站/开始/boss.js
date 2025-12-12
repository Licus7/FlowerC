// 愤怒之湖 - 红色暴鲤龙Boss战

class BossBattleEnhanced {
    constructor() {
        // 游戏状态
        this.bossHealth = 1000;
        this.playerHealth = 5;
        this.currentSkill = null;
        this.isAnimating = false;
        this.isMusicPlaying = true;
        this.hasRoarPlayed = false;
        this.hasHeroSoundPlayed = false;
        this.isShaking = false;
        this.bossRageMode = false;
        
        // 特效控制
        this.magikarpInterval = null;
        this.lightningInterval = null;
        this.magikarpCount = 8; // 正常阶段鲤鱼王数量
        
        // 音频元素引用
        this.roarSound = null;
        this.heroSound = null;
        this.battleRainSound = null;
        this.thunderSound = null;
        
        // 题目库
        this.questions = this.initializeQuestions();
        
        this.init();
    }

    // 初始化游戏
    init() {
        console.log('初始化增强版BossBattle...');
        
        // 绑定事件
        this.bindEvents();
        
        // 创建特效
        this.createRainEffect();
        this.setBossBackground();
        
        // 设置音频
        this.setupAudio();
        
        // 初始化玩家血条
        this.initPlayerHearts();
        
        // 隐藏闪屏效果
        this.hideFlashEffects();
        
        console.log('增强版BossBattle初始化完成');
    }

    // ==================== 玩家相关 ====================
    
    // 初始化玩家血条
    initPlayerHearts() {
        const heartsContainer = document.getElementById('playerHearts');
        if (!heartsContainer) return;
        
        heartsContainer.innerHTML = '';
        
        for (let i = 0; i < this.playerHealth; i++) {
            const heart = document.createElement('div');
            heart.className = 'heart';
            heart.id = `heart-${i}`;
            heartsContainer.appendChild(heart);
        }
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

    // 玩家受击闪红效果
    playerHitFlash() {
        const redOverlay = document.getElementById('screenRedOverlay');
        if (redOverlay) {
            redOverlay.classList.add('active');
            setTimeout(() => {
                redOverlay.classList.remove('active');
            }, 800);
        }
    }

    // ==================== Boss相关 ====================
    
    // 设置Boss背景
    setBossBackground() {
        const background = document.getElementById('bossBackground');
        if (!background) return;
        
        // 设置背景图片
        background.style.backgroundImage = "url('../背景+音频/暴鲤龙背景.jpg')";
        background.style.backgroundSize = 'cover';
        background.style.backgroundPosition = 'center';
        background.style.backgroundRepeat = 'no-repeat';
        
        // 添加呼吸动画
        background.classList.add('boss-breathing');
    }

    // 攻击Boss
    attackBoss(damage) {
        const oldHealth = this.bossHealth;
        this.bossHealth -= damage;
        if (this.bossHealth < 0) this.bossHealth = 0;
        
        const healthPercent = (this.bossHealth / 1000) * 100;
        const healthFill = document.getElementById('healthFill');
        const currentHealth = document.getElementById('currentHealth');
        const healthBar = document.querySelector('.boss-health');
        
        if (healthFill) healthFill.style.width = healthPercent + '%';
        if (currentHealth) currentHealth.textContent = this.bossHealth;
        
        // =========== 血量预警系统 ===========
        if (healthBar) {
            healthBar.classList.remove('low-health', 'critical-health');
            
            if (this.bossHealth <= 300) {
                healthBar.classList.add('critical-health');
                this.bossRageMode = true;
                this.enhanceEnvironmentEffects();
                
                // 更新血条颜色为深红色
                if (healthFill) {
                    healthFill.style.background = '#cc0000';
                }
                
            } else if (this.bossHealth <= 600) {
                healthBar.classList.add('low-health');
                this.magikarpCount = 6;
                
                // 更新血条颜色为橙色
                if (healthFill) {
                    healthFill.style.background = '#ff6600';
                }
            } else {
                // 更新血条颜色为红色
                if (healthFill) {
                    healthFill.style.background = '#ff0000';
                }
            }
        }
        
        // =========== 阶段变化特效 ===========
        if (oldHealth > 600 && this.bossHealth <= 600) {
            this.phaseTransition(2);
        } else if (oldHealth > 300 && this.bossHealth <= 300) {
            this.phaseTransition(3);
        }
    }

    // Boss受击特效
    bossHitEffect() {
        const bossBg = document.getElementById('bossBackground');
        if (!bossBg) return;
        
        // 添加震怒效果
        bossBg.classList.add('boss-raging');
        bossBg.classList.remove('boss-breathing');
        
        // 鲤鱼王惊散效果
        this.createMagikarpScatter();
        
        // 恢复效果
        setTimeout(() => {
            bossBg.classList.add('boss-breathing');
        }, 800);
        
        setTimeout(() => {
            bossBg.classList.remove('boss-raging');
        }, 800);
    }

    // Boss怒视效果
    bossAngryLook() {
        const bossBg = document.getElementById('bossBackground');
        
        if (bossBg) {
            bossBg.classList.add('boss-raging');
            setTimeout(() => {
                bossBg.classList.remove('boss-raging');
            }, 1000);
        }
        
        // 显示危险提示
        this.showDangerAlert();
        
        // 播放更响亮的吼叫
        if (this.roarSound) {
            this.roarSound.currentTime = 0;
            this.roarSound.volume = 0.9;
            this.roarSound.play();
            setTimeout(() => {
                this.roarSound.volume = 0.7;
            }, 1000);
        }
    }

    // ==================== 环境特效 ====================
    
    // 创建雨滴效果
    createRainEffect() {
        const rainContainer = document.getElementById('rainEffect');
        if (!rainContainer) return;
        
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

    // 在湖中创建鲤鱼王
    createMagikarpSchool() {
        const lakeArea = document.getElementById('lakeArea');
        if (!lakeArea) return;
        
        // 清除已有的鲤鱼王
        document.querySelectorAll('.magikarp-gif').forEach(el => el.remove());
        
        // 创建鲤鱼王
        for (let i = 0; i < this.magikarpCount; i++) {
            this.createSingleMagikarp(i, lakeArea);
        }
        
        console.log(`在湖中创建了${this.magikarpCount}条鲤鱼王`);
        
        // 设置定时器，5秒后重新创建
        if (this.magikarpInterval) clearInterval(this.magikarpInterval);
        this.magikarpInterval = setInterval(() => {
            this.createMagikarpSchool();
        }, 5000);
    }

    // 创建单个鲤鱼王
    createSingleMagikarp(index, lakeArea) {
        const magikarp = document.createElement('img');
        magikarp.className = 'magikarp-gif';
        magikarp.alt = '鲤鱼王';
        
        // 使用鲤鱼王GIF
        const gifUrls = [
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/129.gif',
            'https://play.pokemonshowdown.com/sprites/ani/magikarp.gif'
        ];
        magikarp.src = gifUrls[Math.floor(Math.random() * gifUrls.length)];
        
        // 在湖区域内随机位置
        const posX = Math.random() * 100;
        const posY = 30 + Math.random() * 40;
        
        // 随机大小（60-120px）
        const size = 60 + Math.random() * 60;
        
        // 随机旋转角度
        const rotation = Math.random() * 30 - 15;
        
        // 设置样式
        magikarp.style.cssText = `
            position: fixed;
            left: ${posX}%;
            top: ${posY}%;
            width: ${size}px;
            height: auto;
            opacity: 0;
            z-index: 2;
            pointer-events: none;
            filter: brightness(0.9) contrast(1.2) drop-shadow(0 0 8px rgba(0, 150, 255, 0.7));
            transform: translate(-50%, -50%) rotate(${rotation}deg);
            animation: magikarpAppear${index} 1s ease-out forwards, magikarpFloat${index} 3s ease-in-out infinite;
        `;
        
        // 添加动画延迟
        const delay = Math.random() * 2;
        magikarp.style.animationDelay = `${delay}s, ${delay + 1}s`;
        
        // 创建动画
        this.createMagikarpAnimations(index, rotation);
        
        // 随机方向
        if (Math.random() > 0.5) {
            magikarp.style.transform += ' scaleX(-1)';
        }
        
        lakeArea.appendChild(magikarp);
        
        // 3-8秒后消失
        const disappearTime = 3000 + Math.random() * 5000;
        setTimeout(() => {
            this.fadeOutMagikarp(magikarp);
        }, disappearTime);
    }

    // 创建鲤鱼王动画
    createMagikarpAnimations(index, rotation) {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes magikarpAppear${index} {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5) rotate(${rotation}deg); }
                100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1) rotate(${rotation}deg); }
            }
            
            @keyframes magikarpFloat${index} {
                0%, 100% { transform: translate(-50%, -50%) rotate(${rotation}deg) translateY(0px); }
                50% { transform: translate(-50%, -50%) rotate(${rotation}deg) translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
    }

    // 鲤鱼王淡出效果
    fadeOutMagikarp(magikarp) {
        if (!magikarp.parentNode) return;
        
        magikarp.style.transition = 'opacity 1.5s ease-out, transform 1.5s ease-out';
        magikarp.style.opacity = '0';
        magikarp.style.transform += ' scale(0.5)';
        
        setTimeout(() => {
            if (magikarp.parentNode) {
                magikarp.remove();
            }
        }, 1500);
    }

    // 鲤鱼王惊散效果（Boss受击时）
    createMagikarpScatter() {
        const scatterCount = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < scatterCount; i++) {
            setTimeout(() => {
                const lakeArea = document.getElementById('lakeArea');
                if (!lakeArea) return;
                
                const magikarp = document.createElement('img');
                magikarp.className = 'magikarp-gif scatter';
                magikarp.alt = '鲤鱼王';
                magikarp.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/129.gif';
                
                // 从中心散开
                const angle = Math.random() * Math.PI * 2;
                const distance = 20 + Math.random() * 30;
                const endX = 50 + Math.cos(angle) * distance;
                const endY = 50 + Math.sin(angle) * distance;
                
                magikarp.style.cssText = `
                    position: fixed;
                    left: 50%;
                    top: 50%;
                    width: ${40 + Math.random() * 40}px;
                    height: auto;
                    opacity: 0.8;
                    z-index: 2;
                    pointer-events: none;
                    filter: brightness(1.2) drop-shadow(0 0 10px rgba(255, 0, 0, 0.7));
                    transform: translate(-50%, -50%);
                    animation: magikarpScatter${i} 0.8s ease-out forwards;
                `;
                
                // 散开动画
                const scatterStyle = document.createElement('style');
                scatterStyle.textContent = `
                    @keyframes magikarpScatter${i} {
                        0% { 
                            transform: translate(-50%, -50%) scale(1) rotate(0deg);
                            opacity: 0.8;
                        }
                        100% { 
                            transform: translate(-50%, -50%) translate(${endX - 50}%, ${endY - 50}%) scale(0.5) rotate(${Math.random() * 360}deg);
                            opacity: 0;
                        }
                    }
                `;
                document.head.appendChild(scatterStyle);
                
                lakeArea.appendChild(magikarp);
                
                setTimeout(() => {
                    if (magikarp.parentNode) {
                        magikarp.remove();
                    }
                }, 800);
            }, i * 100);
        }
    }

    // 随机闪电效果
    startRandomLightning() {
        if (this.lightningInterval) clearInterval(this.lightningInterval);
        
        this.lightningInterval = setInterval(() => {
            if (Math.random() > 0.8 && !this.isAnimating) {
                this.createLightning();
            }
        }, 12000);
    }

    // 创建闪电
    createLightning() {
        const lightning = document.getElementById('lightningEffect');
        if (!lightning) return;
        
        // 播放雷声
        if (this.thunderSound && this.isMusicPlaying) {
            this.thunderSound.currentTime = 0.5;
            this.thunderSound.volume = 0.3 + Math.random() * 0.3;
            this.thunderSound.play();
        }
        
        // 激活闪电效果
        lightning.classList.add('active');
        this.screenShake(0.15);
        
        // 血量低时闪电更强
        if (this.bossHealth < 300) {
            lightning.style.background = 'rgba(255, 255, 255, 0.9)';
        } else if (this.bossHealth < 600) {
            lightning.style.background = 'rgba(255, 255, 255, 0.7)';
        }
        
        setTimeout(() => {
            lightning.classList.remove('active');
            lightning.style.background = '';
        }, 300);
    }

    // ==================== 开始环境特效 ====================
    
    startEnvironmentEffects() {
        this.startRandomLightning();
        this.createMagikarpSchool();
        console.log('环境特效已启动');
    }

    // 增强环境特效（狂暴阶段）
    enhanceEnvironmentEffects() {
        if (this.lightningInterval) clearInterval(this.lightningInterval);
        
        // 使用狂暴阶段闪电
        this.startFuriousLightning();
        
        // 狂暴阶段增加鲤鱼王数量
        this.magikarpCount = 10;
        this.createMagikarpSchool();
        
        // 改变鲤鱼王颜色为红色
        setTimeout(() => {
            document.querySelectorAll('.magikarp-gif').forEach(magikarp => {
                if (!magikarp.classList.contains('scatter')) {
                    magikarp.style.filter = 'brightness(1.3) hue-rotate(-30deg) contrast(1.5) drop-shadow(0 0 10px rgba(255, 0, 0, 0.7))';
                }
            });
        }, 1000);
    }

    // 停止环境特效
    stopEnvironmentEffects() {
        if (this.magikarpInterval) {
            clearInterval(this.magikarpInterval);
            this.magikarpInterval = null;
        }
        
        if (this.lightningInterval) {
            clearInterval(this.lightningInterval);
            this.lightningInterval = null;
        }
        
        // 渐隐清除所有鲤鱼王
        document.querySelectorAll('.magikarp-gif').forEach(magikarp => {
            this.fadeOutMagikarp(magikarp);
        });
    }

    // ==================== 阶段过渡 ====================
    
    // 阶段过渡特效
    phaseTransition(phase) {
        console.log(`🎭 Boss进入第${phase}阶段！`);
        
        const bossBg = document.getElementById('bossBackground');
        if (!bossBg) return;
        
        // 停止当前呼吸动画
        bossBg.classList.remove('boss-breathing', 'raging-breathing', 'furious-breathing');
        
        if (phase === 2) {
            // =========== 第二阶段：愤怒阶段 ===========
            setTimeout(() => {
                // 切换到愤怒呼吸动画
                bossBg.classList.add('raging-breathing');
                
                // 显示阶段提示
                this.showBattleLog('⚡ 暴鲤龙开始愤怒！湖水剧烈波动！', 'warning');
                
                // 增加血条闪烁频率
                const healthBar = document.querySelector('.boss-health');
                if (healthBar && healthBar.classList.contains('low-health')) {
                    healthBar.style.animation = 'healthWarning 0.8s infinite';
                }
                
            }, 500);
            
            // 增加鲤鱼王惊散效果
            this.createMagikarpScatter(5);
            
            // 播放愤怒音效
            setTimeout(() => {
                this.playRoarSound();
            }, 300);
            
            // 增强闪电频率
            this.startRagingLightning();
            
            // 改变雨滴颜色
            this.changeRainColor('#ff9966');
            
        } else if (phase === 3) {
            // =========== 第三阶段：狂暴阶段 ===========
            setTimeout(() => {
                // 切换到狂暴呼吸动画
                bossBg.classList.add('furious-breathing');
                
                // 显示阶段提示
                this.showBattleLog('💥 暴鲤龙狂暴了！全力攻击！', 'danger');
                
                // 增加血条快速闪烁
                const healthBar = document.querySelector('.boss-health');
                if (healthBar && healthBar.classList.contains('critical-health')) {
                    healthBar.style.animation = 'healthWarning 0.4s infinite';
                }
                
                // 背景变红
                bossBg.style.filter = 'brightness(1.2) hue-rotate(-20deg) saturate(1.5)';
                
            }, 500);
            
            // 创建多个鲤鱼王惊散
            this.createMagikarpScatter(8);
            
            // 播放狂暴音效（连续吼叫）
            setTimeout(() => {
                this.playRoarSound();
                setTimeout(() => {
                    this.playRoarSound();
                }, 400);
            }, 300);
            
            // 最强闪电效果
            this.startFuriousLightning();
            
            // 雨滴变红色
            this.changeRainColor('#ff3333');
        }
        
        // 强力屏幕震动
        this.screenShake(1.5);
        
        // 显示阶段标题
        const phaseMessages = { 
            2: '愤怒阶段', 
            3: '狂暴阶段' 
        };
        this.showPhaseTitle(phaseMessages[phase]);
        
        // 创建阶段切换的闪电效果
        this.createIntenseLightning();
    }

    // 显示阶段标题
    showPhaseTitle(phaseName) {
        const phaseTitle = document.createElement('div');
        phaseTitle.className = 'phase-title';
        phaseTitle.textContent = phaseName;
        phaseTitle.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 48px;
            font-weight: bold;
            color: #ff0000;
            text-shadow: 0 0 20px #ff0000, 0 0 40px #ff0000;
            z-index: 999;
            opacity: 0;
            pointer-events: none;
            font-family: 'Courier New', monospace;
            animation: phaseTitleAnimation 2s ease-in-out forwards;
        `;
        
        document.body.appendChild(phaseTitle);
        
        // 2秒后移除
        setTimeout(() => {
            phaseTitle.remove();
        }, 2000);
    }

    // 愤怒阶段闪电
    startRagingLightning() {
        if (this.lightningInterval) clearInterval(this.lightningInterval);
        
        this.lightningInterval = setInterval(() => {
            if (Math.random() > 0.6 && !this.isAnimating) {
                this.createLightning();
            }
        }, 8000); // 每8秒有40%几率
    }

    // 狂暴阶段闪电
    startFuriousLightning() {
        if (this.lightningInterval) clearInterval(this.lightningInterval);
        
        this.lightningInterval = setInterval(() => {
            if (Math.random() > 0.4 && !this.isAnimating) {
                this.createLightning();
                // 50%几率双闪电
                if (Math.random() > 0.5) {
                    setTimeout(() => {
                        this.createLightning();
                    }, 200);
                }
            }
        }, 5000); // 每5秒有60%几率
    }

    // 改变雨滴颜色
    changeRainColor(color) {
        const rainDrops = document.querySelectorAll('.rain-drop');
        rainDrops.forEach(drop => {
            drop.style.background = color;
            drop.style.boxShadow = `0 0 5px ${color}`;
        });
    }

    // 强力闪电（阶段过渡时）
    createIntenseLightning() {
        const lightning = document.getElementById('lightningEffect');
        if (!lightning) return;
        
        // 播放强雷声
        this.playThunderSound();
        
        // 多重闪电效果
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                lightning.classList.add('active');
                this.screenShake(0.2);
                
                // 不同阶段的闪电颜色
                if (this.bossHealth <= 300) {
                    lightning.style.animation = 'redLightning 0.3s';
                } else if (this.bossHealth <= 600) {
                    lightning.style.animation = 'orangeLightning 0.3s';
                }
                
                setTimeout(() => {
                    lightning.classList.remove('active');
                    lightning.style.animation = '';
                }, 300);
            }, i * 300);
        }
    }

    // ==================== 音频控制 ====================
    
    setupAudio() {
        this.roarSound = document.getElementById('roarSound');
        this.heroSound = document.getElementById('heroSound');
        this.battleRainSound = document.getElementById('battleRainSound');
        this.thunderSound = document.getElementById('thunderSound');
        
        if (this.roarSound) this.roarSound.volume = 0.7;
        if (this.heroSound) this.heroSound.volume = 0.7;
        if (this.battleRainSound) this.battleRainSound.volume = 0.4;
        if (this.thunderSound) this.thunderSound.volume = 0.6;
    }

    // 播放战斗雨声
    playBattleRainSound() {
        if (this.isMusicPlaying && this.battleRainSound) {
            this.battleRainSound.currentTime = 0;
            this.battleRainSound.loop = true;
            this.battleRainSound.play();
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
            this.playBattleRainSound();
            musicBtn.textContent = '🎵 关闭声音';
            musicBtn.classList.remove('music-off');
            musicBtn.classList.add('music-on');
        } else {
            if (this.battleRainSound) this.battleRainSound.pause();
            musicBtn.textContent = '🔇 开启声音';
            musicBtn.classList.remove('music-on');
            musicBtn.classList.add('music-off');
        }
    }

    // 播放吼叫音效
    playRoarSound() {
        if (this.roarSound) {
            this.roarSound.currentTime = 0;
            this.roarSound.play();
        }
    }

    // 播放捷拉奥拉音效
    playHeroSound() {
        if (this.heroSound) {
            this.heroSound.currentTime = 0;
            this.heroSound.play();
        }
    }

    // 播放雷声
    playThunderSound() {
        if (this.thunderSound && this.isMusicPlaying) {
            this.thunderSound.currentTime = 0.2;
            this.thunderSound.volume = 0.5 + Math.random() * 0.3;
            this.thunderSound.play();
        }
    }

    // ==================== 战斗流程 ====================
    
    // 战斗开始序列
    async startBattleSequence() {
        if (this.isAnimating) return;
        this.isAnimating = true;
    
        const startBtn = document.getElementById('startBattle');
        if (startBtn) startBtn.disabled = true;

        try {
            console.log('开始战斗序列');
            
            // 播放雨声
            this.playBattleRainSound();
            
            // 1. 屏幕变黑
            await this.fadeToBlack();
            
            // 2. 播放吼叫
            if (!this.hasRoarPlayed) {
                this.playRoarSound();
                this.hasRoarPlayed = true;
            }
            
            await this.showStoryText('远处传来震耳欲聋的吼声...');
            await this.delay(2000);
            
            // 3. 显示帮助信息
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
            
            // 6. 开始环境特效
            this.startEnvironmentEffects();
            
        } catch (error) {
            console.error('动画序列错误:', error);
        } finally {
            this.isAnimating = false;
        }
    }

    // 进入战斗场景
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

    // ==================== 题目系统 ====================
    
    // 显示题目
    showQuestion(damageLevel) {
        const questions = this.getQuestionsByDifficulty(damageLevel);
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        
        const questionText = document.getElementById('questionText');
        const questionTitle = document.getElementById('questionTitle');
        const optionsContainer = document.getElementById('optionsContainer');
        const questionModal = document.getElementById('questionModal');
        
        if (!questionText || !questionTitle || !optionsContainer || !questionModal) return;
        
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

    // 检查答案
    async checkAnswer(userAnswer, correctAnswer) {
        const isCorrect = userAnswer === correctAnswer;
        const questionModal = document.getElementById('questionModal');
        if (questionModal) questionModal.style.display = 'none';

        if (isCorrect) {
            await this.showAttackAnimation();
            await this.slowFlash();
            this.screenShake();
            
            this.attackBoss(this.currentSkill.damage);
            this.showBattleLog(`⚡ 攻击成功！造成 ${this.currentSkill.damage} 点伤害！`, 'success');
            
            this.bossHitEffect();
        } else {
            this.showBattleLog('❌ 攻击失败！暴鲤龙反击了！', 'error');
            this.bossAngryLook();
            this.bossCounterAttack();
        }

        this.checkVictory();
    }

    // Boss反击
    bossCounterAttack() {
        this.playRoarSound();
        
        setTimeout(() => {
            this.damagePlayer();
        }, 800);
    }

    // ==================== 特效动画 ====================
    
    // 攻击动画
    async showAttackAnimation() {
        return new Promise(resolve => {
            const attackContainer = document.getElementById('heroAttack');
            const attackImage = document.getElementById('attackImage');
            
            if (!attackContainer || !attackImage) {
                resolve();
                return;
            }
            
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

    // 屏幕变黑
    fadeToBlack() {
        return new Promise(resolve => {
            const overlay = document.getElementById('screenOverlay');
            if (overlay) overlay.classList.add('active');
            setTimeout(resolve, 1000);
        });
    }

    // 屏幕变暗（新增）
    darkenScreen() {
        return new Promise(resolve => {
            const darken = document.getElementById('screenDarken');
            if (darken) {
                darken.classList.add('active');
                setTimeout(() => {
                    resolve();
                }, 1000);
            } else {
                resolve();
            }
        });
    }

    // 屏幕变亮（新增）
    lightenScreen() {
        return new Promise(resolve => {
            const darken = document.getElementById('screenDarken');
            if (darken) {
                darken.classList.remove('active');
                setTimeout(() => {
                    resolve();
                }, 1000);
            } else {
                resolve();
            }
        });
    }

    // 显示故事文本
    showStoryText(text) {
        return new Promise(resolve => {
            const storyElement = document.getElementById('storyText');
            if (storyElement) {
                const title = storyElement.querySelector('h3');
                if (title) title.textContent = text;
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

    // 显示捷拉奥拉
    showHeroPokemon() {
        return new Promise(resolve => {
            const hero = document.getElementById('heroPokemon');
            const heroImage = document.getElementById('heroImage');
            
            if (hero && heroImage) {
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

    // 屏幕震动
    screenShake(intensity = 1) {
        if (this.isShaking) return;
        this.isShaking = true;
        
        const battleScene = document.getElementById('battleScene');
        if (battleScene) {
            battleScene.classList.add('screen-shake');

            setTimeout(() => {
                battleScene.classList.remove('screen-shake');
                this.isShaking = false;
            }, 500 * intensity);
        } else {
            this.isShaking = false;
        }
    }

    // 缓慢白色闪屏
    slowFlash() {
        return new Promise(resolve => {
            const flash = document.getElementById('slowFlash');
            if (flash) {
                flash.style.display = 'block';
                flash.style.animation = 'none';
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

    // ==================== UI控制 ====================
    
    // 显示危险提示
    showDangerAlert(message = '危险！') {
        const alert = document.getElementById('dangerAlert');
        if (!alert) return;
        
        alert.textContent = message;
        alert.classList.add('show');
        
        setTimeout(() => {
            alert.classList.remove('show');
        }, 500);
    }

    // 显示战斗信息
    showBattleLog(message, type) {
        const log = document.getElementById('battleLog');
        if (!log) return;
        
        log.textContent = message;
        log.style.display = 'block';
        log.style.background = type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 
                               type === 'warning' ? 'rgba(255, 152, 0, 0.9)' :
                               type === 'danger' ? 'rgba(244, 67, 54, 0.9)' :
                               'rgba(244, 67, 54, 0.9)';
        log.style.borderColor = type === 'success' ? '#4CAF50' : 
                                type === 'warning' ? '#FF9800' :
                                type === 'danger' ? '#F44336' :
                                '#F44336';
        
        setTimeout(() => {
            log.style.display = 'none';
        }, 2000);
    }

    // 显示菜单
    showMenu() {
        const menuModal = document.getElementById('menuModal');
        if (menuModal) menuModal.style.display = 'block';
    }

    // 隐藏菜单
    hideMenu() {
        const menuModal = document.getElementById('menuModal');
        if (menuModal) menuModal.style.display = 'none';
    }

    // ==================== 游戏结束 ====================
    
    // 检查胜利条件 - 修复版
    checkVictory() {
        console.log(`检查胜利条件 - Boss血量: ${this.bossHealth}`);
        
        if (this.bossHealth <= 0) {
            console.log('🎉 Boss血量已为0，触发胜利条件！');
            
            // 设置动画状态
            this.isAnimating = true;
            
            // 停止所有环境特效
            this.stopEnvironmentEffects();
            
            // 停止背景音乐
            this.stopBattleRainSound();
            
            // 屏幕变暗
            this.darkenScreen();
            
            // 播放胜利音效（如果需要）
            this.playRoarSound();
            
            // 延迟显示胜利界面
            setTimeout(() => {
                // 隐藏战斗界面
                const battleScene = document.getElementById('battleScene');
                if (battleScene) battleScene.style.display = 'none';
                
                // 隐藏控制面板
                const controlPanel = document.getElementById('controlPanel');
                if (controlPanel) controlPanel.style.display = 'none';
                
                // 屏幕变亮
                this.lightenScreen();
                
                // 显示胜利界面
                const victoryScreen = document.getElementById('victoryScreen');
                if (victoryScreen) {
                    victoryScreen.style.display = 'flex';
                    this.lazyLoadVictoryVideo();
                }
                
                this.isAnimating = false;
                console.log('胜利界面已显示');
            }, 2000);
        }
    }

    // 检查失败条件
    checkDefeat() {
        console.log(`检查失败条件 - 玩家血量: ${this.playerHealth}`);
        
        if (this.playerHealth <= 0) {
            console.log('💀 玩家血量已为0，触发失败条件！');
            
            // 设置动画状态
            this.isAnimating = true;
            
            // 停止所有环境特效
            this.stopEnvironmentEffects();
            
            // 停止背景音乐
            this.stopBattleRainSound();
            
            // 屏幕变暗
            this.darkenScreen();
            
            // 播放失败音效
            this.playRoarSound();
            
            // 延迟显示失败界面
            setTimeout(() => {
                // 隐藏战斗界面
                const battleScene = document.getElementById('battleScene');
                if (battleScene) battleScene.style.display = 'none';
                
                // 隐藏控制面板
                const controlPanel = document.getElementById('controlPanel');
                if (controlPanel) controlPanel.style.display = 'none';
                
                // 屏幕变亮
                this.lightenScreen();
                
                // 显示失败界面
                const defeatScreen = document.getElementById('defeatScreen');
                if (defeatScreen) {
                    defeatScreen.style.display = 'flex';
                    this.lazyLoadDefeatVideo();
                }
                
                this.isAnimating = false;
                console.log('失败界面已显示');
            }, 2000);
        }
    }

    // 重新开始战斗
    restartBattle() {
        console.log('重新开始战斗');
        
        // 重置游戏状态
        this.bossHealth = 1000;
        this.playerHealth = 5;
        this.bossRageMode = false;
        this.magikarpCount = 8;
        this.isAnimating = false;
        this.hasRoarPlayed = false;
        this.hasHeroSoundPlayed = false;
        
        // 重置Boss血条
        const healthFill = document.getElementById('healthFill');
        const currentHealth = document.getElementById('currentHealth');
        if (healthFill) {
            healthFill.style.width = '100%';
            healthFill.style.background = '#ff0000';
        }
        if (currentHealth) currentHealth.textContent = '1000';
        
        // 重置血条预警
        const healthBar = document.querySelector('.boss-health');
        if (healthBar) {
            healthBar.classList.remove('low-health', 'critical-health');
            healthBar.style.animation = '';
        }
        
        // 重置玩家血条
        this.initPlayerHearts();
        
        // 重置Boss背景
        const bossBg = document.getElementById('bossBackground');
        if (bossBg) {
            bossBg.classList.remove('boss-raging', 'raging-breathing', 'furious-breathing');
            bossBg.classList.add('boss-breathing');
            bossBg.style.filter = '';
        }
        
        // 重置雨滴颜色
        this.changeRainColor('rgba(255, 255, 255, 0.6)');
        
        // 隐藏失败界面，显示战斗界面
        const defeatScreen = document.getElementById('defeatScreen');
        const victoryScreen = document.getElementById('victoryScreen');
        const battleScene = document.getElementById('battleScene');
        const controlPanel = document.getElementById('controlPanel');
        
        if (defeatScreen) defeatScreen.style.display = 'none';
        if (victoryScreen) victoryScreen.style.display = 'none';
        if (battleScene) battleScene.style.display = 'block';
        if (controlPanel) controlPanel.style.display = 'flex';
        
        // 重新开始环境特效
        this.startEnvironmentEffects();
        
        // 重新开始背景音乐
        this.playBattleRainSound();
        
        this.showBattleLog('战斗重新开始！加油！', 'success');
        
        console.log('战斗已重置');
    }

    // ==================== 工具函数 ====================
    
    // 绑定事件
    bindEvents() {
        console.log('绑定事件...');
        
        // 开始战斗按钮
        const startBtn = document.getElementById('startBattle');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (!this.isAnimating) this.startBattleSequence();
            });
        }

        // 技能按钮
        const skillButtons = document.querySelectorAll('.skill-btn');
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

        // 控制面板按钮
        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) menuBtn.addEventListener('click', () => this.showMenu());

        const musicBtn = document.getElementById('musicBtn');
        if (musicBtn) musicBtn.addEventListener('click', () => this.toggleMusic());

        // 菜单按钮
        const continueBtn = document.getElementById('continueBtn');
        if (continueBtn) continueBtn.addEventListener('click', () => this.hideMenu());

        const quitBtn = document.getElementById('quitBtn');
        if (quitBtn) quitBtn.addEventListener('click', () => {
            window.location.href = '../start.html';
        });

        // 视频控制按钮
        document.addEventListener('click', (e) => {
            if (e.target.id === 'skipVideo') {
                const video = document.getElementById('victoryVideo');
                if (video) video.pause();
            }
            if (e.target.id === 'replayVideo') {
                const video = document.getElementById('victoryVideo');
                if (video) {
                    video.currentTime = 0;
                    video.play();
                }
            }
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
        
        console.log('事件绑定完成');
    }

    // 隐藏闪屏效果
    hideFlashEffects() {
        const whiteFlash = document.getElementById('whiteFlash');
        if (whiteFlash) whiteFlash.style.display = 'none';
        
        const slowFlash = document.getElementById('slowFlash');
        if (slowFlash) slowFlash.style.display = 'none';
    }

    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 获取难度文本
    getDifficultyText(damage) {
        const texts = {
            100: '⚡ 难题 ⚡',
            80: '💥 中等题 💥', 
            75: '🌩️ 简单题 🌩️',
            40: '🚀 判断题 🚀'
        };
        return texts[damage] || '题目';
    }

    // 根据难度获取题目
    getQuestionsByDifficulty(damage) {
        const difficultyMap = {
            100: 'hard',
            80: 'medium',
            75: 'easy', 
            40: 'judge'
        };
        return this.questions[difficultyMap[damage]] || this.questions.easy;
    }

    // 视频加载（简化版）
    lazyLoadVictoryVideo() {
        const videoContainer = document.querySelector('.victory-video-container');
        if (!videoContainer) return;
        
        videoContainer.innerHTML = `
            <div style="text-align: center; max-width: 800px; margin: 0 auto;">
                <div style="color: gold; padding: 20px; background: linear-gradient(135deg, #1a237e, #0d47a1); border: 3px solid gold; border-radius: 10px; margin-bottom: 15px;">
                    <h2 style="font-size: 32px; margin: 10px 0; text-shadow: 0 0 10px #ffd700;">🎉 传说级胜利！ 🎉</h2>
                    <p style="font-size: 18px; margin: 5px 0;">恭喜击败红色暴鲤龙！</p>
                </div>
                <div style="border: 3px solid #ffd700; border-radius: 10px; overflow: hidden; background: #000; margin-bottom: 15px;">
                    <video id="victoryVideo" controls style="width: 100%; height: auto; max-height: 300px; display: block;">
                        <source src="../背景+音频/胜利视频.mp4" type="video/mp4">
                    </video>
                </div>
            </div>
        `;
    }

    // 失败视频加载
    lazyLoadDefeatVideo() {
        const defeatScreen = document.getElementById('defeatScreen');
        if (!defeatScreen) return;
        
        const videoContainer = defeatScreen.querySelector('.victory-video-container');
        if (!videoContainer) return;
        
        videoContainer.innerHTML = `
            <div style="text-align: center; max-width: 800px; margin: 0 auto;">
                <div style="color: #ff6b6b; padding: 20px; background: linear-gradient(135deg, #1a237e, #0d47a1); border: 3px solid #ff6b6b; border-radius: 10px; margin-bottom: 15px;">
                    <h2 style="font-size: 32px; margin: 10px 0; text-shadow: 0 0 10px #ff6b6b;">💪 勇气可嘉！ 💪</h2>
                    <p style="font-size: 18px; margin: 5px 0;">虽然这次失败了，但你的努力值得肯定！</p>
                </div>
                <div style="border: 3px solid #ff6b6b; border-radius: 10px; overflow: hidden; background: #000; margin-bottom: 15px;">
                    <video id="defeatVideo" controls style="width: 100%; height: auto; max-height: 300px; display: block;">
                        <source src="../背景+音频/失败视频.mp4" type="video/mp4">
                    </video>
                </div>
            </div>
        `;
    }

    // 初始化题目库
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
                    answer: 1
                }
            ]
        };
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，初始化增强版BossBattle...');
    try {
        window.bossBattle = new BossBattleEnhanced();
        console.log('增强版BossBattle初始化成功');
    } catch (error) {
        console.error('增强版BossBattle初始化失败:', error);
    }
});