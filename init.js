const fs = require('fs');
const mkdirp = require('mkdirp');
const program = require('commander');

const generate_js = require('./generate_js');
const generate_c = require('./generate_c');
const generate_python = require('./generate_python');
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

const version = '0.0.9';

async function main() {
    program
        .version(version)
        .option('-i, --input [value]', 'select a description file (json)')
        .parse(process.argv);
    const desc = program.input || 'desc.json';
    console.log('desc : ', desc);
    const content = await readFile(desc);
    await mkdir('./build/jscallc/');
    await mkdir('./build/c/');
    await mkdir('./build/jscallpython/');
    await mkdir('./build/python/');
    await mkdir('./build/releasejscallc/');
    await mkdir('./build/releasejscallpython/');
    const description = JSON.parse(content);
    const {
        func_name,
        req_params,
        rsp_params,
        init_params,
    } = description;

    const js_c_code = generate_js(func_name, req_params, rsp_params, init_params, desc, version, 'c');
    const js_python_code = generate_js(func_name, req_params, rsp_params, init_params, desc, version, 'python');
    const c_code = generate_c(func_name, req_params, rsp_params, init_params, desc, version);
    const python_code = generate_python(func_name, req_params, rsp_params, init_params, desc, version);
    const makefile_code = generate_makefile(func_name);

    await writeFile(`./build/jscallc/${func_name}_proxy.js`, js_c_code);
    await writeFile(`./build/c/${func_name}_imp.cpp`, c_code);
    await writeFile(`./build/jscallpython/${func_name}_proxy.js`, js_python_code);
    await writeFile(`./build/python/${func_name}_imp.py`, python_code);
    await writeFile(`./build/c/makefile`, makefile_code);
    
}

main();