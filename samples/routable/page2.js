$es.router.define({
    id: '/page2',
    template: `
    <p><span>$\{this.data.title\}</span></p>
    `,
    data: {
        title: 'This is page 2!'
    },
    styles: {
        default: {
            background: 'red',
            height: 500,
            width: '100%'
        }
    },
    created() {
        console.log("created", this);
    },
    mounted() {
        console.log("mounted", this);
    },
    destroyed() {
        console.log("destroyed", this);
    }
});