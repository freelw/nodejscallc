const tidy_code = require('./tidy_code');

function generate_deserialization_code(params) {
    return params.map((param, index) => {
        const {name, type} = param;
        if (type === 'long') {
            return `
        long ${name} = 0;
        read_size = readed(fd0, (char *)&${name}, 4);
        if (read_size < 0) {
            break;
        }`;
        } else if (type === 'float') {
            return `
        float ${name} = 0;
        read_size = readed(fd0, (char *)&${name}, 4);
        if (read_size < 0) {
            break;
        }`;
        } else if (type === 'string' || type === 'buffer') {
            return `
        long len_${index} = 0;
        read_size = readed(fd0, (char *)&len_${index}, 4);
        if (read_size < 0) {
            break;
        }
        char *buffer_${index} = new char[len_${index}];
        read_size = readed(fd0, buffer_${index}, len_${index});
        if (read_size < 0) {
            break;
        }
        std::string ${name}(buffer_${index}, len_${index});
        delete []buffer_${index};`;
        } else if (type === 'vector_string') {
            return `
        long vector_cnt_${index} = 0;
        read_size = readed(fd0, (char *)&vector_cnt_${index}, 4);
        if (read_size < 0) {
            break;
        }
        long vector_len_${index} = 0;
        read_size = readed(fd0, (char *)&vector_len_${index}, 4);
        if (read_size < 0) {
            break;
        }
        std::vector<std::string> ${name};
        ${name}.reserve(vector_cnt_${index});
        char *buffer_${index} = new char[vector_len_${index}];
        read_size = readed(fd0, buffer_${index}, vector_len_${index});
        if (read_size < 0) {
            break;
        }
        int *_v_len_${index} = (int *)buffer_${index};
        char *_buffer_${index} = (char *)buffer_${index} + 4;
        for (long i = 0; i < vector_cnt_${index}; ++ i) {
            ${name}.push_back(std::string(_buffer_${index}, *_v_len_${index}));
            _buffer_${index} += *_v_len_${index} + 4 ;
            _v_len_${index} = (int *)(_buffer_${index} - 4);
        }
        delete []buffer_${index};`;
        } else if (type === 'vector_long') {
            return `
        long vector_cnt_${index} = 0;
        read_size = readed(fd0, (char *)&vector_cnt_${index}, 4);
        if (read_size < 0) {
            break;
        }
        std::vector<int> ${name};
        ${name}.reserve(vector_cnt_${index});
        int *buffer_${index} = new int[vector_cnt_${index}];
        read_size = readed(fd0, (char *)buffer_${index}, vector_cnt_${index}*4);
        if (read_size < 0) {
            break;
        }
        for (long i = 0; i < vector_cnt_${index}; ++ i) {
            ${name}.push_back(buffer_${index}[i]);
        }
        delete []buffer_${index};`;
        } else if (type === 'vector_float') {
            return `
        long vector_cnt_${index} = 0;
        read_size = readed(fd0, (char *)&vector_cnt_${index}, 4);
        if (read_size < 0) {
            break;
        }
        std::vector<float> ${name};
        ${name}.reserve(vector_cnt_${index});
        float *buffer_${index} = new float[vector_cnt_${index}];
        read_size = readed(fd0, (char *)buffer_${index}, vector_cnt_${index}*4);
        if (read_size < 0) {
            break;
        }
        for (long i = 0; i < vector_cnt_${index}; ++ i) {
            ${name}.push_back(buffer_${index}[i]);
        }
        delete []buffer_${index};`;
        } else {
            throw new Error(`type '${type}' not supported.`);
        }
    }).join('');
}

function generate_params_str_list(req_params, rsp_params) {
    const req_params_str_list = req_params.map((param) => {
        const {name, type} = param;
        if (type === 'long') {
            return `long ${name}`;
        } else if (type === 'float') {
            return `float ${name}`;
        } else if (type === 'string' || type === 'buffer') {
            return `const std::string & ${name}`;
        } else if (type === 'vector_string') {
            return `const std::vector<std::string> & ${name}`;
        } else if (type === 'vector_long') {
            return `const std::vector<int> & ${name}`;
        } else if (type === 'vector_float') {
            return `const std::vector<float> & ${name}`;
        } else {
            throw new Error(`type '${type}' not supported.`);
        }
    });
    const rsp_params_str_list = rsp_params.map((param) => {
        const {name, type} = param;
        if (type === 'long') {
            return `long & ${name}`;
        } else if (type === 'float') {
            return `float & ${name}`;
        } else if (type === 'string') {
            return `std::string & ${name}`;
        } else if (type === 'vector_string') {
            return `std::vector<std::string> & ${name}`;
        } else if (type === 'vector_long') {
            return `std::vector<int> & ${name}`;
        } else if (type === 'vector_float') {
            return `std::vector<float> & ${name}`;
        } else {
            throw new Error(`type '${type}' not supported.`);
        }
    });
    return req_params_str_list.concat(rsp_params_str_list).join(', ');
}

