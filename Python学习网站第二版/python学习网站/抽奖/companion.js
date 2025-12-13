// companion.js - 精灵陪伴系统（修复版，支持选择页面）
class CompanionSystem {
    constructor() {
        this.currentCompanion = null;
        this.settings = this.loadSettings();
        this.speechMessages = this.initSpeechMessages();
        this.companionElement = null;
        this.speechBubble = null;
        this.lastSpeechTime = 0;
        this.speechTimeout = null;
        this.mouseX = 0;
        this.mouseY = 0;
        this.companionX = 0;
        this.companionY = 0;
        this.isFollowing = false;
        
        console.log('🎮 精灵陪伴系统初始化...');
    }
    
    // 加载设置 - 修改默认位置为右侧中间
    loadSettings() {
        const defaultSettings = {
            showCompanion: true,
            followMouse: true,
            showSpeech: true,
            autoRotate: false,
            lastRotationDate: null,
            companionPosition: { x: 85, y: 50 },  // 默认右侧中间（85%宽度，50%高度）
            size: 'medium',
            opacity: 0.9,
            enableEffects: true
        };
        
        const saved = localStorage.getItem('companionSettings');
        const loaded = saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        
        // 如果位置不在右侧区域（<70%），调整为右侧中间
        if (loaded.companionPosition.x < 70) {
            loaded.companionPosition = { x: 85, y: 50 };
        }
        
        return loaded;
    }
    
    // 保存设置
    saveSettings() {
        localStorage.setItem('companionSettings', JSON.stringify(this.settings));
    }
    
    // 初始化对话内容
    initSpeechMessages() {
        return {
            encouragement: [
                "加油！你能行的！💪",
                "今天的学习任务完成了吗？📚",
                "坚持就是胜利！✨",
                "休息一下，别太累哦~ ☕",
                "你好棒！继续前进！🚀",
                "学习使我快乐！🎯",
                "每天进步一点点！📈",
                "你是最棒的！🌟"
            ],
            
            practice: [
                "这道题我会！让我来帮你！🤔",
                "Python很有趣对吧？🐍",
                "代码写错没关系，调试就好！🔧",
                "又答对一题！太厉害了！🎉",
                "学习编程就像冒险！🗺️",
                "函数、循环、条件语句... 我都懂！💡"
            ],
            
            boss: [
                "Boss来了！准备战斗！⚔️",
                "我的技能可以帮到你！🔥",
                "集中注意力！我们能赢！🎯",
                "胜利就在眼前！🏆",
                "小心Boss的攻击！🛡️"
            ],
            
            lottery: [
                "抽奖时间到！祝你好运！🍀",
                "哇！金色传说！🌟",
                "新朋友！欢迎加入！👋",
                "我的小伙伴又多了！🎊"
            ],
            
            selection: [
                "欢迎来到精灵选择页面！🎉",
                "点击我可以切换位置哦！👆",
                "选择你喜欢的陪伴精灵吧！❤️",
                "每个精灵都有独特的性格呢！✨",
                "我会一直在这里陪着你！🤗",
                "试试双击我，有惊喜！✨",
                "我的伙伴们都等着被选择呢！🌟",
                "传说精灵特别帅气哦！🔥"
            ],
            
            morning: ["早上好！新的一天开始啦！🌞", "早餐吃了吗？要补充能量哦！🍳"],
            afternoon: ["下午茶时间到！☕", "保持专注！💪"],
            evening: ["晚上学习效率高！🌙", "注意休息眼睛哦~ 👀"],
            lateNight: ["夜深了，早点休息吧！🌃", "明天再继续战斗！💤"]
        };
    }
    
    // 获取当前陪伴精灵
    getCurrentCompanion() {
        const saved = localStorage.getItem('currentCompanion');
        if (saved) {
            this.currentCompanion = JSON.parse(saved);
            return this.currentCompanion;
        }
        
        // 默认陪伴精灵（皮卡丘）
        const defaultCompanion = {
            id: 25,
            name: '皮卡丘',
            image: 'pokemon_gifs/25.gif',
            rarity: 'common',
            type: 'electric',
            obtainedDate: new Date().toISOString()
        };
        
        this.setCompanion(defaultCompanion);
        return defaultCompanion;
    }
    
