class UserSystem {
    constructor() {
        this.db = null;
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
           
            await this.cleanOldDatabase();
            
           
            await this.openDatabase();
            
          
            const user = await this.autoLogin();
            if (user) {
               
                setTimeout(() => {
                    window.location.href = 'menu.html';
                }, 500);
            }
            
            console.log('用户系统初始化完成');
        } catch (error) {
            console.error('初始化失败:', error);
            this.showMessage('系统初始化失败，请刷新页面', 'error');
        }
    }

    async cleanOldDatabase() {
        return new Promise((resolve) => {
            const deleteRequest = indexedDB.deleteDatabase('UserDatabase');
            deleteRequest.onsuccess = () => {
                console.log('旧数据库删除成功');
                resolve();
            };
            deleteRequest.onerror = () => {
                console.log('删除旧数据库失败，可能不存在');
                resolve();
            };
            deleteRequest.onblocked = () => {
                console.warn('数据库被其他标签页阻塞，无法删除');
                resolve();
            };
        });
    }

    openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('UserDatabase', 3); 
            
            request.onerror = () => {
                console.error('数据库打开失败:', request.error);
                reject(new Error('无法打开数据库'));
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('数据库打开成功');
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('数据库升级中，旧版本:', event.oldVersion);
                
                
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                  
                    userStore.createIndex('username', 'username', { unique: true });
                    console.log('用户表和索引创建成功');
                } else {
                 
                    const transaction = event.target.transaction;
                    const userStore = transaction.objectStore('users');
                    
                    if (!userStore.indexNames.contains('username')) {
                        userStore.createIndex('username', 'username', { unique: true });
                        console.log('username索引创建成功');
                    }
                }
            };
            
            request.onblocked = () => {
                console.warn('数据库被其他标签页阻塞');
                reject(new Error('请关闭其他打开本网站的标签页'));
            };
        });
    }

    async register(userData) {
        try {
            this.validateUserData(userData);
            
            const userExists = await this.checkUserExists(userData.username);
            if (userExists) {
                throw new Error('用户名已被注册');
            }

            const newUser = this.createNewUser(userData);
            const userId = await this.saveUserToDB(newUser);
            
            return {
                success: true, 
                userId,
                message: '注册成功！'
            };
        } catch (error) {
            console.error('注册失败:', error);
            throw error;
        }
    }

    async login(credentials) {
        try {
            if (!credentials.username || !credentials.password) {
                throw new Error('请填写用户名和密码');
            }

            const user = await this.findUserByUsername(credentials.username.trim());
            if (!user) {
                throw new Error('用户不存在');
            }

            if (!this.verifyPassword(credentials.password, user.password)) {
                throw new Error('密码错误');
            }

            await this.updateLastLogin(user.id);
            this.setCurrentUser(user);
            
   
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1000);

            return { 
                success: true, 
                user: { 
                    id: user.id, 
                    username: user.username
                },
                message: '登录成功！'
            };
        } catch (error) {
            console.error('登录失败:', error);
            throw error;
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUserId');
        this.showLoginForm();
        this.showMessage('已退出登录', 'info');
    }

    
    validateUserData({ username, password }) {
        if (!username || !password) {
            throw new Error('请填写用户名和密码');
        }
        if (username.length < 3) {
            throw new Error('用户名至少3个字符');
        }
        if (password.length < 6) {
            throw new Error('密码长度至少6位');
        }
    }

    createNewUser({ username, password }) {
        return {
            username: username.trim(),
            password: this.hashPassword(password),
            createdAt: new Date(),
            lastLogin: null
        };
    }

    async saveUserToDB(user) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const userStore = transaction.objectStore('users');
            
            const request = userStore.add(user);
            
            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = () => reject(new Error('注册失败，请重试'));
            
            transaction.onerror = () => reject(new Error('数据库事务错误'));
        });
    }

    verifyPassword(inputPassword, storedHash) {
        return this.hashPassword(inputPassword) === storedHash;
    }

    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('currentUserId', user.id);
    }

    hashPassword(password) {
       
        let hash = 5381;
        for (let i = 0; i < password.length; i++) {
            hash = (hash * 33) ^ password.charCodeAt(i);
        }
        return (hash >>> 0).toString(16); // 转换为无符号32位整数并转为16进制
    }

    
    async checkUserExists(username) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const userStore = transaction.objectStore('users');
            
           
            if (!userStore.indexNames.contains('username')) {
                reject(new Error('username索引不存在'));
                return;
            }
            
            const index = userStore.index('username');
            const request = index.get(username);

            request.onsuccess = () => resolve(!!request.result);
            request.onerror = () => reject(new Error('查询失败'));
        });
    }

    async findUserByUsername(username) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const userStore = transaction.objectStore('users');
            
        
            if (!userStore.indexNames.contains('username')) {
                reject(new Error('username索引不存在'));
                return;
            }
            
            const index = userStore.index('username');
            const request = index.get(username);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error('查询用户失败'));
        });
    }

    async getUserById(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const userStore = transaction.objectStore('users');
            const request = userStore.get(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error('获取用户失败'));
        });
    }

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

    async autoLogin() {
        const userId = localStorage.getItem('currentUserId');
        if (!userId) return null;
        
        try {
            const user = await this.getUserById(parseInt(userId));
            if (user) {
                this.currentUser = user;
                console.log('自动登录成功:', user.username);
                return user;
            }
        } catch (error) {
            console.log('自动登录失败', error);
            return null;
        }
    }

    
    showLoginForm() {
        document.querySelector('.wrapper').style.display = 'flex';
    }

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
            background: ${type === 'success' ? '#4CAF50' : 
                        type === 'error' ? '#f44336' : '#2196F3'};
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        `;

        document.body.appendChild(messageDiv);

        
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

// 页面事件监听
document.addEventListener('DOMContentLoaded', function() {
    // 登录表单提交
    document.getElementById('logInForm')?.addEventListener('submit', async function(event) {
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
            
           

        } catch (error) {
            userSystem.showMessage(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    
    document.getElementById('signInForm')?.addEventListener('submit', async function(event) {
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
            
            setTimeout(() => {
                toggleCard();
                this.reset();
            }, 1500);

        } catch (error) {
            userSystem.showMessage(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    
    document.querySelectorAll('.flip-card__input').forEach(input => {
        input.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                const form = this.closest('form');
                form?.querySelector('button')?.click();
            }
        });
    });
});


function toggleCard() {
    document.getElementById('flipCard').classList.toggle('flipped');
}