$es.define({
    id: 'ee-button',
    template: '<button type="${this.data.type}" onclick="$es.on(event)">${this.data.title}</button>',
    data: {
        type: 'button',
        title: 'click'
    },
    events: {
        onclick: function (e) {
            console.log("onclick=", this, e);
            this.data.title = 'clicked';
        }
    },
    updates: {
        data: {
            title(oldVal, newVal) {
                this.$shadow.children[0].innerText = newVal;
                return true;
            }
        }
    }
});