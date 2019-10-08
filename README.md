# nodejscallc

这是一个用于快速生成管道通讯序列化反序列化脚手架的工程
目前支持node调用c/c++ node调用python的模版代码生成

## 参数传递支持五种类型
1. long 32位整形
2. string 字符串
3. vector_long 整形数组
4. vector_string 字符串数组
5. buffer 二进制序列

## 接口定义文件为json格式
***
    {
        "class_name": "Tester", //在c或者python中要实现的类名称
        "init_params" : [       //类初始化参数列表
            {
                "name" : "init_param_long",
                "type" : "long"
            },
            {
                "name" : "init_param_float",
                "type" : "float"
            },
            {
                "name" : "init_param_string",
                "type" : "string"
            },
            {
                "name" : "init_param_vector_string",
                "type" : "vector_string"
            },
            {
                "name" : "init_param_vector_long",
                "type" : "vector_long"
            },
            {
                "name" : "init_param_vector_float",
                "type" : "vector_float"
            }
        ],
        "funcs" : [         //成员函数列表
            {
                "name": "test", //成员函数名
                "req_params" : [    //函数输入参数
                    {
                        "name" : "param_long",
                        "type" : "long"
                    },
                    {
                        "name" : "param_float",
                        "type" : "float"
                    },
                    {
                        "name" : "param_string",
                        "type" : "string"
                    },
                    {
                        "name" : "param_vector_string",
                        "type" : "vector_string"
                    },
                    {
                        "name" : "param_vector_long",
                        "type" : "vector_long"
                    },
                    {
                        "name" : "param_vector_float",
                        "type" : "vector_float"
                    },
                    {
                        "name" : "param_buffer",
                        "type" : "buffer"
                    }
                ],
                "rsp_params" : [    //函数返回参数
                    {
                        "name" : "rsp_param_string",
                        "type" : "string"
                    },
                    {
                        "name" : "rsp_param_long",
                        "type" : "long"
                    },
                    {
                        "name" : "rsp_param_float",
                        "type" : "float"
                    },
                    {
                        "name" : "rsp_param_vector_string",
                        "type" : "vector_string"
                    },
                    {
                        "name" : "rsp_param_vector_long",
                        "type" : "vector_long"
                    },
                    {
                        "name" : "rsp_param_vector_float",
                        "type" : "vector_float"
                    },
                    {
                        "name" : "rsp_param_buffer",
                        "type" : "buffer"
                    }
                ]
            },
            {
                "name": "test1",    //成员函数名
                "req_params" : [],  //函数输入参数
                "rsp_params": []    //函数返回参数
            }
        ]
    }
***

## 使用方法
1. npm i
2. node init.js -i desc.json (desc.json为接口描述文件)
3. 进入 build/c/ `make`
    * 生成的目录结构如下

            ~/nodejscallc$ tree build/
            build/
            ├── c
            │   ├── Tester_header.h
            │   ├── Tester_imp.cpp
            │   ├── Tester_init.cpp
            │   ├── Tester_pipe.cpp
            │   └── makefile
            ├── jscallc
            │   └── Tester_proxy.js
            ├── jscallpython
            │   └── Tester_proxy.js
            ├── python
            │   └── Tester_imp.py
            ├── releasejscallc
            │   ├── Tester
            │   └── Tester_proxy.js
            └── releasejscallpython
                ├── Tester_imp.py
                └── Tester_proxy.js

            6 directories, 12 files
3. 调用c++的方法
    * 进入 build/c/
    * 实现 ${类名}_init.cpp 中的init方法以获得初始化时机控制权

            void initialize(long init_param_long, float init_param_float, const std::string & init_param_string, const std::vector<std::string> & init_param_vector_string, const std::vector<int> & init_param_vector_long, const std::vector<float> & init_param_vector_float)
            {
                // TODO initialize
            }

    * 实现 ${类名}_imp.cpp 中定义的函数

            void test(long param_long, float param_float, const std::string & param_string, const std::vector<std::string> & param_vector_string, const std::vector<int> & param_vector_long, const std::vector<float> & param_vector_float, const std::string & param_buffer, std::string & rsp_param_string, long & rsp_param_long, float & rsp_param_float, std::vector<std::string> & rsp_param_vector_string, std::vector<int> & rsp_param_vector_long, std::vector<float> & rsp_param_vector_float, std::string & rsp_param_buffer)
            {
                // TODO:
            }
            void test1()
            {
                // TODO:
            }
    
    * make 编译
    * 使用`node test.js`测试

            ~/nodejscallc$ node test.js
            start
            ready
            [func test]rsp : { rsp_param_string: '',
            rsp_param_long: 0,
            rsp_param_float: 5.605193857299268e-45,
            rsp_param_vector_string: [],
            rsp_param_vector_long: [],
            rsp_param_vector_float: [],
            rsp_param_buffer: <Buffer > }
            [func test1]rsp : {}

4. 调用python的方法
    * 进入 build/python
    * 实现 ${类名}_imp.py 中的initialize方法以获得初始化时机控制权

            def initialize(init_param_long, init_param_float, init_param_string, init_param_vector_string, init_param_vector_long, init_param_vector_float):
                return []

    * 实现 ${类名}_imp.py 中定义的函数

            def test(param_long, param_float, param_string, param_vector_string, param_vector_long, param_vector_float, param_buffer):
                # TODO:
                rsp_param_string = ''
                rsp_param_long = 0
                rsp_param_float = 0.
                rsp_param_vector_string = []
                rsp_param_vector_long = []
                rsp_param_vector_float = []
                rsp_param_buffer = ''
                return [rsp_param_string, rsp_param_long, rsp_param_float, rsp_param_vector_string, rsp_param_vector_long, rsp_param_vector_float, rsp_param_buffer]
            def test1():
                # TODO:
                return []

    * 进入 build/c/ `make`
    * 使用`node testpython.js`测试

            ~/nodejscallc$ node testpython.js
            start
            ready
            [func test]rsp : { rsp_param_string: '',
            rsp_param_long: 0,
            rsp_param_float: 0,
            rsp_param_vector_string: [],
            rsp_param_vector_long: [],
            rsp_param_vector_float: [],
            rsp_param_buffer: <Buffer > }
            [func test1]rsp : {}