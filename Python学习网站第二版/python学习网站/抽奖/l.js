// lottery.js - 精灵抽奖系统

(function() {
    'use strict';
    
    console.log('🎰 lottery.js开始加载...');
    
    // ===== PET DATA =====
    const allPets = [
        // Common pets (60%)
        { 
            name: '小火龙', 
            imageSeed: 'fire-dragon',
            rarity: 'common',
            description: '可爱的小火龙，能吐出微弱的火焰'
        },
        { 
            name: '水跃鱼',
            imageSeed: 'water-fish', 
            rarity: 'common',
            description: '活泼的水属性精灵，喜欢玩水'
        },
        { 
            name: '草苗龟',
            imageSeed: 'grass-turtle',
            rarity: 'common',
            description: '温顺的草属性精灵，头上长着嫩芽'
        },
        { 
            name: '电击小子',
            imageSeed: 'electric-boy',
            rarity: 'common',
            description: '全身带电的小精灵，非常活泼'
        },
        { 
            name: '小石怪',
            imageSeed: 'rock-monster',
            rarity: 'common',
            description: '由岩石构成的小精灵，非常坚固'
        },
        // Rare pets (25%)
        { 
            name: '烈焰狮',
            imageSeed: 'fire-lion',
            rarity: 'rare',
            description: '威武的火属性狮子，能喷射高温火焰'
        },
        { 
            name: '寒冰凤凰',
            imageSeed: 'ice-phoenix',
            rarity: 'rare',
            description: '优雅的冰属性凤凰，能召唤冰雪'
        },
        { 
            name: '雷光马',
            imageSeed: 'thunder-horse',
            rarity: 'rare',
            description: '速度极快的电属性马，奔跑时带闪电'
        },
        { 
            name: '岩甲龙',
            imageSeed: 'rock-dragon',
            rarity: 'rare',
            description: '防御力极强的龙系精灵'
        },
        // Epic pets (10%)
        { 
            name: '圣光麒麟',
            imageSeed: 'light-unicorn',
            rarity: 'epic',
            description: '传说中的光属性神兽，能带来好运'
        },
        { 
            name: '暗影魔狼',
            imageSeed: 'shadow-wolf',
            rarity: 'epic',
            description: '来自阴影世界的强大生物'
        },
        // Legendary pets (5%)
        { 
            name: '时空巨龙',
            imageSeed: 'time-dragon',
            rarity: 'legendary',
            description: '掌控时间和空间的远古神龙'
        },
        { 
            name: '元素凤凰',
            imageSeed: 'element-phoenix',
            rarity: 'legendary',
            description: '同时掌握所有元素的传说生物'
        }
    ];
    
    // ===== LOTTERY SYSTEM =====
    const LOTTERY_COST = 20; // 每次抽奖消耗20金币
    
    // 获取当前金币数
    function getCurrentCoins() {
        try {
            const saved = localStorage.getItem('userCoins') || '0';
            return parseInt(saved);
        } catch(e) {
            console.warn('读取金币失败:', e);
            return 0;
        }
    }
    
    // 更新金币显示
    function updateCoinDisplay() {
        const coins = getCurrentCoins();
        const coinElement = document.getElementById('currentCoins');
        if (coinElement) {
            coinElement.textContent = coins;
        }
        // 检查是否足够抽奖
        const drawBtn = document.getElementById('drawButton');
        if (coins < LOTTERY_COST && drawBtn) {
            drawBtn.disabled = true;
            drawBtn.innerHTML = '<i class="fas fa-star"></i> 金币不足<br><small>(需要20金币)</small>';
            drawBtn.style.background = 'linear-gradient(to right, #ccc, #999)';
        } else if (drawBtn) {
            drawBtn.disabled = false;
            drawBtn.innerHTML = '<i class="fas fa-star"></i> 抽取精灵！<br><small>(花费20金币)</small>';
            drawBtn.style.background = 'linear-gradient(to right, #4A90E2, #1565C0)';
        }
        return coins;
    }
    
    // 根据概率获取随机宠物
    function getRandomPet() {
        const random = Math.random();
        let selectedPets;
        
        if (random < 0.60) { // 60% 概率普通
            selectedPets = allPets.filter(p => p.rarity === 'common');
        } else if (random < 0.85) { // 25% 概率稀有
            selectedPets = allPets.filter(p => p.rarity === 'rare');
        } else if (random < 0.95) { // 10% 概率史诗
            selectedPets = allPets.filter(p => p.rarity === 'epic');
        } else { // 5% 概率传说
            selectedPets = allPets.filter(p => p.rarity === 'legendary');
        }
        
        return selectedPets[Math.floor(Math.random() * selectedPets.length)];
    }
    
    // 抽奖动画
    function animateDraw() {
        const btn = document.getElementById('drawButton');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 抽取中...';
        
        const imageContainer = document.getElementById('currentPetImage');
        imageContainer.classList.add('draw-shake');
        
        return new Promise(resolve => {
            setTimeout(() => {
                imageContainer.classList.remove('draw-shake');
                resolve();
            }, 1000);
        });
    }
    
    // 显示结果
    function showResult(pet) {
        const resultContainer = document.getElementById('resultContainer');
        const newPetImage = document.getElementById('newPetImage');
        const newPetName = document.getElementById('newPetName');
        const newPetRarity = document.getElementById('newPetRarity');
        const newPetDescription = document.getElementById('newPetDescription');
        
        // 更新显示
        newPetImage.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${pet.imageSeed}`;
        newPetName.textContent = pet.name;
        newPetRarity.textContent = getRarityText(pet.rarity);
        newPetRarity.className = `new-pet-rarity ${pet.rarity}`;
        newPetDescription.textContent = pet.description;
        
        // 显示结果区域
        resultContainer.style.display = 'block';
        
        // 保存新宠物
        saveNewPet(pet);
    }
    
    // 保存新宠物
    function saveNewPet(pet) {
        let myPets = JSON.parse(localStorage.getItem('myPets') || '[]');
        
        // 检查是否已拥有
        if (!myPets.some(p => p.name === pet.name)) {
            myPets.push({
                name: pet.name,
                image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${pet.imageSeed}`,
                rarity: pet.rarity,
                description: pet.description,
                obtainedDate: new Date().toLocaleDateString()
            });
            
            localStorage.setItem('myPets', JSON.stringify(myPets));
            loadMyPets();
            showNotification(`🎉 获得了新精灵：${pet.name}！`, 'success');
        } else {
            showNotification(`✨ ${pet.name} 已拥有，已转化为10金币！`, 'info');
            addCoins(10, '重复精灵转化');
        }
    }
    
    // 加载我的宠物
    function loadMyPets() {
        const myPets = JSON.parse(localStorage.getItem('myPets') || '[]');
        const grid = document.getElementById('myPetsGrid');
        
        if (grid) {
            grid.innerHTML = '';
            
            myPets.forEach(pet => {
                const petItem = document.createElement('div');
                petItem.className = 'pet-item';
                petItem.innerHTML = `
                    <img src="${pet.image}" alt="${pet.name}">
                    <h5>${pet.name}</h5>
                    <span class="pet-rarity-badge" style="background: ${getRarityColor(pet.rarity)}">
                        ${getRarityText(pet.rarity)}
                    </span>
                `;
                grid.appendChild(petItem);
            });
        }
    }
    
    // 消耗金币
    function spendCoins(amount, reason) {
        const current = getCurrentCoins();
        if (current >= amount) {
            localStorage.setItem('userCoins', (current - amount).toString());
            console.log(`💰 -${amount}金币 ${reason ? '(' + reason + ')' : ''}`);
            updateCoinDisplay();
            return true;
        }
        return false;
    }
    
    // 显示通知
    function showNotification(message, type = 'info') {
        // 创建一个简单的通知
        const notification = document.createElement('div');
        notification.className = 'alert alert-' + (type === 'success' ? 'success' : 'info');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 250px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // 辅助函数
    function getRarityText(rarity) {
        const rarityMap = {
            'common': '普通',
            'rare': '稀有', 
            'epic': '史诗',
            'legendary': '传说'
        };
        return rarityMap[rarity] || '未知';
    }
    
    function getRarityColor(rarity) {
        const colorMap = {
            'common': '#607D8B',
            'rare': '#2196F3',
            'epic': '#9C27B0', 
            'legendary': '#FF9800'
        };
        return colorMap[rarity] || '#607D8B';
    }
    
    // 关闭结果
    function closeResult() {
        document.getElementById('resultContainer').style.display = 'none';
    }
    
    // 导出全局函数
    window.drawLottery = async function() {
        try {
            const currentCoins = getCurrentCoins();
            
            if (currentCoins < LOTTERY_COST) {
                showNotification('❌ 金币不足！需要' + LOTTERY_COST + '金币', 'danger');
                return;
            }
            
            await animateDraw();
            const randomPet = getRandomPet();
            
            if (spendCoins(LOTTERY_COST, '抽奖')) {
                showResult(randomPet);
            }
            
        } catch(error) {
            console.error('抽奖错误:', error);
            showNotification('抽奖失败，请重试', 'danger');
        }
    };
    
    // 初始化
    document.addEventListener('DOMContentLoaded', function() {
        updateCoinDisplay();
        loadMyPets();
    });
    
    console.log('🎰 lottery.js加载完成');
})();