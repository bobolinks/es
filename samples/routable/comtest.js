$es.define({
    id: 'comtest',
    template: `
    <p><span>This is a span from comtest. title=$\{this.data.title2\}</span></p>
    <script is="es-script" component='ee-button'></script>
    <script is="es-script" component='ee-button'>{binding:{data:{title: 'title1'}},events:{onclick: 'onButtonClick', onmousedown: 'onButtonDown'}}</script>
    <script is="es-script" component='ee-button'>{binding:{data:{title: 'title2'}}}</script>
    <script is="es-script" component='ee-button'>{binding:{data:{title: 'title2'}}}</script>
    <script is="es-script" component='ee-label'></script>
    <script is="es-script" component='ee-article'></script>
    <script is="es-script" component='ee-article'>{binding:{data:{content: 'article'},styles:{footer: 'articleDefault'}},slots:{header:'<h1>Most important heading here</h1>',footer:'<p>This is footer.</p>'}}</script>
    `,
    data: {
        title1: 'button with event',
        title2: 'button 2',
        article: 'article sample',
    },
    styles: {
        default: {
        },
        articleDefault: {
            'font-size': '32',
            color: 'red'
        }
    },
    updates: {
        data: {
            title2(oldVal, newVal) {
                console.log('title2=', newVal);
                return true;
            }
        }
    },
    events: {
        onButtonClick: function(e) {
            console.log("onButtonClick=", this, e);
        },
        onButtonDown: function(e) {
            console.log("onButtonDown=", this, e);
        }
    },
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