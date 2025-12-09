// ===== 极简金币系统 =====
class SimpleCoinSystem {
    constructor() {
        this.coinCount = parseInt(localStorage.getItem('userCoins')) || 0;
        this.updateDisplay();
    }
    
    updateDisplay() {
    const coinElement = document.getElementById('simpleCoinCount');
    if (coinElement) {
        coinElement.textContent = this.coinCount;
        
        // 添加获得金币的动画
        coinElement.classList.remove('coin-gain');
        void coinElement.offsetWidth; // 触发重绘
        coinElement.classList.add('coin-gain');
        
        // 图标也添加动画
        const coinIcon = document.querySelector('.coin-icon');
        if (coinIcon) {
            coinIcon.classList.remove('coin-gain');
            void coinIcon.offsetWidth;
            coinIcon.classList.add('coin-gain');
        }
    }
}
    
    addCoins(amount, reason = '') {
        this.coinCount += amount;
        localStorage.setItem('userCoins', this.coinCount.toString());
        this.updateDisplay();
        console.log(`💰 +${amount}金币 ${reason ? '(' + reason + ')' : ''}`);
        return this.coinCount;
    }
}

// 创建全局实例
const coinSystem = new SimpleCoinSystem();

let db;
let currentChapterId = null;
let currentLessonId = null;
let currentLessonIndex = 0;
let currentChapterLessons = [];


document.addEventListener('DOMContentLoaded', function() {
 
    document.getElementById('init-db').addEventListener('click', initDatabase);
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
    
    
    openDatabase();
});


