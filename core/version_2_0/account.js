"use strict";

layui.use(["table", "form", "upload", "layer", "element"], function () {
    let table = layui.table,
        layer = layui.layer,
        form = layui.form,
        upload = layui.upload,
        element = layui.element;
    table.init("myArticle-list", {
        toolbar: "default"
    });
    table.init("myTalk-list", {
        toolbar: "default"
    });
    table.init("myTimeline-list", {
        toolbar: "default"
    });

    //账号相关操作
    form.on("submit(account-info)", function (data) {
        let index = layer.load(1), $form = $(data.form);
        $.ajax({
            url: $form.attr("action"),
            type: $form.attr("method"),
            data: data.field
        }).done(function (result) {
            if (!result.success) {
                layer.msg(result.msg, {icon: 2, anim: 6});
                return;
            }
            layer.msg("个人信息更新成功！");
        }).fail(function (data) {
            if (data && data.responseJSON && data.responseJSON.success === false) {
                layer.alert(data.responseJSON.msg);
            }
        }).always(function () {
            layer.close(index);
        });
        return false;
    });
    form.on("submit(account-pass)", function (data) {
        let index = layer.load(1), $form = $(data.form);
        $.ajax({
            url: $form.attr("action"),
            type: $form.attr("method"),
            data: data.field
        }).done(function (result) {
            if (!result.success) {
                layer.msg(result.msg, {icon: 2, anim: 6});
                return;
            }
            data.form.reset();
            layer.msg("密码修改成功！");
        }).fail(function (data) {
            if (data && data.responseJSON && data.responseJSON.success === false) {
                layer.alert(data.responseJSON.msg);
            }
        }).always(function () {
            layer.close(index);
        });
        return false;
    });
    form.on("submit(account-net-easy)", function (data) {
        let index = layer.load(1), $form = $(data.form);
        $.ajax({
            url: $form.attr("action"),
            type: $form.attr("method"),
            data: data.field
        }).done(function (result) {
            if (!result.success) {
                layer.msg(result.msg, {icon: 2, anim: 6});
                return;
            }
            data.form.reset();
            layer.msg("已发送请求");
        }).fail(function (data) {
            if (data && data.responseJSON && data.responseJSON.success === false) {
                layer.alert(data.responseJSON.msg);
            }
        }).always(function () {
            layer.close(index);
        });
        return false;
    });

    form.on("submit(account-unbind)", function (data) {
        let index = layer.load(1), $form = $(data.form);
        $.ajax({
            url: $form.attr("action"),
            type: $form.attr("method"),
            data: data.field
        }).done(function (result) {
            if (!result.success) {
                layer.msg(result.msg, {icon: 2, anim: 6});
                return;
            }
            data.form.reset();
            layer.msg("已成功解绑");
        }).fail(function (data) {
            if (data && data.responseJSON && data.responseJSON.success === false) {
                layer.alert(data.responseJSON.msg);
            }
        }).always(function () {
            layer.close(index);
        });
        return false;
    });

    upload.render({
        elem: '#account-avatar',
        url: '/account/updateAvatar',
        accept: "images",
        acceptMime: "image/*",
        field: "avatar",
        done: function (res) {
            if (!res.success) {
                layer.msg(res.msg);
                return;
            }
            $("#img-account-avatar").attr("src", res.data);
            layer.msg("头像更新成功！");
        },
        error: function (res) {
            console.log(res);
        }
    });


    // 预览
    $(document).delegate(".preview[data-preview]", "click", function () {
        let url = $(this).data("preview");
        layer.open({
            type: 2,
            title: '预览内容',
            shadeClose: true,
            shade: [0.8, '#393D49'],
            maxmin: false, //开启最大化最小化按钮
            area: ['90%', '80%'],
            content: url
        });
    });


    //我的文章列表
    let myArticleListDom = document.querySelector('#my-article-list');
    if (myArticleListDom != null) {
        myArticleListDom.GM({
            gridManagerName: 'article-list',
            ajaxHeaders: {'X-Requested-With': 'XMLHttpRequest'},
            ajaxData: '/account/MyArticle',
            ajaxType: 'get',
            height: '100%',
            supportAjaxPage: true,
            supportCheckbox: false,
            cellHover: function (row, _, collIndex) {
                if (collIndex === 2) {
                    return {text: row["title"]}
                }
            },
            columnData: [
                {
                    key: "id",
                    text: "id",
                    isShow: false
                },
                {
                    key: 'title',
                    text: '标题',
                    template: function (cell, row) {
                        return `<a href="/article/read/${row.id}" target="_blank">${row["title"]}</a>`
                    }
                }, {
                    key: "preview",
                    text: "预览",
                    template: function (cell, row) {
                        return `<a href="javascript:;" class="preview" data-preview="/article/preview/${row.id}">预览</a>`;
                    }
                }, {
                    key: 'commentCount',
                    text: '回复量'
                }, {
                    key: 'viewCount',
                    text: '查看量'
                }, {
                    key: 'tags',
                    text: '标签'
                }, {
                    key: 'lastUpdateTime',
                    text: '最后修改时间',
                    template: function (cell, row) {
                        return dayjs(row["lastUpdateTime"]).format("YYYY-MM-DD HH:mm:ss");
                    }
                }, {
                    key: 'action',
                    text: '操作',
                    width: "118",
                    template: function (cell, row, index, key) {
                        return `<a href="javascript:;" style="margin-right: 5px" data-article-edit="${row.id}">修改</a> <a href="javascript:;" data-article-del="${row.id}">删除</a>`;
                    }
                }
            ]
        });

        function openPublish(id) {
            let iframe;
            let addIndex = layer.open({
                type: 2,
                title: "发布文章",
                shadeClose: true,
                shade: [0.8, '#393D49'],
                maxmin: false,
                area: ["90%", "80%"],
                content: `/article/publish/${(id === undefined ? "" : id)}`,
                success: function (layero) {
                    iframe = window[layero.find('iframe')[0]['name']];
                },
                end: function () {
                    if (iframe.closeOrSuccess === 1) {
                        articleReload();
                    }
                }
            });
            layer.iframeAuto(addIndex);
        }

        function articleReload() {
            GridManager.refreshGrid("article-list");
        }

        $(document).delegate("[lay-filter=search-article]", "click", function () {
            GridManager.setQuery('article-list', {
                title: $("#txtArticleTitle").val(),
                tag: $("#articleTag").val()
            });
        });
        $(document).delegate("[lay-filter=publish-article]", "click", function () {
            openPublish();
        });
        $(document).delegate("[data-article-edit]", "click", function () {
            let id = $(this).data("articleEdit");
            openPublish(id);
        });
        $(document).delegate("[data-article-del]", "click", function () {
            let id = $(this).data("articleDel");
            layer.confirm("删除后不可恢复，确定删除吗？", {icon: 3, title: "提示"}, function (confirmIndex) {
                layer.close(confirmIndex);
                let index = layer.load(1);
                $.ajax({
                    url: "/article/delete",
                    type: "post",
                    data: {id: id}
                }).done(function (result) {
                    if (!result.success) {
                        layer.msg(result.msg);
                        return;
                    }
                    articleReload();
                }).always(function () {
                    layer.close(index);
                });

            });

        });
    }

    //碎碎念
    let myTalkListDom = document.querySelector("#my-talk-list");
    if (myTalkListDom != null) {
        myTalkListDom.GM({
            gridManagerName: 'my-talk-list',
            ajaxHeaders: {'X-Requested-With': 'XMLHttpRequest'},
            ajaxData: '/account/MyTalk',
            ajaxType: 'get',
            height: '100%',
            supportAjaxPage: true,
            supportCheckbox: false,
            fullColumn: {
                useFold: true,
                fixed: "left",
                bottomTemplate: function (row) {
                    let light = Prism.highlight(row["markdown"], Prism.languages.markdown, 'markdown');
                    return `<pre style="padding: 5px; max-height: 600px;overflow-y: auto;width: 100%;margin-bottom: 15px;white-space: pre-wrap;font-weight: bold">${light}</>`;
                    //return row["markdown"];
                }
            },
            columnData: [
                {
                    key: "id",
                    text: "id",
                    isShow: false
                },
                {
                    key: 'markdown',
                    text: 'Markdown',
                    template: function (cell, row) {
                        return $("<p>").text(row["markdown"]).html();
                    }
                }, {
                    key: "htmlContent",
                    text: "HTML预览",
                    template: function (cell, row) {
                        return `<a href="javascript:;" class="preview" data-preview="/talk/preview/${row.id}">预览</a>`;
                    }
                }, {
                    key: 'like',
                    text: '点赞数'
                }, {
                    key: 'commentCount',
                    text: '回复量'
                }, {
                    key: 'createTime',
                    text: '创建时间',
                    template: function (cell, row) {
                        return dayjs(row["createTime"]).format("YYYY-MM-DD HH:mm:ss");
                    }
                }, {
                    key: 'lastUpdateTime',
                    text: '最后修改时间',
                    template: function (cell, row) {
                        return dayjs(row["lastUpdateTime"]).format("YYYY-MM-DD HH:mm:ss");
                    }
                }, {
                    key: 'action',
                    text: '操作',
                    width: '100px',
                    fixed: "right",
                    template: function (cell, row, index, key) {
                        return `<a href="javascript:;" style="margin-right: 5px" data-talk-edit="${row.id}">修改</a> <a href="javascript:;" data-talk-del="${row.id}">删除</a>`;
                    }
                }
            ]
        });

        function openTalk(id) {
            let iframe;
            let addIndex = layer.open({
                type: 2,
                title: "发布碎碎念",
                shadeClose: true,
                shade: [0.8, '#393D49'],
                maxmin: false,
                area: ["90%", "80%"],
                content: `/talk/publish/${(id === undefined ? "" : id)}`,
                success: function (layero) {
                    iframe = window[layero.find('iframe')[0]['name']];
                },
                end: function () {
                    if (iframe.closeOrSuccess === 1) {
                        talkReload();
                    }
                }
            });
            layer.iframeAuto(addIndex);
        }

        $(document).delegate("[lay-filter=publish-talk]", "click", function () {
            openTalk();
        });

        $(document).delegate("[data-talk-edit]", "click", function () {
            let id = $(this).data("talkEdit");
            openTalk(id);
        });
        $(document).delegate("[data-talk-del]", "click", function () {
            let id = $(this).data("talkDel");
            layer.confirm("删除后不可恢复，确定删除吗？", {icon: 3, title: "提示"}, function (confirmIndex) {
                layer.close(confirmIndex);
                let index = layer.load(1);
                $.ajax({
                    url: "/talk/delete",
                    type: "post",
                    data: {id: id}
                }).done(function (result) {
                    if (!result.success) {
                        layer.msg(result.msg);
                        return;
                    }
                    talkReload();
                }).fail(function (data) {
                    if (data && data.responseJSON && data.responseJSON.success === false) {
                        layer.alert(data.responseJSON.msg);
                    }
                }).always(function () {
                    layer.close(index);
                });

            });

        });

        $(document).delegate("[lay-filter=search-talk]", "click", function () {
            GridManager.setQuery('my-talk-list', {
                content: $("#txtTalkContent").val()
            });
        });

        function talkReload() {
            GridManager.refreshGrid("my-talk-list");
        }
    }

    //碎碎念回复
    let tbTalkComment = document.querySelector("#my-talk-comment-list");
    if (tbTalkComment != null) {
        let talkId = $("#talkId").val();
        tbTalkComment.GM({
            gridManagerName: 'talk-comment-list',
            ajaxHeaders: {'X-Requested-With': 'XMLHttpRequest'},
            ajaxData: `/account/talkComments/${talkId}`,
            ajaxType: 'get',
            height: '100%',
            supportCheckbox: false,
            supportAjaxPage: true,
            cellHover: function (row, _, collIndex) {
                if (collIndex === 2) {
                    return {text: row["content"]}
                }
            },
            columnData: [
                {
                    key: "id",
                    text: "id",
                    isShow: false
                }, {
                    key: 'content',
                    text: '回复内容'
                }, {
                    key: 'userName',
                    text: '回复人',
                    template: function (cell, row) {
                        return row.nickName || row.commenter.name;
                    }
                }, {
                    key: 'commentTime',
                    text: '回复时间',
                    template: function (cell, row) {
                        return dayjs(row["commentTime"]).format("YYYY-MM-DD HH:mm:ss");
                    }
                }, {
                    key: 'action',
                    text: '操作',
                    template: function (cell, row, index, key) {
                        return ` <a href="javascript:;" data-talk-comment-del="${row.id}">删除</a>`;
                    }
                }
            ]
        });
        $(document).delegate("[data-talk-comment-del]", "click", function () {
            let id = $(this).data("talkCommentDel");
            layer.confirm("删除后不可恢复，确定删除吗？", {icon: 3, title: "提示"}, function (confirmIndex) {
                layer.close(confirmIndex);
                let index = layer.load(1);
                $.ajax({
                    url: "/account/deleteComment",
                    type: "post",
                    data: {talkId: talkId, commentId: id}
                }).done(function (result) {
                    if (!result.success) {
                        layer.msg(result.msg);
                        return;
                    }
                    commentsReload();
                }).fail(function (data) {
                    if (data && data.responseJSON && data.responseJSON.success === false) {
                        layer.alert(data.responseJSON.msg);
                    }
                }).always(function () {
                    layer.close(index);
                });
            });
        });

        function commentsReload() {
            GridManager.refreshGrid("talk-comment-list");
        }
    }

    //曲库列表
    let tbMusicLibrary = document.querySelector('#tb-music-library');
    if (tbMusicLibrary != null) {
        const tableName = "music-library";
        tbMusicLibrary.GM({
            gridManagerName: tableName,
            ajaxHeaders: {'X-Requested-With': 'XMLHttpRequest'},
            ajaxData: '/account/musicLibrary',
            ajaxType: 'get',
            height: '100%',
            supportAjaxPage: true,
            cellHover: function (row, _, collIndex) {
                switch (collIndex) {
                    case 3:
                        return {text: row["title"]};
                    case 4:
                        return {text: row["artist"]};
                    case 5:
                        return {text: row["fileName"]}
                    case 6:
                        return {text: row["from"]}
                    case 7:
                        let size = (row["musicLength"] / 1024 / 1024).toFixed(2) + "MB";
                        return {text: size};
                    case 9:
                        return {text: row.duration};
                }
            },
            rowRenderHandler: function (row, index) {
                //Todo 默认选择我喜欢的歌曲
                //row.gm_checkbox = index % 2 === 0;
                return row;
            },
            columnData: [
                {
                    key: "id",
                    text: "id",
                    isShow: false
                }, {
                    key: 'title',
                    text: '歌曲名'
                }, {
                    key: 'artist',
                    text: '歌手'
                }, {
                    key: 'fileName',
                    text: '文件名'
                }, {
                    key: 'from',
                    text: '来源'
                }, {
                    key: 'musicLength',
                    text: '大小',
                    template: function (cell, row) {
                        return (row["musicLength"] / 1024 / 1024).toFixed(2) + "MB";
                    }
                }, {
                    key: 'lyricUrl',
                    text: '歌词',
                    template: function (cell, row) {
                        return row["lyricUrl"] == null ? '<span style="color:red">没有歌词</span>' : '<span style="color:green">有歌词</span>'
                    }
                }, {
                    key: 'duration',
                    text: '时长'
                }, {
                    key: 'action',
                    text: '操作',
                    width: "118",
                    template: function (cell, row, index, key) {
                        let action = `<a href="javascript:;" data-music-del="${row.id}">删除</a>`
                        if (row["from"] === "网易云音乐") {
                            action += ` <a href="javascript:;" data-music-save="${row.id}">保存</a>`;
                        }
                        return action;
                    }
                }
            ]
        });

        $(document).delegate("[data-music-del]", "click", function () {
            let id = $(this).data("musicDel");
            layer.confirm("删除后不可恢复，确定删除吗？", {icon: 3, title: "提示"}, function (confirmIndex) {
                layer.close(confirmIndex);
                let index = layer.load(1);
                $.ajax({
                    url: "/music/delete",
                    type: "post",
                    data: {id: id}
                }).done(function (result) {
                    if (!result.success) {
                        layer.msg(result.msg);
                        return;
                    }
                    GridManager.refreshGrid(tableName);
                }).fail(function (data) {
                    if (data && data.responseJSON && data.responseJSON.success === false) {
                        layer.alert(data.responseJSON.msg);
                    }
                }).always(function () {
                    layer.close(index);
                });
            });
        });

        $(document).delegate("[data-music-save]", "click", function () {
            let id = $(this).data("musicSave");
            layer.confirm("确定永久储存？储存后可以手动删除。", {icon: 3, title: "提示"}, function (confirmIndex) {
                layer.close(confirmIndex);
                let index = layer.load(1);
                $.ajax({
                    url: "/music/RecommendToDb",
                    type: "post",
                    data: {id: id}
                }).done(function (result) {
                    if (!result.success) {
                        layer.msg(result.msg);
                        return;
                    }
                    GridManager.refreshGrid(tableName);
                }).fail(function (data) {
                    if (data && data.responseJSON && data.responseJSON.success === false) {
                        layer.alert(data.responseJSON.msg);
                    }
                }).always(function () {
                    layer.close(index);
                });
            });
        });

        $(document).delegate("[lay-filter=search-music-library]", "click", function () {
            GridManager.setQuery(tableName, {
                title: $("#txtMusicTitle").val()
            });
        });
    }

    // 时间轴
    let tbTimeline = document.querySelector("#my-timeline-list");
    if (tbTimeline != null) {
        tbTimeline.GM({
            gridManagerName: 'timeline-list',
            ajaxHeaders: {'X-Requested-With': 'XMLHttpRequest'},
            ajaxData: '/account/MyTimeline',
            ajaxType: 'get',
            height: '100%',
            supportAjaxPage: true,
            supportCheckbox: false,
            fullColumn: {
                useFold: true,
                fixed: "left",
                bottomTemplate: function (row) {
                    if (row["content"] === null) return "";
                    let light = Prism.highlight(row["content"], Prism.languages.markdown, 'markdown');
                    return `<pre style="padding: 5px; max-height: 600px;overflow-y: auto;width: 100%;margin-bottom: 15px;white-space: pre-wrap;font-weight: bold">${light}</pre>`;
                }
            },
            cellHover: function (row, _, collIndex) {
                if (collIndex === 3) {
                    return {text: row["title"]}
                }
                    // else if (collIndex === 4) {
                    //     return {text: row["content"]}
                // } 
                else if (collIndex === 6) {
                    return {text: row["more"]}
                }
            },
            columnData: [
                {
                    key: "id",
                    text: "id",
                    isShow: false
                },
                {
                    key: 'title',
                    text: '标题'
                }, {
                    key: 'content',
                    text: '内容',
                    template: function (cell, row) {
                        return $("<p>").text(row["content"]).html();
                    }
                }, {
                    key: 'date',
                    text: '日期',
                    template: function (cell, row) {
                        return dayjs(row["date"]).format("YYYY-MM-DD");
                    }
                }, {
                    key: 'more',
                    text: '更多链接'
                }, {
                    key: 'createTime',
                    text: '创建时间',
                    template: function (cell, row) {
                        return dayjs(row["createTime"]).format("YYYY-MM-DD HH:mm:ss");
                    }
                }, {
                    key: 'lastUpdateTime',
                    text: '最后修改时间',
                    template: function (cell, row) {
                        return dayjs(row["lastUpdateTime"]).format("YYYY-MM-DD HH:mm:ss");
                    }
                }, {
                    key: 'action',
                    text: '操作',
                    template: function (cell, row, index, key) {
                        return `<a href="javascript:;" style="margin-right: 5px" data-timeline-edit="${row.id}">修改</a> <a href="javascript:;" data-timeline-del="${row.id}">删除</a>`;
                    }
                }
            ]
        });

        function openTimeline(id) {
            let iframe;
            let addIndex = layer.open({
                type: 2,
                title: "发布时间轴",
                shadeClose: true,
                shade: [0.8, '#393D49'],
                maxmin: false,
                //area: ["780px", "530px"],
                area: ["90%", "80%"],
                content: `/timeline/publish/${(id === undefined ? "" : id)}`,
                success: function (layero) {
                    iframe = window[layero.find('iframe')[0]['name']];
                },
                end: function () {
                    if (iframe.closeOrSuccess === 1) {
                        timelineReload();
                    }
                }
            });
            layer.iframeAuto(addIndex);
        }

        function timelineReload() {
            GridManager.refreshGrid("timeline-list");
        }

        $(document).delegate("[lay-filter=add-timeline]", "click", function () {
            openTimeline();
        });

        $(document).delegate("[lay-filter=search-timeline]", "click", function () {
            GridManager.setQuery('timeline-list', {
                content: $("#txtTimelineContent").val()
            });
        });

        $(document).delegate("[data-timeline-edit]", "click", function () {
            let id = $(this).data("timelineEdit");
            openTimeline(id);
        });
        $(document).delegate("[data-timeline-del]", "click", function () {
            let id = $(this).data("timelineDel");
            layer.confirm("删除后不可恢复，确定删除吗？", {icon: 3, title: "提示"}, function (confirmIndex) {
                layer.close(confirmIndex);
                let index = layer.load(1);
                $.ajax({
                    url: "/timeline/delete",
                    type: "post",
                    data: {id: id}
                }).done(function (result) {
                    if (!result.success) {
                        layer.msg(result.msg);
                        return;
                    }
                    timelineReload();
                }).fail(function (data) {
                    if (data && data.responseJSON && data.responseJSON.success === false) {
                        layer.alert(data.responseJSON.msg);
                    }
                }).always(function () {
                    layer.close(index);
                });

            });

        });
    }
});
