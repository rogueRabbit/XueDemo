import { HOOK_NAMES } from '../utils/constant';

export const hooksMixin = function(Xue) {
    Xue.prototype._callHook = function (hookname) {
        this.$hooks[hookname].call(this);
    }
}

// 初始化生命周期
export const initHooks = function() {
    this.$hooks = {};
    HOOK_NAMES.forEach(item => {
        this.$hooks[item] = this.$options[item];
    })
}