function generate_def_code_without_body(func_name, req_params, rsp_params)
{
    return `void ${func_name}(${generate_params_str_list(req_params, rsp_params)})`;
}

function generate_def_code(func_name, req_params, rsp_params)
{
    
    return `
${generate_def_code_without_body(func_name, req_params, rsp_params)}
{
    // TODO:
}
`;
}

function generate_call_code(func_name, req_params, rsp_params)
{
    const param_str = req_params.concat(rsp_params).map(param => param.name).join(', ');
    return `${func_name}(${param_str});`;
}

function generate_rsp_params_def_code(rsp_params)
{
    return rsp_params.map((param) => {
        const {name, type} = param;
        if (type === 'long') {
            return `
        long ${name};
            `;
        } else if (type === 'float') {
            return `
        float ${name};
            `;
        } else if (type === 'string') {
            return `
        std::string ${name};
            `;
        } else if (type === 'vector_string') {
            return `
        std::vector<std::string> ${name};
            `;
        } else if (type === 'vector_long') {
            return `
        std::vector<int> ${name};
            `
        } else if (type === 'vector_float') {
            return `
        std::vector<float> ${name};
            `
        } else {
            throw new Error(`type '${type}' not supported.`);
        }
    }).join('\n');
}

function generate_rsp_code(rsp_params)
{
    return rsp_params.map((param, index) => {
        const {name, type} = param;
        if (type === 'long') {
            return `
        rsp_buffer.append((char*)&${name}, 4);
            `;
        } else if (type === 'float') {
            return `
        rsp_buffer.append((char*)&${name}, 4);
            `;
        } else if (type === 'string') {
            return `
        long str_len_${index} = ${name}.length();
        rsp_buffer.append((char*)&str_len_${index}, 4);
        rsp_buffer.append((char*)${name}.c_str(), str_len_${index});
            `;
        } else if (type === 'vector_string') {
            return `
        long v_cnt_${index} = ${name}.size();
        rsp_buffer.append((char*)&v_cnt_${index}, 4);
        long total_len_${index} = ${name}.size() * 4;
        for (size_t i = 0, len = ${name}.size(); i < len; ++ i) {
            total_len_${index} += ${name}[i].length();
        }
        rsp_buffer.append((char*)&total_len_${index}, 4);
        for (size_t i = 0, len = ${name}.size(); i < len; ++ i) {
            long tmp_len = (long)${name}[i].length();
            rsp_buffer.append((char *)&tmp_len, 4);
            rsp_buffer.append(${name}[i].c_str(), ${name}[i].length());
        }
        `;
        } else if (type === 'vector_long') {
            return `
        long v_cnt_${index} = ${name}.size();
        rsp_buffer.append((char*)&v_cnt_${index}, 4);
        for (size_t i = 0, len = ${name}.size(); i < len; ++ i) {
            rsp_buffer.append((char *)&${name}[i], 4);
        }
            `;
        } else if (type === 'vector_float') {
            return `
        long v_cnt_${index} = ${name}.size();
        rsp_buffer.append((char*)&v_cnt_${index}, 4);
        for (size_t i = 0, len = ${name}.size(); i < len; ++ i) {
            rsp_buffer.append((char *)&${name}[i], 4);
        }
            `;
        } else {
            throw new Error(`type '${type}' not supported.`);
        }
    }).join('\n');
}

function generate_initialization_args(init_params) {
    return generate_params_str_list(init_params, []);
}

function generate_all_def_code(func_map) {
    return Object.keys(func_map).map((func_name) => {
        const {
            def_code
        } = func_map[func_name];
        return `
${def_code}
        `;
    }).join('\n');
}

function generate_all_def_code_without_body(func_map) {
    return Object.keys(func_map).map((func_name) => {
        const {
            def_code_without_body
        } = func_map[func_name];
        return `
${def_code_without_body};
        `;
    }).join('\n');
}

function generate_all_deserialization_code(func_map) {

    return Object.keys(func_map).map((func_name) => {
        const {
            deserialization_code,
            call_code,
            rsp_params_def_code,
            rsp_code,
        } = func_map[func_name];

        return `
            if (func_name == "${func_name}") {
                ${deserialization_code}
                ${rsp_params_def_code}
                ${call_code}
                long type = 0;
                written(fd1, (char*)&type, 4);
                written(fd1, (char*)&sid, 4);
                std::string rsp_buffer;
                long func_name_len = func_name.length();
                rsp_buffer.append((char*)&func_name_len, 4);
                rsp_buffer.append((char*)func_name.c_str(), func_name_len);
                ${rsp_code}
                long rsp_buffer_len = rsp_buffer.length();
                written(fd1, (char*)&rsp_buffer_len, 4);
                written(fd1, (char*)rsp_buffer.c_str(), rsp_buffer_len);
            }
        `;
    }).join('\n');
}

