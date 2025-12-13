// companion.js - 精灵陪伴系统
class CompanionSystem {
    constructor() {
        this.currentCompanion = null;
        this.settings = this.loadSettings();
        this.speechMessages = this.initSpeechMessages();
        this.companionElement = null;
        this.speechBubble = null;
        this.lastSpeechTime = 0;
        
        console.log('🎮 精灵陪伴系统初始化...');
    }
    
    // 加载设置
    loadSettings() {
        const defaultSettings = {
            showCompanion: true,
            followMouse: true,
            showSpeech: true,
            autoRotate: false,
            lastRotationDate: null,
            companionPosition: { x: 50, y: 80 }, // 默认位置
            size: 'medium', // small, medium, large
            opacity: 0.9,
            enableEffects: true
        };
        
        const saved = localStorage.getItem('companionSettings');
        return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
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
        this.companionElement.style.cssText = `
            position: fixed;
            width: ${this.getCompanionSize()}px;
            height: ${this.getCompanionSize()}px;
            z-index: 9998;
            pointer-events: none;
            transition: all 0.3s ease;
            opacity: ${this.settings.opacity};
            filter: drop-shadow(0 5px 15px rgba(0,0,0,0.3));
            user-select: none;
            cursor: pointer;
        `;
        
        // 设置初始位置
        this.setCompanionPosition(this.settings.companionPosition.x, this.settings.companionPosition.y);
        
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
        
        // 添加鼠标跟随
        if (this.settings.followMouse && window.innerWidth > 768) {
            this.setupMouseFollowing();
        }
        
        // 添加点击事件
        this.companionElement.addEventListener('click', () => {
            this.showRandomSpeech();
        });
        
        // 自动显示欢迎语
        setTimeout(() => {
            this.showRandomSpeech('encouragement');
        }, 1000);
        
        return this.companionElement;
    }
    
    // 获取精灵图片 - 修改为本地路径
    getPokemonImage(id, useGif = true) {
        // 使用本地图片
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
        return sizes[this.settings.size] || 120;
    }
    
    // 设置精灵位置
    setCompanionPosition(xPercent, yPercent) {
        if (!this.companionElement) return;
        
        const x = (xPercent / 100) * window.innerWidth;
        const y = (yPercent / 100) * window.innerHeight;
        
        this.companionElement.style.left = `${x - this.getCompanionSize()/2}px`;
        this.companionElement.style.top = `${y - this.getCompanionSize()/2}px`;
        
        // 保存位置
        this.settings.companionPosition = { x: xPercent, y: yPercent };
        this.saveSettings();
    }
    
    // 更新精灵显示
    updateCompanionDisplay() {
        if (!this.companionElement || !this.currentCompanion) return;
        
        const img = this.companionElement.querySelector('img');
        if (img) {
            img.src = this.currentCompanion.image;
        }
        
        // 更新类名
        this.companionElement.className = `pet-companion ${this.currentCompanion.rarity}`;
        
        // 更新特效
        this.addRarityEffects();
    }
    
    // 添加稀有度特效
    addRarityEffects() {
        if (!this.companionElement || !this.settings.enableEffects) return;
        
        // 移除旧的特效
        const oldEffects = this.companionElement.querySelectorAll('.companion-effect');
        oldEffects.forEach(effect => effect.remove());
        
        const rarity = this.currentCompanion?.rarity;
        
        if (rarity === 'legendary') {
            // 传说精灵：金色光环
            const halo = document.createElement('div');
            halo.className = 'companion-effect legendary-halo';
            halo.style.cssText = `
                position: absolute;
                top: -10px;
                left: -10px;
                right: -10px;
                bottom: -10px;
                border: 3px solid gold;
                border-radius: 50%;
                animation: haloSpin 3s linear infinite;
                pointer-events: none;
            `;
            this.companionElement.appendChild(halo);
            
            // 添加星星特效
            for (let i = 0; i < 3; i++) {
                const star = document.createElement('div');
                star.className = 'companion-effect legendary-star';
                star.style.cssText = `
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background: gold;
                    border-radius: 50%;
                    filter: drop-shadow(0 0 5px gold);
                    animation: starFloat 2s ease-in-out infinite ${i * 0.3}s;
                    pointer-events: none;
                `;
                this.companionElement.appendChild(star);
            }
        }
        else if (rarity === 'epic') {
            // 史诗精灵：紫色脉冲
            const pulse = document.createElement('div');
            pulse.className = 'companion-effect epic-pulse';
            pulse.style.cssText = `
                position: absolute;
                top: -5px;
                left: -5px;
                right: -5px;
                bottom: -5px;
                border: 2px solid #9C27B0;
                border-radius: 50%;
                animation: pulseEffect 2s ease-in-out infinite;
                pointer-events: none;
            `;
            this.companionElement.appendChild(pulse);
        }
    }
    
