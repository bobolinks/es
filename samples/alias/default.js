$es.router.define({
    id: '/',
    template: `
    <div>
        <table>
            <tr algien=center><td colspan=4><strong>How to use alias to binding a variable of component.</strong></td></tr>
            <tr>
                <td><es-use component="ee-button"><script type="text/es-extend">
                { alias: { data: {title: 'title1'} } }
                </script></es-use></td>

                <td><es-use component="ee-button"><script type="text/es-extend">
                { alias: { data: {title: 'title2'} } }
                </script></es-use></td>

                <td><es-use component="ee-button"><script type="text/es-extend">
                { alias: { data: {title: 'title3'} } }
                </script></es-use></td>

                <td><es-use component="ee-button"><script type="text/es-extend">
                { alias: { data: {title: 'title4'} } }
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