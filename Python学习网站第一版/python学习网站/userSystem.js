// userSystem.js
class UserSystem {
    constructor() {
        this.db = null;
        this.currentUser = null;
        this.init();
    }

    // 初始化数据库
    async init() {
        try {
            await this.openDatabase();
            await this.autoLogin();
            console.log('用户系统初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
        }
    }

    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('UserDatabase', 2); 

            request.onerror = () => reject(request.error);
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('数据库打开成功');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const oldVersion = event.oldVersion;

                if (oldVersion < 1 || !db.objectStoreNames.contains('users')) {
                    // 创建用户表
                    const userStore = db.createObjectStore('users', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    userStore.createIndex('username', 'username', { unique: true });
                    console.log('用户表创建成功');
                }
            };
        });
    }

    // 用户注册 - 修复事务问题
    async register(userData) {
        const { username, password } = userData;
        
        // 前端验证
        if (!username || !password) {
            throw new Error('请填写用户名和密码');
        }

        if (username.length < 3) {
            throw new Error('用户名至少3个字符');
        }

        if (password.length < 6) {
            throw new Error('密码长度至少6位');
        }

        // 检查用户名是否已存在
        const userExists = await this.checkUserExists(username);
        if (userExists) {
            throw new Error('用户名已被注册');
        }

        // 创建新用户
        const newUser = {
            username: username.trim(),
            password: this.hashPassword(password),
            createdAt: new Date(),
            lastLogin: null
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const userStore = transaction.objectStore('users');
            
            const request = userStore.add(newUser);
            
            request.onsuccess = (event) => {
                console.log('注册成功，用户ID:', event.target.result);
                resolve({ 
                    success: true, 
                    userId: event.target.result,
                    message: '注册成功！' 
                });
            };
            
            request.onerror = (event) => {
                console.error('注册错误:', event.target.error);
                reject(new Error('注册失败，请重试'));
            };

            // 监听事务完成
            transaction.oncomplete = () => {
                console.log('注册事务完成');
            };

            transaction.onerror = (event) => {
                console.error('事务错误:', event.target.error);
                reject(new Error('数据库事务错误'));
            };
        });
    }

    // 用户登录 - 修复事务问题
    async login(credentials) {
        const { username, password } = credentials;
        
        if (!username || !password) {
            throw new Error('请填写用户名和密码');
        }

        const user = await this.findUserByUsername(username.trim());
        
        if (!user) {
            throw new Error('用户不存在');
        }

        // 验证密码
        if (user.password !== this.hashPassword(password)) {
            throw new Error('密码错误');
        }

        // 更新最后登录时间
        await this.updateLastLogin(user.id);

        // 设置当前用户
        this.currentUser = user;
        
        // 保存登录状态
        localStorage.setItem('currentUserId', user.id);

        return { 
            success: true, 
            user: { 
                id: user.id, 
                username: user.username
            },
            message: '登录成功！'
        };
    }

    // 检查用户是否存在 - 修复事务问题
    async checkUserExists(username) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const userStore = transaction.objectStore('users');
            const index = userStore.index('username');
            const request = index.get(username);

            request.onsuccess = () => {
                resolve(!!request.result); // 返回布尔值
            };
            
            request.onerror = () => {
                reject(new Error('查询失败'));
            };
        });
    }

    // 根据用户名查找用户 - 修复事务问题
    async findUserByUsername(username) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const userStore = transaction.objectStore('users');
            const index = userStore.index('username');
            const request = index.get(username);

            request.onsuccess = () => {
                resolve(request.result);
            };
            
            request.onerror = () => {
                reject(new Error('查询用户失败'));
            };
        });
    }

    // 根据ID获取用户
    async getUserById(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const userStore = transaction.objectStore('users');
            const request = userStore.get(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error('获取用户失败'));
        });
    }

    // 更新最后登录时间 - 修复事务问题
    async updateLastLogin(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const userStore = transaction.objectStore('users');
            const request = userStore.get(userId);

            request.onsuccess = () => {
                const user = request.result;
                if (user) {
                    user.lastLogin = new Date();
                    const updateRequest = userStore.put(user);
                    
                    updateRequest.onsuccess = () => resolve();
                    updateRequest.onerror = () => reject(new Error('更新用户失败'));
                } else {
                    reject(new Error('用户不存在'));
                }
            };
            
            request.onerror = () => reject(new Error('获取用户失败'));
        });
    }

    // 自动登录
    async autoLogin() {
        const userId = localStorage.getItem('currentUserId');
        
        if (userId) {
            try {
                const user = await this.getUserById(parseInt(userId));
                if (user) {
                    this.currentUser = user;
                    console.log('自动登录成功:', user.username);
                    this.showUserInfo();
                    return user;
                }
            } catch (error) {
                console.log('自动登录失败', error);
                this.logout();
            }
        }
        return null;
    }

    // 退出登录
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUserId');
        this.showLoginForm();
        console.log('用户已退出登录');
        
        this.showMessage('已退出登录', 'info');
    }

    // 密码哈希函数
    hashPassword(password) {
        // 简单哈希函数
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(); // 确保是正数
    }

    // 显示用户信息界面
    showUserInfo() {
        let userInfoDiv = document.getElementById('userInfo');
        
        if (!userInfoDiv) {
            userInfoDiv = document.createElement('div');
            userInfoDiv.id = 'userInfo';
            userInfoDiv.className = 'user-info';
            userInfoDiv.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.95);
                padding: 40px;
                border-radius: 15px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                min-width: 300px;
            `;
            
            userInfoDiv.innerHTML = `
                <div class="title" style="color: #6a3093; font-size: 28px; margin-bottom: 20px;">
                    欢迎回来！
                </div>
                <div style="font-size: 18px; margin-bottom: 30px;">
                    用户名: <span id="displayUsername" style="color: #b464c2; font-weight: bold;"></span>
                </div>
                <button id="continueBtn" class="flip-card__btn" style="margin-bottom: 15px; width: 100%;">
                    进入学习平台
                </button>
                <button id="logoutBtn" class="flip-card__btn" style="background: #666; width: 100%;">
                    退出登录
                </button>
            `;
            
            document.body.appendChild(userInfoDiv);
            
            // 添加事件监听111111111111111111111111111111111111111111111111111111111111
            //11111111111111111121212121212121212121212121212121212121212121212121212
            //112121212121231321321423142351423143254132541352415243154231432514325142143254123541325143251
            document.getElementById('continueBtn').addEventListener('click', () => {
                window.location.href = 'menu.html';
            });
            
            document.getElementById('logoutBtn').addEventListener('click', () => {
                this.logout();
            });
        }
        
        document.getElementById('displayUsername').textContent = this.currentUser.username;
        
        // 隐藏登录注册卡片
        document.querySelector('.wrapper').style.display = 'none';
    }

    // 显示登录表单
    showLoginForm() {
        document.querySelector('.wrapper').style.display = 'block';
        document.getElementById('flipCard').classList.remove('flipped');
        
        // 移除用户信息界面
        const userInfoDiv = document.getElementById('userInfo');
        if (userInfoDiv) {
            userInfoDiv.remove();
        }
        
        // 清空表单
        this.clearForms();
    }

    // 清空表单
    clearForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => form.reset());
    }

    // 显示消息
    showMessage(message, type = 'info') {
        // 移除现有消息
        const existingMsg = document.getElementById('userMessage');
        if (existingMsg) {
            existingMsg.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.id = 'userMessage';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 30px;
            border-radius: 8px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            transition: all 0.3s;
            background: ${type === 'success' ? 'linear-gradient(45deg, #4CAF50, #45a049)' : 
                        type === 'error' ? 'linear-gradient(45deg, #f44336, #d32f2f)' : 
                        'linear-gradient(45deg, #2196F3, #1976D2)'};
        `;

        document.body.appendChild(messageDiv);

        // 3秒后自动消失
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.opacity = '0';
                setTimeout(() => messageDiv.remove(), 300);
            }
        }, 3000);
    }
}