function openDatabase() {
    return new Promise((resolve, reject) => {
       
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
                alert('数据库打开失败: ' + event.target.error.message);
                reject(event.target.error);
            };
            
            request.onblocked = function() {
                alert('数据库被其他标签页锁定，请关闭其他使用此网站的标签页');
                reject(new Error('Database blocked by other tab'));
            };
            
            request.onsuccess = function(event) {
                db = event.target.result;
                console.log('数据库已打开');
                
                
                db.onerror = function(event) {
                    console.error('数据库错误:', event.target.error);
                    alert('数据库错误: ' + event.target.error.message);
                };
                
                db.onversionchange = function() {
                    db.close();
                    alert('数据库版本已变更，请刷新页面');
                };
                
                checkIfDatabaseInitialized();
                resolve(db);
            };
            
            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                
                
                const chapterStore = db.createObjectStore('chapters', { 
                    keyPath: 'id',
                    autoIncrement: true
                });
                chapterStore.createIndex('order_num', 'order_num', { unique: true });
                
              
                const lessonStore = db.createObjectStore('lessons', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                lessonStore.createIndex('chapter_id', 'chapter_id');
                lessonStore.createIndex('order_num', 'order_num');
                
               
                const codeExampleStore = db.createObjectStore('code_examples', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                codeExampleStore.createIndex('lesson_id', 'lesson_id');
                
                
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
    if (!db) {
        console.error('数据库未初始化');
        return;
    }
    
    const transaction = db.transaction(['chapters'], 'readonly');
    const store = transaction.objectStore('chapters');
    const countRequest = store.count();
    
    countRequest.onsuccess = function() {
        if (countRequest.result === 0) {
            document.getElementById('lesson-content').innerHTML = `
                <div class="alert alert-warning">
                    数据库尚未初始化，请点击左侧的"初始化数据库"按钮
                </div>
            `;
        } else {
           
            loadChapter(1);
        }
    };
    
    countRequest.onerror = function(event) {
        console.error('检查数据库失败:', event.target.error);
    };
}


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


function initDatabase() {
    if (!db) {
        alert('数据库未正确初始化，请刷新页面重试');
        return;
    }

    
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
        
        { id: 1, chapter_id: 1, title: 'Python是什么', 
          content: 'Python是一种高级编程语言，由Guido van Rossum于1991年创建。它具有以下特点：<br><br>• 解释型语言 - 不需要编译，直接运行<br>• 动态类型 - 变量不需要声明类型<br>• 跨平台 - 可在Windows、Mac和Linux上运行<br>• 丰富的标准库 - 提供大量内置模块<br>• 社区支持 - 拥有庞大的开发者社区', 
          order_num: 1, is_exercise: false },
        { id: 2, chapter_id: 1, title: 'Python的应用领域', 
          content: 'Python被广泛应用于多个领域：<br><br>1. Web开发 - Django, Flask框架<br>2. 数据科学 - NumPy, Pandas, Matplotlib<br>3. 人工智能 - TensorFlow, PyTorch<br>4. 自动化脚本 - 系统管理任务自动化<br>5. 游戏开发 - PyGame<br>6. 网络爬虫 - Scrapy, BeautifulSoup', 
          order_num: 2, is_exercise: false },
        { id: 3, chapter_id: 1, title: '安装Python', 
          content: '安装Python的步骤：<br><br>1. 访问官网 https://www.python.org/downloads/<br>2. 下载适合你操作系统的版本<br>3. 运行安装程序，勾选"Add Python to PATH"<br>4. 完成安装后，在命令行输入<code>python --version</code>验证安装<br><br>推荐使用Python 3.x版本，因为Python 2已经停止维护。', 
          order_num: 3, is_exercise: false },
        { id: 4, chapter_id: 1, title: '第一个Python程序', 
          content: '让我们编写第一个Python程序：<br><br>1. 创建一个名为hello.py的文件<br>2. 输入以下代码：<br><code>print("Hello, World!")</code><br>3. 保存文件<br>4. 在命令行运行：python hello.py<br><br>你应该会看到输出：Hello, World!', 
          order_num: 4, is_exercise: true },
        
       
        { id: 5, chapter_id: 2, title: '变量和赋值', 
          content: '在Python中，变量不需要声明类型，直接赋值即可：<br><br><code>x = 10</code>          # 整数<br><code>name = "Alice"</code>  # 字符串<br><code>pi = 3.14</code>       # 浮点数<br><code>is_active = True</code> # 布尔值<br><br>变量命名规则：<br>• 只能包含字母、数字和下划线<br>• 不能以数字开头<br>• 区分大小写<br>• 避免使用Python关键字', 
          order_num: 1, is_exercise: false },
        { id: 6, chapter_id: 2, title: '基本数据类型', 
          content: 'Python有几种基本数据类型：<br><br>1. 整数(int) - 如 10, -5, 0<br>2. 浮点数(float) - 如 3.14, -0.001<br>3. 字符串(str) - 如 "hello", \'Python\'<br>4. 布尔值(bool) - True 或 False<br>5. 空值(NoneType) - None<br><br>使用type()函数可以查看变量类型：<br><code>print(type(10))</code>    # &lt;class \'int\'&gt;', 
          order_num: 2, is_exercise: false },
        { id: 7, chapter_id: 2, title: '运算符', 
          content: 'Python支持多种运算符：<br><br>算术运算符：<br>+ 加法  - 减法  * 乘法  / 除法  % 取模  ** 幂运算  // 整除<br><br>比较运算符：<br>== 等于  != 不等于  &gt; 大于  &lt; 小于  &gt;= 大于等于  &lt;= 小于等于<br><br>逻辑运算符：<br>and 与  or 或  not 非', 
          order_num: 3, is_exercise: false },
        { id: 8, chapter_id: 2, title: '练习: 基本语法', 
          content: '完成以下练习：<br><br>1. 创建一个变量age并赋值为25<br>2. 创建一个变量name并赋值为你的名字<br>3. 计算10的3次方并将结果存入变量power<br>4. 判断age是否大于18，结果存入变量is_adult<br>5. 打印所有变量的值和类型', 
          order_num: 4, is_exercise: true },
        
        
        { id: 9, chapter_id: 3, title: '数字类型', 
          content: 'Python中的数字类型包括：<br><br>整数(int)：<br>• 没有大小限制<br>• 支持十进制、二进制(0b)、八进制(0o)、十六进制(0x)<br><br>浮点数(float)：<br>• 带小数点的数字<br>• 可以用科学计数法表示(3e2 = 300)<br><br>复数(complex)：<br>• 如 3+5j<br><br>数字运算：<br>abs()绝对值  round()四舍五入  math模块提供更多数学函数', 
          order_num: 1, is_exercise: false },
        { id: 10, chapter_id: 3, title: '字符串', 
          content: '字符串是Python中最常用的数据类型：<br><br>创建字符串：<br>单引号: \'hello\'<br>双引号: "Python"<br>三引号: """多行字符串"""<br><br>字符串操作：<br>• 拼接: "Hello" + "World"<br>• 重复: "Hi" * 3<br>• 索引: s[0]<br>• 切片: s[1:4]<br>• 长度: len(s)<br>• 方法: s.upper(), s.lower(), s.split()', 
          order_num: 2, is_exercise: false },
        { id: 11, chapter_id: 3, title: '列表和元组', 
          content: '列表(list)和元组(tuple)都是序列类型：<br><br>列表：<br>• 可变序列<br>• 用方括号定义: [1, 2, 3]<br>• 方法: append(), remove(), sort()<br><br>元组：<br>• 不可变序列<br>• 用圆括号定义: (1, 2, 3)<br>• 通常用于不应修改的数据<br><br>共同操作：<br>索引、切片、len(), in运算符等', 
          order_num: 3, is_exercise: false },
        { id: 12, chapter_id: 3, title: '字典和集合', 
          content: '字典(dict)和集合(set)：<br><br>字典：<br>• 键值对集合<br>• 用花括号定义: {"name": "Alice", "age": 25}<br>• 键必须是不可变类型<br>• 方法: keys(), values(), items()<br><br>集合：<br>• 无序不重复元素集<br>• 用花括号定义: {1, 2, 3}<br>• 支持集合运算: 并集(|), 交集(&), 差集(-)', 
          order_num: 4, is_exercise: false },
        { id: 13, chapter_id: 3, title: '练习: 数据类型', 
          content: '完成以下练习：<br><br>1. 创建一个包含3个水果名称的列表fruits<br>2. 创建一个包含姓名和年龄的字典person<br>3. 将"orange"添加到fruits列表中<br>4. 修改person字典中的年龄<br>5. 创建一个包含1-10偶数的集合even_numbers<br>6. 打印所有变量', 
          order_num: 5, is_exercise: true },
        
        
        { id: 14, chapter_id: 4, title: '条件语句', 
          content: 'Python使用if语句进行条件判断：<br><br><code>if 条件1:<br>    执行代码块1<br>elif 条件2:<br>    执行代码块2<br>else:<br>    执行代码块3</code><br><br>比较运算符：<br>== 等于  != 不等于  &gt; 大于  &lt; 小于  &gt;= 大于等于  &lt;= 小于等于<br><br>逻辑运算符：<br>and 与  or 或  not 非', 
          order_num: 1, is_exercise: false },
        { id: 15, chapter_id: 4, title: '循环语句', 
          content: 'Python有两种循环结构：<br><br>1. while循环：<br><code>while 条件:<br>    循环体</code><br><br>2. for循环：<br><code>for 变量 in 序列:<br>    循环体</code><br><br>控制语句：<br>break - 跳出整个循环<br>continue - 跳过当前迭代<br>pass - 空操作，占位符', 
          order_num: 2, is_exercise: false },
        { id: 16, chapter_id: 4, title: '练习: 控制流程', 
          content: '完成以下练习：<br><br>1. 编写一个程序，判断用户输入的数字是奇数还是偶数<br>2. 编写一个程序，计算1到100的和<br>3. 编写一个程序，打印1到100的所有质数', 
          order_num: 3, is_exercise: true },
        
        
        { id: 17, chapter_id: 5, title: '函数定义', 
          content: 'Python使用def关键字定义函数：<br><br><code>def 函数名(参数1, 参数2):<br>    """文档字符串"""<br>    函数体<br>    return 返回值</code><br><br>函数特点：<br>• 使用def关键字定义<br>• 使用return返回值<br>• 可以没有返回值(返回None)<br>• 可以有默认参数值<br>• 可以接受可变数量参数', 
          order_num: 1, is_exercise: false },
        { id: 18, chapter_id: 5, title: '函数参数', 
          content: 'Python函数参数类型：<br><br>1. 位置参数：按位置顺序传递<br>2. 关键字参数：按参数名传递<br>3. 默认参数：定义时指定默认值<br>4. 可变参数：<br>   • *args - 接收任意数量的位置参数<br>   • **kwargs - 接收任意数量的关键字参数<br><br>参数传递规则：<br>不可变对象(数字、字符串、元组)按值传递<br>可变对象(列表、字典)按引用传递', 
          order_num: 2, is_exercise: false },
        { id: 19, chapter_id: 5, title: '练习: 函数', 
          content: '完成以下练习：<br><br>1. 编写一个计算圆面积的函数<br>2. 编写一个函数，接收任意数量的数字并返回它们的和<br>3. 编写一个递归函数计算阶乘', 
          order_num: 3, is_exercise: true },
        
        
        { id: 20, chapter_id: 6, title: '模块导入', 
          content: 'Python模块是一个.py文件，包含可重用的代码：<br><br>导入方式：<br><code>import 模块名<br>from 模块名 import 函数/变量<br>from 模块名 import *<br>import 模块名 as 别名</code><br><br>常用模块：<br>math - 数学函数<br>random - 随机数<br>datetime - 日期时间<br>os - 操作系统接口<br>sys - 系统相关参数', 
          order_num: 1, is_exercise: false },
        { id: 21, chapter_id: 6, title: '包管理', 
          content: 'Python包是一个包含__init__.py文件的目录：<br><br>包结构：<br>my_package/<br>├── __init__.py<br>├── module1.py<br>└── module2.py<br><br>导入方式：<br><code>import 包名.模块名<br>from 包名 import 模块名<br>from 包名.模块名 import 函数/变量</code><br><br>pip是Python包管理工具，用于安装第三方包', 
          order_num: 2, is_exercise: false },
        { id: 22, chapter_id: 6, title: '练习: 模块和包', 
          content: '完成以下练习：<br><br>1. 创建一个自定义模块，包含几个实用函数<br>2. 使用pip安装一个第三方包(如requests)<br>3. 编写一个程序使用datetime模块显示当前时间', 
          order_num: 3, is_exercise: true },
        
        
        { id: 23, chapter_id: 7, title: '文件读写', 
          content: 'Python使用open()函数操作文件：<br><br><code>with open("文件名", "模式") as 文件对象:<br>    文件操作</code><br><br>文件模式：<br>r - 读取(默认)<br>w - 写入(覆盖)<br>a - 追加<br>b - 二进制模式<br>+ - 读写模式<br><br>常用方法：<br>read() - 读取内容<br>write() - 写入内容<br>readlines() - 读取所有行<br>writelines() - 写入多行', 
          order_num: 1, is_exercise: false },
        { id: 24, chapter_id: 7, title: '文件系统操作', 
          content: 'os模块提供文件系统操作：<br><br>常用函数：<br>os.rename() - 重命名文件<br>os.remove() - 删除文件<br>os.mkdir() - 创建目录<br>os.rmdir() - 删除目录<br>os.listdir() - 列出目录内容<br>os.path模块提供路径操作：<br>os.path.exists() - 检查路径是否存在<br>os.path.isfile() - 检查是否为文件<br>os.path.isdir() - 检查是否为目录', 
          order_num: 2, is_exercise: false },
        { id: 25, chapter_id: 7, title: '练习: 文件操作', 
          content: '完成以下练习：<br><br>1. 编写一个程序，读取文本文件并统计单词数量<br>2. 编写一个程序，将用户输入的内容保存到文件<br>3. 编写一个程序，遍历目录下的所有文件', 
          order_num: 3, is_exercise: true },
        
        
        { id: 26, chapter_id: 8, title: '异常捕获', 
          content: 'Python使用try-except处理异常：<br><br><code>try:<br>    可能出错的代码<br>except 异常类型 as 变量:<br>    异常处理代码<br>else:<br>    没有异常时执行<br>finally:<br>    无论是否异常都执行</code><br><br>常见异常：<br>Exception - 所有异常的基类<br>ValueError - 值错误<br>TypeError - 类型错误<br>IOError - I/O错误<br>IndexError - 索引错误<br>KeyError - 键错误', 
          order_num: 1, is_exercise: false },
        { id: 27, chapter_id: 8, title: '自定义异常', 
          content: '可以自定义异常类：<br><br><code>class MyError(Exception):<br>    def __init__(self, message):<br>        self.message = message<br><br>try:<br>    raise MyError("自定义错误")<br>except MyError as e:<br>    print(e.message)</code><br><br>raise语句用于主动抛出异常', 
          order_num: 2, is_exercise: false },
        { id: 28, chapter_id: 8, title: '练习: 异常处理', 
          content: '完成以下练习：<br><br>1. 编写一个程序，处理除零错误<br>2. 编写一个自定义异常类<br>3. 编写一个程序，处理文件不存在的异常', 
          order_num: 3, is_exercise: true },
        
        
        { id: 29, chapter_id: 9, title: '类和对象', 
          content: 'Python是面向对象语言：<br><br><code>class 类名:<br>    def __init__(self, 参数):  # 构造方法<br>        self.属性 = 参数<br>    <br>    def 方法名(self, 参数):<br>        方法体</code><br><br>对象特点：<br>• 封装 - 将数据和操作封装在类中<br>• 继承 - 子类继承父类的属性和方法<br>• 多态 - 不同类可以有同名方法', 
          order_num: 1, is_exercise: false },
        { id: 30, chapter_id: 9, title: '继承和多态', 
          content: 'Python支持继承和多态：<br><br><code>class 子类名(父类名):<br>    def __init__(self, 参数):<br>        super().__init__(参数)  # 调用父类构造方法<br>        self.子类属性 = 值</code><br><br>方法重写：<br>子类可以重写父类的方法<br><br>多态示例：<br>不同类的对象可以有同名方法，调用时根据对象类型执行相应方法', 
          order_num: 2, is_exercise: false },
        { id: 31, chapter_id: 9, title: '练习: 面向对象编程', 
          content: '完成以下练习：<br><br>1. 定义一个Person类，包含name和age属性<br>2. 创建一个Student类继承Person类，添加grade属性<br>3. 实现一个多态示例', 
          order_num: 3, is_exercise: true },
        
       
        { id: 32, chapter_id: 10, title: '标准库', 
          content: 'Python常用标准库：<br><br>• math - 数学函数<br>• random - 随机数<br>• datetime - 日期时间<br>• json - JSON处理<br>• re - 正则表达式<br>• os - 操作系统接口<br>• sys - 系统相关参数<br>• argparse - 命令行参数解析<br>• collections - 扩展的数据结构<br>• itertools - 迭代器工具', 
          order_num: 1, is_exercise: false },
        { id: 33, chapter_id: 10, title: '第三方库', 
          content: 'Python常用第三方库：<br><br>• requests - HTTP请求<br>• numpy - 数值计算<br>• pandas - 数据分析<br>• matplotlib - 数据可视化<br>• flask/django - Web开发<br>• beautifulsoup - HTML解析<br>• scrapy - 网络爬虫<br>• tensorflow/pytorch - 机器学习<br>• pygame - 游戏开发<br>• opencv - 图像处理', 
          order_num: 2, is_exercise: false },
        { id: 34, chapter_id: 10, title: '练习: 常用库', 
          content: '完成以下练习：<br><br>1. 使用requests库获取网页内容<br>2. 使用matplotlib绘制简单图表<br>3. 使用json模块解析JSON数据', 
          order_num: 3, is_exercise: true }
    ];
    
    
    const codeExamples = [
        { id: 1, lesson_id: 1, code: 'print("Hello, World!")', 
          explanation: '这是Python中最简单的程序，用于输出文本到控制台', order_num: 1 },
        { id: 2, lesson_id: 2, code: '# 变量赋值示例\nx = 10\ny = "Python"\nprint(x)\nprint(y)', 
          explanation: '展示了如何声明变量并打印它们的值', order_num: 1 },
        { id: 3, lesson_id: 3, code: '# 数字运算示例\na = 5\nb = 3\nprint(a + b)  # 加法\nprint(a * b)  # 乘法\nprint(a ** b) # 幂运算', 
          explanation: '展示了基本的数字运算操作', order_num: 1 },
        { id: 4, lesson_id: 4, code: '# 字符串操作示例\ns = "Python"\nprint(s[0])     # 第一个字符\nprint(s[-1])    # 最后一个字符\nprint(s[1:4])   # 切片\nprint(len(s))   # 长度', 
          explanation: '展示了字符串的索引、切片和长度获取', order_num: 1 },
        { id: 5, lesson_id: 5, code: '# 列表操作示例\nfruits = ["apple", "banana", "cherry"]\nfruits.append("orange")\nprint(fruits[1])\nprint(len(fruits))', 
          explanation: '展示了列表的基本操作', order_num: 1 },
        { id: 6, lesson_id: 6, code: '# 字典操作示例\nperson = {"name": "Alice", "age": 25}\nprint(person["name"])\nperson["age"] = 26\nprint(person)', 
          explanation: '展示了字典的基本操作', order_num: 1 },
        { id: 7, lesson_id: 7, code: '# 条件语句示例\nage = 20\nif age >= 18:\n    print("成年人")\nelse:\n    print("未成年人")', 
          explanation: '展示了if条件语句的使用', order_num: 1 },
        { id: 8, lesson_id: 8, code: '# 循环示例\n# for循环\nfor i in range(5):\n    print(i)\n\n# while循环\ncount = 0\nwhile count < 5:\n    print(count)\n    count += 1', 
          explanation: '展示了for和while循环的使用', order_num: 1 },
        { id: 9, lesson_id: 9, code: '# 函数定义示例\ndef greet(name):\n    """问候函数"""\n    return f"Hello, {name}!"\n\nprint(greet("Alice"))', 
          explanation: '展示了如何定义和调用函数', order_num: 1 },
        { id: 10, lesson_id: 10, code: '# 模块导入示例\nimport math\n\nprint(math.sqrt(16))  # 4.0\nprint(math.pi)        # 3.141592653589793', 
          explanation: '展示了如何导入和使用模块', order_num: 1 },
        { id: 11, lesson_id: 11, code: '# 文件读写示例\n# 写入文件\nwith open("test.txt", "w") as f:\n    f.write("Hello, Python!")\n\n# 读取文件\nwith open("test.txt", "r") as f:\n    content = f.read()\n    print(content)', 
          explanation: '展示了基本的文件读写操作', order_num: 1 },
        { id: 12, lesson_id: 12, code: '# 异常处理示例\ntry:\n    num = int(input("请输入一个数字: "))\n    print(10 / num)\nexcept ValueError:\n    print("请输入有效的数字!")\nexcept ZeroDivisionError:\n    print("不能除以零!")', 
          explanation: '展示了基本的异常处理', order_num: 1 },
        { id: 13, lesson_id: 13, code: '# 类定义示例\nclass Dog:\n    def __init__(self, name):\n        self.name = name\n    \n    def bark(self):\n        return "Woof!"\n\nmy_dog = Dog("Buddy")\nprint(my_dog.name)\nprint(my_dog.bark())', 
          explanation: '展示了类的定义和使用', order_num: 1 }
    ];
    
   
    const exerciseSolutions = [
        { id: 1, lesson_id: 4, code: '# 第一个Python程序\nprint("Hello, World!")', 
          explanation: '这是最简单的Python程序，输出Hello, World!' },
        { id: 2, lesson_id: 8, code: '# 基本语法练习\nage = 25\nname = "Your Name"\npower = 10 ** 3\nis_adult = age > 18\n\nprint(f"age: {age}, type: {type(age)}")\nprint(f"name: {name}, type: {type(name)}")\nprint(f"power: {power}, type: {type(power)}")\nprint(f"is_adult: {is_adult}, type: {type(is_adult)}")', 
          explanation: '展示了变量赋值和类型检查' },
        { id: 3, lesson_id: 13, code: '# 数据类型练习\nfruits = ["apple", "banana", "cherry"]\nperson = {"name": "Alice", "age": 25}\nfruits.append("orange")\nperson["age"] = 26\neven_numbers = {2, 4, 6, 8, 10}\n\nprint(fruits)\nprint(person)\nprint(even_numbers)', 
          explanation: '展示了列表、字典和集合的操作' },
        { id: 4, lesson_id: 16, code: '# 控制流程练习\n# 1. 判断奇偶数\nnum = int(input("请输入一个数字: "))\nif num % 2 == 0:\n    print("偶数")\nelse:\n    print("奇数")\n\n# 2. 计算1到100的和\ntotal = 0\nfor i in range(1, 101):\n    total += i\nprint(f"1到100的和是: {total}")\n\n# 3. 打印1到100的质数\nprint("1到100的质数:")\nfor num in range(2, 101):\n    is_prime = True\n    for i in range(2, int(num**0.5)+1):\n        if num % i == 0:\n            is_prime = False\n            break\n    if is_prime:\n        print(num, end=" ")', 
          explanation: '展示了条件判断和循环的综合应用' },
        { id: 5, lesson_id: 19, code: '# 函数练习\n# 1. 计算圆面积\ndef circle_area(radius):\n    return 3.14159 * radius ** 2\n\n# 2. 计算任意数量数字的和\ndef sum_numbers(*args):\n    return sum(args)\n\n# 3. 递归计算阶乘\ndef factorial(n):\n    return 1 if n == 0 else n * factorial(n-1)\n\nprint(circle_area(5))\nprint(sum_numbers(1, 2, 3, 4, 5))\nprint(factorial(5))', 
          explanation: '展示了函数的定义和使用' },
        { id: 6, lesson_id: 22, code: '# 模块和包练习\n# 1. 自定义模块 (保存为my_module.py)\n"""\ndef greet(name):\n    return f"Hello, {name}!"\n\ndef add(a, b):\n    return a + b\n"""\n\n# 2. 使用pip安装requests\n# 在命令行运行: pip install requests\n\n# 3. 显示当前时间\nfrom datetime import datetime\nprint("当前时间:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))', 
          explanation: '展示了模块和包的使用' },
        { id: 7, lesson_id: 25, code: '# 文件操作练习\n# 1. 统计单词数量\nwith open("sample.txt", "r") as f:\n    content = f.read()\n    word_count = len(content.split())\n    print(f"单词数量: {word_count}")\n\n# 2. 保存用户输入\nuser_input = input("请输入要保存的内容: ")\nwith open("user_content.txt", "w") as f:\n    f.write(user_input)\n\n# 3. 遍历目录\nimport os\nfor root, dirs, files in os.walk("."):\n    for file in files:\n        print(os.path.join(root, file))', 
          explanation: '展示了文件操作和目录遍历' },
        { id: 8, lesson_id: 28, code: '# 异常处理练习\n# 1. 处理除零错误\ntry:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print("不能除以零!")\n\n# 2. 自定义异常\nclass MyCustomError(Exception):\n    def __init__(self, message):\n        self.message = message\n\n# 3. 处理文件不存在异常\ntry:\n    with open("nonexistent.txt", "r") as f:\n        content = f.read()\nexcept FileNotFoundError:\n    print("文件不存在!")', 
          explanation: '展示了异常处理机制' },
        { id: 9, lesson_id: 31, code: '# 面向对象编程练习\n# 1. Person类\nclass Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\n# 2. Student类继承Person\nclass Student(Person):\n    def __init__(self, name, age, grade):\n        super().__init__(name, age)\n        self.grade = grade\n\n# 3. 多态示例\nclass Animal:\n    def speak(self):\n        pass\n\nclass Dog(Animal):\n    def speak(self):\n        return "Woof!"\n\nclass Cat(Animal):\n    def speak(self):\n        return "Meow!"\n\n# 测试\np = Person("Alice", 25)\ns = Student("Bob", 20, "A")\nprint(p.name, p.age)\nprint(s.name, s.age, s.grade)\n\nanimals = [Dog(), Cat()]\nfor animal in animals:\n    print(animal.speak())', 
          explanation: '展示了面向对象编程的特性' },
        { id: 10, lesson_id: 34, code: '# 常用库练习\n# 1. 使用requests获取网页\nimport requests\nresponse = requests.get("https://www.example.com")\nprint(response.status_code)\n\n# 2. 使用matplotlib绘图\nimport matplotlib.pyplot as plt\nx = [1, 2, 3, 4]\ny = [10, 20, 25, 30]\nplt.plot(x, y)\nplt.title("Simple Plot")\nplt.show()\n\n# 3. 解析JSON\nimport json\ndata = \'{"name": "Alice", "age": 25}\'\nparsed = json.loads(data)\nprint(parsed["name"], parsed["age"])', 
          explanation: '展示了常用库的使用' }
    ];
    
    
    const executeOperations = async () => {
        try {
            // 添加章节
            await bulkAdd('chapters', chapters);
            
            // 添加课程
            await bulkAdd('lessons', lessons);
            
            // 添加代码示例
            await bulkAdd('code_examples', codeExamples);
            
            // 添加练习答案
            await bulkAdd('exercise_solutions', exerciseSolutions);
            
            alert('数据库初始化成功！教学内容已加载');
            // 默认激活第一章
            loadChapter(1);
        } catch (error) {
            console.error('数据库初始化失败:', error);
            alert('数据库初始化失败: ' + error.message);
        }
    };
    
    
    executeOperations();
}


function bulkAdd(storeName, items) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        transaction.oncomplete = function() {
            console.log(`所有${storeName}数据添加完成`);
            resolve();
        };
        
        transaction.onerror = function(event) {
            console.error(`${storeName}事务错误:`, event.target.error);
            reject(event.target.error);
        };
        
        items.forEach(item => {
            const request = store.add(item);
            
            request.onerror = function(event) {
                console.error(`添加${storeName}项失败:`, event.target.error);
            };
        });
    });
}


