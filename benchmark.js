const BenchMark = require('./build/releasejscallc/BenchMark_proxy');
const b = new BenchMark({}, {},);
console.log('start');

async function bm(block) {
    return new Promise((resolve) => {
        b.test({
            param_buffer: block1024
        }, resolve);
    });
}

tester.ready(async () => {
    console.log('ready');
    const block1024 = Buffer.alloc(1024);
    const start = Date.now();
    for (let i = 0; i < 20000; ++ i) {
        await bm(block1024);
    }
    const end = Date.now();
    console.log('cost : ', end-start);
});
