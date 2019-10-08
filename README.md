# nodejscallc

这是一个用于快速生成管道通讯序列化反序列化脚手架的工程
目前支持node调用c/c++ node调用python的模版代码生成

## 参数传递支持四种类型
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

![image](https://github.com/freelw/nodejscallc/blob/master/gif/show.gif)