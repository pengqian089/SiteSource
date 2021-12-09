layui.use(["table", "form", "layer"], function () {
    let table = layui.table, layer = layui.layer, form = layui.form;

    table.init("account-list", {
        toolbar: "default"
    });

    table.on("toolbar(account-list)", function (obj) {
        console.log(obj);
        let eventName = obj.event;
        let selected = table.checkStatus("account-list").data;

        switch (eventName) {
            case "delete":
                if (selected.length === 0) {
                    layer.alert("请选择要操作的选择数据！");
                    return;
                }
                // layer.confirm('确定删除吗？', function (index) {
                //    
                // });
                break;
            case "add":
                openSave();
                break;
            case "update":
                if (selected.length === 0) {
                    layer.alert("请选择要操作的选择数据！");
                    return;
                }
                //let defaultData = selected[0];
                //openSave(defaultData.id);
                break;
        }
    });

    $("#search").click(function () {
        reload();
    });


    function openSave() {
        layer.open({
            type: 1,
            title: "创建账号",
            content: $("#CreateAccount"),
            btn: ["确定", "取消"],
            yes: function (index, f) {
                let i = layer.load(1),
                    form = $(f).find("form")[0],
                    data = new FormData(form);
                $.ajax({
                    url: form.getAttribute("action"),
                    type: form.getAttribute("method"),
                    processData: false,
                    contentType: false,
                    data: data
                }).done(function (result) {
                    if (!result.success) {
                        layer.msg(result.msg);
                        return;
                    }
                    form.reset();
                    layer.close(index);
                    reload();
                }).always(function () {                    
                    layer.close(i);
                });
            }
        })
    }

    function reload() {
        table.reload("account-list", {
            where: {
                account: $("#txtAccount").val()
            },
            page: {
                curr: 1
            }
        });
    }

    $(document).delegate("[data-img]", "click", function (e) {
        let options = {
            index: $("[data-img]").index(this),
            event: e,
            urlProperty: 'img'
        };
        blueimp.Gallery(document.querySelectorAll("[data-img]"), options);
    });
    $(document).delegate("[data-enable]", "click", function (e) {
        let index = layer.load();
        $.ajax({
            url: "/manage/main/accountToEnable",
            type: "post",
            data: {id: $(this).data("enable")}
        }).done(function (result) {
            if (result.success) {
                reload();
            } else {
                layer.alert(result.msg);
            }
        }).always(function () {
            layer.close(index);
        });
    });
    $(document).delegate("[data-change]", "click", function (e) {
        layer.prompt(function (value, index, elem) {
            if (value.trim() === "") {
                layer.msg("请输入新密码");
                return;
            }
            let i = layer.load();
            $.ajax({
                url: "/manage/main/ChangePwd",
                type: "post",
                data: {id: $(this).data("change"), pwd: value}
            }).done(function () {
                layer.close(i);
                layer.close(index);
                reload();
            });
        });
    });
});