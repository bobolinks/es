$es.router.define({
    id: '/',
    template: `
    <p><span>This is default page.</span></p>
    <div style='background:green; padding-top:10px;'>
        <es-slot component='/page1'></es-slot>
    </div>
    `,
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