"use strict";

(function(){
    //点赞
    $(document).delegate("[data-likeid]", "click", function () {
        let that = $(this);
        let index = layer.load(1);
        $.ajax({
            url: "/Talk/Like",
            data: { id: that.data("likeid") },
            type: "post"
        }).done(function (result) {
            if (result.success) {
                that.find("[data-number]").text(result.data);
            } else {
                layer.msg(result.msg, { icon: 2, anim: 6 });
            }
        }).always(function () {
            layer.close(index);
        });
    });

    // 碎碎念查看更多
    $(document).delegate(".mumble-more a", "click", function () {
        let more = $(this).parents(".mumble-more");
        let content = $(this).parents(".mumble-item").find(".mumble-content");
        if (!more.hasClass("mumble-pack-up")) {
            more.addClass("mumble-pack-up");
            content.removeClass("mumble-hide-sub");
            $(this).html("收起<i class=\"layui-icon layui-icon-up\">");
        } else {
            more.removeClass("mumble-pack-up");
            content.addClass("mumble-hide-sub");
            $(this).html("查看更多<i class=\"layui-icon layui-icon-down\">");
        }
    });

    // 展开碎碎念回复
    $(document).delegate("[data-comment-id]", "click", function () {
        let that = $(this);
        let comments = that.parents("div.mumble-item").find("div.mumble-comment[data-talk-id]");
        // if (comments.find("form").length > 0) {
        //     comments.hide(100, function () {
        //         comments.html("");
        //     });
        //     return;
        // }
        comments.hide("fast", function () {
            $(this).html("");
        });
        if (that.parent().hasClass("mumble-active")) {
            that.parent().removeClass('mumble-active');
            return;
        }
        that.parent().addClass("mumble-active");
        let index = layer.load(1);
        $.ajax({
            url: "/Comment/Mumble/" + that.data("commentId"),
            type: "get"
        }).done(function (result, status, xhr) {
            that.find("[data-comment-count]").text(xhr.getResponseHeader("commentCount"));
            comments.html(result);
            lightCode();
            comments.show();
            that.parents(".comment-parent").find("time.timeago").relativeTime();
        }).always(function () {
            layer.close(index);
        });
    });
})();