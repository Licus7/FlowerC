// 幽灵光标功能
function initGhostCursor() {
    // 移除旧光标
    const oldCursor = document.getElementById('ghost-cursor');
    if (oldCursor) oldCursor.remove();
    
    // 创建幽灵光标
    const cursor = document.createElement('img');
    cursor.id = 'ghost-cursor';
    cursor.src = '背景+音频/幽灵3.png';
    cursor.alt = '幽灵光标';
    
    // 设置图片样式确保透明背景
    cursor.style.width = '30px'; // 根据您的图片大小调整
    cursor.style.height = '30px';
    cursor.style.objectFit = 'contain';
    
    document.body.appendChild(cursor);
    
    console.log('👻 幽灵光标已加载');
    
    // 鼠标移动
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    // 交互元素悬停效果
    const interactiveElements = ['button', 'a', 'input', '.btn', '.chapter-link'];
    
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