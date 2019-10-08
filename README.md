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

## benchmark

* cpuinfo (aws 单核)

        $ cat /proc/cpuinfo
        processor       : 0
        vendor_id       : GenuineIntel
        cpu family      : 6
        model           : 63
        model name      : Intel(R) Xeon(R) CPU E5-2676 v3 @ 2.40GHz
        stepping        : 2
        microcode       : 0x43
        cpu MHz         : 2400.064
        cache size      : 30720 KB
        physical id     : 0
        siblings        : 1
        core id         : 0
        cpu cores       : 1
        apicid          : 0
        initial apicid  : 0
        fpu             : yes
        fpu_exception   : yes
        cpuid level     : 13
        wp              : yes
        flags           : fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ht syscall nx rdtscp lm constant_tsc rep_good nopl xtopology cpuid pni pclmulqdq ssse3 fma cx16 pcid sse4_1 sse4_2 x2apic movbe popcnt tsc_deadline_timer aes xsave avx f16c rdrand hypervisor lahf_lm abm cpuid_fault invpcid_single pti fsgsbase bmi1 avx2 smep bmi2 erms invpcid xsaveopt
        bugs            : cpu_meltdown spectre_v1 spectre_v2 spec_store_bypass l1tf mds swapgs
        bogomips        : 4800.14
        clflush size    : 64
        cache_alignment : 64
        address sizes   : 46 bits physical, 48 bits virtual
        power management:

* 接口描述文件 benchmark.json

        {
            "class_name": "BenchMark",
            "init_params" : [
            ],
            "funcs" : [
                {
                    "name": "call",
                    "req_params" : [
                        {
                            "name" : "param_buffer",
                            "type" : "buffer"
                        }
                    ],
                    "rsp_params" : [
                        {
                            "name" : "rsp_param_buffer",
                            "type" : "buffer"
                        }
                    ]
                }
            ]
        }

* c++测试代码

        void call(const std::string & param_buffer, std::string & rsp_param_buffer)
        {
            // TODO:
            rsp_param_buffer = param_buffer;
        }

* 测试node调用c++

        $ node benchmark.js
        start
        ready
        loop times 200000
        block_size: 1024 byte
        cost: 13206 ms
        band width: 15508102.377707103 byte/s
        latency: 0.06603 ms

* python测试代码

        def call(param_buffer):
            # TODO:
            rsp_param_buffer = param_buffer
            return [rsp_param_buffer]

* 测试node调用python

        $ node benchmarkpython.js
        start
        ready
        loop times 200000
        block_size: 1024 byte
        cost: 17037 ms
        band width: 12020895.697599344 byte/s
        latency: 0.085185 ms

