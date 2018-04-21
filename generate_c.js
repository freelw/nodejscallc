function generate_deserialization_code(req_params) {
    return req_params.map((param, index) => {
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
        } else {
            throw new Error(`type '${type}' not supported.`);
        }
    }).join('');
}

function generate_serialization_code(rsp_params)
{
    return '';
}

function generate_def_code(func_name, req_params, rsp_params)
{
    const req_params_str_list = req_params.map((param) => {
        const {name, type} = param;
        if (type === 'long') {
            return `long ${name}`;
        } else if (type === 'string') {
            return `const std::string & ${name}`;
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
        } else {
            throw new Error(`type '${type}' not supported.`);
        }
    });
    return `
void ${func_name}(${req_params_str_list.concat(rsp_params_str_list).join(', ')})
{

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
            return `long & ${name};`;
        } else if (type === 'string') {
            return `std::string ${name};`;
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
            return `rsp_buffer.append((char*)&${name}, 4);`;
        } else if (type === 'string') {
            return `
                long str_len_${index} = ${name}.length();
                rsp_buffer.append((char*)&str_len_${index}, 4);
                rsp_buffer.append((char*)${name}.c_str(), str_len_${index});
            `;
        } else {
            throw new Error(`type '${type}' not supported.`);
        }
    }).join('\n');
}

function generate_c(func_name, req_params, rsp_params)
{
    const deserialization_code = generate_deserialization_code(req_params);
    const serialization_code = generate_serialization_code(rsp_params);
    const def_code = generate_def_code(func_name, req_params, rsp_params);
    const call_code = generate_call_code(func_name, req_params, rsp_params);
    const rsp_params_def_code = generate_rsp_params_def_code(rsp_params);
    const rsp_code = generate_rsp_code(rsp_params);
    return `
#include <iostream>
#include <unistd.h>
using namespace std;
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

int main()
{
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
