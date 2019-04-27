/**
MIT License

Copyright (c) 2019 bobolinks

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 * @since 20190418 18:31
 * @author bobolinks
 */

window.isEsData = Symbol("isEsData");
window.isEsProps = Symbol("isEsProps");
window.EsAddListener = Symbol("EsAddListener");
window.EsRemoveListener = Symbol("EsRemoveListener");

Object.merge_es_private = function(dst, ...rest) {
    for (const src of rest) {
        if (typeof dst != 'object' || typeof dst != typeof src) {
            dst = src;
            continue;
        }
        let isArr = Array.isArray(src);
        if (Array.isArray(dst) || isArr) {
            dst = isArr ? [] : {};
        }
        for (const key in src) {
            let v = undefined;
            let hasXetter = false;
            if ((v = src.__lookupGetter__(key))) {
                dst.__defineGetter__(key, v);
                hasXetter = true;
            }
            if ((v = src.__lookupSetter__(key))) {
                dst.__defineSetter__(key, v);
                hasXetter = true;
            }
            if (!hasXetter) {
                v = src[key];
                dst[key] = typeof v != 'object' ? v : Object.merge_es_private(dst[key] || {}, v);
            }
        }
    }
    return dst;
};

window.$es = window.$es || {
    autoIncrement: 0,
    elements: {},
    componnents: {},
    renderStack: [],
    define: function(component) {
        if (this.componnents[component.id]) {
            throw `Component[${component.id}] aready exists!`;
        }
        Object.keys(component).forEach(function(key) {
            if (typeof component[key] == 'object') {
                Object.freeze(component[key]);
            }
        });
        return this.componnents[component.id] = Object.freeze(component);
    },
    getComponentById: function(id) {
        return this.componnents[id];
    },
    getCurrentRenderer() {
        return this.renderStack.length ? this.renderStack[this.renderStack.length - 1] : undefined;
    },
    em(element) {
        if (typeof element == 'number') {
            return this.elements[element];
        } else if (typeof element == 'string') {
            element = document.getElementById(element);
        }
        while (element) {
            if (element.$instance) {
                return element;
            }
            element = element.parentNode;
        }
        return undefined;
    },
    it(element) {
        let e = this.em(element);
        return e ? e.$instance : undefined;
    },
    on(event) {
        let em = this.em(event.srcElement);
        if (!em) {
            return undefined;
        }
        let it = em.$instance;
        let name = 'on' + event.type;
        let handle = it.events[name];
        let handled = handle ? handle.bind(it, event).call() : false;
        let exNameOrFunc = em.$extend.events[name];
        if (typeof exNameOrFunc == 'function') {
            handled |= exNameOrFunc.bind(it, event).call();
        } else if (exNameOrFunc && em.$parent) {
            handle = em.$parent.$instance.events[exNameOrFunc];
            if (handle) {
                handled |= handle.bind(em.$parent.$instance, event).call();
            }
        }

        return handled;
    }
};

