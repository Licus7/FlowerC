// ===== 完整练习题库数据 =====
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

// ===== 练习页面功能 =====
class PracticeSystem {
    constructor() {
        this.currentChapter = null;
        this.currentQuestionIndex = 0;
        this.currentQuestions = [];
        this.userAnswers = {};
        this.chapterScores = this.getStoredScores();
        this.chapterAttempts = this.getStoredAttempts();
        
        // 延迟初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            setTimeout(() => this.init(), 100);
        }
    }

    init() {
        console.log('=== 练习系统初始化 ===');
        console.log('金币系统:', window.coinSystem ? '✅ 找到' : '❌ 未找到');
        console.log('当前金币:', localStorage.getItem('userCoins'));
        
        // 确保页面元素存在
        this.ensurePageElements();
        
        // 初始化UI
        this.renderChapterGrid();
        this.bindEvents();
        this.updateSidebarStatus();
        
        // 额外：立即检查金币显示
        setTimeout(() => {
            const coinElement = document.getElementById('simpleCoinCount');
            if (coinElement) {
                const saved = localStorage.getItem('userCoins');
                const coins = saved ? parseInt(saved) : 0;
                if (coinElement.textContent === '0' && coins > 0) {
                    console.log('🔄 app.js检测到显示错误，正在修复...');
                    coinElement.textContent = coins;
                }
            }
        }, 1000);
    }
    
    // 确保页面元素存在
    ensurePageElements() {
        // 检查必要的DOM元素
        const elements = [
            'chapter-exercises',
            'question-area',
            'practice-title',
            'question-title',
            'question-type',
            'question-chapter',
            'answer-area',
            'answer-feedback',
            'prev-question',
            'next-question',
            'submit-answer',
            'show-explanation'
        ];
        
        elements.forEach(id => {
            if (!document.getElementById(id)) {
                console.warn(`⚠️ 元素 #${id} 不存在，可能HTML结构有问题`);
            }
        });
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
        if (!grid) {
            console.error('找不到 #chapter-exercises');
            return;
        }
        
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
                chapterCard.addEventListener('click', () => {
                    console.log('点击章节:', i);
                    this.startChapterPractice(i);
                });
                chapterCard.style.cursor = 'pointer';
            } else if (attempts >= 2) {
                chapterCard.classList.add('max-attempts');
                chapterCard.innerHTML += '<div class="max-attempts-msg">已达最大尝试次数</div>';
                chapterCard.style.cursor = 'not-allowed';
            }
            grid.appendChild(chapterCard);
        }
    }

    isChapterUnlocked(chapterId) {
        if (chapterId === 1) return true;
        
        const prevChapter = chapterId - 1;
        const prevScore = this.chapterScores[prevChapter] || 0;
        const prevAttempts = this.chapterAttempts[prevChapter] || 0;
        
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
        setTimeout(() => {
            // 侧边栏章节点击
            document.querySelectorAll('.chapter-link').forEach(link => {
                const chapterId = parseInt(link.dataset.chapterId);
                
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('点击侧边栏章节:', chapterId);
                    
                    const attempts = this.chapterAttempts[chapterId] || 0;
                    if (attempts >= 2) {
                        alert('本章节已尝试2次，无法再次练习！');
                        return;
                    }
                    
                    if (this.isChapterUnlocked(chapterId)) {
                        this.startChapterPractice(chapterId);
                    } else {
                        alert('请先完成前一章并获得60%以上的分数来解锁此章节！');
                    }
                });
            });

            // 按钮事件
            const prevBtn = document.getElementById('prev-question');
            const nextBtn = document.getElementById('next-question');
            const submitBtn = document.getElementById('submit-answer');
            const explainBtn = document.getElementById('show-explanation');
            
            if (prevBtn) prevBtn.addEventListener('click', () => this.prevQuestion());
            if (nextBtn) nextBtn.addEventListener('click', () => this.nextQuestion());
            if (submitBtn) submitBtn.addEventListener('click', () => this.submitAnswer());
            if (explainBtn) explainBtn.addEventListener('click', () => this.showExplanation());
            
            console.log('✅ 事件绑定完成');
        }, 300);
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

        const questionId = this.currentQuestions[this.currentQuestionIndex].id;
        this.userAnswers[questionId] = selectedAnswer;

        const question = this.currentQuestions[this.currentQuestionIndex];
        const isCorrect = this.checkAnswer(selectedAnswer, question);
        
        this.showFeedback(isCorrect, question.explanation);
        
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
            const questionId = this.currentQuestions[this.currentQuestionIndex].id;
            const previouslyCorrect = this.userAnswers[questionId] === true;
            
            feedback.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check"></i>
                    回答正确！
                    ${!previouslyCorrect ? '<span style="color:gold;margin-left:10px;">+5金币！</span>' : ''}
                </div>
            `;
            
            // ✅ 修复：使用安全的金币添加方法
            if (!previouslyCorrect) {
                this.addCoinsSafely(5, '答对题目');
            }
            
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

    // ✅ 新增：安全的金币添加方法
    addCoinsSafely(amount, reason) {
        console.log(`尝试添加金币: ${amount}, 原因: ${reason}`);
        
        // 方法1：使用 window.addCoins
        if (typeof window.addCoins === 'function') {
            try {
                console.log('✅ 通过window.addCoins添加');
                const result = window.addCoins(amount, reason);
                console.log(`✅ 金币添加成功，总数: ${result}`);
                return true;
            } catch (error) {
                console.warn('方法失败:', error);
            }
        }
        
        // 方法2：直接操作
        console.log('使用直接操作方法');
        try {
            // 读取
            let current = 0;
            const saved = localStorage.getItem('userCoins');
            if (saved !== null) {
                const num = parseInt(saved);
                if (!isNaN(num)) current = num;
            }
            
            // 计算
            const newTotal = current + amount;
            
            // 保存
            localStorage.setItem('userCoins', newTotal.toString());
            
            // 更新显示
            const coinElement = document.getElementById('simpleCoinCount');
            if (coinElement) {
                coinElement.textContent = newTotal;
                
                // 动画
                if (amount > 0) {
                    coinElement.classList.remove('coin-gain');
                    void coinElement.offsetWidth;
                    coinElement.classList.add('coin-gain');
                }
            }
            
            console.log(`✅ 金币更新: ${current} → ${newTotal}`);
            return true;
        } catch (error) {
            console.error('添加金币失败:', error);
            return false;
        }
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
        const prevBtn = document.getElementById('prev-question');
        const nextBtn = document.getElementById('next-question');
        
        if (prevBtn) prevBtn.disabled = this.currentQuestionIndex === 0;
        if (nextBtn) nextBtn.disabled = this.currentQuestionIndex === this.currentQuestions.length - 1;
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

    // ✅ 修改：在原calculateScore函数中添加进度同步
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
        
        // ✅ 新增：同步到进度管理器（非破坏性添加）
        this.syncProgressToManager(score, correctCount);
        
        this.showChapterResult(score, correctCount);
    }
    
    // ✅ 新增：同步到进度管理器
    syncProgressToManager(score, correctCount) {
        console.log(`同步章节 ${this.currentChapter} 进度: ${score}% (${correctCount}/${this.currentQuestions.length})`);
        
        // 方法1：使用全局进度管理器
        if (window.progressManager && typeof window.progressManager.updateChapterProgress === 'function') {
            window.progressManager.updateChapterProgress(
                this.currentChapter,
                score,
                correctCount,
                this.currentQuestions.length
            );
            console.log('✅ 已同步到全局进度管理器');
        } 
        // 方法2：直接保存到新格式
        else {
            this.saveToNewProgressFormat(score, correctCount);
        }
    }
    
    // ✅ 新增：保存到新进度格式
    saveToNewProgressFormat(score, correctCount) {
        try {
            // 读取现有进度
            const existing = JSON.parse(localStorage.getItem('userProgress_v3')) || {
                chapters: {},
                bossDefeated: false,
                lastUpdated: null
            };
            
            // 更新当前章节
            existing.chapters[this.currentChapter] = {
                completed: score >= 60,
                score: score,
                accuracy: Math.round((correctCount / this.currentQuestions.length) * 100),
                questionsAnswered: correctCount,
                totalQuestions: this.currentQuestions.length,
                lastUpdated: new Date().toISOString()
            };
            
            existing.lastUpdated = new Date().toISOString();
            
            // 保存
            localStorage.setItem('userProgress_v3', JSON.stringify(existing));
            console.log('✅ 已保存到 userProgress_v3 格式');
        } catch (e) {
            console.warn('保存到新格式失败:', e);
        }
    }

    showChapterResult(score, correctCount) {
        const totalQuestions = this.currentQuestions.length;
        const feedback = document.getElementById('answer-feedback');
        
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
        
        // ✅ 章节完成也给金币
        if (chapterBonus > 0) {
            this.addCoinsSafely(chapterBonus, '章节完成奖励');
        }
        
        setTimeout(() => {
            this.renderChapterGrid();
            this.updateSidebarStatus();
            document.getElementById('question-area').style.display = 'none';
            document.getElementById('chapter-exercises').style.display = 'grid';
        }, 3000);
    }
}

// 初始化练习系统（只在练习页面）
if (window.location.pathname.includes('practice.html') || 
    window.location.pathname.includes('book/')) {
    // 延迟初始化，确保页面元素加载完成
    setTimeout(() => {
        console.log('初始化练习系统...');
        
        // 检查页面元素是否存在
        if (document.getElementById('chapter-exercises') || 
            document.getElementById('practice-title')) {
            window.practiceSystem = new PracticeSystem();
            console.log('✅ 练习系统初始化成功');
        } else {
            console.error('❌ 练习页面元素不存在，检查HTML结构');
            
            // 尝试重新初始化（可能DOM还没加载完）
            setTimeout(() => {
                if (document.getElementById('chapter-exercises')) {
                    window.practiceSystem = new PracticeSystem();
                    console.log('✅ 延迟初始化成功');
                }
            }, 500);
        }
    }, 500);
}

// ✅ 可选：添加进度管理器加载（非必须，因为profile.html已加载）
function loadProgressManagerIfNeeded() {
    if (typeof ProgressManager === 'undefined') {
        console.log('尝试加载进度管理器...');
        const script = document.createElement('script');
        script.src = '../progressManager.js'; // 根据实际路径调整
        script.onload = () => console.log('进度管理器加载完成');
        script.onerror = () => console.warn('进度管理器加载失败');
        document.head.appendChild(script);
    }
}

// 页面加载完成后尝试加载
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProgressManagerIfNeeded);
} else {
    loadProgressManagerIfNeeded();
}