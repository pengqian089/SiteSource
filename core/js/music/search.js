"use strict";

layui.use(["layer"], function () {
    let layer = layui.layer;
    const name = "music-search-result";
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
    
    if(resultDm != null){
        resultDm.GM({
            gridManagerName: name,
            ajaxHeaders: {'X-Requested-With': 'XMLHttpRequest'},
            ajaxData: '/account/MusicSearch',
            ajaxType: 'get',
            height: '900px',
            sizeData:[30],
            pageSize:30,
            supportAjaxPage: true,
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
                    template:function(cell,row){
                        let duration = formatDuration(row["duration"]);
                        return `${duration.hour.toString().padStart(2, '0')}:${duration.minute.toString().padStart(2, '0')}:${duration.second.toString().padStart(2, '0')}.${duration.millisecond.toString()}`;
                    }
                },  {
                    key: 'action',
                    text: '操作',
                    width: "118",
                    template: function (cell, row, index, key) {
                        return `<a href="javascript:;" style="margin-right: 5px" data-music-download="${Base64.encode(JSON.stringify(row))}" >下载</a>`;
                    }
                }
            ]
        });
    }

    $(document).delegate("[lay-filter=search-music]", "click", function () {
        GridManager.setQuery(name, {
            title: $("#txtMusicName").val()
        });
    });

    $(document).delegate("[data-music-download]","click",function(){
        let json = $(this).data("musicDownload");
        let song = JSON.parse(Base64.decode(json));
        layer.confirm(`确定下载《${song.name}》到服务器吗？`, {icon: 3, title: "提示"}, function (confirmIndex) {
            layer.close(confirmIndex);
            let index = layer.load(1);
            $.ajax({
                url: "/account/DownloadSearch",
                type: "post",
                data: {song: song}
            }).done(function (result) {
                if (!result.success) {
                    layer.msg(result.msg);
                    return;
                }
                layer.alert("下载完成");
            }).always(function () {
                layer.close(index);
            });

        });
    });
});