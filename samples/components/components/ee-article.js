$es.define({
    id: 'ee-article',
    template: '<article>${this.slots.header?"<header>" + this.slots.header + "</header>" : ""}<div>${this.data.content}</div>${this.slots.footer?"<footer>" + this.slots.footer + "</footer>" : ""}</article>',
    data: {
        content: 'This is an article.'
    },
    slots: {
        header: ``,
        footer: ``
    },
    styles: {
        header: {},
        footer: {}
    },
    updates: {
        data: {
            content(oldVal, newVal) {
                let e = this.$shadow.children[0];
                let ec = (e.children.length == 3) ? e.children[1] : e.children[0];
                ec.innerHTML = newVal;
                return true;
            }
        }
    },
    render: function () {
        this.$element.innerHTML = eval('(' + '`' + this.template + '`' + ')');
        let el = this.$element.children[0];
        if (el) {
            for (const name in this.styles) {
                if (name == 'default') {
                    let s = Object.keys(this.styles[name]).map(key => {
                        return `${key}:${this.styles[name][key]}`;
                    }).join(';');
                    if (s) el.style = s;
                    continue;
                }
                for (let i = 0; i < el.children.length; i++) {
                    let e = el.children[i];
                    if (e.tagName.toLowerCase() == name) { //apply style
                        let s = Object.keys(this.styles[name]).map(key => {
                            return `${key}:${this.styles[name][key]}`;
                        }).join(';');
                        if (s) e.style = s;
                        break;
                    }
                }
            }
        }
    }
});