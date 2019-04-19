$es.router.define({
    id: '/',
    template: `
    <p><span>This is default page.</span></p>
    <div style='background:lightgray'>
        <script is="es-container" component='/page1'></script>
    </div>
    `,
    created(script) {
        console.log("created", script);
    },
    mounted(script) {
        console.log("mounted", script);
    },
    destroyed(script) {
        console.log("destroyed", script);
    }
});