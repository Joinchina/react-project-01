import api from '../api';

const wx = window.wx;

export default class Weixin {

    constructor(...jsApiList) {
        this._preparePromise = (async () => {
            const url = window.location.href;
            const config = await api.post('/js-api-config', {
                jsApiList,
                url
            });
            console.log("prepare js api", config);
            const r = await new Promise((fulfill, reject) => {
                wx.ready(function(){
                    fulfill();
                });
                wx.error(function(res){
                    reject(res);
                });
                wx.config(JSON.parse(JSON.stringify(config)));
            });
            for (const api of config.jsApiList) {
                this[api] = function(opts = {}) {
                    return new Promise((fulfill, reject) => {
                        const nopts = Object.assign({}, opts, {
                            success: function(res, ...args) {
                                fulfill(res);
                                if (opts.success) {
                                    opts.success(res, ...args);
                                }
                            },
                            fail: function(err, ...args) {
                                reject(err);
                                if (opts.fail) {
                                    opts.fail(err, ...args);
                                }
                            },
                            cancel: function(...args){
                                const err = new Error('User cancelled');
                                err.code = 'EUSERCANCELLED';
                                reject(err);
                                if (opts.cancel) {
                                    opts.cancel(...args);
                                }
                            }
                        });
                        wx[api](nopts);
                    });
                }
            }
            return r;
        })();
    }

    ready() {
        return this._preparePromise;
    }

    async readyWithParam(shareParam) {
        await wx.ready(function () {   //需在用户可能点击分享按钮前就先调用
            wx.onMenuShareAppMessage(shareParam);
            wx.onMenuShareTimeline(shareParam);
        });
        return this._preparePromise;
    }
};
