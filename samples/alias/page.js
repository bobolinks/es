$es.define({
    id: 'page',
    template: `
    <div>
        <table>
            <tr>
                <td><es-use component="ee-button"><script type="text/es-extend">
                { alias: { data: {title: 'title1'} } }
                </script></es-use></td>

                <td><es-use component="ee-button"><script type="text/es-extend">
                { alias: { data: {title: 'title2'}, styles: {default: 'style1'} } }
                </script></es-use></td>

                <td><es-use component="ee-button"><script type="text/es-extend">
                { alias: { data: {title: 'title3'}, styles: {default: 'style2'} } }
                </script></es-use></td>

                <td><es-use component="ee-button"><script type="text/es-extend">
                { alias: { data: {title: 'title4'}, styles: {default: 'style2'} } }
                </script></es-use></td>
            </tr>
        </table>
    </div>
    `,
    data: {
        title1: 'Button 1',
        title2: 'Button 2',
        title3: 'Button 3',
        title4: 'Button 4'
    },
    styles: {
        style1: {
            background: 'green'
        },
        style2: {
            background: 'blue'
        }
    }
});