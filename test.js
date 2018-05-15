const Test = require('./build/release/test_proxy');
const test = new Test(
    {
        init_param_long: 567,
        init_param_string: "",
        init_param_vector_string: ["v_init_string0", "v_init_string1", ''],
        init_param_vector_long: [654, 321],
    },
    {
        test_env_var: 'ok',
    },
);
console.log('start');
test.ready(() => {
    console.log('ready');
    test.do({
        param_long: 123,
        param_string: '',
        param_vector_string: ['abc', '你好', 'xxxxxxx', '123', ''],
        param_vector_long: [123, 456],
    }, (rsp) => {
        console.log('rsp : ', rsp);
    });
});