    // 创建对话气泡
    createSpeechBubble() {
        this.speechBubble = document.createElement('div');
        this.speechBubble.id = 'petSpeechBubble';
        this.speechBubble.style.cssText = `
            position: fixed;
            background: rgba(255, 255, 255, 0.95);
            color: #333;
            padding: 12px 18px;
            border-radius: 20px;
            border-bottom-left-radius: 5px;
            font-size: 14px;
            font-weight: bold;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            pointer-events: none;
            opacity: 0;
            transform: translateY(10px);
            transition: all 0.3s ease;
            max-width: 200px;
            text-align: center;
            border: 2px solid #3498db;
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
        
        // 根据当前页面添加特定对话
        const path = window.location.pathname;
        if (path.includes('practice')) {
            messages = messages.concat(this.speechMessages.practice);
        } else if (path.includes('boss')) {
            messages = messages.concat(this.speechMessages.boss);
        } else if (path.includes('lottery')) {
            messages = messages.concat(this.speechMessages.lottery);
        }
        
        // 随机选择一条消息
        const message = messages[Math.floor(Math.random() * messages.length)];
        this.showSpeech(message);
    }
    
    // 显示指定对话
    showSpeech(text, duration = 3000) {
        if (!this.speechBubble || !this.companionElement) return;
        
        this.speechBubble.textContent = text;
        
        // 计算位置（在精灵上方）
        const companionRect = this.companionElement.getBoundingClientRect();
        const bubbleX = companionRect.left + companionRect.width / 2;
        const bubbleY = companionRect.top - 20;
        
        this.speechBubble.style.left = `${bubbleX - this.speechBubble.offsetWidth / 2}px`;
        this.speechBubble.style.top = `${bubbleY - this.speechBubble.offsetHeight}px`;
        this.speechBubble.style.opacity = '1';
        this.speechBubble.style.transform = 'translateY(0)';
        
        // 自动隐藏
        clearTimeout(this.speechTimeout);
        this.speechTimeout = setTimeout(() => {
            this.hideSpeech();
        }, duration);
    }
    
    // 隐藏对话气泡
    hideSpeech() {
        if (!this.speechBubble) return;
        
        this.speechBubble.style.opacity = '0';
        this.speechBubble.style.transform = 'translateY(10px)';
    }
    
    // 设置鼠标跟随
    setupMouseFollowing() {
        if (!this.settings.followMouse || window.innerWidth <= 768) return;
        
        let mouseX = 0, mouseY = 0;
        let companionX = window.innerWidth * 0.8, companionY = window.innerHeight * 0.8;
        
        // 更新精灵位置（平滑跟随）
        const updatePosition = () => {
            if (!this.companionElement) return;
            
            // 平滑移动到鼠标位置
            companionX += (mouseX - companionX) * 0.1;
            companionY += (mouseY - companionY) * 0.1;
            
            const xPercent = (companionX / window.innerWidth) * 100;
            const yPercent = (companionY / window.innerHeight) * 100;
            
            this.setCompanionPosition(xPercent, yPercent);
            requestAnimationFrame(updatePosition);
        };
        
        // 监听鼠标移动
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        // 开始动画
        updatePosition();
    }
    
    // 移除陪伴精灵
    removeCompanionElement() {
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
}

// 全局实例
window.companionSystem = new CompanionSystem();

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
    // 如果是选择页面，初始化选择界面
    if (window.location.pathname.includes('选择精灵') || document.title.includes('选择陪伴精灵')) {
        initializeSelectionPage();
    } else {
        // 其他页面：显示陪伴精灵
        setTimeout(() => {
            const companion = window.companionSystem.getCurrentCompanion();
            if (companion && window.companionSystem.settings.showCompanion) {
                window.companionSystem.createCompanionElement();
            }
        }, 500);
    }
});

// 选择页面初始化
function initializeSelectionPage() {
    const companionSystem = window.companionSystem;
    const currentCompanion = companionSystem.getCurrentCompanion();
    
    // 更新当前精灵显示
    document.getElementById('currentCompanionImg').src = currentCompanion.image;
    document.getElementById('currentCompanionName').textContent = currentCompanion.name;
    
    // 加载可选的精灵
    loadAvailablePets();
    
    // 加载设置
    loadSettings();
    
    // 绑定设置切换事件
    document.getElementById('showCompanionToggle').addEventListener('change', function() {
        companionSystem.settings.showCompanion = this.checked;
        companionSystem.saveSettings();
        updateCompanionDisplay();
    });
    
    document.getElementById('followMouseToggle').addEventListener('change', function() {
        companionSystem.settings.followMouse = this.checked;
        companionSystem.saveSettings();
    });
    
    document.getElementById('showSpeechToggle').addEventListener('change', function() {
        companionSystem.settings.showSpeech = this.checked;
        companionSystem.saveSettings();
    });
    
    document.getElementById('autoRotateToggle').addEventListener('change', function() {
        companionSystem.settings.autoRotate = this.checked;
        companionSystem.saveSettings();
    });
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
                <i class="fas fa-box-open"></i>
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
                    onclick="selectCompanion(${pet.id}, '${pet.name.replace(/'/g, "\\'")}', '${pet.image.replace(/'/g, "\\'")}', '${pet.rarity}')">
                ${pet.isCurrent ? '<i class="fas fa-check"></i> 当前陪伴' : '<i class="fas fa-heart"></i> 设为陪伴'}
            </button>
        `;
        
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
    document.getElementById('currentCompanionImg').src = image;
    document.getElementById('currentCompanionName').textContent = name;
    
    // 更新卡片状态
    document.querySelectorAll('.pet-select-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.querySelectorAll('.select-btn').forEach(btn => {
        btn.innerHTML = '<i class="fas fa-heart"></i> 设为陪伴';
        btn.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`.pet-select-card[data-id="${id}"]`);
    const selectedBtn = selectedCard.querySelector('.select-btn');
    
    if (selectedCard && selectedBtn) {
        selectedCard.classList.add('selected');
        selectedBtn.innerHTML = '<i class="fas fa-check"></i> 当前陪伴';
        selectedBtn.classList.add('selected');
    }
    
    // 显示成功消息
    showCompanionMessage(`✅ 已选择 ${name} 作为陪伴精灵！`);
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
    
    document.getElementById('showCompanionToggle').checked = companionSystem.settings.showCompanion;
    document.getElementById('followMouseToggle').checked = companionSystem.settings.followMouse;
    document.getElementById('showSpeechToggle').checked = companionSystem.settings.showSpeech;
    document.getElementById('autoRotateToggle').checked = companionSystem.settings.autoRotate;
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

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes haloSpin {
        0% { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(180deg) scale(1.05); }
        100% { transform: rotate(360deg) scale(1); }
    }
    
    @keyframes starFloat {
        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
        50% { transform: translate(20px, -20px) scale(1.2); opacity: 1; }
    }
    
    @keyframes pulseEffect {
        0%, 100% { transform: scale(1); opacity: 0.5; }
        50% { transform: scale(1.1); opacity: 0.8; }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .pet-companion {
        animation: gentleBob 3s ease-in-out infinite;
    }
    
    @keyframes gentleBob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
    }
    
    .pet-companion.legendary {
        filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
    }
    
    .pet-companion.epic {
        filter: drop-shadow(0 0 8px rgba(156, 39, 176, 0.5));
    }
    
    .pet-companion.rare {
        filter: drop-shadow(0 0 5px rgba(33, 150, 243, 0.5));
    }
`;
document.head.appendChild(style);