    // 设置陪伴精灵
    setCompanion(pet) {
        this.currentCompanion = {
            id: pet.id,
            name: pet.name,
            image: pet.image || this.getPokemonImage(pet.id),
            rarity: pet.rarity || 'common',
            type: pet.type || 'normal',
            selectedDate: new Date().toISOString()
        };
        
        localStorage.setItem('currentCompanion', JSON.stringify(this.currentCompanion));
        console.log(`🎯 设置陪伴精灵: ${pet.name}`);
        
        // 如果已经有显示中的精灵，更新它
        if (this.companionElement) {
            this.updateCompanionDisplay();
        }
        
        return this.currentCompanion;
    }
    
    // 获取可选的精灵列表
    getAvailablePets() {
        const myPets = JSON.parse(localStorage.getItem('myPets') || '[]');
        const currentId = this.currentCompanion?.id;
        
        // 标记当前选中的精灵
        return myPets.map(pet => ({
            ...pet,
            isCurrent: pet.id === currentId
        }));
    }
    
    // 检查是否在选择页面
    isSelectionPage() {
        return window.location.pathname.includes('选择精灵') || 
               document.title.includes('选择陪伴精灵') ||
               document.querySelector('.companion-selection');
    }
    
    // 创建陪伴精灵DOM元素
    createCompanionElement() {
        if (!this.settings.showCompanion || !this.currentCompanion) {
            return null;
        }
        
        // 移除旧的精灵元素
        this.removeCompanionElement();
        
        // 创建精灵容器
        this.companionElement = document.createElement('div');
        this.companionElement.id = 'petCompanion';
        this.companionElement.className = `pet-companion ${this.currentCompanion.rarity}`;
        
        // 设置基本样式
        const size = this.getCompanionSize();
        this.companionElement.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            z-index: 9998;
            pointer-events: auto;
            transition: all 0.3s ease;
            opacity: ${this.settings.opacity};
            filter: drop-shadow(0 5px 15px rgba(0,0,0,0.3));
            user-select: none;
            cursor: pointer;
        `;
        
        // 根据页面类型设置不同位置
        if (this.isSelectionPage()) {
            // 选择页面：右侧中间，稍微小一点
            this.companionElement.style.zIndex = '10000'; // 更高层级
            this.companionElement.style.transform = 'scale(0.9)'; // 稍微小一点
            this.setCompanionPosition(85, 50);
        } else {
            // 其他页面：正常位置
            this.setCompanionPosition(this.settings.companionPosition.x, this.settings.companionPosition.y);
        }
        
        // 创建精灵图片
        const img = document.createElement('img');
        img.src = this.currentCompanion.image;
        img.alt = this.currentCompanion.name;
        img.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: contain;
            image-rendering: pixelated;
            pointer-events: none;
        `;
        
        img.onerror = () => {
            img.src = this.getPokemonImage(this.currentCompanion.id, false);
        };
        
        this.companionElement.appendChild(img);
        
        // 添加稀有度特效
        this.addRarityEffects();
        
        // 添加到页面
        document.body.appendChild(this.companionElement);
        
        // 创建对话气泡
        if (this.settings.showSpeech) {
            this.createSpeechBubble();
        }
        
        // 添加事件监听器
        this.setupEventListeners();
        
        // 如果是跟随鼠标模式，启动跟随
        if (this.settings.followMouse && window.innerWidth > 768 && !this.isSelectionPage()) {
            this.startMouseFollowing();
        }
        
        // 窗口大小变化时重新定位
        window.addEventListener('resize', () => this.handleWindowResize());
        
        // 自动显示欢迎语
        setTimeout(() => {
            if (this.isSelectionPage()) {
                this.showRandomSpeech('selection');
            } else {
                this.showRandomSpeech('encouragement');
            }
        }, 1000);
        
        return this.companionElement;
    }
    
