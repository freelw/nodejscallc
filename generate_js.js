const tidy_code = require('./tidy_code');

function generate_serialization_code(params) {
    return params.map((param, index) => {
        const {name, type} = param;
        if (type === 'long') {
            return `
    const buffer_${index} = Buffer.alloc(4);
    buffer_${index}.writeInt32(req.${name});
    buffer = Buffer.concat([buffer, buffer_${index}]);
    `;
        } else if (type === 'float') {
            return `
    const buffer_${index} = Buffer.alloc(4);
    buffer_${index}.writeFloat(req.${name});
    buffer = Buffer.concat([buffer, buffer_${index}]);
    `;
        } else if (type === 'buffer') {
            return `
    const buffer_${index} = req.${name};
    const buf_len_${index} = req.${name}.byteLength;
    const len_buffer_${index} = Buffer.alloc(4);
    len_buffer_${index}.writeInt32(buf_len_${index});
    buffer = Buffer.concat([buffer, len_buffer_${index}, buffer_${index}]);
    `;
        } else if (type === 'string') {
            return `
    const buffer_${index} = Buffer.alloc(Buffer.byteLength(req.${name}));
    buffer_${index}.write(req.${name});
    const str_len_${index} = Buffer.byteLength(buffer_${index});
    const len_buffer_${index} = Buffer.alloc(4);
    len_buffer_${index}.writeInt32(str_len_${index});
    buffer = Buffer.concat([buffer, len_buffer_${index}, buffer_${index}]);
    `;
        } else if (type === 'vector_string'){
            return `
    const vbuffer_${index} = Buffer.concat(req.${name}.map((str) => {
        const _len_buffer = Buffer.alloc(4);
        _len_buffer.writeInt32(Buffer.byteLength(str));
        const _buffer = Buffer.alloc(Buffer.byteLength(str));
        _buffer.write(str);
        return Buffer.concat([_len_buffer,_buffer]);
    }));
    const len_buffer_cnt_${index} = Buffer.alloc(4);
    len_buffer_cnt_${index}.writeInt32(req.${name}.length);
    const len_buffer_${index} = Buffer.alloc(4);
    len_buffer_${index}.writeInt32(vbuffer_${index}.byteLength);
    buffer = Buffer.concat([buffer, len_buffer_cnt_${index}, len_buffer_${index}, vbuffer_${index}]);
    `;
        } else if (type === 'vector_long') {
            return `
    const vbuffer_${index} = Buffer.concat(req.${name}.map((num) => {
        const _num_buffer = Buffer.alloc(4);
        _num_buffer.writeInt32(num);
        return _num_buffer;
    }));
    const len_buffer_cnt_${index} = Buffer.alloc(4);
    len_buffer_cnt_${index}.writeInt32(req.${name}.length);
    buffer = Buffer.concat([buffer, len_buffer_cnt_${index}, vbuffer_${index}]);
    `;
        } else if (type === 'vector_float') {
            return `
    const vbuffer_${index} = Buffer.concat(req.${name}.map((num) => {
        const _num_buffer = Buffer.alloc(4);
        _num_buffer.writeFloat(num);
        return _num_buffer;
    }));
    const len_buffer_cnt_${index} = Buffer.alloc(4);
    len_buffer_cnt_${index}.writeInt32(req.${name}.length);
    buffer = Buffer.concat([buffer, len_buffer_cnt_${index}, vbuffer_${index}]);
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
                rsp.${name} = buffer.readInt32();
                buffer = buffer.slice(4);
                `;
        } else if (type === 'float') {
            return `
                rsp.${name} = buffer.readFloat();
                buffer = buffer.slice(4);
                `;
        } else if (type === 'string') {
            return `
                const str_len_${index} = buffer.readInt32();
                buffer = buffer.slice(4);
                rsp.${name} = buffer.slice(0, str_len_${index}).toString();
                buffer = buffer.slice(str_len_${index});
                `;
        } else if (type === 'vector_string') {
            return `
                const v_cnt_${index} = buffer.readInt32();
                buffer = buffer.slice(4);
                const buffer_len_${index} = buffer.readInt32();
                buffer = buffer.slice(4);
                rsp.${name} = [];
                for (let i = 0; i < v_cnt_${index}; ++ i) {
                    const tmp_len = buffer.readInt32();
                    buffer = buffer.slice(4);
                    rsp.${name}.push(buffer.slice(0, tmp_len).toString());
                    buffer = buffer.slice(tmp_len);
                }
            `;
        } else if (type === 'vector_long') {
            return `
                const v_cnt_${index} = buffer.readInt32();
                buffer = buffer.slice(4);
                rsp.${name} = [];
                for (let i = 0; i < v_cnt_${index}; ++ i) {
                    const num = buffer.readInt32();
                    buffer = buffer.slice(4);
                    rsp.${name}.push(num);
                }
            `;
        } else if (type === 'vector_float') {
            return `
                const v_cnt_${index} = buffer.readInt32();
                buffer = buffer.slice(4);
                rsp.${name} = [];
                for (let i = 0; i < v_cnt_${index}; ++i) {
                    const num = buffer.readFloat();
                    buffer = buffer.slice(4);
                    rsp.${name}.push(num);
                }
            `;
        } else {
            throw new Error(`type '${type}' not supported.`);
        }
    }).join('');
}

