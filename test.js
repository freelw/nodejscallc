const test = new (require('./build/release/test_proxy'))();


console.log('start');

test.do({
    param_long: 123,
    param_string: 'teststring',
}, (rsp) => {
    console.log('rsp : ', rsp);
});