    // 设置事件监听器
    setupEventListeners() {
        if (!this.companionElement) return;
        
        // 点击显示对话
        this.companionElement.addEventListener('click', () => {
            this.showRandomSpeech();
        });
        
        // 鼠标悬停效果
        this.companionElement.addEventListener('mouseenter', () => {
            this.companionElement.style.transform = this.isSelectionPage() ? 'scale(1.0)' : 'scale(1.1)';
            this.companionElement.style.filter = 'drop-shadow(0 8px 20px rgba(0,0,0,0.4)) brightness(1.1)';
        });
        
        this.companionElement.addEventListener('mouseleave', () => {
            this.companionElement.style.transform = this.isSelectionPage() ? 'scale(0.9)' : 'scale(1)';
            this.companionElement.style.filter = `drop-shadow(0 5px 15px rgba(0,0,0,0.3))`;
        });
        
        // 选择页面特殊功能：双击切换位置
        if (this.isSelectionPage()) {
            this.companionElement.addEventListener('dblclick', () => {
                const currentX = this.settings.companionPosition.x;
                const newX = currentX > 50 ? 20 : 85; // 在左侧20%和右侧85%之间切换
                
                this.setCompanionPosition(newX, 50);
                this.showSpeech("换个位置看看！✨", 2000);
            });
        }
    }
    
    // 获取精灵图片
    getPokemonImage(id, useGif = true) {
        const basePath = 'pokemon_gifs/';
        
        if (useGif) {
            return `${basePath}${id}.gif`;
        }
        return `${basePath}${id}.png`;
    }
    
    // 获取精灵大小
    getCompanionSize() {
        const sizes = {
            'small': 80,
            'medium': 120,
            'large': 160
        };
        const size = sizes[this.settings.size] || 120;
        
        // 移动端适配
        if (window.innerWidth <= 768) {
            return Math.min(size, 100);
        }
        
        return size;
    }
    
    // 设置精灵位置（使用百分比）
    setCompanionPosition(xPercent, yPercent) {
        if (!this.companionElement) return;
        
        // 限制位置范围（选择页面可以在左右切换，其他页面固定在右侧）
        const isSelection = this.isSelectionPage();
        const minX = isSelection ? 20 : 70;
        const maxX = isSelection ? 95 : 95;
        
        const limitedX = Math.max(minX, Math.min(maxX, xPercent));
        const limitedY = Math.max(20, Math.min(80, yPercent));
        
        // 计算实际像素位置
        const size = this.getCompanionSize();
        const x = (window.innerWidth * limitedX / 100) - size / 2;
        const y = (window.innerHeight * limitedY / 100) - size / 2;
        
        // 应用位置
        this.companionElement.style.left = `${x}px`;
        this.companionElement.style.top = `${y}px`;
        
        // 保存位置
        this.settings.companionPosition = { x: limitedX, y: limitedY };
        this.saveSettings();
    }
    
    // 窗口大小变化处理
    handleWindowResize() {
        if (!this.companionElement) return;
        
        // 重新应用位置
        const { x, y } = this.settings.companionPosition;
        this.setCompanionPosition(x, y);
    }
    
    // 更新精灵显示
    updateCompanionDisplay() {
        if (!this.companionElement || !this.currentCompanion) return;
        
        // 更新图片
        const img = this.companionElement.querySelector('img');
        if (img) {
            img.src = this.currentCompanion.image;
            img.onerror = () => {
                img.src = this.getPokemonImage(this.currentCompanion.id, false);
            };
        }
        
        // 更新类名
        this.companionElement.className = `pet-companion ${this.currentCompanion.rarity}`;
        
        // 更新尺寸
        const size = this.getCompanionSize();
        this.companionElement.style.width = `${size}px`;
        this.companionElement.style.height = `${size}px`;
        
        // 重新定位
        const { x, y } = this.settings.companionPosition;
        this.setCompanionPosition(x, y);
        
        // 更新特效
        this.addRarityEffects();
    }
    
