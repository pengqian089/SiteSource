let dpzOption = {
    /**
     * webapi地址
     */
    webApiBaseAddress: document.head.querySelector("meta[name=web-api-base-address]").content,
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
            css: {bottom: 55},
            click: function (type) {
                //console.log(type);
                if (type === "bar1") {
                    let index = layer.load();
                    $.ajax({url: "/Home/TodayWallpaper"})
                        .done(function (result) {
                            let items = [];
                            for (let item of result) {
                                items.push({
                                    src: item["url"],
                                    w: 1920,
                                    h: 1080,
                                    title: item["copyRight"]
                                });
                            }
                            let options = {
                                index: 0,
                                //mouseUsed: true,
                                history: false
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
        //樱花
        // let sakura = new Sakura('body', {
        //     colors: [
        //         {
        //             gradientColorStart: 'rgba(255, 183, 197, 0.9)',
        //             gradientColorEnd: 'rgba(255, 197, 208, 0.9)',
        //             gradientColorDegree: 120,
        //         },
        //         {
        //             gradientColorStart: 'rgba(255,189,189)',
        //             gradientColorEnd: 'rgba(227,170,181)',
        //             gradientColorDegree: 120,
        //         },
        //         {
        //             gradientColorStart: 'rgba(212,152,163)',
        //             gradientColorEnd: 'rgba(242,185,196)',
        //             gradientColorDegree: 120,
        //         },
        //     ]
        // });

        //雨滴背景
        try {
            const canvas = document.querySelector("#can-back-round");
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            
            const raindropFx = new RaindropFX({
                canvas: canvas,
                background: 
                    dpzOption.isDark 
                        ? 
                        "https://cdn.jsdelivr.net/gh/pengqian089/SiteSource@latest/images/core-backg-dark.jpeg" 
                        : 
                        "https://cdn.jsdelivr.net/gh/Tokisaki-Galaxy/res/site/medias/background.jpg",
            });

            window.onresize = () => {
                const rect = canvas.getBoundingClientRect();
                raindropFx.resize(rect.width, rect.height);
            }
            raindropFx.start();
        } catch {

        }
        
        // $.ajax({url: "/Home/Wallpaper"}).done(function (result) {
        //     console.log("bing wallpaper loaded success.")
        //    
        //
        // });

        $.ajax({url: "/account/GetUserInfo"})
            .done(function (result) {
                if (result.success) {
                    $(".blog-user")
                        .attr("href", "/account")
                        .find("img")
                        .attr({"src": `${result.data.avatar}?width=40&height=40`, "title": result.data.name});
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
            var sear = new RegExp("layui-hide");
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
        $(document).on("pjax:complete", function (event, xhr) {
            document.title = Base64.decode(xhr.getResponseHeader("title"));
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
                data: {id: that.data("likeid")},
                type: "post"
            }).done(function (result) {
                if (result.success) {
                    that.find("[data-number]").text(result.data);
                } else {
                    layer.msg(result.msg, {icon: 2, anim: 6});
                }
            }).always(function () {
                layer.close(index);
            });
        });

        //碎碎念回复
        $(document).delegate("[data-comment-id]", "click", function () {
            let that = $(this);
            let comments = that.parents("div.comment-parent").find("div.comments[data-talk-id]");
            if (comments.find("form").length > 0) {
                comments.hide(100, function () {
                    comments.html("");
                });
                return;
            }
            $("div.comment-parent div.comments[data-talk-id] div.comment-container").hide(function () {
                $(this).html("");
            });
            let index = layer.load(1);
            $.ajax({
                url: "/Talk/GetComments",
                data: {id: that.data("commentId")},
                type: "get"
            }).done(function (result, status, xhr) {
                that.find("[data-comment-count]").text(xhr.getResponseHeader("itemCount"));
                comments.html(result);
                registerHljsCode();
                comments.show();
            }).always(function () {
                layer.close(index);
            });
        });

        //碎碎念提交评论
        $(document).delegate("button[data-btn-comment]", "click", function (e) {
            let form = $(this).parents("form")[0];
            let data = new FormData(form);
            let that = $(this);
            if ($("#loginStatus").val() === "no-login") {
                showCaptcha(that.data("scene"), function (result) {
                    data.append("ticket", result.ticket);
                    data.append("randstr", result.randstr);
                    data.append("scene", result.bizState);
                    submitComment();
                });
                return;
            }
            submitComment();

            function submitComment() {
                let index = layer.load(1);
                let talkId = that.data("btnComment");
                $.ajax({
                    processData: false,
                    contentType: false,
                    url: form.getAttribute("action"),
                    data: data,
                    type: form.getAttribute("method")
                }).done(function (result) {
                    if (!result.success) {
                        layer.msg(result.msg, {icon: 2, anim: 6});
                    } else {
                        let i = layer.load(1);
                        $.ajax({
                            url: "/Talk/GetComments",
                            data: {id: talkId},
                            type: "get"
                        }).done(function (res, status, xhr) {
                            $(`[data-comment-id=${talkId}]`).find("[data-comment-count]").text(xhr.getResponseHeader("itemCount"));
                            that.parents(".comment-parent").find(".comments[data-talk-id]").html(res);
                        }).always(function () {
                            layer.close(i);
                        });
                    }
                }).always(function () {
                    layer.close(index);
                });
            }

        });

        $(document).delegate("#comment-pager a[href]",
            "click",
            function (e) {
                e.preventDefault();
                let that = $(this);
                let url = $(this).attr("href");
                let i = layer.load(1);
                $.ajax({
                    url: url,
                    type: "get"
                }).done(function (res) {
                    that.parents(".comment-parent").find(".comments[data-talk-id]").html(res);
                    registerHljsCode();
                }).always(function () {
                    layer.close(i);
                });
            });

        //图片查看
        $(document).delegate(".article.shadow .article-left img,#talk-list>ul>li .content-detail .content img,.article-detail-content img", "click", function () {
            let index = layer.load(1);
            let images = $(".article.shadow .article-left img,#talk-list>ul>li .content-detail .content img,.article-detail-content img");
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
                let options = {
                    index: images.index(this),
                    mouseUsed: true,
                    history: false
                };
                let gallery = new PhotoSwipe(document.getElementById("gallery"), PhotoSwipeUI_Default, items, options);
                gallery.init();
            }).finally(() => layer.close(index));
        });


        //文章评论
        $(document).delegate("form.layui-form[data-load-page]", "submit", function (e) {
            e.preventDefault();
            let formData = new FormData(this);
            let loadPage = $(this).data("loadPage");
            let that = $(this);
            if ($(this).data("login") === "no-login") {
                showCaptcha(that.data("scene"), function (result) {
                    formData.append("ticket", result.ticket);
                    formData.append("randstr", result.randstr);
                    formData.append("scene", result.bizState);
                    articleComment();
                });
                return;
            }

            articleComment();

            function articleComment() {
                let index = layer.load(1);
                $.ajax({
                    url: "/article/comment",
                    processData: false,
                    contentType: false,
                    data: formData,
                    type: "post"
                }).done(function (result) {
                    if (!result.success) {
                        layer.msg(result.msg, {icon: 2, anim: 6});
                    } else {
                        $("textarea").val("");
                        $.pjax({url: loadPage, container: '#blog-comment', scrollTo: false});
                    }
                }).always(function () {
                    layer.close(index);
                });
            }
        });

        //查看更多
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
                    data: {id: id},
                    type: "post"
                }).done(function (result) {
                    if (!result.success) {
                        layer.msg(result.msg, {icon: 2, anim: 6});
                    } else {
                        $.pjax({url: location.pathname, container: '.blog-main-left', scrollTo: true});
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
                    data: {id: id},
                    type: "post"
                }).done(function (result) {
                    if (!result.success) {
                        layer.msg(result.msg, {icon: 2, anim: 6});
                    } else {
                        $.pjax({url: location.pathname, container: '.blog-body', scrollTo: true});
                    }
                }).always(function () {
                    layer.close(loadIndex);
                }).fail(ajaxFail);
            });
        });

        if (window.scrollY > 0) {
            $(".blog-nav").css({"background-color": "rgba(57,61,73,.5)", "backdrop-filter": "blur(100px)"});
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
                data: {id: topicId, pageIndex: startPage, pageSize: commentSize, sort: sort},
                type: "get"
            }).done(function (result) {
                //console.log(`current page index:${startPage},last page index:${totalPage}`);
                startPage++;
                let $nextResult = $(result);
                $("#topic-comments").append($nextResult);
                $nextResult.find("time.timeago").timeago();
                $nextResult.find("pre code").each(function (index, element) {
                    hljs.highlightElement(element);
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
                    $(".blog-nav").css({"background-color": "rgba(57,61,73,.5)", "backdrop-filter": "blur(100px)"});
                } else if (window.scrollY === 0) {
                    $(".blog-nav").css({"background-color": "rgb(57,61,73)", "backdrop-filter": "none"})
                }
                // 热榜滚动翻页
                if ($topicComments.length === 0 || startPage > totalPage) return;
                if ($window.scrollTop() + $window.height() > $document.height() - 120) {
                    nextPage();
                }

            }, throttleDelay);
        }
    });

