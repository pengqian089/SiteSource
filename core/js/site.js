let dpzOption = {
    /**
     * webapi地址
     */
    webApiBaseAddress: document.head.querySelector("meta[name=web-api-base-address]").content,
    /**
     * cdn地址
     */
    CDNBaseAddress: document.head.querySelector("meta[name=cdn-base-address]").content,
    /**
     * 是否为 dark模式
     */
    isDark: false
};
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    dpzOption.isDark = true;
}

layui.use(["element", "layer", "carousel", "util", "flow", "form", "upload"],
    function () {
        let element =
            layui.element,
            layer = layui.layer,
            carousel = layui.carousel,
            flow = layui.flow,
            util = layui.util;
        util.fixbar({
            bar1: "&#xe64a;",
            css: { bottom: 55 },
            click: function (type) {
                //console.log(type);
                if (type === "bar1") {
                    let index = layer.load();
                    console.log(event);
                    $.ajax({ url: "/Home/TodayWallpaper" })
                        .done(function (result) {
                            let items = [];
                            for (let item of result) {
                                items.push({
                                    src: item["url"].replaceAll("1920x1080", "UHD"),
                                    w: 1920,
                                    h: 1080,
                                    title: item["copyRight"]
                                });
                            }
                            let options = {
                                index: 0,
                                bgOpacity: 0.7,
                                showHideOpacity: true,
                                history: true,
                                getThumbBoundsFn: function (index) {
                                    let thumbnail = document.querySelectorAll(".layui-fixbar [lay-type=bar1]")[index];
                                    let pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                                    let rect = thumbnail.getBoundingClientRect();
                                    return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
                                }
                            };
                            let gallery = new PhotoSwipe(document.getElementById("gallery"), PhotoSwipeUI_Default, items, options);
                            gallery.init();
                        })
                        .always(function () {
                            layer.close(index);
                        });
                }
            }
        });
        flow.lazyimg();
        let lazyLoadInstance = new LazyLoad({});

        if (layui.device().mobile === false) {
            //雨滴背景
            try {
                const canvas = document.querySelector("#can-back-round");
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;

                const raindropFx = new RaindropFX({
                    canvas: canvas,
                    background:
                        dpzOption.isDark ? `${dpzOption.CDNBaseAddress}/../images/core-background2.jpeg` : `${dpzOption.CDNBaseAddress}/../images/background.jpg`,
                });

                window.onresize = () => {
                    const rect = canvas.getBoundingClientRect();
                    raindropFx.resize(rect.width, rect.height);
                }
                raindropFx.start();
            } catch (e) {
                console.log(e);
            }
        }

        // $.ajax({url: "/Home/Wallpaper"}).done(function (result) {
        //     console.log("bing wallpaper loaded success.")
        //    
        //
        // });

        $.ajax({ url: "/account/GetUserInfo" })
            .done(function (result) {
                if (result.success) {
                    $(".blog-user")
                        .attr("href", "/account")
                        .find("img")
                        .attr({ "src": `${result.data.avatar}?width=400&height=400`, "title": result.data.name });
                }
            }).fail(ajaxFail);

        function showCaptcha(scene, successCallback) {
            let captcha = new TencentCaptcha('2084420298', function (res) {
                console.log(res);
                if (res.ret === 0) {
                    successCallback(res);
                }
            }, {
                bizState: scene,
                enableDarkMode: true,
                needFeedBack: true
            });
            captcha.show();
        }

        //侧边导航开关点击事件
        $(document).delegate(".blog-navicon", "click", function () {
            let sear = new RegExp("layui-hide");
            if (sear.test($(".blog-nav-left").attr("class"))) {
                leftIn();
            } else {
                leftOut();
            }
        });

        //侧边导航遮罩点击事件
        $(document).delegate(".blog-mask", "click", function () {
            leftOut();
        });

        //类别导航开关点击事件
        $(document).delegate(".category-toggle", "click", function () {
            categroyIn();
        });

        //类别导航点击事件，用来关闭类别导航
        $(document).delegate(".article-category", "click", function () {
            categoryOut();
        });

        //具体类别点击事件
        $(document).delegate(".article-category > a", "click", function () {
            $(".article-category > a").removeClass("tag-this");
            $(this).addClass("tag-this");
        });

        $(document).on("pjax:send", function () {
            NProgress.start();
        });

        let titleValue = "";
        $(document).on("pjax:complete", function (event, xhr) {
            titleValue = xhr.getResponseHeader("title")
            if(titleValue === "" || titleValue === null){
                document.title = "（；´д｀）ゞ标题不见啦 - 叫我阿胖";
            }else{
                document.title = Base64.decode(titleValue);
            }            
            element.render();
            categoryOut();
            leftOut();
            pjaxCompleteInit();
            NProgress.done();

        });
        $(document).on("pjax:end", function () {
            // pjax 跳转后热榜滚动翻页数据初始化
            $topicComments = $("#topic-comments");
            topicId = $topicComments.data("topicId");
            commentSize = parseInt($topicComments.data("commentSize"));
            startPage = parseInt($topicComments.data("commentStartPage"));
            totalPage = parseInt($topicComments.data("totalPage"));
            sort = $topicComments.data("commentSort");
            lazyLoadInstance.update();
        });

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
            comments.hide("fast",function () {
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
                //data: { id: that.data("commentId") },
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


        let viewImages = ".article.shadow .article-left img,.mumble-list .mumble-item .mumble-content img,.article-detail-content img,#cd-timeline .content img";
        //图片查看
        $(document).delegate(viewImages, "click", function () {
            let index = layer.load(1);
            let images = $(viewImages);
            loadImages(images).then(x => {
                let items = [];
                for (let i = 0; i < x.length; i++) {
                    let img = x[i];
                    items.push({
                        src: img.src,
                        w: img.naturalWidth,
                        h: img.naturalHeight,
                        title: img.alt
                    });
                }
                let imageIndex = images.index(this);
                let options = {
                    index: imageIndex,
                    bgOpacity: 0.7,
                    showHideOpacity: true,
                    history: true,
                    getThumbBoundsFn: function (index) {
                        let thumbnail = document.querySelectorAll(viewImages)[index];
                        let pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
                        let rect = thumbnail.getBoundingClientRect();
                        return { x: rect.left, y: rect.top + pageYScroll, w: rect.width };
                    }
                };
                let gallery = new PhotoSwipe(document.getElementById("gallery"), PhotoSwipeUI_Default, items, options);
                gallery.init();
            }).finally(() => layer.close(index));
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

        $(document).delegate(".content-detail .more a", "click", function () {
            let more = $(this).parents(".more");
            let content = $(this).parents(".content-detail").find(".content");
            if (!more.hasClass("show-more")) {
                more.addClass("show-more");
                content.removeClass("hide-content");
                $(this).html("收起<i class=\"layui-icon layui-icon-up\">");
            } else {
                more.removeClass("show-more");
                content.addClass("hide-content");
                $(this).html("查看更多<i class=\"layui-icon layui-icon-down\">");
            }
        });

        $(document).delegate("#i-search", "submit", function () {
            const keyword = $("#i-keyword").val();
            let q = $(this).find("[name=q]");
            $(this).find("[name=q]").val(q.data("default") + " " + keyword);
        });

        $(document).delegate("#i-keyword", "keyup", function (e) {
            if (e.keyCode === 13) {
                $(this).parents("form").submit();
            }
        });

        $(document).delegate("#i-search a.search-btn", "click", function () {
            $(this).parents("form").submit();
        });

        // 热榜查看更多
        $(document).delegate(".blog-module.shadow .more a", "click", function () {
            let more = $(this).parents(".more");
            let content = $(this).parents(".blog-module.shadow").find(".topic");
            if (!more.hasClass("show-more")) {
                more.addClass("show-more");
                content.removeClass("hide-content");
                $(this).html("收起<i class=\"layui-icon layui-icon-up\">");
            } else {
                more.removeClass("show-more");
                content.addClass("hide-content");
                $(this).html("查看更多<i class=\"layui-icon layui-icon-down\">");
            }
        });
        // 删除热榜
        $(document).delegate("a[data-topic-delete]", "click", function () {
            let id = $(this).data("topicDelete");
            layer.confirm("删除后不可恢复，是否删除？", function (index) {
                layer.close(index);
                let loadIndex = layer.load();
                $.ajax({
                    url: "/topic/deleteTopic",
                    data: { id: id },
                    type: "post"
                }).done(function (result) {
                    if (!result.success) {
                        layer.msg(result.msg, { icon: 2, anim: 6 });
                    } else {
                        $.pjax({ url: location.pathname, container: '.blog-main-left', scrollTo: true });
                    }
                }).always(function () {
                    layer.close(loadIndex);
                }).fail(ajaxFail);
            });
        });

        // 删除热榜中的某个回复
        $(document).delegate("a[data-topic-comment-delete]", "click", function () {
            let id = $(this).data("topicCommentDelete");
            layer.confirm("删除后不可恢复，是否删除？", function (index) {
                layer.close(index);
                let loadIndex = layer.load();
                $.ajax({
                    url: "/topic/deleteComment",
                    data: { id: id },
                    type: "post"
                }).done(function (result) {
                    if (!result.success) {
                        layer.msg(result.msg, { icon: 2, anim: 6 });
                    } else {
                        $.pjax({ url: location.pathname, container: '.blog-body', scrollTo: true });
                    }
                }).always(function () {
                    layer.close(loadIndex);
                }).fail(ajaxFail);
            });
        });

        if (window.scrollY > 0) {
            $(".blog-nav").css({ "background-color": "rgba(57,61,73,.5)", "backdrop-filter": "blur(100px)" });
        }


        let $topicComments = $("#topic-comments");
        //let commentCount = parseInt($topicComments.data("count"));
        let topicId = $topicComments.data("topicId");
        let commentSize = parseInt($topicComments.data("commentSize"));
        let startPage = parseInt($topicComments.data("commentStartPage"));
        let totalPage = parseInt($topicComments.data("totalPage"));
        let sort = $topicComments.data("commentSort");
        let paging = false;

        function nextPage() {
            if (paging === true) return;
            paging = true;
            $("#topic-comment-loading").show();
            $.ajax({
                url: "/topic/commentPage",
                data: { id: topicId, pageIndex: startPage, pageSize: commentSize, sort: sort },
                type: "get"
            }).done(function (result) {
                //console.log(`current page index:${startPage},last page index:${totalPage}`);
                startPage++;
                let $nextResult = $(result);
                $("#topic-comments").append($nextResult);
                $nextResult.find("time.timeago").relativeTime();
                $nextResult.find("pre code").each(function (index, element) {
                    //hljs.highlightElement(element);
                    Prism.highlightElement(block);
                });
                topicHideMore($nextResult.find(".article-detail-content.topic"));
                lazyLoadInstance.update();
            }).always(function () {
                paging = false;
                $("#topic-comment-loading").hide();
            }).fail(function (data) {
                if (data && data.responseJSON && data.responseJSON.success === false) {
                    layer.alert(data.responseJSON.msg);
                }
            });
        }

        let throttleTimer = null;
        let throttleDelay = 100;
        let $window = $(window);
        let $document = $(document);

        $window
            .off('scroll', scrollHandler)
            .on('scroll', scrollHandler);

        function scrollHandler(e) {
            clearTimeout(throttleTimer);
            throttleTimer = setTimeout(function () {
                // 顶部菜单是否开启高斯模糊
                if (window.scrollY > 0) {
                    $(".blog-nav").css({ "background-color": "rgba(57,61,73,.5)", "backdrop-filter": "blur(100px)" });
                } else if (window.scrollY === 0) {
                    $(".blog-nav").css({ "background-color": "rgb(57,61,73)", "backdrop-filter": "none" })
                }
                // 热榜滚动翻页
                if ($topicComments.length === 0 || startPage > totalPage) return;
                if ($window.scrollTop() + $window.height() > $document.height() - 120) {
                    nextPage();
                }

            }, throttleDelay);
        }

        // 评论查看更多
        $(document).delegate(".comments-area .load-more button", "click", function () {
            let $area = $(this).parents(".comments-area");
            let $loadMore = $(this).parent();
            let $commentCount = $(this).parents().find(".comment-count span")
            let src = $(this).parent().data("loadingIco");
            $loadMore.html(`<img src="${src}" class="comment-loading" alt="loading"/>`);
            let pageIndex = parseInt($(this).data("pageIndex"));
            let pageSize = parseInt($(this).data("pageSize"));
            // let count = parseInt($(this).data("itemCount"));
            // let pageCount = parseInt($(this).data("pageCount"));
            // let node = $(this).data("node");
            // let relation = $(this).data("relation");
            let request = $(this).data("pageRequest");
            let $that = $(this);
            $.ajax({
                url: request,
                type: "get",
                data: { pageIndex: pageIndex + 1, pageSize: pageSize }
            }).done(function (result, _, xhr) {
                //let nextPage = $(result).find(".comments-area").html();
                $area.append(result);
                $loadMore.remove();
                $commentCount.text(xhr.getResponseHeader("commentCount"));
                $("time.timeago").relativeTime();
                lightCode();
            }).fail(ajaxFail);
        });

        $(document).delegate("form.comment-form :input:not(textarea)", "keydown", function (e) {
            return e.key != "Enter";
        });

        // 提交评论
        $(document).delegate("form.comment-form", "submit", function () {
            event.preventDefault();
            let data = new FormData(this);
            let $that = $(this);
            let $commentCount = $(this).parents(".comment-block").find(".comment-count span");
            $(this)
                .find("button.layui-btn.layui-btn-sm")
                .addClass("layui-btn-disabled")
                .attr("disabled", "disabled")
                .html(`<i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop layui-font-12"></i> 发送`);
            $.ajax({
                url: $that.attr("action"),
                processData: false,
                contentType: false,
                data: data,
                type: "post"
            }).done(function (result, _, xhr) {
                if (result.hasOwnProperty("success") && result["success"] === false) {
                    layer.msg(result.msg, { icon: 2, anim: 6 });
                } else {
                    let $form = $that.clone();
                    let $commentBlock = $that.parents(".comment-block");
                    let $area = $commentBlock.find(".comments-area:first");
                    $commentBlock.find(".comments-area").html(result);
                    $that.remove();

                    $form.find("textarea").val("");
                    $form
                        .find("button.layui-btn.layui-btn-sm")
                        .removeClass("layui-btn-disabled")
                        .removeAttr("disabled")
                        .html("发送");
                    $form.find("input[name=replyId]").val("");
                    $form.find(".comment-btn-close").hide();
                    $form.find(".comment-btn-close").unbind("click");
                    $area.before($form);
                    $commentCount.text(xhr.getResponseHeader("commentCount"));
                    $("time.timeago").relativeTime();
                    lightCode();
                }
            }).always(function () {
                $that
                    .find("button.layui-btn.layui-btn-sm")
                    .removeClass("layui-btn-disabled")
                    .removeAttr("disabled")
                    .html("发送");
            });
        });

        // 刷新评论
        $(document).delegate(".comment-count button.refresh", "click", function () {
            let $area = $(this).parents(".comment-block").find(".comments-area");
            let request = $(this).data("refresh") + "?t=" + new Date().getTime();
            let $commentCount = $(this).parent().find("span");
            let index = layer.load();
            $.ajax({
                url: request,
                type: "get"
            }).done(function (result, _, xhr) {
                $area.html(result);
                $commentCount.text(xhr.getResponseHeader("commentCount"));
                $("time.timeago").relativeTime();
                lightCode();
            }).fail(ajaxFail).always(function () {
                layer.close(index);
            });
        });

        // 添加网络图片
        $(document).delegate(".footer-action-item[data-image]", "click", function () {
            let $editor = $(this).parents().find("textarea.comment-form-editor");
            layer.prompt({
                title: "请输入网络图片地址",
            }, function (value, index) {
                let url;
                try {
                    url = new URL(value);
                } catch {
                    layer.msg("请输入正确的地址嗷~");
                    return;
                }
                if (url.protocol !== "https:") {
                    layer.msg("使用https协议的网络图片嗷~");
                    return;
                }
                let markdownImg = `![](${url.toString()})`;
                $editor.val($editor.val() + "\r\n" + markdownImg);
                layer.close(index);
            });
        });

        // 回复按钮事件
        $(document).delegate(".comments-area blockquote.comment-item button.btn-reply", "click", function () {
            //debugger;
            let $form = $(this).parents(".comment-block").find("form.comment-form");
            let $formClone = $form.clone();
            $form.remove();
            let $that = $(this);
            $formClone.find("input[name=replyId]").val($(this).data("replyId"));
            $formClone.find(".comment-btn-close").show();
            $formClone.find(".comment-btn-close").bind("click", function () {
                $formClone.find("input[name=replyId]").val("");
                $that.parents(".comments-area").before($formClone);
                $(this).hide();
                $(this).unbind("click");
            });
            $(this).parents(".comment-block blockquote.comment-item:first").find(".detail > .comment-content:first").after($formClone);
        });

        // steam 查看统计
        $(document).delegate(".loading-summary a[data-summary]","click",function(){
            let request = $(this).data("summary");
            let $that = $(this);
            let $achievements = $(this).parents(".game-achievements");
            $(this).parent().next().show();
            $(this).parent().remove();
            $.ajax({
                url:request,
                type:"get"
            }).done(function(result){
                $achievements.html(result);
            });
        });

        $(document).delegate("[data-tips]", "touchend", function () {
            let tips = $(this).data("tips");
            layer.tips(tips,this,{tips:3});
        });

        $(document).delegate("time.timeago", "touchend", function () {
            let title = $(this).attr("title");
            layer.tips(title,this,{tips:3});
        });
    }
);

$(function () {
    $.fn.relativeTime = function () {
        this.each(function (index) {
            let status = $(this).data("timeStatus");
            if (typeof (status) === "undefined") {
                let datetime = $(this).attr("datetime");
                let text = $(this).text();
                let str = moment(datetime, "YYYY/MM/DD HH:mm:ss").fromNow();
                $(this).text(str).attr("title", text).data("timeStatus", "loaded");
            }
        });
    }

    $.pjax.defaults.timeout = 20000;
    $(document).pjax("nav.blog-nav ul.layui-nav>li>a,a[data-pjax]", ".blog-body");
    //文章翻页
    $(document).pjax("#blog-list a,.tags a", ".blog-main-left");
    $(document).pjax("#articl-comment a", "#blog-comment", { scrollTo: false });
    //碎碎念翻页
    $(document).pjax("#talk-pager a", ".mumble-list");
    //今日热榜翻页
    $(document).pjax("#topic-list a", ".blog-main-left");
    $(document).pjax(".code-box .box-rows .row .header a", ".code-box .box-rows");
    if ($.support.pjax) {
        $(".tags a").on("click",
            function (event) {
                $(".tags a").removeClass("tag-this");
                $(this).addClass("tag-this");
                let containerSelector = ".blog-main-left";
                $.pjax.click(event, { container: containerSelector });
            });
    }
    pjaxCompleteInit();

});

//显示侧边导航
function leftIn() {
    $(".blog-mask").unbind("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend");
    $(".blog-nav-left").unbind("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend");

    $(".blog-mask").removeClass("maskOut");
    $(".blog-mask").addClass("maskIn");
    $(".blog-mask").removeClass("layui-hide");
    $(".blog-mask").addClass("layui-show");

    $(".blog-nav-left").removeClass("leftOut");
    $(".blog-nav-left").addClass("leftIn");
    $(".blog-nav-left").removeClass("layui-hide");
    $(".blog-nav-left").addClass("layui-show");
}

//隐藏侧边导航
function leftOut() {
    $(".blog-mask").on("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
        function () {
            $(".blog-mask").addClass("layui-hide");
        });
    $(".blog-nav-left").on("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
        function () {
            $(".blog-nav-left").addClass("layui-hide");
        });

    $(".blog-mask").removeClass("maskIn");
    $(".blog-mask").addClass("maskOut");
    $(".blog-mask").removeClass("layui-show");

    $(".blog-nav-left").removeClass("leftIn");
    $(".blog-nav-left").addClass("leftOut");
    $(".blog-nav-left").removeClass("layui-show");
}

//显示类别导航
function categroyIn() {
    $(".category-toggle").addClass("layui-hide");
    $(".article-category")
        .unbind("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend");

    $(".article-category").removeClass("categoryOut");
    $(".article-category").addClass("categoryIn");
    $(".article-category").addClass("layui-show");
}

//隐藏类别导航
function categoryOut() {
    $(".article-category").on("webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend",
        function () {
            $(".article-category").removeClass("layui-show");
            $(".category-toggle").removeClass("layui-hide");
        });

    $(".article-category").removeClass("categoryIn");
    $(".article-category").addClass("categoryOut");
}

/**
 * 高亮显示代码块
 */
function lightCode() {
    document.querySelectorAll("pre code").forEach((block) => {
        //hljs.highlightElement(block);
        Prism.highlightElement(block);
    });
    codeBlockTools();
}

/**
 * 代码块工具栏
 */
function codeBlockTools() {
    $('pre[class*=language-]').wrap('<div class="code-area" style="position: relative"></div>');

    // 代码收缩
    let $codeExpand = $('<i class="fa fa-angle-up fa-fw code-expand" aria-hidden="true" title="折叠"></i>');
    $('.code-area').prepend($codeExpand);
    $('.code-expand').on('click', function () {
        if ($(this).parent().hasClass('code-closed')) {
            $(this).siblings('pre').find('code').show();
            $(this).siblings('pre').find('.line-highlight').show();
            $(this).parent().removeClass('code-closed');
        } else {
            $(this).siblings('pre').find('code').hide();
            $(this).siblings('pre').find('.line-highlight').hide();
            $(this).parent().addClass('code-closed');
        }
    });

    // 复制
    let $copyIcon = $('<i class="fa fa-copy fa-fw code_copy" title="复制代码" aria-hidden="true"></i>')
    let $notice = $('<div class="codecopy_notice"></div>')
    $('.code-area').prepend($copyIcon)
    $('.code-area').prepend($notice)
    function copy(text, ctx) {
        if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
            try {
                document.execCommand('copy') // Security exception may be thrown by some browsers.
                layer.msg("复制成功");
            } catch (ex) {
                layer.msg("复制失败");
                return false;
            }
        } else {
            layer.msg("浏览器不支持");
        }
    }
    // 复制
    $('.code-area .fa-copy').on('click', function () {
        let selection = window.getSelection()
        let range = document.createRange()
        range.selectNodeContents($(this).siblings('pre').find('code')[0])
        selection.removeAllRanges()
        selection.addRange(range)
        let text = selection.toString()
        copy(text, this)
        selection.removeAllRanges()
    });

    // 显示代码语言
    let $highlightLang = $('<div class="code_lang" title="代码语言"></div>');
    $('pre').before($highlightLang);
    $('pre').each(function () {
        // let codeLanguage = $(this).attr('class');
        // if (!codeLanguage) {
        //     return true;
        // };
        let classes = $(this).prop("class").split(/\s+/);
        for (let item of classes) {
            if (item.startsWith("language")) {
                let languageName = item.replace("language-", "").trim();
                $(this).siblings(".code_lang").text(languageName);
                break;
            }
        }
        //let langName = codeLanguage.replace("line-numbers", "").trim().replace("language-", "").trim();

    });
}
(function () {
    codeBlockTools();
})();

function generateToc() {
    let toc = $(".js-toc");
    if (toc.length === 0) return;
    if ($(".article-detail-content").find("h1,h2,h3").length === 0) {
        tocbot.destroy();
        $("label.toc-icon.menu").hide();
        toc.hide();
        return;
    }
    tocbot.init({
        tocSelector: '.js-toc',
        contentSelector: '.article-detail-content',
        headingSelector: 'h1, h2, h3',
        hasInnerContainers: true,
    });
}

/**
 * pjax 请求完成
*/
function pjaxCompleteInit() {
    lightCode();
    generateToc();
    $("time.timeago").relativeTime();
    initVideoPlayer();
    initFetchContent();
}

(function () {
    moment.locale("zh-cn");

    const ap = new APlayer({
        container: document.getElementById("aplayer"),
        lrcType: 3,
        fixed: true
    });
    $.ajax("/Music/Recommend").done(function (result) {
        ap.list.add(result);
    });

    if (Notification.permission !== "granted") {
        Notification.requestPermission(function (permission) {
            if (permission === "granted") {
                console.info("通知已授权");
            }
        });
    }

    let num = 0;
    let connection = new signalR.HubConnectionBuilder().withUrl("/notification").build();

    connection.start().then(() => {
        connection.invoke("Init").catch(function (err) {
            return console.error(err.toString());
        });
    }).catch(x => console.error(x.toString()));

    connection.on("pushMusic", function (musics) {
        ap.list.add(musics);
        ap.list.switch(ap.list.audios.length - 1);
    });

    connection.on("pushMessage", function (result) {
        let option = { title: "小喇叭开始广播辣", content: result.markdown };
        let ntf = showNotify(option);
        if (ntf !== null) {
            //console.info(ntf);
            ntf.onclick = function () {
                window.open("/talk.html");
            };
        }
        console.info(result);
    });
    connection.on("pushLogMessage", function (type, message) {
        if (type === 0) {
            console.log(`%c LogMessage %c [${new Date().toISOString()}]  %c ${message}`,
                'color: #bb0662; background: #030307; padding:5px 0;',
                'color: #fadfa3; background: #393d49; padding:5px 0',
                'font-weight:bold; color: black; background: #77f2e1; padding:5px 0;');
            $.notify(`${moment().format('YYYY-MM-DD HH:mm:ss')}\n${message}`, "success");
        } else if (type === 1) {
            console.log(`%c LogMessage %c [${new Date().toISOString()}]  %c ${message}`,
                'color: #bb0662; background: #030307; padding:5px 0;',
                'color: #fadfa3; background: #393d49; padding:5px 0',
                'font-weight:bold; color: black; background: #fadfa3; padding:5px 0;');
            $.notify(`${moment().format('YYYY-MM-DD HH:mm:ss')}\n${message}`, "warn");
        } else if (type === 2) {
            console.log(`%c LogMessage %c [${new Date().toISOString()}]  %c ${message}`,
                'color: #bb0662; background: #030307; padding:5px 0;',
                'color: #fadfa3; background: #393d49; padding:5px 0',
                'font-weight:bold; color: black; background: red; padding:5px 0;');
            $.notify(`${moment().format('YYYY-MM-DD HH:mm:ss')}\n${message}`, "error");
        }
    });
    // connection.on("publishMessage", function (message) {
    //     console.log(`%c PublishMessage %c [${new Date().toISOString()}]  %c ${message}`,
    //         'color: #bb0662; background: #030307; padding:5px 0;',
    //         'color: #fadfa3; background: #393d49; padding:5px 0',
    //         'font-weight:bold; color: black; background: #77f2e1; padding:5px 0;');
    //     $.notify(`${moment().format('YYYY-MM-DD HH:mm:ss')}\n${message}`, "success");
    // });
    // connection.on("debuggerMessage", function (message) {
    //     console.log(`%c DebuggerMessage %c [${new Date().toISOString()}]  %c ${message}`,
    //         'color: #bb0662; background: #030307; padding:5px 0;',
    //         'color: #fadfa3; background: #393d49; padding:5px 0',
    //         'font-weight:bold; color: black; background: #fadfa3; padding:5px 0;');
    //     $.notify(`${moment().format('YYYY-MM-DD HH:mm:ss')}\n${message}`, "info");
    // });
    let cnBetaBox = null;
    connection.on("cnBetaSubscribe", function (result) {
        let values = [];
        if (result.hasOwnProperty("progressValues") && Array.isArray(result["progressValues"])) {
            for (let i = 0; i < result["progressValues"].length; i++) {
                let value = (result["progressValues"][i] * 100).toFixed(2);
                values.push(parseFloat(value));
            }
        }
        if (cnBetaBox == null) {
            cnBetaBox = notification.show({
                title: "CnBeta发布",
                content: result.message,
                bars: values
            });
        } else {
            notification.setContent(cnBetaBox, result.message);
            notification.setProgress(cnBetaBox, values);
        }
        switch (result.type) {
            case 0:
                outPutSuccess(result.message);
                break;
            case 1:
                outPutInfo(result.message);
                break;
            case 2:
                outPutError(result.message);
                break;
            case 3:
                outPutSuccess(result.message);
                setTimeout(function () {
                    notification.close(cnBetaBox);
                    cnBetaBox = null;
                }, 1000);
                break;
        }

    });

    let notificationBox = null;
    connection.on("hotTopicMessage", function (result) {

        let values = [];
        if (result.hasOwnProperty("progressValues") && Array.isArray(result["progressValues"])) {
            for (let i = 0; i < result["progressValues"].length; i++) {
                let value = (result["progressValues"][i] * 100).toFixed(2);
                values.push(parseFloat(value));
            }
        }
        if (notificationBox == null) {
            notificationBox = notification.show({
                title: "今日热榜发布",
                content: result.message,
                bars: values
            });
        } else {
            notification.setContent(notificationBox, result.message);
            notification.setProgress(notificationBox, values);
            if (result.type === 3) {
                setTimeout(function () {
                    notification.close(notificationBox);
                    notificationBox = null;
                }, 1000);
            }
        }
        outPutSuccess(result.message);
    });

    connection.on("ready", function (result) {
        console.info(result);
    });

    setTimeout(function () {
        updateRunTime();
    }, 1000);

    function updateRunTime() {
        connection.invoke("getRunTime");
    }

    connection.on("ReceiveRunTime", function (msg) {
        let runTime = $("#runTime");
        if (runTime.length > 0) {
            runTime.text("运行时间 " + msg);
            setTimeout(updateRunTime, 1000);
        }
    });

    async function start() {
        ///<summary>signalR 重连</summary>
        try {
            await connection.start();
            num = 0;
            console.log("connected");
        } catch (err) {
            if (num > 10) {
                console.log("try connect 10");
                console.log(err);
            }
            console.log(err);
            setTimeout(() => start(), 3000);
        }
    }

    connection.onclose(async () => {
        num++;
        await start();
    });

    // DarkReader.auto({
    //     brightness: 100,
    //     contrast: 90,
    //     sepia: 10
    // });
})();

function showNotify(option) {
    let setting = {
        title: "",
        content: "",
        image: "/images/logo.png"
    };
    $.extend(setting, option);
    if (!("Notification" in window)) {
        return null;
    }

    if (Notification.permission === "granted") {
        return new Notification(setting.title, {
            icon: setting.image,
            body: setting.content,
            lang: "zh-cn",
            tag: setting.tag
        });
    }
    return null;
}

function loadImages(images) {
    let promises = [];
    for (let i = 0; i < images.length; i++) {
        let img = images[i];
        let promise = new Promise((resolve, reject) => {
            if (img.complete) {
                resolve(img);
                return;
            }
            img.addEventListener("load", function () {
                if (img.complete) {
                    resolve(img);
                } else {
                    reject(img);
                }
            });
            img.addEventListener("error", function () {
                console.warn(`the image [${img.src}] loaded error.`);
                reject(img);
            });
        });
        promises.push(promise);
    }
    return Promise.all(promises);
}


function topicHideMore($topic) {
    $topic.each(function (index) {
        let that = this;
        let images = $(this).find("img");
        if (images.length > 0) {
            loadImages(images).finally(() => showMore());
        } else {
            showMore();
        }

        function showMore() {
            let height = $(that).height();
            if (height > 500) {
                $(that).addClass("hide-content");
                $(that).parents(".blog-module.shadow").find(".more").removeClass("hide");
            }
        }
    });
}

let notification = {
    /**
     * 显示通知框
     * @typedef Options
     * @property {string} title
     * @property {string} content
     * @property {number[]} bars
     * @param {Options} option
     * */
    show: function (option) {
        if (typeof option !== "object") option = {};
        let setting = {
            title: "",
            content: "",
            bars: []
        };
        $.extend(setting, option);
        let top = 0;
        $(".notification-box").each(function () {
            top += ($(this).height() + 15);
        });
        let $box = createBox(setting.title, setting.content);
        $box.css("top", `${(top + 15)}px`)
        $("body").append($box);

        function createBox(title, content) {
            let $box = $("<div>").addClass("notification-box");
            let $title = $("<div>").addClass("title").text(title);
            $box.append($title);
            let $container = $("<div>").addClass("content-container");
            let $content = $("<span>").addClass("content").text(content);
            $container.append($content);
            let values = barValues(setting.bars);
            for (let i = 0; i < values.length; i++) {
                let $progress = $("<div>").addClass("progress");
                let progressValue = `${values[i]}%`;
                let $bar = $("<div>").addClass("bar")
                    .css("width", progressValue)
                    .text(progressValue);
                $progress.append($bar);
                $container.append($progress);
            }
            $box.append($container);
            return $box;
        }

        function barValues(bars) {
            let values = [];
            if (!Array.isArray(bars)) return values;
            for (let i = 0; i < bars.length; i++) {
                if (typeof bars[i] === "number")
                    values.push(bars[i]);
            }
            return values;
        }

        return $box;
    },
    setContent: function ($box, content) {
        if ($box.length === 0) return;
        $box.find(".content").text(content);
    },
    setTitle: function ($box, title) {
        if ($box.length === 0) return;
        $box.find(".title").text(title);
    },
    /**
     * 设置进度条的进度
     * @param {jQuery} $box 要设置的提示框
     * @param {number[]} values 进度值
     */
    setProgress: function ($box, values) {
        if ($box.length === 0) return;
        if (!Array.isArray(values))
            return;
        let j = 0;
        for (let i = 0; i < values.length; i++) {
            if (typeof values[i] === "number") {
                $box.find(`.content-container .progress:eq(${j}) .bar`)
                    .css("width", `${values[i]}%`)
                    .text(`${values[i]}%`);
                j++;
            }
        }
    },
    /**
     * 关闭通知狂
     * @param {jQuery} $box 要关闭的提示框
     * */
    close: function ($box) {
        if ($box.length === 0) return;
        $box.fadeOut("fast", function () {
            $box.remove();
        });
    },
    closeAll: function () {
        $(".notification-box").fadeOut("fast", function () {
            $(".notification-box").remove();
        });
    },
    test: function () {
        let $box = notification.show(
            {
                title: "这是标题呀",
                content: "内容",
                bars: [0]
            }
        );
        setTimeout(progress, 100);
        let progressValue = 0;

        function progress() {
            if (progressValue >= 100) {
                notification.setContent($box, "加载完毕，即将关闭！");
                notification.close($box);
                return;
            }
            progressValue++;
            notification.setContent($box, "新内容呀\n" + progressValue);
            notification.setProgress($box, [progressValue]);
            setTimeout(progress, 100);
        }
    }
};

/**
 * 控制台输出成功信息
 * @param {string} message 输出消息
 */
function outPutSuccess(message) {
    console.log(`%c Success %c [${moment().format('YYYY-MM-DD HH:mm:ss')}]  %c ${message}`,
        'color: #bb0662; background: #030307; padding:5px 0;',
        'color: #fadfa3; background: #393d49; padding:5px 0',
        'font-weight:bold; color: black; background: #77f2e1; padding:5px 0;');
}

function outPutInfo(message) {
    console.log(`%c Info %c [${moment().format('YYYY-MM-DD HH:mm:ss')}]  %c ${message}`,
        'color: #bb0662; background: #030307; padding:5px 0;',
        'color: #fadfa3; background: #393d49; padding:5px 0',
        'font-weight:bold; color: black; background: #fadfa3; padding:5px 0;');
}

function outPutError(message) {
    console.log(`%c Error %c [${moment().format('YYYY-MM-DD HH:mm:ss')}]  %c ${message}`,
        'color: #bb0662; background: #030307; padding:5px 0;',
        'color: #fadfa3; background: #393d49; padding:5px 0',
        'font-weight:bold; color: black; background: red; padding:5px 0;');
}

/**
 * ajax 请求错误处理
 * @param {jqXHR} xhr
 * @param {string} textStatus
 * @param {any} errorThrown
 * */
function ajaxFail(xhr, textStatus, errorThrown) {
    console.log(xhr);
    console.log(textStatus);
    console.log(errorThrown);
    if (xhr.hasOwnProperty("responseJSON")
        && xhr["responseJSON"].hasOwnProperty("success")
        && xhr["responseJSON"].hasOwnProperty("msg")
        && xhr["responseJSON"]["success"] === false) {
        layer.alert(xhr["responseJSON"].msg);
    } else {
        layer.msg(`error:${xhr.status}`)
    }
}

async function initVideoPlayer() {
    const playerId = "video-player";
    const mPlayerId = "m-video-player";
    const player = document.getElementById(playerId) || document.getElementById(mPlayerId);
    if (player != null) {
        player.style.marginBottom = "15px";
        let response = await fetch(`${dpzOption.webApiBaseAddress}/api/Video`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors'
        });
        let data = await response.json();
        let index = Math.floor(Math.random() * data.length);
        new DPlayer({
            container: document.getElementById(player.id),
            danmaku: {
                api: "/history/chat/",
                id: data[index]["id"],
                maximum: 2000,
                token: "tokendemo",
                user: "阿胖",
                bottom: "15%"
            },
            video: {
                url: data[index]["m3u8"],
                type: 'hls',
            },
        });
    }
}

async function initFetchContent() {
    let fetchContents = document.querySelectorAll("[data-request]");
    for (let item of fetchContents) {
        let response = await fetch(item.dataset.request, {
            method: 'GET'
        });
        response.text().then(x => {
            item.innerHTML = x;
            $("time.timeago").relativeTime();
            lightCode();
        });
    }
}

// function initFetchContent(){
//     let $contents = $("[data-request]");
//     $contents.each(function(){
//         let $that = $(this);
//         $.ajax({
//             url:$(this).data("request"),
//             type:"get"
//         }).done(function(result){
//             $that.html(result);
//             $("time.timeago").relativeTime();
//             lightCode();
//         });
//     });
// }


