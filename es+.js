/**
 * @since 20180227 18:31
 * @author amos
 */

window.$es = window.$es || {
    componnents: {},
    getComponentById: function (id) {
        return this.componnents[id];
    },
    define: function (component) {
        if (this.componnents[component.id]) {
            throw `Component[${component.id}] aready exists!`;
        }
        this.componnents[component.id] = component;
    },
    on(event) {
        let element = event.srcElement;
        let name = 'on' + event.type;
        while (element) {
            if (element.$script) {
                break;
            }
            element = element.parentNode;
        }
        if (!element) {
            return undefined;
        }

        let script = element.$script;
        let handle = script.$instance.events[name];
        let handled = handle ? handle.bind(script.$instance, event).call() : false;
        let exName = script.$extend.events[name];
        if (exName && (script = script.$parent)) {
            handle = script.$instance.events[exName];
            if (handle) {
                handled |= handle.bind(script.$instance, event).call();
            }
        }

        return handled;
    }
};

Object.merge_es_private = function (dst, ...rest) {
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
            let e = src[key];
            dst[key] = typeof e != 'object' ? e : Object.merge_es_private(dst[key] || {}, e);
        }
    }
    return dst;
};

class ElemScript extends HTMLScriptElement {
    static get observedAttributes() {
        return ['id', 'type', 'is', 'component'];
    }

    constructor(...args) {
        super(...args);
        this.$children = [];
        this.setAttribute('type', 'text/e+s');
        this.$shadow = document.createElement('div');
        this.$shadow.$script = this;
        setTimeout(() => {
            this.reload();
        }, 0);
    }

    connectedCallback() {
        this.parentNode.appendChild(this.$shadow);

        let parNode = this.parentNode;
        let parScript = undefined;
        while (parNode) {
            if (parNode.$script) {
                parScript = parNode.$script;
                break;
            }
            parNode = parNode.parentNode;
        }
        if (parScript) {
            this.$parent = parScript;
            this.$parent.$children.push(this);
        }
    }

    disconnectedCallback() {
        if (this.$instance && this.$instance.isMounted) {
            if (this.$instance.destroyed) {
                this.$instance.destroyed.bind(this.$instance, this).call();
            }
        }
        if (this.$parent) {
            this.$parent.$children.splice(this.$parent.$children.indexOf(this), 1);
        }
        if (this.parentNode) this.parentNode.removeChild(this.$shadow);
    }

    adoptedCallback() {}

    attributeChangedCallback(name, oldValue, newValue) {
        if ('component;'.indexOf(name) >= 0) {
            setTimeout(() => {
                this.reload();
            }, 0);
        }
    }

