const Tester = require('./build/releasejscallpython/Tester_proxy');
const tester = new Tester(
    {
        init_param_long: 567,
        init_param_float: 89.10,
        init_param_string: "",
        init_param_vector_string: ["v_init_string0", "v_init_string1", ''],
        init_param_vector_long: [654, 321],
        init_param_vector_float: [234.3, 934.6]
    },
    {
        test_env_var: 'ok',
    },
);
console.log('start');
tester.ready(() => {
    console.log('ready');
    tester.test({
        param_long: 123,
        param_float: 456.78,
        param_string: '',
        param_vector_string: ['abc', '你好', 'xxxxxxx', '123', ''],
        param_vector_long: [123, 456],
        param_vector_float: [789.12, 482.67],
        param_buffer: Buffer.alloc(0)
    }, (rsp) => {
        console.log('[func test]rsp :', rsp);
    });
    tester.test1({}, (rsp) => {
        console.log('[func test1]rsp :', rsp);
    })
});

