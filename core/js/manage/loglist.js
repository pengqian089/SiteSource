layui.use(["table", "form"], function () {
    let table = layui.table;

    table.init("log-list", {
        toolbar: "default"
    });

    table.on("toolbar(log-list)", function (obj) {
        console.log(obj);
    });

    $("#search").click(function () {
        table.reload("log-list", {
            where: {
                level: $("#level").val(),
                logger: $("#logger").val(),
                message: $("#txtMsg").val()
            },
            page:{
                curr:1
            }
        });
    });
});