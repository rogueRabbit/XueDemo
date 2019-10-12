import VNode from '../classes/vnode';
import JSXObj from '../classes/jsxObj';
import Element from '../classes/element';
import { addNativeTags } from '../utils/constant';
import nextTick from '../utils/nextTick';
import warn from '../utils/warn';

export const elementMixin = function(Xue) {
    Xue.prototype._parseJSX = (tag, attrs, ...children) => {
        return new JSXObj({
            tag,
            attrs,
            children
        })
    }

    Xue.prototype._mount = function(dom) {
        const root = this.$options.root;
        if (typeof root === 'string') this.$el = document.querySelector(root);
        else if (root instanceof HTMLElement) this.$el = root;
        this.$el.appendChild(dom);
    }
    // 扩展原声标签方法
    Xue.addNativeTags = addNativeTags;
    Xue.prototype.nextTick = nextTick;
}

// 解析JSX，返回VNodeTree
export const parseJsxObj = function(xm, jsxObj, parentVNode) {
    const vnodeTree = new VNode(jsxObj, xm);
    jsxObj && jsxObj.children && jsxObj.children.forEach(item => vnodeTree.addChild(parseJsxObj(xm, item, vnodeTree)));
    vnodeTree.addParent(parentVNode);
    return vnodeTree;
}

// 首次渲染时生成DOM树
export const createDOMTree = function(xm, vnodeTree) {
    const elementTree = new Element(vnodeTree, xm);
    vnodeTree.addElement(elementTree);
    vnodeTree.children.forEach(item => {
        const childElementTree = createDOMTree(xm, item);
        if(childElementTree.tagType === 'native') elementTree.appendChild(childElementTree);
    });
    return elementTree;
}

// 更新DOM树
export const update = function(xm, newVNode, oldVNode) {
    // 差异比对
    diff(xm, newVNode, oldVNode);
    xm._callHook.call(xm, 'updated');
    return newVNode;
}

// 比较两个vnodeTrre的差异
export const diff = function(xm, newVNode, oldVNode, parentVNode, nextBroNode) {
    // 定义变化的类型
    let diffType = '';
    // 旧节点不存在
    // 或者旧节点为null,新节点不为null
    if (!oldVNode || (oldVNode.tag === null && newVNode.tag !== null)) {
        // 有节点新增
        diffType = 'addNode';
    }

    // 新节点不存在
    // 或者新节点为null,旧节点不为null
    else if(!newVNode || (oldVNode.tag !== null && newVNode.tag === null)) {
        // 有节点删除
        diffType = 'delNode';
    }

    // 节点标签不一样，直接替换
    else if (oldVNode.tag !== newVNode.tag) {
        // 替换节点
        diffType = 'replaceNode';
    }

    // 文本节点时，直接用新的文本节点替换旧的文本节点
    else if (newVNode.tag === '') {
        diffType = 'replaceText';
    }

    else {
        // 比较属性和事件
        diffType = 'updateAttrsAndEvents';
    }

    diffUpdateHandler(diffType, xm, newVNode, oldVNode, parentVNode, nextBroNode);
    // 递归处理子节点
    for(let i=0; i< newVNode.children.length; i++) {
        // 下一个兄弟节点，为了在新增节点时，插入至正确的位置
        const nextBroNode = (i === newVNode.children.length -1 ) ? null : oldVNode.children[i + 1];
        let oldVNodeParam = oldVNode && oldVNode.children[i];
        // 新增的节点的子节点和被替换后的节点的子节点，其在olfVNode中都是没有对应的值得
        if (diffType === 'addNode' || diffType === 'replaceNode') oldVNodeParam = undefined;
        diff(xm, newVNode.children[i], oldVNodeParam, newVNode, nextBroNode);
    }
}

// 对不同diff进行处理