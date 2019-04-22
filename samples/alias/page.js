$es.define({
    id: 'page',
    template: `
    <div>
        <table>
            <tr>
                <td><es-use component="ee-button"><script type="text/es-extend">
                { alias: { title: 'this.data.title1'} }
                </script></es-use></td>

                <td><es-use component="ee-button"><script type="text/es-extend">
                { alias: { title: 'data.title2'} }
                </script></es-use></td>

                <td><es-use component="ee-button"><script type="text/es-extend">
                { alias: { title: 'this.data.title3'} }
                </script></es-use></td>

                <td><es-use component="ee-button"><script type="text/es-extend">
                { alias: { title: 'title4'} }
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
    }
});