// companion.js - 精灵陪伴系统（修复版，固定在右侧中间）
class CompanionSystem {
    constructor() {
        this.currentCompanion = null;
        this.settings = this.loadSettings();
        this.speechMessages = this.initSpeechMessages();
        this.companionElement = null;
        this.speechBubble = null;
        this.lastSpeechTime = 0;
        this.speechTimeout = null;
        console.log('🎮 精灵陪伴系统初始化...');
    }
    
    loadSettings() {
        const defaultSettings = {
            showCompanion: true,
            followMouse: false,  // 默认不跟随鼠标
            showSpeech: true,
            autoRotate: false,
            lastRotationDate: null,
            companionPosition: { x: 90, y: 50 },  // 默认右侧中间
            size: 'medium',
            opacity: 0.9,
            enableEffects: true
        };
        
        const saved = localStorage.getItem('companionSettings');
        const loaded = saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        
        // 如果位置不在右侧区域，调整为右侧中间
        if (loaded.companionPosition.x < 70) {
            loaded.companionPosition = { x: 90, y: 50 };
        }
        
        return loaded;
    }
    
    saveSettings() {
        localStorage.setItem('companionSettings', JSON.stringify(this.settings));
    }
    
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
                "又答对一题！太厉害了！🎉"
            ],
            morning: ["早上好！新的一天开始啦！🌞", "早餐吃了吗？要补充能量哦！🍳"],
            afternoon: ["下午茶时间到！☕", "保持专注！💪"],
            evening: ["晚上学习效率高！🌙", "注意休息眼睛哦~ 👀"]
        };
    }
    
    getCurrentCompanion() {
        const saved = localStorage.getItem('currentCompanion');
        if (saved) {
            this.currentCompanion = JSON.parse(saved);
            return this.currentCompanion;
        }
        
        const defaultCompanion = {
            id: 25,
            name: '皮卡丘',
            image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif',
            rarity: 'common',
            type: 'electric',
            selectedDate: new Date().toISOString()
        };
        
        this.setCompanion(defaultCompanion);
        return defaultCompanion;
    }
    
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
        
        if (this.companionElement) {
            this.updateCompanionDisplay();
        }
        
        return this.currentCompanion;
    }
    
    getAvailablePets() {
        try {
            const myPets = JSON.parse(localStorage.getItem('myPets') || '[]');
            const currentId = this.currentCompanion?.id;
            
            return myPets.map(pet => ({
                id: pet.id,
                name: pet.name,
                image: pet.image || this.getPokemonImage(pet.id),
                rarity: pet.rarity || 'common',
                type: pet.type || 'normal',
                isCurrent: pet.id === currentId
            }));
        } catch (error) {
            console.error('获取精灵失败:', error);
            return [];
        }
    }
    
    getPokemonImage(id, useGif = true) {
        if (useGif) {
            return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
        }
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    }
    
    createCompanionElement() {
        if (!this.settings.showCompanion || !this.currentCompanion) return null;
        
        this.removeCompanionElement();
        
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
        
        // 设置初始位置（右侧中间）
        this.setInitialPosition();
        
        const img = document.createElement('img');
        img.src = this.currentCompanion.image;
        img.alt = this.currentCompanion.name;
        img.style.cssText = 'width: 100%; height: 100%; object-fit: contain; pointer-events: none;';
        img.onerror = () => {
            img.src = this.getPokemonImage(this.currentCompanion.id, false);
        };
        
        this.companionElement.appendChild(img);
        this.addRarityEffects();
        document.body.appendChild(this.companionElement);
        
        if (this.settings.showSpeech) {
            this.createSpeechBubble();
        }
        
        // 根据设置决定是否跟随鼠标
        if (this.settings.followMouse && window.innerWidth > 768) {
            this.setupMouseFollowing();
        }
        
        // 添加点击事件
        this.companionElement.addEventListener('click', () => {
            this.showRandomSpeech();
        });
        
        // 添加悬停效果
        this.companionElement.addEventListener('mouseenter', () => {
            this.companionElement.style.transform = 'scale(1.1)';
            this.companionElement.style.filter = 'drop-shadow(0 8px 20px rgba(0,0,0,0.4)) brightness(1.1)';
        });
        
        this.companionElement.addEventListener('mouseleave', () => {
            this.companionElement.style.transform = 'scale(1)';
            this.companionElement.style.filter = `drop-shadow(0 5px 15px rgba(0,0,0,0.3))`;
        });
        
        // 添加窗口调整大小监听
        window.addEventListener('resize', () => this.handleResize());
        
        // 显示欢迎语
        setTimeout(() => {
            this.showRandomSpeech('encouragement');
        }, 1000);
        
        return this.companionElement;
    }
    
    setInitialPosition() {
        if (!this.companionElement) return;
        
        const { x, y } = this.settings.companionPosition;
        this.updatePositionStyle(x, y);
    }
    
    updatePositionStyle(xPercent, yPercent) {
        if (!this.companionElement) return;
        
        const size = this.getCompanionSize();
        const x = (window.innerWidth * xPercent / 100) - size / 2;
        const y = (window.innerHeight * yPercent / 100) - size / 2;
        
        this.companionElement.style.left = `${x}px`;
        this.companionElement.style.top = `${y}px`;
    }
    
    setCompanionPosition(xPercent, yPercent) {
        if (!this.companionElement) return;
        
        // 限制位置范围
        const limitedX = Math.max(70, Math.min(95, xPercent));
        const limitedY = Math.max(20, Math.min(80, yPercent));
        
        this.updatePositionStyle(limitedX, limitedY);
        
        this.settings.companionPosition = { x: limitedX, y: limitedY };
        this.saveSettings();
    }
    
    handleResize() {
        if (!this.companionElement) return;
        
        const { x, y } = this.settings.companionPosition;
        this.updatePositionStyle(x, y);
    }
    
    getCompanionSize() {
        const sizes = { 'small': 80, 'medium': 120, 'large': 160 };
        const size = sizes[this.settings.size] || 120;
        
        // 移动端适配
        if (window.innerWidth <= 768) {
            return Math.min(size, 100);
        }
        
        return size;
    }
    
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
        
        // 更新稀有度类
        this.companionElement.className = `pet-companion ${this.currentCompanion.rarity}`;
        
        // 更新尺寸
        const size = this.getCompanionSize();
        this.companionElement.style.width = `${size}px`;
        this.companionElement.style.height = `${size}px`;
        
        // 重新设置位置
        this.setInitialPosition();
        
        // 更新特效
        this.addRarityEffects();
    }
    
    addRarityEffects() {
        if (!this.companionElement || !this.settings.enableEffects) return;
        
        // 移除旧特效
        const oldEffects = this.companionElement.querySelectorAll('.companion-effect');
        oldEffects.forEach(effect => effect.remove());
        
        const rarity = this.currentCompanion?.rarity;
        
        if (rarity === 'legendary') {
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
        }
    }
    
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
    
    showRandomSpeech(category = null) {
        if (!this.speechBubble || !this.settings.showSpeech) return;
        
        const now = Date.now();
        if (now - this.lastSpeechTime < 3000) return;
        this.lastSpeechTime = now;
        
        if (!category) {
            const hour = new Date().getHours();
            if (hour < 12) category = 'morning';
            else if (hour < 18) category = 'afternoon';
            else category = 'evening';
        }
        
        let messages = this.speechMessages[category] || this.speechMessages.encouragement;
        const message = messages[Math.floor(Math.random() * messages.length)];
        this.showSpeech(message);
    }
    
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
            if (bubbleX < 10) bubbleX = companionRect.right + 10;
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
    
    hideSpeech() {
        if (!this.speechBubble) return;
        this.speechBubble.style.opacity = '0';
        this.speechBubble.style.transform = 'translateY(10px)';
        setTimeout(() => {
            this.speechBubble.style.display = 'none';
        }, 300);
    }
    
    setupMouseFollowing() {
        if (!this.settings.followMouse || window.innerWidth <= 768) return;
        
        let mouseX = 0, mouseY = 0;
        let targetX = this.settings.companionPosition.x;
        let targetY = this.settings.companionPosition.y;
        
        const updatePosition = () => {
            if (!this.companionElement) return;
            
            // 平滑跟随
            const currentX = this.settings.companionPosition.x;
            const currentY = this.settings.companionPosition.y;
            
            const newX = currentX + (targetX - currentX) * 0.1;
            const newY = currentY + (targetY - currentY) * 0.1;
            
            this.setCompanionPosition(newX, newY);
            
            requestAnimationFrame(updatePosition);
        };
        
        document.addEventListener('mousemove', (e) => {
            // 计算相对于窗口的百分比
            targetX = (e.clientX / window.innerWidth) * 100;
            targetY = (e.clientY / window.innerHeight) * 100;
            
            // 限制在右侧区域
            targetX = Math.max(70, Math.min(95, targetX));
            targetY = Math.max(20, Math.min(80, targetY));
        });
        
        updatePosition();
    }
    
    removeCompanionElement() {
        // 移除窗口监听器
        window.removeEventListener('resize', () => this.handleResize());
        
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
    
    toggleCompanion(show) {
        this.settings.showCompanion = show !== undefined ? show : !this.settings.showCompanion;
        this.saveSettings();
        
        if (this.settings.showCompanion) {
            this.createCompanionElement();
        } else {
            this.removeCompanionElement();
        }
    }
    
    // 新增：切换鼠标跟随
    toggleFollowMouse(enable) {
        this.settings.followMouse = enable !== undefined ? enable : !this.settings.followMouse;
        this.saveSettings();
        
        if (this.settings.followMouse) {
            this.setupMouseFollowing();
        }
    }
}

