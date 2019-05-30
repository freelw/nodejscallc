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

const version = '0.0.96';

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
        class_name,
        init_params,
        funcs,
    } = description;

    try {
        const js_c_code = generate_js(class_name, init_params, funcs, desc, version, 'c');
        const js_python_code = generate_js(class_name, init_params, funcs, desc, version, 'python');
        const {
            c_imp_code,
            c_init_code,
            c_header_code,
            c_pipe_code,
        } = generate_c(class_name, init_params, funcs, desc, version);
        const python_code = generate_python(class_name, init_params, funcs, desc, version);
        const makefile_code = generate_makefile(class_name);
        await writeFile(`./build/jscallc/${class_name}_proxy.js`, js_c_code);
        await writeFile(`./build/c/${class_name}_imp.cpp`, c_imp_code);
        await writeFile(`./build/c/${class_name}_init.cpp`, c_init_code);
        await writeFile(`./build/c/${class_name}_header.h`, c_header_code);
        await writeFile(`./build/c/${class_name}_pipe.cpp`, c_pipe_code);
        await writeFile(`./build/jscallpython/${class_name}_proxy.js`, js_python_code);
        await writeFile(`./build/python/${class_name}_imp.py`, python_code);
        await writeFile(`./build/c/makefile`, makefile_code);
    } catch (e) {
        console.trace(e);
    }
}

main();