function submitExercise() {
    const solution = document.getElementById('exercise-solution').value.trim();
    const feedback = document.getElementById('exercise-feedback');
    
    if (!solution) {
        feedback.innerHTML = `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-circle"></i> 请输入你的解决方案后再提交
            </div>
        `;
        return;
    }
    
    feedback.innerHTML = `
        <div class="alert alert-success">
            <i class="fas fa-check-circle"></i> 答案已提交！系统会检查你的代码是否正确执行
        </div>
    `;
}


function showSolution() {
    if (!currentLessonId) return;
    
    const transaction = db.transaction(['exercise_solutions'], 'readonly');
    const store = transaction.objectStore('exercise_solutions');
    const index = store.index('lesson_id');
    const request = index.get(parseInt(currentLessonId));
    
    request.onsuccess = function() {
        const solution = request.result;
        const solutionArea = document.getElementById('exercise-solution-area');
        
        if (solution) {
            solutionArea.style.display = 'block';
            document.getElementById('exercise-solution-code').textContent = solution.code;
        } else {
            solutionArea.style.display = 'block';
            document.getElementById('exercise-solution-code').textContent = '暂无参考答案';
        }
    };
}


function copyCode() {
    const codeContent = document.getElementById('code-content');
    const range = document.createRange();
    range.selectNode(codeContent);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            const copyBtn = document.getElementById('copy-code-btn');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> 已复制';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        } else {
            alert('复制失败，请手动选择代码后复制');
        }
    } catch (err) {
        alert('复制失败，请手动选择代码后复制');
    }
    
    window.getSelection().removeAllRanges();
}

