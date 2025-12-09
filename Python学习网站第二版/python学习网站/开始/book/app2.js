// app.js - Python学习教程应用 (自动初始化完整版)

let db;
let currentChapterId = null;
let currentLessonId = null;
let currentLessonIndex = 0;
let currentChapterLessons = [];
let isInitializing = false;

// 页面加载后自动初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面已加载，开始自动初始化...');
    
    // 事件监听
    document.getElementById('submit-exercise').addEventListener('click', submitExercise);
    document.getElementById('show-solution').addEventListener('click', showSolution);
    document.getElementById('copy-code-btn').addEventListener('click', copyCode);
    document.getElementById('prev-lesson').addEventListener('click', loadPreviousLesson);
    document.getElementById('next-lesson').addEventListener('click', loadNextLesson);
    
    document.querySelectorAll('.chapter-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const chapterId = parseInt(this.getAttribute('data-chapter-id'));
            loadChapter(chapterId);
        });
    });
    
    // 自动打开并初始化数据库
    openDatabase().then(() => {
        console.log('数据库初始化完成');
    }).catch(error => {
        console.error('数据库初始化失败:', error);
        showError('数据库初始化失败，请刷新页面重试');
    });
});

function openDatabase() {
    return new Promise((resolve, reject) => {
        // 显示加载状态
        document.getElementById('lesson-title').textContent = '正在初始化数据库...';
        document.getElementById('lesson-content').innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-spinner fa-spin"></i> 正在初始化教学系统，请稍候...
            </div>
        `;
        
        const deleteRequest = indexedDB.deleteDatabase('PythonCourseDB');
        
        deleteRequest.onerror = function(event) {
            console.error('删除旧数据库失败:', event.target.error);
            proceedWithOpen();
        };
        
        deleteRequest.onsuccess = function() {
            console.log('旧数据库已删除');
            proceedWithOpen();
        };
        
        function proceedWithOpen() {
            const request = indexedDB.open('PythonCourseDB', 1);
            
            request.onerror = function(event) {
                console.error('数据库打开失败:', event.target.error);
                showError('数据库打开失败: ' + event.target.error.message);
                reject(event.target.error);
            };
            
            request.onblocked = function() {
                showError('数据库被其他标签页锁定，请关闭其他使用此网站的标签页');
                reject(new Error('Database blocked by other tab'));
            };
            
            request.onsuccess = function(event) {
                db = event.target.result;
                console.log('数据库已打开');
                
                db.onerror = function(event) {
                    console.error('数据库错误:', event.target.error);
                };
                
                db.onversionchange = function() {
                    db.close();
                    showWarning('数据库版本已变更，请刷新页面');
                };
                
                // 检查数据库是否需要初始化
                checkIfDatabaseInitialized().then(() => {
                    resolve(db);
                }).catch(reject);
            };
            
            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                
                // 创建章节存储
                const chapterStore = db.createObjectStore('chapters', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                chapterStore.createIndex('order_num', 'order_num', { unique: true });
                
                // 创建课程存储
                const lessonStore = db.createObjectStore('lessons', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                lessonStore.createIndex('chapter_id', 'chapter_id');
                lessonStore.createIndex('order_num', 'order_num');
                
                // 创建代码示例存储
                const codeExampleStore = db.createObjectStore('code_examples', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                codeExampleStore.createIndex('lesson_id', 'lesson_id');
                
                // 创建练习答案存储
                const exerciseSolutionStore = db.createObjectStore('exercise_solutions', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                exerciseSolutionStore.createIndex('lesson_id', 'lesson_id');
                
                console.log('数据库结构已创建');
            };
        }
    });
}

function checkIfDatabaseInitialized() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('数据库未初始化'));
            return;
        }
        
        const transaction = db.transaction(['chapters'], 'readonly');
        const store = transaction.objectStore('chapters');
        const countRequest = store.count();
        
        countRequest.onsuccess = function() {
            if (countRequest.result === 0) {
                console.log('数据库为空，开始自动初始化数据...');
                // 自动初始化数据库
                autoInitDatabase().then(() => {
                    console.log('数据库自动初始化完成');
                    // 加载第一章
                    loadChapter(1);
                    resolve();
                }).catch(error => {
                    console.error('自动初始化失败:', error);
                    showError('数据库初始化失败: ' + error.message);
                    reject(error);
                });
            } else {
                console.log('数据库已有数据，数量:', countRequest.result);
                // 加载第一章
                loadChapter(1);
                resolve();
            }
        };
        
        countRequest.onerror = function(event) {
            console.error('检查数据库失败:', event.target.error);
            reject(event.target.error);
        };
    });
}

// 自动初始化数据库
function autoInitDatabase() {
    return new Promise((resolve, reject) => {
        if (isInitializing) {
            reject(new Error('正在初始化中，请稍候'));
            return;
        }
        
        isInitializing = true;
        
        const chapters = [
            { id: 1, title: 'Python简介', description: '了解Python的基本概念和历史', order_num: 1 },
            { id: 2, title: '基础语法', description: '学习Python的基本语法结构', order_num: 2 },
            { id: 3, title: '数据类型', description: '掌握Python的各种数据类型', order_num: 3 },
            { id: 4, title: '控制流程', description: '学习条件判断和循环', order_num: 4 },
            { id: 5, title: '函数', description: '理解函数的定义和使用', order_num: 5 },
            { id: 6, title: '模块和包', description: '学习模块化编程', order_num: 6 },
            { id: 7, title: '文件操作', description: '掌握文件读写操作', order_num: 7 },
            { id: 8, title: '异常处理', description: '学习错误和异常处理', order_num: 8 },
            { id: 9, title: '面向对象编程', description: '理解OOP概念', order_num: 9 },
            { id: 10, title: '常用库介绍', description: '了解Python标准库', order_num: 10 }
        ];
        
        const lessons = [
            // 第一章: Python简介
            { 
                id: 1, 
                chapter_id: 1, 
                title: 'Python是什么',
                content: 'Python是一种高级编程语言，由Guido van Rossum于1991年创建。它具有以下特点：<br><br>• 解释型语言 - 不需要编译，直接运行<br>• 动态类型 - 变量不需要声明类型<br>• 跨平台 - 可在Windows、Mac和Linux上运行<br>• 丰富的标准库 - 提供大量内置模块<br>• 社区支持 - 拥有庞大的开发者社区',
                order_num: 1, 
                is_exercise: false 
            },
            { 
                id: 2, 
                chapter_id: 1, 
                title: 'Python的应用领域',
                content: 'Python被广泛应用于多个领域：<br><br>1. Web开发 - Django, Flask框架<br>2. 数据科学 - NumPy, Pandas, Matplotlib<br>3. 人工智能 - TensorFlow, PyTorch<br>4. 自动化脚本 - 系统管理任务自动化<br>5. 游戏开发 - PyGame<br>6. 网络爬虫 - Scrapy, BeautifulSoup',
                order_num: 2, 
                is_exercise: false 
            },
            { 
                id: 3, 
                chapter_id: 1, 
                title: '安装Python',
                content: '安装Python的步骤：<br><br>1. 访问官网 https://www.python.org/downloads/<br>2. 下载适合你操作系统的版本<br>3. 运行安装程序，勾选"Add Python to PATH"<br>4. 完成安装后，在命令行输入<code>python --version</code>验证安装<br><br>推荐使用Python 3.x版本，因为Python 2已经停止维护。',
                order_num: 3, 
                is_exercise: false 
            },
            { 
                id: 4, 
                chapter_id: 1, 
                title: '第一个Python程序',
                content: '让我们编写第一个Python程序：<br><br>1. 创建一个名为hello.py的文件<br>2. 输入以下代码：<br><code>print("Hello, World!")</code><br>3. 保存文件<br>4. 在命令行运行：python hello.py<br><br>你应该会看到输出：Hello, World!',
                order_num: 4, 
                is_exercise: true 
            },
            
            // 第二章: 基础语法
            { 
                id: 5, 
                chapter_id: 2, 
                title: '变量和赋值',
                content: '在Python中，变量不需要声明类型，直接赋值即可：<br><br><code>x = 10</code> # 整数<br><code>name = "Alice"</code> # 字符串<br><code>pi = 3.14</code> # 浮点数<br><code>is_active = True</code> # 布尔值<br><br>变量命名规则：<br>• 只能包含字母、数字和下划线<br>• 不能以数字开头<br>• 区分大小写<br>• 避免使用Python关键字',
                order_num: 1, 
                is_exercise: false 
            },
            { 
                id: 6, 
                chapter_id: 2, 
                title: '基本数据类型',
                content: 'Python有几种基本数据类型：<br><br>1. 整数(int) - 如 10, -5, 0<br>2. 浮点数(float) - 如 3.14, -0.001<br>3. 字符串(str) - 如 "hello", \'Python\'<br>4. 布尔值(bool) - True 或 False<br>5. 空值(NoneType) - None<br><br>使用type()函数可以查看变量类型：<br><code>print(type(10))</code> # &lt;class \'int\'&gt;<br><code>print(type("hello"))</code> # &lt;class \'str\'&gt;',
                order_num: 2, 
                is_exercise: false 
            },
            { 
                id: 7, 
                chapter_id: 2, 
                title: '注释和文档字符串',
                content: '在Python中，注释用于解释代码：<br><br>• 单行注释：<code># 这是一个注释</code><br>• 多行注释：使用三个单引号或双引号<br><br>文档字符串用于说明函数或模块的功能：<br><code>def add(a, b):</code><br><code>    """返回两个数的和"""</code><br><code>    return a + b</code>',
                order_num: 3, 
                is_exercise: false 
            },
            
            // 第三章: 数据类型
            { 
                id: 8, 
                chapter_id: 3, 
                title: '列表',
                content: '列表是可变的序列类型：<br><br><code>numbers = [1, 2, 3, 4, 5]</code><br><code>fruits = ["apple", "banana", "cherry"]</code><br><br>常用操作：<br>• 访问元素：<code>fruits[0]</code> → "apple"<br>• 添加元素：<code>fruits.append("orange")</code><br>• 删除元素：<code>del fruits[1]</code><br>• 切片：<code>numbers[1:3]</code> → [2, 3]',
                order_num: 1, 
                is_exercise: false 
            },
            { 
                id: 9, 
                chapter_id: 3, 
                title: '元组',
                content: '元组是不可变的序列类型：<br><br><code>coordinates = (10, 20)</code><br><code>colors = ("red", "green", "blue")</code><br><br>特点：<br>• 不可修改<br>• 创建后无法添加、删除或修改元素<br>• 可以作为字典的键<br>• 比列表更快',
                order_num: 2, 
                is_exercise: false 
            },
            { 
                id: 10, 
                chapter_id: 3, 
                title: '字典',
                content: '字典是键值对的集合：<br><br><code>person = {"name": "Alice", "age": 30, "city": "Beijing"}</code><br><br>常用操作：<br>• 访问值：<code>person["name"]</code> → "Alice"<br>• 添加/修改：<code>person["job"] = "engineer"</code><br>• 删除：<code>del person["age"]</code><br>• 遍历：<code>for key, value in person.items():</code>',
                order_num: 3, 
                is_exercise: false 
            },
            { 
                id: 11, 
                chapter_id: 3, 
                title: '集合',
                content: '集合是无序且不重复的元素集合：<br><br><code>numbers = {1, 2, 3, 4, 5}</code><br><code>fruits = {"apple", "banana", "cherry"}</code><br><br>集合运算：<br>• 并集：<code>set1 | set2</code><br>• 交集：<code>set1 & set2</code><br>• 差集：<code>set1 - set2</code><br>• 对称差集：<code>set1 ^ set2</code>',
                order_num: 4, 
                is_exercise: false 
            },
            
            // 第四章: 控制流程
            { 
                id: 12, 
                chapter_id: 4, 
                title: '条件语句',
                content: 'if语句用于条件判断：<br><br><code>if score >= 90:</code><br><code>    grade = "A"</code><br><code>elif score >= 80:</code><br><code>    grade = "B"</code><br><code>else:</code><br><code>    grade = "C"</code><br><br>可以使用逻辑运算符：<br>• <code>and</code> - 与<br>• <code>or</code> - 或<br>• <code>not</code> - 非',
                order_num: 1, 
                is_exercise: false 
            },
            { 
                id: 13, 
                chapter_id: 4, 
                title: '循环语句',
                content: 'Python有两种循环：<br><br>1. for循环：<br><code>for i in range(5):</code><br><code>    print(i)</code><br><br>2. while循环：<br><code>count = 0</code><br><code>while count < 5:</code><br><code>    print(count)</code><br><code>    count += 1</code><br><br>循环控制：<br>• <code>break</code> - 跳出循环<br>• <code>continue</code> - 跳过当前迭代',
                order_num: 2, 
                is_exercise: true 
            },
            
            // 第五章: 函数
            { 
                id: 14, 
                chapter_id: 5, 
                title: '函数定义和调用',
                content: '函数是可重用的代码块：<br><br><code>def greet(name):</code><br><code>    """向指定的人问好"""</code><br><code>    return f"Hello, {name}!"</code><br><br>调用函数：<br><code>result = greet("Alice")</code><br><code>print(result)  # Hello, Alice!</code><br><br>参数可以有默认值：<br><code>def greet(name="World"):</code><br><code>    return f"Hello, {name}!"</code>',
                order_num: 1, 
                is_exercise: false 
            },
            { 
                id: 15, 
                chapter_id: 5, 
                title: '函数的参数',
                content: 'Python支持多种参数类型：<br><br>1. 位置参数：<code>add(10, 20)</code><br>2. 关键字参数：<code>add(x=10, y=20)</code><br>3. 默认参数：<code>def greet(name="World")</code><br>4. 可变参数：<code>def sum(*args)</code><br>5. 关键字可变参数：<code>def print_info(**kwargs)</code>',
                order_num: 2, 
                is_exercise: false 
            },
            
            // 第六章: 模块和包
            { 
                id: 16, 
                chapter_id: 6, 
                title: '导入模块',
                content: '模块是包含Python代码的文件：<br><br>• <code>import math</code> - 导入整个模块<br>• <code>from math import sqrt</code> - 导入特定函数<br>• <code>from math import sqrt as square_root</code> - 导入并重命名<br>• <code>import math as m</code> - 导入并重命名模块<br><br>创建自己的模块：创建一个.py文件，然后在其他文件中导入。',
                order_num: 1, 
                is_exercise: false 
            },
            { 
                id: 17, 
                chapter_id: 6, 
                title: '创建包',
                content: '包是包含多个模块的目录：<br><br>目录结构：<br><code>mypackage/</code><br><code>├── __init__.py</code><br><code>├── module1.py</code><br><code>└── module2.py</code><br><br>导入包：<br>• <code>from mypackage import module1</code><br>• <code>import mypackage.module2</code>',
                order_num: 2, 
                is_exercise: false 
            },
            
            // 第七章: 文件操作
            { 
                id: 18, 
                chapter_id: 7, 
                title: '读取文件',
                content: 'Python读取文件的基本方法：<br><br><code># 打开文件</code><br><code>file = open("example.txt", "r")</code><br><code># 读取内容</code><br><code>content = file.read()</code><br><code># 关闭文件</code><br><code>file.close()</code><br><br>推荐使用with语句：<br><code>with open("example.txt", "r") as file:</code><br><code>    content = file.read()</code>',
                order_num: 1, 
                is_exercise: false 
            },
            { 
                id: 19, 
                chapter_id: 7, 
                title: '写入文件',
                content: '写入文件的几种模式：<br><br>• "w" - 写入模式，覆盖已有内容<br>• "a" - 追加模式，在末尾添加内容<br>• "x" - 创建模式，文件不存在时创建<br><br>示例：<br><code>with open("output.txt", "w") as file:</code><br><code>    file.write("Hello, World!\\n")</code><br><code>    file.write("This is a new line.")</code>',
                order_num: 2, 
                is_exercise: true 
            },
            
            // 第八章: 异常处理
            { 
                id: 20, 
                chapter_id: 8, 
                title: '捕获异常',
                content: '使用try-except处理异常：<br><br><code>try:</code><br><code>    num = int(input("请输入一个数字: "))</code><br><code>    result = 10 / num</code><br><code>    print(f"结果是: {result}")</code><br><code>except ValueError:</code><br><code>    print("输入的不是数字！")</code><br><code>except ZeroDivisionError:</code><br><code>    print("不能除以零！")</code><br><code>except Exception as e:</code><br><code>    print(f"发生错误: {e}")</code>',
                order_num: 1, 
                is_exercise: false 
            },
            { 
                id: 21, 
                chapter_id: 8, 
                title: '自定义异常',
                content: '可以创建自定义异常类：<br><br><code>class AgeError(Exception):</code><br><code>    """年龄错误异常"""</code><br><code>    pass</code><br><br><code>def check_age(age):</code><br><code>    if age < 0:</code><br><code>        raise AgeError("年龄不能为负数")</code><br><code>    elif age > 150:</code><br><code>        raise AgeError("年龄不能超过150岁")</code>',
                order_num: 2, 
                is_exercise: false 
            },
            
            // 第九章: 面向对象编程
            { 
                id: 22, 
                chapter_id: 9, 
                title: '类和对象',
                content: '类定义对象的蓝图：<br><br><code>class Person:</code><br><code>    def __init__(self, name, age):</code><br><code>        self.name = name</code><br><code>        self.age = age</code><br><br><code>    def greet(self):</code><br><code>        return f"Hello, I am {self.name}"</code><br><br>创建对象：<br><code>person = Person("Alice", 30)</code><br><code>print(person.greet())</code>',
                order_num: 1, 
                is_exercise: false 
            },
            { 
                id: 23, 
                chapter_id: 9, 
                title: '继承和多态',
                content: '继承允许创建子类：<br><br><code>class Animal:</code><br><code>    def speak(self):</code><br><code>        pass</code><br><br><code>class Dog(Animal):</code><br><code>    def speak(self):</code><br><code>        return "Woof!"</code><br><br><code>class Cat(Animal):</code><br><code>    def speak(self):</code><br><code>        return "Meow!"</code><br><br>多态：不同的子类可以有相同方法的不同实现。',
                order_num: 2, 
                is_exercise: true 
            },
            
            // 第十章: 常用库介绍
            { 
                id: 24, 
                chapter_id: 10, 
                title: '标准库概览',
                content: 'Python标准库提供了许多有用的模块：<br><br>• os - 操作系统接口<br>• sys - 系统相关参数和函数<br>• datetime - 日期和时间处理<br>• json - JSON编码和解码<br>• re - 正则表达式<br>• random - 生成随机数<br>• math - 数学函数<br>• collections - 容器数据类型<br><br>示例：<br><code>import os</code><br><code>print(os.getcwd())  # 获取当前目录</code>',
                order_num: 1, 
                is_exercise: false 
            },
            { 
                id: 25, 
                chapter_id: 10, 
                title: '第三方库安装',
                content: '使用pip安装第三方库：<br><br>1. 安装特定包：<br><code>pip install requests</code><br>2. 安装指定版本：<br><code>pip install requests==2.28.0</code><br>3. 从requirements.txt安装：<br><code>pip install -r requirements.txt</code><br>4. 升级包：<br><code>pip install --upgrade requests</code><br><br>常用第三方库：<br>• requests - HTTP请求<br>• numpy - 数值计算<br>• pandas - 数据分析<br>• matplotlib - 数据可视化',
                order_num: 2, 
                is_exercise: false 
            }
        ];
        
        const codeExamples = [
            // 课程1的代码示例
            {
                lesson_id: 1,
                code: '# Python的第一个程序\nprint("Hello, World!")\n\n# 简单计算\nx = 10\ny = 20\nsum = x + y\nprint(f"{x} + {y} = {sum}")\n\n# 字符串操作\nname = "Python"\nprint(f"Hello, {name}!")\nprint(name.upper())',
                explanation: '这段代码展示了Python的基本语法：<br>1. print()函数用于输出<br>2. 变量赋值不需要指定类型<br>3. f-string用于格式化字符串<br>4. 字符串方法如upper()'
            },
            {
                lesson_id: 4,
                code: '# 变量和数据类型示例\n\n# 整数\nage = 25\nprint(f"年龄: {age}")\nprint(type(age))  # <class \'int\'>\n\n# 浮点数\nprice = 19.99\nprint(f"价格: {price}")\n\n# 字符串\nname = "Alice"\ngreeting = "Hello, " + name\nprint(greeting)\n\n# 布尔值\nis_student = True\nprint(f"是学生: {is_student}")\n\n# 类型转换\nnum_str = "100"\nnum_int = int(num_str)\nprint(f"转换后: {num_int}")',
                explanation: '练习：尝试修改这些变量并观察输出。'
            },
            {
                lesson_id: 13,
                code: '# 循环控制示例\n\n# for循环\nprint("for循环示例：")\nfor i in range(1, 6):\n    if i == 3:\n        continue  # 跳过3\n    print(f"数字: {i}")\n\nprint("\\nwhile循环示例：")\ncount = 0\nwhile True:\n    count += 1\n    if count == 5:\n        break  # 当count为5时退出循环\n    print(f"计数: {count}")\n\n# 列表推导式\nsquares = [x**2 for x in range(1, 6)]\nprint(f"\\n平方数列表: {squares}")',
                explanation: '理解break和continue的区别：<br>• break完全退出循环<br>• continue跳过当前迭代，继续下一次'
            }
        ];
        
        const transaction = db.transaction(['chapters', 'lessons', 'code_examples'], 'readwrite');
        
        const chapterStore = transaction.objectStore('chapters');
        const lessonStore = transaction.objectStore('lessons');
        const codeExampleStore = transaction.objectStore('code_examples');
        
        // 添加章节
        chapters.forEach(chapter => {
            chapterStore.add(chapter);
        });
        
        // 添加课程
        lessons.forEach(lesson => {
            lessonStore.add(lesson);
        });
        
        // 添加代码示例
        codeExamples.forEach(example => {
            codeExampleStore.add(example);
        });
        
        transaction.oncomplete = function() {
            isInitializing = false;
            console.log('数据库初始化完成');
            showSuccess('数据库初始化成功！');
            resolve();
        };
        
        transaction.onerror = function(event) {
            isInitializing = false;
            console.error('数据库初始化失败:', event.target.error);
            reject(event.target.error);
        };
    });
}

// 以下是原有的函数，保持不变
function loadChapter(chapterId) {
    currentChapterId = chapterId;
    document.querySelectorAll('.chapter-link').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.chapter-link[data-chapter-id="${chapterId}"]`).classList.add('active');
    loadChapterLessons(chapterId);
}

function loadChapterLessons(chapterId) {
    const transaction = db.transaction(['lessons'], 'readonly');
    const store = transaction.objectStore('lessons');
    const index = store.index('chapter_id');
    const request = index.getAll(IDBKeyRange.only(parseInt(chapterId)));
    
    request.onsuccess = function() {
        currentChapterLessons = request.result;
        currentChapterLessons.sort((a, b) => a.order_num - b.order_num);
        
        if (currentChapterLessons.length > 0) {
            currentLessonIndex = 0;
            loadLesson(currentChapterLessons[0].id);
            updateNavigationButtons();
        } else {
            document.getElementById('lesson-title').textContent = '暂无课程内容';
            document.getElementById('lesson-content').innerHTML = '<p>本章节暂无内容</p>';
            document.getElementById('prev-lesson').disabled = true;
            document.getElementById('next-lesson').disabled = true;
        }
    };
    
    request.onerror = function(event) {
        console.error('加载课程失败:', event.target.error);
    };
}

function loadLesson(lessonId) {
    currentLessonId = lessonId;
    const lessonTransaction = db.transaction(['lessons'], 'readonly');
    const lessonStore = lessonTransaction.objectStore('lessons');
    const lessonRequest = lessonStore.get(parseInt(lessonId));
    
    lessonRequest.onsuccess = function() {
        const lesson = lessonRequest.result;
        if (!lesson) return;
        
        document.getElementById('lesson-title').textContent = lesson.title;
        document.getElementById('lesson-content').innerHTML = lesson.content;
        
        const exerciseArea = document.getElementById('exercise-area');
        if (lesson.is_exercise) {
            exerciseArea.style.display = 'block';
            document.getElementById('exercise-content').innerHTML = lesson.content;
            document.getElementById('exercise-feedback').innerHTML = '';
            document.getElementById('exercise-solution').value = '';
            document.getElementById('exercise-solution-area').style.display = 'none';
        } else {
            exerciseArea.style.display = 'none';
        }
        
        loadCodeExamples(lessonId);
        updateNavigationButtons();
    };
}

function loadCodeExamples(lessonId) {
    const transaction = db.transaction(['code_examples'], 'readonly');
    const store = transaction.objectStore('code_examples');
    const index = store.index('lesson_id');
    const request = index.getAll(IDBKeyRange.only(parseInt(lessonId)));
    
    request.onsuccess = function() {
        const codeExamples = request.result;
        const codeExamplesContainer = document.getElementById('code-examples');
        
        if (codeExamples.length > 0) {
            codeExamplesContainer.style.display = 'block';
            const example = codeExamples[0];
            document.getElementById('code-content').textContent = example.code;
            document.getElementById('code-explanation').innerHTML = example.explanation || '';
        } else {
            codeExamplesContainer.style.display = 'none';
        }
    };
}

function updateNavigationButtons() {
    const prevButton = document.getElementById('prev-lesson');
    const nextButton = document.getElementById('next-lesson');
    
    prevButton.disabled = currentLessonIndex <= 0;
    nextButton.disabled = currentLessonIndex >= currentChapterLessons.length - 1;
}

function loadPreviousLesson() {
    if (currentLessonIndex > 0) {
        currentLessonIndex--;
        loadLesson(currentChapterLessons[currentLessonIndex].id);
    }
}

function loadNextLesson() {
    if (currentLessonIndex < currentChapterLessons.length - 1) {
        currentLessonIndex++;
        loadLesson(currentChapterLessons[currentLessonIndex].id);
    }
}

// 工具函数
function showError(message) {
    const content = document.getElementById('lesson-content');
    if (content) {
        content.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> ${message}
            </div>
        `;
    } else {
        alert(message);
    }
}

function showWarning(message) {
    const content = document.getElementById('lesson-content');
    if (content) {
        content.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i> ${message}
            </div>
        `;
    }
}

function showSuccess(message) {
    const content = document.getElementById('lesson-content');
    if (content) {
        content.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i> ${message}
            </div>
        `;
    }
}

// 其他功能的占位函数（需要时实现）
function submitExercise() {
    alert('练习提交功能需要实现');
}

function showSolution() {
    alert('显示答案功能需要实现');
}

function copyCode() {
    const codeContent = document.getElementById('code-content');
    if (codeContent) {
        navigator.clipboard.writeText(codeContent.textContent)
            .then(() => {
                alert('代码已复制到剪贴板！');
            })
            .catch(err => {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制代码。');
            });
    }
}