    // 添加稀有度特效（简化版，去掉多余的光环）
    addRarityEffects() {
        if (!this.companionElement || !this.settings.enableEffects) return;
        
        // 移除旧的特效
        const oldEffects = this.companionElement.querySelectorAll('.companion-effect');
        oldEffects.forEach(effect => effect.remove());
        
        const rarity = this.currentCompanion?.rarity;
        
        // 只有传说精灵有特效
        if (rarity === 'legendary') {
            // 简单的金色边框
            const border = document.createElement('div');
            border.className = 'companion-effect legendary-border';
            border.style.cssText = `
                position: absolute;
                top: -5px;
                left: -5px;
                right: -5px;
                bottom: -5px;
                border: 3px solid gold;
                border-radius: 50%;
                pointer-events: none;
                animation: gentleBob 2s ease-in-out infinite;
            `;
            this.companionElement.appendChild(border);
        }
    }
    
    // 创建对话气泡
    createSpeechBubble() {
        this.speechBubble = document.createElement('div');
        this.speechBubble.id = 'petSpeechBubble';
        this.speechBubble.style.cssText = `
            position: fixed;
            background: linear-gradient(135deg, #ffffff, #f0f7ff);
            color: #2c3e50;
            padding: 12px 18px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
            z-index: 9999;
            pointer-events: none;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
            max-width: 200px;
            min-width: 120px;
            text-align: center;
            border: 2px solid #3498db;
            font-family: 'Arial', 'Microsoft YaHei', sans-serif;
            line-height: 1.4;
            display: none;
        `;
        
        document.body.appendChild(this.speechBubble);
    }
    
    // 显示随机对话
    showRandomSpeech(category = null) {
        if (!this.speechBubble || !this.settings.showSpeech) return;
        
        // 限制对话频率（至少3秒一次）
        const now = Date.now();
        if (now - this.lastSpeechTime < 3000) return;
        this.lastSpeechTime = now;
        
        // 获取合适的对话类别
        if (!category) {
            const hour = new Date().getHours();
            if (hour < 12) category = 'morning';
            else if (hour < 18) category = 'afternoon';
            else if (hour < 22) category = 'evening';
            else category = 'lateNight';
        }
        
        let messages = this.speechMessages[category] || this.speechMessages.encouragement;
        
        // 根据页面类型添加特定对话
        if (this.isSelectionPage()) {
            messages = messages.concat(this.speechMessages.selection);
        } else {
            const path = window.location.pathname;
            if (path.includes('practice')) {
                messages = messages.concat(this.speechMessages.practice);
            } else if (path.includes('boss')) {
                messages = messages.concat(this.speechMessages.boss);
            } else if (path.includes('lottery')) {
                messages = messages.concat(this.speechMessages.lottery);
            }
        }
        
        // 随机选择一条消息
        const message = messages[Math.floor(Math.random() * messages.length)];
        this.showSpeech(message);
    }
    
    // 显示指定对话
    showSpeech(text, duration = 3000) {
        if (!this.speechBubble || !this.companionElement) return;
        
        // 设置文本
        this.speechBubble.textContent = text;
        this.speechBubble.style.display = 'block';
        
        // 等待下一帧确保尺寸已计算
        setTimeout(() => {
            const companionRect = this.companionElement.getBoundingClientRect();
            const bubbleRect = this.speechBubble.getBoundingClientRect();
            
            // 计算气泡位置（精灵左侧）
            let bubbleX = companionRect.left - bubbleRect.width - 10;
            let bubbleY = companionRect.top + companionRect.height / 2 - bubbleRect.height / 2;
            
            // 确保不超出屏幕
            if (bubbleX < 10) {
                // 如果左侧空间不足，显示在右侧
                bubbleX = companionRect.right + 10;
            }
            
            // 确保垂直方向不超出屏幕
            if (bubbleY < 10) bubbleY = 10;
            if (bubbleY + bubbleRect.height > window.innerHeight - 10) {
                bubbleY = window.innerHeight - bubbleRect.height - 10;
            }
            
            // 设置位置
            this.speechBubble.style.left = `${bubbleX}px`;
            this.speechBubble.style.top = `${bubbleY}px`;
            this.speechBubble.style.opacity = '1';
            this.speechBubble.style.transform = 'translateY(0)';
            
            // 设置自动隐藏
            clearTimeout(this.speechTimeout);
            this.speechTimeout = setTimeout(() => {
                this.hideSpeech();
            }, duration);
        }, 0);
    }
    