    getComponentById(compId) {
        if (compId[0] == '#') { //is template id
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

    reshape(compId) {
        if (this.$instance && this.$instance.isMounted) {
            if (this.$instance.destroyed) {
                this.$instance.destroyed.bind(this.$instance, this).call();
            }
        }
        //default value
        this.$component = {
            data: {},
            styles: {},
            slots: {},
            events: {},
            updates: {
                data: {},
                styles: {}
            },
            render: function () {
                this.$shadow.innerHTML = eval('(' + '`' + this.template + '`' + ')');
                if (this.styles && this.styles.default) {
                    this.$shadow.style = Object.keys(this.styles.default).map(key => {
                        return `${key}:${this.styles.default[key]}`;
                    }).join(';');
                }
            }
        };
        this.$extend = {
            binding: {
                data: {},
                styles: {}
            },
            data: {},
            styles: {},
            slots: {},
            events: {}
        };
        this.$instance = {
            $script: this,
            $shadow: this.$shadow,
            isMounted: false,
            styles: {},
            render: function () {
                this.$shadow.innerHTML = '';
            }
        };
        if (!compId) {
            return false;
        }

        //object constructing
        this.$component = Object.merge_es_private(this.$component, this.getComponentById(compId));

        let src = this.innerHTML.trim();
        if (src) {
            let extend = eval(`(${src})`);
            if (!extend) {
                throw `Illegal script found!`;
            }
            Object.merge_es_private(this.$extend, extend);
            this.innerHTML = '';
        }

        this.$instance = Object.merge_es_private(this.$instance, this.$component, {
            data: this.$extend.data,
            styles: this.$extend.styles,
            slots: this.$extend.slots
        });

        //proxies
        for (const kname of ['data', 'styles']) {
            this.$instance[kname] = new Proxy(this.$instance[kname], {
                script: this,
                get: function (target, key, receiver) {
                    let bindingKey = this.script.$extend.binding[kname][key];
                    if (bindingKey && this.script.$parent) {
                        return this.script.$parent.$instance[kname][bindingKey];
                    }
                    return Reflect.get(target, key, receiver);
                },
                set: function (target, key, value, receiver) {
                    if (key[0] == '?') { // is from children ?
                        key = key.substring(1);
                    } else {
                        let oldVal = typeof target[key] == 'object' ? Object.merge_es_private({}, target[key]) : target[key];
                        setTimeout(() => {
                            //tries to update first
                            if (!this.script.update(kname, key, oldVal, value)) {
                                //renders all content
                                this.script.render();
                            }
                        }, 0);
                    }
                    let bindingKey = this.script.$extend.binding[kname][key];
                    if (bindingKey && this.script.$parent) {
                        this.script.$parent.$instance[kname][`?${bindingKey}`] = value;
                        return true;
                    }
                    return Reflect.set(target, key, value, receiver);
                }
            });
        }

        if (this.$instance.created) {
            this.$instance.created.bind(this.$instance, this).call();
        }

        return true;
    }

    reload() {
        let compId = this.getAttribute('component');
        if (!this.$component || !this.$component.id || this.$component.id != compId) {
            this.reshape(compId);
        }

        this.$instance.render.bind(this.$instance).call();

        if (!this.$instance.isMounted) {
            this.$instance.isMounted = true;
            //binds events
            let element = this.$shadow.children[0];
            for (const ename in this.$extend.events) {
                element.setAttribute(ename, `$es.on(event)`);
            }
            if (this.$instance.mounted) {
                this.$instance.mounted.bind(this.$instance, this).call();
            }
        }
    }

    update(kname, key, oldVal, value) {
        let handled = false;

        {
            let handle = this.$instance.updates[kname][key];
            if (handle) {
                handled |= handle.bind(this.$instance, oldVal, value).call();
            }
        }

        for (const children of this.$children) {
            //finds it out from binding info
            for (const keyChildren in children.$extend.binding[kname]) {
                let valueChildren = children.$extend.binding[kname][keyChildren];
                if (valueChildren == key) {
                    //finds it out from updates info
                    let handle = children.$instance.updates[kname][keyChildren];
                    if (handle) {
                        handled |= handle.bind(children.$instance, oldVal, value).call();
                    } else {
                        children.render();
                        handled = true;
                    }
                }
            }
        }

        return handled;
    }

    render() {
        this.$instance.render.bind(this.$instance).call();
    }
};

customElements.define('es-script', ElemScript, {
    extends: 'script'
});

//router implementation
$es.router = {
    uriBase: '',
    urlPrefix: '',
    routes: {},
    stack: [],
    fromPath: function (path) {
        if (path == '/') {
            return this.routes.$;
        }
        let uri = path.split('#')[0];
        uri = uri.split('?')[0];
        if (!/^[0-9a-z_/]+[0-9a-z_]$/i.test(uri)) {
            return undefined;
        }
        let objPath = `this.routes${uri[0]=='/'?'':'.'}` + uri.split('/').join('.') + '.$';
        try {
            return eval(`(${objPath})`);
        } catch (e) {
            return undefined;
        }
    },
    define: function (component) {
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
    popstateChanged: function () {
        let uriCur = location.href.substring($es.router.urlPrefix.length);
        if (!this.stack.length || this.stack[this.stack.length - 1].$component.id == uriCur) {
            return;
        }
        let i = this.stack.length;
        while (i) {
            this.stack[--i].reload();
        }
    },
    goto: function (uri) {
        if (uri.startsWith('http:') || uri.startsWith('https:') || uri.startsWith('file:')) { //full url
            window.location.href = uri;
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
            window.history.pushState({
                key: Date.now().toFixed(3)
            }, '', $es.router.urlPrefix + uri);
            this.popstateChanged();
        }
    }
};

$es.router.urlPrefix = `${location.protocol}//${location.protocol == 'file:' ? location.pathname : (location.host + $es.router.uriBase)}#`;

class ElemRouter extends ElemScript {
    constructor(...args) {
        super(...args);
    }

    connectedCallback() {
        super.connectedCallback();
        if (!$es.router.stack.length) {
            window.addEventListener("popstate", $es.router.popstateChanged.bind($es.router));
        }
        this.depth = $es.router.stack.length;
        $es.router.stack.push(this);
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

    getComponentById(compId) {
        let comp = $es.router.fromPath(compId);
        if (!comp) {
            throw `Component[${compId}] not found!`;
        }
        return comp;
    }

    reshape(compId) {
        if (this.isTop()) {
            compId = '/';
        } else {
            if (compId[0] != '/') {
                throw `Illegal uri[${compId}]!`;
            }
            //test uri
            let uriOrg = location.href.substring($es.router.urlPrefix.length);
            if (compId && compId.startsWith(uriOrg)) {
                uriOrg = compId;
            }
            uriOrg = uriOrg.substring(1);
            let names = uriOrg.split('#')[0].split('?')[0].split('/');
            if (names.length < this.depth) {
                throw `Illegal uri[${uriOrg}]!`;
            } else {
                compId = '/' + names.slice(0, this.depth).join('/');
            }
        }
        if (super.reshape(compId)) {
            window.history.replaceState({
                key: Date.now().toFixed(3)
            }, '', $es.router.urlPrefix + compId);
            this.setAttribute('component', compId);
        }
    }
};
customElements.define('es-container', ElemRouter, {
    extends: 'script'
});