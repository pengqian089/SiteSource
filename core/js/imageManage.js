$(function () {
    $("[data-img]").click(function (e) {
        let options = {index: $("[data-img]").index(this), event: event}
        blueimp.Gallery(document.querySelectorAll("[data-img]"), options);
    });

    $("[data-del]").click(function(){
        NProgress.start();
        let id = $(this).data("del");
        layer.confirm("确定删除？", {
            btn: ["确定", "取消"]
        }, function () {
            $.ajax({
                url: "/manage/Image/Delete", type: "post", data: {id: id}
            }).done(function (data) {
                if (data.success) {
                    NProgress.done();
                    layer.closeAll();
                    location.reload();
                }
            });
        });
    });

    $("[data-banner]").click(function(){
        NProgress.start();
        let id = $(this).data("banner");
        $.ajax({
            url: "/manage/Image/SetBanner", type: "post", data: {id: id}
        }).done(function (data) {
            if (data.success) {
                NProgress.done();
                location.reload();
            }
        });
    });
   
});