    // 隐藏对话气泡
    hideSpeech() {
        if (!this.speechBubble) return;
        this.speechBubble.style.opacity = '0';
        this.speechBubble.style.transform = 'translateY(10px)';
        setTimeout(() => {
            this.speechBubble.style.display = 'none';
        }, 300);
    }
    
    // 开始鼠标跟随
    startMouseFollowing() {
        if (this.isFollowing) return;
        
        this.isFollowing = true;
        
        // 监听鼠标移动
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        
        // 开始动画循环
        this.followAnimation();
    }
    
    // 处理鼠标移动
    handleMouseMove(e) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }
    
    // 跟随动画
    followAnimation() {
        if (!this.companionElement || !this.isFollowing) return;
        
        // 计算目标位置（但限制在右侧区域）
        let targetX = (this.mouseX / window.innerWidth) * 100;
        let targetY = (this.mouseY / window.innerHeight) * 100;
        
        // 限制在右侧区域
        targetX = Math.max(70, Math.min(95, targetX));
        targetY = Math.max(20, Math.min(80, targetY));
        
        // 平滑移动到目标位置
        const currentX = this.settings.companionPosition.x;
        const currentY = this.settings.companionPosition.y;
        
        const newX = currentX + (targetX - currentX) * 0.1;
        const newY = currentY + (targetY - currentY) * 0.1;
        
        this.setCompanionPosition(newX, newY);
        
        // 继续动画
        requestAnimationFrame(() => this.followAnimation());
    }
    
    // 停止鼠标跟随
    stopMouseFollowing() {
        this.isFollowing = false;
        document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    }
    
    // 移除陪伴精灵
    removeCompanionElement() {
        // 停止鼠标跟随
        this.stopMouseFollowing();
        
        // 移除窗口监听器
        window.removeEventListener('resize', () => this.handleWindowResize());
        
        // 移除元素
        if (this.companionElement && this.companionElement.parentNode) {
            this.companionElement.parentNode.removeChild(this.companionElement);
        }
        if (this.speechBubble && this.speechBubble.parentNode) {
            this.speechBubble.parentNode.removeChild(this.speechBubble);
        }
        
        this.companionElement = null;
        this.speechBubble = null;
    }
    
    // 切换显示状态
    toggleCompanion(show) {
        this.settings.showCompanion = show !== undefined ? show : !this.settings.showCompanion;
        this.saveSettings();
        
        if (this.settings.showCompanion) {
            this.createCompanionElement();
        } else {
            this.removeCompanionElement();
        }
    }
    
    // 切换鼠标跟随
    toggleFollowMouse(enable) {
        this.settings.followMouse = enable !== undefined ? enable : !this.settings.followMouse;
        this.saveSettings();
        
        if (this.settings.followMouse && !this.isSelectionPage()) {
            this.startMouseFollowing();
        } else {
            this.stopMouseFollowing();
            // 重置到右侧中间
            this.setCompanionPosition(85, 50);
        }
    }
}