$(function () {
    $.pjax.defaults.timeout = 20000;
    $(document).pjax("nav.blog-nav ul.layui-nav>li>a,a[data-pjax]", ".blog-body");
    //文章翻页
    $(document).pjax("#blog-list a,.tags a", ".blog-main-left");
    $(document).pjax("#articl-comment a", "#blog-comment", {scrollTo: false});
    //碎碎念翻页
    $(document).pjax("#talk-pager a", "#talk-list");
    //今日热榜翻页
    $(document).pjax("#topic-list a", ".blog-main-left");
    $(document).pjax(".code-box .box-rows .row .header a", ".code-box .box-rows");
    if ($.support.pjax) {
        $(".tags a").on("click",
            function (event) {
                $(".tags a").removeClass("tag-this");
                $(this).addClass("tag-this");
                let containerSelector = ".blog-main-left";
                $.pjax.click(event, {container: containerSelector});
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

function registerHljsCode() {
    document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block);
    });
}

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

function pjaxCompleteInit() {
    registerHljsCode();
    generateToc();
    $("time.timeago").timeago();
    initVideoPlayer();
}

(function () {

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
        let option = {title: "小喇叭开始广播辣", content: result.markdown};
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

    // setTimeout(function () {
    //     updateRunTime();
    // }, 5000);

    // function updateRunTime() {
    //     connection.invoke("getRunTime");
    // }

    connection.on("ReceiveRunTime", function (msg) {
        let runTime = $("#runTime");
        if (runTime.length > 0) {
            runTime.text("运行时间 " + msg);
            //setTimeout(updateRunTime, 5000);
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

function initVideoPlayer() {
    const playerId = "video-player";
    const mPlayerId = "m-video-player";
    const player = document.getElementById(playerId) || document.getElementById(mPlayerId);
    if (player != null) {
        player.style.marginBottom = "15px";
        $.ajax({
            url: `${dpzOption.webApiBaseAddress}/api/Video`,
            type: "get",
            crossDomain: true,
            headers: {
                "accept": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            xhrFields: {
                "Access-Control-Allow-Origin": "*"
            }
        })
        .done(function (result) {
            let index = Math.floor(Math.random() * result.length);
            if (player.id === playerId) {
                new DPlayer({
                    container: document.getElementById('video-player'),
                    danmaku: {
                        api: "/history/chat/",
                        id: result[index]["id"],
                        maximum: 2000,
                        token: "tokendemo",
                        user: "阿胖",
                        bottom: "15%"
                    },
                    //theme: "#bb0662",
                    video: {
                        url: result[index]["m3u8"],
                        type: 'hls',
                    },
                });
            } else if (player.id === mPlayerId) {
                if (Hls.isSupported()) {
                    let video = document.createElement("video");
                    video.controls = true;
                    video.style.width = "100%";
                    video.style.height = "100%";
                    player.appendChild(video);
                    let hls = new Hls();
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MEDIA_ATTACHED, function () {
                        hls.loadSource(result[index]["m3u8"]);
                    });
                }
            }
        });
    }
}