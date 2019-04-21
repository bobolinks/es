$es.router.define({
    id: '/',
    template: `
    <div>
        <table>
            <tr><td colspan=2><strong>How to use es event handler.</strong></td></tr>
            <tr>
                <td style="width:60px;"><es-use component="ee-button"><script type="text/es-extend">
                {
                    events: {
                        onclick: 'onButton1Click'
                    }
                }
                </script></es-use></td>
                <td>Uses a function name to handle click event.</td>
            </tr>
            <tr>
                <td><es-use component="ee-button"><script type="text/es-extend">
                {
                    events: {
                        onclick: 'onButton2Click'
                    }
                }
                </script></es-use></td>
                <td>Uses a function name to handle click event again.</td>
            </tr>
            <tr>
                <td><es-use component="ee-button"><script type="text/es-extend">
                {
                    events: {
                        onmousedown: 'onMouseDown3'
                    }
                }
                </script></es-use></td>
                <td>Handles an event which is not listened by component.</td>
            </tr>
            <tr>
                <td><es-use component="ee-button"><script type="text/es-extend">
                {
                    events: {
                        onclick: function(e) {
                            console.log('inside handler', e);
                        }
                    }
                }
                </script></es-use></td>
                <td>Uses an inside function to handle click event.</td>
            </tr>
        </table>
    </div>
    `,
    events: {
        onButton1Click: function(e) {
            console.log('onButton1Click handled', e);
        },
        onButton2Click: function(e) {
            console.log('onButton2Click handled', e);
        },
        onMouseDown3: function(e) {
            console.log('onMouseDown3 handled', e);
        }
    }
});