// 完整的练习题库数据
const practiceQuestions = {
    1: [ // Python简介
        {
            id: 1,
            type: 'choice',
            question: 'Python是一种什么类型的编程语言？',
            options: ['编译型语言', '解释型语言', '汇编语言', '机器语言'],
            answer: 1,
            explanation: 'Python是解释型语言，代码在运行时由解释器逐行执行。'
        },
        {
            id: 2,
            type: 'judge',
            question: 'Python是开源免费的编程语言。',
            answer: true,
            explanation: 'Python是开源的，可以免费使用和分发。'
        },
        {
            id: 3,
            type: 'choice',
            question: 'Python的设计哲学强调什么？',
            options: ['代码执行速度', '代码的可读性', '内存占用', '并发性能'],
            answer: 1,
            explanation: 'Python强调代码的可读性和简洁性。'
        },
        {
            id: 4,
            type: 'judge',
            question: 'Python只能用于Web开发。',
            answer: false,
            explanation: 'Python可用于Web开发、数据分析、人工智能、科学计算等多个领域。'
        },
        {
            id: 5,
            type: 'choice',
            question: '以下哪个不是Python的主要应用领域？',
            options: ['人工智能', '区块链', '系统编程', '数据分析'],
            answer: 2,
            explanation: 'Python不常用于系统编程，更多用于应用层开发。'
        },
        {
            id: 6,
            type: 'judge',
            question: 'Python是强类型语言。',
            answer: true,
            explanation: 'Python是强类型语言，变量类型在运行时确定且不能随意转换。'
        },
        {
            id: 7,
            type: 'choice',
            question: 'Python的创始人是？',
            options: ['Guido van Rossum', 'Linus Torvalds', 'James Gosling', 'Bjarne Stroustrup'],
            answer: 0,
            explanation: 'Python由Guido van Rossum于1991年创建。'
        },
        {
            id: 8,
            type: 'judge',
            question: 'Python 2和Python 3完全兼容。',
            answer: false,
            explanation: 'Python 2和Python 3有一些不兼容的语法差异。'
        },
        {
            id: 9,
            type: 'choice',
            question: 'Python的文件扩展名通常是？',
            options: ['.java', '.py', '.python', '.pt'],
            answer: 1,
            explanation: 'Python源文件的扩展名是.py。'
        },
        {
            id: 10,
            type: 'judge',
            question: 'Python支持面向对象编程。',
            answer: true,
            explanation: 'Python完全支持面向对象编程范式。'
        }
    ],
    2: [ // 基础语法
        {
            id: 1,
            type: 'choice',
            question: 'Python中使用什么符号表示注释？',
            options: ['//', '#', '--', '/* */'],
            answer: 1,
            explanation: 'Python使用#符号表示单行注释。'
        },
        {
            id: 2,
            type: 'judge',
            question: 'Python语句必须以分号结尾。',
            answer: false,
            explanation: 'Python语句不需要以分号结尾，换行即表示语句结束。'
        },
        {
            id: 3,
            type: 'choice',
            question: '以下哪个是Python的合法变量名？',
            options: ['2var', 'var-name', '_var', 'class'],
            answer: 2,
            explanation: '变量名可以以下划线开头，但不能以数字开头或使用关键字。'
        },
        {
            id: 4,
            type: 'judge',
            question: 'Python中可以使用switch语句。',
            answer: false,
            explanation: 'Python没有switch语句，可以使用if-elif-else或字典代替。'
        },
        {
            id: 5,
            type: 'choice',
            question: 'Python的缩进规则是？',
            options: ['可选', '必须的', '只在函数中需要', '只在类中需要'],
            answer: 1,
            explanation: 'Python使用缩进来表示代码块，这是强制性的语法规则。'
        },
        {
            id: 6,
            type: 'judge',
            question: 'Python中变量使用前必须声明类型。',
            answer: false,
            explanation: 'Python是动态类型语言，变量不需要声明类型。'
        },
        {
            id: 7,
            type: 'choice',
            question: '以下哪个是Python的关键字？',
            options: ['function', 'def', 'method', 'define'],
            answer: 1,
            explanation: 'def是Python中定义函数的关键字。'
        },
        {
            id: 8,
            type: 'judge',
            question: 'Python中可以使用++运算符。',
            answer: false,
            explanation: 'Python没有++运算符，可以使用+=1代替。'
        },
        {
            id: 9,
            type: 'choice',
            question: 'Python的多行注释使用什么符号？',
            options: ['/* */', '///', '三个单引号或双引号', '# #'],
            answer: 2,
            explanation: 'Python使用三个单引号或双引号表示多行字符串，常被用作多行注释。'
        },
        {
            id: 10,
            type: 'judge',
            question: 'Python中True和False必须首字母大写。',
            answer: true,
            explanation: 'Python中的布尔值True和False必须首字母大写。'
        }
    ],
    3: [ // 数据类型
        {
            id: 1,
            type: 'choice',
            question: '以下哪个不是Python的基本数据类型？',
            options: ['int', 'string', 'char', 'float'],
            answer: 2,
            explanation: 'Python没有单独的char类型，字符用字符串表示。'
        },
        {
            id: 2,
            type: 'judge',
            question: 'Python中列表是可变的。',
            answer: true,
            explanation: '列表是可变序列，可以修改其中的元素。'
        },
        {
            id: 3,
            type: 'choice',
            question: '以下哪个创建的是元组？',
            options: ['[1,2,3]', '(1,2,3)', '{1,2,3}', '{"a":1}'],
            answer: 1,
            explanation: '元组使用圆括号创建。'
        },
        {
            id: 4,
            type: 'judge',
            question: '字典的键可以是任何数据类型。',
            answer: false,
            explanation: '字典的键必须是不可变类型，如数字、字符串、元组。'
        },
        {
            id: 5,
            type: 'choice',
            question: '集合的主要特点是什么？',
            options: ['有序', '可重复', '无序且不重复', '键值对'],
            answer: 2,
            explanation: '集合是无序的，且元素不重复。'
        },
        {
            id: 6,
            type: 'judge',
            question: '字符串在Python中是不可变的。',
            answer: true,
            explanation: '字符串创建后不能修改，任何修改都会创建新的字符串。'
        },
        {
            id: 7,
            type: 'choice',
            question: '以下哪个可以表示空值？',
            options: ['0', '""', 'None', '[]'],
            answer: 2,
            explanation: 'None是Python中表示空值的特殊常量。'
        },
        {
            id: 8,
            type: 'judge',
            question: '元组比列表占用更多内存。',
            answer: false,
            explanation: '元组通常比列表占用更少内存，因为不可变。'
        },
        {
            id: 9,
            type: 'choice',
            question: '以下哪个是浮点数？',
            options: ['10', '10.0', '"10"', '10L'],
            answer: 1,
            explanation: '10.0是浮点数，10是整数。'
        },
        {
            id: 10,
            type: 'judge',
            question: '布尔值True在数值上等于1。',
            answer: true,
            explanation: '在数值运算中，True被当作1，False被当作0。'
        }
    ],
    4: [ // 控制流程
        {
            id: 1,
            type: 'choice',
            question: '以下哪个是条件语句的关键字？',
            options: ['for', 'if', 'while', 'def'],
            answer: 1,
            explanation: 'if是条件语句的关键字。'
        },
        {
            id: 2,
            type: 'judge',
            question: 'Python中有do-while循环。',
            answer: false,
            explanation: 'Python没有do-while循环，只有while和for循环。'
        },
        {
            id: 3,
            type: 'choice',
            question: 'break语句的作用是？',
            options: ['跳过当前迭代', '终止整个循环', '继续下一次迭代', '抛出异常'],
            answer: 1,
            explanation: 'break用于完全终止循环。'
        },
        {
            id: 4,
            type: 'judge',
            question: 'else子句可以和while循环一起使用。',
            answer: true,
            explanation: 'while循环可以有else子句，在循环正常结束时执行。'
        },
        {
            id: 5,
            type: 'choice',
            question: '以下哪个是无限循环？',
            options: ['while True:', 'for i in range(10):', 'while x < 10:', 'for i in list:'],
            answer: 0,
            explanation: 'while True: 会一直循环，除非遇到break。'
        },
        {
            id: 6,
            type: 'judge',
            question: 'pass语句什么都不做。',
            answer: true,
            explanation: 'pass是空语句，用于占位。'
        },
        {
            id: 7,
            type: 'choice',
            question: '以下哪个用于异常处理？',
            options: ['if-else', 'try-except', 'switch-case', 'do-while'],
            answer: 1,
            explanation: 'try-except用于异常处理。'
        },
        {
            id: 8,
            type: 'judge',
            question: 'for循环可以遍历任何可迭代对象。',
            answer: true,
            explanation: 'for循环可以遍历列表、元组、字符串、字典等可迭代对象。'
        },
        {
            id: 9,
            type: 'choice',
            question: 'continue语句的作用是？',
            options: ['终止循环', '跳过当前迭代', '抛出异常', '定义函数'],
            answer: 1,
            explanation: 'continue跳过当前迭代，继续下一次循环。'
        },
        {
            id: 10,
            type: 'judge',
            question: 'Python支持switch-case语句。',
            answer: false,
            explanation: 'Python没有switch-case语句，使用if-elif-else代替。'
        }
    ],
    5: [ // 函数
        {
            id: 1,
            type: 'choice',
            question: '定义函数使用什么关键字？',
            options: ['function', 'def', 'define', 'func'],
            answer: 1,
            explanation: 'Python使用def关键字定义函数。'
        },
        {
            id: 2,
            type: 'judge',
            question: '函数必须有返回值。',
            answer: false,
            explanation: '函数可以没有返回值，默认返回None。'
        },
        {
            id: 3,
            type: 'choice',
            question: '以下哪个是匿名函数？',
            options: ['def func():', 'lambda', 'function()', 'anon()'],
            answer: 1,
            explanation: 'lambda用于创建匿名函数。'
        },
        {
            id: 4,
            type: 'judge',
            question: 'Python函数可以返回多个值。',
            answer: true,
            explanation: '实际上返回的是元组，但可以解包为多个变量。'
        },
        {
            id: 5,
            type: 'choice',
            question: '函数参数的默认值在什么时候求值？',
            options: ['每次调用时', '函数定义时', '第一次调用时', '程序启动时'],
            answer: 1,
            explanation: '默认参数在函数定义时求值，只求值一次。'
        },
        {
            id: 6,
            type: 'judge',
            question: 'Python支持函数重载。',
            answer: false,
            explanation: 'Python不支持函数重载，后定义的函数会覆盖先定义的。'
        },
        {
            id: 7,
            type: 'choice',
            question: '*args的作用是？',
            options: ['接收关键字参数', '接收任意位置参数', '接收默认参数', '接收返回值'],
            answer: 1,
            explanation: '*args用于接收任意数量的位置参数。'
        },
        {
            id: 8,
            type: 'judge',
            question: '函数内部可以访问全局变量。',
            answer: true,
            explanation: '使用global关键字可以在函数内部修改全局变量。'
        },
        {
            id: 9,
            type: 'choice',
            question: '以下哪个是递归函数的特点？',
            options: ['调用其他函数', '调用自身', '没有参数', '没有返回值'],
            answer: 1,
            explanation: '递归函数会调用自身。'
        },
        {
            id: 10,
            type: 'judge',
            question: 'Python函数可以作为参数传递。',
            answer: true,
            explanation: '函数在Python中是一等公民，可以作为参数传递。'
        }
    ],
    6: [ // 模块和包
        {
            id: 1,
            type: 'choice',
            question: '导入模块使用什么关键字？',
            options: ['include', 'import', 'require', 'using'],
            answer: 1,
            explanation: 'Python使用import关键字导入模块。'
        },
        {
            id: 2,
            type: 'judge',
            question: '每个Python文件都是一个模块。',
            answer: true,
            explanation: '每个.py文件都可以作为一个模块导入。'
        },
        {
            id: 3,
            type: 'choice',
            question: '__init__.py文件的作用是？',
            options: ['定义主函数', '标识包目录', '存储配置', '定义类'],
            answer: 1,
            explanation: '__init__.py文件标识一个目录为Python包。'
        },
        {
            id: 4,
            type: 'judge',
            question: 'from module import * 会导入所有内容。',
            answer: true,
            explanation: '这种写法会导入模块中所有不以下划线开头的名称。'
        },
        {
            id: 5,
            type: 'choice',
            question: '以下哪个是Python标准库模块？',
            options: ['os', 'numpy', 'pandas', 'tensorflow'],
            answer: 0,
            explanation: 'os是Python标准库模块，其他是第三方库。'
        },
        {
            id: 6,
            type: 'judge',
            question: '模块只能导入一次。',
            answer: false,
            explanation: '模块可以多次导入，但只会执行一次初始化。'
        },
        {
            id: 7,
            type: 'choice',
            question: 'as关键字在导入时的作用是？',
            options: ['条件导入', '重命名', '选择性导入', '延迟导入'],
            answer: 1,
            explanation: 'as可以为导入的模块或函数指定别名。'
        },
        {
            id: 8,
            type: 'judge',
            question: '包可以包含子包。',
            answer: true,
            explanation: '包可以嵌套，形成层次结构。'
        },
        {
            id: 9,
            type: 'choice',
            question: 'sys.path包含什么？',
            options: ['系统路径', '模块搜索路径', '文件路径', '包路径'],
            answer: 1,
            explanation: 'sys.path包含Python解释器搜索模块的路径列表。'
        },
        {
            id: 10,
            type: 'judge',
            question: '相对导入只能在包内使用。',
            answer: true,
            explanation: '相对导入使用.和..，只能在包内的模块中使用。'
        }
    ],
    7: [ // 文件操作
        {
            id: 1,
            type: 'choice',
            question: '打开文件使用什么函数？',
            options: ['open()', 'file()', 'read()', 'load()'],
            answer: 0,
            explanation: 'open()函数用于打开文件。'
        },
        {
            id: 2,
            type: 'judge',
            question: '文件操作后必须手动关闭。',
            answer: true,
            explanation: '使用with语句可以自动关闭文件，否则需要手动close()。'
        },
        {
            id: 3,
            type: 'choice',
            question: '以下哪个模式用于写入文件？',
            options: ['r', 'w', 'a', 'x'],
            answer: 1,
            explanation: "'w'模式用于写入，会覆盖原有内容。"
        },
        {
            id: 4,
            type: 'judge',
            question: '二进制文件用"b"模式打开。',
            answer: true,
            explanation: "如'rb'、'wb'用于二进制文件操作。"
        },
        {
            id: 5,
            type: 'choice',
            question: 'readline()方法的作用是？',
            options: ['读取整个文件', '读取一行', '读取指定字节', '读取多行'],
            answer: 1,
            explanation: 'readline()每次读取一行内容。'
        },
        {
            id: 6,
            type: 'judge',
            question: '文件指针可以用seek()移动。',
            answer: true,
            explanation: 'seek()方法可以移动文件指针到指定位置。'
        },
        {
            id: 7,
            type: 'choice',
            question: '以下哪个用于追加内容？',
            options: ['r+', 'w+', 'a', 'x'],
            answer: 2,
            explanation: "'a'模式用于追加内容到文件末尾。"
        },
        {
            id: 8,
            type: 'judge',
            question: 'with语句可以自动处理文件关闭。',
            answer: true,
            explanation: 'with语句会在代码块结束后自动关闭文件。'
        },
        {
            id: 9,
            type: 'choice',
            question: '读取JSON文件使用什么模块？',
            options: ['xml', 'json', 'yaml', 'csv'],
            answer: 1,
            explanation: 'json模块用于处理JSON格式文件。'
        },
        {
            id: 10,
            type: 'judge',
            question: 'os模块可以用于文件路径操作。',
            answer: true,
            explanation: 'os.path子模块提供文件路径操作功能。'
        }
    ],
    8: [ // 异常处理
        {
            id: 1,
            type: 'choice',
            question: '异常处理使用什么结构？',
            options: ['if-else', 'for-else', 'try-except', 'while-else'],
            answer: 2,
            explanation: 'try-except用于捕获和处理异常。'
        },
        {
            id: 2,
            type: 'judge',
            question: '所有异常都必须被捕获。',
            answer: false,
            explanation: '不是所有异常都需要捕获，有些应该让程序终止。'
        },
        {
            id: 3,
            type: 'choice',
            question: '以下哪个是基础异常类？',
            options: ['Exception', 'Error', 'BaseException', 'Throwable'],
            answer: 2,
            explanation: 'BaseException是所有异常的基类。'
        },
        {
            id: 4,
            type: 'judge',
            question: '可以同时捕获多种异常。',
            answer: true,
            explanation: '可以使用元组指定多种异常类型。'
        },
        {
            id: 5,
            type: 'choice',
            question: 'finally块什么时候执行？',
            options: ['异常发生时', '无异常时', '总是执行', '永不执行'],
            answer: 2,
            explanation: 'finally块无论是否发生异常都会执行。'
        },
        {
            id: 6,
            type: 'judge',
            question: '可以自定义异常类。',
            answer: true,
            explanation: '可以通过继承Exception类创建自定义异常。'
        },
        {
            id: 7,
            type: 'choice',
            question: '抛出异常使用什么关键字？',
            options: ['throw', 'raise', 'except', 'catch'],
            answer: 1,
            explanation: 'raise用于主动抛出异常。'
        },
        {
            id: 8,
            type: 'judge',
            question: 'else块在try-except中是可选的。',
            answer: true,
            explanation: 'else块在没有异常时执行，是可选的。'
        },
        {
            id: 9,
            type: 'choice',
            question: '以下哪个是常见的异常？',
            options: ['ValueError', 'AllError', 'SomeError', 'MyError'],
            answer: 0,
            explanation: 'ValueError是Python内置的常见异常类型。'
        },
        {
            id: 10,
            type: 'judge',
            question: '异常可以被重新抛出。',
            answer: true,
            explanation: '在except块中可以使用raise重新抛出异常。'
        }
    ],
    9: [ // 面向对象编程
        {
            id: 1,
            type: 'choice',
            question: '定义类使用什么关键字？',
            options: ['class', 'def', 'object', 'type'],
            answer: 0,
            explanation: 'class关键字用于定义类。'
        },
        {
            id: 2,
            type: 'judge',
            question: 'Python支持多重继承。',
            answer: true,
            explanation: 'Python支持一个类继承多个父类。'
        },
        {
            id: 3,
            type: 'choice',
            question: '类的初始化方法是什么？',
            options: ['__init__', '__new__', '__start__', '__begin__'],
            answer: 0,
            explanation: '__init__是类的初始化方法。'
        },
        {
            id: 4,
            type: 'judge',
            question: '所有类都继承自object类。',
            answer: true,
            explanation: '在Python 3中，所有类都隐式继承自object类。'
        },
        {
            id: 5,
            type: 'choice',
            question: '实例方法的第一个参数通常叫什么？',
            options: ['self', 'this', 'cls', 'obj'],
            answer: 0,
            explanation: 'self是实例方法的第一个参数，代表实例本身。'
        },
        {
            id: 6,
            type: 'judge',
            question: '私有属性用双下划线开头。',
            answer: true,
            explanation: '名称以双下划线开头表示私有属性。'
        },
        {
            id: 7,
            type: 'choice',
            question: '类方法的装饰器是什么？',
            options: ['@staticmethod', '@classmethod', '@instancemethod', '@method'],
            answer: 1,
            explanation: '@classmethod用于定义类方法。'
        },
        {
            id: 8,
            type: 'judge',
            question: '属性可以通过property装饰器定义。',
            answer: true,
            explanation: '@property可以将方法转换为属性。'
        },
        {
            id: 9,
            type: 'choice',
            question: '以下哪个是特殊方法？',
            options: ['__str__', '__main__', '__file__', '__name__'],
            answer: 0,
            explanation: '__str__用于定义对象的字符串表示。'
        },
        {
            id: 10,
            type: 'judge',
            question: 'Python支持抽象基类。',
            answer: true,
            explanation: 'abc模块提供了抽象基类的支持。'
        }
    ],
    10: [ // 常用库介绍
        {
            id: 1,
            type: 'choice',
            question: '以下哪个用于数学计算？',
            options: ['math', 'random', 'datetime', 'os'],
            answer: 0,
            explanation: 'math模块提供数学计算函数。'
        },
        {
            id: 2,
            type: 'judge',
            question: 'random模块可以生成随机数。',
            answer: true,
            explanation: 'random模块用于生成各种随机数。'
        },
        {
            id: 3,
            type: 'choice',
            question: '处理日期和时间使用什么模块？',
            options: ['time', 'date', 'datetime', 'calendar'],
            answer: 2,
            explanation: 'datetime模块用于处理日期和时间。'
        },
        {
            id: 4,
            type: 'judge',
            question: 'os模块可以执行系统命令。',
            answer: true,
            explanation: 'os.system()可以执行系统命令。'
        },
        {
            id: 5,
            type: 'choice',
            question: '以下哪个用于正则表达式？',
            options: ['re', 'regex', 'pattern', 'match'],
            answer: 0,
            explanation: 're模块提供正则表达式功能。'
        },
        {
            id: 6,
            type: 'judge',
            question: 'sys模块可以访问命令行参数。',
            answer: true,
            explanation: 'sys.argv包含命令行参数。'
        },
        {
            id: 7,
            type: 'choice',
            question: '处理URL使用什么模块？',
            options: ['url', 'urllib', 'http', 'web'],
            answer: 1,
            explanation: 'urllib模块用于URL处理。'
        },
        {
            id: 8,
            type: 'judge',
            question: 'collections模块提供特殊容器类型。',
            answer: true,
            explanation: 'collections模块提供了deque、Counter等特殊容器。'
        },
        {
            id: 9,
            type: 'choice',
            question: '以下哪个用于数据序列化？',
            options: ['json', 'xml', 'pickle', '所有以上'],
            answer: 3,
            explanation: 'json、xml、pickle都可用于数据序列化。'
        },
        {
            id: 10,
            type: 'judge',
            question: 'itertools模块提供迭代器工具。',
            answer: true,
            explanation: 'itertools模块提供了各种迭代器相关的函数。'
        }
    ]
};
// 练习页面功能
class PracticeSystem {
    constructor() {
        this.currentChapter = null;
        this.currentQuestionIndex = 0;
        this.currentQuestions = [];
        this.userAnswers = {}; // 记录用户答案
        this.chapterScores = this.getStoredScores(); // 章节得分
        this.chapterAttempts = this.getStoredAttempts(); // 章节尝试次数
        this.init();
    }