// 全局实例
window.companionSystem = new CompanionSystem();

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
    // 预加载精灵图片（如果lottery.js提供了这个函数）
    if (typeof window.preloadPokemonImages === 'function') {
        window.preloadPokemonImages();
    }
    
    const companionSystem = window.companionSystem;
    const isSelectionPage = companionSystem.isSelectionPage();
    
    if (isSelectionPage) {
        // 选择页面：初始化页面功能并显示精灵
        initializeSelectionPage();
        
        // 延迟创建陪伴精灵，确保DOM完全加载
        setTimeout(() => {
            if (companionSystem.settings.showCompanion) {
                companionSystem.createCompanionElement();
            }
        }, 800);
    } else {
        // 其他页面：只显示陪伴精灵
        setTimeout(() => {
            const companion = companionSystem.getCurrentCompanion();
            if (companion && companionSystem.settings.showCompanion) {
                companionSystem.createCompanionElement();
            }
        }, 500);
    }
});

// 页面切换时重新创建精灵
window.addEventListener('pageshow', function(event) {
    const companionSystem = window.companionSystem;
    const isSelectionPage = companionSystem.isSelectionPage();
    
    if (!isSelectionPage) {
        setTimeout(() => {
            const companion = companionSystem.getCurrentCompanion();
            if (companion && companionSystem.settings.showCompanion) {
                if (!document.getElementById('petCompanion')) {
                    companionSystem.createCompanionElement();
                }
            }
        }, 300);
    }
});

// 选择页面初始化
function initializeSelectionPage() {
    const companionSystem = window.companionSystem;
    const currentCompanion = companionSystem.getCurrentCompanion();
    
    // 更新当前精灵显示
    const currentImg = document.getElementById('currentCompanionImg');
    const currentName = document.getElementById('currentCompanionName');
    const currentStatus = document.getElementById('currentCompanionStatus');
    
    if (currentImg) currentImg.src = currentCompanion.image;
    if (currentName) currentName.textContent = currentCompanion.name;
    if (currentStatus) {
        currentStatus.textContent = '✓ 正在陪伴你';
        currentStatus.className = 'text-success';
    }
    
    // 加载可选的精灵
    loadAvailablePets();
    
    // 加载设置
    loadSettings();
    
    // 绑定设置切换事件
    const showToggle = document.getElementById('showCompanionToggle');
    const followToggle = document.getElementById('followMouseToggle');
    const speechToggle = document.getElementById('showSpeechToggle');
    const rotateToggle = document.getElementById('autoRotateToggle');
    
    if (showToggle) {
        showToggle.addEventListener('change', function() {
            companionSystem.settings.showCompanion = this.checked;
            companionSystem.saveSettings();
            updateCompanionDisplay();
        });
    }
    
    if (followToggle) {
        followToggle.addEventListener('change', function() {
            companionSystem.toggleFollowMouse(this.checked);
        });
    }
    
    if (speechToggle) {
        speechToggle.addEventListener('change', function() {
            companionSystem.settings.showSpeech = this.checked;
            companionSystem.saveSettings();
        });
    }
    
    if (rotateToggle) {
        rotateToggle.addEventListener('change', function() {
            companionSystem.settings.autoRotate = this.checked;
            companionSystem.saveSettings();
        });
    }
}

