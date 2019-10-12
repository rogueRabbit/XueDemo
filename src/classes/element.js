import Xue from '../main';
import Dep from './dep';

class Element {
    constructor(vnode, xm) {
        this.xm = xm;
        this.tagType = 'native';
        // 如果为null的话，则不做任何处理
        if (vnode.tag === null) return;
        // 文本节点
        if (vnode.tag === '') {
            this.el = document.createTextNode(vnode.text);
            return;
        }
        // 处理非文本节点
        if (vnode.tagType === 'native') {
            this.el = document.createElement(vnode.tag);
            // 绑定属性
            Object.entries(vnode.attrs).forEach(([key, value]) => {
                this.setAttribute(key, value);
            })
            // 绑定事件
            Object.keys(vnode.events).forEach(key => {
                vnode.events[key] = vnode.events[key].bind(xm);
                this.addEventListener(key, vnode.events[key]);
            })
        } else if (vnode.tagType === 'component') {
            this.tagType = 'component';
            // 把它的父级vnode作为组件实例的根节点
            vnode.tag.root = vnode.parent && vnode.parent.element.el;
            vnode.tag.$parent = xm;
            vnode.tag.$props = vnode.attrs;
            // vnode.tag就是Xue的options
            const childXM = new Xue(vnode.tag);
            // 重置当前的xml和el为新建子Xue的例
            this.xm = childXM;
            this.el = childXM.$el;
            vnode.updateXM(childXM);

            // 组件init完成后，把组件的Watcher出栈
            Dep.popTarget();
        }
    }

    // 添加子节点
    appendChild(element) {
        this.el && element.el && this.el.appendChild(element.el);
    }

    // 移除子节点
    removeChild(element) {
        this.el && element.el && this.el.removeChild(element.el);
    }

    // 添加属性。对className和style做特殊处理
    setAttribute(name, value) {
        if (name === 'className') {
            this.el.setAttribute('class', value);
        } else if (name === 'style') {
            Object.entries(value).forEach((styleKey, styleValue) => {
                this.el.style[styleKey] = styleValue;
            })
        } else {
            this.el.setAttribute(name, value);
        }
    }

    // 添加事件监听
    addEventListener(name, handler) {
        this.el.addEventListener(name, handler);
    }

    // 移除事件监听
    removeEventListener(name, handler) {
        this.el.removeEventListener(name, handler);
    }

    // 更新文本内容
    updateTextContent(text) {
        this.el.textContent = text;
    }

    // 替换子节点
    replaceChild(newElement, oldElement) {
        this.el.replaceChild(newElement.el, oldElement.el);
    }

    // 在refernceElement 前插入newElement, 父节点为this.el
    insertBefore(newElement, referenceElement) {
        this.el.insertBefore(newElement, referenceElement && referenceElement.el);
    }

}

export default Element;