    init() {
        this.renderChapterGrid();
        this.bindEvents();
        this.updateSidebarStatus();
    }

    getStoredScores() {
        return JSON.parse(localStorage.getItem('chapterScores')) || {};
    }

    getStoredAttempts() {
        return JSON.parse(localStorage.getItem('chapterAttempts')) || {};
    }

    saveScores() {
        localStorage.setItem('chapterScores', JSON.stringify(this.chapterScores));
        localStorage.setItem('chapterAttempts', JSON.stringify(this.chapterAttempts));
    }

    renderChapterGrid() {
        const grid = document.getElementById('chapter-exercises');
        grid.innerHTML = '';
        
        for (let i = 1; i <= 10; i++) {
            const isUnlocked = this.isChapterUnlocked(i);
            const score = this.chapterScores[i] || 0;
            const attempts = this.chapterAttempts[i] || 0;
            const maxAttempts = 2;
            
            const chapterCard = document.createElement('div');
            chapterCard.className = `chapter-exercise-card ${!isUnlocked ? 'locked' : ''}`;
            chapterCard.innerHTML = `
                <div class="exercise-card-content">
                    ${!isUnlocked ? '<div class="lock-icon"><i class="fas fa-lock"></i></div>' : ''}
                    <h5>第${i}章</h5>
                    <p>${this.getChapterTitle(i)}</p>
                    <div class="exercise-stats">
                        ${score > 0 ? `<div class="score">得分: ${score}%</div>` : ''}
                        ${attempts > 0 ? `<div class="attempts">尝试: ${attempts}/${maxAttempts}</div>` : ''}
                    </div>
                    ${!isUnlocked ? '<div class="lock-message">完成前一章解锁</div>' : ''}
                </div>
            `;
            
            if (isUnlocked && attempts < 2) {
                chapterCard.addEventListener('click', () => this.startChapterPractice(i));
            } else if (attempts >= 2) {
                chapterCard.classList.add('max-attempts');
                chapterCard.innerHTML += '<div class="max-attempts-msg">已达最大尝试次数</div>';
            }
            grid.appendChild(chapterCard);
        }
    }

