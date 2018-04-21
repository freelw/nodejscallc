const fs = require('fs');
const program = require('commander');

const generate_js = require('./generate_js');
const generate_c = require('./generate_c');

function main() {
    program
        .version('0.0.1')
        .option('-i, --input [value]', 'select a description file (json)')
        .parse(process.argv);
    const desc = program.input || 'desc.json';
    console.log('desc : ', desc);
    const content = fs.readFileSync(desc);
    const description = JSON.parse(content);
    const func_name = description.func_name;
    const req_params = description.req_params;
    const rsp_params = description.rsp_params;

    generate_js(func_name, req_params, rsp_params);
    generate_c(func_name, req_params, rsp_params);


}

main();