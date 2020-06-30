const data = require('./data.js');

const t = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`~!@#$%^&*()_=+[{]}|;:,<.>/?';
const map = data;
const out = {};
/* map is pure json data, it is safe to use for-in */
/* eslint-disable-next-line guard-for-in, no-restricted-syntax */
for (const a1 in map) {
    const key1 = (a1[0] >= '0' && a1[0] <= '9') ? a1 : t.indexOf(a1);
    out[key1] = {};
    /* eslint-disable-next-line guard-for-in, no-restricted-syntax */
    for (const a2 in map[a1]) {
        const key2 = (a2[0] >= '0' && a2[0] <= '9') ? a2 : t.indexOf(a2);
        const str = map[a1][a2];
        const arr = [0];
        for (let i = 0; i < str.length; i += 1) {
            const ch = str[i];
            if (ch >= '0' && ch <= '9') {
                arr.push(Number(str.substr(i, 2)));
                i += 1;
            } else if (ch !== '-') {
                arr.push(t.indexOf(ch));
            } else {
                const from = arr[arr.length - 1];
                const nch = str[i + 1];
                let to;
                if (nch >= '0' && nch <= '9') {
                    to = Number(str.substr(i + 1, 2));
                } else {
                    to = t.indexOf(nch);
                }
                for (let j = from + 1; j < to; j += 1) {
                    arr.push(j);
                }
            }
        }
        out[key1][key2] = arr;
    }
}

export default out;
