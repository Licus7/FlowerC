// 方案三：表情符号幽灵光标
function initGhostCursor() {
    // 移除旧光标
    const oldCursor = document.getElementById('ghost-cursor');
    if (oldCursor) oldCursor.remove();
    
    // 创建表情符号光标
    const cursor = document.createElement('div');
    cursor.id = 'ghost-cursor';
    cursor.innerHTML = '👻'; // 幽灵表情
    document.body.appendChild(cursor);
    
    console.log('👻 表情符号幽灵光标已创建');
    
    // 鼠标移动
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    // 交互元素悬停效果
    const interactiveElements = ['button', 'a', 'input', 'textarea', '.btn', '.chapter-link'];
    
    interactiveElements.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
            });
            element.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
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
    
    // 鼠标离开页面时半透明
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0.7';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', initGhostCursor);