// 初始化用户系统
const userSystem = new UserSystem();

// 页面加载完成后设置事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 登录表单提交
    const loginForm = document.getElementById('logInForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const submitBtn = this.querySelector('button');
            const originalText = submitBtn.textContent;

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = '登录中...';

                const result = await userSystem.login({ username, password });
                userSystem.showMessage(result.message, 'success');
                
                setTimeout(() => {
                    userSystem.showUserInfo();
                }, 1000);

            } catch (error) {
                userSystem.showMessage(error.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // 注册表单提交
    const registerForm = document.getElementById('signInForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const username = document.getElementById('s_username').value;
            const password = document.getElementById('s_password').value;
            
            const submitBtn = this.querySelector('button');
            const originalText = submitBtn.textContent;

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = '注册中...';

                const result = await userSystem.register({ username, password });
                userSystem.showMessage(result.message, 'success');
                
                // 注册成功后切换到登录界面
                setTimeout(() => {
                    toggleCard();
                    registerForm.reset();
                }, 1500);

            } catch (error) {
                userSystem.showMessage(error.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // 输入框回车键支持
    const inputs = document.querySelectorAll('.flip-card__input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                const form = this.closest('form');
                if (form) {
                    const submitBtn = form.querySelector('button');
                    if (submitBtn) {
                        event.preventDefault();
                        submitBtn.click();
                    }
                }
            }
        });
    });
});

// 切换卡片函数
function toggleCard() {
    const flipCard = document.getElementById('flipCard');
    flipCard.classList.toggle('flipped');
    
    // 切换时清空表单
    document.getElementById('logInForm').reset();
    document.getElementById('signInForm').reset();
}