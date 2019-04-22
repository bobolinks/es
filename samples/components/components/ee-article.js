$es.define({
    id: 'ee-article',
    template: '<article>${this.slots.header?"<header name=article-header>" + this.slots.header + "</header>" : ""}<div>${this.data.content}</div>${this.slots.footer?"<footer name=article-footer>" + this.slots.footer + "</footer>" : ""}</article>',
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
    accelerator: {
        content(newVal) {
            let e = this.$element.children[0];
            let ec = (e.children.length == 3) ? e.children[1] : e.children[0];
            ec.innerHTML = newVal;
            return true;
        }
    },
    applyStyles: function (styleName) {
        let el = this.$element.children[0];
        if (el) {
            if (styleName) {
                let sty = this.styles[styleName];
                if (!sty) {
                    throw `Style [${styleName}] not found!`;
                }
                let ee = styleName == 'default' ? [el] : el.querySelector(`input[name="article-${styleName}"]`);
                let s = Object.keys(sty).map(key => {
                    return `${key}:${sty[key]}`;
                }).join(';');
                if (!s || !ee) {
                    return;
                }
                for (let e of ee) {
                    e.style = s;
                }
            } else {
                for (let styleName in this.styles) {
                    let sty = this.styles[styleName];
                    let e = styleName == 'default' ? el : el.querySelector(`${styleName}[name="article-${styleName}"]`);
                    if (!e) {
                        continue;
                    }
                    let s = Object.keys(sty).map(key => {
                        return `${key}:${sty[key]}`;
                    }).join(';');
                    if (!s) {
                        continue;
                    }
                    e.style = s;
                }
            }
        }
    }
});