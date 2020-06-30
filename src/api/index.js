import moment from 'moment';

const credentials = 'same-origin';

export default {

    async requestWithoutBody(method, url, data, opts = {}) {
        if (url[0] === '/') {
            url = url.substr(1);
        }
        const query = querystringify(data);
        const sep = query ? (url.indexOf('?') >= 0 ? '&' : '?') : '';
        const actualUrl = `/api/${url}${sep}${query}`;
        console.info(method, url, actualUrl);
        const headers = Object.assign({
            'x-csrf-token': window._csrf
        }, opts.headers);
        let resp;
        try {
            resp = await fetch(actualUrl,
                Object.assign({},
                    opts,
                    {
                        headers,
                        method,
                        credentials
                    }
                ));
        } catch (e) {
            throw new Error('网络异常，请检查后重试！');
        }
        return this.checkResponse(resp);
    },

    get(url, data, opts) {
        return this.requestWithoutBody('GET', url, data, opts);
    },

    del(url, data, opts) {
        return this.requestWithoutBody('DELETE', url, data, opts);
    },

    async requestWithFormBody(method, api, data, opts = {}) {
        const form = querystringify(data);
        if (api[0] === '/') {
            api = api.substr(1);
        }
        const url = `/api/${api}`;
        console.info(method, api, url);
        const headers = Object.assign({
            'Content-Type': 'application/x-www-form-urlencoded',
            'x-csrf-token': window._csrf
        }, opts.headers);
        let resp;
        try {
            resp = await fetch(url,
                Object.assign(
                {
                    body: form,
                },
                opts,
                {
                    headers,
                    method,
                    credentials
                }
            ));
        } catch(e) {
            throw new Error('网络异常，请检查后重试！');
        }
        return await this.checkResponse(resp);
    },

    post(url, data, opts) {
        return this.requestWithFormBody('POST', url, data, opts);
    },

    put(url, data, opts) {
        return this.requestWithFormBody('PUT', url, data, opts);
    },

    async checkResponse(resp) {
        if (!/2\d\d/.test(resp.status)) {
            throw new Error(`Bad status: ${resp.status} ${resp.statusText}`);
        }
        let data;
        try {
            data = await resp.json();
        } catch (err) {
            err.message = '网络异常，请检查后重试！';
            throw err;
        }
        if (data.code !== 0) {
            const e = new Error(data.message);
            e.code = data.code;
            e.data = data.data;
            throw e;
        }
        return data.data;
    }
};

function querystringify(data){
    const items = [];
    for (const key in data) {
        const val = data[key];
        if (val === undefined) {
            continue;
        } else if (val === null) {
            items.push(`${encodeURIComponent(key)}=`);
        } else if (typeof val === 'string') {
            items.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
        } else {
            items.push(`${encodeURIComponent(key)}=${encodeURIComponent(toJSONString(val))}`);
        }
    }
    return items.join("&");
}

function toJSONString(obj) {
    const old = Date.prototype.toJSON;
    try {
        const toDateString = date => moment(date).format('yyyy-MM-dd');
        Date.prototype.toJSON = function () {
            return toDateString(this);
        };
        return JSON.stringify(obj, (key, value) => {
            if (key.startsWith('$$')) {
                return undefined;
            }
            return value;
        });
    } finally {
        Date.prototype.toJSON = old;
    }
}
