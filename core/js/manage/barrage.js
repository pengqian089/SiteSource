layui.use(["table", "form","layer"], function () {
    let table = layui.table,layer = layui.layer;

    table.init("list", {
        toolbar: "default"
    });

    table.on("toolbar(list)", function (obj) {
        let eventName = obj.event;
        let selected = table.checkStatus("list").data;
        switch (eventName) {
            case "delete":
                if (selected.length === 0) {
                    layer.alert("请选择要操作的选择数据！");
                    return;
                }
                layer.confirm('确定删除吗？', function (index) {
                    let i = layer.load();
                    $.ajax({
                        url: "/manage/Barrage/Delete",
                        type: "post",
                        data: {id: selected.select(x => x.id)}
                    }).done(function () {
                        layer.close(i);
                        layer.close(index);
                        reload();
                    });
                });
                break;
            case "add":
                layer.msg("未实现");
                break;
            case "update":
                layer.msg("未实现");
                break;
        }
    });

    $("#search").click(function () {
        reload();
    });

    function reload() {
        table.reload("list", {
            where: {
                text: $("#txtText").val(),
                group:$("#group").val()
            },
            page: {
                curr: 1
            }
        });
    }

    
});