function generate_c(class_name, init_params, funcs, desc, version) {
    const initialization_args = generate_initialization_args(init_params);
    const init_deserialization_code = generate_deserialization_code(init_params);
    const init_call_code = generate_call_code("initialize", init_params, []);

    const func_map = funcs.reduce((pre, func) => {
        const {
            name: func_name,
            req_params,
            rsp_params,
        } = func;
        pre[func_name] = {
            deserialization_code: generate_deserialization_code(req_params),
            def_code: generate_def_code(func_name, req_params, rsp_params),
            call_code: generate_call_code(func_name, req_params, rsp_params),
            rsp_params_def_code: generate_rsp_params_def_code(rsp_params),
            rsp_code: generate_rsp_code(rsp_params),
            def_code_without_body: generate_def_code_without_body(func_name, req_params, rsp_params),
        }
        return pre;
    }, {});

    const all_def_code = generate_all_def_code(func_map);
    const all_def_code_without_body = generate_all_def_code_without_body(func_map);
    const all_deserialization_code = generate_all_deserialization_code(func_map);
    const comment = `// **********************************************************************
// This file was generated by a NodejsCallC parser!
// NodejsCallC version ${version} by liwang112358@gmail.com
// Generated from ${desc} at ${(new Date()).toString()}
// **********************************************************************`;
    const c_imp_code = `${comment}
#include "${class_name}_header.h"
${all_def_code}`;
    const c_init_code = `${comment}
#include "${class_name}_header.h"
void initialize(${initialization_args})
{
    // TODO initialize
}`;
    const c_header_code = `${comment}
#ifndef ${class_name.toUpperCase()}_H
#define ${class_name.toUpperCase()}_H
#include <string>
#include <vector>
#include <sstream>
#include <iostream>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
void dbg_log(const std::string & msg);
void initialize(${initialization_args});
${all_def_code_without_body}
#endif
`;
    const c_pipe_code = `${comment}
#include "${class_name}_header.h"
#include <string>
#include <vector>
#include <sstream>
#include <iostream>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
using namespace std;

int fd0 = 0;
int fd1 = 0;

int readed(int fd, char* read_buffer, int length)
{
    int recv_len = 0;
    while (recv_len < length) {
        int read_size = read(fd, read_buffer + recv_len, length - recv_len);
        if (read_size <= 0) {
            break;
        }
        recv_len += read_size;
    }
    return recv_len;
}

int written(int fd, char* write_buffer, int length)
{
    int send_len = 0;
    while (send_len < length) {
        int write_size = write(fd, write_buffer + send_len, length - send_len);
        if (write_size <= 0) {
            break;
        }
        send_len += write_size;
    }
    return send_len;
}

void dbg_log(const std::string & msg)
{
    long type = 1;
    long sid = 0;
    long buffer_len = msg.length();
    written(fd1, (char*)&type, 4);
    written(fd1, (char*)&sid, 4);
    written(fd1, (char*)&buffer_len, 4);
    written(fd1, (char*)msg.c_str(), buffer_len);
}

void ready()
{
    long type = 2;
    long sid = 0;
    long buffer_len = 1;
    written(fd1, (char*)&type, 4);
    written(fd1, (char*)&sid, 4);
    written(fd1, (char*)&buffer_len, 4);
    written(fd1, (char*)" ", buffer_len);
}

int main()
{   
    fd0 = dup(0);
    fd1 = dup(1);
    close(0);
    close(1);
    bool initialized = false;
    while (true)
    {
        long buf_len = 0;
        long read_size = readed(fd0, (char *)&buf_len, 4);
        if (read_size <= 0) {
            break;
        }
        ${init_deserialization_code}
        ${init_call_code}
        ready();
        initialized = true;
        break;
    }

    if (!initialized) {
        dbg_log("initialize failed.");
        exit(-1);
    }
    
    while (true) {
        long buf_len = 0;
        long read_size = readed(fd0, (char *)&buf_len, 4);
        if (read_size <= 0) {
            break;
        }
        long sid = 0;
        read_size = readed(fd0, (char *)&sid, 4);
        if (read_size <= 0) {
            break;
        }

        long len_func_name = 0;
        read_size = readed(fd0, (char *)&len_func_name, 4);
        if (read_size < 0) {
            break;
        }
        char *buffer_func_name = new char[len_func_name];
        read_size = readed(fd0, buffer_func_name, len_func_name);
        if (read_size < 0) {
            break;
        }
        std::string func_name(buffer_func_name, len_func_name);
        delete []buffer_func_name;
        ${all_deserialization_code}
    }
    return 0;
}
`;
    return {
        c_imp_code: tidy_code(c_imp_code),
        c_init_code: tidy_code(c_init_code),
        c_header_code: tidy_code(c_header_code),
        c_pipe_code: tidy_code(c_pipe_code),
    } ;
}

module.exports = generate_c;