    isChapterUnlocked(chapterId) {
        if (chapterId === 1) return true; // 第一章默认解锁
        
        const prevChapter = chapterId - 1;
        const prevScore = this.chapterScores[prevChapter] || 0;
        const prevAttempts = this.chapterAttempts[prevChapter] || 0;
        
        // 前一章得分超过60%且尝试次数未用完
        return prevScore >= 60 && prevAttempts <= 2;
    }

    getChapterTitle(chapterId) {
        const titles = {
            1: 'Python简介', 2: '基础语法', 3: '数据类型', 4: '控制流程',
            5: '函数', 6: '模块和包', 7: '文件操作', 8: '异常处理',
            9: '面向对象编程', 10: '常用库介绍'
        };
        return titles[chapterId] || `第${chapterId}章`;
    }

    updateSidebarStatus() {
        document.querySelectorAll('.chapter-link').forEach(link => {
            const chapterId = parseInt(link.dataset.chapterId);
            const isUnlocked = this.isChapterUnlocked(chapterId);
            
            if (!isUnlocked) {
                link.innerHTML += ' <i class="fas fa-lock ms-1" style="font-size: 12px;"></i>';
                link.style.opacity = '0.6';
            } else {
                const score = this.chapterScores[chapterId];
                if (score) {
                    link.innerHTML += ` <span class="score-badge">${score}%</span>`;
                }
            }
        });
    }

