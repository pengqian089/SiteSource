function htmlEncodeByRegExp(str) {
    let temp = "";
    if (str.length === 0) return "";
    temp = str.replace(/&/g, "&amp;");
    temp = temp.replace(/</g, "&lt;");
    temp = temp.replace(/>/g, "&gt;");
    temp = temp.replace(/\s/g, "&nbsp;");
    temp = temp.replace(/\'/g, "&#39;");
    temp = temp.replace(/\"/g, "&quot;");
    return temp;
}

layui.use(["table", "form", "layer"], function () {
    let table = layui.table, layer = layui.layer;

    table.init("talk-list", {
        toolbar: "default"
    });

    table.on("toolbar(talk-list)", function (obj) {
        console.log(obj);
        let eventName = obj.event;
        let selected = table.checkStatus("talk-list").data;

        switch (eventName) {
            case "delete":
                if (selected.length === 0) {
                    layer.alert("请选择要操作的选择数据！");
                    return;
                }
                layer.confirm('确定删除吗？', function (index) {
                    let i = layer.load();
                    $.ajax({
                        url: "/manage/main/deleteTalk",
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
                openSave();
                break;
            case "update":
                if (selected.length === 0) {
                    layer.alert("请选择要操作的选择数据！");
                    return;
                }
                let defaultData = selected[0];
                openSave(defaultData.id);
                break;
        }
    });

    $("#search").click(function () {
        reload();
    });


    function openSave(id) {
        let iframe;
        let addIndex = layer.open({
            type: 2,
            title: '新增随手说',
            shadeClose: true,
            shade: true,
            maxmin: false, //开启最大化最小化按钮
            area: ['90%', '80%'],
            content: `/manage/main/SaveTalk${(id === undefined ? "" : "/" + id)}`,
            success: function (layero) {
                iframe = window[layero.find('iframe')[0]['name']];
            },
            end: function () {
                if (iframe.closeOrSuccess === 1) {
                    reload();
                }
            }
        });
        layer.iframeAuto(addIndex);
    }

    function reload() {
        table.reload("talk-list", {
            where: {
                content: $("#txtContent").val()
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