const Test = require('./build/release/test_proxy');
const test = new Test(
    567,
    "initialize string",
    ["v_init_string0", "v_init_string1"]
);
console.log('start');
test.ready(() => {
    console.log('ready');
    test.do({
        param_long: 123,
        param_string: 'teststring',
        param_vector_string: ['abc', '你好', 'xxxxxxx', '123'],
    }, (rsp) => {
        console.log('rsp : ', rsp);
    });
});