    bindEvents() {
        // 侧边栏章节点击
        document.querySelectorAll('.chapter-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const chapterId = parseInt(e.target.closest('.chapter-link').dataset.chapterId);
                if (this.isChapterUnlocked(chapterId)) {
                    this.startChapterPractice(chapterId);
                } else {
                    alert('请先完成前一章并获得60%以上的分数来解锁此章节！');
                }
            });
        });

        // 上一题/下一题按钮
        document.getElementById('prev-question').addEventListener('click', () => this.prevQuestion());
        document.getElementById('next-question').addEventListener('click', () => this.nextQuestion());
        
        // 提交答案按钮
        document.getElementById('submit-answer').addEventListener('click', () => this.submitAnswer());
        
        // 查看解析按钮
        document.getElementById('show-explanation').addEventListener('click', () => this.showExplanation());
    }

    startChapterPractice(chapterId) {
        const attempts = this.chapterAttempts[chapterId] || 0;
        if (attempts >= 2) {
            alert('本章节已尝试2次，无法再次练习！');
            return;
        }

        this.currentChapter = chapterId;
        this.currentQuestions = practiceQuestions[chapterId] || [];
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        
        document.getElementById('chapter-exercises').style.display = 'none';
        document.getElementById('question-area').style.display = 'block';
        document.getElementById('practice-title').textContent = `第${chapterId}章练习 - ${this.getChapterTitle(chapterId)}`;
        
        this.showQuestion();
        this.updateNavigationButtons();
    }

    showQuestion() {
        if (this.currentQuestions.length === 0) return;
        
        const question = this.currentQuestions[this.currentQuestionIndex];
        const questionNum = this.currentQuestionIndex + 1;
        
        document.getElementById('question-title').textContent = `第${questionNum}题: ${question.question}`;
        document.getElementById('question-type').textContent = question.type === 'choice' ? '选择题' : '判断题';
        document.getElementById('question-chapter').textContent = `第${this.currentChapter}章`;
        
        this.renderAnswerOptions(question);
        this.resetFeedback();
        
        // 恢复已保存的答案
        this.restoreUserAnswer();
    }

    renderAnswerOptions(question) {
        const answerArea = document.getElementById('answer-area');
        answerArea.innerHTML = '';
        
        if (question.type === 'choice') {
            question.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'form-check mb-2';
                optionDiv.innerHTML = `
                    <input class="form-check-input" type="radio" name="answer" id="option${index}" value="${index}">
                    <label class="form-check-label" for="option${index}">
                        ${String.fromCharCode(65 + index)}. ${option}
                    </label>
                `;
                answerArea.appendChild(optionDiv);
            });
        } else {
            // 判断题
            answerArea.innerHTML = `
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="answer" id="true" value="true">
                    <label class="form-check-label" for="true">正确</label>
                </div>
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="radio" name="answer" id="false" value="false">
                    <label class="form-check-label" for="false">错误</label>
                </div>
            `;
        }
    }

    restoreUserAnswer() {
        const questionId = this.currentQuestions[this.currentQuestionIndex].id;
        const savedAnswer = this.userAnswers[questionId];
        
        if (savedAnswer !== undefined) {
            if (typeof savedAnswer === 'boolean') {
                document.getElementById(savedAnswer.toString()).checked = true;
            } else {
                document.querySelector(`input[value="${savedAnswer}"]`).checked = true;
            }
        }
    }

    submitAnswer() {
        const selectedAnswer = this.getSelectedAnswer();
        if (selectedAnswer === null) {
            alert('请先选择一个答案！');
            return;
        }

        // 保存用户答案
        const questionId = this.currentQuestions[this.currentQuestionIndex].id;
        this.userAnswers[questionId] = selectedAnswer;

        const question = this.currentQuestions[this.currentQuestionIndex];
        const isCorrect = this.checkAnswer(selectedAnswer, question);
        
        this.showFeedback(isCorrect, question.explanation);
        
        // 如果是最后一题，检查是否可以提交章节
        if (this.currentQuestionIndex === this.currentQuestions.length - 1) {
            this.checkChapterCompletion();
        }
    }

    getSelectedAnswer() {
        const selected = document.querySelector('input[name="answer"]:checked');
        if (!selected) return null;
        
        if (selected.value === 'true') return true;
        if (selected.value === 'false') return false;
        return parseInt(selected.value);
    }

    checkAnswer(selected, question) {
        return selected === question.answer;
    }

   showFeedback(isCorrect, explanation) {
    const feedback = document.getElementById('answer-feedback');
    
    if (isCorrect) {
        // 获取当前题目ID
        const questionId = this.currentQuestions[this.currentQuestionIndex].id;
        
        // 检查是否已经答过此题
        const previouslyCorrect = this.userAnswers[questionId] === true;
        
        feedback.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check"></i>
                回答正确！
                ${!previouslyCorrect ? '<span style="color:gold;margin-left:10px;">+5金币！</span>' : ''}
            </div>
        `;
        
        // 只有第一次答对此题才给金币
        if (!previouslyCorrect) {
            // 确保调用金币系统
            if (window.coinSystem) {
                window.coinSystem.addCoins(5, '答对题目');
            } else if (typeof coinSystem !== 'undefined') {
                coinSystem.addCoins(5, '答对题目');
            } else {
                console.error('金币系统未找到！');
            }
        }
        
        // 标记此题已答对
        this.userAnswers[questionId] = true;
    } else {
        feedback.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-times"></i>
                回答错误！
            </div>
        `;
        
        const questionId = this.currentQuestions[this.currentQuestionIndex].id;
        this.userAnswers[questionId] = false;
    }
    
    feedback.style.display = 'block';
    document.getElementById('show-explanation').style.display = 'inline-block';
    document.getElementById('submit-answer').disabled = true;
    
    document.querySelectorAll('input[name="answer"]').forEach(input => {
        input.disabled = true;
    });
}

    showExplanation() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        const feedback = document.getElementById('answer-feedback');
        feedback.innerHTML += `
            <div class="alert alert-info mt-2">
                <strong>解析：</strong>${question.explanation}
            </div>
        `;
        document.getElementById('show-explanation').style.display = 'none';
    }

    resetFeedback() {
        document.getElementById('answer-feedback').style.display = 'none';
        document.getElementById('show-explanation').style.display = 'none';
        document.getElementById('submit-answer').disabled = false;
        
        document.querySelectorAll('input[name="answer"]').forEach(input => {
            input.disabled = false;
        });
    }

    prevQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion();
            this.updateNavigationButtons();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
            this.updateNavigationButtons();
        }
    }

    updateNavigationButtons() {
        document.getElementById('prev-question').disabled = this.currentQuestionIndex === 0;
        document.getElementById('next-question').disabled = this.currentQuestionIndex === this.currentQuestions.length - 1;
    }

    checkChapterCompletion() {
        const allAnswered = Object.keys(this.userAnswers).length === this.currentQuestions.length;
        if (allAnswered) {
            setTimeout(() => {
                if (confirm('您已完成所有题目，是否提交本章练习？')) {
                    this.calculateScore();
                }
            }, 500);
        }
    }

    calculateScore() {
    let correctCount = 0;
    this.currentQuestions.forEach(question => {
        const userAnswer = this.userAnswers[question.id];
        if (userAnswer !== undefined && this.checkAnswer(userAnswer, question)) {
            correctCount++;
        }
    });
    
    const score = Math.round((correctCount / this.currentQuestions.length) * 100);
    
    this.chapterScores[this.currentChapter] = score;
    this.chapterAttempts[this.currentChapter] = (this.chapterAttempts[this.currentChapter] || 0) + 1;
    this.saveScores();
    
    // 把答对题目数传给 showChapterResult
    this.showChapterResult(score, correctCount);
}

    showChapterResult(score, correctCount) {
    const totalQuestions = this.currentQuestions.length;
    const feedback = document.getElementById('answer-feedback');
    
    // 章节完成额外奖励：答对题目数 × 3金币
    const chapterBonus = correctCount * 3;
    
    feedback.innerHTML = `
        <div class="alert ${score >= 60 ? 'alert-success' : 'alert-warning'}">
            <h5><i class="fas ${score >= 60 ? 'fa-trophy' : 'fa-exclamation-triangle'}"></i> 章节完成！</h5>
            <p>得分: <strong>${score}%</strong> (${correctCount}/${totalQuestions})</p>
            <p>🎉 章节完成奖励：+${chapterBonus}金币！</p>
            <p>${score >= 60 ? '恭喜！已解锁下一章节！' : '未达到60%，请重新尝试！'}</p>
            <p>本章剩余尝试次数: ${2 - this.chapterAttempts[this.currentChapter]}</p>
        </div>
    `;
    feedback.style.display = 'block';
    
    // 给予章节完成金币奖励
    if (chapterBonus > 0) {
        coinSystem.addCoins(chapterBonus, '章节完成奖励');
    }
    
    setTimeout(() => {
        this.renderChapterGrid();
        this.updateSidebarStatus();
        document.getElementById('question-area').style.display = 'none';
        document.getElementById('chapter-exercises').style.display = 'grid';
    }, 3000);
}
}

// 初始化练习系统
if (window.location.pathname.includes('practice.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        new PracticeSystem();
    });
}