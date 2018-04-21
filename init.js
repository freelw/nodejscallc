const fs = require('fs');
const mkdirp = require('mkdirp');
const program = require('commander');

const generate_js = require('./generate_js');
const generate_c = require('./generate_c');
const generate_makefile = require('./generate_makefile');

async function readFile(name) {
    return new Promise((resolve, reject) => {
        fs.readFile(name, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

async function writeFile(name, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(name, data, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
async function mkdir(dir) {
    return new Promise((resolve) => {
        mkdirp(dir, resolve);
    });
}

async function main() {
    program
        .version('0.0.1')
        .option('-i, --input [value]', 'select a description file (json)')
        .parse(process.argv);
    const desc = program.input || 'desc.json';
    console.log('desc : ', desc);
    const content = await readFile(desc);
    await mkdir('./build/js/');
    await mkdir('./build/c/');
    await mkdir('./build/release/');
    const description = JSON.parse(content);
    const func_name = description.func_name;
    const req_params = description.req_params;
    const rsp_params = description.rsp_params;

    const js_code = generate_js(func_name, req_params, rsp_params);
    const c_code = generate_c(func_name, req_params, rsp_params);
    const makefile_code = generate_makefile(func_name);

    await writeFile(`./build/js/${func_name}_proxy.js`, js_code);
    await writeFile(`./build/c/${func_name}_imp.cpp`, c_code);
    await writeFile(`./build/c/makefile`, makefile_code);
}

main();