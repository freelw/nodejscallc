const tidy_code = require('./tidy_code');

function generate_deserialization_code(params) {
    return params.map((param, index) => {
        const {name, type} = param;
        if (type === 'long') {
            return `
        (${name},) = struct.unpack('i', readed(4))
        `;
        } else if (type === 'string') {
            return `
        (len_${index},) = struct.unpack('i', readed(4))
        ${name} = readed(len_${index})
        `;
        } else if (type === 'vector_string') {
            return `
        (vector_cnt_${index},) = struct.unpack('i', readed(4))
        (vector_len_${index},) = struct.unpack('i', readed(4))
        ${name} = []
        buffer_${index} = readed(vector_len_${index})
        for i in xrange(vector_cnt_${index}):
            (_v_len_${index},) = struct.unpack('i', buffer_${index}[:4])
            buffer_${index} = buffer_${index}[4:]
            ${name}.append(buffer_${index}[:_v_len_${index}])
            buffer_${index} = buffer_${index}[_v_len_${index}:]
        `;
        } else if (type === 'vector_long') {
            return `
        (vector_cnt_${index},) = struct.unpack('i', readed(4))
        ${name} = []
        buffer_${index} = readed(vector_cnt_${index}*4)
        for i in xrange(vector_cnt_${index}):
            (cnt_${index},) = struct.unpack('i', buffer_${index}[:4])
            ${name}.append(cnt_${index})
            buffer_${index} = buffer_${index}[4:]
        `;
        } else {
            throw new Error(`type '${type}' not supported.`);
        }
    }).join('');
}

function generate_params_str_list(req_params) {
    const req_params_str_list = req_params.map((param) => {
        const {name, type} = param;
        return name;
    });
    return req_params_str_list.join(', ');
}

function generate_return_rsp_params_code(rsp_params) {
    const def_code_list = rsp_params.map((param) => {
        const {name, type} = param;
        if (type === 'long') {
            return `
    ${name} = 0`;
        } else if (type === 'string') {
            return `
    ${name} = ''`;
        } else if (type === 'vector_string') {
            return `
    ${name} = []`;
        } else if (type === 'vector_long') {
            return `
    ${name} = []`;
        } else {
            throw new Error(`type '${type}' not supported.`);
        }
    });
    const ret_code = generate_params_str_list(rsp_params);

    return `
${def_code_list.join('\n')}
    return [${ret_code}]
    `
}


function generate_def_code(func_name, req_params, rsp_params)
{
    return `
def ${func_name}(${generate_params_str_list(req_params)}):
    # TODO:
    ${generate_return_rsp_params_code(rsp_params)}
`;
}

function generate_call_code(func_name, req_params, rsp_params)
{
    const req_param_str = req_params.map(param => param.name).join(', ');
    const rsp_param_str = `[${rsp_params.map(param => param.name).join(', ')}]`;
    return `${rsp_param_str} = ${func_name}(${req_param_str})`;
}

function generate_rsp_code(rsp_params)
{
    return rsp_params.map((param, index) => {
        const {name, type} = param;
        if (type === 'long') {
            return `
        rsp_buffer += struct.pack('i', ${name})
            `;
        } else if (type === 'string') {
            return `
        str_len_${index} = len(${name})
        rsp_buffer += struct.pack('i', str_len_${index})
        rsp_buffer += ${name}
            `;
        } else if (type === 'vector_string') {
            return `
        v_cnt_${index} = len(${name})
        rsp_buffer += struct.pack('i', v_cnt_${index})
        total_len_${index} = len(${name}) * 4
        for i in xrange(len(${name})):
            total_len_${index} += len(${name}[i])
        rsp_buffer += struct.pack('i', total_len_${index})
        
        for i in xrange(len(${name})):
            tmp_len = len(${name}[i])
            rsp_buffer += struct.pack('i', tmp_len)
            rsp_buffer += ${name}[i]
        `;
        } else if (type === 'vector_long') {
            return `
        v_cnt_${index} = len(${name})
        rsp_buffer += struct.pack('i', v_cnt_${index})
        for i in xrange(len(${name})):
            rsp_buffer += struct.pack('i', ${name}[i])
        `;
        } else {
            throw new Error(`type '${type}' not supported.`);
        }
    }).join('\n');
}

function generate_initialization_args(init_params) {
    return generate_params_str_list(init_params, []);
}

function generate_python(func_name, req_params, rsp_params, init_params, desc, version)
{
    const deserialization_code = generate_deserialization_code(req_params);
    const def_code = generate_def_code(func_name, req_params, rsp_params);
    const call_code = generate_call_code(func_name, req_params, rsp_params);
    const rsp_code = generate_rsp_code(rsp_params);
    const initialization_args = generate_initialization_args(init_params);
    const init_deserialization_code = generate_deserialization_code(init_params);
    const init_call_code = generate_call_code("initialize", init_params, []);
    const code = `#!/usr/bin/env python
# -*- coding: utf-8 -*-
# **********************************************************************
# This file was generated by a NodejsCallPython parser!
# NodejsCallPython version ${version} by liwang112358@gmail.com
# Generated from ${desc} at ${(new Date()).toString()}
# **********************************************************************

import os
import sys
import struct

def initialize(${initialization_args}):
    return []
${def_code}

def readed(length):
    ret_buffer = ''
    while len(ret_buffer) < length:
        buffer = fd0.read(length - len(ret_buffer))
        if len(buffer) == 0:
            sys.exit(-1)
        ret_buffer += buffer
    return ret_buffer

def written(buffer):
    fd1.write(buffer)
    fd1.flush()

def dbg_log(msg):
    _type = 1
    sid = 0
    buffer_len = len(msg)
    written(struct.pack('i', _type))
    written(struct.pack('i', sid))
    written(struct.pack('i', buffer_len))
    written(msg)

def ready():
    _type = 2
    sid = 0
    buffer_len = 1
    written(struct.pack('i', _type))
    written(struct.pack('i', sid))
    written(struct.pack('i', buffer_len))
    written(' ')

if __name__ == '__main__':
    global fd0
    global fd1
    fd0 = os.fdopen(os.dup(sys.stdin.fileno()), "rb")
    fd1 = os.fdopen(os.dup(sys.stdout.fileno()), "wb")
    os.close(sys.stdin.fileno())
    os.close(sys.stdout.fileno())
    initialized = False
    while True:
        (buf_len,) = struct.unpack('i', readed(4))
        ${init_deserialization_code}
        ${init_call_code}
        ready()
        initialized = True
        break

    if not initialized:
        dbg_log("initialize failed.")
        sys.exit(-1)

    while True:
        (buf_len,) = struct.unpack('i', readed(4))
        (sid,) = struct.unpack('i', readed(4))
        ${deserialization_code}
        ${call_code}
        _type = 0
        written(struct.pack('i', _type))
        written(struct.pack('i', sid))
        rsp_buffer = ''
        ${rsp_code}
        rsp_buffer_len = len(rsp_buffer)
        written(struct.pack('i', rsp_buffer_len))
        written(rsp_buffer)
`;
    return tidy_code(code);
}

module.exports = generate_python;
