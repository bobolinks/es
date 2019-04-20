$es.router.define({
    id: '/',
    template: `
    <div>
        <div><small>Please open the console view to see more details.</small></div>
        <table>
            <tr align=center style='background:lightgray'>
                <td style='width:50%'><button onclick='window.tstick = Date.now(); $es.it("idslow").data.title="Title[changed]";'>slow render</button><td>
                <td style='width:50%'><button onclick='window.tstick = Date.now(); $es.it("idfast").data.title="Title[changed]";'>fast render</button><td>
            </tr>
            <tr style='height:500'>
                <td><es-use id='idslow' component='slow'></es-use><td>
                <td><es-use id='idfast' component='fast'></es-use><td>
            </tr>
        </table>
    </div>
    `
});