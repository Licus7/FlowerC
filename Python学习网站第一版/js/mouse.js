// 自定义光标功能
function initCustomCursor() {
    // 移除可能存在的旧光标
    const oldCursor = document.getElementById('custom-cursor');
    if (oldCursor) {
        oldCursor.remove();
    }
    
    // 创建光标元素
    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    document.body.appendChild(cursor);
    
    console.log('✅ 自定义旋转方块光标已创建');
    
    // 鼠标移动时更新光标位置
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    // 强制所有元素使用 none 光标
    function forceNoCursor() {
        const allElements = document.querySelectorAll('*');
        allElements.forEach(element => {
            if (element.style) {
                element.style.cursor = 'none';
            }
        });
    }
    
    // 初始强制设置
    forceNoCursor();
    
    // 监听新添加的元素
    const observer = new MutationObserver(() => {
        forceNoCursor();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // 在可交互元素上改变光标样式
    const interactiveSelectors = [
        'button', 'a', 'input', 'textarea', 'select', 
        '.btn', '.chapter-link', '.btn-retro', 'img[onclick]',
        '[onclick]', '[href]', 'label'
    ];
    
    const pointerSelectors = ['a', '.btn', '.chapter-link', '.btn-retro', '[href]'];
    
    // 为现有元素添加事件监听
    interactiveSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            // 强制设置光标样式
            if (element.style) {
                element.style.cursor = 'none';
            }
            
            element.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
                if (pointerSelectors.includes(selector) || element.matches(pointerSelectors.join(','))) {
                    cursor.classList.add('pointer');
                }
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
                cursor.classList.remove('pointer');
            });
        });
    });
    
    // 点击效果
    document.addEventListener('mousedown', () => {
        cursor.classList.add('click');
    });
    
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('click');
    });
    
    // 鼠标离开窗口时隐藏光标
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0.5';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
}

// 页面加载后初始化光标
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomCursor);
} else {
    initCustomCursor();
}

// 确保所有动态加载的元素也应用样式
setInterval(() => {
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
        if (element.style && element.style.cursor !== 'none') {
            element.style.cursor = 'none';
        }
    });
}, 1000);