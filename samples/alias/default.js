$es.router.define({
    id: '/',
    template: `
    <div>
        <table>
            <tr algien=center><td colspan=4><strong>How to use alias to bind a variable of component.</strong></td></tr>
            <tr>
                <td><es-use component="ee-button"><script type="text/es-extend">
                { alias: { title: 'title1' } }
                </script></es-use></td>

                <td><es-use component="ee-button"><script type="text/es-extend">
                { alias: { title: 'title2' } }
                </script></es-use></td>

                <td><es-use component="ee-button"><script type="text/es-extend">
                { alias: { title: 'title3'} }
                </script></es-use></td>

                <td><es-use component="ee-button"><script type="text/es-extend">
                { alias: { title: 'title4'} }
                </script></es-use></td>
            </tr>
        </table>
        <es-use component='page'>
            <script type="text/es-extend">
                { 
                    alias: { 
                        title2: 'title5_2',
                        title3: 'title5_3',
                        title4: 'title5_4',
                    } 
                }
            </script>
        </es-use>
    </div>
    `,
    data: {
        title1: 'Button 1',
        title2: 'Button 2',
        title3: 'Button 3',
        title4: 'Button 4',
        title5_2: 'Button 5',
        title5_3: 'Button 6',
        title5_4: 'Button 7'
    }
});