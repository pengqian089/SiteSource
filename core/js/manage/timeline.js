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
                        url: "/manage/Timeline/Delete",
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
                location.href = "/manage/Timeline/Save"
                break;
            case "update":
                if (selected.length === 0) {
                    layer.alert("请选择要操作的选择数据！");
                    return;
                }
                let defaultData = selected[0];
                location.href = "/manage/Timeline/Save/" + defaultData.id;
                break;
        }
    });

    $("#search").click(function () {
        reload();
    });

    function reload() {
        table.reload("list", {
            where: {
                content: $("#txtContent").val()
            },
            page: {
                curr: 1
            }
        });
    }


});