function generate_do_code(class_name, func_map) {

    return Object.keys(func_map).map((func_name) => {
        const {
            serialization_code,
        } = func_map[func_name];

        return `
${class_name}.prototype.${func_name} = function(req, cb) {
    const sid = this.sid++;
    this.sid %= 2147483647;
    const key = sid+"${func_name}";
    this.context[key] = {
        sid,
        cb
    };
    let buffer = Buffer.alloc(4);
    buffer.writeInt32(sid);

    const buffer_${func_name} = Buffer.alloc(Buffer.byteLength("${func_name}"));
    buffer_${func_name}.write("${func_name}");
    const str_len_${func_name} = Buffer.byteLength(buffer_${func_name});
    const len_buffer_${func_name} = Buffer.alloc(4);
    len_buffer_${func_name}.writeInt32(str_len_${func_name});
    buffer = Buffer.concat([buffer, len_buffer_${func_name}, buffer_${func_name}]);

    ${serialization_code}
    const buffer_len = buffer.length;
    const len_buffer = Buffer.alloc(4);
    len_buffer.writeInt32(buffer_len);
    this.child.stdin.write(len_buffer);
    this.child.stdin.write(buffer);
}
        `;
    }).join('\n\n');
}

function generate_dispatch_code(class_name, func_map) {
    return Object.keys(func_map).map((func_name) => {
        const {
            deserialization_code
        } = func_map[func_name];
        return `
                if (func_name === "${func_name}") {
                    ${deserialization_code}
                }
        `;
    }).join('\n');
}

function generate_js(class_name, init_params, funcs, desc, version, lang) {
    const init_serialization_code = generate_serialization_code(init_params);
    const func_map = funcs.reduce((pre, func) => {
        const {
            name: func_name,
            req_params,
            rsp_params,
        } = func;
        pre[func_name] = {
            serialization_code: generate_serialization_code(req_params),
            deserialization_code: generate_deserialization_code(rsp_params),
        }
        return pre;
    }, {});

    const do_code = generate_do_code(class_name, func_map);
    const dispatch_code = generate_dispatch_code(class_name, func_map);
    
    const code = `// **********************************************************************
// This file was generated by a NodejsCallC parser!
// NodejsCallC version ${version} by liwang112358@gmail.com
// Generated from ${desc} at ${(new Date()).toString()}
// **********************************************************************

const cp = require('child_process');
const path = require('path');
const os = require('os');

const endianess = os.endianness();

Buffer.prototype.writeInt32 = function(value, offset = 0) {
    if (endianess === 'LE') {
        this.writeInt32LE(value, offset);
    } else {
        this.writeInt32BE(value, offset);
    }
};

Buffer.prototype.readInt32 = function(offset = 0) {
    if (endianess === 'LE') {
        return this.readInt32LE(offset);
    } else {
        return this.readInt32BE(offset);
    }
};

Buffer.prototype.writeFloat = function(value, offset = 0) {
    if (endianess === 'LE') {
        this.writeFloatLE(value, offset);
    } else {
        this.writeFloatBE(value, offset);
    }
};

Buffer.prototype.readFloat = function(offset = 0) {
    if (endianess === 'LE') {
        return this.readFloatLE(offset);
    } else {
        return this.readFloatBE(offset);
    }
};

function ${class_name}(init_req, init_env) {
    let cmd = '';
    if ('${lang}' === 'c') {
        cmd = path.join(__dirname, \`./${class_name}\`);
    } else if ('${lang}' === 'python') {
        const file_name = path.join(__dirname, \`./${class_name}_imp.py\`);
        cmd = \`\${file_name}\`;
    }
    this.child = cp.spawn(cmd, [], {env: init_env});
    this.buffer = Buffer.alloc(0);
    this.sid = 0;
    this.context = {};
    this.is_ready = false;
    this.on_ready = () => {};
    this.child_close = () => {
        process.exit();
    }
    this.child.stdout.on('data', (data) => {
        this.buffer = Buffer.concat([this.buffer, data]);
        while (0 < this.buffer.length) {
            if (this.buffer.length < 12) {
                break;
            }
            const type = this.buffer.readInt32(); 
            const sid = this.buffer.readInt32(4);
            const buffer_len = this.buffer.readInt32(8);
            if (this.buffer.length-12 < buffer_len) {
                break;
            }
            let buffer = this.buffer.slice(12, buffer_len+12);
            const rsp = {};
            if (type === 0) {
                const str_len_func_name = buffer.readInt32();
                buffer = buffer.slice(4);
                const func_name = buffer.slice(0, str_len_func_name).toString();
                console.log('func_name : ', func_name);
                buffer = buffer.slice(str_len_func_name);
                ${dispatch_code}
                const key = sid+func_name;
                this.context[key].cb(rsp);
                delete this.context[key];
            } else if (type === 1) {
                console.log(buffer.toString());
            } else if (type === 2) {
                this.is_ready = true;
                this.on_ready && this.on_ready();
            }
            this.buffer = this.buffer.slice(buffer_len+12);
        }
    });
    this.child.on('close', () => {
        console.log('child closed.');
        this.child_close();
    });
    this.child.stderr.on('data', (data) => {
        console.error('child error : ', data.toString());
    });
    this.initialize(init_req);
}

${do_code}

${class_name}.prototype.ready = function(cb) {
    if (this.is_ready) {
        cb();
    } else {
        this.on_ready = cb;
    }
}

${class_name}.prototype.on_child_close = function(cb) {
    if (cb) {
        this.child_close = cb;
    }
}

${class_name}.prototype.initialize = function(req) {
    let buffer = Buffer.alloc(0);
    ${init_serialization_code}
    const buffer_len = buffer.length;
    const len_buffer = Buffer.alloc(4);
    len_buffer.writeInt32(buffer_len);
    this.child.stdin.write(len_buffer);
    this.child.stdin.write(buffer);
}

module.exports = ${class_name};
    `;
    return tidy_code(code);
}

module.exports = generate_js;
