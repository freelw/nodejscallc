function generate_serialization_code(req_params) {
    return req_params.map((param, index) => {
        const {name, type} = param;
        if (type === 'long') {
            return `
    const buffer_${index} = Buffer.alloc(4);
    buffer_${index}.writeInt32LE(req.${name});
    buffer = Buffer.concat(buffer, buffer_${index});
    `;
        } else if (type === 'string') {
            return `
    const buffer_${index} = new Buffer(req.${name});
    const str_len_${index} = buffer_${index}.length;
    const len_buffer_${index} = Buffer.alloc(4);
    len_buffer_${index}.writeInt32LE(str_len_${index});
    buffer = Buffer.concat(buffer, len_buffer_${index});
    buffer = Buffer.concat(buffer, buffer_${index});
    `;
        } else {
            throw new Error(`type '${type}' not supported.`);
        }
    }).join('');
}

function generate_deserialization_code(rsp_params) {
    return rsp_params.map((param, index) => {
        const {name, type} = param;
        if (type === 'long') {
            return `
                rsp.${name} = buffer.readInt32LE();
                buffer = buffer.slice(4);
                `;
        } else if (type === 'string') {
            return `
                const str_len_${index} = buffer.readInt32LE();
                buffer = buffer.slice(4);
                rsp.${name} = buffer.slice(0, str_len_${index});
                buffer = buffer.slice(str_len_${index});
                `;
        } else {
            throw new Error(`type '${type}' not supported.`);
        }
    }).join('');
}

function generate_js(func_name, req_params, rsp_params) {
    const serialization_code = generate_serialization_code(req_params);
    const deserialization_code = generate_deserialization_code(rsp_params);
    return `
const cp = require('child_process');
const path = require('path');
function ${func_name}() {
    const cmd = path.join(__dirname, './${func_name}');
    this.child = cp.spawn(cmd);
    this.buffer = Buffer.alloc(0);
    this.sid = 0;
    this.context = {};
    this.child.stdout.on('data', (data) => {
        this.buffer = Buffer.concat([this.buffer, data]);
        while (0 < this.buffer.length) {
            if (this.buffer.length < 12) {
                break;
            }
            const type = this.buffer.readInt32LE(); 
            const sid = this.buffer.readInt32LE();
            const buffer_len = this.buffer.readInt32LE();
            if (this.buffer.length-12 < buffer_len) {
                break;
            }
            let buffer = this.buffer.slice(12, buffer_len+12);
            const rsp = {};
            if (type === 0) {
                ${deserialization_code}
                this.context[sid].cb(rsp);
                delete this.context[sid];
            } else if (type === 1) {
                console.log(buffer);
            }
            this.buffer = this.buffer.slice(buffer_len+12);
        }
    });
    this.child.on('close', () => {
    });
}
${func_name}.prototype.call = function(req, cb) {
    const sid = this.sid++;
    this.sid %= 2147483647;
    this.context[sid] = {
        sid,
        cb
    };
    let buffer = Buffer.alloc(4);
    buffer.writeInt32LE(sid);
    ${serialization_code}

    const buffer_len = buffer.length;
    const len_buffer = Buffer.alloc(4);
    len_buffer.writeInt32LE(buffer_len);
    this.child.stdin.write(len_buffer);
    this.child.stdin.write(buffer);
}
module.exports = ${func_name};
    `;
}

module.exports = generate_js;
