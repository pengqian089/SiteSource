"use strict";

layui.use(["layer"], function () {
    let layer = layui.layer;
    const name = "music-recommend-result";
    let resultDm = document.getElementById(name);

    const formatDuration = ms => {
        if (ms < 0) ms = -ms;
        return {
            day: Math.floor(ms / 86400000),
            hour: Math.floor(ms / 3600000) % 24,
            minute: Math.floor(ms / 60000) % 60,
            second: Math.floor(ms / 1000) % 60,
            millisecond: Math.floor(ms) % 1000
        };
    };

    if (resultDm != null) {
        resultDm.GM({
            gridManagerName: name,
            ajaxHeaders: {'X-Requested-With': 'XMLHttpRequest'},
            ajaxData: '/account/MusicRecommend',
            ajaxType: 'get',
            height: '900px',
            supportAjaxPage: false,
            supportCheckbox: false,
            cellHover: function (row, _, collIndex) {
                if (collIndex === 2) {
                    return {text: row["name"]}
                }
                if (collIndex === 3) {
                    let ar = [];
                    for (let item of row["artists"]) {
                        ar.push(item["name"]);
                    }
                    return {text: ar.join("、")}
                }
                if (collIndex === 5) {
                    return {text: row["reason"]}
                }
            },
            columnData: [
                {
                    key: "id",
                    text: "id",
                    isShow: false
                },
                {
                    key: 'name',
                    text: '音乐名称'
                }, {
                    key: "artists",
                    text: "歌手",
                    template: function (cell, row) {
                        let ar = [];
                        for (let item of row["artists"]) {
                            ar.push(item["name"]);
                        }
                        return ar.join("、");
                    }
                }, {
                    key: 'duration',
                    text: '时长',
                    template: function (cell, row) {
                        let duration = formatDuration(row["duration"]);
                        return `${duration.hour.toString().padStart(2, '0')}:${duration.minute.toString().padStart(2, '0')}:${duration.second.toString().padStart(2, '0')}.${duration.millisecond.toString()}`;
                    }
                }, {
                    key: 'reason',
                    text: '推荐理由'
                }, {
                    key: 'action',
                    text: '操作',
                    width: "118",
                    template: function (cell, row, index, key) {
                        return `<a href="javascript:;" data-music-del="${row.id}">删除</a>`;
                    }
                }
            ]
        });
    }
    
    $(document).delegate("[data-music-del]","click",function(){
        let id = $(this).data("musicDel");
        layer.confirm("删除后不可恢复，确定删除吗？", {icon: 3, title: "提示"}, function (confirmIndex) {
            layer.close(confirmIndex);
            let index = layer.load(1);
            $.ajax({
                url: "/account/DeleteRecommend",
                type: "post",
                data: {id: id}
            }).done(function (result) {
                if (!result.success) {
                    layer.msg(result.msg);
                    return;
                }
                GridManager.refreshGrid(name);
            }).always(function () {
                layer.close(index);
            });

        });
    });
});