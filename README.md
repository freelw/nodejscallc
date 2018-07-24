# nodejscallc

这是一个用于快速生成管道通讯序列化反序列化脚手架的工程
目前支持node调用c node调用python的模版代码生成

参数传递支持四种类型
1. long 32位整形
2. string 字符串
3. vector_long 整形数组
4. vector_string 字符串数组

接口定义文件为json格式
***
    {
        "func_name" : "test", //在c或者python中要实现的函数名称
        "init_params" : [     //初始化参数列表
            {
                "name" : "init_param_long",
                "type" : "long"
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
            }
        ],
        "req_params" : [    //传入参数列表
            {
                "name" : "param_long",
                "type" : "long"
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
            }
        ],
        "rsp_params" : [    //返回参数列表
            {
                "name" : "rsp_param_string",
                "type" : "string"
            },
            {
                "name" : "rsp_param_long",
                "type" : "long"
            },
            {
                "name" : "rsp_param_vector_string",
                "type" : "vector_string"
            },
            {
                "name" : "rsp_param_vector_long",
                "type" : "vector_long"
            }
        ]

    }
***
