const test = new (require('./build/release/test_proxy'))();
console.log('start');
test.do({
    param_long: 123,
    param_string: 'teststring',
    param_vector_string: ['abc', '你好', 'xxxxxxx', '123'],
}, (rsp) => {
    console.log('rsp : ', rsp);
});
