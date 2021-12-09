layui.use(["element", "layer", "upload"], function () {
    let element = layui.element,
        layer = layui.layer,
        upload = layui.upload;

    $("#upload-progress").hide();

    upload.render({
        elem: '#Music', auto: false, field: "Music", accept: "audio",exts:"mp3|flac"
    });

    upload.render({
        elem: '#Lyrics', auto: false, field: "Lyrics", exts: "lrc"
    });

    $("#musicForm").on("submit", function () {
        $("#upload-progress").show();
        let index = layer.load();
        let formData = new FormData(this);
        $.ajax({
            url: $(this).attr("action"),
            type: "post",
            cache: false,
            contentType: false,
            processData: false,
            data: formData,
            xhr: function () {
                let xhr = $.ajaxSettings.xhr();
                if (xhr.upload) {
                    xhr.upload.addEventListener('progress', uploadProgress, false);
                }
                return xhr;
            },
        }).done(function (result) {
            if (result.success) {
                layer.confirm('处理完成，继续上传还是返回列表？', {icon: 1, title: '提示', btn: ['继续上传', '返回列表']},
                    function () {
                        location.reload();
                    },
                    function () {
                        location.href = "/manage/music"
                    });
            } else {
                layer.alert(result.msg);
            }
        }).always(function () {
            layer.close(index);
            element.progress('music-progress', '0%');
        }).fail(function (data) {
            if (data && data.responseJSON && data.responseJSON.success === false) {
                layer.alert(data.responseJSON.msg);
            }
        });
        return false;
    });


    function uploadProgress(evt) {
        console.log(evt);
        if (evt.lengthComputable) {
            let percentComplete = Math.round(evt.loaded * 100 / evt.total);
            element.progress('music-progress', percentComplete + '%');
            if (percentComplete >= 100) {
                layer.msg("上传完成，正在处理文件！");
            }
        } else {
            layer.msg("无法计算进度");
        }
    }
});