// 加载可选精灵
function loadAvailablePets() {
    const companionSystem = window.companionSystem;
    const availablePets = companionSystem.getAvailablePets();
    const grid = document.getElementById('companionGrid');
    
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (availablePets.length === 0) {
        grid.innerHTML = `
            <div class="no-pets-message">
                <i class="fas fa-box-open fa-3x"></i>
                <p>你还没有获得任何精灵<br>快去抽奖吧！</p>
                <a href="lottery.html" style="
                    display: inline-block;
                    margin-top: 20px;
                    padding: 10px 25px;
                    background: linear-gradient(135deg, #FF416C, #FF4B2B);
                    color: white;
                    border-radius: 25px;
                    text-decoration: none;
                    font-weight: bold;
                ">
                    <i class="fas fa-star"></i> 去抽奖
                </a>
            </div>
        `;
        return;
    }
    
    availablePets.forEach(pet => {
        const petCard = document.createElement('div');
        petCard.className = `pet-select-card ${pet.isCurrent ? 'selected' : ''}`;
        petCard.dataset.id = pet.id;
        petCard.title = `点击选择${pet.name}作为陪伴精灵`;
        
        petCard.innerHTML = `
            <div class="pet-select-img">
                <img src="${pet.image}" alt="${pet.name}"
                     onerror="this.onerror=null; this.src='${companionSystem.getPokemonImage(pet.id, false)}'">
            </div>
            <h5>${pet.name}</h5>
            <span class="pet-rarity" style="
                display: inline-block;
                padding: 3px 10px;
                border-radius: 15px;
                font-size: 12px;
                font-weight: bold;
                color: white;
                background: ${getRarityColor(pet.rarity)};
                margin: 5px 0;
            ">
                ${getRarityText(pet.rarity)}
            </span>
            <button class="select-btn ${pet.isCurrent ? 'selected' : ''}" 
                    onclick="selectCompanion(${pet.id}, '${escapeHtml(pet.name)}', '${escapeHtml(pet.image)}', '${pet.rarity}')">
                ${pet.isCurrent ? '<i class="fas fa-check"></i> 当前陪伴' : '<i class="fas fa-heart"></i> 设为陪伴'}
            </button>
        `;
        
        // 添加卡片点击事件
        petCard.addEventListener('click', function(e) {
            // 防止按钮点击事件冒泡
            if (e.target.closest('.select-btn')) return;
            
            // 点击卡片时也选择精灵
            selectCompanion(pet.id, pet.name, pet.image, pet.rarity);
        });
        
        grid.appendChild(petCard);
    });
}

// 选择精灵函数
function selectCompanion(id, name, image, rarity = 'common') {
    const companionSystem = window.companionSystem;
    
    const selectedPet = {
        id: id,
        name: name,
        image: image,
        rarity: rarity,
        type: 'normal'
    };
    
    companionSystem.setCompanion(selectedPet);
    
    // 更新UI
    const currentImg = document.getElementById('currentCompanionImg');
    const currentName = document.getElementById('currentCompanionName');
    const currentStatus = document.getElementById('currentCompanionStatus');
    
    if (currentImg) currentImg.src = image;
    if (currentName) currentName.textContent = name;
    if (currentStatus) {
        currentStatus.textContent = '✓ 正在陪伴你';
        currentStatus.className = 'text-success';
    }
    
    // 更新卡片状态
    document.querySelectorAll('.pet-select-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.querySelectorAll('.select-btn').forEach(btn => {
        btn.innerHTML = '<i class="fas fa-heart"></i> 设为陪伴';
        btn.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`.pet-select-card[data-id="${id}"]`);
    if (selectedCard) {
        const selectedBtn = selectedCard.querySelector('.select-btn');
        selectedCard.classList.add('selected');
        selectedBtn.innerHTML = '<i class="fas fa-check"></i> 当前陪伴';
        selectedBtn.classList.add('selected');
    }
    
    // 显示成功消息
    showCompanionMessage(`✅ 已选择 ${name} 作为陪伴精灵！`);
    
    // 触发精灵选择事件
    const event = new CustomEvent('companionSelected', {
        detail: {
            id: id,
            name: name,
            image: image,
            rarity: rarity
        }
    });
    document.dispatchEvent(event);
    
    // 如果陪伴精灵在页面中，让它说句话
    if (companionSystem.companionElement) {
        setTimeout(() => {
            companionSystem.showSpeech(`选择了${name}！好棒的选择！🎊`, 3000);
        }, 500);
    }
}

// 更新陪伴显示
function updateCompanionDisplay() {
    const companionSystem = window.companionSystem;
    if (companionSystem.settings.showCompanion) {
        if (!companionSystem.companionElement) {
            companionSystem.createCompanionElement();
        }
    } else {
        companionSystem.removeCompanionElement();
    }
}