$es.EsData = function(object, options = {}) {
    return new Proxy(object, {
        deepInspect: options.deepInspect || false,
        path: options.path || '',
        owner: options.owner || undefined,
        extend: options.extend || { __proto__: null },
        watchers: { __proto__: null },
        get: function(target, key, receiver) {
            if (key === isEsData)
                return true;
            else if (!target.hasOwnProperty(key)) {
                return Reflect.get(target, key, receiver);
            }
            let mapper = this.extend[key];
            if (mapper) {
                return mapper.get.bind(mapper.scope).call();
            }
            let keyPath = `${this.path?(this.path + '.'):''}${key}`;
            let renderer = $es.getCurrentRenderer();
            if (renderer) {
                watchers = (this.owner || this).watchers;
                (watchers[keyPath] || (watchers[keyPath] = new Set())).add(renderer.$unique);
            }
            let value = Reflect.get(target, key, receiver);
            if (this.deepInspect && typeof value == 'object' && ([Object, Array, Map, Set].indexOf(value.__proto__.constructor) >= 0) && !value[isEsData]) {
                value = $es.EsData(value, { deepInspect: this.deepInspect, path: keyPath, owner: this.owner || this });
                Reflect.set(target, key, value, receiver);
            }
            return value;
        },
        set: function(target, key, value, receiver) {
            if (key === EsAddListener) {
                let keyPath = value['path'];
                if (keyPath && value['id']) {
                    watchers = (this.owner || this).watchers;
                    (watchers[keyPath] || (watchers[keyPath] = new Set())).add(value['id']);
                }
                return true;
            } else if (key === EsRemoveListener) {
                let keyPath = value['path'];
                let watcher = (this.owner || this).watchers[keyPath];
                if (watcher) {
                    watcher.delete(value['id']);
                }
                return true;
            }
            let mapper = this.extend[key];
            if (mapper) {
                mapper.set.bind(mapper.scope, value).call();
                return true;
            }
            let rs = Reflect.set(target, key, value, receiver);
            let keyPath = `${this.path?(this.path + '.'):''}${key}`;
            let watcher = (this.owner || this).watchers[keyPath];
            if (watcher) {
                for (const uinid of watcher) {
                    let element = $es.em(uinid);
                    if (!element) {
                        watcher.delete(uinid);
                    } else {
                        //tries to update first
                        if (!element.esUpdate(keyPath, value)) {
                            //renders all content
                            element.esRender();
                        }
                    }
                }
            }
            return rs;
        },
        deleteProperty(target, key) {
            let mapper = this.extend[key];
            if (mapper) {
                mapper.delete.bind(mapper.scope).call();
                return true;
            }
            let rs = Reflect.deleteProperty(target, key);
            let keyPath = `${this.path?(this.path + '.'):''}${key}`;
            let watcher = (this.owner || this).watchers[keyPath];
            if (watcher) {
                for (const uinid of watcher) {
                    let element = $es.em(uinid);
                    if (!element) {
                        watcher.delete(uinid);
                    } else {
                        //tries to update first
                        if (!element.esUpdate(keyPath, value)) {
                            //renders all content
                            element.esRender();
                        }
                    }
                }
                //clear up watchers
                (this.owner || this).watchers[keyPath] = new Set();
            }
            return rs;
        },
    });
};

class ESUseElement extends HTMLElement {
    static get observedAttributes() {
        return ['component'];
    }

    constructor() {
        super();
        this.$parent = undefined;
        this.$children = new Set();
        this.$connected = false;
        this.$floating = false;
        this.$unique = $es.autoIncrement++;
        this.esReset();
    }

    connectedCallback() {
        let parNode = this.parentNode;
        while (parNode) {
            if (parNode.$instance) {
                break;
            }
            parNode = parNode.parentNode;
        }
        this.$parent = parNode;
        if (this.$parent) {
            this.$parent.$children.add(this);
        }

        this.$connected = true;
        if (!this.$floating) {
            $es.elements[this.$unique] = this;
            setTimeout(() => {
                this.esReload();
            }, 0);
        }
    }

    disconnectedCallback() {
        if (!this.$floating) {
            delete $es.elements[this.$unique];
            if (this.$instance && this.$instance.isMounted) {
                if (this.$instance.destroyed) {
                    this.$instance.destroyed.bind(this.$instance, this).call();
                }
            }
            this.$component = undefined;
            this.$extend = undefined;
            this.$instance = undefined;
        }
        this.$connected = false;
        if (this.$parent) {
            this.$parent.$children.delete(this);
            this.$parent = undefined;
        }
    }

    adoptedCallback() {}

    attributeChangedCallback(name, oldValue, newValue) {
        if (this.$connected && oldValue != newValue && 'component;'.indexOf(name) >= 0) {
            this.esReload();
        }
    }

    calComponentId() {
        return this.getAttribute('component');
    }

