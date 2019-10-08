const BenchMark = require('./build/releasejscallc/BenchMark_proxy');
const b = new BenchMark({}, {},);
console.log('start');

async function bm(block) {
    return new Promise((resolve) => {
        b.call({
            param_buffer: block
        }, resolve);
    });
}

const L = 200000;
const block_size = 1024;

b.ready(async () => {
    console.log('ready');
    const block = Buffer.alloc(block_size);
    const start = Date.now();
    for (let i = 0; i < L; ++ i) {
        await bm(block);
    }
    const end = Date.now();
    const cost = end-start;
    console.log(`loop times ${L}`);
    console.log(`block_size: ${block_size} byte`);
    console.log(`cost: ${cost} ms`);
    console.log(`band with: ${block_size*L/(cost/1000)} byte/s`);
    console.log(`latency: ${cost/L} ms`);
});
