// Boss战游戏逻辑
class BossBattle {
    constructor() {
        this.bossHealth = 1000;
        this.currentSkill = null;
        this.questions = this.initializeQuestions();
        this.isAnimating = false;
        this.isMusicPlaying = true;
        this.hasRoarPlayed = false;
        this.hasHeroSoundPlayed = false;
        this.isShaking = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.createRainEffect();
        this.setBossBackground();
        this.setupAudio();
    
        // 确保白色闪屏初始隐藏
        const whiteFlash = document.getElementById('whiteFlash');
        if (whiteFlash) {
            whiteFlash.style.display = 'none';
        }
        
        const slowFlash = document.getElementById('slowFlash');
        if (slowFlash) {
            slowFlash.style.display = 'none';
        }
    }

    // 设置音频
    setupAudio() {
        this.bgMusic = document.getElementById('bgMusic');
        this.roarSound = document.getElementById('roarSound');
        this.heroSound = document.getElementById('heroSound');
        this.battleRainSound = document.getElementById('battleRainSound');
        
        // 设置音量
        if (this.bgMusic) this.bgMusic.volume = 0.5;
        if (this.roarSound) this.roarSound.volume = 0.7;
        if (this.heroSound) this.heroSound.volume = 0.7;
        if (this.battleRainSound) this.battleRainSound.volume = 0.4;
        
        // 开始播放背景音乐
        this.playBackgroundMusic();
    }

    // 添加缺失的playBackgroundMusic方法
    playBackgroundMusic() {
        if (this.isMusicPlaying && this.bgMusic) {
            this.bgMusic.play().catch(e => {
                console.log('背景音乐播放失败:', e);
            });
        }
    }

    // 添加缺失的音频控制方法
    stopBattleRainSound() {
        if (this.battleRainSound) {
            this.battleRainSound.pause();
            this.battleRainSound.currentTime = 0;
        }
    }

    playBattleRainSound() {
        if (this.isMusicPlaying && this.battleRainSound) {
        this.battleRainSound.currentTime = 0;
        this.battleRainSound.loop = true; // 确保循环播放
        this.battleRainSound.play().catch(e => {
            console.log('战斗雨声音效播放失败:', e);
        });
        }
    }

    // 切换背景音乐
    toggleMusic() {
        this.isMusicPlaying = !this.isMusicPlaying;
        const musicBtn = document.getElementById('musicBtn');
        
        if (this.isMusicPlaying) {
            this.playBackgroundMusic();
            if (this.battleRainSound) this.battleRainSound.play();
            musicBtn.textContent = '🎵 禁音';
            musicBtn.classList.remove('music-off');
            musicBtn.classList.add('music-on');
        } else {
            if (this.bgMusic) this.bgMusic.pause();
            if (this.battleRainSound) this.battleRainSound.pause();
            musicBtn.textContent = '🔇 声音';
            musicBtn.classList.remove('music-on');
            musicBtn.classList.add('music-off');
        }
    }

    setBossBackground() {
        const background = document.getElementById('bossBackground');
        
        // 直接设置背景图片
        background.style.backgroundImage = "url('../背景+音频/暴鲤龙背景.jpg')";
        background.style.backgroundSize = 'cover';
        background.style.backgroundPosition = 'center';
        background.style.backgroundRepeat = 'no-repeat';
        
        console.log('背景图片已设置:', background.style.backgroundImage);
    }