// 加载设置
function loadSettings() {
    const companionSystem = window.companionSystem;
    
    const showToggle = document.getElementById('showCompanionToggle');
    const followToggle = document.getElementById('followMouseToggle');
    const speechToggle = document.getElementById('showSpeechToggle');
    const rotateToggle = document.getElementById('autoRotateToggle');
    
    if (showToggle) showToggle.checked = companionSystem.settings.showCompanion;
    if (followToggle) followToggle.checked = companionSystem.settings.followMouse;
    if (speechToggle) speechToggle.checked = companionSystem.settings.showSpeech;
    if (rotateToggle) rotateToggle.checked = companionSystem.settings.autoRotate;
}

// 显示消息
function showCompanionMessage(text) {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #2E7D32);
        color: white;
        padding: 15px 25px;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.opacity = '0';
        message.style.transform = 'translateY(-20px)';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// 辅助函数
function getRarityText(rarity) {
    const map = { 'common': '普通', 'rare': '稀有', 'epic': '史诗', 'legendary': '传说' };
    return map[rarity] || rarity;
}

function getRarityColor(rarity) {
    const map = {
        'common': '#607D8B',
        'rare': '#2196F3',
        'epic': '#9C27B0', 
        'legendary': '#FF4500'
    };
    return map[rarity] || '#607D8B';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes gentleBob {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-10px) scale(1.05); }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    /* 精灵基础动画 */
    #petCompanion {
        animation: gentleBob 3s ease-in-out infinite;
    }
    
    /* 选择页面的精灵样式 */
    body.selection-page #petCompanion,
    .companion-selection ~ #petCompanion {
        /* 选择页面的精灵稍微小一点 */
        transform: scale(0.9) !important;
    }
    
    /* 响应式调整 */
    @media (max-width: 768px) {
        #petCompanion {
            width: 80px !important;
            height: 80px !important;
        }
        
        /* 移动端固定在右下角 */
        #petCompanion {
            right: 20px !important;
            bottom: 20px !important;
            top: auto !important;
            left: auto !important;
            transform: scale(0.8) !important;
        }
        
        /* 选择页面移动端调整 */
        .companion-selection ~ #petCompanion {
            right: 10px !important;
            bottom: 10px !important;
            transform: scale(0.7) !important;
        }
    }
    
    /* 右侧气泡箭头 */
    #petSpeechBubble:before {
        content: '';
        position: absolute;
        right: -8px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-left: 10px solid #3498db;
        border-top: 8px solid transparent;
        border-bottom: 8px solid transparent;
    }
    
    #petSpeechBubble:after {
        content: '';
        position: absolute;
        right: -5px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-left: 8px solid #f0f7ff;
        border-top: 6px solid transparent;
        border-bottom: 6px transparent;
    }
    
    /* 选择页面的精灵卡片悬停效果 */
    .pet-select-card:hover {
        transform: translateY(-10px);
        background: rgba(255, 255, 255, 0.15);
        border-color: #3498db;
    }
    
    .pet-select-card.selected {
        border-color: #FFD700;
        background: rgba(255, 215, 0, 0.1);
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
    }
    
    .select-btn.selected {
        background: linear-gradient(135deg, #FF9800, #F57C00);
    }
    
    .text-success {
        color: #4CAF50 !important;
        font-weight: bold;
    }
`;
document.head.appendChild(style);

// 懒加载系统
class LazyLoader {
    constructor() {
        this.observer = null;
        this.initObserver();
    }
    
    initObserver() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        this.observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px', // 提前50px加载
                threshold: 0.01
            });
        }
    }
    
    loadImage(imgElement) {
        const src = imgElement.dataset.src;
        if (!src) return;
        
        // 先显示一个占位符
        imgElement.style.background = '#f0f0f0';
        
        const img = new Image();
        img.onload = () => {
            imgElement.src = src;
            imgElement.style.opacity = '1';
        };
        img.src = src;
    }
    
    addImage(imgElement) {
        if (this.observer) {
            this.observer.observe(imgElement);
        } else {
            // 不支持Observer，直接加载
            this.loadImage(imgElement);
        }
    }
}

// 使用示例
const lazyLoader = new LazyLoader();
document.querySelectorAll('img[data-src]').forEach(img => {
    lazyLoader.addImage(img);
});