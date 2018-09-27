function tidy_code(code) {
    const arr = code.split('\n');
    const ret = [];
    for (let i = 0, len = arr.length; i < len; ++ i) {
        if (!(0 === arr[i].trim().length)) {
            ret.push(arr[i].replace(/\n/g, ''));
        }
    }
    return ret.join('\n');
}

module.exports = tidy_code;