    // 创建雨滴效果
    createRainEffect() {
        const rainContainer = document.getElementById('rainEffect');
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
        // 开始战斗按钮
        const startBtn = document.getElementById('startBattle');
        startBtn.addEventListener('click', () => {
            if (!this.isAnimating) {
                this.startBattleSequence();
            }
        });

        // 技能按钮
        document.querySelectorAll('.skill-btn').forEach(btn => {
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
        document.getElementById('menuBtn').addEventListener('click', () => {
            this.showMenu();
        });

        document.getElementById('musicBtn').addEventListener('click', () => {
            this.toggleMusic();
        });

        // 菜单按钮
        document.getElementById('continueBtn').addEventListener('click', () => {
            this.hideMenu();
        });

        document.getElementById('quitBtn').addEventListener('click', () => {
            window.location.href = 'start.html';
        });
    }

    // 显示菜单
    showMenu() {
        document.getElementById('menuModal').style.display = 'block';
    }

    // 隐藏菜单
    hideMenu() {
        document.getElementById('menuModal').style.display = 'none';
    }

    // 战斗开始序列
    
    async startBattleSequence() {
        if (this.isAnimating) return;
        this.isAnimating = true;
    
        document.getElementById('startBattle').disabled = true;

        try {
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
            overlay.classList.add('active');
            setTimeout(resolve, 1000);
        });
    }

    showStoryText(text) {
        return new Promise(resolve => {
            const storyElement = document.getElementById('storyText');
            storyElement.querySelector('h3').textContent = text;
            storyElement.style.display = 'block';
            
            setTimeout(() => {
                storyElement.style.display = 'none';
                resolve();
            }, 1500);
        });
    }

    showHeroPokemon() {
        return new Promise(resolve => {
            const hero = document.getElementById('heroPokemon');
            const heroImage = document.getElementById('heroImage');
            
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
        });
    }

    // 添加屏幕震动效果 + 受击音效
// 添加屏幕震动效果 + 受击音效
screenShake() {
    if (this.isShaking) return;
    this.isShaking = true;
    
    // 先播放受击音效
    this.playHitSound();
    
    // 音效播放后稍微延迟再开始震动（让音效先出来）
    setTimeout(() => {
        const battleScene = document.getElementById('battleScene');
        battleScene.classList.add('screen-shake');

        setTimeout(() => {
            battleScene.classList.remove('screen-shake');
            this.isShaking = false;
        }, 500);
    }, 200); // 延迟200毫秒开始震动
}

// 受击音效方法
playHitSound() {
    if (this.roarSound) {
        this.roarSound.currentTime = 1.6; // 从0.9秒开始，避免长前奏
        this.roarSound.volume = 0.5; // 音量调低一些
        this.roarSound.play().catch(e => {
            console.log('受击音效播放失败:', e);
        });
        
        // 1秒后恢复原始音量
        setTimeout(() => {
            this.roarSound.volume = 0.7;
        }, 1000);
    }
}

    // 添加缓慢白色闪屏
    slowFlash() {
        return new Promise(resolve => {
            const flash = document.getElementById('slowFlash');
            flash.style.display = 'block';
            flash.style.animation = 'none';
            
            // 触发重绘
            void flash.offsetWidth;
            
            flash.style.animation = 'slowFlash 1s ease-in-out';
            
            setTimeout(() => {
                flash.style.display = 'none';
                resolve();
            }, 1000);
        });
    }

    enterBattleScene() {
        document.getElementById('tutorialScreen').style.display = 'none';
        document.getElementById('screenOverlay').classList.remove('active');
        document.getElementById('battleScene').style.display = 'block';
        document.getElementById('controlPanel').style.display = 'flex'; 
    }

    // 显示题目
    showQuestion(damageLevel) {
        const questions = this.getQuestionsByDifficulty(damageLevel);
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        
        document.getElementById('questionText').textContent = randomQuestion.question;
        document.getElementById('questionTitle').textContent = this.getDifficultyText(damageLevel);
        
        const optionsContainer = document.getElementById('optionsContainer');
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
        
        document.getElementById('questionModal').style.display = 'block';
    }

    async checkAnswer(userAnswer, correctAnswer) {
        const isCorrect = userAnswer === correctAnswer;
        document.getElementById('questionModal').style.display = 'none';

        if (isCorrect) {
        // 成功特效：攻击动画 + 白色闪屏 + 屏幕震动
        await this.showAttackAnimation();
        await this.slowFlash();
        this.screenShake();  // <-- 这里调用屏幕震动
        
        this.attackBoss(this.currentSkill.damage);
        this.showBattleLog(`⚡ 攻击成功！造成 ${this.currentSkill.damage} 点伤害！`, 'success');
        } else {
        this.showBattleLog('❌ 攻击失败！Boss闪避了攻击！', 'error');
        }

        this.checkVictory();
    }

    // 添加攻击动画方法
    async showAttackAnimation() {
        return new Promise(resolve => {
            const attackContainer = document.getElementById('heroAttack');
            const attackImage = document.getElementById('attackImage');
            
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
        document.getElementById('healthFill').style.width = healthPercent + '%';
        document.getElementById('currentHealth').textContent = this.bossHealth;
    }

    // 显示战斗信息
    showBattleLog(message, type) {
        const log = document.getElementById('battleLog');
        log.textContent = message;
        log.style.display = 'block';
        log.style.background = type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)';
        log.style.borderColor = type === 'success' ? '#4CAF50' : '#F44336';
        
        setTimeout(() => {
            log.style.display = 'none';
        }, 2000);
    }

    // 检查胜利条件
    checkVictory() {
        if (this.bossHealth <= 0) {
            setTimeout(() => {
                document.getElementById('victoryScreen').style.display = 'flex';
                this.lazyLoadVictoryVideo();
            }, 1000);
        }
    }

    // 终极稳定的视频加载方案
   lazyLoadVictoryVideo() {
    console.log('显示胜利界面');
    
    const videoContainer = document.querySelector('.victory-video-container');
    
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

    // 初始化题目库
   initializeQuestions() {
        return {
            hard: [
                {
                type: 'choice',
                question: 'Python中如何实现单例模式？',
                options: [
                    '使用__new__方法',
                    '使用装饰器',
                    '使用模块导入',
                    '所有以上方法'
                ],
                answer: 3
                },
                {
                type: 'choice', 
                question: 'Python的GIL主要影响什么？',
                options: [
                    '单线程性能',
                    '多线程CPU密集型任务',
                    '内存管理',
                    '垃圾回收'
                ],
                answer: 1
                },
                {
                type: 'choice',
                question: 'Python中的元类(metaclass)主要用于什么？',
                options: [
                    '创建类的类',
                    '管理内存分配',
                    '优化性能',
                    '处理异常'
                ],
                answer: 0
                },
                {
                type: 'choice',
                question: 'Python中深拷贝和浅拷贝的主要区别是什么？',
                options: [
                    '浅拷贝只复制顶层对象，深拷贝递归复制所有子对象',
                    '深拷贝只复制基本类型，浅拷贝复制所有类型',
                    '浅拷贝更快，深拷贝更安全',
                    '没有区别'
                ],
                answer: 0
                },
                {
                type: 'choice',
                question: 'Python中的描述符(Descriptor)主要用于什么场景？',
                options: [
                    '属性访问控制',
                    '内存管理',
                    '网络编程',
                    '文件操作'
                ],
                answer: 0
                },
                {
                type: 'choice',
                question: 'Python中@staticmethod和@classmethod的区别是什么？',
                options: [
                    'classmethod第一个参数是cls，staticmethod没有特殊参数',
                    'staticmethod第一个参数是cls，classmethod没有特殊参数',
                    '两者完全相同',
                    'classmethod只能访问实例变量'
                ],
                answer: 0
                },
                {
                type: 'choice',
                question: 'Python中生成器(generator)的主要优势是什么？',
                options: [
                    '惰性计算，节省内存',
                    '执行速度更快',
                    '代码更简洁',
                    '更好的错误处理'
                ],
                answer: 0
                }
            ],
            medium: [
                {
                type: 'choice',
                question: 'Python中列表和元组的主要区别是什么？',
                options: [
                    '列表可变，元组不可变',
                    '列表有序，元组无序', 
                    '列表可以哈希，元组不能',
                    '没有区别'
                ],
                answer: 0
                },
                {
                type: 'choice',
                question: 'Python中的装饰器(decorator)本质上是什么？',
                options: [
                    '一个接受函数作为参数的高阶函数',
                    '一个特殊的类',
                    '一个内置函数',
                    '一个模块'
                ],
                answer: 0
                },
                {
                type: 'choice',
                question: 'Python中__init__和__new__的区别是什么？',
                options: [
                    '__new__创建实例，__init__初始化实例',
                    '__init__创建实例，__new__初始化实例',
                    '两者功能相同',
                    '__new__用于类方法，__init__用于实例方法'
                ],
                answer: 0
                },
                {
                type: 'choice',
                question: 'Python中如何处理循环导入问题？',
                options: [
                    '将导入语句放在函数或方法内部',
                    '使用importlib模块',
                    '无法处理',
                    '重新设计代码结构'
                ],
                answer: 0
                },
                {
                type: 'choice',
                question: 'Python中的上下文管理器(context manager)主要用于什么？',
                options: [
                    '资源管理，如文件操作',
                    '内存优化',
                    '性能监控',
                    '错误日志'
                ],
                answer: 0
                },
                {
                type: 'choice',
                question: 'Python中lambda函数与普通函数的区别？',
                options: [
                    'lambda是匿名函数，只能包含一个表达式',
                    'lambda可以有多个表达式',
                    'lambda性能更好',
                    '没有区别'
                ],
                answer: 0
                },
                {
                type: 'choice',
                question: 'Python中*args和**kwargs的作用是什么？',
                options: [
                    '接收可变数量的位置参数和关键字参数',
                    '定义函数参数类型',
                    '提高函数性能',
                    '处理异常'
                ],
                answer: 0
            }
            ],
            easy: [
                {
                type: 'choice',
                question: 'Python中使用什么关键字定义函数？',
                options: ['function', 'def', 'define', 'func'],
                answer: 1
                },
                {
                type: 'choice',
                question: 'Python中如何注释单行代码？',
                options: ['//', '#', '/*', '--'],
                answer: 1
                },
                {
                type: 'choice',
                question: 'Python中哪个关键字用于导入模块？',
                options: ['include', 'import', 'using', 'require'],
                answer: 1
                },
                {
                type: 'choice',
                question: 'Python中如何创建一个空列表？',
                options: ['[]', 'list()', '{}', 'both A and B'],
                answer: 3
                },
                {
                type: 'choice',
                question: 'Python中用于条件判断的关键字是什么？',
                options: ['if', 'when', 'case', 'check'],
                answer: 0
                },
                {
                type: 'choice',
                question: 'Python中哪个符号用于字符串格式化？',
                options: ['%', '$', '&', '#'],
                answer: 0
                },
                {
                type: 'choice',
                question: 'Python中如何获取列表的长度？',
                options: ['length()', 'size()', 'len()', 'count()'],
                answer: 2
                },
                {
                type: 'choice',
                question: 'Python中布尔值True和False的首字母必须？',
                options: ['大写', '小写', '无所谓', '混合大小写'],
                answer: 0
                }
                ],
            judge: [
                {
                type: 'judge',
                question: 'Python是编译型语言。',
                answer: false
                },
                {
                type: 'judge',
                question: 'Python支持函数式编程。',
                answer: true
                },
                {
                type: 'judge',
                question: 'Python中字符串是不可变对象。',
                answer: true
                },
                {
                type: 'judge',
                question: 'Python中所有类都继承自object类。',
                answer: true
                },
                {
                type: 'judge',
                question: 'Python中列表推导式比普通for循环更快。',
                answer: true
                },
                {
                type: 'judge',
                question: 'Python中字典的键可以是任意类型。',
                answer: false
                },
                {
                  type: 'judge',
                  question: 'Python中没有switch-case语句。',
                  answer: true
                },
                {
                 type: 'judge',
                 question: 'Python中finally块无论是否发生异常都会执行。',
                 answer: true
                 },
                {
                type: 'judge',
                question: 'Python中所有变量都是引用传递。',
                answer: true
                },
                {
                type: 'judge',
                question: 'Python中模块只能导入一次。',
                answer: false
             }
         ]
     };
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    window.bossBattle = new BossBattle();
});