// 用户数据管理类
class UserProfileManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    // 初始化
    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.updateUI();
    }

    // 加载用户数据
    loadUserData() {
        const savedUser = localStorage.getItem('learningSpaceUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }

    // 保存用户数据
    saveUserData() {
        if (this.currentUser) {
            localStorage.setItem('learningSpaceUser', JSON.stringify(this.currentUser));
        }
    }

    // 注册新用户
    async registerUser(userData) {
        try {
            // 模拟API调用延迟
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 创建用户对象
            this.currentUser = {
                id: Date.now().toString(),
                name: userData.name,
                email: userData.email,
                avatarStyle: userData.avatarStyle || 'default',
                avatarColor: userData.avatarColor || '#4a6bff',
                title: userData.title || '普通学员',
                joinedDate: new Date().toISOString(),
                stats: {
                    completedCourses: 0,
                    studyHours: 0,
                    currentLevel: 1,
                    progress: 0
                },
                courses: [],
                achievements: []
            };

            // 自动保存到localStorage
            this.saveUserData();
            
            // 生成初始数据
            this.generateInitialData();
            
            return { success: true, user: this.currentUser };
        } catch (error) {
            console.error('注册失败:', error);
            return { success: false, error: '注册失败，请重试' };
        }
    }

    // 登录用户
    async loginUser(email, password) {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // 从localStorage验证用户
            const savedUser = localStorage.getItem('learningSpaceUser');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                if (user.email === email) {
                    this.currentUser = user;
                    return { success: true, user: this.currentUser };
                }
            }
            
            return { success: false, error: '邮箱或密码错误' };
        } catch (error) {
            return { success: false, error: '登录失败，请重试' };
        }
    }

    // 登出
    logout() {
        this.currentUser = null;
        localStorage.removeItem('learningSpaceUser');
    }

    // 更新用户资料
    updateProfile(updates) {
        if (this.currentUser) {
            this.currentUser = { ...this.currentUser, ...updates };
            this.saveUserData();
            return true;
        }
        return false;
    }

    // 生成初始数据
    generateInitialData() {
        if (!this.currentUser) return;

        // 生成初始课程
        this.currentUser.courses = [
            { id: 1, name: 'JavaScript基础', progress: 30, lastAccessed: new Date().toISOString() },
            { id: 2, name: 'React入门教程', progress: 15, lastAccessed: new Date().toISOString() },
            { id: 3, name: 'Node.js实战', progress: 5, lastAccessed: new Date().toISOString() }
        ];

        // 生成初始成就
        this.currentUser.achievements = [
            { id: 1, name: '第一课', description: '完成第一个学习任务', icon: 'fas fa-star', date: new Date().toISOString() },
            { id: 2, name: '连续学习', description: '连续学习3天', icon: 'fas fa-fire', date: new Date().toISOString() }
        ];

        // 更新统计数据
        this.currentUser.stats = {
            completedCourses: Math.floor(Math.random() * 5),
            studyHours: Math.floor(Math.random() * 50),
            currentLevel: Math.floor(Math.random() * 5) + 1,
            progress: Math.floor(Math.random() * 100)
        };

        this.saveUserData();
    }

    // 更新UI
    updateUI() {
        if (this.currentUser) {
            this.showDashboard();
            this.updateProfileDisplay();
        } else {
            this.showAuth();
        }
    }

    // 显示认证界面
    showAuth() {
        document.getElementById('authSection').style.display = 'block';
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('displayName').textContent = '未登录';
        document.getElementById('smallAvatar').innerHTML = '<i class="fas fa-user"></i>';
    }

    // 显示仪表板
    showDashboard() {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        
        // 更新欢迎信息
        document.getElementById('welcomeName').textContent = this.currentUser.name;
        document.getElementById('displayName').textContent = this.currentUser.name;
        
        // 更新头像
        this.updateAvatar();
        
        // 更新统计数据
        document.getElementById('completedCourses').textContent = this.currentUser.stats.completedCourses;
        document.getElementById('studyHours').textContent = this.currentUser.stats.studyHours;
        document.getElementById('currentLevel').textContent = this.currentUser.stats.currentLevel;
        document.getElementById('progressPercent').textContent = `${this.currentUser.stats.progress}%`;
        document.getElementById('progressFill').style.width = `${this.currentUser.stats.progress}%`;
        
        // 更新课程列表
        this.updateCourseList();
        
        // 更新成就列表
        this.updateAchievements();
        
        // 更新图表
        this.updateChart();
    }

    // 更新头像显示
    updateAvatar() {
        const avatarColor = this.currentUser.avatarColor;
        const avatarStyle = this.currentUser.avatarStyle;
        
        // 更新大头像
        const largeAvatar = document.getElementById('largeAvatar');
        largeAvatar.style.background = this.getAvatarStyle(avatarStyle, avatarColor);
        largeAvatar.innerHTML = this.getAvatarContent(avatarStyle, this.currentUser.name);
        
        // 更新导航栏小头像
        const smallAvatar = document.getElementById('smallAvatar');
        smallAvatar.style.background = this.getAvatarStyle(avatarStyle, avatarColor);
        smallAvatar.innerHTML = this.getAvatarContent(avatarStyle, this.currentUser.name, true);
    }

    // 获取头像样式
    getAvatarStyle(style, color) {
        switch(style) {
            case 'colorful':
                return `linear-gradient(135deg, ${color} 0%, ${this.adjustColor(color, 20)} 100%)`;
            case 'gradient':
                return `linear-gradient(135deg, ${color} 0%, ${this.adjustColor(color, -20)} 100%)`;
            default:
                return `linear-gradient(135deg, ${color} 0%, ${this.adjustColor(color, 30)} 100%)`;
        }
    }

    // 调整颜色亮度
    adjustColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return `#${(0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1)}`;
    }

    // 获取头像内容
    getAvatarContent(style, name, small = false) {
        const firstLetter = name ? name.charAt(0).toUpperCase() : 'U';
        
        switch(style) {
            case 'colorful':
                return small ? firstLetter : `<span style="font-size: ${small ? '1.2rem' : '3rem'}">${firstLetter}</span>`;
            case 'gradient':
                return small ? firstLetter : `<span style="font-size: ${small ? '1.2rem' : '3rem'}">${firstLetter}</span>`;
            default:
                return small ? '<i class="fas fa-user"></i>' : '<i class="fas fa-user"></i>';
        }
    }

    // 更新个人资料显示
    updateProfileDisplay() {
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userTitle').textContent = this.currentUser.title;
    }

    // 更新课程列表
    updateCourseList() {
        const courseList = document.getElementById('courseList');
        courseList.innerHTML = '';
        
        this.currentUser.courses.forEach(course => {
            const li = document.createElement('li');
            li.className = 'course-item';
            li.innerHTML = `
                <div class="course-info">
                    <h4>${course.name}</h4>
                    <div class="course-progress">
                        <div class="progress-bar small">
                            <div class="progress-fill" style="width: ${course.progress}%"></div>
                        </div>
                        <span>${course.progress}%</span>
                    </div>
                </div>
                <button class="continue-btn">继续学习</button>
            `;
            courseList.appendChild(li);
        });
    }

    // 更新成就列表
    updateAchievements() {
        const achievements = document.getElementById('achievements');
        achievements.innerHTML = '';
        
        this.currentUser.achievements.forEach(achievement => {
            const div = document.createElement('div');
            div.className = 'achievement-item';
            div.innerHTML = `
                <i class="${achievement.icon}"></i>
                <div>
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                </div>
            `;
            achievements.appendChild(div);
        });
    }

    // 更新图表
    updateChart() {
        const ctx = document.getElementById('studyChart').getContext('2d');
        
        if (window.studyChart) {
            window.studyChart.destroy();
        }
        
        window.studyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                datasets: [{
                    label: '学习时长(小时)',
                    data: [2, 3, 1.5, 4, 2.5, 3.5, 2],
                    borderColor: '#4a6bff',
                    backgroundColor: 'rgba(74, 107, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // 设置事件监听器
    setupEventListeners() {
        // 注册表单提交
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('nameInput').value;
            const email = document.getElementById('emailInput').value;
            const password = document.getElementById('passwordInput').value;
            const avatarStyle = document.querySelector('.avatar-option.selected')?.dataset.style || 'default';
            const avatarColor = document.getElementById('avatarColor').value;
            
            const result = await this.registerUser({
                name,
                email,
                password,
                avatarStyle,
                avatarColor
            });
            
            if (result.success) {
                alert('注册成功！已自动保存您的信息。');
                this.updateUI();
            } else {
                alert(result.error);
            }
        });

        // 登录表单提交
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const result = await this.loginUser(email, password);
            
            if (result.success) {
                alert('登录成功！');
                this.updateUI();
            } else {
                alert(result.error);
            }
        });

        // 切换注册/登录
        document.getElementById('toggleLogin').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('authSection').style.display = 'none';
            document.getElementById('loginSection').style.display = 'block';
        });

        document.getElementById('toggleRegister').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('authSection').style.display = 'block';
        });

        // 头像选项选择
        document.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        // 编辑资料按钮
        document.getElementById('editProfileBtn').addEventListener('click', () => {
            this.showEditModal();
        });

        // 退出登录按钮
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('确定要退出登录吗？')) {
                this.logout();
                this.updateUI();
            }
        });

        // 模态框相关
        document.getElementById('closeModal').addEventListener('click', () => {
            this.hideEditModal();
        });

        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.hideEditModal();
        });

        document.getElementById('saveProfile').addEventListener('click', () => {
            this.saveProfileChanges();
        });

        // 头像上传
        document.getElementById('avatarUpload').addEventListener('change', (e) => {
            this.handleAvatarUpload(e.target.files[0]);
        });

        // 点击头像上传按钮
        document.querySelector('.avatar-upload-btn').addEventListener('click', () => {
            document.getElementById('avatarUpload').click();
        });
    }

    // 显示编辑模态框
    showEditModal() {
        if (!this.currentUser) return;
        
        document.getElementById('editName').value = this.currentUser.name;
        document.getElementById('editAvatarColor').value = this.currentUser.avatarColor;
        document.getElementById('editTitle').value = this.currentUser.title;
        
        // 设置选中的头像样式
        document.querySelectorAll('.modal .avatar-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.style === this.currentUser.avatarStyle) {
                option.classList.add('selected');
            }
        });
        
        document.getElementById('editProfileModal').style.display = 'flex';
    }

    // 隐藏编辑模态框
    hideEditModal() {
        document.getElementById('editProfileModal').style.display = 'none';
    }

    // 保存资料更改
    saveProfileChanges() {
        const updates = {
            name: document.getElementById('editName').value,
            avatarColor: document.getElementById('editAvatarColor').value,
            avatarStyle: document.querySelector('.modal .avatar-option.selected')?.dataset.style || 'default',
            title: document.getElementById('editTitle').value
        };
        
        if (this.updateProfile(updates)) {
            this.updateUI();
            this.hideEditModal();
            alert('资料更新成功！');
        }
    }

    // 处理头像上传
    async handleAvatarUpload(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert('图片大小不能超过5MB');
            return;
        }
        
        try {
            // 实际项目中这里应该上传到服务器
            // 这里我们模拟上传并生成base64
            const reader = new FileReader();
            reader.onload = (e) => {
                // 更新用户头像为上传的图片
                this.currentUser.avatarStyle = 'custom';
                this.currentUser.avatarImage = e.target.result;
                this.saveUserData();
                this.updateAvatar();
                alert('头像上传成功！');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            alert('头像上传失败，请重试');
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化用户管理器
    window.userManager = new UserProfileManager();
    
    // 为头像选项添加默认选中
    document.querySelector('.avatar-option[data-style="default"]').classList.add('selected');
    
    // 模拟今天的任务数量
    document.getElementById('todayTasks').textContent = Math.floor(Math.random() * 5) + 1;
});