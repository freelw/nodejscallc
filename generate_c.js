function generate_deserialization_code(params) {
    return params.map((param, index) => {
        const {name, type} = param;
        if (type === 'long') {
            return `
        long ${name} = 0;
        read_size = readed(0, (char *)&${name}, 4);
        if (read_size <= 0) {
            break;
        }`;
        } else if (type === 'string') {
            return `
        long len_${index} = 0;
        read_size = readed(0, (char *)&len_${index}, 4);
        if (read_size <= 0) {
            break;
        }
        char *buffer_${index} = new char[len_${index}];
        read_size = readed(0, buffer_${index}, len_${index});
        if (read_size <= 0) {
            break;
        }
        std::string ${name}(buffer_${index}, len_${index});
        delete []buffer_${index};`;
        } else if (type === 'vector_string') {
            return `
        long vector_cnt_${index} = 0;
        read_size = readed(0, (char *)&vector_cnt_${index}, 4);
        if (read_size <= 0) {
            break;
        }
        long vector_len_${index} = 0;
        read_size = readed(0, (char *)&vector_len_${index}, 4);
        if (read_size <= 0) {
            break;
        }
        std::vector<std::string> ${name};
        ${name}.reserve(vector_len_${index});
        char *buffer_${index} = new char[vector_len_${index}];
        read_size = readed(0, buffer_${index}, vector_len_${index});
        if (read_size <= 0) {
            break;
        }
        long *_v_len_${index} = (long *)buffer_${index};
        char *_buffer_${index} = (char *)buffer_${index} + 4;
        for (long i = 0; i < vector_cnt_${index}; ++ i) {
            long tmp_len = 0;
            memcpy(&tmp_len, _v_len_${index}, 4);
            ${name}.push_back(std::string(_buffer_${index}, tmp_len));
            _buffer_${index} += tmp_len + 4 ;
            _v_len_${index} = (long *)(_buffer_${index} - 4);
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
        } else if (type === 'string') {
            return `const std::string & ${name}`;
        } else if (type === 'vector_string') {
            return `const std::vector<std::string> & ${name}`;
        } else {
            throw new Error(`type '${type}' not supported.`);
        }
    });
    const rsp_params_str_list = rsp_params.map((param) => {
        const {name, type} = param;
        if (type === 'long') {
            return `long & ${name}`;
        } else if (type === 'string') {
            return `std::string & ${name}`;
        } else if (type === 'vector_string') {
            return `std::vector<std::string> & ${name}`;
        } else {
            throw new Error(`type '${type}' not supported.`);
        }
    });
    return req_params_str_list.concat(rsp_params_str_list).join(', ');
}

function generate_def_code(func_name, req_params, rsp_params)
{
    
    return `
void ${func_name}(${generate_params_str_list(req_params, rsp_params)})
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
        } else if (type === 'string') {
            return `
        std::string ${name};
            `;
        } else if (type === 'vector_string') {
            return `
        std::vector<std::string> ${name};
            `;
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
        } else {
            throw new Error(`type '${type}' not supported.`);
        }
    }).join('\n');
}

function generate_initialization_args(init_params) {
    return generate_params_str_list(init_params, []);
}

function generate_c(func_name, req_params, rsp_params, init_params, desc, version)
{
    const deserialization_code = generate_deserialization_code(req_params);
    const def_code = generate_def_code(func_name, req_params, rsp_params);
    const call_code = generate_call_code(func_name, req_params, rsp_params);
    const rsp_params_def_code = generate_rsp_params_def_code(rsp_params);
    const rsp_code = generate_rsp_code(rsp_params);
    const initialization_args = generate_initialization_args(init_params);
    const init_deserialization_code = generate_deserialization_code(init_params);
    const init_call_code = generate_call_code("initialize", init_params, []);
    return `// **********************************************************************
// This file was generated by a NodejsCallC parser!
// NodejsCallC version ${version} by liwang112358@gmail.com
// Generated from ${desc} at ${(new Date()).toString()}
// **********************************************************************

#include <string>
#include <vector>
#include <sstream>
#include <iostream>
#include <unistd.h>
#include <string.h>
using namespace std;
void dbg_log(const std::string & msg);
void initialize(${initialization_args})
{
    // TODO initialize
}
${def_code}
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
    written(1, (char*)&type, 4);
    written(1, (char*)&sid, 4);
    written(1, (char*)&buffer_len, 4);
    written(1, (char*)msg.c_str(), buffer_len);
}

void ready()
{
    long type = 2;
    long sid = 0;
    long buffer_len = 1;
    written(1, (char*)&type, 4);
    written(1, (char*)&sid, 4);
    written(1, (char*)&buffer_len, 4);
    written(1, (char*)" ", buffer_len);
}

int main()
{   
    bool initialized = false;
    while (true)
    {
        long buf_len = 0;
        long read_size = readed(0, (char *)&buf_len, 4);
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
        long read_size = readed(0, (char *)&buf_len, 4);
        if (read_size <= 0) {
            break;
        }
        long sid = 0;
        read_size = readed(0, (char *)&sid, 4);
        if (read_size <= 0) {
            break;
        }
        ${deserialization_code}
        ${rsp_params_def_code}
        ${call_code}
        long type = 0;
        written(1, (char*)&type, 4);
        written(1, (char*)&sid, 4);
        std::string rsp_buffer;
        ${rsp_code}
        long rsp_buffer_len = rsp_buffer.length();
        written(1, (char*)&rsp_buffer_len, 4);
        written(1, (char*)rsp_buffer.c_str(), rsp_buffer_len);
    }
    return 0;
}
    `;
}

module.exports = generate_c;
