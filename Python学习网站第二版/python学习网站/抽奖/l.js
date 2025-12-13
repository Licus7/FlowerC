// lottery.js - 宝可梦GIF精灵抽奖系统
(function() {
    'use strict';
    
    console.log('🎰 宝可梦GIF抽奖系统开始加载...');
    
    // ===== 宝可梦数据（全部使用有GIF的精灵）=====
    const allPets = [
        // 🔥 普通精灵 (65%)
        { 
            id: 25, 
            name: '皮卡丘', 
            rarity: 'common', 
            type: 'electric', 
            typeName: '电',
            description: '⚡ 可爱的电老鼠，脸颊的电囊能储存电力，生气时会放电！尾巴是闪电形状。'
        },
        { 
            id: 4, 
            name: '小火龙', 
            rarity: 'common', 
            type: 'fire', 
            typeName: '火',
            description: '🔥 尾巴的火焰代表生命，心情好时火焰会摇晃，心情差时火焰会变小。'
        },
        { 
            id: 7, 
            name: '杰尼龟', 
            rarity: 'common', 
            type: 'water', 
            typeName: '水',
            description: '💧 壳能保护柔软身体，遇到危险会缩进去。能喷出强力水枪！'
        },
        { 
            id: 1, 
            name: '妙蛙种子', 
            rarity: 'common', 
            type: 'grass', 
            typeName: '草/毒',
            description: '🌱 背上的种子会随着成长变大，最终开出巨大花朵，白天会晒太阳。'
        },
        { 
            id: 133, 
            name: '伊布', 
            rarity: 'common', 
            type: 'normal', 
            typeName: '一般',
            description: '✨ 基因不稳定的精灵，根据环境能进化成8种不同形态，非常稀有！'
        },
        { 
            id: 39, 
            name: '胖丁', 
            rarity: 'common', 
            type: 'normal', 
            typeName: '一般',
            description: '🎵 拥有天使般嗓音，唱起歌来能让所有生物睡着，生气时会膨胀。'
        },
        { 
            id: 52, 
            name: '喵喵', 
            rarity: 'common', 
            type: 'normal', 
            typeName: '一般',
            description: '🐱 额头有金币图案，喜爱闪亮东西，晚上眼睛会发光，爪子能伸缩。'
        },
        { 
            id: 129, 
            name: '鲤鱼王', 
            rarity: 'common', 
            type: 'water', 
            typeName: '水',
            description: '🐟 只会跳来跳去，被认为是无用的精灵，但进化后会变得非常强大！'
        },
        { 
            id: 10, 
            name: '绿毛虫', 
            rarity: 'common', 
            type: 'bug', 
            typeName: '虫',
            description: '🐛 头上的触角会释放臭气赶走敌人，一周后就会进化成铁甲蛹。'
        },
        { 
            id: 16, 
            name: '波波', 
            rarity: 'common', 
            type: 'flying', 
            typeName: '一般/飞行',
            description: '🕊️ 方向感极佳，能准确飞回巢穴，会用沙浴清洁羽毛。'
        },
        
        // ⭐ 稀有精灵 (25%)
        { 
            id: 26, 
            name: '雷丘', 
            rarity: 'rare', 
            type: 'electric', 
            typeName: '电',
            description: '⚡✨ 皮卡丘的进化型，尾巴更长电力更强！脸颊的电囊储存更多电力。'
        },
        { 
            id: 5, 
            name: '火恐龙', 
            rarity: 'rare', 
            type: 'fire', 
            typeName: '火',
            description: '🔥🐲 小火龙的进化型，性格粗暴好斗，尾巴火焰温度高达1200度！'
        },
        { 
            id: 8, 
            name: '卡咪龟', 
            rarity: 'rare', 
            type: 'water', 
            typeName: '水',
            description: '💧🐢 杰尼龟的进化型，壳变得更硬，长出了毛茸茸的尾巴和耳朵。'
        },
        { 
            id: 2, 
            name: '妙蛙草', 
            rarity: 'rare', 
            type: 'grass', 
            typeName: '草/毒',
            description: '🌿🌸 妙蛙种子的进化型，背上的花苞开始变大，散发出甜美的香气。'
        },
        { 
            id: 134, 
            name: '水伊布', 
            rarity: 'rare', 
            type: 'water', 
            typeName: '水',
            description: '💎💧 伊布接触水之石进化，细胞结构和水分子相似，能融入水中。'
        },
        { 
            id: 136, 
            name: '火伊布', 
            rarity: 'rare', 
            type: 'fire', 
            typeName: '火',
            description: '🔥🦊 伊布接触火之石进化，体温高达900度，毛发能储存火焰。'
        },
        { 
            id: 135, 
            name: '雷伊布', 
            rarity: 'rare', 
            type: 'electric', 
            typeName: '电',
            description: '⚡🦡 伊布接触雷之石进化，受到惊吓时全身毛发会竖起放电。'
        },
        { 
            id: 55, 
            name: '哥达鸭', 
            rarity: 'rare', 
            type: 'water', 
            typeName: '水',
            description: '🧠💧 额头红宝石隐藏强大超能力，头痛时能发出强力念力攻击。'
        },
        
        // 💫 史诗精灵 (8%)
        { 
            id: 130, 
            name: '暴鲤龙', 
            rarity: 'epic', 
            type: 'water', 
            typeName: '水/飞行',
            description: '🐉🌪️ 鲤鱼王进化而来，性格凶暴，能引发龙卷风，非常强大！'
        },
        { 
            id: 59, 
            name: '风速狗', 
            rarity: 'epic', 
            type: 'fire', 
            typeName: '火',
            description: '🔥🐕 传说中的精灵，一天能跑10000公里，拥有美丽飘逸的鬃毛。'
        },
        { 
            id: 131, 
            name: '拉普拉斯', 
            rarity: 'epic', 
            type: 'ice', 
            typeName: '水/冰',
            description: '🎵🐋 会唱优美歌曲的精灵，智慧很高，会帮助遇难的人类。'
        },
        { 
            id: 143, 
            name: '卡比兽', 
            rarity: 'epic', 
            type: 'normal', 
            typeName: '一般',
            description: '🍎😴 一天要吃400公斤食物，吃完就睡，肚子弹性极好。'
        },
        { 
            id: 149, 
            name: '快龙', 
            rarity: 'epic', 
            type: 'dragon', 
            typeName: '龙/飞行',
            description: '🐲💨 心地善良的龙系精灵，16小时就能绕地球飞行一周。'
        },
        
        // 🏆 传说精灵 (2%)
        { 
            id: 144, 
            name: '急冻鸟', 
            rarity: 'legendary', 
            type: 'ice', 
            typeName: '冰/飞行',
            description: '❄️🦅 传说中的冰鸟，翅膀能冻结空气，在雪山中沉睡千年。'
        },
        { 
            id: 145, 
            name: '闪电鸟', 
            rarity: 'legendary', 
            type: 'electric', 
            typeName: '电/飞行',
            description: '⚡🦅 传说的雷鸟，翅膀拍打时会产生雷电，在雷暴中现身。'
        },
        { 
            id: 146, 
            name: '火焰鸟', 
            rarity: 'legendary', 
            type: 'fire', 
            typeName: '火/飞行',
            description: '🔥🦅 传说的火鸟，羽毛燃烧不灭，死后能从灰烬中重生。'
        },
        { 
            id: 150, 
            name: '超梦', 
            rarity: 'legendary', 
            type: 'psychic', 
            typeName: '超能力',
            description: '🧬💭 基因工程创造的精灵，拥有最强超能力，在孤独中诞生。'
        }
    ];

    // ===== 系统常量 =====
    const LOTTERY_COST = 20;
    const LOCAL_BASE_PATH = 'pokemon_gifs/';
    
    // ===== 图片获取系统 =====
    function getPokemonImage(id, useGif = true) {
        // 使用本地图片
        if (useGif) {
            return `${LOCAL_BASE_PATH}${id}.gif`;
        }
        return `${LOCAL_BASE_PATH}${id}.png`;
    }
    
    // 获取英文名用于备用地址
    function getPokemonSlug(id) {
        const slugMap = {
            25: 'pikachu', 4: 'charmander', 7: 'squirtle', 1: 'bulbasaur',
            133: 'eevee', 39: 'jigglypuff', 52: 'meowth', 129: 'magikarp',
            10: 'caterpie', 16: 'pidgey', 26: 'raichu', 5: 'charmeleon',
            8: 'wartortle', 2: 'ivysaur', 134: 'vaporeon', 136: 'flareon',
            135: 'jolteon', 55: 'golduck', 130: 'gyarados', 59: 'arcanine',
            131: 'lapras', 143: 'snorlax', 149: 'dragonite', 144: 'articuno',
            145: 'zapdos', 146: 'moltres', 150: 'mewtwo'
        };
        return slugMap[id] || 'pikachu';
    }
    
    // 智能图片错误处理
    function handleImageError(imgElement, id, attempt = 1) {
        console.log(`图片加载尝试 ${attempt}: ID ${id}`);
        
        switch(attempt) {
            case 1:
                // 第一次失败：尝试PNG
                imgElement.src = `${LOCAL_BASE_PATH}${id}.png`;
                imgElement.onerror = () => handleImageError(imgElement, id, 2);
                break;
            case 2:
                // 第二次失败：使用在线PNG
                imgElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
                imgElement.onerror = null;
                console.warn(`精灵 ${id} 的本地图片失败，使用在线图片`);
                break;
        }
    }
    
    // ===== 金币系统 =====
    function getCurrentCoins() {
        try {
            const saved = localStorage.getItem('userCoins') || '0';
            return parseInt(saved) || 0;
        } catch(e) {
            console.error('读取金币失败:', e);
            return 0;
        }
    }
    
    function updateCoinDisplay() {
        const coins = getCurrentCoins();
        const coinElement = document.getElementById('currentCoins');
        if (coinElement) {
            coinElement.textContent = coins;
            // 添加金币动画
            coinElement.classList.remove('coin-gain');
            void coinElement.offsetWidth;
            coinElement.classList.add('coin-gain');
        }
        
        // 更新抽奖按钮状态
        const drawBtn = document.getElementById('drawButton');
        if (drawBtn) {
            if (coins < LOTTERY_COST) {
                drawBtn.disabled = true;
                drawBtn.innerHTML = '<i class="fas fa-lock"></i> 金币不足<br><small>(需要20金币)</small>';
                drawBtn.style.background = 'linear-gradient(to right, #95a5a6, #7f8c8d)';
            } else {
                drawBtn.disabled = false;
                drawBtn.innerHTML = '<i class="fas fa-star"></i> 抽取精灵！<br><small>(花费20金币)</small>';
                drawBtn.style.background = 'linear-gradient(to right, #FF416C, #FF4B2B)';
            }
        }
        
        return coins;
    }
    
    function spendCoins(amount, reason) {
        const current = getCurrentCoins();
        if (current >= amount) {
            const newAmount = current - amount;
            localStorage.setItem('userCoins', newAmount.toString());
            console.log(`💰 -${amount}金币 (${reason})`);
            updateCoinDisplay();
            
            // 同步到其他金币系统
            if (window.coinSystem && typeof window.coinSystem.updateCoins === 'function') {
                window.coinSystem.updateCoins(-amount);
            }
            
            return true;
        }
        return false;
    }
    
    function addCoins(amount, reason) {
        const current = getCurrentCoins();
        const newAmount = current + amount;
        localStorage.setItem('userCoins', newAmount.toString());
        console.log(`💰 +${amount}金币 (${reason})`);
        updateCoinDisplay();
        
        if (window.coinSystem && typeof window.coinSystem.updateCoins === 'function') {
            window.coinSystem.updateCoins(amount);
        }
        
        return newAmount;
    }
    
    // ===== 抽奖逻辑 =====
    function getRandomPet() {
        const random = Math.random();
        let rarity;
        
        // 调整概率
        if (random < 0.65) rarity = 'common';      // 65%
        else if (random < 0.90) rarity = 'rare';   // 25%
        else if (random < 0.98) rarity = 'epic';   // 8%
        else rarity = 'legendary';                  // 2%
        
        const filtered = allPets.filter(p => p.rarity === rarity);
        const pet = filtered[Math.floor(Math.random() * filtered.length)];
        
        // 深拷贝
        return { ...pet };
    }
    
    // ===== 动画效果 =====
    async function playDrawAnimation() {
        const btn = document.getElementById('drawButton');
        const img = document.getElementById('currentPetImage');
        
        if (!img) return;
        
        // 禁用按钮
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 抽奖中...';
        }
        
        // 添加抖动效果
        img.classList.add('draw-shake');
        
        // 快速切换GIF动画
        const fastGifIds = [25, 4, 7, 1, 133, 26, 5, 8, 130, 144];
        let frameCount = 0;
        const totalFrames = 18; // 1.8秒动画
        
        const animationInterval = setInterval(() => {
            const randomId = fastGifIds[Math.floor(Math.random() * fastGifIds.length)];
            img.src = getPokemonImage(randomId, true);
            img.onerror = () => handleImageError(img, randomId, 1);
            
            frameCount++;
            if (frameCount >= totalFrames) {
                clearInterval(animationInterval);
                img.classList.remove('draw-shake');
                
                // 恢复默认皮卡丘GIF
                setTimeout(() => {
                    img.src = getPokemonImage(25, true);
                    img.onerror = () => handleImageError(img, 25, 1);
                }, 300);
            }
        }, 100);
        
        // 等待动画完成
        return new Promise(resolve => {
            setTimeout(() => {
                clearInterval(animationInterval);
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-star"></i> 抽取精灵！<br><small>(花费20金币)</small>';
                }
                resolve();
            }, 2000);
        });
    }
    
    // ===== 显示结果 =====
    function showResult(pet) {
        const resultContainer = document.getElementById('resultContainer');
        const newPetImage = document.getElementById('newPetImage');
        const newPetName = document.getElementById('newPetName');
        const newPetRarity = document.getElementById('newPetRarity');
        const newPetDescription = document.getElementById('newPetDescription');
        
        if (!resultContainer) return;
        
        // 设置GIF图片
        newPetImage.src = getPokemonImage(pet.id, true);
        newPetImage.onerror = () => handleImageError(newPetImage, pet.id, 1);
        
        // 更新文字信息
        newPetName.textContent = pet.name;
        newPetRarity.textContent = getRarityText(pet.rarity);
        newPetRarity.className = `new-pet-rarity ${pet.rarity}`;
        newPetDescription.innerHTML = `
            ${pet.description}
            <div class="type-badge-container">
                <span class="pet-type-badge type-${pet.type}">
                    ${pet.typeName}
                </span>
            </div>
        `;
        
        // 显示结果区域
        resultContainer.style.display = 'block';
        
        // 保存宠物
        saveNewPet(pet);
        
        // 播放稀有度特效
        playRarityEffects(pet.rarity);
    }
    
    // ===== 宠物收藏系统 =====
  function saveNewPet(pet) {
    let myPets = JSON.parse(localStorage.getItem('myPets') || '[]');
    
    // 检查是否已拥有
    const existingIndex = myPets.findIndex(p => p.id === pet.id);
    
    if (existingIndex === -1) {
        // 新宠物 - 使用兼容格式
        const newPet = {
            id: pet.id,
            name: pet.name,
            image: `pokemon_gifs/${pet.id}.gif`,  // 统一使用本地路径
            rarity: pet.rarity,
            type: pet.type,
            typeName: pet.typeName,
            description: pet.description,
            obtainedDate: new Date().toLocaleDateString('zh-CN'),
            obtainedTime: new Date().toLocaleTimeString('zh-CN', {hour: '2-digit', minute:'2-digit'}),
            isNew: true,
            // 添加companion.js需要的字段
            obtainedDate: new Date().toISOString().split('T')[0],
            // 确保字段名一致
        };
        
        myPets.push(newPet);
        localStorage.setItem('myPets', JSON.stringify(myPets));
        
        console.log('保存新精灵:', newPet);
        console.log('当前总精灵数:', myPets.length);
        
        // 显示获得通知
        showPetObtainedNotification(pet);
        
        // 重新加载收藏
        setTimeout(() => loadMyPets(), 500);
        
    } else {
        // 重复获得，奖励金币
        const bonusCoins = {
            'common': 15,
            'rare': 25,
            'epic': 40,
            'legendary': 75
        };
        
        const bonus = bonusCoins[pet.rarity] || 15;
        addCoins(bonus, `重复获得${pet.name}`);
        
        showNotification(
            `✨ ${pet.name} 已拥有，转化为${bonus}金币！`, 
            'info'
        );
    }
}
    
    function loadMyPets() {
        const myPets = JSON.parse(localStorage.getItem('myPets') || '[]');
        const grid = document.getElementById('myPetsGrid');
        
        if (!grid) return;
        
        // 按稀有度和获得时间排序
        const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
        myPets.sort((a, b) => {
            if (rarityOrder[a.rarity] !== rarityOrder[b.rarity]) {
                return rarityOrder[a.rarity] - rarityOrder[b.rarity];
            }
            // 按获得时间倒序
            const dateA = new Date(`${a.obtainedDate} ${a.obtainedTime}`);
            const dateB = new Date(`${b.obtainedDate} ${b.obtainedTime}`);
            return dateB - dateA;
        });
        
        // 清空并重新填充
        grid.innerHTML = '';
        
        if (myPets.length === 0) {
            grid.innerHTML = `
                <div class="empty-collection">
                    <i class="fas fa-box-open fa-3x"></i>
                    <p>精灵收藏馆空荡荡的<br>快去抽奖收集吧！</p>
                </div>
            `;
            return;
        }
        
        // 更新标题显示数量
        const header = document.querySelector('.collection-section h3');
        if (header) {
            header.innerHTML = `<i class="fas fa-heart"></i> 我的精灵收藏 <span class="collection-count">(${myPets.length}/${allPets.length})</span>`;
        }
        
        // 添加宠物卡片
        myPets.forEach((pet, index) => {
            const petItem = document.createElement('div');
            petItem.className = `pet-item ${pet.rarity} ${pet.isNew ? 'new-pet' : ''}`;
            petItem.dataset.id = pet.id;
            
            petItem.innerHTML = `
                <div class="pet-card">
                    <img src="${pet.image}" alt="${pet.name}" 
                         onerror="this.onerror=null; this.src='${getPokemonImage(pet.id, false)}'">
                    ${pet.isNew ? '<div class="new-badge">NEW!</div>' : ''}
                    <div class="pet-card-content">
                        <h5>${pet.name}</h5>
                        <div class="pet-meta">
                            <span class="pet-type type-${pet.type}">${pet.typeName}</span>
                            <span class="pet-rarity" style="background: ${getRarityColor(pet.rarity)}">
                                ${getRarityText(pet.rarity)}
                            </span>
                        </div>
                        <div class="pet-date">
                            <i class="far fa-calendar"></i> ${pet.obtainedDate}
                        </div>
                    </div>
                </div>
            `;
            
            grid.appendChild(petItem);
            
            // 如果是新宠物，3秒后清除new标记
            if (pet.isNew) {
                setTimeout(() => {
                    pet.isNew = false;
                    const updatedPets = JSON.parse(localStorage.getItem('myPets') || '[]');
                    if (updatedPets[index]) {
                        updatedPets[index].isNew = false;
                        localStorage.setItem('myPets', JSON.stringify(updatedPets));
                    }
                }, 3000);
            }
        });
    }
    
    // ===== 特效系统 =====
    function showPetObtainedNotification(pet) {
        const rarityIcons = {
            'common': '🌟',
            'rare': '✨',
            'epic': '💫',
            'legendary': '🔥'
        };
        
        const rarityMessages = {
            'common': '获得了新精灵！',
            'rare': '获得了稀有精灵！',
            'epic': '获得了史诗精灵！',
            'legendary': '获得了传说精灵！！！'
        };
        
        const icon = rarityIcons[pet.rarity] || '🎉';
        const message = rarityMessages[pet.rarity] || '获得了新精灵！';
        
        showNotification(
            `${icon} ${pet.name} - ${message}`, 
            'success'
        );
    }
    
    function playRarityEffects(rarity) {
        if (rarity === 'legendary' || rarity === 'epic') {
            createFireworks();
        }
    }
    
    function createFireworks() {
        const container = document.querySelector('.lottery-main');
        if (!container) return;
        
        const fireworks = document.createElement('div');
        fireworks.className = 'fireworks';
        
        // 创建多个烟花粒子
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle';
            
            // 随机位置和动画
            const startX = 50 + (Math.random() - 0.5) * 40;
            const startY = 50 + (Math.random() - 0.5) * 40;
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            
            particle.style.left = `${startX}%`;
            particle.style.top = `${startY}%`;
            particle.style.background = getRandomFireworkColor();
            particle.style.setProperty('--distance', `${distance}px`);
            particle.style.setProperty('--angle', `${angle}rad`);
            particle.style.animationDelay = `${Math.random() * 0.5}s`;
            
            fireworks.appendChild(particle);
        }
        
        container.appendChild(fireworks);
        
        // 2秒后移除
        setTimeout(() => {
            if (fireworks.parentNode) {
                fireworks.style.opacity = '0';
                fireworks.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    fireworks.parentNode.removeChild(fireworks);
                }, 500);
            }
        }, 2000);
    }
    
    function getRandomFireworkColor() {
        const colors = [
            '#FF416C', '#FF4B2B', '#FFD700', '#4A90E2',
            '#9C27B0', '#00BCD4', '#4CAF50', '#FF9800'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // ===== 辅助函数 =====
    function getRarityText(rarity) {
        const rarityMap = {
            'common': '普通',
            'rare': '稀有', 
            'epic': '史诗',
            'legendary': '传说'
        };
        return rarityMap[rarity] || rarity;
    }
    
    function getRarityColor(rarity) {
        const colorMap = {
            'common': 'linear-gradient(135deg, #607D8B, #455A64)',
            'rare': 'linear-gradient(135deg, #2196F3, #0D47A1)',
            'epic': 'linear-gradient(135deg, #9C27B0, #4A148C)', 
            'legendary': 'linear-gradient(135deg, #FF4500, #FF6B35)'
        };
        return colorMap[rarity] || '#607D8B';
    }
    
    function showNotification(message, type = 'info') {
        // 移除现有通知
        const existing = document.querySelector('.lottery-notification');
        if (existing) existing.remove();
        
        // 创建新通知
        const notification = document.createElement('div');
        notification.className = `lottery-notification alert-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'info' ? 'info-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 3秒后消失
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }
    
    // ===== 公开函数 =====
    window.drawLottery = async function() {
        try {
            const currentCoins = getCurrentCoins();
            
            if (currentCoins < LOTTERY_COST) {
                showNotification('❌ 金币不足！需要20金币才能抽奖', 'danger');
                return;
            }
            
            // 播放抽奖动画
            await playDrawAnimation();
            
            // 获取随机宠物
            const randomPet = getRandomPet();
            
            // 扣除金币
            if (spendCoins(LOTTERY_COST, '精灵抽奖')) {
                // 显示结果
                setTimeout(() => {
                    showResult(randomPet);
                }, 500);
            }
            
        } catch(error) {
            console.error('抽奖错误:', error);
            showNotification('抽奖失败，请刷新页面重试', 'danger');
        }
    };
    
    window.closeResult = function() {
        const resultContainer = document.getElementById('resultContainer');
        if (resultContainer) {
            resultContainer.style.display = 'none';
        }
    };
    
    // ===== 初始化 =====
    function initializeLotterySystem() {
        console.log('🎰 初始化GIF精灵抽奖系统...');
        
        // 更新金币显示
        updateCoinDisplay();
        
        // 加载宠物收藏
        loadMyPets();
        
        // 设置默认GIF
        const defaultImage = document.getElementById('currentPetImage');
        if (defaultImage) {
            defaultImage.src = getPokemonImage(25, true);
            defaultImage.onerror = () => handleImageError(defaultImage, 25, 1);
        }
        
        // 预加载常用GIF
        preloadEssentialGifs();
        
        console.log('✅ GIF精灵抽奖系统初始化完成');
    }
    
    function preloadEssentialGifs() {
        const essentialIds = [25, 4, 7, 1, 133];
        essentialIds.forEach(id => {
            const img = new Image();
            img.src = getPokemonImage(id, true);
        });
    }
    
// ===== 预加载系统 =====
function preloadAllImages() {
    console.log('🔄 预加载所有精灵图片...');
    
    const allIds = [25, 4, 7, 1, 133, 39, 52, 129, 10, 16, 26, 5, 8, 2, 134, 136, 135, 55, 130, 59, 131, 143, 149, 144, 145, 146, 150];
    
    allIds.forEach(id => {
        // 预加载GIF
        const gifImg = new Image();
        gifImg.src = `pokemon_gifs/${id}.gif`;
        
        // 预加载PNG作为备用
        const pngImg = new Image();
        pngImg.src = `pokemon_gifs/${id}.png`;
    });
    
    console.log('✅ 预加载完成');
}


    // 页面加载后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeLotterySystem);
    } else {
        setTimeout(initializeLotterySystem, 100);
    }
    
    console.log('🎰 宝可梦GIF抽奖系统脚本加载完成');
})();

// ===== 预加载系统 =====
function preloadAllImages() {
    console.log('🔄 预加载所有精灵图片...');
    
    // 所有精灵的ID
    const allIds = [25, 4, 7, 1, 133, 39, 52, 129, 10, 16, 26, 5, 8, 2, 134, 136, 135, 55, 130, 59, 131, 143, 149, 144, 145, 146, 150];
    
    allIds.forEach(id => {
        // 预加载GIF
        const gifImg = new Image();
        gifImg.src = `pokemon_gifs/${id}.gif`;
        
        // 预加载PNG作为备用
        const pngImg = new Image();
        pngImg.src = `pokemon_gifs/${id}.png`;
    });
    
    console.log('✅ 预加载完成');
}

// 立即开始预加载
if (typeof window !== 'undefined') {
    window.addEventListener('load', function() {
        // 延迟预加载，避免阻塞页面
        setTimeout(preloadAllImages, 1000);
    });
    
    // 暴露预加载函数给其他页面使用
    window.preloadPokemonImages = preloadAllImages;
}

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