    getComponentById(compId) {
        if (!compId) {
            //find it from children
            for (const e of this.children) {
                if (e.tagName.toLocaleLowerCase() != 'template') {
                    continue;
                }
                let slotName = e.getAttribute('slot');
                if (slotName && slotName != 'default') {
                    continue;
                }
                return { id: undefined, template: e.innerHTML };
            }
            return { id: undefined, template: '' };
        } else if (compId[0] == '#') { //is template id
            return {
                id: compId,
                template: document.getElementById(compId.substring(1)).innerHTML
            };
        } else {
            let comp = $es.getComponentById(compId);
            if (!comp) {
                throw `Component[${compId}] not found!`;
            }
            return comp;
        }
    }

    esTransfer(target) {
        if (!target || this.$floating) {
            throw 'Illegal target or state!';
        }
        this.$floating = true;
        this.parentNode.removeChild(this);
        target.appendChild(this);
        this.$floating = false;
    }

    esFlyaway() {
        if (this.$floating) {
            throw 'Illegal target or state!';
        }
        this.$floating = true;
        this.parentNode.removeChild(this);
        return this;
    }

    esReset() {
        this.$component = eval("({id:0, data: {}, slots: {}, events: {}, accelerator: {}})");
        this.$extend = eval("({data: {}, events: {}, alias: {__proto__:null}})");
        if (this.$instance) {
            this.$instance.$element = undefined;
        }
        this.$instance = {
            __proto__: null,
            $element: this,
            isMounted: false,
            applyEvents: function() {
                for (const ename in this.$element.$instance.events) {
                    this.$element.setAttribute(ename, `$es.on(event)`);
                }
                for (const ename in this.$element.$extend.events) {
                    this.$element.setAttribute(ename, `$es.on(event)`);
                }
            },
            render: function() {
                this.$element.innerHTML = eval('(' + '`' + this.template + '`' + ')');
            }
        };
    }

    esReshape(compId) {
        if (this.$instance && this.$instance.isMounted) {
            if (this.$instance.destroyed) {
                this.$instance.destroyed.bind(this.$instance, this).call();
            }
        }

        //reset
        this.esReset();

        //load component
        Object.merge_es_private(this.$component, this.getComponentById(compId));

        let slots = {};
        let extend = undefined;
        //load extend and slots
        for (const e of this.children) {
            let tagName = e.tagName.toLocaleLowerCase();
            if (tagName == 'template') {
                let slotName = e.getAttribute('slot');
                if (!slotName || slotName == 'default') {
                    continue;
                }
                let slotValue = slots[slotName];
                if (!slotValue) {
                    slots[slotName] = e.innerHTML;
                } else if (typeof slotValue == 'string') {
                    slots[slotName] = [slotValue, e.innerHTML];
                } else {
                    if (!slotValue instanceof Array) {
                        throw `Slot confliected!`;
                    }
                    slotValue.push(e.innerHTML);
                }
            } else if (tagName == 'script' && extend == undefined) {
                extend = eval(`(${e.innerHTML})`);
                if (!extend) {
                    throw `Illegal script found!`;
                } else if (extend.slots) {
                    throw `Defines slots inside script block is not allowed!`;
                }
                Object.merge_es_private(this.$extend, extend);
            } else {
                throw `Only template and script can be placed in <es-use> block!`;
            }
        }

        Object.freeze(this.$extend);

        Object.merge_es_private(this.$instance, this.$component, {
            data: this.$extend.data,
            slots
        });

        for (const scope of['data', 'slots', 'events']) {
            for (const key in this.$instance[scope]) {
                if (!this.$instance[scope]) continue;
                let value = this.$instance[scope][key];
                if (typeof value != 'object') continue;
                if (value[isEsProps]) {
                    this.$instance[scope][key] = value.default;
                }
            }
        }

        { //proxies
            let obs = this.$extend.alias;
            for (const key in obs) {
                let v = undefined;
                let ms = undefined;
                if ((obs.__lookupGetter__ && obs.__lookupGetter__(key)) || (obs.__lookupSetter__ && obs.__lookupSetter__(key))) {
                    throw `Defines seter | getter inside alias is not allowed!`;
                } else if (typeof(v = obs[key]) != 'string') {
                    throw `Only string is allowed to define inside alias!`;
                } else if (!(ms = /^((?:[$_a-z][$_0-9a-z]*\.)*)([$_a-z][$_0-9a-z]*)/i.exec(v))) {
                    throw `Illegal expression '${v}'!`;
                }
                let scope = this.$parent ? this.$parent.$instance : undefined;
                let valuePath = v;
                if (!ms[1]) {
                    valuePath = `this.data.${v}`;
                } else if (ms[1].startsWith(`data.`)) {
                    valuePath = `this.${v}`;
                } else if (!ms[1].startsWith('this.')) {
                    scope = window;
                }
                if (!this.$instance.data.hasOwnProperty(key)) {
                    this.$instance.data[key] = undefined;
                }
                obs[key] = {
                    scope: scope,
                    get: eval(`(function(){return ${valuePath}})`),
                    set: eval(`(function(val){${valuePath}=val;})`),
                    delete: eval(`(function(val){delete ${valuePath};})`),
                };
            }
            this.$instance.data = $es.EsData(this.$instance.data, { deepInscpect: this.$extend.deepInscpect, extend: this.$extend.alias });
        }

        if (this.$instance.created) {
            this.$instance.created.bind(this.$instance, this).call();
        }

        return true;
    }