// 全局导出
window.companionSystem = new CompanionSystem();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 如果是选择页面
    if (window.location.pathname.includes('选择精灵') || document.title.includes('选择陪伴精灵')) {
        initializeSelectionPage();
    } else {
        // 其他页面：延迟显示精灵
        setTimeout(() => {
            const companion = window.companionSystem.getCurrentCompanion();
            if (companion && window.companionSystem.settings.showCompanion) {
                window.companionSystem.createCompanionElement();
            }
        }, 500);
    }
});

// 页面切换时重新创建精灵
window.addEventListener('pageshow', function(event) {
    if (!window.location.pathname.includes('选择精灵')) {
        setTimeout(() => {
            const companion = window.companionSystem.getCurrentCompanion();
            if (companion && window.companionSystem.settings.showCompanion) {
                if (!document.getElementById('petCompanion')) {
                    window.companionSystem.createCompanionElement();
                }
            }
        }, 300);
    }
});

// 选择页面的函数（保持不变）
function initializeSelectionPage() {
    const companionSystem = window.companionSystem;
    const currentCompanion = companionSystem.getCurrentCompanion();
    
    const currentImg = document.getElementById('currentCompanionImg');
    const currentName = document.getElementById('currentCompanionName');
    
    if (currentImg) currentImg.src = currentCompanion.image;
    if (currentName) currentName.textContent = currentCompanion.name;
    
    loadAvailablePets();
    loadSettings();
    
    // 事件监听器
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
                <p>你还没有获得任何精灵<br>先去抽奖吧！</p>
                <a href="抽奖.html" style="
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
                     onerror="this.src='${companionSystem.getPokemonImage(pet.id, false)}'">
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
        
        grid.appendChild(petCard);
    });
}

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
    
    const currentImg = document.getElementById('currentCompanionImg');
    const currentName = document.getElementById('currentCompanionName');
    
    if (currentImg) currentImg.src = image;
    if (currentName) currentName.textContent = name;
    
    // 更新选择状态
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
    
    showCompanionMessage(`✅ 已选择 ${name} 作为陪伴精灵！`);
}

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

// 添加全局样式
const style = document.createElement('style');
style.textContent = `
    @keyframes haloSpin {
        0% { transform: rotate(0deg) scale(1); }
        100% { transform: rotate(360deg) scale(1); }
    }
    
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .pet-companion {
        animation: gentleBob 3s ease-in-out infinite;
    }
    
    @keyframes gentleBob {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-10px) scale(1.05); }
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
        border-bottom: 6px solid transparent;
    }
    
    /* 移动端适配 */
    @media (max-width: 768px) {
        #petCompanion {
            width: 80px !important;
            height: 80px !important;
        }
        
        #petSpeechBubble {
            font-size: 12px;
            padding: 10px 15px;
            max-width: 160px;
        }
    }
`;
document.head.appendChild(style);