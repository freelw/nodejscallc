function tidy_tab(code, is_python) {
    if (is_python) {
        return code;
    } else {
        const arr = code.split('\n');
        let tab_cnt = 0;
        return arr.map((_line) => {
            const line = _line.trim();
            if (line.indexOf('}') >= 0) {
                tab_cnt --;
            }
            let ret = '';
            let tab = '    ';
            for (let i = 0; i < tab_cnt; ++ i) {
                ret += tab;
            }
            ret += line;
            if (line.indexOf('{') >= 0) {
                tab_cnt ++;
            }
            return ret;
        }).join('\n');
    }
}

function tidy_code(code, is_python = false) {
    const arr = code.split('\n');
    const ret = [];
    for (let i = 0, len = arr.length; i < len; ++ i) {
        if (!(0 === arr[i].trim().length)) {
            ret.push(arr[i].replace(/\n/g, ''));
        }
    }
    return tidy_tab(ret.join('\n'), is_python);
}

module.exports = tidy_code;