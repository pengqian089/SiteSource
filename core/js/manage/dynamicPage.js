layui.use(["table", "form"], function () {
    let table = layui.table;

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
                        url: "/manage/DynamicPage/Delete",
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
                location.href = "/manage/DynamicPage/Save"
                break;
            case "update":
                if (selected.length === 0) {
                    layer.alert("请选择要操作的选择数据！");
                    return;
                }
                let defaultData = selected[0];
                location.href = "/manage/DynamicPage/Save/" + defaultData.id;
                break;
        }
    });

    $("#search").click(function () {
        reload();
    });

    function reload() {
        table.reload("list", {
            where: {
                name: $("#txtName").val()
            },
            page: {
                curr: 1
            }
        });
    }

    $(document).delegate(".preview[data-url]", "click", function () {
        let url = $(this).data("url");
        layer.open({
            type: 2,
            title: '预览内容',
            shadeClose: true,
            shade: true,
            maxmin: false, //开启最大化最小化按钮
            area: ['90%', '80%'],
            content: url
        });
    });
});