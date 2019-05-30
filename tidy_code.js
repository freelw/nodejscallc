const beautify = require('js-beautify').js;

function tidy_js_tab(code) {
    return beautify(code, {indent_size: 4, space_in_empty_paren: true});
}

function tidy_c_tab(code,) {
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

function tidy_blank(code) {
    const arr = code.split('\n');
    const ret = [];
    for (let i = 0, len = arr.length; i < len; ++ i) {
        if (!(0 === arr[i].trim().length)) {
            ret.push(arr[i].replace(/\n/g, ''));
        }
    }
    return ret.join('\n');
}

function tidy_js(code) {
    return tidy_js_tab(tidy_blank(code));
}

function tidy_c(code) {
    return tidy_c_tab(tidy_blank(code));
}

function tidy_python(code) {
    return tidy_blank(code);
}

module.exports = {
    tidy_js,
    tidy_c,
    tidy_python,
}