    esReload(force = false) {
        let compId = this.calComponentId();
        if (compId != this.$component.id) {
            this.esReshape(compId);
        } else if (!force) {
            return;
        }

        this.esRender();

        if (!this.$instance.isMounted) {
            this.$instance.isMounted = true;
            if (this.$instance.mounted) {
                this.$instance.mounted.bind(this.$instance, this).call();
            }
        }
    }

    esUpdate(keyPath, value) {
        let key = keyPath.split('.')[0];
        let handle = this.$instance.accelerator[key];
        if (handle) {
            $es.renderStack.push(this);
            try {
                return handle.bind(this.$instance, value, keyPath).call(), true;
            } finally {
                if ($es.renderStack.pop() != this) {
                    console.warn('Es internal error!');
                }
            }
        }
        return false;
    }

    esRender() {
        $es.renderStack.push(this);
        try {
            this.$instance.render.bind(this.$instance).call();
            this.$instance.applyEvents.bind(this.$instance).call();
        } finally {
            if ($es.renderStack.pop() != this) {
                console.warn('Es internal error!');
            }
        }
    }
};

customElements.define('es-use', ESUseElement);

//router implementation
$es.router = {
    uriBase: '',
    urlPrefix: '',
    routes: {},
    stack: [],
    fromPath: function(path) {
        if (path == '/') {
            return this.routes.$;
        }
        let uri = path.split('#')[0];
        uri = uri.split('?')[0];
        if (!/^[0-9a-z_/]+[0-9a-z_]$/i.test(uri)) {
            return undefined;
        }
        let objPath = `this.routes${uri[0] == '/' ? '' : '.'}` + uri.split('/').join('.') + '.$';
        try {
            return eval(`(${objPath})`);
        } catch (e) {
            return undefined;
        }
    },
    define: function(component) {
        if (component.id == '/') {
            if (this.routes.$) {
                throw `Component[${component.id}] aready exists!`;
            }
            this.routes.$ = component;
            return;
        }

        if (!/^\/[0-9a-z_/]+[0-9a-z_]$/i.test(component.id)) {
            throw `Illegal path [${component.id}]!`;
        }

        let names = component.id.substring(1).split('/');
        let objSrc = '{' + names.join(':{') + ':{}' + '}'.repeat(names.length);
        Object.merge_es_private(this.routes, eval(`(${objSrc})`));
        let objPath = `this.routes.` + names.join('.');
        let objNode = eval(`(${objPath})`);

        if (objNode.$) {
            throw `Component[${component.id}] aready exists!`;
        }
        objNode.$ = component;
    },
    popstateChanged: function() {
        let uriCur = location.href.substring($es.router.urlPrefix.length);
        if (!this.stack.length || this.stack[this.stack.length - 1].$component.id == uriCur) {
            return;
        }
        let i = this.stack.length;
        while (i) {
            this.stack[--i].esReload();
        }
    },
    goto: function(uri) {
        if (uri.startsWith('http:') || uri.startsWith('https:') || uri.startsWith('file:')) { //full url
            location.href = uri;
        } else {
            let uriCur = location.href.substring($es.router.urlPrefix.length);
            if (uri[0] != '/') { //not abs path
                let names = uriCur.split('#')[0].split('?')[0].split('/');
                if (names.length) {
                    names.splice(names.length - 1);
                }
                uri = '/' + names.join('/') + uri;
            }
            if (uriCur == uri) {
                return;
            }
            history.pushState({
                key: Date.now().toFixed(3)
            }, '', $es.router.urlPrefix + uri);
            this.popstateChanged();
        }
    }
};

