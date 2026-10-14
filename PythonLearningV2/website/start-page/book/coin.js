// coin.js - 简化的coin系统
(function() {
    'use strict';
    
    console.log('💰 coin.js 开始加载...');
    
    // 1. 获取初始coin（从head中的脚本获取）
    let currentCoins = window._initialCoins || 0;
    console.log(`📊 当前coin: ${currentCoins}`);
    
    // 2. 确保显示正确的函数
    function ensureCorrectDisplay() {
        const coinElement = document.getElementById('simpleCoinCount');
        if (coinElement) {
            // 从localStorage重新读取，确保最新
            try {
                const saved = localStorage.getItem('userCoins');
                if (saved !== null) {
                    const num = parseInt(saved);
                    if (!isNaN(num)) {
                        currentCoins = num;
                        coinElement.textContent = currentCoins;
                    }
                }
            } catch (e) {
                console.warn('重新读取coin失败:', e);
            }
            
            // 如果显示还是0，强制设置
            if (coinElement.textContent === '0' && currentCoins > 0) {
                console.log('🔄 发现显示为0但实际有coin，正在修复...');
                coinElement.textContent = currentCoins;
            }
        }
    }
    
    // 3. 立即执行
    ensureCorrectDisplay();
    
    // 4. 延迟多次检查
    setTimeout(ensureCorrectDisplay, 100);
    setTimeout(ensureCorrectDisplay, 500);
    setTimeout(ensureCorrectDisplay, 1000);
    
    // 5. DOM加载后检查
    document.addEventListener('DOMContentLoaded', ensureCorrectDisplay);
    
    // 6. 页面加载后检查
    window.addEventListener('load', ensureCorrectDisplay);
    
    // 7. 添加coin的函数
    window.addCoins = function(amount, reason) {
        if (amount > 0) {
            // 确保从localStorage读取最新值
            try {
                const saved = localStorage.getItem('userCoins');
                if (saved !== null) {
                    const num = parseInt(saved);
                    if (!isNaN(num)) currentCoins = num;
                }
            } catch (e) {
                console.warn('添加前读取coin失败:', e);
            }
            
            currentCoins += amount;
            localStorage.setItem('userCoins', currentCoins.toString());
            
            console.log(`💰 +${amount}coin ${reason ? '(' + reason + ')' : ''}, 总计: ${currentCoins}`);
            
            // 更新显示
            const coinElement = document.getElementById('simpleCoinCount');
            if (coinElement) {
                coinElement.textContent = currentCoins;
                
                // 动画
                coinElement.classList.remove('coin-gain');
                void coinElement.offsetWidth;
                coinElement.classList.add('coin-gain');
            }
            
            return currentCoins;
        }
        return currentCoins;
    };
    
    // 8. 创建 window.coinSystem 消除报错
    window.coinSystem = {
        addCoins: window.addCoins,
        getCoins: function() { return currentCoins; }
    };
    
    console.log('✅ coin.js 加载完成');
    console.log('window.coinSystem:', window.coinSystem ? '✅ 找到' : '❌ 未找到');
})();