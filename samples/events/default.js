$es.router.define({
    id: '/',
    template: `
    <div>
        <div><small>Please open the console view to see more details.</small></div>
        <table>
            <tr><td colspan=2><strong>How to use es event handler.</strong></td></tr>
            <tr>
                <td style="width:60px;"><es-use component="ee-button">
                {
                    events: {
                        onclick: 'onButton1Click'
                    }
                }
                </es-use></td>
                <td>Uses a function name to handle click event.</td>
            </tr>
            <tr>
                <td><es-use component="ee-button">
                {
                    events: {
                        onclick: 'onButton2Click'
                    }
                }
                </es-use></td>
                <td>Uses a function name to handle click event again.</td>
            </tr>
            <tr>
                <td><es-use component="ee-button">
                {
                    events: {
                        onmousedown: 'onMouseDown3'
                    }
                }
                </es-use></td>
                <td>Handles an event which is not listened by component.</td>
            </tr>
            <tr>
                <td><es-use component="ee-button">
                {
                    events: {
                        onclick: function(e) {
                            console.log('inside handler', e);
                        }
                    }
                }
                </es-use></td>
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