$es.router.urlPrefix = `${location.protocol}//${location.protocol == 'file:' ? location.pathname : (location.host + $es.router.uriBase)}#`;

class EsSlotElement extends ESUseElement {
    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        if (!$es.router.stack.length) {
            window.addEventListener("popstate", $es.router.popstateChanged.bind($es.router));
        }
        let depth = 0;
        let par = this.$parent;
        while (par) {
            if (par instanceof EsSlotElement) {
                depth++;
            }
            par = par.$parent;
        }
        this.$depth = depth;
        if (depth < $es.router.stack.length) {
            $es.router.stack.splice(depth);
        } else {
            $es.router.stack.push(this);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        let index = $es.router.stack.indexOf(this);
        if (index >= 0) {
            $es.router.stack.splice(index);
        }
        if (!$es.router.stack.length) {
            window.removeEventListener("popstate", $es.router.popstateChanged.bind($es.router));
        }
    }

    isTop() {
        return $es.router.stack[0] == this;
    }

    calComponentId() {
        let compId = this.getAttribute('component');
        if (this.isTop()) {
            compId = '/';
        } else {
            if (compId && compId[0] != '/') {
                throw `Illegal uri[${compId}]!`;
            }
            let uriOrg = location.hash;
            if (uriOrg.length <= $es.router.uriBase.length) {
                return undefined;
            }
            uriOrg = uriOrg.substring($es.router.uriBase.length + 1);

            let isH = true,
                isQ = false;
            let tail = uriOrg.split('#')[1] || (isH = false, isQ = true, uriOrg.split('?')[1]) || (isQ = false, '');
            if (tail) tail = (isH ? '#' : '?') + tail;
            let uri = uriOrg.substring(0, uriOrg.length - tail.length);

            if (compId && compId.startsWith(uri)) {
                uri = compId;
            }

            let names = uri.substring(1).split('/');
            if (names.length < this.$depth) {
                throw `Illegal uri[${uriOrg}]!`;
            } else {
                compId = '/' + names.slice(0, this.$depth).join('/');
                if (tail) {
                    this.$uriQuery = tail;
                } else {
                    this.$uriQuery = undefined;
                }
            }
        }
        return compId;
    }

    getComponentById(compId) {
        let comp = $es.router.fromPath(compId);
        if (!comp) {
            throw `Component[${compId}] not found!`;
        }
        return comp;
    }

    esReshape(compId) {
        //clear all children
        this.innerHTML = '';
        if (super.esReshape(compId)) {
            let uri = compId + (this.$uriQuery || '');
            if (!location.hash.substring(1).startsWith(uri)) {
                history.replaceState({
                    key: Date.now().toFixed(3)
                }, '', $es.router.urlPrefix + compId + (this.$uriQuery || ''));
            }
            this.setAttribute('component', compId);
        }
    }
};
customElements.define('es-slot', EsSlotElement);