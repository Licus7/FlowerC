
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